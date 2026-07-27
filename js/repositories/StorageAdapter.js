/**
 * StorageAdapter — Adapter pattern wrapping window.localStorage behind an
 * interface that could later be swapped for IndexedDB without touching
 * repositories or controllers (Dependency Inversion).
 */
export class StorageAdapter {
  constructor(namespace = "persian-task-app") {
    this.namespace = namespace;
  }

  _key(key) {
    return `${this.namespace}:${key}`;
  }

  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(this._key(key));
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      console.error(`StorageAdapter.get failed for "${key}"`, error);
      return fallback;
    }
  }

  set(key, value) {
    try {
      localStorage.setItem(this._key(key), JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`StorageAdapter.set failed for "${key}"`, error);
      return false;
    }
  }

  remove(key) {
    localStorage.removeItem(this._key(key));
  }
}

export const storage = new StorageAdapter();
