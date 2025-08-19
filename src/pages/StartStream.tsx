import { useState } from 'react';
import {
  PlayCircle,
  Copy,
  Monitor,
  Webcam,
  AppWindow,
  Settings as SettingsIcon,
  SignalHigh,
  Info,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/auth.context';
import { HLSVideoPlayer } from '../components/HLSVideoPlayer';

export default function StartStream() {
  const { user } = useAuth();
  const [copied, setCopied] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);

  const handleCopy = (value: string, label: string) => {
    navigator.clipboard.writeText(value);
    setCopied(label);
    setTimeout(() => setCopied(null), 1800);
  };

  const serverUrl = 'rtmp://localhost:1935/live';
  const hlsBase = import.meta.env.VITE_STREAMING_SERVER_URL as string;
  const hlsUrl = user ? `${hlsBase}/watch/${user.principal_id}/index.m3u8` : '';

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0A0E17] text-white flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-center max-w-md">
            <h1 className="text-xl font-semibold">Start Streaming</h1>
            <p className="mt-2 text-white/70">
              Please sign in and complete registration to access your stream
              key.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0E17] text-white flex flex-col">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-gradient-to-tr from-blue-600/30 via-sky-500/20 to-cyan-400/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-[28rem] w-[28rem] rounded-full bg-gradient-to-tr from-indigo-600/25 via-blue-600/20 to-sky-400/10 blur-[100px]" />
      </div>

      <Navbar />

      <main className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 py-8">
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800 via-slate-900 to-black">
          <div className="px-6 py-8 sm:px-8 sm:py-10">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-1 text-[11px] uppercase tracking-wide">
                  <PlayCircle className="h-3.5 w-3.5" />
                  Live Setup
                </div>
                <h1 className="mt-3 text-2xl sm:text-3xl font-semibold">
                  Start Streaming with OBS
                </h1>
                <p className="mt-1 text-white/70 text-sm">
                  Configure OBS once. When you click Start Streaming in OBS,
                  your broadcast will automatically go live on ICP Stream.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href="https://obsproject.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-2 text-sm font-semibold"
                >
                  Download OBS
                </a>
                <a
                  href="https://obsproject.com/kb"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl border border-white/15 px-4 py-2 text-sm hover:bg-white/5"
                >
                  OBS Knowledge Base
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03]">
              <div className="px-5 py-4 border-b border-white/10 flex items-center gap-2">
                <SettingsIcon className="h-4 w-4" />
                <h2 className="text-sm font-semibold">Step 1 — Add Sources</h2>
              </div>
              <div className="p-5 text-sm text-white/80 space-y-4">
                <p>
                  Open OBS Studio, then use the Sources panel to add what you
                  want to show.
                </p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                    <div className="flex items-center gap-2 text-white/90 font-medium">
                      <Monitor className="h-4 w-4" />
                      Display Capture
                    </div>
                    <p className="mt-1 text-xs text-white/60">
                      Captures the entire screen.
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                    <div className="flex items-center gap-2 text-white/90 font-medium">
                      <AppWindow className="h-4 w-4" />
                      Window Capture
                    </div>
                    <p className="mt-1 text-xs text-white/60">
                      Captures a specific application or game window.
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                    <div className="flex items-center gap-2 text-white/90 font-medium">
                      <Webcam className="h-4 w-4" />
                      Video Capture Device
                    </div>
                    <p className="mt-1 text-xs text-white/60">
                      Captures your camera feed.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03]">
              <div className="px-5 py-4 border-b border-white/10 flex items-center gap-2">
                <SignalHigh className="h-4 w-4" />
                <h2 className="text-sm font-semibold">
                  Step 2 — Configure Stream
                </h2>
              </div>
              <div className="p-5 text-sm text-white/80 space-y-4">
                <p>
                  Go to File → Settings → Stream. Select Service: Custom and
                  fill the Server and Stream Key.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                    <div className="text-xs uppercase text-white/60">
                      Server
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <code className="bg-black/40 px-2 py-1 rounded text-sky-400">
                        {serverUrl}
                      </code>
                      <button
                        onClick={() => handleCopy(serverUrl, 'Server')}
                        className="p-1 hover:bg-white/10 rounded"
                        title="Copy"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                    <div className="text-xs uppercase text-white/60">
                      Stream Key
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <code className="bg-black/40 px-2 py-1 rounded text-sky-400">
                        {user.streaming_key}
                      </code>
                      <button
                        onClick={() =>
                          handleCopy(user.streaming_key, 'Stream key')
                        }
                        className="p-1 hover:bg-white/10 rounded"
                        title="Copy"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
                {copied && (
                  <div className="text-xs text-green-400">
                    {copied} copied to clipboard
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03]">
              <div className="px-5 py-4 border-b border-white/10 flex items-center gap-2">
                <Info className="h-4 w-4" />
                <h2 className="text-sm font-semibold">
                  Step 3 — Quality and Resolution
                </h2>
              </div>
              <div className="p-5 text-sm text-white/80 space-y-4">
                <p>Open Settings → Output → Streaming and configure:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    Video Bitrate: 2500–6000 kbps depending on your upstream
                    bandwidth.
                  </li>
                  <li>
                    Encoder: Hardware (NVENC/AMD/Apple) if available for lower
                    CPU usage.
                  </li>
                  <li>Audio Bitrate: 128 kbps.</li>
                </ul>
                <p className="mt-2">Open Settings → Video and configure:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    Base (Canvas) Resolution: your monitor resolution, e.g.,
                    1920×1080.
                  </li>
                  <li>
                    Output (Scaled) Resolution: 1280×720 if bandwidth is
                    limited.
                  </li>
                  <li>
                    Common FPS Values: 30 for general streams, 60 for fast-paced
                    games.
                  </li>
                </ul>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03]">
              <div className="px-5 py-4 border-b border-white/10 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <h2 className="text-sm font-semibold">Step 4 — Go Live</h2>
              </div>
              <div className="p-5 text-sm text-white/80 space-y-4">
                <ul className="list-disc list-inside space-y-1">
                  <li>Click Start Streaming in OBS.</li>
                  <li>
                    Your stream will automatically start on ICP Stream using the
                    configured RTMP server and your stream key.
                  </li>
                  <li>Click Stop Streaming in OBS to end the broadcast.</li>
                </ul>
                <div className="rounded-xl border border-sky-500/40 bg-sky-500/10 p-4 text-sm text-sky-300">
                  Once you start streaming in OBS, ICP Stream will detect your
                  session and go live automatically.
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03]">
              <div className="px-5 py-4 border-b border-white/10 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                <h2 className="text-sm font-semibold">Troubleshooting</h2>
              </div>
              <div className="p-5 text-sm text-white/80">
                <div className="divide-y divide-white/10">
                  {[
                    {
                      q: 'OBS says it cannot connect to the server',
                      a: 'Ensure your RTMP server is running and not blocked by a firewall. Verify the Server value is rtmp://localhost:1935/live and that no other app uses port 1935.',
                    },
                    {
                      q: 'The stream stays offline on ICP Stream',
                      a: 'Confirm you clicked Start Streaming in OBS with the correct stream key. If the key changed, update OBS. Allow a few seconds after starting.',
                    },
                    {
                      q: 'Video is laggy or buffering',
                      a: 'Lower the video bitrate, use a hardware encoder, reduce the output resolution to 1280×720, and set FPS to 30.',
                    },
                    {
                      q: 'No audio on the stream',
                      a: 'Check the OBS Mixer. Ensure the correct microphone and desktop audio devices are selected and not muted. Adjust audio levels if needed.',
                    },
                  ].map((item, idx) => (
                    <div key={idx} className="py-3">
                      <button
                        onClick={() =>
                          setOpenFaq(openFaq === item.q ? null : item.q)
                        }
                        className="w-full text-left flex items-center justify-between gap-4"
                      >
                        <span className="font-medium">{item.q}</span>
                        <span
                          className={`transition-transform ${openFaq === item.q ? 'rotate-180' : ''}`}
                        >
                          ▾
                        </span>
                      </button>
                      {openFaq === item.q && (
                        <p className="mt-2 text-white/70">{item.a}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="text-sm font-semibold">
                Your Stream Credentials
              </div>
              <div className="mt-3 space-y-3">
                <div className="text-xs uppercase text-white/60">Server</div>
                <div className="flex items-center gap-2">
                  <code className="bg-black/40 px-2 py-1 rounded text-sky-400">
                    {serverUrl}
                  </code>
                  <button
                    onClick={() => handleCopy(serverUrl, 'Server')}
                    className="p-1 hover:bg-white/10 rounded"
                    title="Copy"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-4 text-xs uppercase text-white/60">
                  Stream Key
                </div>
                <div className="flex items-center gap-2">
                  <code className="bg-black/40 px-2 py-1 rounded text-sky-400">
                    {user.streaming_key}
                  </code>
                  <button
                    onClick={() => handleCopy(user.streaming_key, 'Stream key')}
                    className="p-1 hover:bg-white/10 rounded"
                    title="Copy"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>

                {copied && (
                  <div className="mt-2 text-xs text-green-400">
                    {copied} copied to clipboard
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
              <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
                <div className="text-sm font-semibold">Live Preview</div>
                <div
                  className={`rounded-full px-2 py-0.5 text-[11px] ${isLive ? 'bg-green-500/20 text-green-300 border border-green-500/40' : 'bg-white/10 text-white/70 border border-white/15'}`}
                >
                  {isLive ? 'Live' : 'Offline'}
                </div>
              </div>
              <div className="aspect-video w-full bg-black">
                {hlsUrl ? (
                  <HLSVideoPlayer setIsLive={setIsLive} url={hlsUrl} />
                ) : (
                  <div className="h-full w-full grid place-items-center text-xs text-white/60">
                    Missing stream URL
                  </div>
                )}
              </div>
              <div className="px-5 py-3 text-[11px] text-white/60">
                Start your stream in OBS to see the preview.
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="text-sm font-semibold">Checklist</div>
              <ul className="mt-3 text-sm space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-sky-400" /> OBS
                  installed and opened
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-sky-400" /> Sources
                  added and visible
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-sky-400" /> Server and
                  Stream Key configured
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-sky-400" /> Bitrate,
                  resolution, and FPS set
                </li>
              </ul>
            </div>
          </aside>
        </section>
      </main>

      <Footer />
    </div>
  );
}
