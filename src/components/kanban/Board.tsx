import { useMemo, useRef, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { Download, RotateCcw, Save, Search, Upload } from "lucide-react";
import { toast } from "sonner";
import { COLUMNS, ColumnId, Task } from "@/lib/kanban-types";
import { useKanbanStore } from "@/hooks/useKanbanStore";
import { Column } from "./Column";
import { TaskCard } from "./TaskCard";
import { TaskDialog } from "./TaskDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface BoardProps {
  tasksRef: React.MutableRefObject<Task[]>;
}

export function Board({ tasksRef }: BoardProps) {
  const { state, addTask, updateTask, deleteTask, moveTask, replaceAll, reset } =
    useKanbanStore();
  // Expose latest tasks for the chat panel.
  tasksRef.current = state.tasks;

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultColumn, setDefaultColumn] = useState<ColumnId>("todo");
  const [activeId, setActiveId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return state.tasks;
    return state.tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.statusLabel?.toLowerCase().includes(q)
    );
  }, [state.tasks, search]);

  const tasksByColumn = useMemo(() => {
    const map: Record<ColumnId, Task[]> = { todo: [], "in-progress": [], done: [] };
    filtered.forEach((t) => map[t.columnId].push(t));
    return map;
  }, [filtered]);

  const activeTask = activeId ? state.tasks.find((t) => t.id === activeId) ?? null : null;

  const handleAdd = (columnId: ColumnId) => {
    setEditingTask(null);
    setDefaultColumn(columnId);
    setDialogOpen(true);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setDefaultColumn(task.columnId);
    setDialogOpen(true);
  };

  const handleSubmit = (data: Omit<Task, "id" | "createdAt">) => {
    if (editingTask) {
      updateTask(editingTask.id, data);
      toast.success("Task updated");
    } else {
      addTask(data);
      toast.success("Task added");
    }
  };

  const handleDragStart = (e: DragStartEvent) => setActiveId(String(e.active.id));

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;
    const activeTask = state.tasks.find((t) => t.id === active.id);
    if (!activeTask) return;

    const overId = String(over.id);
    // Dropped on a column droppable
    if (overId.startsWith("col-")) {
      const colId = overId.slice(4) as ColumnId;
      moveTask(activeTask.id, colId);
      return;
    }
    // Dropped on another task
    const overTask = state.tasks.find((t) => t.id === overId);
    if (overTask) {
      moveTask(activeTask.id, overTask.columnId, overTask.id);
    }
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kanban-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Board exported");
  };

  const importJson = async (file: File) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!Array.isArray(data?.tasks)) throw new Error("Invalid file");
      replaceAll(data.tasks);
      toast.success("Board imported");
    } catch {
      toast.error("Could not import file");
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 px-6 lg:px-8 py-5 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-3 min-w-0">
          <SidebarTrigger className="md:hidden" />
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight truncate">Kanban Board</h1>
            <p className="text-sm text-muted-foreground hidden sm:block">
              Plan, track, and ship your team&apos;s work.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks..."
              className="pl-9 w-64 rounded-full bg-muted/60 border-transparent focus-visible:bg-background"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              localStorage.setItem("kanban-board-v1", JSON.stringify(state));
              toast.success("Saved to this browser");
            }}
            className="rounded-full"
          >
            <Save className="h-4 w-4 mr-1.5" /> Save
          </Button>
          <Button variant="outline" size="icon" onClick={exportJson} className="rounded-full" aria-label="Export">
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => fileRef.current?.click()}
            className="rounded-full"
            aria-label="Import"
          >
            <Upload className="h-4 w-4" />
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) importJson(f);
              e.target.value = "";
            }}
          />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset board?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will replace your current tasks with the sample board. Export first if you
                  want to keep them.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    reset();
                    toast.success("Board reset");
                  }}
                >
                  Reset
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Mobile search */}
      <div className="md:hidden px-6 pt-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="pl-9 rounded-full bg-muted/60 border-transparent"
          />
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-auto scrollbar-thin px-6 lg:px-8 py-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-6 min-h-full">
            {COLUMNS.map((col) => (
              <Column
                key={col.id}
                id={col.id}
                title={col.title}
                accent={col.accent as "todo" | "progress" | "done"}
                tasks={tasksByColumn[col.id]}
                onAdd={handleAdd}
                onEdit={handleEdit}
                onDelete={(id) => {
                  deleteTask(id);
                  toast.success("Task deleted");
                }}
              />
            ))}
          </div>
          <DragOverlay>
            {activeTask ? (
              <div className="rotate-3 opacity-95">
                <TaskCard task={activeTask} onEdit={() => {}} onDelete={() => {}} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        task={editingTask}
        defaultColumn={defaultColumn}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
