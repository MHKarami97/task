import { taskController } from "../controllers/TaskController.js";
import PersianDate from "../utils/PersianDate.js";

const { JalaliDate } = PersianDate;

const ICON_TITLE =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7V4h16v3M9 20h6M12 4v16"/></svg>';
const ICON_NOTES =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>';
const ICON_LIST =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>';
const ICON_DATE =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="3"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';
const ICON_TIME =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="12 6 12 12 16 14"/></svg>';
const ICON_PRIORITY =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="4 15 8 9 12 13 18 5 20 7 12 17 8 13 4 19"/></svg>';
const ICON_REPEAT =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>';
const ICON_BELL =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>';
const ICON_COLOR =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m9 12 2 2 4-4"/></svg>';
const ICON_CLOSE =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
const ICON_CHEVRON_RIGHT =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>';
const ICON_CHEVRON_LEFT =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>';

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
    const existing = taskId
      ? taskController.taskRepository.getById(taskId)
      : null;
    const lists = taskController.getAllLists();
    const dueJalali = existing?.dueDateISO
      ? JalaliDate.fromISO(existing.dueDateISO)
      : null;

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
    const currentReminder =
      existing?.reminderMinutesBefore != null
        ? String(existing.reminderMinutesBefore)
        : "";

    this.overlay.innerHTML = `
      <div class="bottom-sheet">
        <div class="bottom-sheet__handle"></div>
        <div class="bottom-sheet__header">
          <h3>${existing ? "ویرایش کار" : "کار جدید"}</h3>
          <button class="btn--icon" id="sheet-close" aria-label="بستن" title="بستن">${ICON_CLOSE}</button>
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
              </button>`,
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
                  `<button type="button" class="toggle-group__option ${r.key === currentRepeat ? "active" : ""}" data-repeat="${r.key}">${r.label}</button>`,
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
                  `<button type="button" class="toggle-group__option ${r.key === currentReminder ? "active" : ""}" data-reminder="${r.key}">${r.label}</button>`,
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

    this.overlay
      .querySelector("#sheet-close")
      .addEventListener("click", () => this.close());
    this.overlay
      .querySelector("#f-save")
      .addEventListener("click", () => this._saveTask(existing));
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
    setTimeout(
      () => document.addEventListener("click", closeOnOutsideClick),
      0,
    );
  }

  _renderDatePickerBody() {
    const { jy, jm } = this._pickerViewDate;
    const monthLength = JalaliDate.monthLength(jy, jm);
    const firstDay = new JalaliDate(jy, jm, 1);
    const leadingBlanks = firstDay.weekdayIndex;
    const days = [];
    for (let i = 0; i < leadingBlanks; i += 1) days.push(null);
    for (let d = 1; d <= monthLength; d += 1)
      days.push(new JalaliDate(jy, jm, d));
    while (days.length % 7 !== 0) days.push(null);
    const weekdayShort = JalaliDate.weekdayShort();

    return `
      <div class="date-picker-header">
        <button type="button" class="btn--icon" id="dp-prev" aria-label="ماه قبل">${ICON_CHEVRON_RIGHT}</button>
        <span>${this._pickerViewDate.monthName} ${jy}</span>
        <button type="button" class="btn--icon" id="dp-next" aria-label="ماه بعد">${ICON_CHEVRON_LEFT}</button>
      </div>
      <div class="date-picker-grid">
        ${weekdayShort.map((w) => `<div class="date-picker-grid__weekday">${w}</div>`).join("")}
        ${days
          .map((d) => {
            if (!d) return `<div class="date-picker-day is-empty"></div>`;
            const isSelected =
              this._pickerSelectedDate && d.isSameDay(this._pickerSelectedDate);
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
      this._pickerViewDate =
        jm === 1
          ? new JalaliDate(jy - 1, 12, 1)
          : new JalaliDate(jy, jm - 1, 1);
      popover.innerHTML = this._renderDatePickerBody();
      this._bindDatePickerBody(popover);
    });
    popover.querySelector("#dp-next").addEventListener("click", (e) => {
      e.stopPropagation();
      const { jy, jm } = this._pickerViewDate;
      this._pickerViewDate =
        jm === 12
          ? new JalaliDate(jy + 1, 1, 1)
          : new JalaliDate(jy, jm + 1, 1);
      popover.innerHTML = this._renderDatePickerBody();
      this._bindDatePickerBody(popover);
    });
    popover.querySelectorAll(".date-picker-day[data-jy]").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        const selected = new JalaliDate(
          Number(el.dataset.jy),
          Number(el.dataset.jm),
          Number(el.dataset.jd),
        );
        this._pickerSelectedDate = selected;
        this.overlay.querySelector("#f-date").value = selected.format();
        this.overlay.querySelector("#f-date-display").textContent =
          selected.formatLong();
        popover.remove();
      });
    });
    popover.querySelector("#dp-today").addEventListener("click", (e) => {
      e.stopPropagation();
      const today = JalaliDate.today();
      this._pickerSelectedDate = today;
      this.overlay.querySelector("#f-date").value = today.format();
      this.overlay.querySelector("#f-date-display").textContent =
        today.formatLong();
      popover.remove();
    });
    popover.querySelector("#dp-clear").addEventListener("click", (e) => {
      e.stopPropagation();
      this._pickerSelectedDate = null;
      this.overlay.querySelector("#f-date").value = "";
      this.overlay.querySelector("#f-date-display").textContent =
        "انتخاب تاریخ";
      popover.remove();
    });
  }

  _bindSegmented(groupId, hiddenInputId, datasetKey) {
    const group = this.overlay.querySelector(`#${groupId}`);
    const hiddenInput = this.overlay.querySelector(`#${hiddenInputId}`);
    if (!group || !hiddenInput) return;
    group.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => {
        group
          .querySelectorAll("button")
          .forEach((b) => b.classList.remove("active"));
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
        dueDateISO = new JalaliDate(
          parts[0],
          parts[1],
          parts[2],
        ).toISOStringSafe();
      }
    }

    const payload = {
      title,
      notes,
      listId,
      dueDateISO,
      dueTime,
      priority,
      repeat,
      reminderMinutesBefore,
    };

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
          <button class="btn--icon" id="sheet-close" aria-label="بستن" title="بستن">${ICON_CLOSE}</button>
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
    this.overlay
      .querySelector("#sheet-close")
      .addEventListener("click", () => this.close());
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
