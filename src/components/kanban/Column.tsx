import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { Plus } from "lucide-react";
import { ColumnId, Task } from "@/lib/kanban-types";
import { cn } from "@/lib/utils";
import { TaskCard } from "./TaskCard";
import { Button } from "@/components/ui/button";

interface Props {
  id: ColumnId;
  title: string;
  accent: "todo" | "progress" | "done";
  tasks: Task[];
  onAdd: (columnId: ColumnId) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const headerStyles = {
  todo: "bg-column-todo/10 text-column-todo",
  progress: "bg-column-progress/15 text-column-progress",
  done: "bg-column-done/15 text-column-done",
} as const;

const dotStyles = {
  todo: "bg-column-todo",
  progress: "bg-column-progress",
  done: "bg-column-done",
} as const;

const countBadge = {
  todo: "bg-column-todo text-white",
  progress: "bg-column-progress text-white",
  done: "bg-column-done text-white",
} as const;

export function Column({ id, title, accent, tasks, onAdd, onEdit, onDelete }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: `col-${id}` });

  return (
    <div className="flex flex-col w-[320px] shrink-0">
      <div
        className={cn(
          "flex items-center justify-between rounded-full px-4 py-2.5 mb-4",
          headerStyles[accent]
        )}
      >
        <div className="flex items-center gap-2.5">
          <span className={cn("h-2 w-2 rounded-full", dotStyles[accent])} />
          <span className="font-semibold text-sm">{title}</span>
          <span
            className={cn(
              "inline-flex items-center justify-center min-w-[22px] h-5 px-1.5 rounded-full text-[11px] font-bold",
              countBadge[accent]
            )}
          >
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => onAdd(id)}
          className="p-1 rounded-md hover:bg-background/50 transition-smooth"
          aria-label={`Add task to ${title}`}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 flex flex-col gap-3 p-2 -m-2 rounded-2xl transition-smooth min-h-[120px]",
          isOver && "bg-accent/60 ring-2 ring-primary/40"
        )}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </SortableContext>

        <Button
          variant="ghost"
          onClick={() => onAdd(id)}
          className="justify-start text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-xl"
        >
          <Plus className="h-4 w-4 mr-1.5" /> Add task
        </Button>
      </div>
    </div>
  );
}
