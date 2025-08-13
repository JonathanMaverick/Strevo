import { Menu, PlayCircle, X, User, UserPlus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ConnectButton, ConnectDialog, useConnect } from '@connect2ic/react';
import { useUserAuth } from '../services/userAuthService';

export default function Navbar() {
  const { disconnect } = useConnect();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const {
    isConnected,
    principal,
    user,
    handleLogin,
    handleRegister,
    userLoading,
  } = useUserAuth();

  useEffect(() => {
    if (isConnected && principal) {
      handleLogin();
    }
  }, [isConnected, principal, handleLogin]);

  const handleRegisterSubmit = async (formData: FormData) => {
    const username = formData.get('username') as string;
    const profile_picture = formData.get('profile_picture') as string;

    try {
      await handleRegister({
        principal_id: principal,
        username,
        profile_picture,
      });
      setShowRegisterModal(false);
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  const renderUserStatus = () => {
    if (!isConnected) {
      return <ConnectButton>Connect Wallet</ConnectButton>;
    }

    if (user) {
      return (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-sky-400" />
            <span className="text-sm text-white/90">{user.username}</span>
          </div>
          <button
            onClick={disconnect}
            className="text-sm text-white/60 hover:text-white/80"
          >
            Disconnect
          </button>
        </div>
      );
    }

    if (userLoading) {
      return (
        <div className="flex items-center gap-3">
          <span className="text-sm text-white/60">
            Wallet: {principal?.slice(0, 8)}...{principal?.slice(-4)}
          </span>
          <button
            onClick={() => setShowRegisterModal(true)}
            className="flex items-center gap-1 text-sm text-sky-400 hover:text-sky-300"
          >
            <UserPlus className="h-4 w-4" />
            Loading...
          </button>
          <button
            onClick={disconnect}
            className="text-sm text-white/60 hover:text-white/80"
          >
            Disconnect
          </button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-white/60">
          Wallet: {principal?.slice(0, 8)}...{principal?.slice(-4)}
        </span>
        <button
          onClick={() => setShowRegisterModal(true)}
          className="flex items-center gap-1 text-sm text-sky-400 hover:text-sky-300"
        >
          <UserPlus className="h-4 w-4" />
          Register
        </button>
        <button
          onClick={disconnect}
          className="text-sm text-white/60 hover:text-white/80"
        >
          Disconnect
        </button>
      </div>
    );
  };

  return (
    <>
      <header className="relative z-50 border-b border-white/5">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 shadow-lg shadow-sky-500/25">
              <PlayCircle className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold tracking-tight">
              ICP Stream
            </span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <Link to="/" className="text-sm text-white/80 hover:text-white">
              Browse
            </Link>
            <Link
              to="/following"
              className="text-sm text-white/80 hover:text-white"
            >
              Following
            </Link>
            <a href="#" className="text-sm text-white/80 hover:text-white">
              Esports
            </a>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            {renderUserStatus()}
          </div>

          <button
            className="md:hidden inline-flex items-center justify-center rounded-lg border border-white/10 p-2"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
        </nav>

        {mobileOpen && (
          <div className="md:hidden">
            <div
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <div className="fixed right-0 top-0 z-50 h-full w-80 bg-[#0B1220] shadow-2xl ring-1 ring-white/10">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-sky-500 to-blue-600">
                    <PlayCircle className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-semibold">ICP Stream</span>
                </div>
                <button
                  className="rounded-lg border border-white/10 p-2"
                  onClick={() => setMobileOpen(false)}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-2 px-4 pb-6">
                {[
                  { to: '/', label: 'Browse' },
                  { to: '/following', label: 'Following' },
                  { to: '#', label: 'Esports' },
                ].map((i) => (
                  <Link
                    key={i.label}
                    to={i.to}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-xl border border-white/10 p-3 text-sm text-white/90 hover:bg-white/5"
                  >
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

      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl bg-[#0B1220] border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">
                Create Account
              </h2>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="rounded-lg border border-white/10 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleRegisterSubmit(formData);
              }}
              className="space-y-4"
            >
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-white/80 mb-2"
                >
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  required
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-white/40 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  placeholder="Enter your username"
                />
              </div>

              <div>
                <label
                  htmlFor="profile_picture"
                  className="block text-sm font-medium text-white/80 mb-2"
                >
                  Profile Picture (URL)
                </label>
                <input
                  type="text"
                  id="profile_picture"
                  name="profile_picture"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-white/40 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  placeholder="https://example.com/avatar.png"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="flex-1 rounded-lg border border-white/20 px-4 py-2 text-sm text-white/80 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-2 text-sm font-medium text-white hover:from-sky-600 hover:to-blue-700 disabled:opacity-50"
                >
                  Create account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
