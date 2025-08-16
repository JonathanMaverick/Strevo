import { useQueryCall, useUpdateCall } from '@ic-reactor/react';
import { useConnect } from '@connect2ic/react';
import { User, UserRegistrationData } from '../interfaces/user';
import {
  isErrResult,
  isOkResult,
  MotokoResult,
} from '../interfaces/motoko-result';
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
} from 'react';

export interface AuthContextType {
  isConnected: boolean;
  principal: string | null | undefined;
  user: User | null;
  userLoading: boolean;
  registerLoading: boolean;
  userError: any;
  registerError: string | null;
  handleLogin: () => Promise<void>;
  handleRegister: (data: UserRegistrationData) => Promise<void>;
  refetchUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
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
    call: registerUser,
  } = useUpdateCall({
    functionName: 'register',
    onSuccess: (result) => {
      const typedResult = result as { err?: string };
      if (typedResult?.err) {
        console.error('Registration failed:', typedResult.err);
        return;
      }
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
  };

  const handleLogin = async () => {
    if (!principal) throw new Error('Wallet not connected');
    await fetchUser([principal]);
  };

  useEffect(() => {
    if (principal && isConnected) {
      fetchUser([principal]);
    }
  }, [principal, isConnected, fetchUser]);

  const contextValue = useMemo<AuthContextType>(
    () => ({
      isConnected,
      principal,
      user: getUserData(),
      userLoading,
      registerLoading,
      userError,
      registerError: getRegisterError(),
      handleLogin,
      handleRegister,
      refetchUser: () => fetchUser([principal || '']),
    }),
    [
      isConnected,
      principal,
      userData,
      userLoading,
      registerLoading,
      userError,
      registerResult,
      fetchUser,
    ]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useUserAuth must be used within a UserAuthProvider');
  }
  return context;
}

export function useAuthOptional(): AuthContextType | null {
  return useContext(AuthContext) || null;
}
