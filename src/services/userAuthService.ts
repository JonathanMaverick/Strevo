import { useQueryCall, useUpdateCall } from '@ic-reactor/react';
import { useConnect } from '@connect2ic/react';
import { User, UserRegistrationData } from '../interfaces/user';
import {
  isErrResult,
  isOkResult,
  MotokoResult,
} from '../interfaces/motoko-result';

export function useUserAuth() {
  const { isConnected, principal } = useConnect();

  const {
    data: userData,
    loading: userLoading,
    error: userError,
    call: fetchUser,
  } = useQueryCall({
    functionName: 'getUser',
    args: [principal || ''],
    refetchOnMount: false,
  });

  const {
    data: registerResult,
    loading: registerLoading,
    error: registerError,
    call: registerUser,
  } = useUpdateCall({
    functionName: 'register',
    onSuccess: (result) => {
      console.log('User registered successfully:', result);
      fetchUser([principal || '']);
    },
    onError: (error) => {
      console.error('Registration failed:', error);
    },
  });

  const getUserData = (): User | null => {
    const result = userData as MotokoResult<User, string> | null | undefined;

    if (!isOkResult(result)) return null;
    return result.ok;
  };

  const getRegisterError = (): string | null => {
    const result = registerResult as
      | MotokoResult<User, string>
      | null
      | undefined;

    if (!isErrResult(result)) return null;
    return result.err;
  };

  const handleRegister = async (registrationData: UserRegistrationData) => {
    if (!principal) throw new Error('Wallet not connected');

    const userData = {
      ...registrationData,
      createdAt: new Date().toISOString(),
    };

    await registerUser([principal, userData]);
    await fetchUser([principal]);
  };

  const handleLogin = async () => {
    if (!principal) throw new Error('Wallet not connected');
    await fetchUser([principal]);
  };

  return {
    isConnected,
    principal,
    user: getUserData(),

    userLoading,
    registerLoading,

    userError,
    registerError,

    handleLogin,
    handleRegister,
    refetchUser: () => fetchUser([principal || '']),
  };
}
