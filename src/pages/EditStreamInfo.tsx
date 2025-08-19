import { useState } from 'react';
import Loading from './Loading';
import Navbar from '../components/Navbar';
import { Lock } from 'lucide-react';
import Footer from '../components/Footer';
import EditStreamInfoForm from '../components/EditStreamInfoForm';
import { useAuth } from '../contexts/auth.context';

export default function EditStreamInfo() {
  const { user, userLoading } = useAuth();
  const principal = user?.principal_id as string | undefined;

  if (userLoading) return <Loading />;

  if (!user || !principal) {
    return (
      <div className="min-h-screen bg-[#0A0E17] text-white flex flex-col">
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 overflow-hidden"
        >
          <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-gradient-to-tr from-blue-600/30 via-sky-500/20 to-cyan-400/20 blur-3xl" />
          <div className="absolute -bottom-40 -right-40 h-[28rem] w-[28rem] rounded-full bg-gradient-to-tr from-indigo-600/25 via-blue-600/20 to-sky-400/10 blur-[100px]" />
        </div>
        <Navbar />

        <div className="relative flex min-h-[80vh] items-center justify-center px-4">
          <div className="w-full max-w-md">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-sky-500/30 bg-gradient-to-r from-sky-500/20 to-blue-600/20">
                <Lock className="h-8 w-8 text-sky-400" />
              </div>
              <h1 className="mb-3 text-xl font-semibold">
                Authentication Required
              </h1>
              <p className="text-white/70">
                Connect your wallet to edit your stream info.
              </p>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0E17] text-white flex flex-col">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-gradient-to-tr from-blue-600/30 via-sky-500/20 to-cyan-400/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-[28rem] w-[28rem] rounded-full bg-gradient-to-tr from-indigo-600/25 via-blue-600/20 to-sky-400/10 blur-[100px]" />
      </div>

      <Navbar />
      <EditStreamInfoForm principalId={principal} />
      <Footer />
    </div>
  );
}
