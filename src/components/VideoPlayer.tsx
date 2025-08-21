import {
  AlertCircle,
  Loader2,
  Maximize2,
  Pause,
  Play,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

export function VideoPlayer({ url }: { url: string }) {
  const videoRef = useRef<HTMLVideoElement>(null!);
  const videoContainerRef = useRef<HTMLDivElement>(null!);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  const [isLoading, setIsLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [volume, setVolume] = useState(1);
  const [previousVolume, setPreviousVolume] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // ⏱️ for progress slider
  const [progress, setProgress] = useState(0); // in %
  const [duration, setDuration] = useState(0); // in seconds
  const [currentTime, setCurrentTime] = useState(0);

  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(true);
    controlsTimeoutRef.current = setTimeout(() => {
      if (playing) setShowControls(false);
    }, 3000);
  }, [playing]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (playing) {
      video.pause();
    } else {
      video.play().catch(() => {
        setVideoError('Unable to play video.');
      });
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.muted || video.volume === 0) {
      video.muted = false;
      video.volume = previousVolume > 0 ? previousVolume : 0.5;
    } else {
      setPreviousVolume(video.volume);
      video.muted = true;
    }
  };

  // Renamed to avoid conflict with event handler
  const handleVolumeSliderChange = (newVolume: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = newVolume;
    video.muted = newVolume === 0;
    setVolume(newVolume);
    setMuted(newVolume === 0);
    
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

  // 🎯 handle progress & duration
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (video.duration && !isNaN(video.duration)) {
        setProgress((video.currentTime / video.duration) * 100);
      }
    };

    const handleLoadedMetadata = () => {
      if (video.duration && !isNaN(video.duration)) {
        setDuration(video.duration);
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, []);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video || !duration) return;

    const newProgress = parseFloat(e.target.value);
    const newTime = (newProgress / 100) * duration;
    video.currentTime = newTime;
    setProgress(newProgress);
    setCurrentTime(newTime);
  };

  // 🕒 format time helper
  const formatTime = (time: number) => {
    if (isNaN(time) || !isFinite(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadStart = () => {
      setIsLoading(true);
      setVideoError(null);
    };
    
    const handleLoadedData = () => {
      setIsLoading(false);
      setVideoError(null);
    };
    
    const handleError = () => {
      setIsLoading(false);
      setVideoError('Failed to load video. Please try again.');
    };
    
    const handlePlaying = () => {
      setIsLoading(false);
      setPlaying(true);
    };
    
    const handlePause = () => setPlaying(false);
    
    const handleWaiting = () => setIsLoading(true);
    
    // Fixed volume change event handler
    const handleVolumeChangeEvent = () => {
      setVolume(video.volume);
      setMuted(video.muted);
    };

    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('error', handleError);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('pause', handlePause);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('volumechange', handleVolumeChangeEvent);

    return () => {
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('error', handleError);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('volumechange', handleVolumeChangeEvent);
    };
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () =>
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={videoContainerRef}
      className="relative aspect-video w-full bg-black group"
      onMouseMove={resetControlsTimeout}
      onMouseLeave={() => playing && setShowControls(false)}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        playsInline
        muted={muted}
        src={url}
      />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="flex items-center gap-2 text-white">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading video...</span>
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
      <div
        className={`absolute inset-0 flex flex-col justify-end p-4 transition-opacity duration-300 ${
          showControls || !playing ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* ⏳ Progress bar */}
        <div className="flex items-center gap-2 text-white text-xs mb-2">
          <span>{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={progress}
            onChange={handleSeek}
            className="flex-1 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${progress}%, rgba(255,255,255,0.2) ${progress}%, rgba(255,255,255,0.2) 100%)`,
            }}
          />
          <span>{formatTime(duration)}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 rounded-xl bg-black/40 p-2 backdrop-blur">
            <button
              onClick={togglePlay}
              className="rounded-lg bg-white/10 p-2 hover:bg-white/15 transition-colors"
              aria-label={playing ? 'Pause' : 'Play'}
            >
              {playing ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </button>

            <div className="relative">
              <button
                onClick={toggleMute}
                onMouseEnter={() => setShowVolumeSlider(true)}
                className="rounded-lg bg-white/10 p-2 hover:bg-white/15 transition-colors"
                aria-label={muted ? 'Unmute' : 'Mute'}
              >
                {muted || volume === 0 ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </button>

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
                    onChange={(e) =>
                      handleVolumeSliderChange(parseFloat(e.target.value))
                    }
                    className="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${
                        (muted ? 0 : volume) * 100
                      }%, rgba(255,255,255,0.2) ${(muted ? 0 : volume) * 100}%, rgba(255,255,255,0.2) 100%)`,
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-black/40 p-2 backdrop-blur">
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
  );
}