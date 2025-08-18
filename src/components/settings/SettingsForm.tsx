import { useEffect, useMemo, useRef, useState, FormEvent } from 'react';
import { motion, time } from 'framer-motion';
import { Loader2, Check } from 'lucide-react';
import { useUpdateCall } from '@ic-reactor/react';
import AvatarUploader from './AvatarUploader';
import {
  uploadDirectToSupabaseS3,
  buildSupabasePublicUrl,
} from '../../services/storage.service';
import { useUpdateUserService } from '../../services/user.service';
import ErrorMessage from './ErrorMessage';
import PreviewCard from './PreviewCard';
import { User } from '../../interfaces/user';

export default function SettingsForm({ user }: { user: User }) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;

  const [displayName, setDisplayName] = useState('');
  const [currentAvatar, setCurrentAvatar] = useState<string | undefined>();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { updateUserCall, updateLoading, saved, error, setError } =
    useUpdateUserService();

  useEffect(() => {
    if (!user) return;
    setDisplayName((prev) => prev || user.username || '');
    setCurrentAvatar(user.profile_picture || undefined);
  }, [user]);

  const hasChanges = useMemo(() => {
    const nameChanged = displayName.trim() !== (user.username || '');
    const avatarChanged = !!selectedFile;
    return nameChanged || avatarChanged;
  }, [displayName, user, selectedFile]);

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

      const payload: User = {
        username: displayName.trim(),
        profile_picture: finalAvatarUrl || '',
        principal_id: user.principal_id,
        streaming_key: user.streaming_key,
        created_at: 1,
      };
      await updateUserCall([payload.principal_id, payload]);
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

          <AvatarUploader
            previewUrl={previewUrl}
            currentAvatar={currentAvatar}
            displayName={displayName}
            fileInputRef={fileInputRef}
            onFileChosen={setSelectedFile}
            setPreviewUrl={setPreviewUrl}
            setError={setError}
          />

          {error && <ErrorMessage message={error} />}
        </div>

        <PreviewCard
          previewUrl={previewUrl}
          currentAvatar={currentAvatar}
          displayName={displayName}
          user={user}
          saving={saving}
          uploading={uploading}
          updateLoading={updateLoading}
          saved={saved}
          hasChanges={hasChanges}
        />
      </form>
    </motion.div>
  );
}
