interface QueuedTransaction {
  id: string;
  data: any;
  timestamp: number;
  retryCount: number;
}

class OfflineQueue {
  private queue: QueuedTransaction[] = [];
  private readonly STORAGE_KEY = 'pos_offline_queue';
  private readonly MAX_RETRIES = 3;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        this.queue = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error);
      this.queue = [];
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error('Failed to save offline queue:', error);
    }
  }

  addTransaction(transactionData: any): string {
    const id = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const queuedItem: QueuedTransaction = {
      id,
      data: {
        ...transactionData,
        offlineId: id,
      },
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.queue.push(queuedItem);
    this.saveToStorage();
    
    return id;
  }

  async processQueue(): Promise<void> {
    if (this.queue.length === 0) return;

    const itemsToProcess = [...this.queue];
    
    for (const item of itemsToProcess) {
      try {
        await this.syncTransaction(item);
        this.removeFromQueue(item.id);
      } catch (error) {
        console.error(`Failed to sync transaction ${item.id}:`, error);
        this.incrementRetryCount(item.id);
      }
    }

    this.saveToStorage();
  }

  private async syncTransaction(item: QueuedTransaction): Promise<void> {
    const response = await fetch('/api/stores/1/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item.data),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }

  private removeFromQueue(id: string) {
    this.queue = this.queue.filter(item => item.id !== id);
  }

  private incrementRetryCount(id: string) {
    const item = this.queue.find(item => item.id === id);
    if (item) {
      item.retryCount++;
      if (item.retryCount >= this.MAX_RETRIES) {
        console.warn(`Transaction ${id} exceeded max retries, removing from queue`);
        this.removeFromQueue(id);
      }
    }
  }

  hasPendingItems(): boolean {
    return this.queue.length > 0;
  }

  getPendingCount(): number {
    return this.queue.length;
  }

  clearQueue(): void {
    this.queue = [];
    this.saveToStorage();
  }

  getQueueItems(): QueuedTransaction[] {
    return [...this.queue];
  }
}

export const offlineQueue = new OfflineQueue();
