import { useQueryCall } from '@ic-reactor/react';
import { User } from '../interfaces/user';
import { UserStats } from '../interfaces/user-stats';
import {
  isErrResult,
  isOkResult,
  MotokoResult,
} from '../interfaces/motoko-result';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/auth.context';
import { FollowersInterface, FollowingInterface } from '../interfaces/following';

export function useUserProfile(targetPrincipal?: string) {
  const { isConnected, principal } = useAuth();
  const [profilePrincipal, setProfilePrincipal] = useState<string | null>(
    targetPrincipal || null,
  );

  const [isLoading, setIsLoading] = useState(false);

  const {
    data: userData,
    call: fetchUser,
  } = useQueryCall({
    functionName: 'getUser',
    args: [profilePrincipal || ''],
    refetchOnMount: false,
  });

  const {
    data: followersCountData,
    call: fetchFollowersCount,
  } = useQueryCall({
    functionName: 'getFollowersCount',
    args: [profilePrincipal || ''],
    refetchOnMount: false,
  });

  const {
    data: followingCountData,
    call: fetchFollowingCount,
  } = useQueryCall({
    functionName: 'getFollowingCount',
    args: [profilePrincipal || ''],
    refetchOnMount: false,
  });

  const {
    data: isFollowingData,
    call: checkIsFollowing,
  } = useQueryCall({
    functionName: 'isFollowing',
    args: [principal || '', profilePrincipal || ''],
    refetchOnMount: false,
  });

  const {
    data: followingListData,
    call: fetchFollowingList,
  } = useQueryCall({
    functionName: 'getAllFollowing',
    args: [profilePrincipal || ''],
    refetchOnMount: false,
  });

  const {
    data: followersListData,
    call: fetchFollowersList,
  } = useQueryCall({
    functionName: 'getAllFollowers',
    args: [profilePrincipal || ''],
    refetchOnMount: false,
  });

  const getUser = (): User | null => {
    const result = userData as MotokoResult<User, string> | null | undefined;
    if (!isOkResult(result)) return null;
    return result.ok;
  };

  const getFollowersCount = (): number => {
    const result = followersCountData as
      | MotokoResult<bigint, string>
      | null
      | undefined;
    if (!isOkResult(result)) return 0;
    return Number(result.ok);
  };

  const getFollowingCount = (): number => {
    const result = followingCountData as
      | MotokoResult<bigint, string>
      | null
      | undefined;
    if (!isOkResult(result)) return 0;
    return Number(result.ok);
  };

  const getIsFollowing = (): boolean => {
    const result = isFollowingData as
      | MotokoResult<boolean, string>
      | null
      | undefined;
    if (!isOkResult(result)) return false;
    return result.ok;
  };

  const getFollowingList = () => {
    const result = followingListData as
      | MotokoResult<FollowingInterface[], string>
      | null
      | undefined;
    if (!isOkResult(result)) return [];
    return result.ok;
  };

  const getFollowersList = () => {
    const result = followersListData as
      | MotokoResult<FollowersInterface[], string>
      | null
      | undefined;
    if (!isOkResult(result)) return [];
    return result.ok;
  };

  const getUserStats = (): UserStats => ({
    followersCount: getFollowersCount(),
    followingCount: getFollowingCount(),
    isFollowing: getIsFollowing(),
  });

  const getUserError = (): string | null => {
    const result = userData as MotokoResult<User, string> | null | undefined;
    if (!isErrResult(result)) return null;
    return result.err;
  };

  const getStatsError = (): string | null => {
    const followersResult = followersCountData as
      | MotokoResult<bigint, string>
      | null
      | undefined;
    const followingResult = followingCountData as
      | MotokoResult<bigint, string>
      | null
      | undefined;

    if (isErrResult(followersResult)) return followersResult.err;
    if (isErrResult(followingResult)) return followingResult.err;

    return null;
  };

  const loadProfile = useCallback(
    async (userPrincipal: string) => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchUser([userPrincipal]),
          fetchFollowersCount([userPrincipal]),
          fetchFollowingCount([userPrincipal]),
          fetchFollowingList([userPrincipal]),
          fetchFollowersList([userPrincipal]),
        ]);

        if (principal && principal !== userPrincipal) {
          await checkIsFollowing([principal, userPrincipal]);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [
      fetchUser,
      fetchFollowersCount,
      fetchFollowingCount,
      fetchFollowingList,
      fetchFollowersList,
      checkIsFollowing,
      principal,
    ],
  );

  const isOwnProfile = principal === profilePrincipal;

  const refreshProfile = useCallback(async () => {
    if (!profilePrincipal) return;
    await loadProfile(profilePrincipal);
  }, [profilePrincipal, loadProfile]);

  useEffect(() => {
    if (targetPrincipal && targetPrincipal !== profilePrincipal) {
      loadProfile(targetPrincipal);
      setProfilePrincipal(targetPrincipal);
    }
  }, [targetPrincipal, profilePrincipal, loadProfile]);

  const isProfileLoaded = Boolean(profilePrincipal && getUser());

  const hasError = Boolean(getUserError() || getStatsError());
  const error = getUserError() || getStatsError();

  return {
    user: getUser(),
    stats: getUserStats(),
    followingList: getFollowingList(),
    followersList: getFollowersList(),
    profilePrincipal,
    isOwnProfile,
    isProfileLoaded,
    isLoading,
    hasError,
    error,
    userError: getUserError(),
    statsError: getStatsError(),
    loadProfile,
    refreshProfile,
    setProfilePrincipal,
    isConnected,
  };
}
