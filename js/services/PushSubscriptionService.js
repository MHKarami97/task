import { PUSH_CONFIG } from "../config.js";

export function isInstalledApp() {
  const isStandaloneDisplay = ["fullscreen", "standalone", "minimal-ui"].some(
    (mode) => window.matchMedia(`(display-mode: ${mode})`).matches
  );
  const isIosHomeScreen = window.navigator.standalone === true;
  const isAndroidTwa = document.referrer.startsWith("android-app://");
  return isStandaloneDisplay || isIosHomeScreen || isAndroidTwa;
}

class PushSubscriptionService {
  isSupported() {
    return (
      isInstalledApp() &&
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window
    );
  }

  _urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const output = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; i++) output[i] = rawData.charCodeAt(i);
    return output;
  }

  async _getOrCreateSubscription() {
    const registration = await navigator.serviceWorker.ready;
    const existing = await registration.pushManager.getSubscription();
    if (existing) return existing;
    return registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: this._urlBase64ToUint8Array(PUSH_CONFIG.vapidPublicKey),
    });
  }

  async getActiveSubscription() {
    if (!("serviceWorker" in navigator)) return null;
    const registration = await navigator.serviceWorker.ready;
    return registration.pushManager.getSubscription();
  }

  async syncReminder(taskId, remindAtIso) {
    if (!this.isSupported()) return;
    if (Notification.permission !== "granted") return;

    try {
      const subscription = await this._getOrCreateSubscription();
      await fetch(`${PUSH_CONFIG.apiBaseUrl}/api/reminders/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          taskId,
          remindAtIso,
        }),
      });
    } catch (err) {
      console.error("[PushSubscriptionService] syncReminder failed", err);
    }
  }

  async cancelReminder(taskId) {
    if (!this.isSupported()) return;
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (!subscription) return;
      await fetch(`${PUSH_CONFIG.apiBaseUrl}/api/reminders/unsubscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: subscription.endpoint, taskId }),
      });
    } catch (err) {
      console.error("[PushSubscriptionService] cancelReminder failed", err);
    }
  }

  async enable() {
    if (!this.isSupported()) return "unsupported";
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      try {
        await this._getOrCreateSubscription();
      } catch (err) {
        console.error("[PushSubscriptionService] subscribe failed", err);
        return "error";
      }
    }
    return permission;
  }

  /** Explicitly turns push off — unsubscribes the browser, but the OS-level
   * Notification permission itself stays "granted" (that can't be revoked
   * from JS); only re-enabling creates a fresh subscription again. */
  async disableAll() {
    try {
      const subscription = await this.getActiveSubscription();
      if (subscription) await subscription.unsubscribe();
      return true;
    } catch (err) {
      console.error("[PushSubscriptionService] disableAll failed", err);
      return false;
    }
  }
}

export const pushSubscriptionService = new PushSubscriptionService();