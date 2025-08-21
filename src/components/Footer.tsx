import { PlayCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/5">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-8 text-sm text-white/60 sm:flex-row sm:px-6">
        <div className="flex items-center gap-3">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-sky-500 to-blue-600">
            <PlayCircle className="h-4 w-4" />
          </div>
          <span className="font-semibold text-white/90">ICP Stream</span>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {/* <a href="#" className="hover:text-white">
            Terms
          </a>
          <a href="#" className="hover:text-white">
            Privacy
          </a>
          <a href="#" className="hover:text-white">
            Status
          </a> */}
          <a href="#" className="hover:text-white">
            @ICPStream
          </a>
        </div>
      </div>
    </footer>
  );
}
