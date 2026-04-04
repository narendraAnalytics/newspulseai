"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Link from "next/link"

gsap.registerPlugin(ScrollTrigger)

// ── Palette ───────────────────────────────────────────────────────────────────
// bg:      #FAF7F2  (warm cream, like mynrd.co.uk)
// fg:      #1A1A1A  (near-black)
// sec:     #E8E3DC  (warm taupe — alternate sections)
// muted:   #6B6B6B  (body copy, labels)
// border:  rgba(26,26,26,0.1)
// accent:  emerald-600 (#059669) — readable on light bg
// cta-bg:  #1A1A1A  (dark CTA, like mynrd.co.uk footer section)

// ── Data ──────────────────────────────────────────────────────────────────────

const STACK = [
  {
    num: "01",
    name: "Next.js 16",
    desc: "App Router, server components, and Turbopack — the full-stack backbone serving every page, API route, and server action.",
  },
  {
    num: "02",
    name: "Google Gemini AI",
    desc: "Batch-processes up to 10 YouTube URLs per call and distils each video into 3–4 sharp, factual sentences. No hallucinations — just transcripts turned into clarity.",
  },
  {
    num: "03",
    name: "Inngest Automation",
    desc: "Event-driven serverless pipeline that fires at 12:30 AM UTC (6 AM IST) every day. No servers to manage, no cold starts, no babysitting.",
  },
  {
    num: "04",
    name: "Neon Postgres",
    desc: "Serverless Postgres that scales to zero between digests. Your channels, videos, and summaries are safely stored — billed only for what you use.",
  },
  {
    num: "05",
    name: "Resend + React Email",
    desc: "Dark-themed, pixel-perfect digest emails rendered as React components and delivered through Resend's battle-tested infrastructure.",
  },
]

const STATS = [
  { value: 6, suffix: " AM", label: "Digest delivered daily" },
  { value: 10, suffix: "+", label: "Channels per account" },
  { value: 4, suffix: " sec", label: "Per AI summary" },
  { value: 100, suffix: "%", label: "Algorithm-free feed" },
]

const STEPS = [
  {
    num: "01",
    title: "Add Your Channels",
    desc: "Paste an @handle, full YouTube URL, or bare channel ID. NewsPulseAI resolves it instantly and starts monitoring — no setup wizard required.",
    icon: "📡",
  },
  {
    num: "02",
    title: "AI Reads It First",
    desc: "Every morning at 6 AM, Gemini AI scans new uploads and writes clear 3–4 sentence summaries of each video before you wake up.",
    icon: "🤖",
  },
  {
    num: "03",
    title: "Inbox. Done.",
    desc: "A beautifully formatted digest lands in your inbox before your coffee gets cold. One click to watch anything that actually matters.",
    icon: "📬",
  },
]

const MARQUEE = "NEXT.JS 16 · GEMINI AI · INNGEST · NEON POSTGRES · RESEND · CLERK AUTH · YOUTUBE API V3 · DRIZZLE ORM · "

// ── Torn Paper Shape ──────────────────────────────────────────────────────────
// Sits at the bottom of the hero — cream shape over a white next section
function TornPaper({ fromColor, toColor }: { fromColor: string; toColor: string }) {
  return (
    <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ lineHeight: 0 }}>
      <svg
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block", width: "100%", height: "80px", background: toColor }}
      >
        <path
          d={`M0,80 L0,40 Q60,10 120,35 Q200,65 280,28 Q360,0 440,32 Q520,60 600,22 Q680,0 760,30 Q840,55 920,20 Q1000,0 1080,28 Q1160,55 1240,18 Q1320,0 1380,30 L1440,38 L1440,80 Z`}
          fill={fromColor}
        />
      </svg>
    </div>
  )
}

// ── Rotating Badge ─────────────────────────────────────────────────────────────
function RotatingBadge() {
  const r = 46
  const pathD = `M60,60 m-${r},0 a${r},${r} 0 1,1 ${r * 2},0 a${r},${r} 0 1,1 -${r * 2},0`

  return (
    <div className="relative w-28 h-28 group cursor-pointer">
      <svg
        viewBox="0 0 120 120"
        className="w-full h-full"
        style={{ animation: "about-spin 18s linear infinite" }}
      >
        <defs>
          <path id="about-badge-path" d={pathD} />
        </defs>
        <text
          fontSize="8.5"
          letterSpacing="2.8"
          fill="#1A1A1A"
          fillOpacity="0.4"
          fontFamily="var(--font-sans, sans-serif)"
        >
          <textPath href="#about-badge-path" startOffset="0%">
            NEWSPULSEAI · NARENDRA · AI DIGEST ·
          </textPath>
        </text>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          whileHover={{ scale: 1.15 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="w-11 h-11 rounded-full bg-[#1A1A1A]/[0.06] border border-[#1A1A1A]/20 flex items-center justify-center hover:bg-[#1A1A1A]/10 transition-colors duration-300"
        >
          <span className="text-[#1A1A1A] text-base leading-none">↗</span>
        </motion.div>
      </div>
    </div>
  )
}

// ── Animated Image ─────────────────────────────────────────────────────────────
function AnimatedImage() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/image.png"
      alt="Narendra sitting at his desk"
      className="w-full h-full object-contain"
    />
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function AboutClient() {
  const [openStack, setOpenStack] = useState<string | null>(null)

  const heroTextRef  = useRef<HTMLDivElement>(null)
  const narrativeRef = useRef<HTMLElement>(null)
  const statsRef     = useRef<HTMLElement>(null)
  const stackRef     = useRef<HTMLElement>(null)
  const stepsRef     = useRef<HTMLElement>(null)
  const ctaRef       = useRef<HTMLElement>(null)

  // ── Lenis smooth scroll ─────────────────────────────────────────────────────
  useEffect(() => {
    let lenis: { raf: (t: number) => void; destroy: () => void } | null = null
    let raf = 0
    const init = async () => {
      try {
        const mod = await import("@studio-freight/lenis")
        const Lenis = mod.default as new (opts: object) => typeof lenis
        lenis = new Lenis({ duration: 1.1, easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) }) as { raf: (t: number) => void; destroy: () => void }
        const tick = (time: number) => { lenis!.raf(time); raf = requestAnimationFrame(tick) }
        raf = requestAnimationFrame(tick)
      } catch (_) { /* optional */ }
    }
    init()
    return () => { cancelAnimationFrame(raf); try { lenis?.destroy() } catch (_) { /* noop */ } }
  }, [])

  // ── GSAP hero entrance ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!heroTextRef.current) return
    const els = heroTextRef.current.querySelectorAll("[data-hero]")
    gsap.set(els, { opacity: 0, y: 44 })
    gsap.to(els, { opacity: 1, y: 0, stagger: 0.13, duration: 1, ease: "power3.out", delay: 0.25 })
  }, [])

  // ── GSAP scroll animations ──────────────────────────────────────────────────
  useEffect(() => {
    const ctx = gsap.context(() => {

      // Narrative
      if (narrativeRef.current) {
        gsap.fromTo(
          narrativeRef.current.querySelectorAll("[data-reveal]"),
          { opacity: 0, y: 70 },
          {
            opacity: 1, y: 0, stagger: 0.18, duration: 1.1, ease: "power3.out",
            scrollTrigger: { trigger: narrativeRef.current, start: "top 72%", toggleActions: "play none none none" },
          }
        )
      }

      // Stats count-up + card fade
      if (statsRef.current) {
        statsRef.current.querySelectorAll<HTMLElement>("[data-count]").forEach(el => {
          const target = Number(el.dataset.count)
          const obj = { val: 0 }
          gsap.to(obj, {
            val: target, duration: 2.2, ease: "power2.out",
            onUpdate() { el.textContent = Math.round(obj.val).toString() },
            scrollTrigger: { trigger: el, start: "top 82%", toggleActions: "play none none none" },
          })
        })
        gsap.fromTo(
          statsRef.current.querySelectorAll("[data-stat-card]"),
          { opacity: 0, y: 40 },
          {
            opacity: 1, y: 0, stagger: 0.1, duration: 0.8, ease: "power3.out",
            scrollTrigger: { trigger: statsRef.current, start: "top 75%", toggleActions: "play none none none" },
          }
        )
      }

      // Stack items
      if (stackRef.current) {
        gsap.fromTo(
          stackRef.current.querySelectorAll("[data-stack-item]"),
          { opacity: 0, x: -40 },
          {
            opacity: 1, x: 0, stagger: 0.09, duration: 0.75, ease: "power3.out",
            scrollTrigger: { trigger: stackRef.current, start: "top 72%", toggleActions: "play none none none" },
          }
        )
      }

      // Steps
      if (stepsRef.current) {
        gsap.fromTo(
          stepsRef.current.querySelectorAll("[data-step]"),
          { opacity: 0, y: 55, scale: 0.95 },
          {
            opacity: 1, y: 0, scale: 1, stagger: 0.16, duration: 0.9, ease: "back.out(1.3)",
            scrollTrigger: { trigger: stepsRef.current, start: "top 72%", toggleActions: "play none none none" },
          }
        )
      }

      // CTA
      if (ctaRef.current) {
        gsap.fromTo(
          ctaRef.current.querySelectorAll("[data-cta]"),
          { opacity: 0, y: 50 },
          {
            opacity: 1, y: 0, stagger: 0.15, duration: 1, ease: "power3.out",
            scrollTrigger: { trigger: ctaRef.current, start: "top 78%", toggleActions: "play none none none" },
          }
        )
      }
    })

    return () => ctx.revert()
  }, [])

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1A1A1A] overflow-x-hidden">
      <style>{`
        @keyframes about-spin    { from { transform: rotate(0deg); }  to { transform: rotate(360deg); } }
        @keyframes about-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .about-marquee-track     { animation: about-marquee 28s linear infinite; display:flex; width:max-content; }
      `}</style>

      {/* ═══════════════════════════════════════════════════ HERO ══════ */}
      <section className="relative min-h-screen flex items-center pt-28 pb-32 px-5 sm:px-8 md:px-16 bg-[#FAF7F2] overflow-hidden">

        <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* ── Left: Text ─────────────────────────────────────────────── */}
          <div ref={heroTextRef} className="flex flex-col">
            <span data-hero className="text-[10px] uppercase tracking-[0.3em] text-emerald-600 font-sans mb-5">
              About / Creator
            </span>

            <h1 data-hero className="font-heading text-[3.2rem] sm:text-[4rem] md:text-[5rem] lg:text-[5.5rem] xl:text-[6rem] leading-[0.95] tracking-wide">
              <span className="bg-gradient-to-r from-orange-500 to-amber-400 bg-clip-text text-transparent">Hey, I&apos;m</span>
              <br />
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Narendra.
              </span>
            </h1>

            <p data-hero className="mt-7 text-[#6B6B6B] font-sans text-base md:text-lg leading-relaxed max-w-[440px]">
              I built NewsPulseAI because I was tired of missing important
              uploads from channels I care about. So I automated everything —
              monitoring, AI summaries, and a clean digest every morning at 6 AM.
            </p>

            <div data-hero className="mt-9 flex items-center gap-4 flex-wrap">
              <Link
                href="/channels"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-7 py-3.5 text-[11px] uppercase tracking-widest text-white font-semibold hover:opacity-90 transition-opacity shadow-md"
              >
                Get Started <span className="text-xs">▶</span>
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 text-[11px] uppercase tracking-widest text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors font-sans"
              >
                How it works <span>↓</span>
              </a>

              {/* LinkedIn */}
              <motion.a
                href="https://www.linkedin.com/in/nk-analytics"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Connect on LinkedIn"
                className="relative flex items-center justify-center w-10 h-10 rounded-full bg-[#0A66C2] text-white shadow-md hover:scale-110 transition-transform duration-200"
                animate={{ scale: [1, 1.12, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.5 }}
              >
                {/* Pulse ring */}
                <motion.span
                  className="absolute inset-0 rounded-full bg-[#0A66C2]"
                  animate={{ scale: [1, 1.55], opacity: [0.45, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut", repeatDelay: 1.7 }}
                />
                {/* LinkedIn "in" icon */}
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 relative z-10" aria-hidden>
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </motion.a>
            </div>

            {/* Mini stats row */}
            <div data-hero className="mt-14 flex items-center gap-8 pt-8 border-t border-[rgba(26,26,26,0.12)]">
              {[
                { val: "6 AM",   sub: "Daily delivery" },
                { val: "Gemini", sub: "AI-powered" },
                { val: "Free",   sub: "To get started" },
              ].map((s, i) => (
                <div key={i} className="flex flex-col">
                  <span className="font-heading text-[1.9rem] tracking-wide text-orange-500 leading-none">
                    {s.val}
                  </span>
                  <span className="text-[9px] uppercase tracking-[0.22em] text-[#6B6B6B] font-sans mt-1.5">
                    {s.sub}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: Lottie / illustration ─────────────────────────── */}
          <div className="relative flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
              className="relative w-full max-w-[480px] aspect-square"
            >
              <AnimatedImage />
            </motion.div>

            {/* Rotating circular badge */}
            <div className="absolute -top-2 -right-2 md:-top-6 md:-right-6">
              <RotatingBadge />
            </div>

            {/* Floating tags */}
            <motion.div
              animate={{ y: [0, -9, 0] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-10 -left-4 md:-left-10 bg-white border border-[rgba(26,26,26,0.15)] rounded-xl px-3.5 py-2 text-[10px] font-sans uppercase tracking-wider text-emerald-600 shadow-sm"
            >
              ✦ AI Summaries
            </motion.div>
            <motion.div
              animate={{ y: [0, 9, 0] }}
              transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
              className="absolute bottom-16 -right-4 md:-right-10 bg-white border border-[rgba(26,26,26,0.15)] rounded-xl px-3.5 py-2 text-[10px] font-sans uppercase tracking-wider text-violet-600 shadow-sm"
            >
              ✦ 6 AM Digest
            </motion.div>
          </div>
        </div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
          className="absolute bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
        >
          <motion.span
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="text-[9px] uppercase tracking-[0.25em] text-[#6B6B6B] font-sans"
          >
            scroll ↓
          </motion.span>
        </motion.div>

        {/* Torn paper shape at bottom of hero → white narrative section */}
        <TornPaper fromColor="#FAF7F2" toColor="#ffffff" />
      </section>

      {/* ════════════════════════════════════════════ MARQUEE ══════ */}
      <div className="relative border-y border-[rgba(26,26,26,0.1)] py-4 overflow-hidden bg-[#E8E3DC]">
        <div className="about-marquee-track">
          <span className="text-[10px] uppercase tracking-[0.26em] text-[#6B6B6B] font-sans">
            {(MARQUEE + MARQUEE).repeat(2)}
          </span>
        </div>
      </div>

      {/* ══════════════════════════════════════ NARRATIVE ══════ */}
      <section ref={narrativeRef} className="py-36 px-5 sm:px-8 md:px-16 bg-white">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <p data-reveal className="text-[10px] uppercase tracking-[0.3em] text-emerald-600 font-sans">
            The Story
          </p>
          <h2 data-reveal className="font-heading text-[2.6rem] sm:text-5xl md:text-6xl lg:text-[4.5rem] xl:text-[5rem] leading-[1.02] tracking-wide">
            <span className="bg-gradient-to-r from-orange-500 to-amber-400 bg-clip-text text-transparent">I was drowning in YouTube.</span>
            <br />
            <span className="bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent">So I built a robot</span>
            <br />
            <span className="bg-gradient-to-r from-violet-500 to-purple-400 bg-clip-text text-transparent">to read it for me.</span>
          </h2>
          <p data-reveal className="text-[#6B6B6B] font-sans text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
            NewsPulseAI watches the channels you choose, runs every new upload
            through Gemini AI, and delivers a crisp email digest every morning
            at 6 AM IST. No algorithm. No rabbit holes. No wasted hours.
            Just the content that matters, summarised.
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════════════ STATS ══════ */}
      <section ref={statsRef} className="py-24 px-5 sm:px-8 md:px-16 bg-[#FAF7F2] border-t border-[rgba(26,26,26,0.08)]">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4">
          {STATS.map(s => (
            <div key={s.label} data-stat-card className="group text-center p-6 rounded-2xl border border-[rgba(26,26,26,0.08)] bg-white hover:shadow-md transition-shadow duration-500">
              <div className="flex items-end justify-center gap-0.5">
                <span
                  data-count={s.value}
                  className="font-heading text-5xl md:text-6xl text-teal-600 tabular-nums leading-none"
                >
                  0
                </span>
                <span className="font-heading text-2xl md:text-3xl text-emerald-600 leading-none pb-1">
                  {s.suffix}
                </span>
              </div>
              <div className="mt-3 text-[9px] uppercase tracking-[0.26em] text-[#6B6B6B] font-sans">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════ TECH STACK ══════ */}
      <section ref={stackRef} className="py-32 px-5 sm:px-8 md:px-16 bg-white border-t border-[rgba(26,26,26,0.08)]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-emerald-600 font-sans mb-4">
                Tech Stack
              </p>
              <h2 className="font-heading text-[2.4rem] md:text-5xl lg:text-[3.5rem] tracking-wide leading-tight bg-gradient-to-r from-orange-500 to-amber-400 bg-clip-text text-transparent">
                What powers<br className="hidden sm:block" /> the machine
              </h2>
            </div>
            <p className="text-[#6B6B6B] font-sans text-sm max-w-xs leading-relaxed">
              Every layer chosen for reliability, speed, and zero-maintenance production deployments.
            </p>
          </div>

          <div className="divide-y divide-[rgba(26,26,26,0.08)]">
            {STACK.map(item => (
              <div key={item.num} data-stack-item>
                <button
                  onClick={() => setOpenStack(openStack === item.num ? null : item.num)}
                  className="group w-full text-left flex items-center justify-between py-7 px-2 hover:bg-[#FAF7F2] transition-colors duration-300 rounded-lg"
                >
                  <div className="flex items-center gap-6 sm:gap-10">
                    <span className="font-heading text-3xl sm:text-4xl text-[#1A1A1A]/10 group-hover:text-emerald-600/25 transition-colors duration-300 w-14 shrink-0">
                      {item.num}
                    </span>
                    <span className="font-heading text-[1.5rem] sm:text-3xl md:text-[2rem] tracking-wide text-orange-500 group-hover:text-emerald-600 transition-colors duration-300">
                      {item.name}
                    </span>
                  </div>
                  <span
                    className="text-[#1A1A1A]/30 text-2xl transition-transform duration-300 shrink-0"
                    style={{ transform: openStack === item.num ? "rotate(45deg)" : "rotate(0deg)" }}
                  >
                    +
                  </span>
                </button>

                <AnimatePresence>
                  {openStack === item.num && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.38, ease: [0.4, 0, 0.2, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="px-2 pb-8 pl-20 sm:pl-[6rem] text-[#6B6B6B] font-sans text-base leading-relaxed max-w-2xl">
                        {item.desc}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════ HOW IT WORKS ══════ */}
      <section
        id="how-it-works"
        ref={stepsRef}
        className="py-32 px-5 sm:px-8 md:px-16 border-t border-[rgba(26,26,26,0.08)] bg-[#F5F0E8]"
      >
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 text-center">
            <p className="text-[10px] uppercase tracking-[0.3em] text-emerald-600 font-sans mb-4">
              How It Works
            </p>
            <h2 className="font-heading text-[2.4rem] md:text-5xl lg:text-[3.5rem] tracking-wide leading-tight bg-gradient-to-r from-violet-500 to-purple-400 bg-clip-text text-transparent">
              Three steps to never
              <br />
              miss a video again
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            {STEPS.map((step, i) => (
              <div
                key={step.num}
                data-step
                className="relative group rounded-2xl border border-[rgba(26,26,26,0.08)] bg-white p-8 md:p-10 hover:shadow-lg transition-all duration-500 overflow-hidden"
              >
                {/* Ghost number */}
                <span className="pointer-events-none select-none absolute top-4 right-5 font-heading text-[7rem] leading-none text-[#1A1A1A]/[0.04] group-hover:text-emerald-600/[0.06] transition-colors duration-500">
                  {step.num}
                </span>

                <div className="text-4xl mb-7">{step.icon}</div>

                <h3 className="font-heading text-[1.6rem] md:text-[1.85rem] tracking-wide text-violet-500 mb-4 group-hover:text-emerald-600 transition-colors duration-300">
                  {step.title}
                </h3>
                <p className="text-[#6B6B6B] font-sans text-sm leading-relaxed">
                  {step.desc}
                </p>

                {/* Connector */}
                {i < STEPS.length - 1 && (
                  <div className="hidden md:flex absolute top-1/2 -right-4 z-10 items-center justify-center w-8">
                    <span className="text-[#1A1A1A]/20 text-lg">→</span>
                  </div>
                )}

                {/* Bottom accent line */}
                <div className="absolute bottom-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-transparent to-transparent group-hover:via-emerald-500/40 transition-all duration-700" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════ CTA ══════ */}
      {/* Dark section — like mynrd.co.uk's "Let's work together" */}
      <section
        ref={ctaRef}
        className="py-44 px-5 sm:px-8 md:px-16 bg-gradient-to-br from-emerald-900 via-teal-900 to-emerald-950 relative overflow-hidden"
      >
        {/* Subtle top torn paper into dark */}
        <div className="absolute top-0 left-0 right-0 pointer-events-none" style={{ lineHeight: 0 }}>
          <svg
            viewBox="0 0 1440 70"
            preserveAspectRatio="none"
            style={{ display: "block", width: "100%", height: "70px", background: "#064e3b" }}
          >
            <path
              d="M0,0 L0,40 Q80,70 160,38 Q240,10 320,42 Q400,68 480,36 Q560,8 640,38 Q720,65 800,35 Q880,8 960,36 Q1040,62 1120,34 Q1200,10 1280,38 L1360,34 L1440,30 L1440,0 Z"
              fill="#F5F0E8"
            />
          </svg>
        </div>

        {/* Decorative circles */}
        <div className="pointer-events-none absolute top-20 right-20 w-32 h-32 border border-white/[0.07] rounded-full hidden lg:block" />
        <div className="pointer-events-none absolute bottom-20 left-16 w-48 h-48 border border-white/[0.05] rounded-full hidden lg:block" />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <p data-cta className="text-[10px] uppercase tracking-[0.3em] text-emerald-400 font-sans mb-7">
            Ready?
          </p>

          <h2 data-cta className="font-heading text-[3rem] sm:text-[4rem] md:text-[5rem] lg:text-[6rem] xl:text-[7rem] leading-[0.95] tracking-wide mb-10 text-[#FAF7F2]">
            Start your
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              morning routine
            </span>
            <br />
            today →
          </h2>

          <p data-cta className="text-[#FAF7F2]/50 font-sans text-lg mb-12 max-w-xl mx-auto leading-relaxed">
            Free to start. No credit card. Add your first YouTube channel
            in under 30 seconds and wake up to your first digest tomorrow.
          </p>

          <div data-cta className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/channels"
              className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 px-9 py-4 text-[11px] uppercase tracking-widest text-black font-semibold hover:opacity-90 transition-opacity shadow-[0_0_40px_rgba(52,211,153,0.2)]"
            >
              Get Started Free <span className="text-sm">▶</span>
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-full border border-[#FAF7F2]/20 px-7 py-4 text-[11px] uppercase tracking-widest text-[#FAF7F2]/55 hover:text-[#FAF7F2] hover:border-[#FAF7F2]/35 transition-all duration-200 font-sans"
            >
              View Plans
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
