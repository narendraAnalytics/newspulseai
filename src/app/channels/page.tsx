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
  const { userId, has } = await auth()
  if (!userId) redirect('/sign-in')

  // Determine current Clerk plan
  const currentPlan = has({ plan: 'pro' }) ? 'pro' : has({ plan: 'plus' }) ? 'plus' : 'free'

  // Upsert user AND sync plan on every visit (lazy plan sync for Inngest)
  const clerkUser = await currentUser()
  const email = clerkUser?.emailAddresses[0]?.emailAddress ?? ''
  const name  = `${clerkUser?.firstName ?? ''} ${clerkUser?.lastName ?? ''}`.trim()

  await db
    .insert(users)
    .values({ clerkId: userId, email, name, plan: currentPlan })
    .onConflictDoUpdate({
      target: users.clerkId,
      set: { email, name, plan: currentPlan },
    })

  const userChannels = await db
    .select()
    .from(channels)
    .where(eq(channels.clerkId, userId))

  return (
    <div className="relative min-h-screen bg-[#080c14] overflow-hidden">
      <Navbar />
      <ChannelsList initialChannels={userChannels} userId={userId} plan={currentPlan} />
    </div>
  )
}
