import { useState, useEffect } from 'react';
import { offlineQueue } from '@/lib/offline-queue';

export function useOffline() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      setIsSyncing(true);
      
      try {
        await offlineQueue.processQueue();
      } catch (error) {
        console.error('Sync failed:', error);
      } finally {
        setIsSyncing(false);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check if there are pending items when component mounts
    if (isOnline && offlineQueue.hasPendingItems()) {
      handleOnline();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isOnline,
    isSyncing,
    queueTransaction: offlineQueue.addTransaction.bind(offlineQueue),
    getPendingCount: offlineQueue.getPendingCount.bind(offlineQueue),
  };
}
