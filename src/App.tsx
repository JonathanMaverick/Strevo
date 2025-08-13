import { useQueryCall, useUpdateCall } from '@ic-reactor/react';
import './App.css';
import { useState } from 'react';
import { BrowserRouter, Route, Router, Routes } from 'react-router-dom';
import Template from './templates/Template';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Following from './pages/Following';
import Stream from './pages/Stream';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/following" element={<Following />} />
        <Route path="/stream" element={<Stream />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
