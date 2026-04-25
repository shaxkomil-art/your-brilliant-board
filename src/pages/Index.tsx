import { useRef, useState } from "react";
import { MessageSquare } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Board } from "@/components/kanban/Board";
import { ChatPanel } from "@/components/kanban/ChatPanel";
import { Task } from "@/lib/kanban-types";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [chatOpen, setChatOpen] = useState(false);
  const tasksRef = useRef<Task[]>([]);

  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 flex flex-col min-w-0 relative">
          <Board tasksRef={tasksRef} />

          {/* Floating AI chat button */}
          <Button
            onClick={() => setChatOpen(true)}
            size="lg"
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-elegant bg-sidebar-gradient hover:opacity-90 hover:scale-105 transition-smooth p-0 z-20"
            aria-label="Open AI assistant"
          >
            <MessageSquare className="h-6 w-6 text-white" />
          </Button>

          <ChatPanel open={chatOpen} onOpenChange={setChatOpen} tasksRef={tasksRef} />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
