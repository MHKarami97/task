import { TELEGRAM_CONFIG } from "../config.js";
import { storage } from "../repositories/StorageAdapter.js";

const LINK_CODE_KEY = "telegramLinkCode";
const ENABLED_KEY = "telegramEnabled";

class TelegramLinkService {
  constructor() {
    this._linkCode = storage.get(LINK_CODE_KEY, null);
  }

  /** true اگر config.js با نام واقعی بات پر شده باشد. */
  isConfigured() {
    return Boolean(TELEGRAM_CONFIG.botUsername) && TELEGRAM_CONFIG.botUsername !== "YourTaskReminderBot";
  }

  /** ترجیح کاربر برای دریافت یادآور از طریق تلگرام (سوییچ در تنظیمات). */
  isEnabled() {
    return storage.get(ENABLED_KEY, false) === true;
  }

  setEnabled(value) {
    storage.set(ENABLED_KEY, Boolean(value));
  }

  /** کد یکتای این دستگاه را برمی‌گرداند؛ اگر وجود نداشته باشد می‌سازد. */
  getOrCreateLinkCode() {
    if (this._linkCode) return this._linkCode;
    const raw = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
    const code = raw.replace(/-/g, "").slice(0, 24);
    this._linkCode = code;
    storage.set(LINK_CODE_KEY, code);
    return code;
  }

  /** لینک deep-link برای باز کردن بات با پارامتر start. */
  getDeepLink() {
    const code = this.getOrCreateLinkCode();
    return `https://t.me/${TELEGRAM_CONFIG.botUsername}?start=${code}`;
  }

  /** وضعیت اتصال را از سرور می‌پرسد. برای Poll کردن بعد از باز کردن دیپ‌لینک. */
  async getLinkStatus() {
    if (!this._linkCode) return { linked: false };
    try {
      const url = `${TELEGRAM_CONFIG.apiBaseUrl}/api/telegram/link/status?code=${encodeURIComponent(this._linkCode)}`;
      const res = await fetch(url);
      if (!res.ok) return { linked: false };
      return await res.json();
    } catch (err) {
      console.error("[TelegramLinkService] getLinkStatus failed", err);
      return { linked: false };
    }
  }

  /** قطع کامل اتصال (هم سمت سرور و هم غیرفعال کردن سوییچ محلی). */
  async unlink() {
    if (!this._linkCode) {
      this.setEnabled(false);
      return true;
    }
    try {
      await fetch(`${TELEGRAM_CONFIG.apiBaseUrl}/api/telegram/unlink`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkCode: this._linkCode }),
      });
      this.setEnabled(false);
      return true;
    } catch (err) {
      console.error("[TelegramLinkService] unlink failed", err);
      return false;
    }
  }

  /** با هر بار زمان‌بندی یادآور در NotificationService فراخوانی می‌شود. */
  async syncReminder(taskId, remindAtIso, taskTitle) {
    if (!this.isEnabled() || !this._linkCode) return;
    try {
      await fetch(`${TELEGRAM_CONFIG.apiBaseUrl}/api/telegram/reminders/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkCode: this._linkCode, taskId, taskTitle, remindAtIso }),
      });
    } catch (err) {
      console.error("[TelegramLinkService] syncReminder failed", err);
    }
  }

  /** با حذف/تکمیل تسک یا لغو یادآور در NotificationService فراخوانی می‌شود. */
  async cancelReminder(taskId) {
    if (!this._linkCode) return;
    try {
      await fetch(`${TELEGRAM_CONFIG.apiBaseUrl}/api/telegram/reminders/unsubscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkCode: this._linkCode, taskId }),
      });
    } catch (err) {
      console.error("[TelegramLinkService] cancelReminder failed", err);
    }
  }
}

export const telegramLinkService = new TelegramLinkService();
