import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { MerchantSidebar } from "./MerchantSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, User, ArrowRightLeft } from "lucide-react";
import { useRole } from "@/hooks/useRole";
import Login from "@/pages/Login";
import { SignedIn, SignedOut, useClerk, useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import NotificationPanel from "@/components/NotificationPanel"; 
import ProfilePanel from "@/components/ProfilePanel";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { signOut } = useClerk();
  const { role, setRole } = useRole();
  const navigate = useNavigate();
  const { user } = useUser(); // ✅ Get logged-in user info

  // Get display name (prefer firstName, else fall back to email)
  const displayName = user?.firstName || user?.primaryEmailAddress?.emailAddress || "User";
    const handleSwitch = () => {
    const newRole = role === "buyer" ? "processor" : "buyer";
    setRole(newRole);
    navigate(""); // redirect to dashboard after switching
  };

  return (
    <>
      <SignedOut>
        <Login />
      </SignedOut>

      <SignedIn>
        <SidebarProvider>
          <div
            className={`min-h-screen flex w-full ${role === "processor" ? "merchant-theme" : ""}`}
          >
            {role === "processor" ? <MerchantSidebar /> : <AppSidebar />}

            <div className="flex-1 flex flex-col">
              {/* Fixed Header */}
              <header className="h-12 flex items-center justify-between border-b bg-background px-4 sticky top-0 z-50">
                {/* Left side */}
                <div className="flex items-center">
                  <SidebarTrigger />
                  <h1 className="ml-4 font-semibold">
                    {`Hi, ${displayName}`}
                  </h1>
                </div>

                {/* Right side icons */}
                <div className="flex items-center space-x-4">
                  {/* Role Switcher */}
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary" className="px-3 py-1 hidden sm:inline-flex">
                      {role === "buyer" ? "Buyer Mode" : "Merchant Mode"}
                    </Badge>
                    <Button
                      onClick={handleSwitch}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <ArrowRightLeft className="h-4 w-4" />
                      Switch to {role === "buyer" ? "Merchant" : "Buyer"}
                    </Button>
                  </div>

                  {/* Notifications */}
                  <NotificationPanel>
                    <Button variant="ghost" size="sm" className="relative p-2">
                      <Bell size={18} />
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 px-1 min-w-[16px] h-4 text-xs"
                      >
                        3
                      </Badge>
                    </Button>
                  </NotificationPanel>

                  {/* Profile */}
                  <ProfilePanel>
                    <Button variant="ghost" size="sm" className="p-2">
                      <User size={18} />
                    </Button>
                  </ProfilePanel>
                </div>
              </header>

              {/* Scrollable Content */}
              <main className="flex-1 overflow-y-auto pb-6 px-4">
                {children}
              </main>
            </div>
          </div>
        </SidebarProvider>
      </SignedIn>

    </>
  );
};

export default Layout;
