import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Navbar from "@/components/Navbar"
import AboutClient from "./AboutClient"

export const metadata = {
  title: "About — NewsPulseAI",
  description:
    "Meet the creator and the AI stack behind NewsPulseAI — your automated YouTube digest delivered every morning at 6 AM.",
}

export default async function AboutPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')
  return (
    <div className="relative min-h-screen bg-[#FAF7F2] overflow-hidden">
      <Navbar />
      <AboutClient />
    </div>
  )
}
