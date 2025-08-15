import { Menu, PlayCircle, X, User, UserPlus } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ConnectButton, ConnectDialog, useConnect } from '@connect2ic/react'
import { useUserAuth } from '../services/userAuthService'
import RegisterModal from '../components/RegisterModal'

export default function Navbar() {
  const { disconnect } = useConnect()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)

  const { isConnected, principal, user, handleLogin, handleRegister } = useUserAuth()

  useEffect(() => {
    if (isConnected && principal) handleLogin()
  }, [isConnected, principal, handleLogin])

  const onRegister = async ({ username, profile_picture }: { username: string; profile_picture: string }) => {
    await handleRegister({ principal_id: principal, username, profile_picture })
  }

  const renderUserStatus = () => {
    if (!isConnected) return <ConnectButton>Connect Wallet</ConnectButton>
    if (user)
      return (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-sky-400" />
            <span className="text-sm text-white/90">{user.username}</span>
          </div>
          <button onClick={disconnect} className="text-sm text-white/60 hover:text-white/80">
            Disconnect
          </button>
        </div>
      )
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-white/60">
          Wallet: {principal?.slice(0, 8)}...{principal?.slice(-4)}
        </span>
        <button onClick={() => setShowRegisterModal(true)} className="flex items-center gap-1 text-sm text-sky-400 hover:text-sky-300">
          <UserPlus className="h-4 w-4" />
          Register
        </button>
        <button onClick={disconnect} className="text-sm text-white/60 hover:text-white/80">
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <>
      <header className="relative z-50 border-b border-white/5">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 shadow-lg shadow-sky-500/25">
              <PlayCircle className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold tracking-tight">ICP Stream</span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <Link to="/" className="text-sm text-white/80 hover:text-white">
              Browse
            </Link>
            <Link to="/following" className="text-sm text-white/80 hover:text-white">
              Following
            </Link>
            <a href="#" className="text-sm text-white/80 hover:text-white">
              Esports
            </a>
          </div>

          <div className="hidden items-center gap-3 md:flex">{renderUserStatus()}</div>

          <button className="md:hidden inline-flex items-center justify-center rounded-lg border border-white/10 p-2" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
        </nav>

        {mobileOpen && (
          <div className="md:hidden">
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <div className="fixed right-0 top-0 z-50 h-full w-80 bg-[#0B1220] shadow-2xl ring-1 ring-white/10">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-sky-500 to-blue-600">
                    <PlayCircle className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-semibold">ICP Stream</span>
                </div>
                <button className="rounded-lg border border-white/10 p-2" onClick={() => setMobileOpen(false)}>
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-2 px-4 pb-6">
                {[
                  { to: '/', label: 'Browse' },
                  { to: '/following', label: 'Following' },
                  { to: '#', label: 'Esports' },
                ].map(i => (
                  <Link key={i.label} to={i.to} onClick={() => setMobileOpen(false)} className="block rounded-xl border border-white/10 p-3 text-sm text-white/90 hover:bg-white/5">
                    {i.label}
                  </Link>
                ))}
                <div className="pt-2">
                  <div className="w-full">{renderUserStatus()}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        <ConnectDialog />
      </header>

      <RegisterModal
        open={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onRegister={onRegister}
        supabaseUrl={import.meta.env.VITE_SUPABASE_URL as string}
      />
    </>
  )
}
