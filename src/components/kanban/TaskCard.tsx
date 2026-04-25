import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { format, isPast, isToday } from "date-fns";
import { Calendar, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Task } from "@/lib/kanban-types";
import { cn } from "@/lib/utils";
import { PriorityPill } from "./PriorityPill";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Hash a string into one of N color buckets so labels keep a stable color.
const labelColors = [
  "text-rose-600 bg-rose-50 dark:bg-rose-950/40",
  "text-violet-600 bg-violet-50 dark:bg-violet-950/40",
  "text-amber-600 bg-amber-50 dark:bg-amber-950/40",
  "text-sky-600 bg-sky-50 dark:bg-sky-950/40",
  "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40",
  "text-pink-600 bg-pink-50 dark:bg-pink-950/40",
];

function colorForLabel(label: string) {
  let h = 0;
  for (let i = 0; i < label.length; i++) h = (h * 31 + label.charCodeAt(i)) >>> 0;
  return labelColors[h % labelColors.length];
}

interface Props {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export function TaskCard({ task, onEdit, onDelete }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const due = task.dueDate ? new Date(task.dueDate) : null;
  const overdue = due && isPast(due) && !isToday(due) && task.columnId !== "done";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group bg-card rounded-2xl border border-border p-4 shadow-card cursor-grab active:cursor-grabbing hover-lift",
        isDragging && "opacity-40 ring-2 ring-primary"
      )}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        {task.statusLabel ? (
          <span
            className={cn(
              "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium",
              colorForLabel(task.statusLabel)
            )}
          >
            {task.statusLabel}
          </span>
        ) : (
          <span />
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild onPointerDown={(e) => e.stopPropagation()}>
            <button
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-muted text-muted-foreground"
              aria-label="Card actions"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onPointerDown={(e) => e.stopPropagation()}>
            <DropdownMenuItem onClick={() => onEdit(task)}>
              <Pencil className="h-4 w-4 mr-2" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(task.id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() => onEdit(task)}
        className="text-left w-full"
      >
        <h4 className="font-semibold text-card-foreground leading-snug mb-1">
          {task.title}
        </h4>
        {task.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {task.description}
          </p>
        )}
      </button>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
        <div
          className={cn(
            "flex items-center gap-1.5 text-xs",
            overdue ? "text-priority-high font-medium" : "text-muted-foreground"
          )}
        >
          <Calendar className="h-3.5 w-3.5" />
          {due ? format(due, "d MMM yyyy") : "No date"}
        </div>
        <PriorityPill priority={task.priority} />
      </div>
    </div>
  );
}
