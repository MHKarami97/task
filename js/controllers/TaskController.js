import { taskRepository } from "../repositories/TaskRepository.js";
import { listRepository } from "../repositories/ListRepository.js";
import { Task } from "../models/Task.js";
import { TaskList } from "../models/TaskList.js";
import { TaskSorter } from "../services/SortStrategy.js";
import { notificationService } from "../services/NotificationService.js";
import { eventBus, EVENTS } from "../services/EventBus.js";

/**
 * TaskController — Facade pattern. Coordinates repositories, services and
 * domain models, exposing a single simplified API surface to views.
 */
export class TaskController {
  constructor() {
    this.taskRepository = taskRepository;
    this.listRepository = listRepository;
    this.sorter = new TaskSorter("byDueDate");
    notificationService.rescheduleAll(this.taskRepository.getAll());
  }

  // ---- Task operations ----
  createTask(payload) {
    const task = new Task(payload);
    this.taskRepository.add(task);
    notificationService.scheduleReminder(task);
    eventBus.emit(EVENTS.TASKS_CHANGED);
    return task;
  }

  updateTask(id, changes) {
    const task = this.taskRepository.getById(id);
    if (!task) throw new Error("Task not found");
    Object.assign(task, changes);
    this.taskRepository.update(task);
    notificationService.scheduleReminder(task);
    eventBus.emit(EVENTS.TASKS_CHANGED);
    return task;
  }

  toggleComplete(id) {
    const task = this.taskRepository.getById(id);
    if (!task) return;
    task.toggle();
    if (task.completed && task.repeat !== "none") {
      this._spawnNextRecurrence(task);
    }
    this.taskRepository.update(task);
    notificationService.cancelReminder(id);
    eventBus.emit(EVENTS.TASKS_CHANGED);
  }

  toggleStar(id) {
    const task = this.taskRepository.getById(id);
    if (!task) return;
    task.toggleStar();
    this.taskRepository.update(task);
    eventBus.emit(EVENTS.TASKS_CHANGED);
  }

  deleteTask(id) {
    this.taskRepository.remove(id);
    notificationService.cancelReminder(id);
    eventBus.emit(EVENTS.TASKS_CHANGED);
  }

  clearCompleted(listId = null) {
    this.taskRepository.removeCompleted(listId);
    eventBus.emit(EVENTS.TASKS_CHANGED);
  }

  _spawnNextRecurrence(task) {
    const next = new Task({
      ...task.toJSON(),
      id: undefined,
      completed: false,
      completedAtISO: null,
      createdAtISO: new Date().toISOString(),
      dueDateISO: this._nextDueDate(task),
    });
    this.taskRepository.add(next);
    notificationService.scheduleReminder(next);
  }

  _nextDueDate(task) {
    if (!task.dueDateISO) return null;
    const d = new Date(task.dueDateISO);
    if (task.repeat === "daily") d.setDate(d.getDate() + 1);
    if (task.repeat === "weekly") d.setDate(d.getDate() + 7);
    if (task.repeat === "monthly") d.setMonth(d.getMonth() + 1);
    return d.toISOString();
  }

  getTasksForList(listId) {
    return this.sorter.sort(this.taskRepository.getByListId(listId));
  }

  getAllTasks() {
    return this.sorter.sort(this.taskRepository.getAll());
  }

  getTasksByDate(isoDate) {
    return this.taskRepository.getAll().filter((t) => {
      if (!t.dueDateISO) return false;
      return t.dueDateISO.slice(0, 10) === isoDate.slice(0, 10);
    });
  }

  getTodayTasks() {
    const today = new Date().toISOString().slice(0, 10);
    return this.getTasksByDate(today);
  }

  getStarredTasks() {
    return this.taskRepository.getAll().filter((t) => t.starred && !t.completed);
  }

  getUpcomingTasks() {
    const now = new Date();
    return this.sorter.sort(
      this.taskRepository.getAll().filter((t) => !t.completed && t.dueDateISO && new Date(t.dueDateISO) >= now)
    );
  }

  setSortStrategy(key) {
    this.sorter.setStrategy(key);
    eventBus.emit(EVENTS.TASKS_CHANGED);
  }

  // ---- List operations ----
  getAllLists() {
    return this.listRepository.getAll();
  }

  createList(name, color) {
    const list = new TaskList({ name, color });
    this.listRepository.add(list);
    eventBus.emit(EVENTS.LISTS_CHANGED);
    return list;
  }

  deleteList(id) {
    if (id === "default") throw new Error("لیست پیش‌فرض قابل حذف نیست");
    this.taskRepository._load().filter((t) => t.listId === id).forEach((t) => this.taskRepository.remove(t.id));
    this.listRepository.remove(id);
    eventBus.emit(EVENTS.LISTS_CHANGED);
    eventBus.emit(EVENTS.TASKS_CHANGED);
  }

  // ---- Stats for About/Home ----
  getStats() {
    const all = this.taskRepository.getAll();
    return {
      total: all.length,
      completed: all.filter((t) => t.completed).length,
      pending: all.filter((t) => !t.completed).length,
      overdue: all.filter((t) => t.isOverdue()).length,
    };
  }
}

export const taskController = new TaskController();
