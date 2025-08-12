import { useQueryCall, useUpdateCall } from '@ic-reactor/react';
import { Menu, PlayCircle, X } from 'lucide-react';
import { useState } from 'react';
import { ConnectButton, ConnectDialog, useBalance, useConnect, useWallet } from "@connect2ic/react";
import "@connect2ic/core/style.css";

export default function Navbar() {
  const { isConnected, principal, disconnect } = useConnect();
  const [mobileOpen, setMobileOpen] = useState(false);

  // TODO: Kalau user pertama kali register wallet nya ke program kita, bakal ke page register(?), untuk create account
  // Biar bisa ada username, liat dia following siapa, dkk
  // Ref : https://claude.ai/share/00017dd4-909d-4c27-b192-16814243d3ca

  //Cara akses wallet dan balance dia
  const wallet = useWallet()
  const [assets] = useBalance()
  const icpAsset = assets ? assets.find((asset) => asset.name === 'ICP') : undefined;

  console.log(wallet)
  console.log(icpAsset)

  const { data: count, refetch } = useQueryCall({
    functionName: 'get',
  });

  const { call: increment, loading } = useUpdateCall({
    functionName: 'inc',
    onSuccess: refetch,
  });

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
          <a href="#" className="text-sm text-white/80 hover:text-white">
            Browse
          </a>
          <a href="#" className="text-sm text-white/80 hover:text-white">
            Following
          </a>
          <a href="#" className="text-sm text-white/80 hover:text-white">
            Esports
          </a>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {!isConnected ? (
            <ConnectButton >
              Connect Wallet
            </ConnectButton>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-sm text-white/80">
                Connected: {principal?.slice(0, 8)}...{principal?.slice(-4)}
              </span>
              <button
                onClick={disconnect}
                className="text-sm text-white/60 hover:text-white/80"
              >
                Disconnect
              </button>
            </div>
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
                {!isConnected ? (
                  <ConnectButton></ConnectButton>
                ) : (
                  <div className="flex flex-col gap-2">
                    <span className="text-xs text-white/60 text-center">
                      {principal?.slice(0, 12)}...{principal?.slice(-8)}
                    </span>
                    <button
                      onClick={disconnect}
                      className="w-full rounded-xl border border-white/20 px-4 py-2 text-sm text-white/80 hover:bg-white/5"
                    >
                      Disconnect
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      <ConnectDialog></ConnectDialog>
    </header>
  );
}