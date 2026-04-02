"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import gsap from "gsap"

// ─── Feature data ─────────────────────────────────────────────────────────────
const FEATURES = [
  {
    number: "01",
    headline: "WAKE UP TO\nYOUR BRIEFING",
    subtitle: "AI Morning Digest, Delivered at 6 AM",
    description:
      "Stop scrolling. Every morning your inbox holds a sharp, AI-written summary of everything new from the channels you follow — before your coffee gets cold.",
    problem: "Hours lost to YouTube rabbit holes just to stay informed",
    image: "/features/feature1.png",
    gradient: "from-emerald-400 to-cyan-400",
    glow: "bg-emerald-500",
  },
  {
    number: "02",
    headline: "NEVER MISS\nA DROP",
    subtitle: "24/7 Automated Channel Monitoring",
    description:
      "NewsPulseAI watches your channels around the clock. The moment a creator drops something new, the pipeline captures it — you never have to manually check again.",
    problem: "Missing uploads from creators you actually care about",
    image: "/features/feature2.png",
    gradient: "from-cyan-400 to-blue-400",
    glow: "bg-cyan-500",
  },
  {
    number: "03",
    headline: "AI READS\nIT FIRST",
    subtitle: "Gemini-Powered 3-Sentence Summaries",
    description:
      "Google's Gemini AI watches each video and distills it into 3–4 factual sentences. Read the summary, decide if it's worth your hour, skip the rest.",
    problem: "Watching full videos just to know if they matter to you",
    image: "/features/feature3.png",
    gradient: "from-violet-400 to-emerald-400",
    glow: "bg-violet-500",
  },
  {
    number: "04",
    headline: "YOUR FEED.\nYOUR RULES.",
    subtitle: "Zero Algorithm. Zero Noise.",
    description:
      "You choose exactly which channels to track. No recommendations, no trending, no autoplay traps — just the creators you deliberately chose, nothing more.",
    problem: "YouTube's algorithm hijacking your attention",
    image: "/features/feature4.png",
    gradient: "from-emerald-400 to-teal-400",
    glow: "bg-teal-500",
  },
  {
    number: "05",
    headline: "ONE CLICK.\nFOREVER TRACKED.",
    subtitle: "Add Any Channel in Seconds",
    description:
      "Paste an @handle, a full YouTube URL, or a bare channel ID. NewsPulseAI resolves it instantly and starts monitoring — no setup wizard, no API keys, no friction.",
    problem: "Complex onboarding and friction when adding sources",
    image: "/features/feature5.png",
    gradient: "from-cyan-400 to-emerald-400",
    glow: "bg-cyan-400",
  },
  {
    number: "06",
    headline: "INBOX AS YOUR\nDASHBOARD",
    subtitle: "Everything Lands in One Place",
    description:
      "No new app to open. No dashboard to check. Your digest arrives in your real inbox — read it, click through to videos you want, archive the rest. Done.",
    problem: "Content scattered across multiple platforms and apps",
    image: "/features/feature6.png",
    gradient: "from-teal-400 to-cyan-400",
    glow: "bg-teal-400",
  },
  {
    number: "07",
    headline: "BUILT ON\nMODERN AI STACK",
    subtitle: "Enterprise-Grade Tech, Zero Complexity",
    description:
      "Powered by Next.js 16, Gemini AI, Inngest automation, Neon Postgres, and Resend — production-ready infrastructure running silently in the background.",
    problem: "Powerful infrastructure that works invisibly",
    image: "/features/techstuff.png",
    gradient: "from-emerald-400 to-violet-400",
    glow: "bg-violet-400",
  },
]

// ─── Framer Motion variants ────────────────────────────────────────────────────
const cardVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.65, ease: [0.76, 0, 0.24, 1] as const },
  },
  exit: (dir: number) => ({
    x: dir > 0 ? "-55%" : "55%",
    opacity: 0,
    scale: 0.96,
    transition: { duration: 0.45, ease: [0.76, 0, 0.24, 1] as const },
  }),
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function FeaturesSlider() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [direction, setDirection] = useState(1)

  const isAnimatingRef = useRef(false)
  const activeIndexRef = useRef(0)
  const sweepLineRef = useRef<HTMLDivElement>(null)
  activeIndexRef.current = activeIndex

  // ── Stable navigate helpers ─────────────────────────────────────────────────
  const navigate = useCallback((dir: number) => {
    if (isAnimatingRef.current) return
    const current = activeIndexRef.current
    const next = Math.max(0, Math.min(FEATURES.length - 1, current + dir))
    if (next === current) return
    isAnimatingRef.current = true
    setTimeout(() => { isAnimatingRef.current = false }, 750)
    setDirection(dir)
    setActiveIndex(next)
  }, [])

  const goTo = useCallback((idx: number) => {
    if (isAnimatingRef.current) return
    const current = activeIndexRef.current
    if (idx === current) return
    const dir = idx > current ? 1 : -1
    isAnimatingRef.current = true
    setTimeout(() => { isAnimatingRef.current = false }, 750)
    setDirection(dir)
    setActiveIndex(idx)
  }, [])

  // ── GSAP sweep-line flash ───────────────────────────────────────────────────
  useEffect(() => {
    if (!sweepLineRef.current) return
    gsap.fromTo(
      sweepLineRef.current,
      { scaleX: 0, opacity: 0.6, transformOrigin: "left center" },
      { scaleX: 1, opacity: 0, duration: 0.9, ease: "power3.inOut" }
    )
  }, [activeIndex])

  // ── Wheel navigation ────────────────────────────────────────────────────────
  useEffect(() => {
    let acc = 0
    let timer: ReturnType<typeof setTimeout>
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      clearTimeout(timer)
      acc += e.deltaY
      timer = setTimeout(() => { acc = 0 }, 400)
      if (Math.abs(acc) > 60) {
        navigate(acc > 0 ? 1 : -1)
        acc = 0
      }
    }
    window.addEventListener("wheel", onWheel, { passive: false })
    return () => window.removeEventListener("wheel", onWheel)
  }, [navigate])

  // ── Touch navigation ────────────────────────────────────────────────────────
  useEffect(() => {
    let startX = 0
    let startY = 0
    const onTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX
      startY = e.touches[0].clientY
    }
    const onTouchEnd = (e: TouchEvent) => {
      const dx = startX - e.changedTouches[0].clientX
      const dy = startY - e.changedTouches[0].clientY
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
        navigate(dx > 0 ? 1 : -1)
      } else if (Math.abs(dy) > 40) {
        navigate(dy > 0 ? 1 : -1)
      }
    }
    window.addEventListener("touchstart", onTouchStart, { passive: true })
    window.addEventListener("touchend", onTouchEnd, { passive: true })
    return () => {
      window.removeEventListener("touchstart", onTouchStart)
      window.removeEventListener("touchend", onTouchEnd)
    }
  }, [navigate])

  // ── Keyboard navigation ─────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") navigate(1)
      if (e.key === "ArrowLeft"  || e.key === "ArrowUp")   navigate(-1)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [navigate])

  // ── Lenis smooth scroll ─────────────────────────────────────────────────────
  useEffect(() => {
    let lenis: { raf: (t: number) => void; destroy: () => void } | null = null
    const init = async () => {
      try {
        const mod = await import("@studio-freight/lenis")
        const Lenis = mod.default as new (opts: object) => typeof lenis
        lenis = new Lenis({
          duration: 1.2,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        }) as { raf: (t: number) => void; destroy: () => void }
        const raf = (time: number) => { lenis!.raf(time); requestAnimationFrame(raf) }
        requestAnimationFrame(raf)
      } catch (_) { /* lenis optional */ }
    }
    init()
    return () => { try { lenis?.destroy() } catch (_) { /* noop */ } }
  }, [])

  const f = FEATURES[activeIndex]
  const isLast  = activeIndex === FEATURES.length - 1
  const isFirst = activeIndex === 0

  return (
    // ── Dark navy background — visible deep blue, not pure black ──────────────
    <div className="relative w-full h-screen overflow-hidden bg-[#091628]">

      {/* ── Layered ambient glows (much brighter than before) ─────────────────── */}
      <div className="pointer-events-none fixed inset-0 z-0">
        {/* Top-left — primary accent colour per feature */}
        <motion.div
          key={`glow-tl-${activeIndex}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.18, 0.28, 0.18] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className={`absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full ${f.glow}/20 blur-[140px]`}
        />
        {/* Bottom-right — contrasting accent */}
        <motion.div
          key={`glow-br-${activeIndex}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.12, 0.22, 0.12] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          className="absolute -bottom-32 -right-32 w-[600px] h-[600px] rounded-full bg-cyan-400/15 blur-[130px]"
        />
        {/* Centre subtle fill */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_50%,rgba(16,44,72,0.6),transparent)]" />
      </div>

      {/* ── GSAP sweep line ───────────────────────────────────────────────────── */}
      <div
        ref={sweepLineRef}
        className="pointer-events-none fixed top-1/2 left-0 right-0 h-px z-40 bg-linear-to-r from-transparent via-emerald-300/50 to-transparent"
        style={{ opacity: 0 }}
      />

      {/* ── Main card slider ──────────────────────────────────────────────────── */}
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={activeIndex}
          custom={direction}
          variants={cardVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-8 md:px-16 pt-24 lg:pt-20 pb-8 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-16 items-center h-full">

            {/* ── Left: Text ────────────────────────────────────────────────── */}
            <div className="flex flex-col justify-center">

              {/* Large background number — more visible on navy */}
              <motion.span
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 0.22, y: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className={`font-heading text-[5rem] sm:text-[9rem] md:text-[12rem] leading-none bg-linear-to-r ${f.gradient} bg-clip-text text-transparent select-none pointer-events-none -mb-6`}
              >
                {f.number}
              </motion.span>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 36 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="font-heading text-4xl md:text-5xl lg:text-6xl xl:text-[4.5rem] tracking-wider leading-[1.02] text-white"
                style={{ whiteSpace: "pre-line" }}
              >
                {f.headline}
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18, duration: 0.45 }}
                className={`mt-4 text-[10px] uppercase tracking-[0.22em] font-sans bg-linear-to-r ${f.gradient} bg-clip-text text-transparent`}
              >
                {f.subtitle}
              </motion.p>

              {/* Animated divider — brighter on navy */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.22, duration: 0.55, ease: "easeOut" }}
                style={{ originX: 0 }}
                className="my-5 h-px bg-white/20"
              />

              {/* Description — much brighter */}
              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28, duration: 0.5 }}
                className="text-slate-200 font-sans text-sm md:text-[15px] leading-relaxed"
              >
                {f.description}
              </motion.p>

              {/* Problem tag — brighter */}
              <motion.div
                initial={{ opacity: 0, x: -18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.36, duration: 0.4 }}
                className="mt-5 flex items-center gap-2.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                <span className="text-[10px] text-slate-400 font-sans uppercase tracking-[0.15em]">
                  {f.problem}
                </span>
              </motion.div>

              {/* Arrow navigation */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 flex items-center gap-3"
              >
                <button
                  onClick={() => navigate(-1)}
                  disabled={isFirst}
                  aria-label="Previous feature"
                  className="w-9 h-9 rounded-full border border-white/25 flex items-center justify-center text-white/60 hover:border-emerald-400/70 hover:text-emerald-400 transition-all duration-200 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer text-sm"
                >
                  ←
                </button>
                <span className="text-[10px] text-slate-400 font-sans uppercase tracking-widest tabular-nums">
                  {String(activeIndex + 1).padStart(2, "0")} / {String(FEATURES.length).padStart(2, "0")}
                </span>
                <button
                  onClick={() => navigate(1)}
                  disabled={isLast}
                  aria-label="Next feature"
                  className="w-9 h-9 rounded-full border border-white/25 flex items-center justify-center text-white/60 hover:border-emerald-400/70 hover:text-emerald-400 transition-all duration-200 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer text-sm"
                >
                  →
                </button>
              </motion.div>
            </div>

            {/* ── Right: Feature image ──────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.91, x: direction > 0 ? 60 : -60 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ delay: 0.16, duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => !isLast && navigate(1)}
              whileHover={!isLast ? { scale: 1.018 } : {}}
              className="relative w-full h-[160px] sm:h-[190px] lg:h-auto lg:aspect-[16/10] rounded-2xl overflow-hidden border border-white/15 group shadow-[0_8px_40px_rgba(0,0,0,0.5)]"
              style={{ cursor: isLast ? "default" : "pointer" }}
            >
              <Image
                src={f.image}
                alt={f.headline.replace(/\n/g, " ")}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                priority
              />

              {/* Colour tint overlay — slightly stronger */}
              <div className={`absolute inset-0 bg-linear-to-br ${f.gradient} opacity-[0.08]`} />

              {/* Bottom fade — match navy bg */}
              <div className="absolute bottom-0 inset-x-0 h-2/5 bg-linear-to-t from-[#091628]/80 to-transparent" />

              {/* "Next" hover hint */}
              {!isLast && (
                <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-[#0a1830]/80 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-[9px] text-slate-300 font-sans uppercase tracking-widest">Next</span>
                  <span className="text-slate-300 text-xs">→</span>
                </div>
              )}

              {/* Corner accent */}
              <div className={`absolute top-3 left-3 w-6 h-6 rounded-full bg-linear-to-br ${f.gradient} opacity-40 blur-[4px]`} />
            </motion.div>

          </div>
        </motion.div>
      </AnimatePresence>

      {/* ── Right-side chapter nav — Oliver Wyman style ───────────────────────── */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col items-end gap-0.5 pr-5">
        {FEATURES.map((feat, i) => {
          const isActive = i === activeIndex
          return (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="group flex items-center gap-2.5 py-1.5 cursor-pointer"
              aria-label={`Go to ${feat.subtitle}`}
            >
              <motion.span
                animate={{
                  opacity: isActive ? 0.9 : 0,
                  maxWidth: isActive ? "72px" : "0px",
                }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="text-[8px] font-sans uppercase tracking-[0.16em] text-slate-200 overflow-hidden whitespace-nowrap"
                style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
              >
                {feat.number}
              </motion.span>
              <motion.div
                animate={{
                  width:   isActive ? 8 : 4,
                  height:  isActive ? 8 : 4,
                  opacity: isActive ? 1 : 0.35,
                }}
                transition={{ duration: 0.3 }}
                className={`rounded-full transition-colors duration-300 ${
                  isActive
                    ? "bg-emerald-400 shadow-[0_0_10px_2px_rgba(52,211,153,0.5)]"
                    : "bg-slate-400 group-hover:bg-slate-200"
                }`}
              />
            </button>
          )
        })}
      </div>

      {/* ── Left vertical subtitle — Oliver Wyman style ───────────────────────── */}
      <div className="fixed left-6 top-1/2 -translate-y-1/2 z-50 hidden md:block pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.span
            key={activeIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
            className="text-[8px] font-sans uppercase tracking-[0.2em] text-slate-500"
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
          >
            {f.subtitle}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* ── Bottom progress bar ───────────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 h-[2px] bg-white/10">
        <motion.div
          className={`h-full bg-linear-to-r ${f.gradient}`}
          animate={{ width: `${((activeIndex + 1) / FEATURES.length) * 100}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>

      {/* ── Scroll hint on first card ─────────────────────────────────────────── */}
      <AnimatePresence>
        {isFirst && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 1.4 }}
            className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          >
            <motion.span
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              className="text-[9px] text-slate-500 font-sans uppercase tracking-widest"
            >
              scroll · swipe · click image
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
