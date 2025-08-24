import { NavLink, useLocation } from "react-router-dom";
import { LogOut } from "lucide-react";
import {
  Home,
  Store,
  FileText,
  MessageSquare,
  Plus,
  Bell,
  User,
  Mail
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

const mainNavItems = [
  { path: "/", label: "Dashboard", icon: Home },
  { path: "/marketplace", label: "Marketplace", icon: Store },
  { path: "/post-requirement", label: "Post Requirement", icon: Plus },
];

const myActivityItems = [
  { path: "/my-requests", label: "My Requests", icon: MessageSquare },
  { path: "/my-requirements", label: "My Requirements", icon: FileText },
  { path: "/responses", label: "Responses", icon: Mail },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary/10 text-primary font-medium" : "hover:bg-accent/50";

  const collapsed = state === "collapsed";
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <Sidebar collapsible="icon" className={collapsed ? "w-16" : "w-64"}>
      <SidebarContent>
        {/* Logo */}
        <div className="p-[7.5px] border-b border-border">
          {!collapsed ? (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CM</span>
              </div>
              <span className="text-lg font-bold text-primary">Cashew Marketplace</span>
            </div>
          ) : (
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto">
              <span className="text-white font-bold text-sm">CM</span>
            </div>
          )}
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.path} end className={getNavCls}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span className="text-[15px]">{item.label}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* My Activity */}
        <SidebarGroup>
          <SidebarGroupLabel>My Activity</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {myActivityItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.path} className={getNavCls}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span className="text-[15px]">{item.label}</span>}
                      {item.path === "/responses" && !collapsed && (
                        <Badge variant="destructive" className="ml-auto px-1 min-w-[16px] h-4 text-xs">
                          7
                        </Badge>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Bottom Actions */}
        <div className="mt-auto p-4 space-y-2">
          <Button
            variant="ghost"
            size="sm"
            className={collapsed ? "w-8 h-8 p-0" : "w-full justify-start"}
            onClick={handleLogout}
          >
            <LogOut size={16} />
            {!collapsed && <span className="ml-2">Logout</span>}
          </Button>
        </div>

        {/* <div className="mt-auto p-4 space-y-2">
          <Button variant="ghost" size="sm" className={collapsed ? "w-8 h-8 p-0" : "w-full justify-start"}>
            <Bell size={16} />
            {!collapsed && (
              <>
                <span className="ml-2">Notifications</span>
                <Badge variant="destructive" className="ml-auto px-1 min-w-[16px] h-4 text-xs">
                  3
                </Badge>
              </>
            )}
          </Button>
          <Button variant="ghost" size="sm" className={collapsed ? "w-8 h-8 p-0" : "w-full justify-start"}>
            <User size={16} />
            {!collapsed && <span className="ml-2">Profile</span>}
          </Button>
            <Button
              variant="ghost"
              size="sm"
              className={collapsed ? "w-8 h-8 p-0" : "w-full justify-start"}
              onClick={() => signOut()}   // 👈 sign out here
            >
              <LogOut size={16} />
              {!collapsed && <span className="ml-2">Logout</span>}
            </Button>
        </div> */}
      </SidebarContent>
    </Sidebar>
  );
}