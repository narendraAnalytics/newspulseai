import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import FeaturesSlider from './FeaturesSlider'

export const metadata = {
  title: 'Features — NewsPulseAI',
}

export default async function FeaturesPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  return (
    <div className="relative min-h-screen bg-[#080c14] overflow-hidden">
      <Navbar />
      <FeaturesSlider />
    </div>
  )
}
