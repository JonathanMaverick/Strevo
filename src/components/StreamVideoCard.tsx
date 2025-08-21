import { Stream } from '../interfaces/stream';
import { useUserProfile } from '../services/user-profile.service';

export function StreamVideoCard({ stream }: { stream: Stream }) {
  const { user, isLoading } = useUserProfile(stream.hostPrincipalID);

  if (isLoading) {
    return (
      <div className="animate-pulse overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
        <div className="aspect-video w-full bg-white/5" />
        <div className="p-3">
          <div className="h-4 w-3/4 rounded bg-white/10 mb-2" />
          <div className="h-3 w-1/2 rounded bg-white/10" />
        </div>
      </div>
    );
  }

  return (
    <a
      href={`/stream/${stream.hostPrincipalID}`}
      className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.05]"
    >
      <div className={`relative aspect-video w-full bg-gradient-to-br`}>
        <img
          src={stream.thumbnailURL}
          alt={stream.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-md bg-black/40 px-2 py-1 text-[10px] font-semibold uppercase">
          <span className="block h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" />{' '}
          Live
        </div>
        <div className="absolute right-2 top-2 rounded-md bg-black/40 px-2 py-1 text-[10px]">
          {stream.categoryName}
        </div>
        <div className="absolute bottom-2 left-2 rounded-md bg-black/40 px-2 py-1 text-[10px]">
          {stream.viewerCount} watching
        </div>
      </div>
      <div className="p-3">
        <p className="line-clamp-1 text-sm font-medium">{stream.title}</p>
        <p className="mt-1 text-xs text-white/60">{user?.username}</p>
      </div>
    </a>
  );
}
