import { storage } from "./StorageAdapter.js";
import { TaskList } from "../models/TaskList.js";

const STORAGE_KEY = "lists";

export class ListRepository {
  constructor(storageAdapter = storage) {
    this.storageAdapter = storageAdapter;
    this._cache = null;
  }

  _load() {
    if (this._cache) return this._cache;
    const raw = this.storageAdapter.get(STORAGE_KEY, null);
    if (!raw || raw.length === 0) {
      this._cache = [
        new TaskList({ id: "default", name: "کارهای من", color: "#1ed760", icon: "list", isDefault: true }),
      ];
      this._persist();
      return this._cache;
    }
    this._cache = raw.map((item) => TaskList.fromJSON(item));
    return this._cache;
  }

  _persist() {
    this.storageAdapter.set(STORAGE_KEY, this._cache.map((l) => l.toJSON()));
  }

  getAll() {
    return [...this._load()];
  }

  getById(id) {
    return this._load().find((l) => l.id === id) || null;
  }

  add(list) {
    this._load().push(list);
    this._persist();
    return list;
  }

  update(list) {
    const lists = this._load();
    const idx = lists.findIndex((l) => l.id === list.id);
    if (idx === -1) throw new Error(`List ${list.id} not found`);
    lists[idx] = list;
    this._persist();
    return list;
  }

  remove(id) {
    this._cache = this._load().filter((l) => l.id !== id);
    this._persist();
  }
}

export const listRepository = new ListRepository();
