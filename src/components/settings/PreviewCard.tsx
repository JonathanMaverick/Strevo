import { Loader2, Check } from 'lucide-react';
import { avatarSvg } from '../../utils/avatar.util';

export default function PreviewCard({
  previewUrl,
  currentAvatar,
  displayName,
  user,
  saving,
  uploading,
  updateLoading,
  saved,
  hasChanges,
}: any) {
  return (
    <div className="lg:col-span-1">
      <div className="sticky top-6 space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        <div className="text-sm font-semibold text-white/80">Preview</div>
        <div className="mt-1 flex items-center gap-3">
          <div className="h-12 w-12 overflow-hidden rounded-full ring-2 ring-white/10">
            <img
              alt="preview"
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
          <div>
            <div className="text-sm font-medium">
              {displayName || user?.username || 'Your name'}
            </div>
          </div>
        </div>
        <button
          type="submit"
          disabled={saving || uploading || updateLoading || !hasChanges}
          className={`flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold ${
            saving || uploading || updateLoading || !hasChanges
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
      </div>
    </div>
  );
}
