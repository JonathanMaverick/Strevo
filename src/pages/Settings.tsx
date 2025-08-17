import React, { useEffect, useMemo, useRef, useState, FormEvent } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { Camera, Upload, Trash2, Loader2, Check } from 'lucide-react';
import { useUpdateCall } from '@ic-reactor/react';
import {
  buildSupabasePublicUrl,
  uploadDirectToSupabaseS3,
} from '../services/storageService';
import { useUserProfile } from '../services/userProfileService';

export default function Settings() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
  const {
    user,
    refreshProfile,
    isConnected,
  } = useUserProfile();

  const [displayName, setDisplayName] = useState('');
  const [currentAvatar, setCurrentAvatar] = useState<string | undefined>(
    undefined,
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    setDisplayName((prev) => prev || user.username || '');
    setCurrentAvatar(user.profile_picture || undefined);
  }, [user]);

  const { call: updateUserCall, loading: updateLoading } = useUpdateCall({
    functionName: 'updateUser',
    onSuccess: async () => {
      await refreshProfile();
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    },
    onError: (e: any) => setError(e?.message || 'Failed to update profile.'),
  });

  const hasChanges = useMemo(() => {
    const nameChanged = user
      ? displayName.trim() !== (user.username || '')
      : displayName.trim().length > 0;
    const avatarChanged = !!selectedFile;
    return nameChanged || avatarChanged;
  }, [displayName, user, selectedFile]);

  const pickFile = () => fileInputRef.current?.click();

  const onFileChosen = (file?: File | null) => {
    if (!file) return;
    if (!/^image\//.test(file.type)) {
      setError('Please choose an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Max file size is 5MB.');
      return;
    }
    setError(null);
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(url);
  };

  const clearNewPhoto = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setSelectedFile(null);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setError('Display name is required.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      let finalAvatarUrl = currentAvatar;
      if (selectedFile) {
        setUploading(true);
        const res = await uploadDirectToSupabaseS3(selectedFile);
        finalAvatarUrl = buildSupabasePublicUrl({
          supabaseUrl,
          bucket: res.bucket,
          key: res.key,
        });
      }
      await updateUserCall([displayName.trim(), finalAvatarUrl || '']);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setSelectedFile(null);
      setCurrentAvatar(finalAvatarUrl || undefined);
    } catch (err: any) {
      setError(err?.message || 'Failed to save changes.');
    } finally {
      setUploading(false);
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0E17] text-white">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-gradient-to-tr from-blue-600/30 via-sky-500/20 to-cyan-400/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-[28rem] w-[28rem] rounded-full bg-gradient-to-tr from-indigo-600/25 via-blue-600/20 to-sky-400/10 blur-[100px]" />
      </div>
      <Navbar />
      <section className="relative mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
        >
          <div className="border-b border-white/10 px-5 py-4 sm:px-6">
            <h1 className="text-lg font-semibold tracking-tight">Settings</h1>
            <p className="mt-1 text-xs text-white/60">
              Update your display name and profile picture.
            </p>
          </div>
          <form
            onSubmit={onSubmit}
            className="grid gap-6 p-5 sm:p-6 lg:grid-cols-3"
          >
            <div className="lg:col-span-2 space-y-6">
              <div>
                <label className="text-xs font-medium text-white/80">
                  Display Name
                </label>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your display name"
                  maxLength={40}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none placeholder:text-white/40 focus:border-white/20"
                />
                <div className="mt-1 text-[10px] text-white/50">
                  {displayName.length}/40
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-white/80">
                  Profile Picture
                </label>
                <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                  <div className="flex items-center gap-3">
                    <div className="relative h-16 w-16 overflow-hidden rounded-full ring-2 ring-white/10">
                      <img
                        alt="avatar"
                        src={
                          previewUrl
                            ? previewUrl
                            : currentAvatar
                              ? currentAvatar
                              : `data:image/svg+xml;utf8,${encodeURIComponent(avatarSvg((displayName?.[0] || 'U').toUpperCase()))}`
                        }
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={pickFile}
                      className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium hover:bg-white/10"
                    >
                      <Camera className="h-4 w-4" />
                      Change photo
                    </button>
                    {previewUrl && (
                      <button
                        type="button"
                        onClick={clearNewPhoto}
                        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/0 px-3 py-2 text-xs hover:bg-white/5"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </button>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        onFileChosen(e.target.files?.[0] ?? null)
                      }
                    />
                  </div>
                </div>
              </div>
              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                  {error}
                </div>
              )}
            </div>
            <div className="lg:col-span-1">
              <div className="sticky top-6 space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <div className="text-sm font-semibold text-white/80">
                  Preview
                </div>
                <div className="mt-1 flex items-center gap-3">
                  <div className="h-12 w-12 overflow-hidden rounded-full ring-2 ring-white/10">
                    <img
                      alt="preview"
                      src={
                        previewUrl
                          ? previewUrl
                          : currentAvatar
                            ? currentAvatar
                            : `data:image/svg+xml;utf8,${encodeURIComponent(avatarSvg((displayName?.[0] || 'U').toUpperCase()))}`
                      }
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="text-sm font-medium">
                      {displayName || user?.username || 'Your name'}
                    </div>
                    <div className="text-[11px] text-white/50">
                      Public profile
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={
                    saving || uploading || updateLoading || !displayName.trim()
                  }
                  className={`flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold ${
                    saving || uploading || updateLoading || !displayName.trim()
                      ? 'cursor-not-allowed border border-white/10 bg-white/5 text-white/50'
                      : 'bg-gradient-to-r from-sky-500 to-blue-600 text-white'
                  }`}
                >
                  {(saving || uploading || updateLoading) && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {saved && !(saving || uploading || updateLoading) && (
                    <Check className="h-4 w-4" />
                  )}
                  {saved
                    ? 'Saved'
                    : saving || uploading || updateLoading
                      ? 'Saving…'
                      : 'Save changes'}
                </button>
                <div className="text-[10px] text-white/50">
                  Changes may take a moment to appear across the site.
                </div>
              </div>
            </div>
          </form>
        </motion.div>
      </section>
      <Footer />
    </div>
  );
}

function avatarSvg(letter: string) {
  return `
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#0EA5E9"/>
        <stop offset="100%" stop-color="#2563EB"/>
      </linearGradient>
      <filter id="blur" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="2"/>
      </filter>
    </defs>
    <rect width="64" height="64" rx="14" fill="url(#g)"/>
    <circle cx="18" cy="14" r="6" fill="#ffffff30" filter="url(#blur)"/>
    <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="28" font-family="Inter, system-ui" fill="white">${letter}</text>
  </svg>`;
}
