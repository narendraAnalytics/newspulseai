import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { channels, users } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'
import { resolveChannelId } from '@/lib/youtube'
import { inngest } from '@/inngest/client'

const AddChannelSchema = z.object({
  youtubeChannelId: z.string().min(1),
  channelName: z.string().min(1),
})

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rows = await db.select().from(channels).where(eq(channels.clerkId, userId))
  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = AddChannelSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  // Resolve @handle / URL to real UCxxx channel ID
  let resolvedChannelId: string
  try {
    resolvedChannelId = await resolveChannelId(parsed.data.youtubeChannelId)
  } catch {
    return NextResponse.json({ error: 'YouTube channel not found. Check the handle or URL.' }, { status: 400 })
  }

  // Ensure user row exists (upsert)
  await db
    .insert(users)
    .values({ clerkId: userId, email: '', name: '' })
    .onConflictDoNothing()

  const [row] = await db
    .insert(channels)
    .values({
      clerkId: userId,
      youtubeChannelId: resolvedChannelId,
      channelName: parsed.data.channelName,
    })
    .returning()

  // Trigger immediate backfill so the user gets videos right away (don't wait for 6 AM)
  await inngest.send({
    name: 'channel/added',
    data: { channelDbId: row.id, clerkId: userId },
  })

  return NextResponse.json(row, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = Number(searchParams.get('id'))
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  await db.delete(channels).where(and(eq(channels.id, id), eq(channels.clerkId, userId)))
  return NextResponse.json({ success: true })
}
