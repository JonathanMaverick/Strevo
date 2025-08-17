import { useQueryCall, useUpdateCall } from '@ic-reactor/react';
import { useConnect } from '@connect2ic/react';
import { User } from '../interfaces/user';
import { Followers, Following } from '../interfaces/following';
import {
  isErrResult,
  isOkResult,
  MotokoResult,
} from '../interfaces/motoko-result';
import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/auth.context';

export function useFollowing() {
  const {principal} = useAuth();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const {
    data: followingData,
    loading: followingLoading,
    error: followingError,
    call: fetchFollowing,
  } = useQueryCall({
    functionName: 'getAllFollowing',
    args: [principal || ''],
    refetchOnMount: false,
  });

  const {
    data: followersData,
    loading: followersLoading,
    error: followersError,
    call: fetchFollowers,
  } = useQueryCall({
    functionName: 'getAllFollowers',
    args: [principal || ''],
    refetchOnMount: false,
  });

  const {
    data: followersCountData,
    loading: followersCountLoading,
    error: followersCountError,
    call: fetchFollowersCount,
  } = useQueryCall({
    functionName: 'getFollowersCount',
    args: [selectedUser || ''],
    refetchOnMount: false,
  });

  const {
    data: followingCountData,
    loading: followingCountLoading,
    error: followingCountError,
    call: fetchFollowingCount,
  } = useQueryCall({
    functionName: 'getFollowingCount',
    args: [principal || ''],
    refetchOnMount: false,
  });

  const {
    data: isFollowingData,
    loading: isFollowingLoading,
    error: isFollowingError,
    call: checkIsFollowing,
  } = useQueryCall({
    functionName: 'isFollowing',
    args: [principal || '', selectedUser || ''],
    refetchOnMount: false,
  });

  const {
    data: followResult,
    loading: followLoading,
    error: followError,
    call: followUser,
  } = useUpdateCall({
    functionName: 'follow',
    onSuccess: (result) => {
      console.log('Follow result:', result);
      const typedResult = result as MotokoResult<string, string>;
      if (isErrResult(typedResult)) {
        console.error('Follow failed:', typedResult.err);
        return;
      }
      console.log('Successfully followed user:', typedResult.ok);
      refetchFollowingData();
    },
    onError: (error) => {
      console.error('Follow failed:', error);
    },
  });

  const {
    data: unfollowResult,
    loading: unfollowLoading,
    error: unfollowError,
    call: unfollowUser,
  } = useUpdateCall({
    functionName: 'unfollow',
    onSuccess: (result) => {
      console.log('Unfollow result:', result);
      const typedResult = result as MotokoResult<string, string>;
      if (isErrResult(typedResult)) {
        console.error('Unfollow failed:', typedResult.err);
        return;
      }
      refetchFollowingData();
    },
    onError: (error) => {
      console.error('Unfollow failed:', error);
    },
  });

  const getFollowingList = (): Following[] => {
    const result = followingData as
      | MotokoResult<Following[], string>
      | null
      | undefined;
    if (!isOkResult(result)) return [];
    return result.ok;
  };

  const getFollowersList = (): Followers[] => {
    const result = followersData as
      | MotokoResult<Followers[], string>
      | null
      | undefined;
    if (!isOkResult(result)) return [];
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

  const getFollowError = (): string | null => {
    const result = followResult as
      | MotokoResult<string, string>
      | null
      | undefined;
    if (!isErrResult(result)) return null;
    return result.err;
  };

  const getUnfollowError = (): string | null => {
    const result = unfollowResult as
      | MotokoResult<string, string>
      | null
      | undefined;
    if (!isErrResult(result)) return null;
    return result.err;
  };

  const handleFollow = async (targetPrincipal: string) => {
    console.log(principal);
    if (!principal) throw new Error('Wallet not connected');
    await followUser([principal, targetPrincipal]);
  };

  const handleUnfollow = async (targetPrincipal: string) => {
    if (!principal) throw new Error('Wallet not connected');
    await unfollowUser([principal, targetPrincipal]);
  };

  const handleToggleFollow = async (targetPrincipal: string) => {
    if (!principal) throw new Error('Wallet not connected');

    setSelectedUser(targetPrincipal);
    await checkIsFollowing([principal, targetPrincipal]);

    const currentlyFollowing = getIsFollowing();

    if (currentlyFollowing) {
      await handleUnfollow(targetPrincipal);
    } else {
      await handleFollow(targetPrincipal);
    }
  };

  const checkFollowingStatus = async (targetPrincipal: string) => {
    console.log('checking following status for', principal);
    if (!principal) return false;
    console.log(principal, targetPrincipal)
    setSelectedUser(targetPrincipal);
    await checkIsFollowing([principal, targetPrincipal]);
    return getIsFollowing();
  };

  const getUserFollowersCount = async (userPrincipal: string) => {
    setSelectedUser(userPrincipal);
    await fetchFollowersCount([userPrincipal]);
    return getFollowersCount();
  };

  const getUserFollowingCount = async (userPrincipal: string) => {
    await fetchFollowingCount([userPrincipal]);
    return getFollowingCount();
  };

  const refetchFollowingData = useCallback(() => {
    if (!principal) return;

    fetchFollowing([principal]);
    fetchFollowingCount([principal]);

    if (selectedUser) {
      fetchFollowersCount([selectedUser]);
      checkIsFollowing([principal, selectedUser]);
    }
  }, [
    principal,
    selectedUser,
    fetchFollowing,
    fetchFollowingCount,
    fetchFollowersCount,
    checkIsFollowing,
  ]);

  const refetchFollowersData = useCallback(() => {
    if (!principal) return;

    fetchFollowers([principal]);
    fetchFollowersCount([principal]);

    if (selectedUser) {
      fetchFollowingCount([selectedUser]);
      checkIsFollowing([selectedUser, principal]);
    }
  }, [
    principal,
    selectedUser,
    fetchFollowers,
    fetchFollowingCount,
    fetchFollowersCount,
    checkIsFollowing,
  ]);

  const getFollowingUsers = (): User[] => {
    const followingList = getFollowingList();
    return followingList.map((following) => following.following);
  };

  return {
    principal,

    followingList: getFollowingList(),
    followersList: getFollowersList(),
    followingUsers: getFollowingUsers(),
    followingCount: getFollowingCount(),
    followersCount: getFollowersCount(),
    isFollowing: getIsFollowing(),

    followingLoading,
    followersLoading,
    followersCountLoading,
    followingCountLoading,
    isFollowingLoading,
    followLoading,
    unfollowLoading,

    followingError,
    followersError,
    followersCountError,
    followingCountError,
    isFollowingError,
    followError: getFollowError(),
    unfollowError: getUnfollowError(),

    handleFollow,
    handleUnfollow,
    handleToggleFollow,
    checkFollowingStatus,
    getUserFollowersCount,
    getUserFollowingCount,

    refetchFollowingData,
    refetchFollowersData,

    selectedUser,
    setSelectedUser,
  };
}
