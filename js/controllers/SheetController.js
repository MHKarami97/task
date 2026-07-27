import { taskController } from "../controllers/TaskController.js";
import PersianDate from "../utils/PersianDate.js";

const { JalaliDate } = PersianDate;

const ICON_TITLE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h10M4 18h7"/></svg>';
const ICON_NOTES = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16v16H4z"/><path d="M8 9h8M8 13h5"/></svg>';
const ICON_LIST = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="5" cy="6" r="1.5"/><circle cx="5" cy="12" r="1.5"/><circle cx="5" cy="18" r="1.5"/><path d="M9 6h11M9 12h11M9 18h11"/></svg>';
const ICON_DATE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/></svg>';
const ICON_TIME = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>';
const ICON_PRIORITY = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 21V4M4 4h13l-3 4 3 4H4"/></svg>';
const ICON_REPEAT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 2l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 22l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3"/></svg>';
const ICON_BELL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 8a6 6 0 1 1 12 0c0 3 1 5 2 6H4c1-1 2-3 2-6z"/><path d="M9 20a3 3 0 0 0 6 0"/></svg>';
const ICON_COLOR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/></svg>';

/**
 * SheetController — manages the bottom-sheet modal used for both
 * creating/editing tasks and creating new lists. Kept separate from views
 * to avoid duplicating modal wiring logic (Single Responsibility).
 */
export class SheetController {
  constructor(overlayEl) {
    this.overlay = overlayEl;
    this.overlay.addEventListener("click", (e) => {
      if (e.target === this.overlay) this.close();
    });
  }

  close() {
    this.overlay.classList.remove("active");
    setTimeout(() => (this.overlay.innerHTML = ""), 250);
  }

  openTaskForm(taskId = null, defaultListId = "default") {
    const existing = taskId ? taskController.taskRepository.getById(taskId) : null;
    const lists = taskController.getAllLists();
    const dueJalali = existing?.dueDateISO ? JalaliDate.fromISO(existing.dueDateISO) : null;

    const priorityOptions = [
      { key: "high", label: "بالا" },
      { key: "medium", label: "متوسط" },
      { key: "low", label: "پایین" },
    ];
    const repeatOptions = [
      { key: "none", label: "بدون تکرار" },
      { key: "daily", label: "روزانه" },
      { key: "weekly", label: "هفتگی" },
      { key: "monthly", label: "ماهانه" },
    ];
    const reminderOptions = [
      { key: "", label: "بدون یادآوری" },
      { key: "10", label: "۱۰ دقیقه قبل" },
      { key: "30", label: "۳۰ دقیقه قبل" },
      { key: "60", label: "۱ ساعت قبل" },
      { key: "1440", label: "۱ روز قبل" },
    ];

    const currentPriority = existing?.priority || "medium";
    const currentRepeat = existing?.repeat || "none";
    const currentReminder = existing?.reminderMinutesBefore != null ? String(existing.reminderMinutesBefore) : "";

    this.overlay.innerHTML = `
      <div class="bottom-sheet">
        <div class="bottom-sheet__handle"></div>
        <div class="bottom-sheet__header">
          <h3>${existing ? "ویرایش کار" : "کار جدید"}</h3>
          <button class="btn--icon" id="sheet-close">✕</button>
        </div>

        <div class="field">
          <label class="field__label">${ICON_TITLE}عنوان</label>
          <input class="field__input" id="f-title" value="${existing ? this._esc(existing.title) : ""}" placeholder="مثلاً: خرید نان" autofocus />
        </div>

        <div class="field">
          <label class="field__label">${ICON_NOTES}یادداشت</label>
          <textarea class="field__textarea" id="f-notes" placeholder="جزئیات بیشتر (اختیاری)">${existing ? this._esc(existing.notes) : ""}</textarea>
        </div>

        <div class="field">
          <label class="field__label">${ICON_LIST}لیست</label>
          <div class="select-wrapper">
            <select class="field__select" id="f-list">
              ${lists.map((l) => `<option value="${l.id}" ${l.id === (existing?.listId || defaultListId) ? "selected" : ""}>${l.name}</option>`).join("")}
            </select>
          </div>
        </div>

        <div class="field-row field">
          <div class="date-field">
            <label class="field__label">${ICON_DATE}تاریخ (شمسی)</label>
            <button type="button" class="field__input date-field__trigger" id="f-date-trigger">
              <span id="f-date-display">${dueJalali ? dueJalali.formatLong() : "انتخاب تاریخ"}</span>
            </button>
            <input type="hidden" id="f-date" value="${dueJalali ? dueJalali.format() : ""}" />
          </div>
          <div>
            <label class="field__label">${ICON_TIME}ساعت</label>
            <input class="field__input" type="time" id="f-time" value="${existing?.dueTime || ""}" />
          </div>
        </div>

        <div class="field__divider"></div>

        <div class="field">
          <label class="field__label">${ICON_PRIORITY}اولویت</label>
          <div class="segmented" id="f-priority-group">
            ${priorityOptions
              .map(
                (p) => `
              <button type="button" class="segmented__option ${p.key === currentPriority ? "active" : ""}" data-priority="${p.key}">
                <span class="priority-dot priority-dot--${p.key}"></span>${p.label}
              </button>`
              )
              .join("")}
          </div>
          <input type="hidden" id="f-priority" value="${currentPriority}" />
        </div>

        <div class="field">
          <label class="field__label">${ICON_REPEAT}تکرار</label>
          <div class="toggle-group" id="f-repeat-group">
            ${repeatOptions
              .map(
                (r) =>
                  `<button type="button" class="toggle-group__option ${r.key === currentRepeat ? "active" : ""}" data-repeat="${r.key}">${r.label}</button>`
              )
              .join("")}
          </div>
          <input type="hidden" id="f-repeat" value="${currentRepeat}" />
        </div>

        <div class="field">
          <label class="field__label">${ICON_BELL}یادآوری</label>
          <div class="toggle-group" id="f-reminder-group">
            ${reminderOptions
              .map(
                (r) =>
                  `<button type="button" class="toggle-group__option ${r.key === currentReminder ? "active" : ""}" data-reminder="${r.key}">${r.label}</button>`
              )
              .join("")}
          </div>
          <input type="hidden" id="f-reminder" value="${currentReminder}" />
        </div>

        <div class="field__divider"></div>

        <button class="btn btn--primary btn--block" id="f-save">${existing ? "ذخیره تغییرات" : "افزودن کار"}</button>
        ${existing ? '<button class="btn btn--danger btn--block" id="f-delete" style="margin-top:10px;">حذف کار</button>' : ""}
      </div>`;

    this.overlay.classList.add("active");
    this._bindSegmented("f-priority-group", "f-priority", "priority");
    this._bindSegmented("f-repeat-group", "f-repeat", "repeat");
    this._bindSegmented("f-reminder-group", "f-reminder", "reminder");
    this._pickerViewDate = dueJalali || JalaliDate.today();
    this._pickerSelectedDate = dueJalali;
    this._bindDatePicker();

    this.overlay.querySelector("#sheet-close").addEventListener("click", () => this.close());
    this.overlay.querySelector("#f-save").addEventListener("click", () => this._saveTask(existing));
    this.overlay.querySelector("#f-delete")?.addEventListener("click", () => {
      taskController.deleteTask(existing.id);
      this.close();
    });
  }

  _bindDatePicker() {
    const trigger = this.overlay.querySelector("#f-date-trigger");
    trigger?.addEventListener("click", (e) => {
      e.stopPropagation();
      this._toggleDatePicker();
    });
  }

  _toggleDatePicker() {
    const existingPopover = this.overlay.querySelector("#date-picker-popover");
    if (existingPopover) {
      existingPopover.remove();
      return;
    }
    const wrapper = this.overlay.querySelector(".date-field");
    const popover = document.createElement("div");
    popover.id = "date-picker-popover";
    popover.className = "date-picker-popover";
    popover.innerHTML = this._renderDatePickerBody();
    wrapper.appendChild(popover);
    this._bindDatePickerBody(popover);

    const closeOnOutsideClick = (e) => {
      if (!popover.contains(e.target) && e.target.id !== "f-date-trigger") {
        popover.remove();
        document.removeEventListener("click", closeOnOutsideClick);
      }
    };
    setTimeout(() => document.addEventListener("click", closeOnOutsideClick), 0);
  }

  _renderDatePickerBody() {
    const { jy, jm } = this._pickerViewDate;
    const monthLength = JalaliDate.monthLength(jy, jm);
    const firstDay = new JalaliDate(jy, jm, 1);
    const leadingBlanks = firstDay.weekdayIndex;
    const days = [];
    for (let i = 0; i < leadingBlanks; i += 1) days.push(null);
    for (let d = 1; d <= monthLength; d += 1) days.push(new JalaliDate(jy, jm, d));
    while (days.length % 7 !== 0) days.push(null);
    const weekdayShort = JalaliDate.weekdayShort();

    return `
      <div class="date-picker-header">
        <button type="button" class="btn--icon" id="dp-prev">‹</button>
        <span>${this._pickerViewDate.monthName} ${jy}</span>
        <button type="button" class="btn--icon" id="dp-next">›</button>
      </div>
      <div class="date-picker-grid">
        ${weekdayShort.map((w) => `<div class="date-picker-grid__weekday">${w}</div>`).join("")}
        ${days
          .map((d) => {
            if (!d) return `<div class="date-picker-day is-empty"></div>`;
            const isSelected = this._pickerSelectedDate && d.isSameDay(this._pickerSelectedDate);
            const isToday = d.isToday();
            return `<div class="date-picker-day ${isSelected ? "selected" : ""} ${isToday ? "today" : ""}" data-jy="${d.jy}" data-jm="${d.jm}" data-jd="${d.jd}">${d.jd}</div>`;
          })
          .join("")}
      </div>
      <div class="date-picker-footer">
        <button type="button" class="btn btn--secondary" id="dp-clear">حذف تاریخ</button>
        <button type="button" class="btn btn--primary" id="dp-today">امروز</button>
      </div>`;
  }

  _bindDatePickerBody(popover) {
    popover.querySelector("#dp-prev").addEventListener("click", (e) => {
      e.stopPropagation();
      const { jy, jm } = this._pickerViewDate;
      this._pickerViewDate = jm === 1 ? new JalaliDate(jy - 1, 12, 1) : new JalaliDate(jy, jm - 1, 1);
      popover.innerHTML = this._renderDatePickerBody();
      this._bindDatePickerBody(popover);
    });
    popover.querySelector("#dp-next").addEventListener("click", (e) => {
      e.stopPropagation();
      const { jy, jm } = this._pickerViewDate;
      this._pickerViewDate = jm === 12 ? new JalaliDate(jy + 1, 1, 1) : new JalaliDate(jy, jm + 1, 1);
      popover.innerHTML = this._renderDatePickerBody();
      this._bindDatePickerBody(popover);
    });
    popover.querySelectorAll(".date-picker-day[data-jy]").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        const selected = new JalaliDate(Number(el.dataset.jy), Number(el.dataset.jm), Number(el.dataset.jd));
        this._pickerSelectedDate = selected;
        this.overlay.querySelector("#f-date").value = selected.format();
        this.overlay.querySelector("#f-date-display").textContent = selected.formatLong();
        popover.remove();
      });
    });
    popover.querySelector("#dp-today").addEventListener("click", (e) => {
      e.stopPropagation();
      const today = JalaliDate.today();
      this._pickerSelectedDate = today;
      this.overlay.querySelector("#f-date").value = today.format();
      this.overlay.querySelector("#f-date-display").textContent = today.formatLong();
      popover.remove();
    });
    popover.querySelector("#dp-clear").addEventListener("click", (e) => {
      e.stopPropagation();
      this._pickerSelectedDate = null;
      this.overlay.querySelector("#f-date").value = "";
      this.overlay.querySelector("#f-date-display").textContent = "انتخاب تاریخ";
      popover.remove();
    });
  }

  _bindSegmented(groupId, hiddenInputId, datasetKey) {
    const group = this.overlay.querySelector(`#${groupId}`);
    const hiddenInput = this.overlay.querySelector(`#${hiddenInputId}`);
    if (!group || !hiddenInput) return;
    group.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => {
        group.querySelectorAll("button").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        hiddenInput.value = btn.dataset[datasetKey];
      });
    });
  }

  _saveTask(existing) {
    const title = this.overlay.querySelector("#f-title").value.trim();
    if (!title) return;
    const notes = this.overlay.querySelector("#f-notes").value;
    const listId = this.overlay.querySelector("#f-list").value;
    const dateStr = this.overlay.querySelector("#f-date").value.trim();
    const dueTime = this.overlay.querySelector("#f-time").value || null;
    const priority = this.overlay.querySelector("#f-priority").value;
    const repeat = this.overlay.querySelector("#f-repeat").value;
    const reminderRaw = this.overlay.querySelector("#f-reminder").value;
    const reminderMinutesBefore = reminderRaw ? Number(reminderRaw) : null;

    let dueDateISO = null;
    if (dateStr) {
      const parts = dateStr.split("/").map((p) => Number(p.trim()));
      if (parts.length === 3 && !parts.some(Number.isNaN)) {
        dueDateISO = new JalaliDate(parts[0], parts[1], parts[2]).toDate().toISOString();
      }
    }

    const payload = { title, notes, listId, dueDateISO, dueTime, priority, repeat, reminderMinutesBefore };

    if (existing) {
      taskController.updateTask(existing.id, payload);
    } else {
      taskController.createTask(payload);
    }
    this.close();
  }

  openListForm() {
    this.overlay.innerHTML = `
      <div class="bottom-sheet">
        <div class="bottom-sheet__handle"></div>
        <div class="bottom-sheet__header">
          <h3>لیست جدید</h3>
          <button class="btn--icon" id="sheet-close">✕</button>
        </div>
        <div class="field">
          <label class="field__label">${ICON_LIST}نام لیست</label>
          <input class="field__input" id="list-name" placeholder="مثلاً: کار، خانه، تحصیل" autofocus />
        </div>
        <div class="field">
          <label class="field__label">${ICON_COLOR}رنگ</label>
          <input class="field__input" type="color" id="list-color" value="#1ed760" style="height:48px;padding:4px;cursor:pointer;" />
        </div>
        <button class="btn btn--primary btn--block" id="list-save">افزودن لیست</button>
      </div>`;
    this.overlay.classList.add("active");
    this.overlay.querySelector("#sheet-close").addEventListener("click", () => this.close());
    this.overlay.querySelector("#list-save").addEventListener("click", () => {
      const name = this.overlay.querySelector("#list-name").value.trim();
      const color = this.overlay.querySelector("#list-color").value;
      if (!name) return;
      taskController.createList(name, color);
      this.close();
    });
  }

  _esc(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }
}
