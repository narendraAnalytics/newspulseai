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

        // 7. Send digest email
        if (user.email) {
          await sendDigest(user.email, user.name || 'there', digestItems)
          logger.info(`[dailyDigest] Sent digest to ${user.email} with ${digestItems.length} video(s)`)
        }
      })
    }

    return { processed: allUsers.length }
  }
)

export const channelBackfill = inngest.createFunction(
  { id: 'channel-backfill', name: 'Channel Backfill on Add', triggers: [{ event: 'channel/added' }] },
  async ({ event, step, logger }) => {
    const { channelDbId, clerkId } = event.data as { channelDbId: number; clerkId: string }

    const user = await step.run('fetch-user', async () => {
      const [row] = await db.select().from(users).where(eq(users.clerkId, clerkId))
      return row ?? null
    })

    if (!user) {
      logger.info(`[channelBackfill] No user found for clerkId ${clerkId}`)
      return
    }

    const channel = await step.run('fetch-channel', async () => {
      const [row] = await db.select().from(channels).where(eq(channels.id, channelDbId))
      return row ?? null
    })

    if (!channel) {
      logger.info(`[channelBackfill] Channel ${channelDbId} not found`)
      return
    }

    // Look back 7 days so the user sees recent videos immediately on add
    const publishedAfter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    const newlyInserted = await step.run('fetch-and-insert-videos', async () => {
      const newVideos = await fetchNewVideos(channel.youtubeChannelId, publishedAfter)
      logger.info(`[channelBackfill] Channel "${channel.channelName}" — ${newVideos.length} video(s) in last 7 days`)

      const inserted: { id: number; youtubeVideoId: string; title: string }[] = []

      for (const video of newVideos) {
        const [row] = await db
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

        if (row) inserted.push({ id: row.id, youtubeVideoId: video.youtubeVideoId, title: video.title })
      }

      return inserted
    })

    if (!newlyInserted.length) {
      logger.info(`[channelBackfill] No new videos to send for channel "${channel.channelName}"`)
      return
    }

    const summaryMap = await step.run('summarize', () =>
      summarizeVideos(newlyInserted.map((v) => ({ youtubeVideoId: v.youtubeVideoId, title: v.title })))
    )

    await step.run('persist-and-email', async () => {
      const digestItems: DigestItem[] = []

      for (const video of newlyInserted) {
        const summary = summaryMap[video.youtubeVideoId] ?? ''
        await db.update(videos).set({ summary }).where(eq(videos.id, video.id))
        digestItems.push({
          channelName: channel.channelName,
          title: video.title,
          summary,
          url: `https://youtube.com/watch?v=${video.youtubeVideoId}`,
        })
      }

      if (user.email) {
        await sendDigest(user.email, user.name || 'there', digestItems)
        logger.info(`[channelBackfill] Sent backfill digest to ${user.email} — ${digestItems.length} video(s)`)
      }
    })
  }
)
