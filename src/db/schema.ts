import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  clerkId:   text('clerk_id').primaryKey(),
  email:     text('email').notNull(),
  name:      text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const channels = pgTable('channels', {
  id:               serial('id').primaryKey(),
  clerkId:          text('clerk_id').notNull().references(() => users.clerkId, { onDelete: 'cascade' }),
  youtubeChannelId: text('youtube_channel_id').notNull(),
  channelName:      text('channel_name').notNull(),
  createdAt:        timestamp('created_at').defaultNow().notNull(),
})

// youtube_video_id is UNIQUE — Drizzle's onConflictDoNothing() uses this to skip duplicates
export const videos = pgTable('videos', {
  id:             serial('id').primaryKey(),
  channelId:      integer('channel_id').notNull().references(() => channels.id, { onDelete: 'cascade' }),
  youtubeVideoId: text('youtube_video_id').notNull().unique(),
  title:          text('title').notNull(),
  publishedAt:    timestamp('published_at').notNull(),
  summary:        text('summary'),
  fetchedAt:      timestamp('fetched_at').defaultNow().notNull(),
})

export type InsertUser    = typeof users.$inferInsert
export type SelectUser    = typeof users.$inferSelect
export type InsertChannel = typeof channels.$inferInsert
export type SelectChannel = typeof channels.$inferSelect
export type InsertVideo   = typeof videos.$inferInsert
export type SelectVideo   = typeof videos.$inferSelect
