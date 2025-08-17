import { useParams } from "react-router-dom";
import { useAuth } from "../contexts/auth.context";
import { useUserProfile } from "../services/userProfileService";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function StreamExample() {
  const { streamerId } = useParams();
  const { user: currentUser } = useAuth();

  const {
    user,
    stats,
    followersList,
    followingList,
    isOwnProfile,
    isProfileLoaded,
    isLoading,
    hasError,
    error,
    refreshProfile,
    loadProfile,
  } = useUserProfile(streamerId);

  useEffect(() => {
    if (streamerId) {
      loadProfile(streamerId);
    }
  }, [streamerId]);

  if (!isProfileLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0E17] text-white flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading streamer...</span>
        </div>
      </div>
    );
  }

  if (hasError) return <div>Error: {error}</div>;
  if (!user) return <div>User not found</div>;

  console.log(followingList)
  console.log(followersList)
  const isFollowing =
    currentUser &&
    followersList.some((f: any) => f.principal_id === currentUser.principal_id);

  return (
    <div className="p-4 text-white bg-[#0A0E17] min-h-screen">
      <h1 className="text-2xl font-bold">{user.username || "No name"}</h1>

      <h2 className="mt-4 text-xl">Stats</h2>
      <p>Followers: {stats.followersCount}</p>
      <p>Following: {stats.followingCount}</p>
      <p>{isOwnProfile ? "This is your profile" : "Viewing another user"}</p>
      <p>
        {isFollowing
          ? "You are following this user"
          : "You are not following this user"}
      </p>

      <h3 className="mt-4 text-lg">Followers List</h3>
      <ul className="list-disc list-inside">
        {followersList.map((f: any) => (
          <li key={f.principal_id}>
            {f.username} ({f.principal_id})
          </li>
        ))}
      </ul>

      <h3 className="mt-4 text-lg">Following List</h3>
      <ul className="list-disc list-inside">
        {followingList.map((f: any) => (
          <li key={f.principal_id}>
            {f.username} ({f.principal_id})
          </li>
        ))}
      </ul>

      <button
        onClick={refreshProfile}
        className="mt-4 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
      >
        Refresh Profile
      </button>
    </div>
  );
}
