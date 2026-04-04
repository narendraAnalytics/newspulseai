"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./hero.css";

const VIDEOS = [
  {
    src: "https://res.cloudinary.com/dkqbzwicr/video/upload/q_auto/f_auto/v1775189751/video1_fmvpdz.webm",
    label: "01",
    title: "CHANNELS",
    gradient: "from-blue-900 to-blue-600",
  },
  {
    src: "https://res.cloudinary.com/dkqbzwicr/video/upload/q_auto/f_auto/v1775190321/video2_v1xtgc.webm",
    label: "02",
    title: "DIGESTS",
    gradient: "from-purple-900 to-purple-600",
  },
  {
    src: "https://res.cloudinary.com/dkqbzwicr/video/upload/q_auto/f_auto/v1775190616/video3_rfeqor.webm",
    label: "03",
    title: "AI SUMMARIES",
    gradient: "from-emerald-900 to-emerald-600",
  },
  {
    src: "https://res.cloudinary.com/dkqbzwicr/video/upload/q_auto/f_auto/v1775190617/video4_iopw67.webm",
    label: "04",
    title: "INSIGHTS",
    gradient: "from-orange-900 to-orange-600",
  },
];

export default function Hero() {
  const [activeVideo, setActiveVideo] = useState(0);
  const [muted, setMuted] = useState(true);
  const [showDemo, setShowDemo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scrollLockRef = useRef(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  function goNext() {
    setActiveVideo(prev => Math.min(prev + 1, VIDEOS.length - 1));
  }
  function goPrev() {
    setActiveVideo(prev => Math.max(prev - 1, 0));
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (scrollLockRef.current) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;

    // Use whichever axis had more movement
    if (Math.abs(dx) > Math.abs(dy)) {
      // Horizontal swipe: left = next, right = prev
      if (Math.abs(dx) < 40) return;
      if (dx < 0) goNext(); else goPrev();
    } else {
      // Vertical swipe: up = next, down = prev
      if (Math.abs(dy) < 40) return;
      if (dy < 0) goNext(); else goPrev();
    }

    scrollLockRef.current = true;
    setTimeout(() => { scrollLockRef.current = false; }, 600);
  }

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    video.load();
    video.play().catch(() => {});
  }, [activeVideo]);

  useEffect(() => {
    function handleWheel(e: WheelEvent) {
      e.preventDefault();
      if (scrollLockRef.current) return;
      scrollLockRef.current = true;

      if (e.deltaY > 0) {
        setActiveVideo(prev => Math.min(prev + 1, VIDEOS.length - 1));
      } else {
        setActiveVideo(prev => Math.max(prev - 1, 0));
      }

      setTimeout(() => { scrollLockRef.current = false; }, 800);
    }

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, []);

  useEffect(() => {
    if (!showDemo) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setShowDemo(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showDemo]);

  useEffect(() => {
    document.body.style.overflow = showDemo ? "hidden" : "";
    const video = videoRef.current;
    if (!video) return;
    if (showDemo) video.pause(); else video.play().catch(() => {});
    return () => { document.body.style.overflow = ""; };
  }, [showDemo]);

  function toggleMute() {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  }

  return (
    <section
      className="relative h-screen w-full overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Video */}
      <video
        ref={videoRef}
        key={activeVideo}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src={VIDEOS[activeVideo].src} type="video/mp4" />
      </video>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-linear-to-r from-black/50 via-black/20 to-transparent" />
      <div className="absolute inset-0 bg-linear-to-r from-black/25 via-transparent to-transparent" />

      {/* Hero Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 sm:px-8">
        <p className="text-xs uppercase tracking-[0.3em] text-white/50 mb-4 font-sans">
          AI-Powered News Automation
        </p>
        <h1
          className="hero-heading text-[42px] sm:text-[62px] md:text-[80px] xl:text-[110px] leading-none text-white uppercase overflow-hidden"
        >
          <motion.div
            key={`line1-${activeVideo}`}
            animate={{
              x: [300, 0, 0, 0],
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: 5.2,
              times: [0, 0.13, 0.72, 1],
              delay: 1.5,
              ease: "easeOut",
            }}
          >
            YOUR DAILY NEWS.
          </motion.div>
          <motion.div
            key={`line2-${activeVideo}`}
            animate={{
              x: [300, 0, 0, 0],
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: 5.2,
              times: [0, 0.13, 0.72, 1],
              delay: 1.65,
              ease: "easeOut",
            }}
          >
            POWERED BY AI.
          </motion.div>
        </h1>
        <p className="mt-6 text-lg text-white/60 max-w-md leading-relaxed font-sans mx-auto">
          NewsPulseAI monitors your YouTube channels and delivers AI-written
          video summaries straight to your inbox every morning.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            onClick={() => setShowDemo(true)}
            className="flex items-center gap-3 rounded-full border border-cyan-400 px-8 py-3 text-sm uppercase tracking-widest text-cyan-400 transition-all duration-200 hover:bg-cyan-400/10 font-sans cursor-pointer"
          >
            <span className="text-xs">▶</span>
            WATCH DEMO
          </button>

          {/* Animated "click here" arrow hint */}
          <motion.div
            className="flex items-center gap-1.5 select-none pointer-events-none"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: [0, 1, 1, 0], x: [-10, 0, 0, -10] }}
            transition={{ duration: 2.5, delay: 2, times: [0, 0.2, 0.75, 1], repeat: Infinity, repeatDelay: 3 }}
          >
            {/* Arrow made of two bouncing chevrons */}
            <motion.span
              className="text-yellow-300 text-base leading-none drop-shadow-[0_0_6px_rgba(253,224,71,0.9)]"
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 0.7, repeat: Infinity, ease: "easeInOut" }}
            >
              ›
            </motion.span>
            <motion.span
              className="text-yellow-300 text-base leading-none drop-shadow-[0_0_6px_rgba(253,224,71,0.9)]"
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 0.7, repeat: Infinity, ease: "easeInOut", delay: 0.15 }}
            >
              ›
            </motion.span>
            <span className="text-[10px] uppercase tracking-widest text-yellow-300 font-sans ml-0.5 drop-shadow-[0_0_6px_rgba(253,224,71,0.9)]">
              click here
            </span>
          </motion.div>

          {/* LinkedIn icon — visible to everyone */}
          <motion.a
            href="https://www.linkedin.com/in/nk-analytics"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Connect on LinkedIn"
            className="relative flex items-center justify-center w-10 h-10 rounded-full bg-[#0A66C2] text-white shadow-md"
            animate={{ scale: [1, 1.12, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.5 }}
            whileHover={{ scale: 1.18 }}
          >
            {/* Pulse ring */}
            <motion.span
              className="absolute inset-0 rounded-full bg-[#0A66C2]"
              animate={{ scale: [1, 1.6], opacity: [0.5, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut", repeatDelay: 1.7 }}
            />
            {/* LinkedIn "in" icon */}
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 relative z-10" aria-hidden>
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </motion.a>
        </div>
      </div>

      {/* Sidebar Thumbnail Navigation — tablet (md) and desktop */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2 hidden md:flex flex-col gap-3 z-10">
        {VIDEOS.map((video, i) => (
          <button
            key={i}
            onClick={() => setActiveVideo(i)}
            className={`relative w-20 h-16 md:w-24 md:h-20 rounded-lg overflow-hidden transition-all duration-300 cursor-pointer ${
              activeVideo === i
                ? "sidebar-thumb-active opacity-100 scale-105"
                : "sidebar-thumb opacity-40 hover:opacity-70"
            }`}
          >
            <div className={`absolute inset-0 bg-linear-to-b ${video.gradient}`} />
            <div className="absolute inset-0 flex flex-col justify-between p-1.5">
              <span className="text-[9px] font-sans text-white/60">{video.label}</span>
              <span className="text-[7px] uppercase tracking-widest text-white/80 leading-tight font-sans">
                {video.title}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Mute / Unmute Toggle */}
      <button
        onClick={toggleMute}
        className="mute-btn absolute bottom-8 right-8 z-10 flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-widest text-white transition-all duration-200 hover:bg-white/10 font-sans"
      >
        {muted ? (
          <>
            <span className="text-base">🔇</span> UNMUTE
          </>
        ) : (
          <>
            <span className="text-base">🔊</span> MUTE
          </>
        )}
      </button>

      {/* Demo Video Overlay */}
      <AnimatePresence>
        {showDemo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
            onClick={() => setShowDemo(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-4xl mx-4"
              onClick={e => e.stopPropagation()}
            >
              <video
                autoPlay
                controls
                playsInline
                className="w-full rounded-xl shadow-2xl"
              >
                <source src="https://res.cloudinary.com/dkqbzwicr/video/upload/q_auto/f_auto/v1775216673/videonewspulseai_xl48hl.webm" type="video/webm" />
              </video>
              <button
                onClick={() => setShowDemo(false)}
                className="absolute -top-4 -right-4 w-9 h-9 rounded-full bg-white/10 border border-white/20 text-white text-lg flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer"
                aria-label="Close demo"
              >
                ×
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom progress dots — tappable on mobile */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 md:left-6 md:translate-x-0 lg:left-16 flex items-center gap-3">
        {VIDEOS.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveVideo(i)}
            aria-label={`Go to video ${i + 1}`}
            className={`transition-all duration-300 rounded-full cursor-pointer ${
              activeVideo === i ? "w-8 h-2 bg-white" : "w-2 h-2 bg-white/30 hover:bg-white/60"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
