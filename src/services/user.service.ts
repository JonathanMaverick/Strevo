import { useUpdateCall } from '@ic-reactor/react';
import { useState } from 'react';

export function useUpdateUserService() {
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { call: updateUserCall, loading: updateLoading } = useUpdateCall({
    functionName: 'updateUser',
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    },
    onError: (e: any) => setError(e?.message || 'Failed to update profile.'),
  });

  return {
    updateUserCall,
    updateLoading,
    saved,
    error,
    setError,
  };
}
