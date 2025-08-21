import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Stream } from '../interfaces/stream';
import { getAllActiveStream } from '../services/stream.service';
import { StreamVideoCard } from '../components/StreamVideoCard';
import { HLSVideoPlayer } from '../components/HLSVideoPlayer';
import { User } from 'lucide-react';

function formatViewerCount(count: number) {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return `${count}`;
}

export default function Home() {
  const [activeStreams, setActiveStreams] = useState<Stream[]>([]);

  useEffect(() => {
    getAllActiveStream().then((streams) => {
      if (streams) setActiveStreams(streams);
    });
  }, []);

  const sortedStreams = [...activeStreams].sort(
    (a, b) => b.viewerCount - a.viewerCount,
  );
  const topStream = sortedStreams[0];

  const recommendedStreams = Object.values(
    sortedStreams.reduce((acc: Record<string, Stream>, stream) => {
      if (
        !acc[stream.categoryName] ||
        acc[stream.categoryName].viewerCount < stream.viewerCount
      ) {
        acc[stream.categoryName] = stream;
      }
      return acc;
    }, {}),
  );

  return (
    <div className="min-h-screen bg-[#0A0E17] text-white">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-gradient-to-tr from-blue-600/30 via-sky-500/20 to-cyan-400/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-[28rem] w-[28rem] rounded-full bg-gradient-to-tr from-indigo-600/25 via-blue-600/20 to-sky-400/10 blur-[100px]" />
      </div>

      <Navbar />

      <section className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {topStream && (
          <div className="grid gap-6 lg:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="lg:col-span-2 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
            >
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase">
                    <span className="block h-2 w-2 rounded-full animate-pulse bg-red-400" />
                    Live Now
                  </div>
                  <div className="flex items-center gap-1 text-xs text-white/70">
                    <User className="h-3 w-3" />
                    <span className="font-medium">
                      {formatViewerCount(topStream.viewerCount)} watching
                    </span>
                  </div>
                </div>
                <div className="text-[11px] text-white/60">
                  {topStream.categoryName}
                </div>
              </div>
              <HLSVideoPlayer
                setIsLive={() => {}}
                url={`${process.env.VITE_STREAMING_SERVER_URL}/watch/${topStream.hostPrincipalID}/index.m3u8`}
              />
              <div className="border-t border-white/10 px-4 py-3">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <p className="line-clamp-1 text-sm font-semibold">
                      {topStream.title}
                    </p>
                    <p className="mt-1 text-xs text-white/60">
                      {topStream.hostPrincipalID}
                    </p>
                  </div>
                  <div className="rounded-md bg-white/5 px-2 py-1 text-[10px]">
                    1080p • 60fps
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.aside
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.05 }}
            >
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
                <div className="px-4 py-3 text-sm font-semibold">
                  Top channels
                </div>
                <div className="divide-y divide-white/5">
                  {sortedStreams.slice(0, 6).map((stream) => (
                    <a
                      key={stream.streamId}
                      href="#"
                      className="flex items-center justify-between px-4 py-3 hover:bg-white/[0.04]"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          alt="avatar"
                          src={`data:image/svg+xml;utf8,${encodeURIComponent(
                            avatarSvg(
                              stream.hostPrincipalID[0]?.toUpperCase() || 'U',
                            ),
                          )}`}
                          className="h-7 w-7 rounded-full ring-2 ring-white/10"
                        />
                        <div>
                          <div className="text-sm">
                            {stream.hostPrincipalID}
                          </div>
                          <div className="text-[10px] text-white/60">
                            Live now • {formatViewerCount(stream.viewerCount)}
                          </div>
                        </div>
                      </div>
                      <div className="text-[10px] text-white/60">
                        {stream.categoryName}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </motion.aside>
          </div>
        )}
        {/* 
        <h2 className="mt-10 text-xl font-semibold">Trending</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {sortedStreams.map((stream) => (
            <StreamVideoCard key={stream.streamId} stream={stream} />
          ))}
        </div> */}

        <h2 className="mt-10 text-xl font-semibold">Recommended</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {recommendedStreams.map((stream) => (
            <StreamVideoCard key={stream.streamId} stream={stream} />
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}

function avatarSvg(letter: string) {
  return `
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#0EA5E9"/>
        <stop offset="100%" stop-color="#2563EB"/>
      </linearGradient>
      <filter id="blur" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="2"/>
      </filter>
    </defs>
    <rect width="64" height="64" rx="14" fill="url(#g)"/>
    <circle cx="18" cy="14" r="6" fill="#ffffff30" filter="url(#blur)"/>
    <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="28" font-family="Inter, system-ui" fill="white">${letter}</text>
  </svg>`;
}
