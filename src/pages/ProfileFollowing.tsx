import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Users, ArrowLeft } from 'lucide-react';
import { FollowingInterface } from '../interfaces/following';
import { useUserProfile } from '../services/user-profile.service';

export default function ProfileFollowing() {
  const { principalId } = useParams();
  const navigate = useNavigate();
  const { user, stats, followingList, isLoading, loadProfile } =
    useUserProfile(principalId);

  useEffect(() => {
    if (principalId) loadProfile(principalId);
  }, [principalId]);

  const targetName = user?.username || 'User';
  const count =
    typeof stats?.followingCount === 'number' ? stats.followingCount : 0;

  const items = Array.isArray(followingList) ? followingList : [];

  const renderAvatar = (u: FollowingInterface) => {
    const url =
      u?.following.profile_picture ||
      `data:image/svg+xml;utf8,${encodeURIComponent(
        avatarSvg((u?.following.username || 'U').toUpperCase()),
      )}`;
    return (
      <img
        src={url}
        alt={u?.following.username || 'avatar'}
        className="h-10 w-10 rounded-full ring-2 ring-white/10 object-cover"
      />
    );
  };

  const getPrincipal = (u: FollowingInterface) => u.principal_id;
  const getName = (u: FollowingInterface) => u?.following.username;

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

      <main className="relative mx-auto max-w-5xl px-4 sm:px-6 py-8">
        <div className="mb-4 flex items-center gap-2">
          <button
            onClick={() => navigate(`/profiles/${principalId}`)}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs hover:bg-white/5"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        </div>

        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
        >
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <h1 className="text-sm font-semibold">
                {targetName}'s Following
              </h1>
            </div>
            <div className="text-[11px] text-white/60">{count} total</div>
          </div>

          <div className="px-5">
            <div className="mb-3 flex gap-2">
              {principalId ? (
                <>
                  <Link
                    to={`/profiles/${principalId}/followers`}
                    className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/80 hover:border-white/20 hover:text-white"
                  >
                    Followers
                  </Link>
                  <Link
                    to={`/profiles/${principalId}/following`}
                    className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold"
                  >
                    Following
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to={`/followers`}
                    className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/80 hover:border-white/20 hover:text-white"
                  >
                    Followers
                  </Link>
                  <Link
                    to={`/following`}
                    className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold"
                  >
                    Following
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="divide-y divide-white/5">
            {isLoading && (
              <div className="px-5 py-6">
                <div className="grid gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-white/10 animate-pulse" />
                      <div className="flex-1">
                        <div className="h-3 w-40 rounded bg-white/10 animate-pulse" />
                        <div className="mt-2 h-3 w-24 rounded bg-white/5 animate-pulse" />
                      </div>
                      <div className="h-8 w-24 rounded-lg bg-white/10 animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!isLoading && items.length === 0 && (
              <div className="px-5 py-10 text-center text-sm text-white/70">
                Not following anyone yet.
              </div>
            )}

            {!isLoading &&
              items.map((u: any, idx: number) => {
                const p = getPrincipal(u);
                const name = getName(u);
                const href = p ? `/profiles/${p}` : '#';
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-5 py-3"
                  >
                    <div className="flex items-center gap-3">
                      {renderAvatar(u)}
                      <div>
                        <Link
                          to={href}
                          className="text-sm font-medium hover:underline"
                        >
                          {name}
                        </Link>
                        <div className="text-[11px] text-white/60">
                          {p ? shortPrincipal(p) : '—'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        to={href}
                        className="rounded-lg border border-white/10 px-3 py-2 text-xs hover:bg-white/5"
                      >
                        View
                      </Link>
                      <button className="rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold hover:bg-white/15">
                        Unfollow
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </motion.section>
      </main>

      <Footer />
    </div>
  );
}

function shortPrincipal(p: string) {
  if (!p) return '';
  return `${p.slice(0, 8)}...${p.slice(-4)}`;
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
