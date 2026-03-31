import Image from "next/image";
import "./navbar.css";

const NAV_LINKS = ["CHANNELS", "FEATURES", "HOW IT WORKS", "PRICING"];

export default function Navbar() {
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
      <a
        href="#"
        className="nav-cta flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-xs uppercase tracking-widest text-white transition-all duration-200 hover:bg-white/15"
      >
        GET STARTED
        <span className="text-[10px]">▶</span>
      </a>
    </nav>
  );
}
