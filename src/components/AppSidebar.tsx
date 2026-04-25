import { Home, Kanban, Settings, Sparkles, Users } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const items = [
  { title: "Home", icon: Home, active: false },
  { title: "Tasks", icon: Kanban, active: true },
  { title: "Members", icon: Users, active: false },
  { title: "Settings", icon: Settings, active: false },
];

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon" className="border-0">
      <div className="bg-sidebar-gradient h-full flex flex-col text-sidebar-foreground">
        <SidebarHeader className="px-4 pt-6 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-white/95 flex items-center justify-center text-sidebar-primary-foreground font-bold shadow-elegant shrink-0">
              K
            </div>
            <span className="font-semibold text-lg tracking-tight group-data-[collapsible=icon]:hidden">
              Kanboard
            </span>
          </div>
        </SidebarHeader>

        <SidebarContent className="px-2">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      isActive={item.active}
                      className="text-white/85 hover:bg-white/10 hover:text-white data-[active=true]:bg-white/20 data-[active=true]:text-white data-[active=true]:font-semibold rounded-xl h-10"
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-3">
          <div className="rounded-2xl bg-white/10 backdrop-blur p-4 group-data-[collapsible=icon]:hidden">
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-semibold">AI assistant</span>
            </div>
            <p className="text-xs text-white/70 leading-relaxed">
              Click the chat button to ask about your tasks.
            </p>
          </div>
        </SidebarFooter>
      </div>
    </Sidebar>
  );
}
