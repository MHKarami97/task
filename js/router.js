import { eventBus, EVENTS } from "./services/EventBus.js";

/**
 * Router — minimal client-side hash router mapping view names to render
 * callbacks. Enables deep-linking (e.g. #/calendar) without a backend.
 */
export class Router {
  constructor() {
    this._routes = new Map();
    window.addEventListener("hashchange", () => this._resolve());
  }

  register(name, handler) {
    this._routes.set(name, handler);
    return this;
  }

  start(defaultRoute = "tasks") {
    if (!window.location.hash) window.location.hash = `#/${defaultRoute}`;
    this._resolve();
  }

  navigate(name) {
    window.location.hash = `#/${name}`;
  }

  _resolve() {
    const name = window.location.hash.replace("#/", "") || "tasks";
    const handler = this._routes.get(name) || this._routes.get("tasks");
    handler?.(name);
    eventBus.emit(EVENTS.VIEW_CHANGED, name);
  }
}
