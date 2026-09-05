/**
 * js/views/AboutView.js
 * Adds the push-notification enable card — rendered ONLY when running as
 * an installed PWA/TWA and permission hasn't been decided yet.
 */
import { taskController } from "../controllers/TaskController.js";
import { notificationService } from "../services/NotificationService.js";
import { isInstalledApp } from "../services/PushSubscriptionService.js";

/** AboutView introduces the developer and links to their personal site. */
export class AboutView {
  constructor(rootEl) {
    this.root = rootEl;
  }

  _shouldShowNotificationCard() {
    return isInstalledApp() && "Notification" in window && Notification.permission === "default";
  }

  render() {
    const stats = taskController.getStats();
    const showNotificationCard = this._shouldShowNotificationCard();

    this.root.innerHTML = `
      <div class="about-hero">
        <div class="about-avatar">MHK</div>
        <h2>محمدحسین کرمی</h2>
        <p class="text-secondary">توسعه‌دهنده نرم‌افزار</p>
        <div class="about-links">
          <a class="btn btn--outline" href="https://mhkarami97.ir" target="_blank" rel="noopener">وب‌سایت</a>
        </div>
      </div>

      ${
        showNotificationCard
          ? `<div class="card about-section">
              <h3>یادآور پوش</h3>
              <p class="text-secondary" style="margin-bottom:12px">
                برای دریافت یادآور حتی وقتی برنامه بسته است، اعلان را فعال کنید.
              </p>
              <button class="btn btn--primary btn--block" id="notif-permission-btn">فعال‌سازی اعلان</button>
            </div>`
          : ""
      }

      <div class="card about-section">
        <h3>آمار</h3>
        <div class="chip-row">
          <span class="chip active">کل: ${stats.total}</span>
          <span class="chip">انجام‌شده: ${stats.completed}</span>
          <span class="chip">در انتظار: ${stats.pending}</span>
          <span class="chip">عقب‌افتاده: ${stats.overdue}</span>
        </div>
      </div>
    `;

    this._bindEvents();
  }

  _bindEvents() {
    document.getElementById("notif-permission-btn")?.addEventListener("click", async () => {
      const result = await notificationService.requestPermission();
      if (result === "granted") this.render();
    });
  }
}
