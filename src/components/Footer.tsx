import Logo from '../assets/logo.png';

export default function Footer() {
  return (
    <footer className="border-t border-white/5">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-8 text-sm text-white/60 sm:flex-row sm:px-6">
        <div className="flex items-center gap-3">
          <img src={Logo} alt="Strevo Logo" className="h-5 w-auto" />
          <span className="text-s font-semibold tracking-tight">Strevo</span>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <a href="#" className="hover:text-white">
            @Strevo
          </a>
        </div>
      </div>
    </footer>
  );
}
