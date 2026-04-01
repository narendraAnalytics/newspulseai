import { eq } from 'drizzle-orm'
import { inngest } from './client'
import { db } from '@/db'
import { users, channels, videos } from '@/db/schema'
import { fetchNewVideos } from '@/lib/youtube'
import { summarizeVideos } from '@/lib/gemini'
import { sendDigest, type DigestItem } from '@/lib/email'

export const dailyDigest = inngest.createFunction(
  {
    id: 'daily-digest',
    name: 'Daily News Digest',
    triggers: [{ cron: '0 6 * * *' }], // 6:00 AM UTC daily
  },
  async ({ step, logger }) => {
    // 1. Fetch all users
    const allUsers = await step.run('fetch-users', () =>
      db.select().from(users)
    )

    logger.info(`Processing digest for ${allUsers.length} user(s)`)

    for (const user of allUsers) {
      await step.run(`process-user-${user.clerkId}`, async () => {
        // 2. Get user's channels
        const userChannels = await db
          .select()
          .from(channels)
          .where(eq(channels.clerkId, user.clerkId))

        if (!userChannels.length) return

        const publishedAfter = new Date(Date.now() - 25 * 60 * 60 * 1000)

        // Collect all newly inserted videos across all channels
        const newlyInserted: {
          id: number
          youtubeVideoId: string
          title: string
          channelName: string
          channelId: number
        }[] = []

        for (const channel of userChannels) {
          // 3. Fetch new videos from YouTube API
          const newVideos = await fetchNewVideos(channel.youtubeChannelId, publishedAfter)

          for (const video of newVideos) {
            // 4. Insert video — skip if already seen (UNIQUE on youtubeVideoId)
            const [inserted] = await db
              .insert(videos)
              .values({
                channelId: channel.id,
                youtubeVideoId: video.youtubeVideoId,
                title: video.title,
                description: video.description,
                publishedAt: video.publishedAt,
              })
              .onConflictDoNothing()
              .returning()

            if (!inserted) continue

            newlyInserted.push({
              id: inserted.id,
              youtubeVideoId: video.youtubeVideoId,
              title: video.title,
              channelName: channel.channelName,
              channelId: channel.id,
            })
          }
        }

        if (!newlyInserted.length) return

        // 5. Multi-video summarization — Gemini watches all videos in batches of 10
        const summaryMap = await summarizeVideos(
          newlyInserted.map((v) => ({
            youtubeVideoId: v.youtubeVideoId,
            title: v.title,
          }))
        )

        // 6. Persist summaries back to DB + build digest items
        const digestItems: DigestItem[] = []

        for (const video of newlyInserted) {
          const summary = summaryMap[video.youtubeVideoId] ?? ''

          await db
            .update(videos)
            .set({ summary })
            .where(eq(videos.id, video.id))

          digestItems.push({
            channelName: video.channelName,
            title: video.title,
            summary,
            url: `https://youtube.com/watch?v=${video.youtubeVideoId}`,
          })
        }

        // 7. Send digest email
        if (user.email) {
          await sendDigest(user.email, user.name || 'there', digestItems)
          logger.info(`Sent digest to ${user.email} with ${digestItems.length} video(s)`)
        }
      })
    }

    return { processed: allUsers.length }
  }
)
