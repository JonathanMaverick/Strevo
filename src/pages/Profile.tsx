import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  PlayCircle,
  Users,
  Settings as SettingsIcon,
  Heart,
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { StreamHistory } from '../interfaces/stream-history';
import { getAllStreamHistory } from '../services/stream-history.service';
import Loading from './Loading';
import { useFollowing } from '../services/follow.service';
import { useUserProfile } from '../services/user-profile.service';
import { getStreamByStreamerID } from '../services/stream.service';
import { HLSVideoPlayer } from '../components/HLSVideoPlayer';
import { Stream } from '../interfaces/stream';
import DonationModal from '../components/DonationModal';

export default function Profile() {
  const { principalId } = useParams();
  const {
    stats,
    user,
    isProfileLoaded,
    isLoading,
    isOwnProfile,
    recentSubscribers,
  } = useUserProfile(principalId);
  const [streamHistory, setStreamHistory] = useState<StreamHistory[]>([]);
  const {
    isFollowing,
    handleFollow,
    handleUnfollow,
    checkFollowingStatus,
    followLoading,
    unfollowLoading,
  } = useFollowing();
  const [activeTab, setActiveTab] = useState<'videos' | 'clips'>('videos');
  const [stream, setStream] = useState<Stream | undefined>();
  const [isLive, setIsLive] = useState(false);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);

  const fetchedForId = useRef<string | null>(null);

  useEffect(() => {
    if (!principalId) return;
    if (fetchedForId.current === principalId) return;
    fetchedForId.current = principalId;

    Promise.all([
      getAllStreamHistory(principalId),
      getStreamByStreamerID(principalId),
    ]).then(([history, s]) => {
      if (history) setStreamHistory(history);
      if (s) setStream(s);
    });

    checkFollowingStatus(principalId);
  }, [principalId]);

  if (isLoading || !isProfileLoaded) return <Loading />;

  const displayName = user?.username || 'Your Name';
  const bio = user?.bio || 'Tell a world about yourself!';
  const avatarUrl =
    user?.profile_picture ||
    `data:image/svg+xml;utf8,${encodeURIComponent(avatarSvg((displayName?.[0] || 'U').toUpperCase()))}`;

  const followersVal =
    typeof stats?.followersCount === 'number'
      ? stats.followersCount >= 1000
        ? `${(stats.followersCount / 1000).toFixed(1)}K`
        : `${stats.followersCount}`
      : '—';

  const subsVal =
    typeof stats?.subscribersCount === 'number'
      ? stats.subscribersCount >= 1000
        ? `${(stats.subscribersCount / 1000).toFixed(1)}K`
        : `${stats.subscribersCount}`
      : '—';

  const followersHref = user?.principal_id
    ? `/profiles/${user.principal_id}/followers`
    : `/followers`;

  const statsCards = [
    {
      label: 'Followers',
      value: followersVal,
      icon: Users as any,
      href: followersHref,
    },
    { label: 'Donations', value: subsVal, icon: Heart as any },
  ];

  const clips = Array.from({ length: 6 }).map((_, i) => ({
    title: `Clip #${i + 1}`,
    views: '—',
    length: `0:${String((i * 7) % 59).padStart(2, '0')}`,
    color: 'from-slate-700 via-slate-800 to-black',
  }));

  const topCategories = (() => {
    const agg = new Map<string, { views: number; count: number }>();
    for (const v of streamHistory) {
      const name = v.categoryName || 'Other';
      const entry = agg.get(name) || { views: 0, count: 0 };
      entry.views += Number.isFinite(v.totalView as any)
        ? Number(v.totalView)
        : 0;
      entry.count += 1;
      agg.set(name, entry);
    }
    return Array.from(agg.entries())
      .map(([name, m]) => ({ name, views: m.views, count: m.count }))
      .sort((a, b) => b.views - a.views || b.count - a.count)
      .slice(0, 12);
  })();

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
      <main className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <section className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] overflow-visible">
          <div className="relative h-48 w-full overflow-hidden rounded-t-2xl bg-gradient-to-br from-slate-700 via-slate-800 to-black">
            <div className="absolute inset-0 bg-[radial-gradient(60rem_25rem_at_20%_20%,rgba(59,130,246,0.25),transparent)]" />
            <div className="absolute inset-0 bg-[radial-gradient(50rem_20rem_at_80%_70%,rgba(14,165,233,0.25),transparent)]" />
          </div>
          <div className="flex flex-col gap-4 px-4 pb-4 sm:px-6 sm:pb-6">
            <div className="-mt-10 flex items-end gap-4 z-[30]">
              <img
                alt="avatar"
                src={avatarUrl}
                className="h-20 w-20 rounded-2xl ring-2 ring-white/10 object-cover"
              />
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h1 className="text-xl font-semibold leading-tight">
                      {displayName}
                    </h1>
                    <p className="mt-1 text-sm text-white/70">{bio}</p>
                  </div>
                  <div className="mt-3 flex items-center gap-2 sm:mt-0">
                    {stream && (
                      <Link
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-3 py-2 text-xs font-semibold"
                        to={`/stream/${user?.principal_id}`}
                      >
                        <PlayCircle className="h-4 w-4" />
                        Watch Live
                      </Link>
                    )}

                    {!isOwnProfile && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setIsDonationModalOpen(true)}
                          className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs hover:border-white/20"
                        >
                          <Heart className="h-4 w-4" />
                          Donate
                        </button>

                        {isFollowing ? (
                          <button
                            className="rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold cursor-pointer"
                            onClick={() => handleUnfollow(principalId!)}
                            disabled={unfollowLoading}
                          >
                            Unfollow
                          </button>
                        ) : (
                          <button
                            className="rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-3 py-2 text-xs font-semibold cursor-pointer"
                            onClick={() => handleFollow(principalId!)}
                            disabled={followLoading}
                          >
                            Follow
                          </button>
                        )}
                      </div>
                    )}

                    {isOwnProfile && (
                      <Link
                        to="/settings"
                        className="rounded-xl border border-white/10 p-2 hover:border-white/20"
                        aria-label="Settings"
                      >
                        <SettingsIcon className="h-4 w-4" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-2 grid gap-3 sm:grid-cols-3">
              {statsCards.map((s, i) => {
                const Card = (
                  <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                    <s.icon className="h-4 w-4 text-white/80" />
                    <div>
                      <div className="text-sm font-semibold">{s.value}</div>
                      <div className="text-[11px] uppercase tracking-wide text-white/60">
                        {s.label}
                      </div>
                    </div>
                  </div>
                );
                return s.label === 'Followers' ? (
                  <Link
                    key={i}
                    to={s.href!}
                    className="block hover:bg-white/[0.04] rounded-xl"
                  >
                    {Card}
                  </Link>
                ) : (
                  <div key={i}>{Card}</div>
                );
              })}
            </div>
          </div>
        </section>

        {stream && (
          <section className="my-6">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase">
                  <span
                    className={`block h-2 w-2 rounded-full ${isLive ? 'animate-pulse bg-red-400' : 'bg-gray-400'}`}
                  />
                  {isLive ? 'Live Now' : 'Offline'}
                </div>
              </div>
              <HLSVideoPlayer
                setIsLive={setIsLive}
                url={`${process.env.VITE_STREAMING_SERVER_URL}/watch/${user?.principal_id}/index.m3u8`}
              />
              <div className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-semibold">{stream.title}</p>
                  <p className="text-xs text-white/60"></p>
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="mt-6 grid gap-6 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-2"
          >
            <div>
              <div className="flex gap-2 overflow-x-auto">
                {[
                  { key: 'videos', label: 'Videos' },
                  { key: 'clips', label: 'Clips' },
                ].map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setActiveTab(t.key as typeof activeTab)}
                    className={`rounded-full border px-3 py-1.5 text-xs ${
                      activeTab === (t.key as any)
                        ? 'border-white/20 bg-white/10 font-semibold'
                        : 'border-white/10 text-white/80 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="mt-4">
                {activeTab === 'videos' && (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {streamHistory
                      .sort(
                        (a, b) =>
                          new Date(b.createdAt).getTime() -
                          new Date(a.createdAt).getTime(),
                      )
                      .map((v, i) => (
                        <a
                          key={i}
                          href={`/stream-history/${v.streamHistoryID}`}
                          className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.05]"
                        >
                          <div className="relative aspect-video w-full">
                            <img
                              src={v.thumbnail}
                              alt={v.title}
                              className="absolute inset-0 h-full w-full object-cover"
                            />
                            <div className="absolute left-2 top-2 rounded-md bg-black/40 px-2 py-1 text-[10px]">
                              {v.categoryName}
                            </div>
                            <div className="absolute right-2 bottom-2 rounded-md bg-black/40 px-2 py-1 text-[10px]">
                              {new Date(v.duration * 1000)
                                .toISOString()
                                .slice(11, 19)}
                            </div>
                          </div>
                          <div className="p-3">
                            <p className="line-clamp-1 text-sm font-medium">
                              {v.title}
                            </p>
                            <p className="mt-1 text-xs text-white/60">
                              {v.totalView} views
                            </p>
                          </div>
                        </a>
                      ))}
                  </div>
                )}

                {activeTab === 'clips' && (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {clips.map((c, i) => (
                      <a
                        key={i}
                        href="#"
                        className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.05]"
                      >
                        <div
                          className={`relative aspect-video w-full bg-gradient-to-br ${c.color}`}
                        >
                          <div className="absolute right-2 bottom-2 rounded-md bg-black/40 px-2 py-1 text-[10px]">
                            {c.length}
                          </div>
                        </div>
                        <div className="p-3">
                          <p className="line-clamp-1 text-sm font-medium">
                            {c.title}
                          </p>
                          <p className="mt-1 text-xs text-white/60">
                            {c.views} views
                          </p>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="hidden lg:block"
          >
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
              <div className="px-4 py-3 text-sm font-semibold">
                Recent Donations
              </div>
              <div className="divide-y divide-white/5">
                {(recentSubscribers?.length ? recentSubscribers : []).map(
                  (s, i) => (
                    <div
                      key={s.principal_id + i}
                      className="flex items-center justify-between px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          alt={s.username}
                          src={
                            s.avatar && s.avatar.length > 0
                              ? s.avatar
                              : `data:image/svg+xml;utf8,${encodeURIComponent(avatarSvg(s.username?.[0]?.toUpperCase() || 'U'))}`
                          }
                          className="h-7 w-7 rounded-full ring-2 ring-white/10 object-cover"
                        />
                        <div className="text-sm">{s.username}</div>
                      </div>
                      <div className="text-[10px] text-white/60">Sub</div>
                    </div>
                  ),
                )}
                {!recentSubscribers?.length && (
                  <div className="px-4 py-6 text-xs text-white/60">
                    No donations yet
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
              <div className="px-4 py-3 text-sm font-semibold">
                Top Categories
              </div>
              <div className="flex flex-wrap gap-2 p-4 pt-0">
                {topCategories.length === 0 && (
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">
                    No data
                  </span>
                )}
                {topCategories.map((c) => (
                  <span
                    key={c.name}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-xs"
                  >
                    <span className="text-white/90">{c.name}</span>
                  </span>
                ))}
              </div>
            </div>
          </motion.aside>
        </section>
      </main>
      <DonationModal
        isOpen={isDonationModalOpen}
        onClose={() => setIsDonationModalOpen(false)}
        recipientPrincipalId={user?.principal_id || ''}
        recipientUsername={user?.username}
      />
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
