import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Following from './pages/Following';
import Stream from './pages/Stream';

import '@connect2ic/core/style.css';
import { createClient } from '@connect2ic/core';
import { AstroX } from '@connect2ic/core/providers/astrox';
import { PlugWallet } from '@connect2ic/core/providers/plug-wallet';
import { InfinityWallet } from '@connect2ic/core/providers/infinity-wallet';
import { StoicWallet } from '@connect2ic/core/providers/stoic-wallet';

import { Connect2ICProvider } from '@connect2ic/react';
import { SocketProvider } from './contexts/socket.context';
import { ToastProvider } from './contexts/toast.context';
import Settings from './pages/Settings';
import Followers from './pages/Followers';
import { AuthProvider } from './contexts/auth.context';
import StreamExample from './pages/stream-example';

function App() {
  const client = createClient({
    providers: [
      new AstroX(),
      new PlugWallet(),
      new InfinityWallet(),
      new StoicWallet(),
    ],
  });

  return (
    <BrowserRouter>
      <Connect2ICProvider client={client}>
        <ToastProvider>
          <AuthProvider>
          <SocketProvider>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/following" element={<Following />} />
              <Route path="/stream/:principalId" element={<Stream />} />
              <Route path="/stream-ex/:streamerId" element={<StreamExample />} />
              <Route path="/settings" element={<Settings />} />
              <Route
                path="/profile/:principalId/followers"
                element={<Followers />}
                />
            </Routes>
          </SocketProvider>
          </AuthProvider>
        </ToastProvider>
      </Connect2ICProvider>
    </BrowserRouter>
  );
}

export default App;
