import {
  Dashboard,
  People,
  CalendarMonth,
  PersonAdd,
  Schedule,
  School,
} from "@mui/icons-material";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { useLocation } from "wouter";

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Dashboard,
    testId: "nav-dashboard",
  },
  {
    title: "Students",
    url: "/students",
    icon: People,
    testId: "nav-students",
  },
  {
    title: "Add Student",
    url: "/students/new",
    icon: PersonAdd,
    testId: "nav-add-student",
  },
  {
    title: "Attendance",
    url: "/attendance",
    icon: CalendarMonth,
    testId: "nav-attendance",
  },
  {
    title: "Leave Management",
    url: "/leaves",
    icon: Schedule,
    testId: "nav-leaves",
  },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <School sx={{ fontSize: 24 }} />
          </div>
          <div>
            <h2 className="text-lg font-semibold">School AMS</h2>
            <p className="text-xs text-muted-foreground">Attendance System</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={item.testId}
                  >
                    <a href={item.url}>
                      <item.icon sx={{ fontSize: 16 }} />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
