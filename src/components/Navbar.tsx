"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Show, SignUpButton, UserButton, useAuth, useUser } from "@clerk/nextjs";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import "./navbar.css";

const NAV_LINKS = [
  { label: "CHANNELS", href: "/channels" },
  { label: "FEATURES",  href: "/features" },
  { label: "ABOUT", href: "/about" },
  { label: "PRICING",   href: "/pricing" },
];

const PLAN_BADGE: Record<string, {
  label: string;
  pill: string;
  dot: string;
  glow: string;
}> = {
  pro:  {
    label: "PRO",
    pill: "border-violet-400/50 text-violet-300",
    dot:  "bg-violet-400",
    glow: "0 0 10px 3px rgba(167,139,250,0.45)",
  },
  plus: {
    label: "PLUS",
    pill: "border-emerald-400/50 text-emerald-300",
    dot:  "bg-emerald-400",
    glow: "0 0 10px 3px rgba(52,211,153,0.45)",
  },
  free: {
    label: "FREE",
    pill: "border-amber-400/50 text-amber-400",
    dot:  "bg-amber-400",
    glow: "0 0 10px 3px rgba(251,191,36,0.45)",
  },
};

export default function Navbar() {
  const { user } = useUser();
  const { has, isSignedIn } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const plan = isSignedIn
    ? has?.({ plan: "pro" })  ? "pro"
    : has?.({ plan: "plus" }) ? "plus"
    : "free"
    : null;

  const badge = plan ? PLAN_BADGE[plan] : null;

  return (
    <>
      <nav className="fixed top-4 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-6">

        {/* Logo + animated plan badge */}
        <div className="flex items-center gap-3">
          <Link href="/">
            <Image
              src="/images/logo.png"
              alt="NewsPulseAI"
              width={140}
              height={40}
              className="object-contain w-[110px] md:w-[140px]"
              style={{ height: "auto" }}
              priority
            />
          </Link>

          <AnimatePresence>
            {badge && (
              <motion.span
                key={plan}
                initial={{ opacity: 0, scale: 0.6, x: -12 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  x: 0,
                  boxShadow: [
                    "0 0 0px 0px rgba(0,0,0,0)",
                    badge.glow,
                    "0 0 0px 0px rgba(0,0,0,0)",
                  ],
                }}
                exit={{ opacity: 0, scale: 0.6, x: -12 }}
                transition={{
                  opacity:    { type: "spring", stiffness: 400, damping: 25 },
                  scale:      { type: "spring", stiffness: 400, damping: 25 },
                  x:          { type: "spring", stiffness: 400, damping: 25 },
                  boxShadow:  { duration: 2, repeat: Infinity, ease: "easeInOut" },
                }}
                className={`inline-flex items-center gap-1.5 rounded-full border bg-white/5 px-2.5 py-1 text-[10px] font-semibold tracking-widest font-sans cursor-default ${badge.pill}`}
              >
                {/* Pulsing dot */}
                <span className="relative flex h-1.5 w-1.5 shrink-0">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-70 ${badge.dot}`} />
                  <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${badge.dot}`} />
                </span>
                {badge.label}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Pill Nav — desktop only */}
        <div className="nav-pill hidden md:flex items-center gap-1 rounded-full border border-white/15 px-3 py-2">
          {NAV_LINKS.map((link) => {
            const isActive = link.href.startsWith("/") && pathname.startsWith(link.href);
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`relative px-4 py-1.5 text-xs font-sans uppercase tracking-widest rounded-full transition-colors duration-200 hover:bg-white/10 ${
                  isActive ? "text-emerald-400" : "text-white/70 hover:text-white"
                }`}
              >
                {link.label}
                {isActive && (
                  <motion.span
                    layoutId="nav-indicator"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-400"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right side — auth controls only */}
        <div className="flex items-center gap-2">
          <Show when="signed-out">
            <SignUpButton mode="modal">
              <button className="hidden sm:flex items-center gap-2 rounded-full bg-linear-to-r from-emerald-400 to-cyan-400 px-5 py-2.5 text-xs uppercase tracking-widest text-black font-semibold transition-all duration-200 hover:opacity-90 cursor-pointer">
                GET STARTED
                <span className="text-[10px]">▶</span>
              </button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <div className="hidden sm:flex items-center gap-2.5">
              <span className="text-sm text-white/80 font-sans">
                Welcome, {user?.firstName ?? user?.username ?? "User"}
              </span>
              <UserButton />
            </div>
            <div className="sm:hidden">
              <UserButton />
            </div>
          </Show>

          {/* Hamburger — mobile only */}
          <button
            className="md:hidden text-white/70 hover:text-white transition-colors p-1"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 left-4 right-4 z-40 rounded-2xl border border-white/15 bg-black/90 backdrop-blur-xl p-4 md:hidden"
          >
            <div className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => {
                const isActive = link.href.startsWith("/") && pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`px-4 py-3 text-xs font-sans uppercase tracking-widest rounded-xl transition-colors duration-200 ${
                      isActive
                        ? "text-emerald-400 bg-white/5"
                        : "text-white/70 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <Show when="signed-out">
                <SignUpButton mode="modal">
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="mt-2 w-full flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-emerald-400 to-cyan-400 px-5 py-3 text-xs uppercase tracking-widest text-black font-semibold transition-all duration-200 hover:opacity-90 cursor-pointer"
                  >
                    GET STARTED
                    <span className="text-[10px]">▶</span>
                  </button>
                </SignUpButton>
              </Show>
              <Show when="signed-in">
                <div className="mt-2 flex items-center gap-3 px-4 py-2">
                  <span className="text-sm text-white/80 font-sans">
                    Welcome, {user?.firstName ?? user?.username ?? "User"}
                  </span>
                  <UserButton />
                </div>
              </Show>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
