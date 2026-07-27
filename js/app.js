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
    document.getElementById("fab-add-list")?.addEventListener("click", () => this.sheet.openListForm());

    ["theme-toggle-mobile", "theme-toggle-desktop"].forEach((id) => {
      document.getElementById(id)?.addEventListener("click", () => themeManager.toggle());
    });

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

document.addEventListener("DOMContentLoaded", () => {
  const app = new App();
  app.start();
  window.__app = app; // exposed for debugging only
});



// PWA Install Prompt
let deferredPrompt;
const installPromptDismissed = localStorage.getItem('installPromptDismissed');

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;

    if (!installPromptDismissed) {
    showInstallPrompt();
    }
});

function showInstallPrompt() {
    const prompt = document.createElement('div');
    prompt.className = 'install-prompt';
    prompt.innerHTML = `
        <div class="install-prompt-text">
            <div class="install-prompt-title">📱 نصب اپلیکیشن</div>
        </div>
        <button class="install-btn" id="installBtn">نصب</button>
        <button class="close-install" id="closeInstall">✕</button>
    `;
    document.body.appendChild(prompt);

    document.getElementById('installBtn').addEventListener('click', async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const {outcome} = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
        }

        deferredPrompt = null;
        prompt.remove();
    });

    document.getElementById('closeInstall').addEventListener('click', () => {
        localStorage.setItem('installPromptDismissed', 'true');
        prompt.remove();
    });
}

// Register Service Worker
if ('serviceWorker' in navigator) {
    let newWorker;

    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered:', registration);

                // Check for updates periodically
                setInterval(() => {
                    registration.update();
                }, 60000); // Check every minute

                // Listen for waiting worker
                registration.addEventListener('updatefound', () => {
                    newWorker = registration.installing;

                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New service worker is ready
                            showUpdateNotification();
                        }
                    });
                });
            })
            .catch(err => {
                console.log('SW registration failed:', err);
            });

        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'SW_UPDATED') {
                showUpdateNotification();
            }
        });

        // Handle controller change
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            window.location.reload();
        });
    });

    // Show update notification
    function showUpdateNotification() {
        const notification = document.getElementById('updateNotification');
        if (notification) {
            notification.classList.remove('hidden');
            notification.classList.add('show');
        }
    }

    // Handle update button click
    document.addEventListener('DOMContentLoaded', () => {
        const updateButton = document.getElementById('updateButton');
        const dismissButton = document.getElementById('dismissUpdate');
        const notification = document.getElementById('updateNotification');

        if (updateButton) {
            updateButton.addEventListener('click', () => {
                // Clear all caches and reload
                if ('caches' in window) {
                    caches.keys().then(names => {
                        names.forEach(name => {
                            caches.delete(name);
                        });
                    }).then(() => {
                        // Tell the service worker to skip waiting
                        if (newWorker) {
                            newWorker.postMessage({type: 'SKIP_WAITING'});
                        } else {
                            window.location.reload();
                        }
                    });
                } else {
                    window.location.reload();
                }
            });
        }

        if (dismissButton) {
            dismissButton.addEventListener('click', () => {
                notification.classList.remove('show');
                notification.classList.add('hidden');
            });
        }
    });
}

// Handle app installation
window.addEventListener('appinstalled', () => {
    console.log('App installed successfully');
    deferredPrompt = null;
});