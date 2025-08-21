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
import { AuthProvider } from './contexts/auth.context';
import StreamExample from './pages/stream-example';
import StreamHistoryPage from './pages/StreamHistory';
import EditStreamInfo from './pages/EditStreamInfo';
import StartStream from './pages/StartStream';
import ProfileFollowers from './pages/ProfileFollowers';
import ProfileFollowing from './pages/ProfileFollowing';

function App() {
  const client = createClient({
    providers: [
      new AstroX(),
      new PlugWallet(),
      new InfinityWallet(),
      new StoicWallet(),
    ],
    globalProviderConfig: {
      dev: process.env.NODE_ENV !== 'production',
      host:
        process.env.NODE_ENV === 'production'
          ? 'https://ic0.app'
          : 'http://localhost:4943',
      autoConnect: false,
      whitelist: [
        process.env.CANISTER_ID_BACKEND!,
        process.env.CANISTER_ID_FRONTEND!,
      ],
    },
  });

  return (
    <BrowserRouter>
      <Connect2ICProvider client={client}>
        <ToastProvider>
          <AuthProvider>
            <SocketProvider>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/profiles/:principalId" element={<Profile />} />
                <Route path="/following" element={<Following />} />
                <Route path="/start-stream" element={<StartStream />} />
                <Route path="/edit-stream-info" element={<EditStreamInfo />} />
                <Route path="/stream/:principalId" element={<Stream />} />
                <Route
                  path="/stream-history/:streamHistoryId"
                  element={<StreamHistoryPage />}
                />
                <Route
                  path="/stream-ex/:streamerId"
                  element={<StreamExample />}
                />
                <Route path="/settings" element={<Settings />} />
                <Route
                  path="/profiles/:principalId/following"
                  element={<ProfileFollowing />}
                />
                <Route
                  path="/profiles/:principalId/followers"
                  element={<ProfileFollowers />}
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
