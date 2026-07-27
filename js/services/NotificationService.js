/**
 * NotificationService — wraps the Web Notifications API and schedules
 * client-side reminders using setTimeout (persisted timers are re-armed on
 * app load by TaskController). No backend/push server required.
 */
export class NotificationService {
  constructor() {
    this._timers = new Map();
  }

  async requestPermission() {
    if (!("Notification" in window)) return "unsupported";
    if (Notification.permission === "default") {
      return Notification.permission = await Notification.requestPermission();
    }
    return Notification.permission;
  }

  scheduleReminder(task) {
    this.cancelReminder(task.id);
    if (!task.dueDateISO || task.reminderMinutesBefore == null || task.completed) return;

    const dueMoment = new Date(task.dueDateISO);
    if (task.dueTime) {
      const [h, m] = task.dueTime.split(":").map(Number);
      dueMoment.setHours(h, m, 0, 0);
    }
    const fireAt = dueMoment.getTime() - task.reminderMinutesBefore * 60 * 1000;
    const delay = fireAt - Date.now();
    if (delay <= 0) return;

    const timerId = setTimeout(() => this._fire(task), delay);
    this._timers.set(task.id, timerId);
  }

  cancelReminder(taskId) {
    const timerId = this._timers.get(taskId);
    if (timerId) {
      clearTimeout(timerId);
      this._timers.delete(taskId);
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
