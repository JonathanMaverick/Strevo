import { useQueryCall, useUpdateCall } from '@ic-reactor/react';
import './App.css';
import { useState } from 'react';
import { BrowserRouter, Route, Router, Routes } from 'react-router-dom';
import Template from './templates/Template';
import Home from './pages/Home';

import { createClient } from '@connect2ic/core';
import { AstroX } from "@connect2ic/core/providers/astrox"
import { PlugWallet } from '@connect2ic/core/providers/plug-wallet';
import { Connect2ICProvider } from '@connect2ic/react';

function App() {
  const client = createClient({
    providers: [
      new AstroX(),
      new PlugWallet()
    ],
  })
  return (
    <BrowserRouter>
    <Connect2ICProvider client={client}>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </Connect2ICProvider>
    </BrowserRouter>
  );
}

export default App;
