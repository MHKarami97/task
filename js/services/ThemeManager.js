import { storage } from "../repositories/StorageAdapter.js";
import { eventBus, EVENTS } from "./EventBus.js";

const THEME_KEY = "theme";

/** ThemeManager — Singleton controlling dark/light mode with persistence. */
class ThemeManager {
  constructor() {
    this.current = storage.get(THEME_KEY, this._prefersDark() ? "dark" : "dark");
    this._apply();
  }

  _prefersDark() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  _apply() {
    document.documentElement.setAttribute("data-theme", this.current);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", this.current === "dark" ? "#121212" : "#fafafa");
  }

  toggle() {
    this.current = this.current === "dark" ? "light" : "dark";
    storage.set(THEME_KEY, this.current);
    this._apply();
    eventBus.emit(EVENTS.THEME_CHANGED, this.current);
  }

  set(theme) {
    this.current = theme;
    storage.set(THEME_KEY, theme);
    this._apply();
    eventBus.emit(EVENTS.THEME_CHANGED, this.current);
  }
}

export const themeManager = new ThemeManager();
