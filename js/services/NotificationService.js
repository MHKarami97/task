import { pushSubscriptionService, isInstalledApp } from "./PushSubscriptionService.js";
import { telegramLinkService } from "./TelegramLinkService.js";

const GRACE_WINDOW_MS = 10 * 60 * 1000;

export class NotificationService {
  constructor() {
    this.timers = new Map();
  }

  async requestPermission() {
    if (!("Notification" in window)) return "unsupported";
    if (Notification.permission !== "default") return Notification.permission;
    const permission = await Notification.requestPermission();
    if (permission === "granted" && isInstalledApp()) {
      await pushSubscriptionService.enable();
    }
    return permission;
  }

  computeFireAt(task) {
    if (!task.dueTime) {
      console.warn(`NotificationService: task ${task.id} has no dueTime; reminder skipped`);
      return null;
    }
    const dueMoment = new Date(task.dueDateISO);
    const [h, m] = task.dueTime.split(":").map(Number);
    dueMoment.setHours(h, m, 0, 0);
    return dueMoment.getTime() - task.reminderMinutesBefore * 60 * 1000;
  }

  clearLocalTimer(taskId) {
    const timerId = this.timers.get(taskId);
    if (timerId) clearTimeout(timerId);
    this.timers.delete(taskId);
  }

  scheduleReminder(task) {
    this.clearLocalTimer(task.id);

    const hasValidReminder = task.dueDateISO && task.reminderMinutesBefore !== null && !task.completed;
    if (!hasValidReminder) {
      this.cancelReminder(task.id);
      return;
    }

    const fireAt = this.computeFireAt(task);
    if (fireAt === null) return;

    const delay = fireAt - Date.now();
    if (delay > 0) {
      const timerId = setTimeout(() => this.fire(task), delay);
      this.timers.set(task.id, timerId);
    } else if (delay > -GRACE_WINDOW_MS) {
      this.fire(task);
    }

    const remindAtIso = new Date(fireAt).toISOString();
    if (isInstalledApp()) {
      void pushSubscriptionService.syncReminder(task.id, remindAtIso, task.title);
    }
    // همگام‌سازی موازی با تلگرام — بدون نیاز به نصب اپ به‌صورت PWA، چون
    // ارسال از سمت سرور (Durable Object) انجام می‌شود، نه از مرورگر.
    void telegramLinkService.syncReminder(task.id, remindAtIso, task.title);
  }

  cancelReminder(taskId) {
    this.clearLocalTimer(taskId);
    if (isInstalledApp()) {
      void pushSubscriptionService.cancelReminder(taskId);
    }
    void telegramLinkService.cancelReminder(taskId);
  }

  fire(task) {
    if (Notification.permission !== "granted") return;
    new Notification("یادآور وظیفه", {
      body: task.title,
      icon: "./assets/icons/favicon-192.png",
      tag: task.id,
      dir: "rtl",
      lang: "fa",
    });
  }

  rescheduleAll(tasks) {
    tasks.forEach((task) => this.scheduleReminder(task));
  }
}

export const notificationService = new NotificationService();