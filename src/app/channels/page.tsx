import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { db } from '@/db'
import { channels } from '@/db/schema'
import { eq } from 'drizzle-orm'
import Navbar from '@/components/Navbar'
import ChannelsList from './ChannelsList'

export const metadata = {
  title: 'Your Channels — NewsPulseAI',
}

export default async function ChannelsPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const userChannels = await db
    .select()
    .from(channels)
    .where(eq(channels.clerkId, userId))

  return (
    <div className="bg-black min-h-screen">
      <Navbar />
      <ChannelsList initialChannels={userChannels} userId={userId} />
    </div>
  )
}
