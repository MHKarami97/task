import { taskController } from "../controllers/TaskController.js";

/** AboutView — introduces the developer and links to their personal site. */
export class AboutView {
  constructor(rootEl) {
    this.root = rootEl;
  }

  render() {
    const stats = taskController.getStats();
    this.root.innerHTML = `
      <div class="about-hero">
        <div class="about-avatar">MK</div>
        <h2>محمدحسین کرمی</h2>
        <p class="text-secondary">توسعه‌دهنده نرم‌افزار | .NET Core, Angular, Nuxt</p>
        <div class="about-links">
          <a class="btn btn--outline" href="https://mhkarami97.ir" target="_blank" rel="noopener">وبسایت من</a>
        </div>
      </div>

      <div class="card about-section">
        <h3>درباره این اپلیکیشن</h3>
        <p>این اپلیکیشن یک PWA کاملاً سمت کاربر (بدون بک‌اند) برای مدیریت و یادآوری کارهاست، مشابه Google Tasks، با تقویم شمسی داخلی، حالت تیره/روشن و قابلیت نصب روی موبایل و دسکتاپ. تمام داده‌ها فقط در مرورگر شما (localStorage) ذخیره می‌شود و به هیچ سروری ارسال نمی‌گردد.</p>
      </div>

      <div class="card about-section">
        <h3>آمار کاربری</h3>
        <div class="chip-row">
          <span class="chip active">کل کارها: ${stats.total}</span>
          <span class="chip">انجام‌شده: ${stats.completed}</span>
          <span class="chip">باقی‌مانده: ${stats.pending}</span>
          <span class="chip">عقب‌افتاده: ${stats.overdue}</span>
        </div>
      </div>

      <div class="card about-section">
        <h3>تکنولوژی‌های استفاده‌شده</h3>
        <div class="tech-badges">
          ${["HTML5", "CSS3", "Vanilla JavaScript (ES Modules)", "PWA / Service Worker", "localStorage", "تقویم جلالی (Jalali)"]
            .map((t) => `<span class="tech-badge">${t}</span>`)
            .join("")}
        </div>
      </div>

      <div class="card about-section">
        <h3>الگوهای طراحی به‌کاررفته</h3>
        <p class="text-secondary">Repository, Facade, Observer (EventBus), Strategy (مرتب‌سازی), Singleton (ThemeManager), Adapter (StorageAdapter)</p>
      </div>`;
  }
}
