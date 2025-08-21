import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Loader2, Send } from 'lucide-react';
import { useUserProfile } from '../services/user-profile.service';
import { useTransfer } from '@connect2ic/react';

export default function StreamExample() {
  const { streamerId } = useParams();
  const [transferAmount, setTransferAmount] = useState<number>(0);
  const [transferStatus, setTransferStatus] = useState<string>('');

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
    isFollowing,
    isFollowingLoading,
  } = useUserProfile(streamerId);

  const [transfer, { loading: transferLoading, error: transferError }] =
    useTransfer({
      amount: transferAmount,
      to: user?.principal_id || '',
    });

  useEffect(() => {
    if (streamerId) {
      loadProfile(streamerId);
    }
  }, [streamerId]);

  const handleTransfer = async () => {
    if (!transferAmount || transferAmount <= 0) {
      setTransferStatus('Please enter a valid amount');
      return;
    }

    if (!user?.principal_id) {
      setTransferStatus('User principal ID not found');
      return;
    }

    try {
      setTransferStatus('Processing transfer...');
      const result = await transfer();
      console.log(result)
      if (result.isOk()) {
        setTransferStatus(
          `Transfer successful! Transaction: ${result.value.transactionId}`,
        );
        setTransferAmount(0);
      } else {
        setTransferStatus(`Transfer failed: ${result.error.kind}`);
      }
    } catch (err) {
      setTransferStatus(`Transfer error: ${err}`);
    }
  };

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

  return (
    <div className="p-4 text-white bg-[#0A0E17] min-h-screen">
      <h1 className="text-2xl font-bold">{user.username || 'No name'}</h1>

      <h2 className="mt-4 text-xl">Stats</h2>
      <p>Followers: {stats.followersCount}</p>
      <p>Following: {stats.followingCount}</p>
      <p>{isOwnProfile ? 'This is your profile' : 'Viewing another user'}</p>

      <p>
        {isFollowingLoading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Checking follow
            status...
          </span>
        ) : isFollowing ? (
          'You are following this user'
        ) : (
          'You are not following this user'
        )}
      </p>

      {!isOwnProfile && (
        <div className="mt-6 p-4 bg-[#1A1F2E] rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Send className="h-5 w-5" />
            Send Tip to {user.username}
          </h3>

          <div className="flex gap-2 mb-4">
            <input
              type="number"
              value={transferAmount}
              onChange={(e) => setTransferAmount(Number(e.target.value))}
              placeholder="Amount"
              className="flex-1 px-3 py-2 bg-[#0A0E17] border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              disabled={transferLoading}
            />
            <button
              onClick={handleTransfer}
              disabled={
                transferLoading || !transferAmount || transferAmount <= 0
              }
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-md font-medium transition-colors flex items-center gap-2"
            >
              {transferLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send Tip
                </>
              )}
            </button>
          </div>

          {/* Quick amount buttons */}
          <div className="flex gap-2 mb-4">
            {[1, 5, 10, 25, 50].map((amount) => (
              <button
                key={amount}
                onClick={() => setTransferAmount(amount)}
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
                disabled={transferLoading}
              >
                {amount}
              </button>
            ))}
          </div>

          {/* Transfer Status */}
          {transferStatus && (
            <div
              className={`p-3 rounded-md text-sm ${
                transferStatus.includes('successful')
                  ? 'bg-green-900/50 text-green-300 border border-green-700'
                  : transferStatus.includes('failed') ||
                      transferStatus.includes('error')
                    ? 'bg-red-900/50 text-red-300 border border-red-700'
                    : 'bg-blue-900/50 text-blue-300 border border-blue-700'
              }`}
            >
              {transferStatus}
            </div>
          )}

          {/* Transfer Error */}
          {transferError && (
            <div className="mt-2 p-3 bg-red-900/50 text-red-300 border border-red-700 rounded-md text-sm">
              Transfer Error: {transferError.kind}
            </div>
          )}
        </div>
      )}

      <h3 className="mt-6 text-lg">Followers List</h3>
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
