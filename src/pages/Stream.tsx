import React, {
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from 'react';
import { motion, statsBuffer } from 'framer-motion';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Settings,
  Share2,
  Heart,
  Flag,
  Send,
  Smile,
  MapPin,
  Calendar,
  Youtube,
  Twitter,
  Instagram,
  Twitch,
  Globe,
  Mail,
  Crown,
  AlertCircle,
  Loader2,
  Eye,
  User,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useNavigate, useParams } from 'react-router-dom';
import { ChatMessage } from '../interfaces/chat-message';
import { SocketMessage } from '../interfaces/socket-message';
import { SocketMessageType } from '../enums/socket-message-type';
import Hls from 'hls.js';
import { useAuth } from '../contexts/auth.context';
import { HLSVideoPlayer } from '../components/HLSVideoPlayer';
import { useUserProfile } from '../services/user-profile.service';
import { useFollowing } from '../services/follow.service';
import Loading from './Loading';
import { Stream } from "../interfaces/stream";
import { getStreamByStreamerID } from "../services/stream.service";

const QUALITY_OPTIONS = [
  { label: '1080p', value: '1080p' },
  { label: '720p', value: '720p' },
  { label: '480p', value: '480p' },
  { label: 'Auto', value: 'auto' },
];

const formatViewerCount = (count: number) => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
};

export default function StreamPage() {
  const { principalId } = useParams();
  const { stats, user, loadProfile, isProfileLoaded, isOwnProfile } =
    useUserProfile(principalId);
  const { user: currentUser, userLoading } = useAuth();
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
  const followersVal =
    typeof stats?.followersCount === 'number'
      ? stats.followersCount >= 1000
        ? `${(stats.followersCount / 1000).toFixed(1)}K`
        : `${stats.followersCount}`
      : '—';

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
        userId: currentUser!.principal_id,
        streamId: user!.principal_id,
        content,
      },
    };

    console.log(payload);

    socketRef.current.send(JSON.stringify(payload));
    messageInputRef.current.value = '';
  };

  useEffect(() => {
    if (!principalId) {
      navigate(-1);
      return;
    }
    loadProfile(principalId);
    getStreamByStreamerID(principalId).then((stream) => {
      if (stream) setStream(stream);
    })

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
    if (user) {
      checkFollowingStatus(user.principal_id);
    }

  }, [user])

  const tags = ['FPS', 'Ranked', 'Scrims', 'Coaching', 'Analysis'];

  const socials = [
    { label: 'YouTube', url: '#', handle: '@NovaSpectre', icon: Youtube },
    { label: 'X (Twitter)', url: '#', handle: '@novaspectre', icon: Twitter },
    { label: 'Instagram', url: '#', handle: '@nova.gg', icon: Instagram },
    { label: 'Twitch', url: '#', handle: 'novaspectre', icon: Twitch },
    { label: 'Website', url: '#', handle: 'novaspectre.gg', icon: Globe },
    {
      label: 'Business',
      url: 'mailto:contact@novaspectre.gg',
      handle: 'contact@novaspectre.gg',
      icon: Mail,
    },
  ];

  if (!isProfileLoaded) {
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
              src={`data:image/svg+xml;utf8,${encodeURIComponent(avatarSvg('N'))}`}
              className="h-12 w-12 rounded-xl ring-2 ring-white/10"
            />
            <div>
              <h1 className="text-lg font-semibold leading-tight">
                {user?.username}
              </h1>
              <div className="flex items-center gap-2 text-xs text-white/70">
                <span>FPS • Competitive • Coaching</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isOwnProfile &&
              (isFollowing ? (
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
              ))}
            <button className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs hover:border-white/20">
              <Crown className="h-4 w-4" />
              Subscribe
            </button>
            <button
              className="rounded-xl border border-white/10 p-2 hover:border-white/20"
              aria-label="Share"
            >
              <Share2 className="h-4 w-4" />
            </button>
            <button
              className="rounded-xl border border-white/10 p-2 hover:border-white/20 sm:hidden"
              onClick={() => setShowChat((s) => !s)}
              aria-label="Toggle chat"
            >
              💬
            </button>
          </div>
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
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <button className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold hover:bg-white/15">
                    <Heart className="h-4 w-4" />
                    Like
                  </button>
                  <button className="rounded-xl border border-white/10 px-3 py-2 text-xs hover:border-white/20">
                    Clip
                  </button>
                  <button className="rounded-xl border border-white/10 px-3 py-2 text-xs hover:border-white/20">
                    <Flag className="h-4 w-4" />
                  </button>
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
                <div className="mt-3 flex flex-wrap gap-2">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-white/10 px-2.5 py-1 text-[11px]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-4 border-t border-white/10 px-4 py-3">
                <div className="mb-2 text-sm font-semibold">Socials</div>
                <div className="grid gap-2">
                  {socials.map((s) => (
                    <a
                      key={s.label}
                      href={s.url}
                      className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 hover:border-white/20"
                    >
                      <div className="flex items-center gap-3">
                        <s.icon className="h-4 w-4 text-white/80" />
                        <div className="text-sm">{s.label}</div>
                      </div>
                      <div className="text-[11px] text-white/60 group-hover:text-white/70 truncate">
                        {s.handle}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
              <div className="border-t border-white/10 px-4 py-3">
                <div className="flex items-center justify-between text-xs text-white/80">
                  <span>
                    Followers:{' '}
                    <span className="text-white/90 font-medium">{followersVal }</span>
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
                <button className="rounded-lg bg-white/10 p-2">
                  <Smile className="h-4 w-4" />
                </button>
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
              </div>
            </div>
          </motion.aside>
        </section>
      </main>

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
