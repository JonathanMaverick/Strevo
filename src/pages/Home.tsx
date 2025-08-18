import React, { FormEvent, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { SocketMessageType } from '../enums/socket-message-type';
import { ChatMessage } from '../interfaces/chat-message';
import { SocketMessage } from '../interfaces/socket-message';

export default function Home() {
  const socketRef = useRef<WebSocket>(null!);
  const messageInputRef = useRef<HTMLInputElement>(null!);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const categories = [
    'All',
    'FPS',
    'MOBA',
    'Just Chatting',
    'IRL',
    'Music',
    'Dev',
    'Sports',
    'Speedrun',
  ];

  const liveCards = [
    {
      tag: 'FPS',
      title: 'Rank grind to Immortal — road to #1',
      streamer: 'NovaSpectre',
      viewers: '12.4K',
      color: 'from-slate-700 via-slate-800 to-black',
    },
    {
      tag: 'IRL',
      title: 'Street food tour — Jakarta night market',
      streamer: 'SalsaIRL',
      viewers: '3.1K',
      color: 'from-slate-700 via-slate-800 to-black',
    },
    {
      tag: 'Music',
      title: 'Lofi making session — chat picks samples',
      streamer: 'beatlab',
      viewers: '5.6K',
      color: 'from-slate-700 via-slate-800 to-black',
    },
    {
      tag: 'Dev',
      title: 'Building an on-chain tip jar with ICP',
      streamer: 'stacksmith',
      viewers: '1.2K',
      color: 'from-slate-700 via-slate-800 to-black',
    },
    {
      tag: 'MOBA',
      title: 'Road to Mythic — 10 win streak?',
      streamer: 'Winaaa',
      viewers: '8.2K',
      color: 'from-slate-700 via-slate-800 to-black',
    },
    {
      tag: 'Just Chatting',
      title: 'Unboxing gear + Q&A',
      streamer: 'cozyroom',
      viewers: '2.7K',
      color: 'from-slate-700 via-slate-800 to-black',
    },
    {
      tag: 'Sports',
      title: 'Live watch party — finals',
      streamer: 'sidelines',
      viewers: '4.3K',
      color: 'from-slate-700 via-slate-800 to-black',
    },
    {
      tag: 'Speedrun',
      title: 'Any% PB attempts',
      streamer: 'glitchrush',
      viewers: '1.9K',
      color: 'from-slate-700 via-slate-800 to-black',
    },
  ];

  const handleIncomingMessage = (data: ChatMessage) => {
    setChatMessages((prev) => [...prev, data]);
  };

  const handleSendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const content = messageInputRef.current.value.trim();
    if (content.length === 0) return;

    const payload: SocketMessage<ChatMessage> = {
      type: SocketMessageType.ChatMessage,
      data: {
        userId: 'nigg',
        streamId: 'test',
        content,
      },
    };

    socketRef.current.send(JSON.stringify(payload));
    messageInputRef.current.value = '';
  };

  useEffect(() => {
    socketRef.current = new WebSocket(
      `ws://${process.env.VITE_BACKEND_HOST}:${process.env.VITE_BACKEND_PORT}/api/v1/chats/ws/aasd`,
    );
    socketRef.current.onmessage = (event) => {
      const message: SocketMessage<ChatMessage> = JSON.parse(event.data);
      switch (message.type) {
        case SocketMessageType.ChatMessage:
          handleIncomingMessage(message.data);
          break;
      }
    };

    return () => {
      socketRef.current.close();
    };
  }, []);

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
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {categories.map((c) => (
            <button
              key={c}
              className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/80 hover:text-white hover:border-white/20 whitespace-nowrap"
            >
              {c}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-2"
          >
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              <div className="aspect-video w-full overflow-hidden rounded-xl bg-gradient-to-br from-slate-700 via-slate-800 to-black">
                <div className="flex h-full items-end justify-between p-4">
                  <div className="space-y-2">
                    <span className="inline-flex items-center gap-2 rounded-lg bg-white/15 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider">
                      <span className="block h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" />{' '}
                      Live Now
                    </span>
                    <p className="text-sm font-semibold">
                      Pro scrims — finals practice
                    </p>
                    <p className="text-xs text-white/70">
                      NovaSpectre • 12.4K watching • FPS
                    </p>
                  </div>
                  <div className="rounded-lg bg-black/30 px-2 py-1 text-[10px]">
                    1080p • 60fps
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <img
                    alt="avatar"
                    src={`data:image/svg+xml;utf8,${encodeURIComponent(avatarSvg('N'))}`}
                    className="h-8 w-8 rounded-full ring-2 ring-white/10"
                  />
                  <div>
                    <div className="text-sm font-medium">NovaSpectre</div>
                    <div className="text-xs text-white/60">
                      Followed by 340K
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold hover:bg-white/15">
                    Follow
                  </button>
                  <button className="rounded-xl border border-white/10 px-3 py-2 text-xs hover:border-white/20">
                    Share
                  </button>
                </div>
              </div>
            </div>

            <h3 className="mt-6 text-sm font-semibold text-white/80">
              Recommended
            </h3>
            <div className="mt-3 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {liveCards.slice(0, 6).map((c, i) => (
                <a
                  key={i}
                  href="#"
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.05]"
                >
                  <div
                    className={`relative aspect-video w-full bg-gradient-to-br ${c.color}`}
                  >
                    <div className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-md bg-black/40 px-2 py-1 text-[10px] font-semibold uppercase">
                      <span className="block h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" />{' '}
                      Live
                    </div>
                    <div className="absolute right-2 top-2 rounded-md bg-black/40 px-2 py-1 text-[10px]">
                      {c.tag}
                    </div>
                    <div className="absolute bottom-2 left-2 rounded-md bg-black/40 px-2 py-1 text-[10px]">
                      {c.viewers} watching
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="line-clamp-1 text-sm font-medium">
                      {c.title}
                    </p>
                    <p className="mt-1 text-xs text-white/60">{c.streamer}</p>
                  </div>
                </a>
              ))}
            </div>
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="hidden lg:block"
          >
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  <img
                    alt="avatar"
                    src={`data:image/svg+xml;utf8,${encodeURIComponent(avatarSvg('N'))}`}
                    className="h-6 w-6 rounded-full ring-2 ring-white/10"
                  />
                  <div className="text-sm font-medium">Chat</div>
                </div>
                <div className="text-[10px] text-white/60">Live</div>
              </div>
              <div className="h-[26rem] space-y-3 overflow-y-auto px-4 pb-4">
                {
                  /*[
                  { name: 'modbot', msg: 'Welcome to the stream! Be kind.' },
                  { name: 'aimtrain', msg: 'let’s gooo' },
                  { name: 'clutchguy', msg: 'that headshot was clean' },
                  { name: 'salsa', msg: 'drop your sens?' },
                  { name: 'beatlab', msg: 'queue next match?' },
                  { name: 'nova', msg: 'eco round, play safe' },
                ]*/
                  chatMessages.map((m, i) => (
                    <div key={i} className="text-xs">
                      <span className="text-white/60">{m.userId}:</span>{' '}
                      <span className="text-white/90">{m.content}</span>
                    </div>
                  ))
                }
              </div>
              <form onSubmit={handleSendMessage}>
                <div className="flex items-center gap-2 border-t border-white/10 p-3">
                  <input
                    ref={messageInputRef}
                    placeholder="Send a message"
                    className="w-full rounded-lg bg-white/5 px-3 py-2 text-xs outline-none placeholder:text-white/40"
                  />
                  <button className="rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 px-3 py-2 text-xs font-semibold">
                    Send
                  </button>
                </div>
              </form>
            </div>

            <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
              <div className="px-4 py-3 text-sm font-semibold">
                Top channels
              </div>
              <div className="divide-y divide-white/5">
                {[
                  'NovaSpectre',
                  'SalsaIRL',
                  'beatlab',
                  'stacksmith',
                  'Winaaa',
                  'cozyroom',
                ].map((n, i) => (
                  <a
                    key={i}
                    href="#"
                    className="flex items-center justify-between px-4 py-3 hover:bg-white/[0.04]"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        alt="avatar"
                        src={`data:image/svg+xml;utf8,${encodeURIComponent(
                          avatarSvg(n[0].toUpperCase()),
                        )}`}
                        className="h-7 w-7 rounded-full ring-2 ring-white/10"
                      />
                      <div>
                        <div className="text-sm">{n}</div>
                        <div className="text-[10px] text-white/60">
                          Live now
                        </div>
                      </div>
                    </div>
                    <div className="text:[10px] text-white/60">Follow</div>
                  </a>
                ))}
              </div>
            </div>
          </motion.aside>
        </div>

        <h2 className="mt-10 text-xl font-semibold">Trending</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {liveCards.map((c, i) => (
            <a
              key={i}
              href="#"
              className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.05]"
            >
              <div
                className={`relative aspect-video w-full bg-gradient-to-br ${c.color}`}
              >
                <div className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-md bg-black/40 px-2 py-1 text-[10px] font-semibold uppercase">
                  <span className="block h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" />{' '}
                  Live
                </div>
                <div className="absolute right-2 top-2 rounded-md bg-black/40 px-2 py-1 text-[10px]">
                  {c.tag}
                </div>
                <div className="absolute bottom-2 left-2 rounded-md bg-black/40 px-2 py-1 text-[10px]">
                  {c.viewers} watching
                </div>
              </div>
              <div className="p-3">
                <p className="line-clamp-1 text-sm font-medium">{c.title}</p>
                <p className="mt-1 text-xs text-white/60">{c.streamer}</p>
              </div>
            </a>
          ))}
        </div>

        <h2 className="mt-10 text-xl font-semibold">Just Chatting</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {liveCards
            .concat(liveCards)
            .slice(0, 12)
            .map((c, i) => (
              <a
                key={i}
                href="#"
                className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.05]"
              >
                <div
                  className={`relative aspect-[4/5] w-full bg-gradient-to-br ${c.color}`}
                ></div>
                <div className="p-3">
                  <p className="line-clamp-1 text-sm font-medium">{c.title}</p>
                  <p className="mt-1 text-xs text-white/60">{c.streamer}</p>
                </div>
              </a>
            ))}
        </div>

        <h2 className="mt-10 text-xl font-semibold">Esports</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-3"
            >
              <div className="aspect-video w-full overflow-hidden rounded-xl bg-gradient-to-br from-slate-700 via-slate-800 to-black"></div>
              <div className="mt-3 flex items-center justify-between">
                <div className="text-sm font-medium">
                  Championship Stage — Match {i + 1}
                </div>
                <div className="text-[10px] text-white/60">Live</div>
              </div>
            </div>
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
