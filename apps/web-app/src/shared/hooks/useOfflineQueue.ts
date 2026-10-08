import { useState, useCallback } from 'react';
import { get as idbGet, set as idbSet, del as idbDel, keys as idbKeys } from 'idb-keyval';
import { apiClient } from '../services/api.client';

interface QueuedRequest {
  id: string;
  method: string;
  url: string;
  data?: unknown;
  timestamp: number;
}

const QUEUE_PREFIX = 'maku-offline-';

export function useOfflineQueue() {
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  const enqueue = useCallback(async (request: Omit<QueuedRequest, 'id' | 'timestamp'>) => {
    const entry: QueuedRequest = {
      ...request,
      id: `${QUEUE_PREFIX}${Date.now()}-${Math.random().toString(36).slice(2)}`,
      timestamp: Date.now(),
    };
    await idbSet(entry.id, entry);
    const allKeys = await idbKeys();
    setPendingCount(allKeys.filter((k) => String(k).startsWith(QUEUE_PREFIX)).length);
  }, []);

  const syncNow = useCallback(async () => {
    if (isSyncing || !navigator.onLine) return;
    setIsSyncing(true);

    try {
      const allKeys = (await idbKeys()).filter((k) => String(k).startsWith(QUEUE_PREFIX));
      setPendingCount(allKeys.length);

      for (const key of allKeys) {
        const req = await idbGet<QueuedRequest>(key);
        if (!req) continue;
        try {
          await apiClient.request({ method: req.method, url: req.url, data: req.data });
          await idbDel(key);
          setPendingCount((c) => Math.max(0, c - 1));
        } catch {
          // Leave in queue to retry next sync
        }
      }
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing]);

  return { pendingCount, isSyncing, enqueue, syncNow };
}
