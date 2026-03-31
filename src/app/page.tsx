"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

const VIDEOS = [
  {
    src: "/videos/video1.mp4",
    label: "01",
    title: "CHANNELS",
    gradient: "from-blue-900 to-blue-600",
  },
  {
    src: "/videos/video2.mp4",
    label: "02",
    title: "DIGESTS",
    gradient: "from-purple-900 to-purple-600",
  },
  {
    src: "/videos/video3.mp4",
    label: "03",
    title: "AI SUMMARIES",
    gradient: "from-emerald-900 to-emerald-600",
  },
  {
    src: "/videos/video4.mp4",
    label: "04",
    title: "INSIGHTS",
    gradient: "from-orange-900 to-orange-600",
  },
];

const NAV_LINKS = ["CHANNELS", "FEATURES", "HOW IT WORKS", "PRICING"];

export default function Home() {
  const [activeVideo, setActiveVideo] = useState(0);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scrollLockRef = useRef(false);

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

  function toggleMute() {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  }

  return (
    <div className="bg-black min-h-screen">
      {/* Navbar */}
      <nav className="fixed top-4 left-0 right-0 z-50 flex items-center justify-between px-6">
        {/* Logo */}
        <div className="flex items-center">
          <Image
            src="/images/logo.png"
            alt="NewsPulseAI"
            width={140}
            height={40}
            className="object-contain"
            priority
          />
        </div>

        {/* Pill Nav */}
        <div
          className="hidden md:flex items-center gap-1 rounded-full border border-white/15 px-3 py-2"
          style={{ backdropFilter: "blur(12px)", background: "rgba(255,255,255,0.05)" }}
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link}
              href="#"
              className="px-4 py-1.5 text-xs font-sans uppercase tracking-widest text-white/70 rounded-full transition-colors duration-200 hover:text-white hover:bg-white/10"
            >
              {link}
            </a>
          ))}
        </div>

        {/* CTA */}
        <a
          href="#"
          className="flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-xs uppercase tracking-widest text-white transition-all duration-200 hover:bg-white/15"
          style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(8px)" }}
        >
          GET STARTED
          <span className="text-[10px]">▶</span>
        </a>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen w-full overflow-hidden">
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
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Hero Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50 mb-4 font-sans">
            AI-Powered News Automation
          </p>
          <h1
            className="text-[80px] xl:text-[110px] leading-none text-white uppercase overflow-hidden"
            style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.01em" }}
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
            <a
              href="#"
              className="flex items-center gap-3 rounded-full border border-white/40 px-8 py-3 text-sm uppercase tracking-widest text-white transition-all duration-200 hover:bg-white/10 font-sans"
            >
              <span className="text-xs">▶</span>
              WATCH DEMO
            </a>
            <a
              href="#"
              className="flex items-center gap-2 rounded-full bg-white px-8 py-3 text-sm uppercase tracking-widest text-black font-semibold transition-all duration-200 hover:bg-white/90 font-sans"
            >
              START FREE
            </a>
          </div>
        </div>

        {/* Sidebar Thumbnail Navigation */}
        <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-10">
          {VIDEOS.map((video, i) => (
            <div
              key={i}
              className={`relative w-24 h-20 rounded-lg overflow-hidden transition-all duration-300 ${
                activeVideo === i
                  ? "opacity-100 scale-105"
                  : "opacity-40"
              }`}
              style={{
                borderLeft: activeVideo === i ? "2px solid white" : "2px solid transparent",
                boxShadow: activeVideo === i ? "0 0 0 1px rgba(255,255,255,0.3)" : "none",
              }}
            >
              <div className={`absolute inset-0 bg-gradient-to-b ${video.gradient}`} />
              <div className="absolute inset-0 flex flex-col justify-between p-1.5">
                <span className="text-[9px] font-mono text-white/60 font-sans">{video.label}</span>
                <span className="text-[7px] uppercase tracking-widest text-white/80 leading-tight font-sans">
                  {video.title}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Mute / Unmute Toggle */}
        <button
          onClick={toggleMute}
          className="absolute bottom-8 right-8 z-10 flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-widest text-white transition-all duration-200 hover:bg-white/10 font-sans"
          style={{ backdropFilter: "blur(8px)", background: "rgba(0,0,0,0.4)" }}
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

        {/* Bottom progress indicator */}
        <div className="absolute bottom-8 left-16 flex items-center gap-2">
          {VIDEOS.map((_, i) => (
            <div
              key={i}
              className={`transition-all duration-300 rounded-full ${
                activeVideo === i
                  ? "w-8 h-1 bg-white"
                  : "w-1 h-1 bg-white/30"
              }`}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
