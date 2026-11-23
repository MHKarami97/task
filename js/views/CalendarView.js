import { taskController } from "../controllers/TaskController.js";
import { eventBus, EVENTS } from "../services/EventBus.js";
import PersianDate from "../utils/PersianDate.js";

const { JalaliDate } = PersianDate;

const ICON_CHEVRON_RIGHT =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>';
const ICON_CHEVRON_LEFT =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>';
const ICON_CHECK =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
const ICON_EMPTY =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="3"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';

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
          <button class="btn--icon" id="cal-prev" aria-label="ماه قبل" title="ماه قبل">${ICON_CHEVRON_RIGHT}</button>
          <span class="calendar-header__title">${this.viewDate.monthName} ${this.viewDate.jy}</span>
          <button class="btn--icon" id="cal-next" aria-label="ماه بعد" title="ماه بعد">${ICON_CHEVRON_LEFT}</button>
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
      <div class="task-section" style="margin-top:20px;">
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
      return `<div class="empty-state">${ICON_EMPTY}<p>کاری برای این روز ثبت نشده است</p></div>`;
    }
    return tasks
      .map(
        (t) => `
      <li class="task-item ${t.completed ? "completed" : ""}" data-task-id="${t.id}">
        <button class="task-item__checkbox" data-action="toggle" aria-label="تغییر وضعیت">${ICON_CHECK}</button>
        <div class="task-item__body">
          <p class="task-item__title">${t.title}</p>
          <div class="task-item__meta">
            <span class="priority-dot priority-dot--${t.priority}"></span>
            ${t.dueTime ? `<span class="task-item__due">${t.dueTime}</span>` : ""}
          </div>
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
