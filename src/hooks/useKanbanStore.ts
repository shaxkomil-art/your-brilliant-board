import { useCallback, useEffect, useState } from "react";
import { ColumnId, KanbanState, Task } from "@/lib/kanban-types";
import { seedTasks } from "@/lib/seed";

const STORAGE_KEY = "kanban-board-v1";

const newId = () => Math.random().toString(36).slice(2, 10);

function loadInitial(): KanbanState {
  if (typeof window === "undefined") return { tasks: seedTasks };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { tasks: seedTasks };
    const parsed = JSON.parse(raw) as KanbanState;
    if (!parsed?.tasks) return { tasks: seedTasks };
    return parsed;
  } catch {
    return { tasks: seedTasks };
  }
}

export function useKanbanStore() {
  const [state, setState] = useState<KanbanState>(() => loadInitial());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [state]);

  const addTask = useCallback((task: Omit<Task, "id" | "createdAt">) => {
    setState((s) => ({
      tasks: [
        ...s.tasks,
        { ...task, id: newId(), createdAt: new Date().toISOString() },
      ],
    }));
  }, []);

  const updateTask = useCallback((id: string, patch: Partial<Task>) => {
    setState((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    }));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setState((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }));
  }, []);

  const moveTask = useCallback(
    (id: string, columnId: ColumnId, beforeTaskId?: string) => {
      setState((s) => {
        const task = s.tasks.find((t) => t.id === id);
        if (!task) return s;
        const remaining = s.tasks.filter((t) => t.id !== id);
        const updated: Task = { ...task, columnId };
        if (!beforeTaskId) {
          return { tasks: [...remaining, updated] };
        }
        const idx = remaining.findIndex((t) => t.id === beforeTaskId);
        if (idx === -1) return { tasks: [...remaining, updated] };
        const next = [...remaining];
        next.splice(idx, 0, updated);
        return { tasks: next };
      });
    },
    []
  );

  const replaceAll = useCallback((tasks: Task[]) => {
    setState({ tasks });
  }, []);

  const reset = useCallback(() => {
    setState({ tasks: seedTasks });
  }, []);

  return { state, addTask, updateTask, deleteTask, moveTask, replaceAll, reset };
}
