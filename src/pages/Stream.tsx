import React, { FormEvent, useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
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
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useNavigate, useParams } from "react-router-dom";
import { useUserProfile } from "../services/userProfileService";
import { useFollowing } from "../services/followService";
import { User } from "../interfaces/user";
import { principal } from "@ic-reactor/react/dist/utils";
import { ChatMessage } from "../interfaces/chat-message";
import { SocketMessage } from "../interfaces/socket-message";
import { SocketMessageType } from "../enums/socket-message-type";
import Hls from "hls.js"
import { useAuth } from '../contexts/auth.context';

// Video quality options
const QUALITY_OPTIONS = [
  { label: '1080p', value: '1080p' },
  { label: '720p', value: '720p' },
  { label: '480p', value: '480p' },
  { label: 'Auto', value: 'auto' },
];

export default function Stream() {
  const { principalId } = useParams();
  const { user, loadProfile, isProfileLoaded, isOwnProfile } = useUserProfile(principalId);
  const { user: currentUser, refetchUser } = useAuth();
  const { handleFollow, handleUnfollow, checkFollowingStatus, followLoading, unfollowLoading } = useFollowing();
  
  // Video state
  const [isFollowing, setIsFollowing] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [volume, setVolume] = useState(1);
  const [previousVolume, setPreviousVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [isLive, setIsLive] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [currentQuality, setCurrentQuality] = useState('auto');
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  
  // UI state
  const [showChat, setShowChat] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const navigate = useNavigate();
  const socketRef = useRef<WebSocket>(null!);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const messageInputRef = useRef<HTMLInputElement>(null!);
  const videoRef = useRef<HTMLVideoElement>(null!);
  const videoContainerRef = useRef<HTMLDivElement>(null!);
  const hlsRef = useRef<Hls | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  // Auto-hide controls after 3 seconds of inactivity
  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(true);
    controlsTimeoutRef.current = setTimeout(() => {
      if (playing) {
        setShowControls(false);
      }
    }, 3000);
  }, [playing]);

  // Video event handlers
  const handleVideoEvents = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      setCurrentTime(video.currentTime);
      setDuration(video.duration || 0);
      
      // Update buffered progress
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        setBuffered((bufferedEnd / video.duration) * 100 || 0);
      }
    };

    const handleLoadStart = () => {
      setIsLoading(true);
      setVideoError(null);
    };

    const handleLoadedData = () => {
      setIsLoading(false);
      setVideoError(null);
      
      // Auto-play with error handling
      video.play()
        .then(() => {
          setPlaying(true);
          setIsLive(true);
        })
        .catch((error) => {
          console.log('Autoplay prevented:', error);
          setPlaying(false);
        });
    };

    const handleError = () => {
      setIsLoading(false);
      setVideoError('Failed to load stream. Please try refreshing.');
      setIsLive(false);
    };

    const handleWaiting = () => setIsLoading(true);
    const handlePlaying = () => {
      setIsLoading(false);
      setPlaying(true);
    };
    const handlePause = () => setPlaying(false);
    const handleVolumeChange = () => {
      setVolume(video.volume);
      setMuted(video.muted);
    };

    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('error', handleError);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('pause', handlePause);
    video.addEventListener('volumechange', handleVolumeChange);

    return () => {
      video.removeEventListener('timeupdate', updateProgress);
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('error', handleError);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('volumechange', handleVolumeChange);
    };
  }, []);

  // HLS setup
  const setupHLS = useCallback(() => {
    const video = videoRef.current;
    if (!video || !user?.streaming_key) return;

    const streamURL = `${process.env.VITE_STREAMING_SERVER_URL}/watch/${user.principal_id}/index.m3u8`;
    
    if (hlsRef.current) {
      hlsRef.current.destroy();
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
      });

      hlsRef.current = hls;
      hls.loadSource(streamURL);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('HLS manifest parsed');
        setVideoError(null);
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS error:', data);
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setVideoError('Network error. Please check your connection.');
              // Try to recover
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              setVideoError('Media error. Attempting to recover...');
              hls.recoverMediaError();
              break;
            default:
              setVideoError('Stream error. Please refresh the page.');
              hls.destroy();
              break;
          }
        }
      });

    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari native HLS support
      video.src = streamURL;
    } else {
      setVideoError('Your browser does not support HLS streaming.');
    }
  }, [user?.streaming_key]);

  // Control handlers
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (playing) {
      video.pause();
    } else {
      video.play().catch(() => {
        setVideoError('Unable to play stream.');
      });
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    if (muted) {
      video.muted = false;
      video.volume = previousVolume;
    } else {
      setPreviousVolume(video.volume);
      video.muted = true;
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = newVolume;
    video.muted = newVolume === 0;
    if (newVolume > 0) {
      setPreviousVolume(newVolume);
    }
  };

  const toggleFullscreen = async () => {
    if (!videoContainerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await videoContainerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  const handleQualityChange = (quality: string) => {
    setCurrentQuality(quality);
    setShowQualityMenu(false);
    console.log(`Switching to ${quality} quality`);
  };

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

    socketRef.current.send(JSON.stringify(payload));
    messageInputRef.current.value = '';
  };

  // Effects
  useEffect(() => {
    if (!principalId) {
      navigate(-1);
      return;
    }
    console.log(principalId)
    loadProfile(principalId);
    checkFollowingStatus(principalId).then(isFollowing => {setIsFollowing(isFollowing); console.log('isFollowing', isFollowing)});
    refetchUser();

    // Setup WebSocket
    socketRef.current = new WebSocket(`ws://${process.env.VITE_BACKEND_HOST}:${process.env.VITE_BACKEND_PORT}/api/v1/chats/ws/aasd`);
    socketRef.current.onmessage = (event) => {
      const message: SocketMessage<ChatMessage> = JSON.parse(event.data);
      switch (message.type) {
        case SocketMessageType.ChatMessage:
          handleIncomingMessage(message.data);
          break;
      }
    };

    return () => {
      socketRef.current?.close();
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isProfileLoaded && user) {
      setupHLS();
      handleVideoEvents();
    }
  }, [isProfileLoaded, user, setupHLS, handleVideoEvents]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

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

  const onFollow = async () => {
    handleFollow(principalId!);
  };

  if (!isProfileLoaded) {
    return (
      <div className="min-h-screen bg-[#0A0E17] text-white flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading streamer...</span>
        </div>
      </div>
    );
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
              <p className="text-xs text-white/70">
                FPS • Competitive • Coaching
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isOwnProfile && (isFollowing ?
              <button className="rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold" onClick={() => handleUnfollow(principalId!)} disabled={unfollowLoading}>
                Unfollow
              </button>
              :
              <button className="rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-3 py-2 text-xs font-semibold" onClick={onFollow} disabled={followLoading}>
                Follow
              </button>
            )}
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
                <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase">
                  <span className={`block h-2 w-2 rounded-full ${isLive ? 'animate-pulse bg-red-400' : 'bg-gray-400'}`} />
                  {isLive ? 'Live Now' : 'Offline'}
                </div>
                <div className="text-[10px] text-white/60">
                  {currentQuality === 'auto' ? 'Auto' : currentQuality} • {isLive ? '60fps' : 'Offline'}
                </div>
              </div>

              <div 
                ref={videoContainerRef}
                className="relative aspect-video w-full bg-gradient-to-br from-slate-700 via-slate-800 to-black group"
                onMouseMove={resetControlsTimeout}
                onMouseLeave={() => playing && setShowControls(false)}
              >
                <video 
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted={muted}
                />
                
                {/* Loading overlay */}
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="flex items-center gap-2 text-white">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span>Loading stream...</span>
                    </div>
                  </div>
                )}

                {/* Error overlay */}
                {videoError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="flex items-center gap-2 text-white bg-red-500/20 rounded-lg p-4">
                      <AlertCircle className="h-6 w-6" />
                      <span>{videoError}</span>
                    </div>
                  </div>
                )}

                {/* Click to play overlay */}
                {!playing && !isLoading && !videoError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <button
                      onClick={togglePlay}
                      className="rounded-full bg-white/20 p-4 backdrop-blur hover:bg-white/30 transition-colors"
                    >
                      <Play className="h-8 w-8 ml-1" />
                    </button>
                  </div>
                )}

                {/* Video controls */}
                <div className={`absolute inset-0 flex items-end justify-between p-4 transition-opacity duration-300 ${showControls || !playing ? 'opacity-100' : 'opacity-0'}`}>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 rounded-xl bg-black/40 p-2 backdrop-blur">
                      <button
                        onClick={togglePlay}
                        className="rounded-lg bg-white/10 p-2 hover:bg-white/15 transition-colors"
                        aria-label={playing ? 'Pause' : 'Play'}
                      >
                        {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </button>
                      
                      <div className="relative">
                        <button
                          onClick={toggleMute}
                          onMouseEnter={() => setShowVolumeSlider(true)}
                          className="rounded-lg bg-white/10 p-2 hover:bg-white/15 transition-colors"
                          aria-label={muted ? 'Unmute' : 'Mute'}
                        >
                          {muted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                        </button>
                        
                        {/* Volume slider */}
                        {showVolumeSlider && (
                          <div 
                            className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-black/60 backdrop-blur rounded-lg p-2"
                            onMouseLeave={() => setShowVolumeSlider(false)}
                          >
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.05"
                              value={muted ? 0 : volume}
                              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                              className="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
                              style={{
                                background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${(muted ? 0 : volume) * 100}%, rgba(255,255,255,0.2) ${(muted ? 0 : volume) * 100}%, rgba(255,255,255,0.2) 100%)`
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 rounded-xl bg-black/40 p-2 backdrop-blur">
                      <div className="relative">
                        <button
                          onClick={() => setShowQualityMenu(!showQualityMenu)}
                          className="rounded-lg bg-white/10 p-2 text-[10px] hover:bg-white/15 transition-colors min-w-[50px]"
                        >
                          {currentQuality}
                        </button>
                        
                        {showQualityMenu && (
                          <div className="absolute bottom-full right-0 mb-2 bg-black/80 backdrop-blur rounded-lg overflow-hidden">
                            {QUALITY_OPTIONS.map((option) => (
                              <button
                                key={option.value}
                                onClick={() => handleQualityChange(option.value)}
                                className={`block w-full px-3 py-2 text-[10px] text-left hover:bg-white/10 transition-colors ${
                                  currentQuality === option.value ? 'bg-blue-500/20' : ''
                                }`}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <button
                        onClick={toggleFullscreen}
                        className="rounded-lg bg-white/10 p-2 hover:bg-white/15 transition-colors"
                        aria-label="Fullscreen"
                      >
                        <Maximize2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 px-4 py-3">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <p className="line-clamp-1 text-sm font-semibold">
                      Pro scrims — finals practice
                    </p>
                    <p className="text-xs text-white/60">
                      {isLive ? '12.4K watching' : 'Stream offline'} • FPS
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
                About {user?.username || 'NovaSpectre'}
              </div>
              <div className="px-4">
                <div className="rounded-xl bg-gradient-to-r from-sky-500/10 via-blue-600/10 to-indigo-600/10 p-3 text-xs text-white/80">
                  Competitive FPS streamer & coach. Fokus di scrims, ranked
                  climb, dan VOD review. DM untuk collab; coaching setiap Kamis
                  malam.
                </div>
                <div className="mt-3 grid gap-2">
                  <div className="flex items-center gap-2 text-xs text-white/80">
                    <MapPin className="h-4 w-4 text-white/70" />
                    Jakarta • WIB (UTC+7)
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/80">
                    <Calendar className="h-4 w-4 text-white/70" />
                    Live 5×/week • 19:00–23:00
                  </div>
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
                    <span className="text-white/90 font-medium">340K</span>
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
                <div className="text-[10px] text-white/60">Live</div>
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
    </div >
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
