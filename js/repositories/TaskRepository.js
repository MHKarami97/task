import { storage } from "./StorageAdapter.js";
import { Task } from "../models/Task.js";

const STORAGE_KEY = "tasks";

/**
 * TaskRepository — Repository pattern isolating persistence concerns from
 * business logic. Controllers depend only on this abstraction.
 */
export class TaskRepository {
  constructor(storageAdapter = storage) {
    this.storageAdapter = storageAdapter;
    this._cache = null;
  }

  _load() {
    if (this._cache) return this._cache;
    const raw = this.storageAdapter.get(STORAGE_KEY, []);
    this._cache = raw.map((item) => Task.fromJSON(item));
    return this._cache;
  }

  _persist() {
    this.storageAdapter.set(STORAGE_KEY, this._cache.map((t) => t.toJSON()));
  }

  getAll() {
    return [...this._load()];
  }

  getById(id) {
    return this._load().find((t) => t.id === id) || null;
  }

  getByListId(listId) {
    return this._load().filter((t) => t.listId === listId);
  }

  add(task) {
    this._load().push(task);
    this._persist();
    return task;
  }

  update(task) {
    const tasks = this._load();
    const idx = tasks.findIndex((t) => t.id === task.id);
    if (idx === -1) throw new Error(`Task ${task.id} not found`);
    tasks[idx] = task;
    this._persist();
    return task;
  }

  remove(id) {
    this._cache = this._load().filter((t) => t.id !== id);
    this._persist();
  }

  removeCompleted(listId = null) {
    this._cache = this._load().filter((t) => !t.completed || (listId && t.listId !== listId));
    this._persist();
  }
}

export const taskRepository = new TaskRepository();
