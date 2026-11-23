import { taskController } from "../controllers/TaskController.js";
import { eventBus, EVENTS } from "../services/EventBus.js";
import PersianDate from "../utils/PersianDate.js";

const { JalaliDate } = PersianDate;

const ICON_CHECK =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
const ICON_STAR_FILLED =
  '<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
const ICON_STAR_OUTLINE =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
const ICON_EMPTY =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="3"/><path d="m9 12 2 2 4-4"/></svg>';
const ICON_CALENDAR =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="3"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';
const ICON_SUBTASK =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>';

/**
 * TasksView — renders the primary Google-Tasks-like list UI.
 * Subscribes to EventBus so it re-renders reactively on state changes
 * (Observer pattern), without controllers knowing about the DOM.
 */
export class TasksView {
  constructor(rootEl, sheetController) {
    this.root = rootEl;
    this.sheet = sheetController;
    this.currentListId = "all";
    this.currentFilter = "active"; // active | all | completed
    eventBus.on(EVENTS.TASKS_CHANGED, () => this.render());
    eventBus.on(EVENTS.LISTS_CHANGED, () => this.render());
  }

  setList(listId) {
    this.currentListId = listId;
    this.render();
  }

  _getTasks() {
    let tasks =
      this.currentListId === "all"
        ? taskController.getAllTasks()
        : taskController.getTasksForList(this.currentListId);

    if (this.currentFilter === "active") tasks = tasks.filter((t) => !t.completed);
    if (this.currentFilter === "completed") tasks = tasks.filter((t) => t.completed);
    return tasks;
  }

  _renderChips() {
    const lists = taskController.getAllLists();
    const chips = [
      { id: "all", name: "همه", color: "#b3b3b3" },
      ...lists.map((l) => ({ id: l.id, name: l.name, color: l.color })),
    ];
    return `
      <div class="chip-row" id="list-chips">
        ${chips
          .map(
            (c) => `
          <button class="chip ${c.id === this.currentListId ? "active" : ""}" data-list-id="${c.id}">
            <span class="chip__dot" style="background:${c.color}"></span>${c.name}
          </button>`
          )
          .join("")}
        <button class="chip" id="add-list-chip">+ لیست جدید</button>
      </div>`;
  }

  _renderFilterRow() {
    const filters = [
      { id: "active", name: "فعال" },
      { id: "all", name: "همه" },
      { id: "completed", name: "انجام‌شده" },
    ];
    return `
      <div class="chip-row" id="filter-chips">
        ${filters
          .map(
            (f) =>
              `<button class="chip ${f.id === this.currentFilter ? "active" : ""}" data-filter-id="${f.id}">${f.name}</button>`
          )
          .join("")}
      </div>`;
  }

  _formatDue(task) {
    if (!task.dueDateISO) return "";
    const j = JalaliDate.fromISO(task.dueDateISO);
    const overdue = task.isOverdue();
    const timeStr = task.dueTime ? ` ${task.dueTime}` : "";
    return `<span class="task-item__due ${overdue ? "overdue" : ""}">${ICON_CALENDAR}<span>${j.format("MM/DD")}${timeStr}</span></span>`;
  }

  _taskItemHTML(task) {
    const starIcon = task.starred ? ICON_STAR_FILLED : ICON_STAR_OUTLINE;
    const starClass = task.starred ? "starred" : "";
    const subtaskBadge = task.subtasks.length
      ? `<span class="task-item__subtasks">${ICON_SUBTASK}<span>${task.subtasks.filter((s) => s.completed).length}/${task.subtasks.length}</span></span>`
      : "";

    return `
      <li class="task-item ${task.completed ? "completed" : ""}" data-task-id="${task.id}">
        <button class="task-item__checkbox" data-action="toggle" aria-label="تغییر وضعیت">${ICON_CHECK}</button>
        <div class="task-item__body" data-action="open">
          <p class="task-item__title">${this._escape(task.title)}</p>
          <div class="task-item__meta">
            <span class="priority-dot priority-dot--${task.priority}" title="اولویت"></span>
            ${this._formatDue(task)}
            ${subtaskBadge}
          </div>
        </div>
        <button class="btn--star ${starClass}" data-action="star" aria-label="نشان کردن">${starIcon}</button>
      </li>`;
  }

  _escape(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  render() {
    const tasks = this._getTasks();
    const grouped = this._groupByDate(tasks);

    this.root.innerHTML = `
      <div class="quick-add">
        <span class="quick-add__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </span>
        <input type="text" id="quick-add-input" placeholder="افزودن کار جدید..." />
        <button class="quick-add__submit" id="quick-add-btn" aria-label="افزودن کار">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        </button>
      </div>
      ${this._renderChips()}
      ${this._renderFilterRow()}
      <div id="task-groups">
        ${
          tasks.length === 0
            ? `<div class="empty-state">${ICON_EMPTY}<p>کاری برای نمایش نیست</p></div>`
            : Object.entries(grouped)
                .map(
                  ([label, group]) => `
              <div class="task-section">
                <div class="task-section__header"><span class="task-section__title">${label}</span></div>
                <ul>${group.map((t) => this._taskItemHTML(t)).join("")}</ul>
              </div>`
                )
                .join("")
        }
      </div>`;

    this._bindEvents();
  }

  _groupByDate(tasks) {
    const groups = { "بدون تاریخ": [], "دیروز و قبل‌تر (عقب‌افتاده)": [], امروز: [], فردا: [], "این هفته": [], بعداً: [] };
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
    const weekEnd = new Date(today); weekEnd.setDate(today.getDate() + 7);

    tasks.forEach((t) => {
      if (!t.dueDateISO) return groups["بدون تاریخ"].push(t);
      const due = new Date(t.dueDateISO); due.setHours(0, 0, 0, 0);
      if (due < today) groups["دیروز و قبل‌تر (عقب‌افتاده)"].push(t);
      else if (due.getTime() === today.getTime()) groups["امروز"].push(t);
      else if (due.getTime() === tomorrow.getTime()) groups["فردا"].push(t);
      else if (due < weekEnd) groups["این هفته"].push(t);
      else groups["بعداً"].push(t);
    });

    return Object.fromEntries(Object.entries(groups).filter(([, v]) => v.length > 0));
  }

  _bindEvents() {
    const quickInput = this.root.querySelector("#quick-add-input");
    quickInput?.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && quickInput.value.trim()) {
        taskController.createTask({
          title: quickInput.value.trim(),
          listId: this.currentListId === "all" ? "default" : this.currentListId,
        });
        quickInput.value = "";
      }
    });
    this.root.querySelector("#quick-add-btn")?.addEventListener("click", () => {
      if (quickInput.value.trim()) {
        taskController.createTask({
          title: quickInput.value.trim(),
          listId: this.currentListId === "all" ? "default" : this.currentListId,
        });
        quickInput.value = "";
      } else {
        this.sheet.openTaskForm(null, this.currentListId);
      }
    });

    this.root.querySelectorAll("[data-list-id]").forEach((el) =>
      el.addEventListener("click", () => this.setList(el.dataset.listId))
    );
    this.root.querySelectorAll("[data-filter-id]").forEach((el) =>
      el.addEventListener("click", () => {
        this.currentFilter = el.dataset.filterId;
        this.render();
      })
    );
    this.root.querySelector("#add-list-chip")?.addEventListener("click", () => this.sheet.openListForm());

    this.root.querySelectorAll(".task-item").forEach((item) => {
      const id = item.dataset.taskId;
      item.querySelector('[data-action="toggle"]').addEventListener("click", (e) => {
        e.stopPropagation();
        taskController.toggleComplete(id);
      });
      item.querySelector('[data-action="star"]').addEventListener("click", (e) => {
        e.stopPropagation();
        taskController.toggleStar(id);
      });
      item.querySelector('[data-action="open"]').addEventListener("click", () => this.sheet.openTaskForm(id));
    });
  }
}
