"use client";

import Image from "next/image";
import { Show, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import "./navbar.css";

const NAV_LINKS = ["CHANNELS", "FEATURES", "HOW IT WORKS", "PRICING"];

export default function Navbar() {
  const { user } = useUser();

  return (
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
        className="nav-pill hidden md:flex items-center gap-1 rounded-full border border-white/15 px-3 py-2"
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
      <Show when="signed-out">
        <SignUpButton mode="modal">
          <button className="flex items-center gap-2 rounded-full bg-linear-to-r from-emerald-400 to-cyan-400 px-5 py-2.5 text-xs uppercase tracking-widest text-black font-semibold transition-all duration-200 hover:opacity-90 cursor-pointer">
            GET STARTED
            <span className="text-[10px]">▶</span>
          </button>
        </SignUpButton>
      </Show>
      <Show when="signed-in">
        <div className="flex items-center gap-3">
          <span className="text-sm text-white/80 font-sans">
            Welcome, {user?.firstName ?? user?.username ?? "User"}
          </span>
          <UserButton />
        </div>
      </Show>
    </nav>
  );
}
