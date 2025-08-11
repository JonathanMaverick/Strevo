import { useQueryCall, useUpdateCall } from '@ic-reactor/react';
import './App.css';
import motokoLogo from './assets/motoko_moving.png';
import motokoShadowLogo from './assets/motoko_shadow.png';
import reactLogo from './assets/react.svg';
import viteLogo from './assets/vite.svg';
import { useState } from 'react';

function App() {
  const { data: count, refetch } = useQueryCall({
    functionName: 'get',
  });

  const { call: increment, loading } = useUpdateCall({
    functionName: 'inc',
    onSuccess: refetch,
  });

  const [walletConnected, setWalletConnected] = useState(false);
  const [principal, setPrincipal] = useState<string | null>(null);

  const connectWallet = async () => {
    if (!window.ic || !window.ic.plug) {
      alert('Plug wallet not detected. Please install it first!');
      return;
    }
    try {
      const connected = await window.ic.plug.requestConnect();
      if (connected) {
        const principal = await window.ic.plug.agent.getPrincipal();
        setPrincipal(principal.toText());
        setWalletConnected(true);
        alert('Wallet connected! Principal: ' + principal.toText());
      } else {
        alert('User rejected the connection.');
      }
    } catch (err) {
      console.error('Error connecting wallet:', err);
      alert('Failed to connect wallet.');
    }
  };

  return (
    <div className="App">
      <div>
        <a href="https://vitejs.dev" target="_blank" rel="noreferrer">
          <img src={viteLogo} className="logo vite" alt="Vite logo" />
        </a>
        <a href="https://reactjs.org" target="_blank" rel="noreferrer">
          <img src={reactLogo} className="logo react" alt="React logo"/>
        </a>
        <a
          href="https://internetcomputer.org/docs/current/developer-docs/build/cdks/motoko-dfinity/motoko/"
          target="_blank"
          rel="noreferrer"
        >
          <span className="logo-stack">
            <img
              src={motokoShadowLogo}
              className="logo motoko-shadow"
              alt="Motoko logo"
            />
            <img src={motokoLogo} className="logo motoko" alt="Motoko logo" />
          </span>
        </a>
      </div>

      <h1>Vite + React + Motoko</h1>

      <div className="card">
        <button onClick={increment} disabled={loading}>
          count is {count?.toString() ?? 'loading...'}
        </button>
        <p>
          Edit <code>backend/Backend.mo</code> and save to test HMR
        </p>
      </div>

      <div style={{ marginTop: '2rem' }}>
        {!walletConnected ? (
          <button onClick={connectWallet}>Connect Plug Wallet</button>
        ) : (
          <p>Wallet Connected: {principal}</p>
        )}
      </div>

      <p className="read-the-docs">
        Click on the Vite, React, and Motoko logos to learn more
      </p>
    </div>
  );
}

export default App;
