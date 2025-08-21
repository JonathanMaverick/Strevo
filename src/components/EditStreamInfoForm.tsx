import {
  ChevronDown,
  Loader2,
  Save,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { getAllCategory, Category } from '../services/category.service';
import { createStream } from '../services/stream.service';
import type { StreamFormData } from '../interfaces/stream';
import { getStreamInfo, saveStreamInfo } from "../services/stream-info.service";
import { StreamInfo } from "../interfaces/stream-info";

export default function EditStreamInfoForm({
  principalId,
}: {
  principalId: string;
}) {
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  const triggerRef = useRef<HTMLDivElement>(null);
  const [streamInfo, setStreamInfo] = useState<StreamInfo>({hostPrincipalId: principalId, title: ""} as StreamInfo);

  useEffect(() => {
    getStreamInfo(principalId).then(streamInfo => {
      if (streamInfo) setStreamInfo(streamInfo);
    })
  }, [])

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingCategories(true);
      setError(null);
      const result = await getAllCategory();
      if (!mounted) return;
      if (!result || result.length === 0) {
        setCategories([]);
        setError('Failed to load categories.');
      } else {
        setCategories(result);
      }
      setLoadingCategories(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isDropdownOpen || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const bottomSpace = window.innerHeight - rect.bottom;
    setOpenUp(bottomSpace < 280);
  }, [isDropdownOpen]);

  useEffect(() => {
    if (!isDropdownOpen) return;
    const onClick = (e: MouseEvent) => {
      if (!triggerRef.current?.contains(e.target as Node))
        setIsDropdownOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsDropdownOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [isDropdownOpen]);

  const hasChanges = useMemo(
    () => !!streamInfo.title.trim() || !!streamInfo.categoryId,
    [streamInfo],
  );
  const selected = categories.find(
    (c: any) => c.categoryID === streamInfo.categoryId || c.CategoryID === streamInfo.categoryId,
  );

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);
    if (!streamInfo.title.trim()) return setError('Title is required.');
    if (!streamInfo.categoryId) return setError('Please select a category.');
    const payload: StreamInfo = {
      title: streamInfo.title.trim(),
      categoryId: streamInfo.categoryId,
      hostPrincipalId: streamInfo.hostPrincipalId,
    };
    setSaving(true);
    const created = await saveStreamInfo(payload);
    setSaving(false);
    if (!created)
      return setError('Failed to save stream info. Please try again.');
    setSuccess('Stream info saved!');
  };

  return (
    <section className="relative mx-auto max-w-xl w-full px-4 sm:px-6 py-10 flex-1">
      <div className="overflow-visible rounded-none sm:rounded-2xl border border-white/10 bg-white/[0.03]">
        <div className="border-b border-white/10 px-4 sm:px-6 py-4">
          <h1 className="text-lg font-semibold tracking-tight">
            Edit Stream Info
          </h1>
          <p className="mt-1 text-xs text-white/60">
            Set your stream title and category.
          </p>
        </div>

        <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-1">
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
              <CheckCircle2 className="h-4 w-4" />
              <span>{success}</span>
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-white/80">Title</label>
            <input
              value={streamInfo.title}
              onChange={(e) => setStreamInfo(prev => ({...prev, title: e.target.value}))}
              placeholder="Stream Title"
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none placeholder:text-white/40 focus:border-white/20"
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-white/80">
              Category
            </label>
            <div ref={triggerRef} className="relative mt-2">
              <button
                type="button"
                onClick={() => setIsDropdownOpen((v) => !v)}
                className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 pr-10 text-sm outline-none focus:border-white/20 text-left"
              >
                <span className={selected ? 'text-white' : 'text-white/40'}>
                  {loadingCategories
                    ? 'Loading categories...'
                    : selected
                      ? (selected.categoryName ??
                        (selected as any).CategoryName)
                      : 'Select a category'}
                </span>
              </button>

              <ChevronDown
                className={`pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
              />

              {isDropdownOpen && !loadingCategories && (
                <div
                  className={`absolute left-0 ${openUp ? 'bottom-full mb-1' : 'top-full mt-1'} min-w-full rounded-xl border border-white/10 bg-[#0A0E17]/95 backdrop-blur-sm shadow-2xl z-50`}
                >
                  <div className="max-h-64 overscroll-contain overflow-y-auto py-1">
                    {categories.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-amber-300/80">
                        No categories available.
                      </div>
                    ) : (
                      categories.map((c: any) => {
                        const id = c.categoryID ?? c.CategoryID;
                        const name = c.categoryName ?? c.CategoryName;
                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => {
                              setStreamInfo(prev => ({...prev, categoryId: id}));
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full px-3 py-2 text-left text-sm transition-colors hover:bg-white/10 ${streamInfo.categoryId === id ? 'bg-sky-600/20 text-sky-300' : 'text-white/80'}`}
                          >
                            {name}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleSubmit}
              disabled={!hasChanges || saving}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-2.5 text-sm font-semibold"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
