import { Camera, Trash2 } from 'lucide-react';
import { RefObject } from 'react';
import { avatarSvg } from '../../utils/avatar.util';

interface Props {
  previewUrl: string | null;
  currentAvatar?: string;
  displayName: string;
  fileInputRef: RefObject<HTMLInputElement>;
  onFileChosen: (file: File | null) => void;
  setPreviewUrl: (url: string | null) => void;
  setError: (err: string | null) => void;
}

export default function AvatarUploader({
  previewUrl,
  currentAvatar,
  displayName,
  fileInputRef,
  onFileChosen,
  setPreviewUrl,
  setError,
}: Props) {
  const pickFile = () => fileInputRef.current?.click();

  const clearNewPhoto = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    onFileChosen(null);
  };

  const handleFile = (file?: File | null) => {
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
    const url = URL.createObjectURL(file);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(url);
    onFileChosen(file);
  };

  return (
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
                    : `data:image/svg+xml;utf8,${encodeURIComponent(
                        avatarSvg((displayName?.[0] || 'U').toUpperCase()),
                      )}`
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
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />
        </div>
      </div>
    </div>
  );
}
