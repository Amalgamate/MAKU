import React, { useEffect, useState } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { useOfflineQueue } from '../hooks/useOfflineQueue';

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { pendingCount, syncNow } = useOfflineQueue();

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
    }
    function handleOffline() {
      setIsOnline(false);
    }
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && pendingCount === 0) return null;

  if (!isOnline) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex items-center gap-2 bg-amber-500 px-4 py-2 text-sm font-medium text-white"
      >
        <WifiOff size={16} aria-hidden="true" />
        <span>You&apos;re offline. Changes will sync when you reconnect.</span>
      </div>
    );
  }

  // Online but has a pending queue
  if (pendingCount > 0) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex items-center justify-between gap-2 bg-blue-600 px-4 py-2 text-sm font-medium text-white"
      >
        <div className="flex items-center gap-2">
          <RefreshCw size={16} className="animate-spin" aria-hidden="true" />
          <span>Syncing {pendingCount} offline {pendingCount === 1 ? 'record' : 'records'}…</span>
        </div>
        <button
          onClick={syncNow}
          className="rounded border border-white/40 px-2 py-0.5 text-xs hover:bg-white/20 transition-colors"
        >
          Sync now
        </button>
      </div>
    );
  }

  return null;
}
