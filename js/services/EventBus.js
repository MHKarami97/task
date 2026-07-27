/**
 * EventBus — Observer pattern implementation for decoupled pub/sub
 * communication between controllers and views.
 */
class EventBus {
  constructor() {
    this._listeners = new Map();
  }

  on(event, handler) {
    if (!this._listeners.has(event)) this._listeners.set(event, new Set());
    this._listeners.get(event).add(handler);
    return () => this.off(event, handler);
  }

  off(event, handler) {
    this._listeners.get(event)?.delete(handler);
  }

  emit(event, payload) {
    this._listeners.get(event)?.forEach((handler) => handler(payload));
  }
}

export const eventBus = new EventBus();
export const EVENTS = Object.freeze({
  TASKS_CHANGED: "tasks:changed",
  LISTS_CHANGED: "lists:changed",
  THEME_CHANGED: "theme:changed",
  VIEW_CHANGED: "view:changed",
  DATE_SELECTED: "date:selected",
});
