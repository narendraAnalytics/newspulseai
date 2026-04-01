import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { db } from '@/db'
import { channels, users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import Navbar from '@/components/Navbar'
import ChannelsList from './ChannelsList'

export const metadata = {
  title: 'Your Channels — NewsPulseAI',
}

export default async function ChannelsPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  // Lazy sync: upsert Clerk user into Neon on first dashboard visit
  const clerkUser = await currentUser()
  await db
    .insert(users)
    .values({
      clerkId: userId,
      email: clerkUser?.emailAddresses[0]?.emailAddress ?? '',
      name: `${clerkUser?.firstName ?? ''} ${clerkUser?.lastName ?? ''}`.trim(),
    })
    .onConflictDoNothing()

  const userChannels = await db
    .select()
    .from(channels)
    .where(eq(channels.clerkId, userId))

  return (
    <div className="relative min-h-screen bg-[#080c14] overflow-hidden">
      <Navbar />
      <ChannelsList initialChannels={userChannels} userId={userId} />
    </div>
  )
}
