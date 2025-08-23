import React, { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Send, X, DollarSign, User as UserIcon, Heart } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChatMessage } from '../interfaces/chat-message';
import { useAuth } from '../contexts/auth.context';
import { HLSVideoPlayer } from '../components/HLSVideoPlayer';
import { useUserProfile } from '../services/user-profile.service';
import { useFollowing } from '../services/follow.service';
import Loading from './Loading';
import { StreamHistory } from '../interfaces/stream-history';
import { getStreamHistoryById } from '../services/stream-history.service';
import { VideoPlayer } from '../components/VideoPlayer';
import { createViewerHistory } from '../services/viewer-history.service';
import DonationModal from '../components/DonationModal';
import { avatarSvg } from '../utils/avatar.util';

const formatNumberCompact = (val: number) => {
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `${(val / 1_000).toFixed(1)}K`;
  return `${val}`;
};

export default function StreamHistoryPage() {
  const { streamHistoryId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [history, setHistory] = useState<StreamHistory | undefined>();
  const { user, stats, loadProfile, isProfileLoaded, isOwnProfile } =
    useUserProfile(history?.hostPrincipalID);
  const {
    isFollowing,
    handleFollow,
    handleUnfollow,
    checkFollowingStatus,
    followLoading,
    unfollowLoading,
  } = useFollowing();
  const [showChat, setShowChat] = useState(true);
  const isAuthenticated = !!currentUser;

  useEffect(() => {
    if (!streamHistoryId) {
      navigate(-1);
      return;
    }
    getStreamHistoryById(streamHistoryId).then((h) => {
      setHistory(h);
      if (h?.hostPrincipalID) loadProfile(h.hostPrincipalID);
    });
  }, []);

  useEffect(() => {
    if (user) {
      checkFollowingStatus(user.principal_id);
      if (history?.streamHistoryID)
        createViewerHistory(user.principal_id, history.streamHistoryID);
    }
  }, [user, history?.streamHistoryID]);

  const followersVal =
    typeof stats?.followersCount === 'number'
      ? formatNumberCompact(stats.followersCount)
      : '—';

  const tags = useMemo(() => {
    const raw = history?.categoryName?.trim() || '';
    if (!raw) return [];
    return raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }, [history?.categoryName]);

  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);

  if (!history) {
    return <Loading />;
  }

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
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <img
              alt="avatar"
              src={
                user?.profile_picture ||
                `data:image/svg+xml;utf8,${encodeURIComponent(avatarSvg(user?.username || 'N'))}`
              }
              className="h-12 w-12 rounded-xl ring-2 ring-white/10"
            />
            <div>
              <Link
                className="text-lg font-semibold leading-tight hover:underline"
                to={`/profiles/${user?.principal_id}`}
              >
                {user?.username}
              </Link>
            </div>
          </div>
          {!isOwnProfile && (
            <div className="flex items-center gap-2">
              {isFollowing ? (
                <button
                  className="rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold cursor-pointer"
                  onClick={() =>
                    user?.principal_id && handleUnfollow(user.principal_id)
                  }
                  disabled={unfollowLoading}
                >
                  Unfollow
                </button>
              ) : (
                <button
                  className="rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-3 py-2 text-xs font-semibold cursor-pointer"
                  onClick={() =>
                    user?.principal_id && handleFollow(user.principal_id)
                  }
                  disabled={followLoading}
                >
                  Follow
                </button>
              )}
              <button
              onClick={() => setIsDonationModalOpen(true)}
               className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs hover:border-white/20">
                <Heart className="h-4 w-4" />
                Donate
              </button>
              <button
                className="rounded-xl border border-white/10 p-2 hover:border-white/20 sm:hidden"
                onClick={() => setShowChat((s) => !s)}
                aria-label="Toggle chat"
              >
                💬
              </button>
            </div>
          )}
        </header>

        <section className="mt-4 grid gap-6 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="lg:col-span-2"
          >
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase">
                    <span className="block h-2 w-2 rounded-full bg-gray-400" />
                    Offline
                  </div>
                  <div className="flex items-center gap-1 text-xs text-white/70">
                    <UserIcon className="h-3 w-3" />
                    <span className="font-medium">
                      {formatNumberCompact(history?.totalView || 0)} views
                    </span>
                  </div>
                </div>
              </div>

              <VideoPlayer url={history.videoUrl} />

              <div className="border-t border-white/10 px-4 py-3">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <p className="line-clamp-1 text-sm font-semibold">
                      {history.title}
                    </p>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                      {tags.map((t) => (
                        <span
                          key={t}
                          className="rounded-full border border-white/10 px-3 py-1 text-[11px]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
              <div className="px-4 py-3 text-sm font-semibold">
                About {user?.username}
              </div>
              <div className="px-4">
                <div className="rounded-xl bg-gradient-to-r from-sky-500/10 via-blue-600/10 to-indigo-600/10 p-3 text-xs text-white/80">
                  {user?.bio}
                </div>
              </div>
              <div className="border-t border-white/10 px-4 py-3 mt-3">
                <div className="flex items-center justify-between text-xs text-white/80">
                  <span>
                    Followers:{' '}
                    <span className="text-white/90 font-medium">
                      {followersVal}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className={`${showChat ? 'block' : 'hidden'} lg:block`}
          >
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="text-sm font-semibold">Chat Replay</div>
                </div>
              </div>
              <div className="h-[40rem] space-y-3 overflow-y-auto px-4 pb-4">
                {history.messages?.length ? (
                  history.messages.map((m, i) => (
                    <div key={i} className="text-xs">
                      <span className="text-white/60">{m.username}:</span>{' '}
                      <span className="text-white/90">{m.content}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-white/60">No messages.</div>
                )}
              </div>
              <div className="flex items-center gap-2 border-t border-white/10 p-3">
                <div className="flex w-full items-center gap-2">
                  <input
                    disabled
                    placeholder="Chat is disabled for VOD"
                    className="flex-1 rounded-lg bg-white/5 px-3 py-2 text-xs outline-none placeholder:text-white/40 opacity-60 cursor-not-allowed"
                  />
                  <button
                    disabled
                    className="rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold cursor-not-allowed opacity-60"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.aside>
        </section>
      </main>

      <Footer />
      <DonationModal
        isOpen={isDonationModalOpen}
        onClose={() => setIsDonationModalOpen(false)}
        recipientPrincipalId={user?.principal_id || ''}
        recipientUsername={user?.username}
      />

    </div>
  );
}
