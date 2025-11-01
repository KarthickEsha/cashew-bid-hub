import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { MerchantSidebar } from "./MerchantSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, User, ArrowRightLeft, Globe } from "lucide-react";
import { useRole } from "@/hooks/useRole";
import Login from "@/pages/Login";
import { SignedIn, SignedOut, useClerk, useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import NotificationPanel from "@/components/NotificationPanel";
import ProfilePanel from "@/components/ProfilePanel";
import { useProfile } from "@/hooks/useProfile";
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useEffect, useState } from "react";
import { fetchNotifications } from "@/lib/api";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { t } = useTranslation();
  const { signOut } = useClerk();
  const { role, setRole } = useRole();
  const navigate = useNavigate();
  const { user } = useUser();
  const { profile } = useProfile();
  const [notifCount, setNotifCount] = useState<number>(0);

  // Get display name (prefer firstName, else fall back to email)
  const displayName = user?.firstName || user?.primaryEmailAddress?.emailAddress || t('common.user', 'User');

  // Type assertion for user metadata
  type UserMetadata = {
    roles?: string[];
  };

  const userMetadata = (user?.publicMetadata || {}) as UserMetadata;
  const userRoles = userMetadata.roles || [];

  // Check if user has both roles
  const hasBothRoles = profile.role === 'both';
  const currentRole = role === "both" ? "buyer" : role;

  // Sync UI role with profile role on load/login
  useEffect(() => {
    const pr = (profile?.role || '').toLowerCase();
    if (!pr) return;
    // If profile has both roles, default UI role to buyer; else mirror the profile
    const desired = pr === 'both' ? 'buyer' : (pr === 'processor' ? 'processor' : 'buyer');
    if (role !== desired) {
      setRole(desired as any);
    }
  }, [profile?.role]);

  // Load unread notifications count when role changes or on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetchNotifications();
        if (cancelled) return;
        const total = (res?.data || []).filter((n: any) => !n?.isView).length;
        setNotifCount(total);
      } catch {
        if (!cancelled) setNotifCount(0);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [role]);

  const handleSwitch = () => {
    // Toggle between buyer and processor when user has both roles
    const newRole = currentRole === "buyer" ? "processor" : "buyer";
    setRole(newRole as any);
    navigate("");
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
              <header className="h-14 md:h-12 flex items-center justify-between border-b bg-background px-2 sm:px-4 sticky top-0 z-50">
                {/* Left side */}
                <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                  <SidebarTrigger />
                  <h1 className="ml-1 sm:ml-4 font-semibold text-sm sm:text-base truncate">
                    <span className="hidden sm:inline">{t('header.greeting', { name: displayName })}</span>
                    <span className="sm:hidden">{displayName}</span>
                  </h1>
                </div>

                {/* Right side icons */}
                <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
                  {/* Role Switcher - Only show if user has both roles */}
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Badge variant="secondary" className="px-2 py-1 text-xs hidden lg:inline-flex">
                      {currentRole === "buyer" ? t('header.buyerMode') : t('header.merchantMode')}
                    </Badge>
                    {(hasBothRoles) && (
                      <Button
                        onClick={handleSwitch}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3"
                      >
                        <ArrowRightLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden md:inline">
                          {t('header.switchTo', { role: currentRole === "buyer" ? t('header.merchantMode') : t('header.buyerMode') })}
                        </span>
                        <span className="md:hidden">Switch</span>
                      </Button>
                    )}
                  </div>

                  {/* Language Switcher */}
                  <div className="hidden sm:block">
                    <LanguageSwitcher />
                  </div>
                  
                  {/* Notifications */}
                  <NotificationPanel onCountChange={setNotifCount}>
                    <Button variant="ghost" size="sm" className="relative p-1.5 sm:p-2">
                      <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                      <Badge
                        variant="destructive"
                        className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 px-1 min-w-[14px] h-3.5 sm:min-w-[16px] sm:h-4 text-[10px] sm:text-xs"
                      >
                        {notifCount}
                      </Badge>
                    </Button>
                  </NotificationPanel>

                  {/* Profile */}
                  <ProfilePanel>
                    <Button variant="ghost" size="sm" className="p-1.5 sm:p-2">
                      <User className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </ProfilePanel>
                </div>
              </header>

              {/* Scrollable Content */}
              <main className="flex-1 overflow-y-auto pb-4 sm:pb-6 px-2 sm:px-4 md:px-6">
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