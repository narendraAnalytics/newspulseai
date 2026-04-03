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
    triggers: [{ cron: '30 0 * * *' }], // 12:30 AM UTC = 6:00 AM IST daily
  },
  async ({ step, logger }) => {
    // 1. Fetch all users
    const allUsers = await step.run('fetch-users', () =>
      db.select().from(users)
    )

    logger.info(`[dailyDigest] Cron fired — processing ${allUsers.length} user(s)`)

    for (const user of allUsers) {
      await step.run(`process-user-${user.clerkId}`, async () => {
        // 2. Get user's channels
        const userChannels = await db
          .select()
          .from(channels)
          .where(eq(channels.clerkId, user.clerkId))

        if (!userChannels.length) {
          logger.info(`[dailyDigest] User ${user.email} has no channels — skipping`)
          return
        }

        logger.info(`[dailyDigest] User ${user.email} has ${userChannels.length} channel(s)`)

        // Free plan: only 1 email per calendar month
        const plan = (user.plan ?? 'free') as 'free' | 'plus' | 'pro'
        if (plan === 'free') {
          const now = new Date()
          const lastSent = user.lastEmailSentAt ? new Date(user.lastEmailSentAt) : null
          if (
            lastSent &&
            lastSent.getMonth() === now.getMonth() &&
            lastSent.getFullYear() === now.getFullYear()
          ) {
            logger.info(`[dailyDigest] Free user ${user.email} already received email this month — skipping`)
            return
          }
        }

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
          logger.info(`[dailyDigest] Channel "${channel.channelName}" returned ${newVideos.length} video(s) since ${publishedAfter.toISOString()}`)

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

        if (!newlyInserted.length) {
          logger.info(`[dailyDigest] No new videos for user ${user.email} — no email sent`)
          return
        }

        logger.info(`[dailyDigest] ${newlyInserted.length} new video(s) found for ${user.email} — summarizing`)

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

        // 7. Send digest email (include upgrade CTA for free plan users)
        if (user.email) {
          await sendDigest(user.email, user.name || 'there', digestItems, plan)
          await db.update(users).set({ lastEmailSentAt: new Date() }).where(eq(users.clerkId, user.clerkId))
          logger.info(`[dailyDigest] Sent digest to ${user.email} (${plan} plan) with ${digestItems.length} video(s)`)
        }
      })
    }

    return { processed: allUsers.length }
  }
)
