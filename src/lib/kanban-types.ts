export type Priority = "low" | "medium" | "high";
export type ColumnId = "todo" | "in-progress" | "done";

export interface Task {
  id: string;
  title: string;
  description?: string;
  statusLabel?: string;
  priority: Priority;
  dueDate?: string; // ISO date string
  columnId: ColumnId;
  createdAt: string;
}

export interface KanbanState {
  tasks: Task[];
}

export const COLUMNS: { id: ColumnId; title: string; accent: string }[] = [
  { id: "todo", title: "To Do", accent: "todo" },
  { id: "in-progress", title: "In Progress", accent: "progress" },
  { id: "done", title: "Done", accent: "done" },
];
