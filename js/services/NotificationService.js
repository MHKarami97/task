/**
 * js/services/NotificationService.js
 *
 * Two layers per reminder:
 *  1. setTimeout-based local notification — instant fallback while the app
 *     happens to be open, zero setup.
 *  2. Server-synced push reminder via PushSubscriptionService — the only
 *     path that fires when the app/PWA is fully closed. Gated to installed
 *     app/PWA only (Push reliably fails/is pointless on a plain browser tab).
 *
 * Fixed bug from the previous version: a reminder whose fireAt already
 * passed while the app was closed used to be silently dropped forever
 * (`if (delay <= 0) return`). Now it fires immediately if still within a
 * 10-minute grace window instead of vanishing.
 */
import { pushSubscriptionService, isInstalledApp } from "./PushSubscriptionService.js";

const GRACE_WINDOW_MS = 10 * 60 * 1000;

export class NotificationService {
  constructor() {
    this._timers = new Map();
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

  _computeFireAt(task) {
    const dueMoment = new Date(task.dueDateISO);
    if (task.dueTime) {
      const [h, m] = task.dueTime.split(":").map(Number);
      dueMoment.setHours(h, m, 0, 0);
    }
    return dueMoment.getTime() - task.reminderMinutesBefore * 60 * 1000;
  }

  scheduleReminder(task) {
    this.cancelReminder(task.id);

    if (!task.dueDateISO || task.reminderMinutesBefore == null || task.completed) {
      return;
    }

    const fireAt = this._computeFireAt(task);
    const delay = fireAt - Date.now();

    if (delay > 0) {
      const timerId = setTimeout(() => this._fire(task), delay);
      this._timers.set(task.id, timerId);
    } else if (delay > -GRACE_WINDOW_MS) {
      this._fire(task);
    }

    if (isInstalledApp()) {
      void pushSubscriptionService.syncReminder(task.id, new Date(fireAt).toISOString());
    }
  }

  cancelReminder(taskId) {
    const timerId = this._timers.get(taskId);
    if (timerId) {
      clearTimeout(timerId);
      this._timers.delete(taskId);
    }

    if (isInstalledApp()) {
      void pushSubscriptionService.cancelReminder(taskId);
    }
  }

  _fire(task) {
    if (Notification.permission !== "granted") return;
    new Notification("یادآوری کار", {
      body: task.title,
      icon: "./icons/icon-192.png",
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
