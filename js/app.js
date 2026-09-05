import { Router } from "./router.js";
import { TasksView } from "./views/TasksView.js";
import { CalendarView } from "./views/CalendarView.js";
import { AboutView } from "./views/AboutView.js";
import { SheetController } from "./controllers/SheetController.js";
import { themeManager } from "./services/ThemeManager.js";

/**
 * Handles Service Worker registration, updates, and PWA install prompts.
 * Strictly separated from UI logic.
 */
class PwaManager {
  constructor() {
    this.deferredPrompt = null;
    this.newWorker = null;
    this.installPromptDismissed = localStorage.getItem(
      "installPromptDismissed",
    );

    this._bindInstallEvents();
    this._initServiceWorker();
  }

  _bindInstallEvents() {
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      if (!this.installPromptDismissed) {
        this._showInstallPromptUI();
      }
    });

    window.addEventListener("appinstalled", () => {
      console.log("App installed successfully");
      this.deferredPrompt = null;
    });
  }

  _showInstallPromptUI() {
    const promptEl = document.createElement("div");
    promptEl.className = "install-prompt";
    promptEl.innerHTML = `
      <div class="install-prompt-text">
        <div class="install-prompt-title">نصب اپلیکیشن</div>
        <div class="install-prompt-desc">برای دسترسی سریع‌تر، اپ را نصب کنید</div>
      </div>
      <button class="install-btn" id="installBtn">نصب</button>
      <button class="close-install" id="closeInstall">✕</button>
    `;
    document.body.appendChild(promptEl);

    document
      .getElementById("installBtn")
      .addEventListener("click", async () => {
        if (!this.deferredPrompt) return;
        this.deferredPrompt.prompt();
        const outcome = await this.deferredPrompt.userChoice;
        if (outcome === "accepted")
          console.log("User accepted the install prompt");
        this.deferredPrompt = null;
        promptEl.remove();
      });

    document.getElementById("closeInstall").addEventListener("click", () => {
      localStorage.setItem("installPromptDismissed", "true");
      promptEl.remove();
    });
  }

  _initServiceWorker() {
    if (!("serviceWorker" in navigator)) return;

    window.addEventListener("load", async () => {
      try {
        const registration = await navigator.serviceWorker.register("sw.js");

        if (registration.waiting) {
          this._showUpdateNotification();
          this.newWorker = registration.waiting;
        }

        registration.addEventListener("updatefound", () => {
          this.newWorker = registration.installing;
          this.newWorker.addEventListener("statechange", () => {
            if (
              this.newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              this._showUpdateNotification();
            }
          });
        });
      } catch (err) {
        console.error("SW registration failed:", err);
      }
    });

    // Handle incoming messages from SW (if any)
    navigator.serviceWorker.addEventListener("message", (event) => {
      if (event.data?.type === "SW_UPDATED") this._showUpdateNotification();
    });

    // The ONLY correct way to refresh after an update: listen to controllerchange
    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });
  }

  _showUpdateNotification() {
    const notification = document.getElementById("updateNotification");
    if (!notification) return;

    // UI Activation based on previous CSS fix
    notification.classList.add("show");

    const updateBtn = document.getElementById("updateButton");
    const dismissBtn = document.getElementById("dismissUpdate");

    // Clear old listeners by cloning or simply overwriting (here we assume it's shown once)
    updateBtn?.addEventListener("click", () => {
      // NOTE: We do NOT delete caches here. That is the SW's job on 'activate'.
      // We only tell the new worker to take control.
      if (this.newWorker) {
        this.newWorker.postMessage({ type: "SKIP_WAITING" });
      } else {
        window.location.reload();
      }
    });

    dismissBtn?.addEventListener("click", () => {
      notification.classList.remove("show");
    });
  }
}

/**
 * App — application bootstrap and top-level wiring (Composition Root).
 */
class App {
  constructor() {
    this.viewsContainer = document.getElementById("view-container");
    this.overlay = document.getElementById("sheet-overlay");
    this.sheet = new SheetController(this.overlay);

    // Initialize PWA Manager
    this.pwaManager = new PwaManager();

    this.views = {
      tasks: new TasksView(this._createViewEl("view-tasks"), this.sheet),
      calendar: new CalendarView(this._createViewEl("view-calendar")),
      about: new AboutView(this._createViewEl("view-about")),
    };

    this.router = new Router();
    this._registerRoutes();
    this._bindGlobalUI();
  }

  _createViewEl(id) {
    const el = document.createElement("div");
    el.className = "view";
    el.id = id;
    this.viewsContainer.appendChild(el);
    return el;
  }

  _registerRoutes() {
    this.router
      .register("tasks", () =>
        this._activate("view-tasks", () => this.views.tasks.render()),
      )
      .register("calendar", () =>
        this._activate("view-calendar", () => this.views.calendar.render()),
      )
      .register("about", () =>
        this._activate("view-about", () => this.views.about.render()),
      );
  }

  _activate(viewId, renderFn) {
    document
      .querySelectorAll(".view")
      .forEach((v) => v.classList.remove("active"));
    document.getElementById(viewId).classList.add("active");
    renderFn();
    document.querySelectorAll(".bottom-nav__item[data-route]").forEach((el) => {
      el.classList.toggle(
        "active",
        el.dataset.route === viewId.replace("view-", ""),
      );
    });
  }

  _bindGlobalUI() {
    document.querySelectorAll(".bottom-nav__item[data-route]").forEach((el) => {
      el.addEventListener("click", () =>
        this.router.navigate(el.dataset.route),
      );
    });
    document
      .getElementById("fab-add")
      ?.addEventListener("click", () => this.sheet.openTaskForm());
    document
      .getElementById("fab-add-list")
      ?.addEventListener("click", () => this.sheet.openListForm());
    ["theme-toggle-mobile", "theme-toggle-desktop"].forEach((id) => {
      document
        .getElementById(id)
        ?.addEventListener("click", () => themeManager.toggle());
    });
  }

  start() {
    this.router.start("tasks");
  }
}

// Single entry point
document.addEventListener("DOMContentLoaded", () => {
  const app = new App();
  app.start();
  window.app = app; // exposed for debugging only
});
