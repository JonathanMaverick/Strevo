import React, { createContext, useContext, useEffect, useMemo, useState } from "react"
import { useQueryCall, useUpdateCall } from "@ic-reactor/react"
import { useConnect } from "@connect2ic/react"
import { User, UserRegistrationData } from "../interfaces/user"
import { isErrResult, isOkResult, MotokoResult } from "../interfaces/motoko-result"

export interface AuthContextType {
  isConnected: boolean
  isConnecting: boolean
  principal: string | null | undefined
  user: User | null
  userLoading: boolean
  registerLoading: boolean
  userError: any
  registerError: string | null
  handleDisconnect: () => Promise<void>
  handleRegister: (data: UserRegistrationData) => Promise<void>
  refetchUser: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isConnected, isConnecting, principal, disconnect } = useConnect()
  const [effectivePrincipal, setEffectivePrincipal] = useState<string | null>(null)

  useEffect(() => {
    if (isConnected && principal) {
      setEffectivePrincipal(principal)
    } else {
      setEffectivePrincipal(null)
    }
  }, [isConnected, principal])

  const {
    data: userData,
    loading: userLoading,
    error: userError,
    call: fetchUser,
  } = useQueryCall({
    functionName: "getUser",
    args: [effectivePrincipal || ""],
    refetchOnMount: false,
  })

  const {
    data: registerResult,
    loading: registerLoading,
    call: registerUser,
  } = useUpdateCall({
    functionName: "register",
    onSuccess: () => {
      if (effectivePrincipal) fetchUser([effectivePrincipal])
    },
  })

  function generateStreamingKey() { return [...crypto.getRandomValues(new Uint8Array(8))] .map((b) => b.toString(36).padStart(2, '0')) .join('') .slice(0, 8); }

  const getUserData = (): User | null => {
    const result = userData as MotokoResult<User, string> | null | undefined
    if (!isOkResult(result)) return null
    return result.ok
  }

  const getRegisterError = (): string | null => {
    const result = registerResult as MotokoResult<User, string> | null | undefined
    if (!isErrResult(result)) return null
    return result.err
  }

  const handleRegister = async (registrationData: UserRegistrationData) => {
    if (!effectivePrincipal) throw new Error("Wallet not connected")
    const userData = { ...registrationData, created_at: Date.now(), streaming_key: generateStreamingKey(), }
    await registerUser([effectivePrincipal, userData])
  }

  useEffect(() => {
    if (effectivePrincipal) fetchUser([effectivePrincipal])
  }, [effectivePrincipal])

  const handleDisconnect = async () => {
    try {
      console.log('Disconnecting wallet and clearing user data...')
      setEffectivePrincipal(null)
      await disconnect()
      
      console.log('Wallet disconnected successfully')
    } catch (error) {
      console.error('Error during disconnect:', error)
      setEffectivePrincipal(null)
      throw error
    }
  }

  const contextValue = useMemo<AuthContextType>(
    () => ({
      isConnected,
      isConnecting,
      principal: effectivePrincipal,
      user: getUserData(),
      userLoading,
      registerLoading,
      userError,
      registerError: getRegisterError(),
      handleRegister,
      handleDisconnect,
      refetchUser: () => fetchUser([effectivePrincipal || ""]),
    }),
    [isConnected, effectivePrincipal, userData, userLoading, registerLoading, userError, registerResult, fetchUser]
  )

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function useAuthOptional(): AuthContextType | null {
  return useContext(AuthContext) || null
}
