import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { PricingTable } from '@clerk/nextjs'
import Navbar from '@/components/Navbar'

export const metadata = {
  title: 'Pricing — NewsPulseAI',
}

export default async function PricingPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 50%, #fde68a 100%)' }}
    >
      {/* Warm decorative glows */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-24 -left-24 w-[500px] h-[500px] rounded-full bg-orange-300/20 blur-[140px]" />
        <div className="absolute top-1/2 -right-32 w-[400px] h-[400px] rounded-full bg-amber-300/25 blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 w-[350px] h-[350px] rounded-full bg-yellow-200/30 blur-[100px]" />
      </div>

      <Navbar />

      <div className="relative z-10 pt-28 pb-20 px-4">
        {/* Header */}
        <div className="max-w-2xl mx-auto text-center mb-14">
          <p className="text-xs font-sans uppercase tracking-[0.3em] text-amber-700/70 mb-4">
            PLANS &amp; FEATURES
          </p>
          <h1 className="font-heading text-5xl md:text-7xl tracking-wider leading-none text-amber-900 mb-4">
            SIMPLE, TRANSPARENT PRICING
          </h1>
          <p className="text-base text-amber-800/60 font-sans leading-relaxed">
            Start free. Upgrade when you need more channels and deeper summaries.
          </p>
        </div>

        {/* Clerk PricingTable — renders plan cards with monthly/annual toggle */}
        <div className="max-w-5xl mx-auto">
          <PricingTable />
        </div>
      </div>
    </div>
  )
}
