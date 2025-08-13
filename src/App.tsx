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
import { Connect2ICProvider } from '@connect2ic/react';

function App() {
  const client = createClient({
    providers: [new AstroX(), new PlugWallet()],
  });

  return (
    <BrowserRouter>
      <Connect2ICProvider client={client}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/following" element={<Following />} />
          <Route path="/stream" element={<Stream />} />
        </Routes>
      </Connect2ICProvider>
    </BrowserRouter>
  );
}

export default App;
