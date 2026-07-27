import { Router } from "./router.js";
import { TasksView } from "./views/TasksView.js";
import { CalendarView } from "./views/CalendarView.js";
import { AboutView } from "./views/AboutView.js";
import { SheetController } from "./controllers/SheetController.js";
import { themeManager } from "./services/ThemeManager.js";
import { notificationService } from "./services/NotificationService.js";
import { taskController } from "./controllers/TaskController.js";

/**
 * App — application bootstrap and top-level wiring (Composition Root).
 * Keeps DOM references centralized and instantiates views/controllers once.
 */
class App {
  constructor() {
    this.viewsContainer = document.getElementById("view-container");
    this.overlay = document.getElementById("sheet-overlay");
    this.sheet = new SheetController(this.overlay);

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
      .register("tasks", () => this._activate("view-tasks", () => this.views.tasks.render()))
      .register("calendar", () => this._activate("view-calendar", () => this.views.calendar.render()))
      .register("about", () => this._activate("view-about", () => this.views.about.render()));
  }

  _activate(viewId, renderFn) {
    document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
    document.getElementById(viewId).classList.add("active");
    renderFn();
    document.querySelectorAll(".bottom-nav__item[data-route]").forEach((el) => {
      el.classList.toggle("active", el.dataset.route === viewId.replace("view-", ""));
    });
  }

  _bindGlobalUI() {
    document.querySelectorAll(".bottom-nav__item[data-route]").forEach((el) => {
      el.addEventListener("click", () => this.router.navigate(el.dataset.route));
    });

    document.getElementById("fab-add")?.addEventListener("click", () => this.sheet.openTaskForm());

    const themeToggle = document.getElementById("theme-toggle");
    themeToggle?.addEventListener("click", () => themeManager.toggle());

    document.getElementById("notif-permission-btn")?.addEventListener("click", () => {
      notificationService.requestPermission();
    });
  }

  start() {
    this.router.start("tasks");
    if ("Notification" in window && Notification.permission === "default") {
      notificationService.requestPermission();
    }
  }
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./service-worker.js").catch((err) => {
        console.error("Service worker registration failed:", err);
      });
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  registerServiceWorker();
  const app = new App();
  app.start();
  window.__app = app; // exposed for debugging only
});
