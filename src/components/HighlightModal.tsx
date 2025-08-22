import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import type { Highlight } from '../interfaces/highlight';

type Props = {
  isOpen: boolean;
  highlight: Highlight | null;
  onClose: () => void;
};

export default function HighlightModal({ isOpen, highlight, onClose }: Props) {
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (isOpen) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen || !highlight) return null;

  const start = Number.parseFloat(highlight.startHighlight) || 0;
  const end = Number.parseFloat(highlight.endHighlight) || 0;
  const dur = Math.max(0, end - start);
  const durLabel = new Date(dur * 1000).toISOString().slice(14, 19);

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === backdropRef.current) onClose();
      }}
    >
      <div className="w-full max-w-4xl rounded-2xl border border-white/10 bg-[#0B1020] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <div className="text-sm font-semibold">Highlight • {durLabel}</div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 hover:bg-white/5"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative">
          <video
            src={highlight.highlightUrl}
            controls
            autoPlay
            playsInline
            className="w-full max-h-[70vh] bg-black"
          />
        </div>

        <div className="px-4 py-3">
          <p className="text-sm text-white/80">
            {highlight.highlightDescription}
          </p>
          {/* <p className="mt-1 text-xs text-white/50">
            Range: {start.toFixed(0)}s → {end.toFixed(0)}s
          </p> */}
        </div>
      </div>
    </div>
  );
}
