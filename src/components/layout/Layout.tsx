import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { SignedIn, SignedOut, useClerk } from "@clerk/clerk-react";
import Login from "@/pages/Login";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, User, LogOut } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { signOut } = useClerk();
  return (
    <>
      <SignedOut>
        <Login />
      </SignedOut>
      <SignedIn>
        <SidebarProvider>
          <div className="min-h-screen flex w-full">
            <AppSidebar />
            <div className="flex-1 flex flex-col">
              <header className="h-12 flex items-center justify-between border-b bg-background px-4">
                {/* Left side */}
                <div className="flex items-center">
                  <SidebarTrigger />
                  <h1 className="ml-4 font-semibold">Cashew Marketplace</h1>
                </div>

                {/* Right side icons */}
                <div className="flex items-center space-x-4">
                  {/* Notifications */}
                  <Button variant="ghost" size="sm" className="relative p-2">
                    <Bell size={18} />
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 px-1 min-w-[16px] h-4 text-xs"
                    >
                      3
                    </Badge>
                  </Button>

                  {/* Profile */}
                  <Button variant="ghost" size="sm" className="p-2">
                    <User size={18} />
                  </Button>

                  {/* Logout */}
                  {/* <Button
                    variant="ghost"
                    size="sm"
                    className="p-2"
                    onClick={() => signOut()} // 👈 Logout action
                  >
                    <LogOut size={18} />
                  </Button> */}
                </div>
              </header>

              <main className="flex-1 overflow-auto pb-6">{children}</main>
            </div>
          </div>
        </SidebarProvider>
      </SignedIn>
    </>
  );
};

export default Layout;