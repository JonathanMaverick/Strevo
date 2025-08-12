import { useQueryCall, useUpdateCall } from '@ic-reactor/react';
import './App.css';
import { useState } from 'react';
import { BrowserRouter, Route, Router, Routes } from 'react-router-dom';
import Template from './templates/Template';
import Wallet from './pages/Wallet';

function App() {
  return (
    <BrowserRouter>
      <Template>
        <Routes>
          <Route path="/" element={<Wallet />} />
        </Routes>
      </Template>
    </BrowserRouter>
  );
}

export default App;
