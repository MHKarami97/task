import { taskController } from "../controllers/TaskController.js";
import { eventBus, EVENTS } from "../services/EventBus.js";
import PersianDate from "../utils/PersianDate.js";

const { JalaliDate } = PersianDate;

/**
 * CalendarView — Jalali (Persian solar) month grid showing task indicators.
 * Selecting a day filters the task list below via callback injection.
 */
export class CalendarView {
  constructor(rootEl) {
    this.root = rootEl;
    this.viewDate = JalaliDate.today();
    this.selectedDate = JalaliDate.today();
    eventBus.on(EVENTS.TASKS_CHANGED, () => this.render());
  }

  _monthMatrix() {
    const { jy, jm } = this.viewDate;
    const monthLength = JalaliDate.monthLength(jy, jm);
    const firstDay = new JalaliDate(jy, jm, 1);
    const leadingBlanks = firstDay.weekdayIndex;
    const days = [];
    for (let i = 0; i < leadingBlanks; i += 1) days.push(null);
    for (let d = 1; d <= monthLength; d += 1) days.push(new JalaliDate(jy, jm, d));
    while (days.length % 7 !== 0) days.push(null);
    return days;
  }

  _tasksCountByDay(jDate) {
    if (!jDate) return 0;
    return taskController.getTasksByDate(jDate.toISODate()).length;
  }

  render() {
    const days = this._monthMatrix();
    const weekdayShort = JalaliDate.weekdayShort();

    this.root.innerHTML = `
      <div class="card">
        <div class="calendar-header">
          <button class="btn--icon" id="cal-prev">‹</button>
          <span class="calendar-header__title">${this.viewDate.monthName} ${this.viewDate.jy}</span>
          <button class="btn--icon" id="cal-next">›</button>
        </div>
        <div class="calendar-grid">
          ${weekdayShort.map((w) => `<div class="calendar-grid__weekday">${w}</div>`).join("")}
          ${days
            .map((d) => {
              if (!d) return `<div class="calendar-day other-month"></div>`;
              const classes = ["calendar-day"];
              if (d.isToday()) classes.push("today");
              if (d.isSameDay(this.selectedDate)) classes.push("selected");
              const count = this._tasksCountByDay(d);
              return `<div class="${classes.join(" ")}" data-jy="${d.jy}" data-jm="${d.jm}" data-jd="${d.jd}">
                <span>${d.jd}</span>${count > 0 ? '<span class="calendar-day__dot"></span>' : ""}
              </div>`;
            })
            .join("")}
        </div>
      </div>
      <div class="task-section" style="margin-top:16px;">
        <div class="task-section__header"><span class="task-section__title">${this.selectedDate.formatLong()}</span></div>
        <ul id="calendar-task-list">
          ${this._renderDayTasks()}
        </ul>
      </div>`;

    this._bindEvents();
  }

  _renderDayTasks() {
    const tasks = taskController.getTasksByDate(this.selectedDate.toISODate());
    if (tasks.length === 0) {
      return `<div class="empty-state"><p>کاری برای این روز ثبت نشده است</p></div>`;
    }
    return tasks
      .map(
        (t) => `
      <li class="task-item ${t.completed ? "completed" : ""}" data-task-id="${t.id}">
        <button class="task-item__checkbox" data-action="toggle"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 13l4 4L19 7"/></svg></button>
        <div class="task-item__body">
          <p class="task-item__title">${t.title}</p>
          <div class="task-item__meta"><span class="priority-dot priority-dot--${t.priority}"></span>${t.dueTime || ""}</div>
        </div>
      </li>`
      )
      .join("");
  }

  _bindEvents() {
    this.root.querySelector("#cal-prev").addEventListener("click", () => {
      this.viewDate = this.viewDate.jm === 1 ? new JalaliDate(this.viewDate.jy - 1, 12, 1) : new JalaliDate(this.viewDate.jy, this.viewDate.jm - 1, 1);
      this.render();
    });
    this.root.querySelector("#cal-next").addEventListener("click", () => {
      this.viewDate = this.viewDate.jm === 12 ? new JalaliDate(this.viewDate.jy + 1, 1, 1) : new JalaliDate(this.viewDate.jy, this.viewDate.jm + 1, 1);
      this.render();
    });
    this.root.querySelectorAll(".calendar-day[data-jy]").forEach((el) => {
      el.addEventListener("click", () => {
        this.selectedDate = new JalaliDate(Number(el.dataset.jy), Number(el.dataset.jm), Number(el.dataset.jd));
        this.render();
      });
    });
    this.root.querySelectorAll('[data-action="toggle"]').forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = e.target.closest(".task-item").dataset.taskId;
        taskController.toggleComplete(id);
      });
    });
  }
}
