export class IndexedDBService {
  private static instance: IndexedDBService;
  private db: IDBDatabase | null = null;

  private constructor() {} // Private to prevent direct instantiation

  static getInstance(): IndexedDBService {
    if (!IndexedDBService.instance) {
      IndexedDBService.instance = new IndexedDBService();
    }
    return IndexedDBService.instance;
  }

  async openDB(
    dbName: string,
    stores: { name: string; keyPath?: string; autoIncrement?: boolean }[],
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.db) {
        resolve();
        return;
      }

      const request = indexedDB.open(dbName, 1);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBRequest).result;
        stores.forEach(({ name, keyPath = 'id', autoIncrement = false }) => {
          if (!db.objectStoreNames.contains(name)) {
            db.createObjectStore(name, { keyPath, autoIncrement });
          }
        });
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBRequest).result;
        resolve();
      };

      request.onerror = (event) => reject((event.target as IDBRequest).error);
    });
  }

  getDB(): IDBDatabase | null {
    return this.db;
  }
}
