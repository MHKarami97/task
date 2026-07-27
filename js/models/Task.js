import { generateId } from "../utils/idGenerator.js";

/**
 * Task — domain entity representing a single actionable item.
 * Encapsulates its own state transitions (complete/incomplete) instead of
 * exposing raw setters, keeping business rules inside the model (DDD-lite).
 */
export class Task {
  constructor({
    id = generateId(),
    title,
    notes = "",
    listId = "default",
    dueDateISO = null,
    dueTime = null,
    priority = "medium", // "high" | "medium" | "low"
    completed = false,
    completedAtISO = null,
    createdAtISO = new Date().toISOString(),
    repeat = "none", // "none" | "daily" | "weekly" | "monthly"
    subtasks = [],
    reminderMinutesBefore = null,
    starred = false,
  }) {
    if (!title || !title.trim()) {
      throw new Error("Task title must not be empty");
    }
    this.id = id;
    this.title = title.trim();
    this.notes = notes;
    this.listId = listId;
    this.dueDateISO = dueDateISO;
    this.dueTime = dueTime;
    this.priority = priority;
    this.completed = completed;
    this.completedAtISO = completedAtISO;
    this.createdAtISO = createdAtISO;
    this.repeat = repeat;
    this.subtasks = subtasks;
    this.reminderMinutesBefore = reminderMinutesBefore;
    this.starred = starred;
  }

  markComplete() {
    this.completed = true;
    this.completedAtISO = new Date().toISOString();
  }

  markIncomplete() {
    this.completed = false;
    this.completedAtISO = null;
  }

  toggle() {
    this.completed ? this.markIncomplete() : this.markComplete();
  }

  toggleStar() {
    this.starred = !this.starred;
  }

  addSubtask(title) {
    this.subtasks.push({ id: generateId(), title, completed: false });
  }

  toggleSubtask(subtaskId) {
    const st = this.subtasks.find((s) => s.id === subtaskId);
    if (st) st.completed = !st.completed;
  }

  removeSubtask(subtaskId) {
    this.subtasks = this.subtasks.filter((s) => s.id !== subtaskId);
  }

  isOverdue() {
    if (!this.dueDateISO || this.completed) return false;
    const due = new Date(this.dueDateISO);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return due < now;
  }

  isDueToday() {
    if (!this.dueDateISO) return false;
    const due = new Date(this.dueDateISO);
    const now = new Date();
    return (
      due.getFullYear() === now.getFullYear() &&
      due.getMonth() === now.getMonth() &&
      due.getDate() === now.getDate()
    );
  }

  toJSON() {
    return { ...this };
  }

  static fromJSON(data) {
    return new Task(data);
  }
}
