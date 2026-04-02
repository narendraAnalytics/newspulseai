"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { X } from "lucide-react";
import type { SelectChannel } from "@/db/schema";

interface Props {
  open: boolean;
  onClose: () => void;
  onAdded: (channel: SelectChannel) => void;
}

export default function AddChannelModal({ open, onClose, onAdded }: Props) {
  const [input, setInput] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function parseChannelId(raw: string): string {
    // Accepts: https://youtube.com/@handle, https://youtube.com/@handle/videos,
    //          https://youtube.com/channel/UCxxx, bare @handle, or bare UCxxx
    try {
      const url = new URL(raw);
      const parts = url.pathname.split("/").filter(Boolean);
      // Find @handle segment (may have /videos /about etc after it)
      const handlePart = parts.find((p) => p.startsWith("@"));
      if (handlePart) return handlePart.replace(/^@/, "");
      // /channel/UCxxx format
      const channelIdx = parts.indexOf("channel");
      if (channelIdx !== -1 && parts[channelIdx + 1]) return parts[channelIdx + 1];
      return parts[parts.length - 1].replace(/^@/, "");
    } catch {
      return raw.trim().replace(/^@/, "");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!input.trim() || !name.trim()) {
      setError("Both fields are required.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          youtubeChannelId: parseChannelId(input),
          channelName: name.trim(),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to add channel.");
        return;
      }
      const channel = await res.json();
      onAdded(channel);
      setInput("");
      setName("");
      onClose();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            className="fixed z-50 bottom-0 left-0 right-0 md:inset-0 md:flex md:items-center md:justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="pointer-events-auto w-full md:max-w-md bg-[#0a0a0a] border border-white/10 rounded-t-3xl md:rounded-2xl p-5 md:p-8"
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-heading text-2xl tracking-wider text-white">
                  ADD CHANNEL
                </h2>
                <button
                  type="button"
                  aria-label="Close modal"
                  onClick={onClose}
                  className="text-white/40 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/50 mb-1.5 font-sans">
                    Channel Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Fireship"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-emerald-400/60 transition-colors font-sans"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/50 mb-1.5 font-sans">
                    YouTube Channel URL or Handle
                  </label>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="@fireship or youtube.com/@fireship"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-emerald-400/60 transition-colors font-sans"
                  />
                </div>

                {error && (
                  <p className="text-xs text-red-400 font-sans">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-emerald-400 to-cyan-400 px-5 py-3 text-xs uppercase tracking-widest text-black font-semibold transition-all duration-200 hover:opacity-90 disabled:opacity-50 cursor-pointer mt-2"
                >
                  {loading ? "Adding…" : "Add Channel ▶"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
