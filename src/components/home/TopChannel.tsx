import { useMemo } from 'react';
import { useUserProfile } from '../../services/user-profile.service';
import { Stream } from '../../interfaces/stream';
import { avatarSvg } from '../../utils/avatar.util';

function TopChannelItem({ stream }: { stream: Stream }) {
  const { user, userLoading } = useUserProfile(stream.hostPrincipalID);

  function formatViewerCount(count: number) {
    if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
    if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
    return `${count}`;
  }

  return (
    <a
      key={stream.streamId}
      href="#"
      className="flex items-center justify-between px-4 py-3 hover:bg-white/[0.04]"
    >
      <div className="flex items-center gap-3">
        {userLoading ? (
          <div className="h-7 w-7 rounded-full bg-white/10 animate-pulse" />
        ) : (
          <img
            alt="avatar"
            src={
              user?.profile_picture ||
              `data:image/svg+xml;utf8,${encodeURIComponent(
                avatarSvg(stream.hostPrincipalID[0]?.toUpperCase() || 'U'),
              )}`
            }
            className="h-7 w-7 rounded-full ring-2 ring-white/10 object-cover"
          />
        )}

        <div>
          <div className="text-sm">
            {userLoading ? (
              <div className="h-4 w-20 bg-white/10 rounded animate-pulse" />
            ) : (
              user?.username || stream.hostPrincipalID
            )}
          </div>

          <div className="text-[10px] text-white/60">
            {userLoading ? (
              <div className="h-3 w-16 bg-white/10 rounded animate-pulse mt-1" />
            ) : (
              `Live now • ${formatViewerCount(stream.viewerCount)}`
            )}
          </div>
        </div>
      </div>

      <div className="text-[10px] text-white/60">
        {userLoading ? (
          <div className="h-3 w-12 bg-white/10 rounded animate-pulse" />
        ) : (
          stream.categoryName
        )}
      </div>
    </a>
  );
}

export function TopChannels({ streams }: { streams: Stream[] }) {
  const sortedStreams = useMemo(() => {
    return [...streams].sort((a, b) => b.viewerCount - a.viewerCount);
  }, [streams]);

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
      <div className="px-4 py-3 text-sm font-semibold">Top channels</div>
      <div className="divide-y divide-white/5">
        {sortedStreams.slice(0, 6).map((stream) => (
          <TopChannelItem key={stream.streamId} stream={stream} />
        ))}
      </div>
    </div>
  );
}
