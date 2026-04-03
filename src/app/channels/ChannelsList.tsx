"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Trash2, PlayCircle, Plus } from "lucide-react";
import type { SelectChannel } from "@/db/schema";
import AddChannelModal from "./AddChannelModal";

interface Props {
  initialChannels: SelectChannel[];
  userId: string;
}

export default function ChannelsList({ initialChannels }: Props) {
  const [channelList, setChannelList] = useState<SelectChannel[]>(initialChannels);
  const [modalOpen, setModalOpen] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);

  async function handleRemove(id: number) {
    setRemovingId(id);
    await fetch(`/api/channels?id=${id}`, { method: "DELETE" });
    setChannelList((prev) => prev.filter((c) => c.id !== id));
    setRemovingId(null);
  }

  return (
    <>
      {/* Background glows */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-32 -left-32 w-150 h-150 rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute top-1/2 -right-40 w-125 h-125 rounded-full bg-cyan-500/8 blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 w-100 h-100 rounded-full bg-emerald-600/6 blur-[100px]" />
      </div>

      <div className="relative z-10 min-h-screen pt-24 md:pt-28 pb-12 md:pb-16 px-4 md:px-6">
        <div className="max-w-5xl mx-auto">
          {/* Page header */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col gap-4 sm:flex-row sm:items-end justify-between mb-10"
          >
            <div>
              <h1 className="font-heading text-5xl md:text-7xl tracking-wider leading-none bg-linear-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                YOUR CHANNELS
              </h1>
              <p className="mt-2 text-sm text-white/50 font-sans uppercase tracking-widest">
                {channelList.length === 0
                  ? "No channels yet"
                  : `${channelList.length} channel${channelList.length !== 1 ? "s" : ""} tracked`}
              </p>
            </div>

            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 rounded-full bg-linear-to-r from-emerald-400 to-cyan-400 px-5 py-2.5 text-xs uppercase tracking-widest text-black font-semibold transition-all duration-200 hover:opacity-90 cursor-pointer shrink-0"
            >
              <Plus size={14} strokeWidth={2.5} />
              Add Channel
            </motion.button>
          </motion.div>

          {/* Divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            style={{ originX: 0 }}
            className="h-px bg-white/10 mb-10"
          />

          {/* Empty state */}
          {channelList.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col items-center justify-center py-24 text-center"
            >
              <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center mb-5">
                <PlayCircle size={28} className="text-white/30" />
              </div>
              <p className="font-heading text-2xl tracking-wider text-white/40 mb-2">
                NO CHANNELS YET
              </p>
              <p className="text-sm text-white/30 font-sans mb-6">
                Add a YouTube channel to start receiving AI-written summaries.
              </p>
              <button
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-xs uppercase tracking-widest text-white/60 font-sans hover:border-white/30 hover:text-white transition-colors cursor-pointer"
              >
                <Plus size={13} />
                Add your first channel
              </button>
            </motion.div>
          )}

          {/* Channel grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {channelList.map((ch, i) => (
                <motion.div
                  key={ch.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.07, duration: 0.4, ease: "easeOut" }}
                  className="group relative rounded-2xl border border-white/10 bg-white/3 p-5 hover:border-white/20 hover:bg-white/5 transition-colors"
                >
                  {/* YouTube icon accent */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                        <PlayCircle size={18} className="text-emerald-400" />
                      </div>
                      <span className="font-heading text-2xl tracking-wider text-white/20">
                        #{i + 1}
                      </span>
                    </div>
                    <button
                      type="button"
                      aria-label="Remove channel"
                      onClick={() => handleRemove(ch.id)}
                      disabled={removingId === ch.id}
                      className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-red-400 transition-all duration-200 cursor-pointer disabled:opacity-30"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  {/* Channel name */}
                  <p className="font-heading text-xl tracking-wider text-white leading-tight mb-2">
                    {ch.channelName}
                  </p>

                  {/* Channel ID badge */}
                  <span className="inline-block px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase tracking-widest text-white/40 font-sans">
                    @{ch.youtubeChannelId}
                  </span>

                  {/* Date */}
                  <p className="mt-3 text-[10px] text-white/25 font-sans">
                    Added {new Date(ch.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AddChannelModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdded={(ch) => setChannelList((prev) => [...prev, ch])}
      />
    </>
  );
}
