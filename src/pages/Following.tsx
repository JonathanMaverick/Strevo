import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  PlayCircle,
  Radio,
  WifiOff,
  Sparkles,
  Search,
  Filter,
  ChevronDown,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Loading from './Loading';
import { useAuth } from '../contexts/auth.context';
import { useUserProfile } from '../services/user-profile.service';
import { getAllActiveStream } from '../services/stream.service';
import { getAllStreamHistory } from '../services/stream-history.service';
import { StreamHistory } from '../interfaces/stream-history';
import { Stream } from '../interfaces/stream';

type Channel = {
  principalId: string;
  name: string;
  tag: string;
  viewers?: string;
  live: boolean;
  title?: string;
  color: string;
  thumbnailURL?: string | null;
  avatar?: string | null;
  lastStreamAt?: string | null;
  lastTitle?: string | null;
};

export default function Following() {
  const { principal } = useAuth();
  const { followingList, isLoading: profileLoading } = useUserProfile(
    principal || '',
  );
  const [streams, setStreams] = useState<Stream[]>([]);
  const [loadingStreams, setLoadingStreams] = useState(true);
  const [offlineChannels, setOfflineChannels] = useState<Channel[]>([]);
  const [loadingOffline, setLoadingOffline] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'live' | 'offline' | 'recommended'
  >('live');
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<string>('All');

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingStreams(true);
      const res = await getAllActiveStream();
      if (mounted) {
        setStreams(res || []);
        setLoadingStreams(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const followingMap = useMemo(() => {
    const map = new Map<
      string,
      { username?: string | null; avatar?: string | null }
    >();
    for (const f of followingList || []) {
      const pid = (f as any).principal_id || (f as any).principalId || '';
      if (!pid) continue;
      map.set(pid, {
        username: (f as any).username ?? null,
        avatar: (f as any).profile_picture ?? (f as any).avatar ?? null,
      });
    }
    return map;
  }, [followingList]);

  const activeFollowingStreams = useMemo(
    () => streams.filter((s) => followingMap.has(s.hostPrincipalID)),
    [streams, followingMap],
  );

  const recommendedStreams = useMemo(
    () => streams.filter((s) => !followingMap.has(s.hostPrincipalID)),
    [streams, followingMap],
  );

  const liveChannels: Channel[] = useMemo(() => {
    const toChannel = (s: Stream): Channel => {
      const info = followingMap.get(s.hostPrincipalID);
      return {
        principalId: s.hostPrincipalID,
        name: displayName(info?.username, s.hostPrincipalID),
        tag: s.categoryName || 'Other',
        viewers: formatViewers(s.viewerCount),
        live:
          s.isActive === 'true' ||
          s.isActive === '1' ||
          (s.isActive as any) === true,
        title: s.title,
        color: 'from-slate-700 via-slate-800 to-black',
        thumbnailURL: s.thumbnailURL || null,
        avatar: info?.avatar ?? null,
      };
    };
    return activeFollowingStreams.map(toChannel);
  }, [activeFollowingStreams, followingMap]);

  useEffect(() => {
    let mounted = true;
    const loadOffline = async () => {
      setLoadingOffline(true);
      const liveSet = new Set(
        activeFollowingStreams.map((s) => s.hostPrincipalID),
      );
      const offlinePids: string[] = [];
      for (const pid of followingMap.keys()) {
        if (!liveSet.has(pid)) offlinePids.push(pid);
      }
      const results = await Promise.all(
        offlinePids.map(async (pid) => {
          const h: StreamHistory[] | undefined = await getAllStreamHistory(pid);
          const latest =
            Array.isArray(h) && h.length > 0
              ? [...h].sort((a, b) => toTs(b.createdAt) - toTs(a.createdAt))[0]
              : undefined;
          const info = followingMap.get(pid);
          const name = displayName(info?.username, pid);
          return {
            principalId: pid,
            name,
            tag: latest?.categoryName || '—',
            live: false,
            color: 'from-slate-700 via-slate-800 to-black',
            avatar: info?.avatar ?? null,
            lastStreamAt: latest?.createdAt ?? null,
            lastTitle: latest?.title ?? null,
          } as Channel;
        }),
      );
      if (mounted) {
        setOfflineChannels(results);
        setLoadingOffline(false);
      }
    };
    loadOffline();
    return () => {
      mounted = false;
    };
  }, [activeFollowingStreams, followingMap]);

  const recChannels: Channel[] = useMemo(() => {
    const toChannel = (s: Stream): Channel => {
      return {
        principalId: s.hostPrincipalID,
        name: displayName(null, s.hostPrincipalID),
        tag: s.categoryName || 'Other',
        viewers: formatViewers(s.viewerCount),
        live:
          s.isActive === 'true' ||
          s.isActive === '1' ||
          (s.isActive as any) === true,
        title: s.title,
        color: 'from-slate-700 via-slate-800 to-black',
        thumbnailURL: s.thumbnailURL || null,
        avatar: null,
      };
    };
    return recommendedStreams.map(toChannel);
  }, [recommendedStreams]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    set.add('All');
    streams.forEach((s) => s.categoryName && set.add(s.categoryName));
    offlineChannels.forEach((c) => c.tag && set.add(c.tag));
    return Array.from(set);
  }, [streams, offlineChannels]);

  const filteredLive = useMemo(
    () =>
      liveChannels.filter(
        (c) =>
          (filter === 'All' || c.tag === filter) &&
          `${c.name} ${c.title ?? ''} ${c.tag}`
            .toLowerCase()
            .includes(q.toLowerCase()),
      ),
    [liveChannels, q, filter],
  );

  const filteredOffline = useMemo(
    () =>
      offlineChannels.filter(
        (c) =>
          (filter === 'All' || c.tag === filter) &&
          `${c.name} ${c.lastTitle ?? ''} ${c.tag}`
            .toLowerCase()
            .includes(q.toLowerCase()),
      ),
    [offlineChannels, q, filter],
  );

  const filteredRec = useMemo(
    () =>
      recChannels.filter(
        (c) =>
          (filter === 'All' || c.tag === filter) &&
          `${c.name} ${c.title ?? ''} ${c.tag}`
            .toLowerCase()
            .includes(q.toLowerCase()),
      ),
    [recChannels, q, filter],
  );

  const tabCounts = {
    live: filteredLive.length,
    offline: filteredOffline.length,
    recommended: filteredRec.length,
  };

  const loading = profileLoading || loadingStreams || loadingOffline;

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

      <main className="relative mx-auto max-w-7xl px-4 sm:px-6 py-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold">Following</h1>
            <p className="text-sm text-white/70">
              Channels you follow across categories
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search followed channels"
                className="w-64 rounded-xl border border-white/10 bg-white/5 pl-9 pr-3 py-2 text-sm outline-none placeholder:text-white/40"
              />
            </div>
            {/* <button className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs hover:border-white/20">
              <Filter className="h-4 w-4" />
              Filters
              <ChevronDown className="h-3.5 w-3.5" />
            </button> */}
          </div>
        </header>

        <div className="mt-4 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`rounded-full border px-3 py-1.5 text-xs whitespace-nowrap ${
                filter === c
                  ? 'border-white/20 bg-white/10 font-semibold'
                  : 'border-white/10 text-white/80 hover:border-white/20 hover:text-white'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="mt-6 flex gap-2 overflow-x-auto">
          {[
            { k: 'live', label: 'Live', icon: Radio },
            { k: 'offline', label: 'Offline', icon: WifiOff },
            { k: 'recommended', label: 'Recommended', icon: Sparkles },
          ].map((t) => (
            <button
              key={t.k}
              onClick={() => setActiveTab(t.k as typeof activeTab)}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${
                activeTab === t.k
                  ? 'border-white/20 bg-white/10 font-semibold'
                  : 'border-white/10 text-white/80 hover:border-white/20 hover:text-white'
              }`}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
              <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px]">
                {tabCounts[t.k as keyof typeof tabCounts]}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="mt-6">
            <Loading />
          </div>
        ) : (
          <section className="mt-4">
            {activeTab === 'live' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              >
                {filteredLive.length === 0 && (
                  <EmptyState
                    icon={Radio}
                    title="No live channels"
                    subtitle="Your followed channels aren’t live right now."
                  />
                )}
                {filteredLive.map((c) => (
                  <ChannelLiveCard key={c.principalId} c={c} />
                ))}
              </motion.div>
            )}

            {activeTab === 'offline' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
              >
                {filteredOffline.length === 0 && (
                  <EmptyState
                    icon={WifiOff}
                    title="No offline channels"
                    subtitle="Try adjusting your filters."
                  />
                )}
                {filteredOffline.map((c) => (
                  <ChannelOfflineCard key={c.principalId} c={c} />
                ))}
              </motion.div>
            )}

            {activeTab === 'recommended' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
              >
                {filteredRec.length === 0 && (
                  <EmptyState
                    icon={Sparkles}
                    title="No recommendations"
                    subtitle="We’ll refresh this list soon."
                  />
                )}
                {filteredRec.map((c) =>
                  c.live ? (
                    <ChannelLiveCard key={c.principalId} c={c} />
                  ) : (
                    <ChannelOfflineCard key={c.principalId} c={c} />
                  ),
                )}
              </motion.div>
            )}
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}

function ChannelLiveCard({ c }: { c: Channel }) {
  return (
    <a
      href={`/stream/${c.principalId}`}
      className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.05]"
    >
      <div
        className={`relative aspect-video w-full bg-gradient-to-br ${c.color}`}
      >
        {c.thumbnailURL ? (
          <img
            src={c.thumbnailURL}
            alt={c.title || c.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}
        <div className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-md bg-black/40 px-2 py-1 text-[10px] font-semibold uppercase">
          <span className="block h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" />
          Live
        </div>
        <div className="absolute right-2 top-2 rounded-md bg-black/40 px-2 py-1 text-[10px]">
          {c.tag}
        </div>
        <div className="absolute bottom-2 left-2 rounded-md bg-black/40 px-2 py-1 text-[10px]">
          {c.viewers} watching
        </div>
      </div>
      <div className="flex items-center gap-3 p-3">
        <img
          alt="avatar"
          src={
            c.avatar ||
            `data:image/svg+xml;utf8,${encodeURIComponent(avatarSvg((c.name?.[0] || 'U').toUpperCase()))}`
          }
          className="h-8 w-8 rounded-full ring-2 ring-white/10 object-cover"
        />
        <div className="min-w-0">
          <p className="line-clamp-1 text-sm font-semibold">{c.name}</p>
          <p className="line-clamp-1 text-xs text-white/60">{c.title}</p>
        </div>
        <div className="ml-auto">
          <button className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold hover:bg-white/15">
            <PlayCircle className="h-4 w-4" />
            Watch
          </button>
        </div>
      </div>
    </a>
  );
}

function ChannelOfflineCard({ c }: { c: Channel }) {
  return (
    <a
      href={`/profile/${c.principalId}`}
      className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.05]"
    >
      <div
        className={`relative aspect-video w-full bg-gradient-to-br ${c.color}`}
      >
        <div className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-md bg-black/30 px-2 py-1 text-[10px] font-semibold uppercase">
          <span className="block h-1.5 w-1.5 rounded-full bg-white/30" />
          Offline
        </div>
        <div className="absolute right-2 top-2 rounded-md bg-black/30 px-2 py-1 text-[10px]">
          {c.tag}
        </div>
      </div>
      <div className="flex items-center gap-3 p-3">
        <img
          alt="avatar"
          src={
            c.avatar ||
            `data:image/svg+xml;utf8,${encodeURIComponent(avatarSvg((c.name?.[0] || 'U').toUpperCase()))}`
          }
          className="h-8 w-8 rounded-full ring-2 ring-white/10 object-cover"
        />
        <div className="min-w-0">
          <p className="line-clamp-1 text-sm font-medium">{c.name}</p>
          <p className="text-[11px] text-white/60">
            {c.lastTitle ? `${c.lastTitle} • ` : ''}
            {c.lastStreamAt ? timeAgo(c.lastStreamAt) : 'No recent streams'}
          </p>
        </div>
        {/* <div className="ml-auto">
          <button className="rounded-xl border border-white/10 px-3 py-2 text-xs hover:border-white/20">
            Notify
          </button>
        </div> */}
      </div>
    </a>
  );
}

function EmptyState({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-16 text-center">
      <Icon className="h-6 w-6 text-white/70" />
      <p className="mt-2 text-sm font-semibold">{title}</p>
      <p className="mt-1 text-xs text-white/60">{subtitle}</p>
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

function displayName(username?: string | null, principalId?: string) {
  if (username && username.trim().length > 0) return username;
  if (!principalId) return 'Unknown';
  const short =
    principalId.length > 10
      ? `${principalId.slice(0, 6)}…${principalId.slice(-4)}`
      : principalId;
  return short;
}

function formatViewers(n?: number) {
  if (n === undefined || n === null) return '0';
  if (n < 1000) return `${n}`;
  if (n < 1000000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K`;
  return `${(n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 1)}M`;
}

function toTs(d: string) {
  const t = Date.parse(d);
  return Number.isNaN(t) ? 0 : t;
}

function timeAgo(iso: string) {
  const ts = toTs(iso);
  if (!ts) return 'unknown';
  const s = Math.max(1, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `${mo}mo ago`;
  const y = Math.floor(mo / 12);
  return `${y}y ago`;
}
