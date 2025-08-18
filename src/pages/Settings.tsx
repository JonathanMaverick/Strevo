import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Loading from './Loading';
import { useAuth } from '../contexts/auth.context';
import SettingsForm from '../components/settings/SettingsForm';

export default function Settings() {
  const { user, userLoading } = useAuth();

  if (userLoading) return <Loading />;
  if (!user) return <div>You need to login first</div>;

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
        <SettingsForm user={user} />
      </section>
      <Footer />
    </div>
  );
}
