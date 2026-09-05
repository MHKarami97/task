import { taskController } from "../controllers/TaskController.js";
import { notificationService } from "../services/NotificationService.js";
import { isInstalledApp, pushSubscriptionService } from "../services/PushSubscriptionService.js";

export class AboutView {
  constructor(rootEl) {
    this.root = rootEl;
  }

  async _getNotificationState() {
    if (!isInstalledApp() || !("Notification" in window)) return "unsupported";
    if (Notification.permission === "denied") return "denied";
    if (Notification.permission === "default") return "default";
    const subscription = await pushSubscriptionService.getActiveSubscription();
    return subscription ? "active" : "inactive";
  }

  _notificationCardHTML(state) {
    if (state === "default") {
      return `
        <div class="card about-section">
          <h3>یادآور پوش</h3>
          <p class="text-secondary" style="margin-bottom:12px">
            برای دریافت یادآور حتی وقتی برنامه بسته است، اعلان را فعال کنید.
          </p>
          <button class="btn btn--primary btn--block" id="notif-permission-btn">فعال‌سازی اعلان</button>
        </div>`;
    }
    if (state === "active") {
      return `
        <div class="card about-section">
          <h3>یادآور پوش</h3>
          <p class="text-secondary" style="margin-bottom:12px">
            ✓ اعلان فعال است — یادآورهای شما حتی وقتی برنامه بسته باشد ارسال می‌شوند.
          </p>
          <button class="btn btn--secondary btn--block" id="notif-disable-btn">غیرفعال کردن</button>
        </div>`;
    }
    if (state === "inactive") {
      return `
        <div class="card about-section">
          <h3>یادآور پوش</h3>
          <p class="text-secondary" style="margin-bottom:12px">
            مجوز اعلان دارید ولی در حال حاضر غیرفعال است.
          </p>
          <button class="btn btn--primary btn--block" id="notif-reenable-btn">فعال‌سازی دوباره</button>
        </div>`;
    }
    if (state === "denied") {
      return `
        <div class="card about-section">
          <h3>یادآور پوش</h3>
          <p class="text-secondary" style="margin-bottom:12px">
            دسترسی اعلان قبلاً رد شده است. مرورگر اجازه نمی‌دهد دوباره از داخل
            اپ بپرسیم — باید دستی از تنظیمات فعالش کنید:
          </p>
          <p class="text-secondary" style="margin-bottom:12px; font-size:0.78rem">
            Chrome → روی آیکون قفل/اطلاعات کنار آدرس سایت بزنید → Permissions
            → Notifications → Allow. سپس این دکمه را بزنید.
          </p>
          <button class="btn btn--secondary btn--block" id="notif-recheck-btn">بررسی دوباره</button>
        </div>`;
    }
    return "";
  }

  async render() {
    const stats = taskController.getStats();
    const notificationState = await this._getNotificationState();

    this.root.innerHTML = `
      <div class="about-hero">
        <div class="about-avatar">MHK</div>
        <h2>محمدحسین کرمی</h2>
        <p class="text-secondary">توسعه‌دهنده نرم‌افزار</p>
        <div class="about-links">
          <a class="btn btn--outline" href="https://mhkarami97.ir" target="_blank" rel="noopener">وب‌سایت</a>
        </div>
      </div>

      ${this._notificationCardHTML(notificationState)}

      <div class="card about-section">
        <h3>آمار</h3>
        <div class="chip-row">
          <span class="chip active">کل: ${stats.total}</span>
          <span class="chip">انجام‌شده: ${stats.completed}</span>
          <span class="chip">در انتظار: ${stats.pending}</span>
          <span class="chip">عقب‌افتاده: ${stats.overdue}</span>
        </div>
      </div>

      <div class="card about-section">
        <h3>عیب‌یابی</h3>
        <p class="text-secondary" style="margin-bottom:12px">
          اگر اپ ظاهر قدیمی یا رفتار عجیب دارد (بعد از یک به‌روزرسانی)، این را بزنید.
        </p>
        <button class="btn btn--secondary btn--block" id="clear-cache-btn">پاک‌سازی کش و بارگذاری مجدد</button>
      </div>
    `;

    this._bindEvents();
  }

  _bindEvents() {
    // Only for state "default" — permission is still undecided, a real
    // native prompt can appear.
    document.getElementById("notif-permission-btn")?.addEventListener("click", async () => {
      await notificationService.requestPermission();
      this.render();
    });

    // Only for state "inactive" — permission already granted, just need a
    // fresh subscription; calling notificationService.requestPermission()
    // here would short-circuit and do nothing, so we go straight to the
    // subscription service instead.
    document.getElementById("notif-reenable-btn")?.addEventListener("click", async () => {
      await pushSubscriptionService.enable();
      this.render();
    });

    document.getElementById("notif-disable-btn")?.addEventListener("click", async () => {
      await pushSubscriptionService.disableAll();
      this.render();
    });

    document.getElementById("notif-recheck-btn")?.addEventListener("click", () => {
      this.render();
    });

    document.getElementById("clear-cache-btn")?.addEventListener("click", async () => {
      try {
        if ("serviceWorker" in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          await Promise.all(registrations.map((r) => r.unregister()));
        }
        if ("caches" in window) {
          const names = await caches.keys();
          await Promise.all(names.map((name) => caches.delete(name)));
        }
      } finally {
        window.location.reload();
      }
    });
  }
}