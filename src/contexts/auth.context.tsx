import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useQueryCall, useUpdateCall } from '@ic-reactor/react';
import { useConnect } from '@connect2ic/react';
import { User, UserRegistrationData } from '../interfaces/user';
import {
  isErrResult,
  isOkResult,
  MotokoResult,
} from '../interfaces/motoko-result';

export interface AuthContextType {
  isConnected: boolean;
  isConnecting: boolean;
  principal: string | null | undefined;
  user: User | null;
  userLoading: boolean;
  registerLoading: boolean;
  userError: any;
  registerError: string | null;
  handleConnect: (providerName?: string) => void;
  handleDisconnect: () => Promise<void>;
  handleRegister: (data: UserRegistrationData) => Promise<void>;
  refetchUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PRINCIPAL_STORAGE_KEY = 'user_principal_id';

const savePrincipalToStorage = (principal: string) => {
  try {
    localStorage.setItem(PRINCIPAL_STORAGE_KEY, principal);
    console.log('Principal saved to localStorage:', principal);
  } catch (error) {
    console.error('Failed to save principal to localStorage:', error);
  }
};

const getPrincipalFromStorage = (): string | null => {
  try {
    return localStorage.getItem(PRINCIPAL_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to get principal from localStorage:', error);
    return null;
  }
};

const removePrincipalFromStorage = () => {
  try {
    localStorage.removeItem(PRINCIPAL_STORAGE_KEY);
    console.log('Principal removed from localStorage');
  } catch (error) {
    console.error('Failed to remove principal from localStorage:', error);
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const {
    isConnected,
    isConnecting,
    principal,
    disconnect,
    isInitializing,
    connect,
    activeProvider,
  } = useConnect();

  const [effectivePrincipal, setEffectivePrincipal] = useState<string | null>(
    null,
  );
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const isReady = !isInitializing && !isConnecting;

  useEffect(() => {
    const savedPrincipal = getPrincipalFromStorage();
    if (savedPrincipal && !effectivePrincipal) {
      console.log('Loaded principal from localStorage:', savedPrincipal);
      setEffectivePrincipal(savedPrincipal);
    }
  }, []);

  useEffect(() => {
    console.log('Connection state:', {
      isConnected,
      principal,
      isInitializing,
      isConnecting,
      activeProvider: activeProvider?.meta?.name,
    });

    if (!isInitializing && !isInitialized) {
      setIsInitialized(true);
    }

    if (!isInitializing) {
      if (isConnected && principal) {
        console.log('Setting effective principal:', principal);
        setEffectivePrincipal(principal);
        savePrincipalToStorage(principal);
        setConnectionError(null);
      } else if (!isConnecting) {
        console.log('Clearing effective principal');
        if (getPrincipalFromStorage()) {
          setEffectivePrincipal(getPrincipalFromStorage);
          return;
        }
        setEffectivePrincipal(null);
      }
    }
  }, [
    isConnected,
    principal,
    isInitializing,
    isConnecting,
    activeProvider,
    isInitialized,
  ]);

  const {
    data: userData,
    loading: userLoading,
    error: userError,
    call: fetchUser,
  } = useQueryCall({
    functionName: 'getUser',
    args: [effectivePrincipal || ''],
    refetchOnMount: false,
  });

  const {
    data: registerResult,
    loading: registerLoading,
    call: registerUser,
  } = useUpdateCall({
    functionName: 'register',
    onSuccess: () => {
      if (effectivePrincipal && isConnected) {
        fetchUser([effectivePrincipal]);
      }
    },
    onError: (error) => {
      console.error('Registration failed:', error);
    },
  });

  function generateStreamingKey() {
    return [...crypto.getRandomValues(new Uint8Array(8))]
      .map((b) => b.toString(36).padStart(2, '0'))
      .join('')
      .slice(0, 8);
  }

  const getUserData = (): User | null => {
    if (!isConnected || !effectivePrincipal) return null;
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

  const handleConnect = (providerName?: string) => {
    try {
      setConnectionError(null);
      if (providerName) {
        connect(providerName);
      }
    } catch (error) {
      console.error('Connection failed:', error);
      setConnectionError(
        error instanceof Error ? error.message : 'Connection failed',
      );
    }
  };

  const handleRegister = async (registrationData: UserRegistrationData) => {
    if (!effectivePrincipal) throw new Error('Wallet not connected');
    if (!isConnected) throw new Error('Please connect your wallet first');

    const userData = {
      ...registrationData,
      created_at: Date.now(),
      streaming_key: generateStreamingKey(),
      bio: [],
    };

    try {
      await registerUser([effectivePrincipal, userData]);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (effectivePrincipal && isConnected && isReady) {
      fetchUser([effectivePrincipal]);
    }
  }, [effectivePrincipal, isConnected, isReady]);

  const handleDisconnect = async () => {
    try {
      console.log('Disconnecting wallet and clearing user data...');
      setEffectivePrincipal(null);
      setConnectionError(null);
      removePrincipalFromStorage();
      await disconnect();
      console.log('Wallet disconnected successfully');
    } catch (error) {
      console.error('Error during disconnect:', error);
      setEffectivePrincipal(null);
      removePrincipalFromStorage();
      throw error;
    }
  };

  const contextValue = useMemo<AuthContextType>(
    () => ({
      isConnected,
      isConnecting,
      principal: effectivePrincipal,
      user: getUserData(),
      userLoading,
      registerLoading,
      userError: userError || connectionError,
      registerError: getRegisterError(),
      handleConnect,
      handleRegister,
      handleDisconnect,
      refetchUser: () => {
        if (isReady && effectivePrincipal && isConnected) {
          fetchUser([effectivePrincipal]);
        }
      },
    }),
    [
      isConnected,
      isConnecting,
      effectivePrincipal,
      userData,
      userLoading,
      registerLoading,
      userError,
      connectionError,
      registerResult,
      fetchUser,
      isReady,
    ],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useAuthOptional(): AuthContextType | null {
  return useContext(AuthContext) || null;
}
