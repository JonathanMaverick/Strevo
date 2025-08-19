import {
  Menu,
  PlayCircle,
  X,
  User,
  UserPlus,
  ChevronDown,
  Settings,
  LogOut,
  Loader2,
  SquarePen,
} from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ConnectButton, ConnectDialog, useConnect } from '@connect2ic/react';
import RegisterModal from '../components/RegisterModal';
import { useAuth } from '../contexts/auth.context';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const {
    isConnected,
    principal,
    user,
    isConnecting,
    handleRegister,
    handleDisconnect,
    registerLoading,
  } = useAuth();

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (!menuOpen) return;
      const t = e.target as Node;
      if (menuRef.current?.contains(t) || triggerRef.current?.contains(t))
        return;
      setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) =>
      e.key === 'Escape' && setMenuOpen(false);

    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const onRegister = async ({
    username,
    profile_picture,
  }: {
    username: string;
    profile_picture: string;
  }) => {
    if (principal) {
      await handleRegister({
        principal_id: principal,
        username,
        profile_picture,
      });
    }
  };

  const ProfileDropdown = () => {
    if (!user) return null;
    return (
      <div className="relative z-[60]">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 hover:bg-white/10 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <div className="relative h-7 w-7 rounded-full overflow-hidden">
              {user.profile_picture ? (
                <img
                  src={user.profile_picture}
                  alt={user.username || 'User avatar'}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-xs font-medium text-white">
                  {user.username?.[0]?.toUpperCase() || 'U'}
                </span>
              )}
            </div>
            <span className="text-sm text-white/90">{user.username}</span>
          </div>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${menuOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {menuOpen && (
          <div
            ref={menuRef}
            role="menu"
            onClick={(e) => e.stopPropagation()}
            className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-white/10 bg-[#0B1220]/95 shadow-2xl ring-1 ring-black/5 backdrop-blur"
          >
            <Link
              to={`/profiles/${principal}`}
              role="menuitem"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-white/90 hover:bg-white/5"
            >
              <User className="h-4 w-4" />
              My Profile
            </Link>
            <Link
              to="/edit-stream-info"
              role="menuitem"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-white/90 hover:bg-white/5"
            >
              <SquarePen className="h-4 w-4" />
              Edit Stream Info
            </Link>
            <Link
              to="/settings"
              role="menuitem"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-white/90 hover:bg-white/5"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
            <button
              role="menuitem"
              type="button"
              onClick={() => {
                setMenuOpen(false);
                handleDisconnect();
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-white/90 hover:bg-white/5"
            >
              <LogOut className="h-4 w-4" />
              Disconnect
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderUserStatus = () => {
    if (!isConnected)
      return (
        <>
          <ConnectButton>Connect Wallet</ConnectButton> <ConnectDialog />
        </>
      );
    if (isConnecting)
      return (
        <>
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />{' '}
          <span className="text-blue-600 font-medium">
            Connecting wallet...
          </span>
        </>
      );
    if (user) return <ProfileDropdown />;
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-white/60">
          Wallet: {principal?.slice(0, 8)}...{principal?.slice(-4)}
        </span>
        <button
          type="button"
          onClick={() => setShowRegisterModal(true)}
          className="flex items-center gap-1 text-sm text-sky-400 hover:text-sky-300"
        >
          <UserPlus className="h-4 w-4" />
          Register
        </button>
        <button
          type="button"
          onClick={handleDisconnect}
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
            className="inline-flex items-center justify-center rounded-lg border border-white/10 p-2 md:hidden"
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
                  {!isConnected ? (
                    <ConnectButton>Connect Wallet</ConnectButton>
                  ) : user ? (
                    <div className="rounded-xl border border-white/10 p-3">
                      <div className="mb-2 flex items-center gap-2">
                        <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-sky-500 to-blue-600">
                          <User className="h-4 w-4" />
                        </div>
                        <span className="text-sm text-white/90">
                          {user.username}
                        </span>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Link
                          to="/profiles"
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/90 hover:bg-white/5"
                        >
                          <User className="h-4 w-4" />
                          My Profile
                        </Link>
                        <Link
                          to="/edit-stream-info"
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/90 hover:bg-white/5"
                        >
                          <SquarePen className="h-4 w-4" />
                          Edit Stream Info
                        </Link>
                        <Link
                          to="/settings"
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/90 hover:bg-white/5"
                        >
                          <Settings className="h-4 w-4" />
                          Settings
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            setMobileOpen(false);
                            handleDisconnect();
                          }}
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-white/90 hover:bg-white/5"
                        >
                          <LogOut className="h-4 w-4" />
                          Disconnect
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-white/60">
                        {principal
                          ? `Wallet: ${principal.slice(0, 8)}...${principal.slice(-4)}`
                          : 'Wallet connected'}
                      </span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setMobileOpen(false);
                            setShowRegisterModal(true);
                          }}
                          className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-sky-400 hover:text-sky-300"
                        >
                          <UserPlus className="h-4 w-4" />
                          Register
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setMobileOpen(false);
                            handleDisconnect();
                          }}
                          className="rounded-lg px-3 py-2 text-sm text-white/60 hover:text-white/80"
                        >
                          Disconnect
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      <RegisterModal
        open={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onRegister={onRegister}
        supabaseUrl={import.meta.env.VITE_SUPABASE_URL as string}
        registerLoading={registerLoading}
      />
    </>
  );
}
