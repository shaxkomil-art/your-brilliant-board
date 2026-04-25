import { Priority } from "@/lib/kanban-types";
import { cn } from "@/lib/utils";

const styles: Record<Priority, string> = {
  low: "bg-priority-low-bg text-priority-low",
  medium: "bg-priority-medium-bg text-priority-medium",
  high: "bg-priority-high-bg text-priority-high",
};

const labels: Record<Priority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export function PriorityPill({ priority, className }: { priority: Priority; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        styles[priority],
        className
      )}
    >
      {labels[priority]}
    </span>
  );
}
