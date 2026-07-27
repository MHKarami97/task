import { taskController } from "../controllers/TaskController.js";
import { eventBus, EVENTS } from "../services/EventBus.js";
import PersianDate from "../utils/PersianDate.js";

const { JalaliDate } = PersianDate;

const ICON_CHECK =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 13l4 4L19 7"/></svg>';
const ICON_STAR_FILLED =
  '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.27 5.82 21 7 14.14l-5-4.87 6.91-1.01z"/></svg>';
const ICON_EMPTY =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 11l3 3L22 4M2 12l3.09 6.26L2 22l6.91-1.86L12 22M2 12a10 10 0 1 0 10-10"/></svg>';

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

    if (this.currentFilter === "active")
      tasks = tasks.filter((t) => !t.completed);
    if (this.currentFilter === "completed")
      tasks = tasks.filter((t) => t.completed);
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
          </button>`,
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
              `<button class="chip ${f.id === this.currentFilter ? "active" : ""}" data-filter-id="${f.id}">${f.name}</button>`,
          )
          .join("")}
      </div>`;
  }

  _formatDue(task) {
    if (!task.dueDateISO) return "";
    const j = JalaliDate.fromISO(task.dueDateISO);
    const overdue = task.isOverdue();
    const timeStr = task.dueTime ? ` ${task.dueTime}` : "";
    return `<span class="task-item__due ${overdue ? "overdue" : ""}">${j.format("MM/DD")}${timeStr}</span>`;
  }

  _taskItemHTML(task) {
    return `
      <li class="task-item ${task.completed ? "completed" : ""}" data-task-id="${task.id}">
        <button class="task-item__checkbox" data-action="toggle">${ICON_CHECK}</button>
        <div class="task-item__body" data-action="open">
          <p class="task-item__title">${this._escape(task.title)}</p>
          <div class="task-item__meta">
            <span class="priority-dot priority-dot--${task.priority}"></span>
            ${this._formatDue(task)}
            ${task.subtasks.length ? `<span>${task.subtasks.filter((s) => s.completed).length}/${task.subtasks.length}</span>` : ""}
          </div>
        </div>
        <button class="btn--icon" data-action="star" style="color:${task.starred ? "var(--color-warning)" : "var(--text-secondary)"}">${ICON_STAR_FILLED}</button>
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
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
  </span>
  <input type="text" id="quick-add-input" placeholder="افزودن کار جدید..." />
  <button class="quick-add__submit" id="quick-add-btn" aria-label="افزودن کار">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>
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
              </div>`,
                )
                .join("")
        }
      </div>`;

    this._bindEvents();
  }

  _groupByDate(tasks) {
    const groups = {
      "بدون تاریخ": [],
      "دیروز و قبل‌تر (عقب‌افتاده)": [],
      امروز: [],
      فردا: [],
      "این هفته": [],
      بعداً: [],
    };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const weekEnd = new Date(today);
    weekEnd.setDate(today.getDate() + 7);

    tasks.forEach((t) => {
      if (!t.dueDateISO) return groups["بدون تاریخ"].push(t);
      const due = new Date(t.dueDateISO);
      due.setHours(0, 0, 0, 0);
      if (due < today) groups["دیروز و قبل‌تر (عقب‌افتاده)"].push(t);
      else if (due.getTime() === today.getTime()) groups["امروز"].push(t);
      else if (due.getTime() === tomorrow.getTime()) groups["فردا"].push(t);
      else if (due < weekEnd) groups["این هفته"].push(t);
      else groups["بعداً"].push(t);
    });

    return Object.fromEntries(
      Object.entries(groups).filter(([, v]) => v.length > 0),
    );
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

    this.root
      .querySelectorAll("[data-list-id]")
      .forEach((el) =>
        el.addEventListener("click", () => this.setList(el.dataset.listId)),
      );
    this.root.querySelectorAll("[data-filter-id]").forEach((el) =>
      el.addEventListener("click", () => {
        this.currentFilter = el.dataset.filterId;
        this.render();
      }),
    );
    this.root
      .querySelector("#add-list-chip")
      ?.addEventListener("click", () => this.sheet.openListForm());

    this.root.querySelectorAll(".task-item").forEach((item) => {
      const id = item.dataset.taskId;
      item
        .querySelector('[data-action="toggle"]')
        .addEventListener("click", (e) => {
          e.stopPropagation();
          taskController.toggleComplete(id);
        });
      item
        .querySelector('[data-action="star"]')
        .addEventListener("click", (e) => {
          e.stopPropagation();
          taskController.toggleStar(id);
        });
      item
        .querySelector('[data-action="open"]')
        .addEventListener("click", () => this.sheet.openTaskForm(id));
    });
  }
}
