import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import Login from "@/pages/Login";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
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
              <header className="h-12 flex items-center border-b bg-background px-4">
                <SidebarTrigger />
                <h1 className="ml-4 font-semibold">Cashew Marketplace</h1>
              </header>
              <main className="flex-1 overflow-auto pb-6">
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