/**
 * Smart three-way merger for tasks and lists in persian-task-app.
 */
export function mergeTaskData(localData, remoteData) {
  var localLists = Array.isArray(localData?.lists) ? localData.lists : [];
  var remoteLists = Array.isArray(remoteData?.lists) ? remoteData.lists : [];

  // 1. ادغام لیست‌ها
  var listMap = new Map();

  localLists.forEach((l) => {
    if (l && l.id) listMap.set(l.id, JSON.parse(JSON.stringify(l)));
  });

  remoteLists.forEach((remoteL) => {
    if (!remoteL || !remoteL.id) return;
    if (!listMap.has(remoteL.id)) {
      listMap.set(remoteL.id, JSON.parse(JSON.stringify(remoteL)));
      return;
    }

    var localL = listMap.get(remoteL.id);
    listMap.set(remoteL.id, {
      ...localL,
      name: remoteL.name || localL.name,
      color: remoteL.color || localL.color,
      icon: remoteL.icon || localL.icon,
      isDefault: Boolean(localL.isDefault || remoteL.isDefault)
    });
  });

  // اطمینان از وجود لیست پیش‌فرض
  if (!listMap.has("default")) {
    listMap.set("default", {
      id: "default",
      name: "کارهای من",
      color: "#1ed760",
      icon: "list",
      isDefault: true
    });
  }

  // 2. ادغام وظایف (Tasks)
  var localTasks = Array.isArray(localData?.tasks) ? localData.tasks : [];
  var remoteTasks = Array.isArray(remoteData?.tasks) ? remoteData.tasks : [];
  var taskMap = new Map();

  localTasks.forEach((t) => {
    if (t && t.id) taskMap.set(t.id, JSON.parse(JSON.stringify(t)));
  });

  remoteTasks.forEach((remoteT) => {
    if (!remoteT || !remoteT.id) return;
    if (!taskMap.has(remoteT.id)) {
      taskMap.set(remoteT.id, JSON.parse(JSON.stringify(remoteT)));
      return;
    }

    var localT = taskMap.get(remoteT.id);

    // ادغام زیرکارها (Subtasks)
    var subtaskMap = new Map();
    (localT.subtasks || []).forEach((st) => {
      if (st && st.id) subtaskMap.set(st.id, { ...st });
    });
    (remoteT.subtasks || []).forEach((remoteSt) => {
      if (!remoteSt || !remoteSt.id) return;
      if (!subtaskMap.has(remoteSt.id)) {
        subtaskMap.set(remoteSt.id, { ...remoteSt });
      } else {
        var localSt = subtaskMap.get(remoteSt.id);
        subtaskMap.set(remoteSt.id, {
          ...localSt,
          title: remoteSt.title || localSt.title,
          completed: Boolean(localSt.completed || remoteSt.completed)
        });
      }
    });

    // مقایسه زمان اتمام یا ثبت برای اولویت‌بندی وضعیت انجام کار
    var localCompTime = localT.completedAtISO ? new Date(localT.completedAtISO).getTime() : 0;
    var remoteCompTime = remoteT.completedAtISO ? new Date(remoteT.completedAtISO).getTime() : 0;
    var isCompleted = localCompTime >= remoteCompTime ? localT.completed : remoteT.completed;
    var completedAt = localCompTime >= remoteCompTime ? localT.completedAtISO : remoteT.completedAtISO;

    taskMap.set(remoteT.id, {
      ...localT,
      title: remoteT.title || localT.title,
      notes: remoteT.notes !== undefined ? remoteT.notes : localT.notes,
      listId: listMap.has(remoteT.listId) ? remoteT.listId : localT.listId,
      dueDateISO: remoteT.dueDateISO || localT.dueDateISO,
      dueTime: remoteT.dueTime || localT.dueTime,
      priority: remoteT.priority || localT.priority,
      completed: isCompleted,
      completedAtISO: completedAt,
      repeat: remoteT.repeat || localT.repeat,
      starred: Boolean(localT.starred || remoteT.starred),
      reminderMinutesBefore: remoteT.reminderMinutesBefore !== undefined ? remoteT.reminderMinutesBefore : localT.reminderMinutesBefore,
      subtasks: Array.from(subtaskMap.values())
    });
  });

  return {
    lists: Array.from(listMap.values()),
    tasks: Array.from(taskMap.values())
  };
}
