/**
 * UI controller managing Google Drive backup components in vanilla JS:
 * - Floating sticky SyncFailedBar
 * - CloudConflictModal dialog (Merge vs Replace with Passphrase)
 * - CloudBackupCard in AboutView (with manual Export/Import)
 */
import { cloudSyncService } from "./CloudSyncService.js";
import { CLOUD_STATUS } from "./CloudSyncStateStorage.js";
import { formatDateTimeFa } from "./cloudFormat.js";
import { toUserMessage } from "./CloudSyncError.js";
import { CLOUD_CONFIG } from "./cloudConfig.js";

export class SyncUIController {
  constructor() {
    this.service = cloudSyncService;
    this.dismissedFailureKey = "";
    this._isRetrying = false;
    this._modalEl = null;
    this._barEl = null;

    this.service.subscribe(() => {
      this.updateFailureBar();
      this.updateConflictModal();
    });
  }

  // ---------- 1. Floating SyncFailedBar ----------
  updateFailureBar() {
    var state = this.service.getState();
    var shouldShow =
      state.connected &&
      state.notifyFailures &&
      typeof navigator !== "undefined" &&
      navigator.onLine &&
      (state.status === CLOUD_STATUS.NEEDS_RECONNECT ||
        (state.status === CLOUD_STATUS.ERROR && Boolean(state.lastError)));

    var currentKey = `${state.status}|${state.lastError ?? ""}`;
    if (!shouldShow || this.dismissedFailureKey === currentKey) {
      if (this._barEl) {
        this._barEl.remove();
        this._barEl = null;
      }
      return;
    }

    var message =
      state.status === CLOUD_STATUS.NEEDS_RECONNECT
        ? "اعتبار اتصال به Google Drive منقضی شده است. وظایف همگام‌سازی نشدند."
        : state.lastError || "خطا در همگام‌سازی با Google Drive.";

    if (!this._barEl) {
      this._barEl = document.createElement("aside");
      this._barEl.className = "sync-failure-bar";
      this._barEl.setAttribute("role", "status");
      this._barEl.setAttribute("aria-live", "polite");
      document.body.appendChild(this._barEl);
    }

    this._barEl.innerHTML = `
      <div class="sync-failure-bar__text">
        <span aria-hidden="true">⚠️</span>
        <span>${message}</span>
      </div>
      <div class="sync-failure-bar__actions">
        <button type="button" class="sync-failure-bar__retry" id="sync-retry-btn">
          ${this._isRetrying ? "در حال تلاش..." : "تلاش دوباره"}
        </button>
        <button type="button" class="sync-failure-bar__close" id="sync-dismiss-btn" title="بستن" aria-label="بستن">✕</button>
      </div>
    `;

    document.getElementById("sync-dismiss-btn")?.addEventListener("click", () => {
      this.dismissedFailureKey = currentKey;
      this.updateFailureBar();
    });

    document.getElementById("sync-retry-btn")?.addEventListener("click", async () => {
      if (this._isRetrying) return;
      this._isRetrying = true;
      this.updateFailureBar();
      try {
        await this.service.connect();
      } catch {
        // Handled in store
      } finally {
        this._isRetrying = false;
        this.updateFailureBar();
      }
    });
  }

  // ---------- 2. Cloud Conflict / Newer Version Modal ----------
  updateConflictModal() {
    var state = this.service.getState();
    var decision = state.decision;
    var isOpen = Boolean(decision && !decision.dismissed);

    if (!isOpen) {
      if (this._modalEl) {
        this._modalEl.remove();
        this._modalEl = null;
      }
      return;
    }

    if (!this._modalEl) {
      this._modalEl = document.createElement("div");
      this._modalEl.className = "cloud-modal-backdrop";
      this._modalEl.setAttribute("role", "dialog");
      this._modalEl.setAttribute("aria-modal", "true");
      document.body.appendChild(this._modalEl);
    }

    var title = "نسخه‌ی جدیدتری در Google Drive هست";
    var description = "دیتای این دستگاه تغییری نکرده است و نسخه‌ی ابری جدیدتر است.";
    if (decision.kind === "conflict") {
      title = "تفاوت بین دیتای این دستگاه و Google Drive";
      description = "هم این دستگاه و هم نسخه‌ی ابری از آخرین همگام‌سازی تغییر کرده‌اند. یکی از گزینه‌های زیر را انتخاب کنید.";
    } else if (decision.kind === "remote-only") {
      title = "پشتیبان ابری پیدا شد";
      description = "این دستگاه هنوز کاری ندارد، اما در Google Drive شما نسخه‌ی پشتیبان پیدا شد. مایل به بازیابی هستید؟";
    }

    var defaultMode = decision.kind === "conflict" ? "merge" : "replace";
    var needsPass = Boolean(decision.remoteEncrypted && !state.encryptionEnabled);

    this._modalEl.innerHTML = `
      <div class="cloud-modal-content">
        <div class="cloud-modal-header">
          <h3>${title}</h3>
          <button type="button" id="conflict-close-btn" aria-label="بستن">✕</button>
        </div>

        <p class="text-secondary" style="font-size:0.8rem; line-height:1.6; margin:0">
          ${description}
        </p>

        <div class="cloud-stats-box">
          <div class="cloud-stats-row">
            <span class="text-secondary">تاریخ آخرین نسخه ابری:</span>
            <strong>${formatDateTimeFa(decision.remote.modifiedTime)}</strong>
          </div>
          <div class="cloud-stats-row">
            <span class="text-secondary">تعداد وظایف در Drive:</span>
            <strong style="color:var(--color-accent)">${decision.remoteItemsCount}</strong>
          </div>
          <div class="cloud-stats-row">
            <span class="text-secondary">تعداد وظایف در این دستگاه:</span>
            <strong>${decision.localItemsCount}</strong>
          </div>
          <div class="cloud-stats-row">
            <span class="text-secondary">نوع ذخیره‌سازی ابری:</span>
            <strong>${decision.remoteEncrypted ? "🔒 رمزنگاری‌شده (AES-GCM)" : "ساده (بدون رمز)"}</strong>
          </div>
        </div>

        ${
          needsPass
            ? `
          <div class="field" style="margin-bottom:0">
            <label class="field__label">گذرواژه رمزگشایی فایل ابری:</label>
            <input class="field__input" type="password" id="conflict-passphrase-input" placeholder="گذرواژه‌ای که قبلاً تعیین کردید..." />
          </div>`
            : ""
        }

        <div>
          <label class="field__label" style="margin-bottom:8px">نحوه اعمال نسخه ابری:</label>
          <div class="cloud-mode-options">
            <label class="cloud-mode-label ${defaultMode === "merge" ? "active" : ""}" id="label-mode-merge">
              <input type="radio" name="conflict-mode" value="merge" ${defaultMode === "merge" ? "checked" : ""} />
              <div>
                <b style="color:var(--color-accent); font-size:0.82rem; display:block">ادغام هوشمند (Merge)</b>
                <span class="text-secondary" style="font-size:0.72rem; line-height:1.4">کارها و لیست‌های دو طرف تلفیق می‌شوند.</span>
              </div>
            </label>
            <label class="cloud-mode-label ${defaultMode === "replace" ? "active" : ""}" id="label-mode-replace">
              <input type="radio" name="conflict-mode" value="replace" ${defaultMode === "replace" ? "checked" : ""} />
              <div>
                <b style="color:var(--color-negative); font-size:0.82rem; display:block">جایگزینی کامل (Replace)</b>
                <span class="text-secondary" style="font-size:0.72rem; line-height:1.4">دیتای این دستگاه دقیقاً با نسخه ابری جایگزین می‌شود.</span>
              </div>
            </label>
          </div>
          <p class="field__hint" style="margin-top:6px; font-size:0.72rem">
            * پیش از بازیابی، یک نسخه پشتیبان محلی از دیتای فعلی ذخیره می‌شود تا در صورت نیاز بتوانید آن را بازگردانید.
          </p>
        </div>

        <div id="conflict-error-box" style="display:none; color:var(--color-negative); font-size:0.78rem; font-weight:700"></div>

        <div style="display:flex; flex-direction:column-reverse; gap:8px; margin-top:4px">
          <button type="button" class="btn btn--outline btn--block" id="conflict-later-btn">بعداً</button>
          ${
            decision.localItemsCount > 0
              ? `<button type="button" class="btn btn--secondary btn--block" id="conflict-keep-btn">نگه‌داشتن دیتای این دستگاه</button>`
              : ""
          }
          <button type="button" class="btn btn--primary btn--block" id="conflict-restore-btn">بازیابی از Google Drive</button>
        </div>
      </div>
    `;

    // Radio style toggle
    this._modalEl.querySelectorAll('input[name="conflict-mode"]').forEach((radio) => {
      radio.addEventListener("change", (e) => {
        this._modalEl.querySelectorAll(".cloud-mode-label").forEach((lbl) => lbl.classList.remove("active"));
        if (e.target.value === "merge") {
          document.getElementById("label-mode-merge")?.classList.add("active");
        } else {
          document.getElementById("label-mode-replace")?.classList.add("active");
        }
      });
    });

    document.getElementById("conflict-close-btn")?.addEventListener("click", () => {
      this.service.dismissDecision();
    });

    document.getElementById("conflict-later-btn")?.addEventListener("click", () => {
      this.service.dismissDecision();
    });

    document.getElementById("conflict-keep-btn")?.addEventListener("click", async () => {
      var btn = document.getElementById("conflict-keep-btn");
      if (btn) btn.disabled = true;
      try {
        await this.service.resolveKeepLocal();
        alert("دیتای این دستگاه در Google Drive ذخیره شد.");
      } catch (err) {
        this._showConflictError(toUserMessage(err));
      } finally {
        if (btn) btn.disabled = false;
      }
    });

    document.getElementById("conflict-restore-btn")?.addEventListener("click", async () => {
      var btn = document.getElementById("conflict-restore-btn");
      var passInput = document.getElementById("conflict-passphrase-input");
      var pass = passInput ? passInput.value : "";
      var modeRadio = this._modalEl.querySelector('input[name="conflict-mode"]:checked');
      var mode = modeRadio ? modeRadio.value : "replace";

      if (btn) {
        btn.disabled = true;
        btn.textContent = "در حال بازیابی...";
      }

      try {
        await this.service.resolveRestore(mode, pass);
        alert("وظایف با موفقیت از Google Drive بازیابی شدند.");
      } catch (err) {
        this._showConflictError(toUserMessage(err));
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.textContent = "بازیابی از Google Drive";
        }
      }
    });
  }

  _showConflictError(msg) {
    var box = document.getElementById("conflict-error-box");
    if (box) {
      box.textContent = msg;
      box.style.display = "block";
    }
  }

  // ---------- 3. Cloud Card in AboutView ----------
  getCardHTML() {
    var state = this.service.getState();
    var badgeClass = "cloud-badge--neutral";
    var statusLabel = "قطع";

    switch (state.status) {
      case "idle":
      case "success":
        badgeClass = state.connected ? "cloud-badge--success" : "cloud-badge--neutral";
        statusLabel = state.connected ? "متصل و آماده" : "قطع";
        break;
      case "syncing":
        badgeClass = "cloud-badge--syncing";
        statusLabel = "در حال همگام‌سازی...";
        break;
      case "needs-reconnect":
        badgeClass = "cloud-badge--warning";
        statusLabel = "نیاز به اتصال دوباره";
        break;
      case "decision-pending":
        badgeClass = "cloud-badge--warning";
        statusLabel = "در انتظار تصمیم کاربر";
        break;
      case "error":
        badgeClass = "cloud-badge--error";
        statusLabel = "خطا در همگام‌سازی";
        break;
    }

    var lastSyncText = state.lastSuccessfulBackupTime ? formatDateTimeFa(state.lastSuccessfulBackupTime) : "تاکنون انجام نشده";

    return `
      <div class="card about-section cloud-card" id="cloud-backup-card">
        <div class="cloud-card-header">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:1.3rem">☁️</span>
            <h3 style="margin:0">پشتیبان‌گیری در Google Drive</h3>
          </div>
          <span class="cloud-badge ${badgeClass}" id="cloud-status-badge">${statusLabel}</span>
        </div>

        <p class="text-secondary" style="font-size:0.78rem; line-height:1.6; margin:0">
          پشتیبان‌گیری در پوشه امن و اختصاصی همین برنامه در درایو شما (appDataFolder) انجام می‌شود.
          پس از هر تغییر وظایف یا لیست‌ها، پشتیبان‌گیری به‌صورت خودکار اجرا می‌شود.
        </p>

        <div class="cloud-info-panel">
          <div style="display:flex; justify-content:space-between">
            <span class="text-secondary">وضعیت اتصال:</span>
            <strong>${statusLabel}</strong>
          </div>
          ${
            state.connected
              ? `
            <div style="display:flex; justify-content:space-between">
              <span class="text-secondary">آخرین همگام‌سازی موفق:</span>
              <strong>${lastSyncText}</strong>
            </div>`
              : ""
          }
          ${
            state.connected && state.lastError && state.status !== "error"
              ? `<div style="color:var(--color-negative); font-size:0.75rem">${state.lastError}</div>`
              : ""
          }
        </div>

        <!-- دکمه‌های عملیات اصلی -->
        <div class="cloud-actions-row">
          ${
            !state.connected
              ? `<button type="button" class="btn btn--primary" id="cloud-connect-btn">🔗 اتصال به Google Drive</button>`
              : `
              ${
                state.status === "needs-reconnect" || state.status === "error"
                  ? `<button type="button" class="btn btn--outline" id="cloud-reconnect-btn">🔄 اتصال دوباره</button>`
                  : ""
              }
              ${
                state.decision && state.decision.dismissed
                  ? `<button type="button" class="btn btn--outline" id="cloud-check-remote-btn">☁️ بررسی نسخه ابری</button>`
                  : ""
              }
              <button type="button" class="btn btn--primary" id="cloud-backup-now-btn" ${state.status === "syncing" ? "disabled" : ""}>
                🔄 پشتیبان‌گیری همین حالا
              </button>
              <button type="button" class="btn btn--danger" id="cloud-disconnect-btn">قطع اتصال</button>
            `
          }
        </div>

        <!-- پنل رمزنگاری سرتاسری اختیاری (Zero-Knowledge) -->
        <div class="cloud-crypto-panel">
          <div style="display:flex; align-items:center; gap:6px;">
            <span>🔐</span>
            <b>رمزنگاری سرتاسری اختیاری (Zero-Knowledge)</b>
          </div>

          ${
            state.encryptionEnabled
              ? `
            <div style="color:var(--color-accent); font-weight:700">
              ✓ رمزنگاری AES-GCM ۲۵۶ فعال است.
            </div>
            <p class="text-secondary" style="font-size:0.75rem; margin:0">
              داده‌ها پیش از خروج از دستگاه شما رمز می‌شوند و حتی گوگل هم به محتوای کارهای شما دسترسی ندارد.
            </p>
            <button type="button" class="btn btn--outline" id="cloud-disable-enc-btn" style="align-self:flex-start; margin-top:4px">
              غیرفعال‌سازی رمزنگاری
            </button>`
              : `
            <p class="text-secondary" style="font-size:0.75rem; margin:0">
              با فعال‌سازی رمزنگاری، فایل‌ها با کلید مشتق‌شده از گذرواژه شما (PBKDF2 با ۶۰۰٬۰۰۰ دور) رمز می‌شوند.
              <b style="color:var(--color-negative); display:block; margin-top:4px">هشدار: در صورت فراموشی گذرواژه، اطلاعات ابری هرگز قابل بازیابی نخواهد بود.</b>
            </p>
            <div style="display:flex; flex-direction:column; gap:8px; margin-top:4px">
              <input class="field__input" type="password" id="cloud-enc-pass" placeholder="گذرواژه قوی (حداقل ${CLOUD_CONFIG.minPassphraseLength} نویسه)..." />
              <input class="field__input" type="password" id="cloud-enc-pass-confirm" placeholder="تکرار همان گذرواژه..." />
              <button type="button" class="btn btn--outline" id="cloud-enable-enc-btn" style="align-self:flex-start">
                🛡️ فعال‌سازی رمزنگاری
              </button>
            </div>`
          }
        </div>

        <!-- تنظیمات اعلان و بازگردانی Rollback -->
        <div style="margin-top:var(--space-3); display:flex; flex-direction:column; gap:8px; font-size:0.75rem">
          <label style="display:flex; align-items:center; gap:8px; cursor:pointer">
            <input type="checkbox" id="cloud-notify-failures-check" ${state.notifyFailures ? "checked" : ""} />
            <span>نمایش نوار هشدار پایین صفحه در صورت عدم موفقیت همگام‌سازی (فقط در حالت آنلاین)</span>
          </label>

          ${
            state.hasRollbackSnapshot
              ? `
            <div style="display:flex; align-items:center; justify-content:space-between; background:var(--surface-2); padding:8px 12px; border-radius:var(--radius-md); border:1px solid var(--border)">
              <span class="text-secondary">پیش از آخرین بازیابی ابری، نسخه‌ی محلی ذخیره شده است.</span>
              <button type="button" class="btn btn--outline" id="cloud-rollback-btn" style="font-size:0.72rem; padding:4px 10px">
                ↩️ بازگردانی نسخه قبل
              </button>
            </div>`
              : ""
          }
        </div>

        <!-- بخش مدیریت داده و بکاپ دستی (Export/Import) -->
        <div style="margin-top:var(--space-4); border-top:1px solid var(--border); pt-3; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px; padding-top:12px">
          <span class="text-secondary" style="font-size:0.78rem">پشتیبان‌گیری دستی (فایل JSON آفلاین):</span>
          <div style="display:flex; gap:8px">
            <button type="button" class="btn btn--secondary" id="cloud-export-btn" style="font-size:0.75rem; padding:6px 14px">خروجی دستی</button>
            <input type="file" id="cloud-import-input" accept="application/json" style="display:none" />
            <button type="button" class="btn btn--secondary" id="cloud-import-btn" style="font-size:0.75rem; padding:6px 14px">ورودی دستی</button>
          </div>
        </div>
      </div>
    `;
  }

  bindCardEvents(containerEl, onStateChange) {
    var root = containerEl || document;

    root.querySelector("#cloud-connect-btn")?.addEventListener("click", async () => {
      try {
        await this.service.connect();
        if (onStateChange) onStateChange();
      } catch (err) {
        alert(toUserMessage(err));
      }
    });

    root.querySelector("#cloud-reconnect-btn")?.addEventListener("click", async () => {
      try {
        await this.service.connect();
        if (onStateChange) onStateChange();
      } catch (err) {
        alert(toUserMessage(err));
      }
    });

    root.querySelector("#cloud-check-remote-btn")?.addEventListener("click", () => {
      this.service.reopenDecision();
    });

    root.querySelector("#cloud-backup-now-btn")?.addEventListener("click", async () => {
      try {
        await this.service.performBackup();
        alert("پشتیبان‌گیری در Google Drive انجام شد.");
        if (onStateChange) onStateChange();
      } catch (err) {
        alert(toUserMessage(err));
      }
    });

    root.querySelector("#cloud-disconnect-btn")?.addEventListener("click", async () => {
      if (!confirm("اتصال به Google Drive قطع شود؟ پشتیبان‌گیری خودکار متوقف می‌شود.")) return;
      var removeRemote = confirm("آیا نسخه‌های پشتیبان موجود در پوشه مخفی Google Drive هم حذف شوند؟\nتأیید = حذف، لغو = نگه‌داشتن");
      try {
        await this.service.disconnect(removeRemote);
        alert("اتصال با موفقیت قطع شد.");
        if (onStateChange) onStateChange();
      } catch (err) {
        alert(toUserMessage(err));
      }
    });

    root.querySelector("#cloud-enable-enc-btn")?.addEventListener("click", async () => {
      var pass = root.querySelector("#cloud-enc-pass")?.value || "";
      var passConfirm = root.querySelector("#cloud-enc-pass-confirm")?.value || "";
      if (pass.length < CLOUD_CONFIG.minPassphraseLength) {
        alert(`گذرواژه باید حداقل ${CLOUD_CONFIG.minPassphraseLength} نویسه باشد.`);
        return;
      }
      if (pass !== passConfirm) {
        alert("گذرواژه و تکرار آن یکسان نیستند.");
        return;
      }
      try {
        await this.service.enableEncryption(pass);
        alert("رمزنگاری سمت کلاینت با موفقیت فعال شد.");
        if (onStateChange) onStateChange();
      } catch (err) {
        alert(toUserMessage(err));
      }
    });

    root.querySelector("#cloud-disable-enc-btn")?.addEventListener("click", async () => {
      if (!confirm("از این پس نسخه‌های ابری بدون رمزنگاری ذخیره خواهند شد. آیا ادامه می‌دهید؟")) return;
      try {
        await this.service.disableEncryption();
        alert("رمزنگاری غیرفعال شد.");
        if (onStateChange) onStateChange();
      } catch (err) {
        alert(toUserMessage(err));
      }
    });

    root.querySelector("#cloud-notify-failures-check")?.addEventListener("change", (e) => {
      this.service.setNotifyFailures(e.target.checked);
    });

    root.querySelector("#cloud-rollback-btn")?.addEventListener("click", async () => {
      if (!confirm("اطلاعات این دستگاه به وضعیت قبل از آخرین بازیابی بازمی‌گردد. ادامه می‌دهید؟")) return;
      try {
        await this.service.rollbackLastRestore();
        alert("داده‌ها به وضعیت پیش از بازیابی برگشت.");
        window.location.reload();
      } catch (err) {
        alert(toUserMessage(err));
      }
    });

    // دستی (Manual export / import)
    root.querySelector("#cloud-export-btn")?.addEventListener("click", () => {
      this.service.exportLocalJson();
    });

    var importInput = root.querySelector("#cloud-import-input");
    root.querySelector("#cloud-import-btn")?.addEventListener("click", () => {
      importInput?.click();
    });

    importInput?.addEventListener("change", async (e) => {
      var file = e.target.files?.[0];
      if (file) {
        try {
          await this.service.importLocalJson(file);
          alert("داده‌ها با موفقیت از فایل وارد شدند.");
          if (onStateChange) onStateChange();
        } catch (err) {
          alert("خطا در ورود داده: " + err.message);
        }
      }
      e.target.value = "";
    });
  }
}

export var syncUIController = new SyncUIController();
