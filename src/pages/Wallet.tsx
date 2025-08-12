import { useQueryCall, useUpdateCall } from '@ic-reactor/react';
import { useState } from 'react';

function Wallet() {
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
      <div style={{ marginTop: '2rem' }}>
        {!walletConnected ? (
          <button onClick={connectWallet}>Connect Plug Wallet</button>
        ) : (
          <p>Wallet Connected: {principal}</p>
        )}
      </div>
    </div>
  );
}

export default Wallet;
