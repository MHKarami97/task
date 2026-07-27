import { generateId } from "../utils/idGenerator.js";

/** TaskList — a named grouping (e.g. "کار", "شخصی") with a color tag. */
export class TaskList {
  constructor({ id = generateId(), name, color = "#1ed760", icon = "list", isDefault = false }) {
    if (!name || !name.trim()) throw new Error("List name must not be empty");
    this.id = id;
    this.name = name.trim();
    this.color = color;
    this.icon = icon;
    this.isDefault = isDefault;
  }

  rename(newName) {
    if (!newName.trim()) throw new Error("List name must not be empty");
    this.name = newName.trim();
  }

  toJSON() {
    return { ...this };
  }

  static fromJSON(data) {
    return new TaskList(data);
  }
}
