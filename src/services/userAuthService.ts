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
      console.log(result);

      const typedResult = result as { err?: string };
      if (typedResult?.err) {
        console.error('Registration failed:', typedResult.err);
        return;
      }

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

  function generateStreamingKey() {
    return [...crypto.getRandomValues(new Uint8Array(8))]
      .map((b) => b.toString(36).padStart(2, '0'))
      .join('')
      .slice(0, 8);
  }

  const handleRegister = async (registrationData: UserRegistrationData) => {
    if (!principal) throw new Error('Wallet not connected');

    const userData = {
      ...registrationData,
      created_at: 1,
      streaming_key: generateStreamingKey(),
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
