import { IBingoGame } from '../../../module/games/bingo/model/IBingoGame';
import { IndexedDBService } from '../DatabaseService';
import { Tables } from '../enums/dbEnums';

export class BingoGameService {
  private tableName: string = Tables.bingoGame;
  private dbService: IndexedDBService;

  constructor() {
    this.dbService = IndexedDBService.getInstance();
  }

  async createNewGame(data: IBingoGame): Promise<IBingoGame> {
    console.log(data, 'data from index');
    return new Promise((resolve, reject) => {
      const db = this.dbService.getDB();
      if (!db) {
        reject('Database not initialized!');
        return;
      }

      const transaction = db.transaction(this.tableName, 'readwrite');
      const store = transaction.objectStore(this.tableName);
      const request = store.put(data);

      request.onsuccess = () => {
        resolve(data);
      };

      request.onerror = (event) => {
        const error = (event.target as IDBRequest).error;
        reject(error);
      };
    });
  }
  async getActiveBingoGame(): Promise<IBingoGame | null> {
    return new Promise((resolve, reject) => {
      const db = this.dbService.getDB();
      if (!db) {
        reject('Database not initialized');
        return;
      }

      const transaction = db.transaction(this.tableName, 'readonly');
      const store = transaction.objectStore(this.tableName);
      const request = store.openCursor(null, 'prev');

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          resolve(cursor.value); // return last inserted item
        } else {
          resolve(null);
        }
      };

      request.onerror = (event) => reject((event.target as IDBRequest).error);
    });
  }

  async clearBingoGame(): Promise<void> {
    return new Promise((resolve, reject) => {
      const db = this.dbService.getDB();
      if (!db) {
        reject('Database not initialized');
        return;
      }
      const transaction = db.transaction(this.tableName, 'readwrite');
      const store = transaction.objectStore(this.tableName);
      store.clear();
      resolve();
    });
  }
}
