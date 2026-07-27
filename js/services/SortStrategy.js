/**
 * SortStrategy — Strategy pattern for interchangeable task ordering rules.
 * New strategies can be added without modifying consuming controllers (OCP).
 */
export const SortStrategies = {
  byDueDate: (tasks) =>
    [...tasks].sort((a, b) => {
      if (!a.dueDateISO && !b.dueDateISO) return 0;
      if (!a.dueDateISO) return 1;
      if (!b.dueDateISO) return -1;
      return new Date(a.dueDateISO) - new Date(b.dueDateISO);
    }),

  byPriority: (tasks) => {
    const rank = { high: 0, medium: 1, low: 2 };
    return [...tasks].sort((a, b) => rank[a.priority] - rank[b.priority]);
  },

  byCreatedDate: (tasks) =>
    [...tasks].sort((a, b) => new Date(b.createdAtISO) - new Date(a.createdAtISO)),

  alphabetical: (tasks) => [...tasks].sort((a, b) => a.title.localeCompare(b.title, "fa")),
};

export class TaskSorter {
  constructor(strategyKey = "byDueDate") {
    this.setStrategy(strategyKey);
  }

  setStrategy(key) {
    if (!SortStrategies[key]) throw new Error(`Unknown sort strategy: ${key}`);
    this.strategyKey = key;
    this.strategy = SortStrategies[key];
  }

  sort(tasks) {
    return this.strategy(tasks);
  }
}
