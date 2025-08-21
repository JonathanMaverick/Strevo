import { useState } from 'react';
import { X, Send, Loader2, Heart } from 'lucide-react';
import { useTransfer } from '@connect2ic/react';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientPrincipalId: string;
  recipientUsername?: string;
}

export default function DonationModal({
  isOpen,
  onClose,
  recipientPrincipalId,
  recipientUsername = 'User',
}: DonationModalProps) {
  const [transferAmount, setTransferAmount] = useState<number>(0);
  const [transferStatus, setTransferStatus] = useState<string>('');
  const [customAmount, setCustomAmount] = useState<string>('');

  const [transfer, { loading: transferLoading, error: transferError }] =
    useTransfer({
      amount: transferAmount,
      to: recipientPrincipalId,
    });

  const quickAmounts = [1, 5, 10, 25, 50, 100];

  const handleTransfer = async () => {
    if (!transferAmount || transferAmount <= 0) {
      setTransferStatus('Please select or enter a valid amount');
      return;
    }

    if (!recipientPrincipalId) {
      setTransferStatus('Recipient principal ID not found');
      return;
    }

    try {
      setTransferStatus('Processing donation...');
      const result = await transfer();

      if (result.isOk()) {
        setTransferStatus(
          `Donation successful! Thank you for supporting ${recipientUsername}!`,
        );
        setTransferAmount(0);
        setCustomAmount('');

        // Auto close modal after successful donation
        setTimeout(() => {
          onClose();
          setTransferStatus('');
        }, 3000);
      } else {
        setTransferStatus(`Donation failed: ${result.error.kind}`);
      }
    } catch (err) {
      setTransferStatus(`Donation error: ${err}`);
    }
  };

  const handleQuickAmount = (amount: number) => {
    setTransferAmount(amount);
    setCustomAmount('');
    setTransferStatus('');
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      setTransferAmount(numValue);
    } else {
      setTransferAmount(0);
    }
    setTransferStatus('');
  };

  const handleClose = () => {
    if (!transferLoading) {
      setTransferAmount(0);
      setCustomAmount('');
      setTransferStatus('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative bg-[#1A1F2E] border border-gray-700 rounded-xl p-6 w-full max-w-md mx-auto shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Heart className="h-6 w-6 text-red-500" />
            <h2 className="text-xl font-bold text-white">Send Donation</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={transferLoading}
            className="p-1 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Recipient Info */}
        <div className="mb-6 p-3 bg-[#0A0E17] rounded-lg border border-gray-700">
          <p className="text-sm text-gray-400 mb-1">Donating to:</p>
          <p className="text-white font-medium">{recipientUsername}</p>
          <p className="text-xs text-gray-500 truncate mt-1">
            {recipientPrincipalId}
          </p>
        </div>

        {/* Quick Amount Buttons */}
        <div className="mb-4">
          <p className="text-sm text-gray-400 mb-3">Quick amounts:</p>
          <div className="grid grid-cols-3 gap-2">
            {quickAmounts.map((amount) => (
              <button
                key={amount}
                onClick={() => handleQuickAmount(amount)}
                disabled={transferLoading}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  transferAmount === amount
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-[#0A0E17] border-gray-600 text-gray-300 hover:border-gray-500'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {amount}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Amount */}
        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-2">
            Or enter custom amount:
          </label>
          <input
            type="number"
            value={customAmount}
            onChange={(e) => handleCustomAmountChange(e.target.value)}
            placeholder="Enter amount"
            min="0"
            step="0.01"
            disabled={transferLoading}
            className="w-full px-4 py-3 bg-[#0A0E17] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 disabled:opacity-50"
          />
        </div>

        {/* Transfer Status */}
        {transferStatus && (
          <div
            className={`mb-4 p-3 rounded-lg text-sm ${
              transferStatus.includes('successful')
                ? 'bg-green-900/50 text-green-300 border border-green-700'
                : transferStatus.includes('failed') ||
                    transferStatus.includes('error')
                  ? 'bg-red-900/50 text-red-300 border border-red-700'
                  : 'bg-blue-900/50 text-blue-300 border border-blue-700'
            }`}
          >
            {transferStatus}
          </div>
        )}

        {/* Transfer Error */}
        {transferError && (
          <div className="mb-4 p-3 bg-red-900/50 text-red-300 border border-red-700 rounded-lg text-sm">
            Error: {transferError.kind}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleClose}
            disabled={transferLoading}
            className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleTransfer}
            disabled={transferLoading || !transferAmount || transferAmount <= 0}
            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            {transferLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send Donation
              </>
            )}
          </button>
        </div>

        {transferAmount > 0 && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-400">
              Donation amount:{' '}
              <span className="text-white font-medium">{transferAmount}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
