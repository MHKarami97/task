import { taskController } from "../controllers/TaskController.js";
import PersianDate from "../utils/PersianDate.js";

const { JalaliDate } = PersianDate;

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
    const task = taskId ? taskController.getTasksForList("all")?.find : null;
    const existing = taskId ? taskController.taskRepository.getById(taskId) : null;
    const lists = taskController.getAllLists();
    const dueJalali = existing?.dueDateISO ? JalaliDate.fromISO(existing.dueDateISO) : JalaliDate.today();

    this.overlay.innerHTML = `
      <div class="bottom-sheet">
        <div class="bottom-sheet__handle"></div>
        <div class="bottom-sheet__header">
          <h3>${existing ? "ویرایش کار" : "کار جدید"}</h3>
          <button class="btn--icon" id="sheet-close">✕</button>
        </div>
        <div class="field">
          <label class="field__label">عنوان</label>
          <input class="field__input" id="f-title" value="${existing ? this._esc(existing.title) : ""}" placeholder="مثلاً: خرید نان" />
        </div>
        <div class="field">
          <label class="field__label">یادداشت</label>
          <textarea class="field__textarea" id="f-notes">${existing ? this._esc(existing.notes) : ""}</textarea>
        </div>
        <div class="field">
          <label class="field__label">لیست</label>
          <select class="field__select" id="f-list">
            ${lists.map((l) => `<option value="${l.id}" ${l.id === (existing?.listId || defaultListId) ? "selected" : ""}>${l.name}</option>`).join("")}
          </select>
        </div>
        <div class="field">
          <label class="field__label">تاریخ سررسید (شمسی: سال/ماه/روز)</label>
          <input class="field__input" id="f-date" value="${existing?.dueDateISO ? dueJalali.format() : ""}" placeholder="۱۴۰۵/۰۵/۰۵" />
        </div>
        <div class="field">
          <label class="field__label">ساعت</label>
          <input class="field__input" type="time" id="f-time" value="${existing?.dueTime || ""}" />
        </div>
        <div class="field">
          <label class="field__label">اولویت</label>
          <select class="field__select" id="f-priority">
            <option value="high" ${existing?.priority === "high" ? "selected" : ""}>بالا</option>
            <option value="medium" ${!existing || existing?.priority === "medium" ? "selected" : ""}>متوسط</option>
            <option value="low" ${existing?.priority === "low" ? "selected" : ""}>پایین</option>
          </select>
        </div>
        <div class="field">
          <label class="field__label">تکرار</label>
          <select class="field__select" id="f-repeat">
            <option value="none" ${!existing || existing?.repeat === "none" ? "selected" : ""}>بدون تکرار</option>
            <option value="daily" ${existing?.repeat === "daily" ? "selected" : ""}>روزانه</option>
            <option value="weekly" ${existing?.repeat === "weekly" ? "selected" : ""}>هفتگی</option>
            <option value="monthly" ${existing?.repeat === "monthly" ? "selected" : ""}>ماهانه</option>
          </select>
        </div>
        <div class="field">
          <label class="field__label">یادآوری (دقیقه قبل از سررسید)</label>
          <select class="field__select" id="f-reminder">
            <option value="">بدون یادآوری</option>
            <option value="10" ${existing?.reminderMinutesBefore === 10 ? "selected" : ""}>۱۰ دقیقه قبل</option>
            <option value="30" ${existing?.reminderMinutesBefore === 30 ? "selected" : ""}>۳۰ دقیقه قبل</option>
            <option value="60" ${existing?.reminderMinutesBefore === 60 ? "selected" : ""}>۱ ساعت قبل</option>
            <option value="1440" ${existing?.reminderMinutesBefore === 1440 ? "selected" : ""}>۱ روز قبل</option>
          </select>
        </div>
        <button class="btn btn--primary btn--block" id="f-save">${existing ? "ذخیره تغییرات" : "افزودن کار"}</button>
        ${existing ? '<button class="btn btn--danger btn--block" id="f-delete" style="margin-top:8px;">حذف کار</button>' : ""}
      </div>`;

    this.overlay.classList.add("active");
    this.overlay.querySelector("#sheet-close").addEventListener("click", () => this.close());
    this.overlay.querySelector("#f-save").addEventListener("click", () => this._saveTask(existing));
    this.overlay.querySelector("#f-delete")?.addEventListener("click", () => {
      taskController.deleteTask(existing.id);
      this.close();
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
          <label class="field__label">نام لیست</label>
          <input class="field__input" id="list-name" placeholder="مثلاً: کار، خانه، تحصیل" />
        </div>
        <div class="field">
          <label class="field__label">رنگ</label>
          <input class="field__input" type="color" id="list-color" value="#1ed760" style="height:44px;padding:4px;" />
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
