import { X } from 'lucide-react';
import { useState } from 'react';
import {
  buildSupabasePublicUrl,
  uploadDirectToSupabaseS3,
} from '../services/storageService';

type Props = {
  open: boolean;
  onClose: () => void;
  onRegister: (data: {
    username: string;
    profile_picture: string;
  }) => Promise<void>;
  supabaseUrl: string;
};

export default function RegisterModal({
  open,
  onClose,
  onRegister,
  supabaseUrl,
}: Props) {
  const [username, setUsername] = useState('');
  const [profileUrl, setProfileUrl] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  const handleFile = async (file?: File | null) => {
    if (!file) return;
    setBusy(true);
    try {
      const res = await uploadDirectToSupabaseS3(file);
      const url = buildSupabasePublicUrl({
        supabaseUrl,
        bucket: res.bucket,
        key: res.key,
      });
      setProfileUrl(url);
      setPreview(URL.createObjectURL(file));
    } finally {
      setBusy(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) return;
    await onRegister({ username, profile_picture: profileUrl });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-2xl bg-[#0B1220] border border-white/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Create Account</h2>
          <button
            onClick={onClose}
            className="rounded-lg border border-white/10 p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-white/80 mb-2"
            >
              Username
            </label>
            <input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-white/40 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              placeholder="Enter your username"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-white/80">
                Profile Picture
              </label>
              {busy && (
                <span className="text-xs text-white/60">Uploading…</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <label className="inline-flex cursor-pointer rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90 hover:bg-white/10">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                />
                Choose Image
              </label>
              {preview && (
                <img
                  src={preview}
                  alt="preview"
                  className="h-12 w-12 rounded-lg object-cover"
                />
              )}
            </div>
            {profileUrl && (
              <input
                readOnly
                value={profileUrl}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80"
              />
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-white/20 px-4 py-2 text-sm text-white/80 hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy || !username}
              className="flex-1 rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-2 text-sm font-medium text-white hover:from-sky-600 hover:to-blue-700 disabled:opacity-50"
            >
              Create account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
