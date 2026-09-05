import { taskController } from "../controllers/TaskController.js";
import { notificationService } from "../services/NotificationService.js";
import { isInstalledApp, pushSubscriptionService } from "../services/PushSubscriptionService.js";

export class AboutView {
  #renderSeq = 0;
  #actionInFlight = false;

  constructor(rootEl) {
    this.root = rootEl;
  }

  async _getNotificationState() {
    if (!isInstalledApp() || !("Notification" in window)) return "unsupported";
    if (Notification.permission === "denied") return "denied";
    if (Notification.permission === "default") return "default";
    var subscription = await pushSubscriptionService.getActiveSubscription();
    return subscription ? "active" : "inactive";
  }

  _notificationCardHTML(state) {
    if (state === "loading") {
      return `
        <div class="card about-section" id="notif-card-slot">
          <h3>یادآور پوش</h3>
          <p class="text-secondary" style="margin-bottom:0">در حال بررسی وضعیت اعلان...</p>
        </div>`;
    }
    if (state === "default") {
      return `
        <div class="card about-section" id="notif-card-slot">
          <h3>یادآور پوش</h3>
          <p class="text-secondary" style="margin-bottom:12px">
            برای دریافت یادآور حتی وقتی برنامه بسته است، اعلان را فعال کنید.
          </p>
          <button class="btn btn--primary btn--block" id="notif-permission-btn">فعال‌سازی اعلان</button>
        </div>`;
    }
    if (state === "active") {
      return `
        <div class="card about-section" id="notif-card-slot">
          <h3>یادآور پوش</h3>
          <p class="text-secondary" style="margin-bottom:12px">
            ✓ اعلان فعال است — یادآورهای شما حتی وقتی برنامه بسته باشد ارسال می‌شوند.
          </p>
          <button class="btn btn--secondary btn--block" id="notif-disable-btn">غیرفعال کردن</button>
        </div>`;
    }
    if (state === "inactive") {
      return `
        <div class="card about-section" id="notif-card-slot">
          <h3>یادآور پوش</h3>
          <p class="text-secondary" style="margin-bottom:12px">
            مجوز اعلان دارید ولی در حال حاضر غیرفعال است.
          </p>
          <button class="btn btn--primary btn--block" id="notif-reenable-btn">فعال‌سازی دوباره</button>
        </div>`;
    }
    if (state === "denied") {
      return `
        <div class="card about-section" id="notif-card-slot">
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
    return `<div class="card about-section" id="notif-card-slot"></div>`;
  }

  _shellHTML(stats, notificationCardHTML) {
    return `
      <div class="about-hero">
        <div class="about-avatar">MHK</div>
        <h2>محمدحسین کرمی</h2>
        <p class="text-secondary">توسعه‌دهنده نرم‌افزار</p>
        <div class="about-links">
          <a class="btn btn--outline" href="https://mhkarami97.ir" target="_blank" rel="noopener">وب‌سایت</a>
        </div>
      </div>

      ${notificationCardHTML}

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
  }

  /**
   * Renders the shell synchronously (with a loading placeholder for the
   * notification card), then patches only the notification card once its
   * async state resolves. `seq` is used to discard the async result if a
   * newer render() call has since started — this prevents two overlapping
   * renders from clobbering each other's DOM.
   */
  async render() {
    var seq = ++this.#renderSeq;
    var stats = taskController.getStats();

    this.root.innerHTML = this._shellHTML(stats, this._notificationCardHTML("loading"));
    this._bindStaticEvents();

    var notificationState = await this._getNotificationState();
    if (seq !== this.#renderSeq) return; // a newer render superseded this one

    var slot = this.root.querySelector("#notif-card-slot");
    if (slot) {
      slot.outerHTML = this._notificationCardHTML(notificationState);
      this._bindNotificationEvents();
    }
  }

  _bindStaticEvents() {
    document.getElementById("clear-cache-btn")?.addEventListener("click", (e) => {
      this._runExclusive(e.currentTarget, "در حال پاک‌سازی...", async () => {
        try {
          if ("serviceWorker" in navigator) {
            var registrations = await navigator.serviceWorker.getRegistrations();
            await Promise.all(registrations.map((r) => r.unregister()));
          }
          if ("caches" in window) {
            var names = await caches.keys();
            await Promise.all(names.map((name) => caches.delete(name)));
          }
        } finally {
          window.location.reload();
        }
      }, { rerender: false }); // page reloads regardless, no need to re-render
    });
  }

  _bindNotificationEvents() {
    document.getElementById("notif-permission-btn")?.addEventListener("click", (e) => {
      this._runExclusive(e.currentTarget, "در حال درخواست مجوز...", () =>
        notificationService.requestPermission()
      );
    });

    document.getElementById("notif-reenable-btn")?.addEventListener("click", (e) => {
      this._runExclusive(e.currentTarget, "در حال فعال‌سازی...", () =>
        pushSubscriptionService.enable()
      );
    });

    document.getElementById("notif-disable-btn")?.addEventListener("click", (e) => {
      this._runExclusive(e.currentTarget, "در حال غیرفعال‌سازی...", () =>
        pushSubscriptionService.disableAll()
      );
    });

    document.getElementById("notif-recheck-btn")?.addEventListener("click", (e) => {
      this._runExclusive(e.currentTarget, "در حال بررسی...", () => Promise.resolve());
    });
  }

  /**
   * Runs a single async action exclusively: disables the triggering button
   * *synchronously* (before any await) so a second click in the same tick
   * can't start a second overlapping operation, restores it in `finally`,
   * and swallows/logs failures so the UI never gets stuck disabled forever.
   */
  async _runExclusive(buttonEl, busyLabel, action, { rerender = true } = {}) {
    if (this.#actionInFlight || !buttonEl || buttonEl.disabled) return;

    this.#actionInFlight = true;
    var originalLabel = buttonEl.textContent;
    buttonEl.disabled = true;
    buttonEl.textContent = busyLabel;

    try {
      await action();
    } catch (err) {
      console.error("[AboutView] action failed:", err);
    } finally {
      this.#actionInFlight = false;
      if (rerender) {
        await this.render();
      } else {
        buttonEl.disabled = false;
        buttonEl.textContent = originalLabel;
      }
    }
  }
}
