import { useQueryCall, useUpdateCall } from '@ic-reactor/react';
import './App.css';
import { useState } from 'react';
import { BrowserRouter, Route, Router, Routes } from 'react-router-dom';
import Template from './templates/Template';
import Home from './pages/Home';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
