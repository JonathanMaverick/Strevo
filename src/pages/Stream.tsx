import React, { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, User, Send, X, DollarSign } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useNavigate, useParams } from 'react-router-dom';
import { ChatMessage } from '../interfaces/chat-message';
import { SocketMessage } from '../interfaces/socket-message';
import { SocketMessageType } from '../enums/socket-message-type';
import { useAuth } from '../contexts/auth.context';
import { HLSVideoPlayer } from '../components/HLSVideoPlayer';
import { useUserProfile } from '../services/user-profile.service';
import { useFollowing } from '../services/follow.service';
import Loading from './Loading';
import { Stream } from '../interfaces/stream';
import { getStreamByStreamerID } from '../services/stream.service';

const formatViewerCount = (count: number) => {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
};

export default function StreamPage() {
  const { principalId } = useParams();
  const { stats, user, loadProfile, isProfileLoaded, isOwnProfile } =
    useUserProfile(principalId);
  const { user: currentUser } = useAuth();
  const {
    isFollowing,
    handleFollow,
    handleUnfollow,
    checkFollowingStatus,
    followLoading,
    unfollowLoading,
  } = useFollowing();
  const [isLive, setIsLive] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const navigate = useNavigate();
  const socketRef = useRef<WebSocket>(null!);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const messageInputRef = useRef<HTMLInputElement>(null!);
  const [viewerCount, setViewerCount] = useState(0);
  const [stream, setStream] = useState<Stream | undefined>();
  const [donateOpen, setDonateOpen] = useState(false);
  const [donateAmount, setDonateAmount] = useState<string>('');
  const [donateError, setDonateError] = useState<string>('');
  const [donating, setDonating] = useState(false);

  const isAuthenticated = !!currentUser;

  const followersVal =
    typeof stats?.followersCount === 'number'
      ? stats.followersCount >= 1000
        ? `${(stats.followersCount / 1000).toFixed(1)}K`
        : `${stats.followersCount}`
      : '—';

  const tags = useMemo(() => {
    const raw = stream?.categoryName?.trim() || '';
    if (!raw) return [];
    return raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }, [stream?.categoryName]);

  const handleIncomingMessage = (data: ChatMessage) => {
    setChatMessages((prev) => [...prev, data]);
  };

  const handleSendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isAuthenticated || !user) return;
    const content = messageInputRef.current.value.trim();
    if (content.length === 0) return;
    const payload: SocketMessage<ChatMessage> = {
      type: SocketMessageType.ChatMessage,
      data: {
        userId: currentUser!.principal_id,
        streamId: user.principal_id,
        content,
      },
    };
    socketRef.current.send(JSON.stringify(payload));
    messageInputRef.current.value = '';
  };

  useEffect(() => {
    if (!principalId) {
      navigate(-1);
      return;
    }
    loadProfile(principalId);
    getStreamByStreamerID(principalId).then((s) => {
      if (s) setStream(s);
    });
    socketRef.current = new WebSocket(
      `ws://${process.env.VITE_BACKEND_HOST}:${process.env.VITE_BACKEND_PORT}/api/v1/chats/ws/${principalId}`,
    );
    socketRef.current.onmessage = (event) => {
      const message: SocketMessage<any> = JSON.parse(event.data);
      switch (message.type) {
        case SocketMessageType.ChatMessage:
          handleIncomingMessage(message.data);
          break;
        case SocketMessageType.ViewerCount:
          setViewerCount(message.data);
          break;
      }
    };
    return () => {
      socketRef.current?.close();
    };
  }, []);

  useEffect(() => {
    if (user) checkFollowingStatus(user.principal_id);
  }, [user]);

  const openDonate = () => {
    setDonateAmount('');
    setDonateError('');
    setDonateOpen(true);
  };

  const closeDonate = () => {
    if (donating) return;
    setDonateOpen(false);
  };

  const submitDonate = (e: FormEvent) => {
    e.preventDefault();
    const amt = Number(donateAmount);
    if (isNaN(amt) || amt <= 0) {
      setDonateError('Please enter a valid amount greater than 0.');
      return;
    }
    setDonateError('');
    setDonating(true);
    setTimeout(() => {
      setDonating(false);
      setDonateOpen(false);
    }, 600);
  };

  if (!isProfileLoaded) return <Loading />;

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
              src={`data:image/svg+xml;utf8,${encodeURIComponent(avatarSvg('N'))}`}
              className="h-12 w-12 rounded-xl ring-2 ring-white/10"
            />
            <div>
              <h1 className="text-lg font-semibold leading-tight">
                {user?.username}
              </h1>
              <div className="flex items-center gap-2 text-xs text-white/70">
                <span>{tags.length ? tags.join(' • ') : '—'}</span>
              </div>
            </div>
          </div>
          {isAuthenticated && !isOwnProfile && (
            <div className="flex items-center gap-2">
              {isFollowing ? (
                <button
                  className="rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold cursor-pointer"
                  onClick={() => principalId && handleUnfollow(principalId)}
                  disabled={unfollowLoading}
                >
                  Unfollow
                </button>
              ) : (
                <button
                  className="rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-3 py-2 text-xs font-semibold cursor-pointer"
                  onClick={() => principalId && handleFollow(principalId)}
                  disabled={followLoading}
                >
                  Follow
                </button>
              )}
              <button className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs hover:border-white/20">
                <Crown className="h-4 w-4" />
                Subscribe
              </button>
              <button
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs hover:border-white/20"
                onClick={openDonate}
              >
                <DollarSign className="h-4 w-4" />
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
                    <span
                      className={`block h-2 w-2 rounded-full ${isLive ? 'animate-pulse bg-red-400' : 'bg-gray-400'}`}
                    />
                    {isLive ? 'Live Now' : 'Offline'}
                  </div>
                  {isLive && (
                    <div className="flex items-center gap-1 text-xs text-white/70">
                      <User className="h-3 w-3" />
                      <span className="font-medium">
                        {formatViewerCount(viewerCount)} watching
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <HLSVideoPlayer
                setIsLive={setIsLive}
                url={`${process.env.VITE_STREAMING_SERVER_URL}/watch/${user?.principal_id}/index.m3u8`}
              />

              <div className="border-t border-white/10 px-4 py-3">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <p className="line-clamp-1 text-sm font-semibold">
                      {stream?.title}
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
                  <span>
                    Subscribers:{' '}
                    <span className="text-white/90 font-medium">12.8K</span>
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
                  <img
                    alt="avatar"
                    src={`data:image/svg+xml;utf8,${encodeURIComponent(avatarSvg('N'))}`}
                    className="h-6 w-6 rounded-md ring-2 ring-white/10"
                  />
                  <div className="text-sm font-semibold">Chat</div>
                </div>
              </div>
              <div className="h-[40rem] space-y-3 overflow-y-auto px-4 pb-4">
                {chatMessages.map((m, i) => (
                  <div key={i} className="text-xs">
                    <span className="text-white/60">{m.userId}:</span>{' '}
                    <span className="text-white/90">{m.content}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 border-t border-white/10 p-3">
                {!isAuthenticated ? (
                  <div className="flex w-full items-center gap-2">
                    <input
                      disabled
                      placeholder="Sign in to chat"
                      className="flex-1 rounded-lg bg-white/5 px-3 py-2 text-xs outline-none placeholder:text-white/40 opacity-60 cursor-not-allowed"
                    />
                  </div>
                ) : (
                  <form
                    onSubmit={handleSendMessage}
                    className="flex w-full items-center gap-2"
                  >
                    <input
                      ref={messageInputRef}
                      placeholder="Send a message"
                      className="flex-1 rounded-lg bg-white/5 px-3 py-2 text-xs outline-none placeholder:text-white/40"
                    />
                    <button
                      type="submit"
                      className="rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 px-3 py-2 text-xs font-semibold"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </form>
                )}
              </div>
            </div>
          </motion.aside>
        </section>
      </main>

      <Footer />

      {donateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={closeDonate} />
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-[#0E1320] p-5 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">
                Donate to {user?.username}
              </h3>
              <button
                onClick={closeDonate}
                className="rounded-lg border border-white/10 p-1 hover:border-white/20"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={submitDonate} className="mt-4 space-y-4">
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                <DollarSign className="h-4 w-4 opacity-80" />
                <input
                  inputMode="decimal"
                  pattern="^[0-9]*[.]?[0-9]*$"
                  value={donateAmount}
                  onChange={(e) => setDonateAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-white/40"
                />
              </div>
              {donateError && (
                <div className="text-xs text-red-400">{donateError}</div>
              )}
              {!isAuthenticated && (
                <div className="rounded-xl bg-yellow-500/10 p-2 text-xs text-yellow-300">
                  You must sign in to donate.
                </div>
              )}
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={closeDonate}
                  className="rounded-xl border border-white/10 px-3 py-2 text-xs hover:border-white/20"
                  disabled={donating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isAuthenticated || donating}
                  className={`rounded-xl px-3 py-2 text-xs font-semibold ${
                    !isAuthenticated || donating
                      ? 'bg-white/10 cursor-not-allowed opacity-60'
                      : 'bg-gradient-to-r from-sky-500 to-blue-600'
                  }`}
                >
                  {donating ? 'Processing...' : 'Donate'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
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
