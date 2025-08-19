import { useEffect, useMemo, useRef, useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { useUpdateUserService } from '../../services/user.service';
import {
  uploadDirectToSupabaseS3,
  buildSupabasePublicUrl,
} from '../../services/storage.service';
import AvatarUploader from './AvatarUploader';
import ErrorMessage from './ErrorMessage';
import PreviewCard from './PreviewCard';
import { User } from '../../interfaces/user';

export default function SettingsForm({ user }: { user: User }) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
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
    setBio((prev) => prev || user.bio || '');
    setCurrentAvatar(user.profile_picture || undefined);
  }, [user]);

  const hasChanges = useMemo(() => {
    const nameChanged = displayName.trim() !== (user.username || '');
    const bioChanged = bio !== user.bio;
    const avatarChanged = !!selectedFile;
    return nameChanged || bioChanged || avatarChanged;
  }, [displayName, bio, user, selectedFile]);

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

      console.log(finalAvatarUrl);
      const payload = {
        username: displayName.trim(),
        bio: bio && bio !== '' ? [bio.trim()] : [],
        profile_picture: finalAvatarUrl || '',
        principal_id: user.principal_id,
        streaming_key: user.streaming_key,
        created_at: user.created_at,
      };
      console.log(payload)
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
          Update your display name, bio, and profile picture.
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
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none placeholder:text-white/40 focus:border-white/20"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-white/80">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              rows={3}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none placeholder:text-white/40 focus:border-white/20"
            />
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
