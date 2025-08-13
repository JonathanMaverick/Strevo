import { useQueryCall, useUpdateCall } from '@ic-reactor/react';
import { ArrowRight, Menu, PlayCircle, X } from 'lucide-react';
import React, { useState } from 'react';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: count, refetch } = useQueryCall({
    functionName: 'get',
  });

  const { call: increment, loading } = useUpdateCall({
    functionName: 'inc',
    onSuccess: refetch,
  });

  const [walletConnected, setWalletConnected] = useState(false);
  const [principal, setPrincipal] = useState<string | null>(null);

  const connectWallet = async () => {
    if (!window.ic || !window.ic.plug) {
      alert('Plug wallet not detected. Please install it first!');
      return;
    }
    try {
      const connected = await window.ic.plug.requestConnect();
      if (connected) {
        const principal = await window.ic.plug.agent.getPrincipal();
        setPrincipal(principal.toText());
        setWalletConnected(true);
        alert('Wallet connected! Principal: ' + principal.toText());
      } else {
        alert('User rejected the connection.');
      }
    } catch (err) {
      console.error('Error connecting wallet:', err);
      alert('Failed to connect wallet.');
    }
  };

  return (
    <header className="relative z-50 border-b border-white/5">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <a href="#" className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 shadow-lg shadow-sky-500/25">
            <PlayCircle className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight">
            ICP Stream
          </span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          <a href="/" className="text-sm text-white/80 hover:text-white">
            Browse
          </a>
          <a
            href="/following"
            className="text-sm text-white/80 hover:text-white"
          >
            Following
          </a>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {!walletConnected ? (
            <button
              onClick={connectWallet}
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-2 text-sm font-medium shadow-lg shadow-sky-600/30 hover:opacity-95"
            >
              Connect Wallet
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          ) : (
            <p>Wallet Connected: {principal}</p>
          )}
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
                { href: '#', label: 'Browse' },
                { href: '#', label: 'Following' },
                { href: '#', label: 'Esports' },
              ].map((i) => (
                <a
                  key={i.href}
                  href={i.href}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-xl border border-white/10 p-3 text-sm text-white/90 hover:bg-white/5"
                >
                  {i.label}
                </a>
              ))}
              <div className="pt-2">
                <a
                  href="#"
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-2 text-sm font-medium shadow-lg shadow-sky-600/30 hover:opacity-95"
                >
                  Go live{' '}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
