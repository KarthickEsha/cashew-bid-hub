import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LogOut, Users, Store, Package, ShoppingCart, BarChart3, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import NotificationPanel from "@/components/NotificationPanel";
import { ADMIN_TOKEN_KEY } from "./AdminProtectedRoute";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const AdminLayout = () => {
  const navigate = useNavigate();

  const signOut = () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    navigate("/admin", { replace: true });
  };

  // Temporary admin profile data. Replace with real data when available.
  const adminProfile = {
    name: "Admin User",
    email: "admin@example.com",
    phone: "+1 (555) 010-1234",
    id: "ADM-0001",
    photoUrl: "https://api.dicebear.com/8.x/initials/svg?seed=AD&backgroundType=gradientLinear"
  };

  return (
    <div className="min-h-screen flex flex-col md:grid md:grid-cols-[240px_1fr]">
      {/* Mobile Navigation */}
      <div className="md:hidden border-b bg-muted/20 flex items-center justify-between px-4 h-14 sticky top-0 z-50 bg-background">
        <div className="font-semibold text-lg">Admin</div>
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="p-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" x2="21" y1="6" y2="6"/><line x1="3" x2="21" y1="12" y2="12"/><line x1="3" x2="21" y1="18" y2="18"/></svg>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SheetHeader className="px-4 pt-4 pb-2">
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className="px-2 pb-4 space-y-1">
                <NavLink to="/admin/dashboard" className={({ isActive }) => `block px-3 py-2 rounded-md ${isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}>
                  <div className="flex items-center gap-2"><BarChart3 className="h-4 w-4" /><span>Dashboard</span></div>
                </NavLink>
                <NavLink to="/admin/merchants" className={({ isActive }) => `block px-3 py-2 rounded-md ${isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}>
                  <div className="flex items-center gap-2"><Store className="h-4 w-4" /><span>Merchants</span></div>
                </NavLink>
                <NavLink to="/admin/buyers" className={({ isActive }) => `block px-3 py-2 rounded-md ${isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}>
                  <div className="flex items-center gap-2"><Users className="h-4 w-4" /><span>Buyers</span></div>
                </NavLink>
                <NavLink to="/admin/products" className={({ isActive }) => `block px-3 py-2 rounded-md ${isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}>
                  <div className="flex items-center gap-2"><Package className="h-4 w-4" /><span>Products</span></div>
                </NavLink>
                <NavLink to="/admin/orders" className={({ isActive }) => `block px-3 py-2 rounded-md ${isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}>
                  <div className="flex items-center gap-2"><ShoppingCart className="h-4 w-4" /><span>Requirements</span></div>
                </NavLink>
                <NavLink to="/admin/subscribers" className={({ isActive }) => `block px-3 py-2 rounded-md ${isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}>
                  <div className="flex items-center gap-2"><Mail className="h-4 w-4" /><span>Subscribers</span></div>
                </NavLink>
              </nav>
              <div className="px-2 pb-4">
                <Button
                  className="w-full bg-transparent hover:bg-orange-100 text-red-600"
                  onClick={() => {
                    signOut()
                    localStorage.clear();
                    sessionStorage.clear();
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" /> Sign out
                </Button>
              </div>
            </SheetContent>
          </Sheet>
          <Sheet>
            <SheetTrigger asChild>
              <button aria-label="Admin profile" className="inline-flex items-center justify-center rounded-full h-8 w-8 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={adminProfile.photoUrl} alt={adminProfile.name} />
                  <AvatarFallback>AD</AvatarFallback>
                </Avatar>
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle>Admin</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={adminProfile.photoUrl} alt={adminProfile.name} />
                    <AvatarFallback>AD</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-base font-semibold">{adminProfile.name}</div>
                    <div className="text-muted-foreground">Signed in</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="col-span-1 text-muted-foreground">Email</span>
                  <span className="col-span-2 break-all font-medium">{adminProfile.email}</span>
                  <span className="col-span-1 text-muted-foreground">Phone</span>
                  <span className="col-span-2 font-medium">{adminProfile.phone}</span>
                  <span className="col-span-1 text-muted-foreground">ID</span>
                  <span className="col-span-2 font-medium">{adminProfile.id}</span>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex border-r bg-muted/20 flex-col">
        <div className="h-14 flex items-center px-4 font-semibold text-lg">Admin</div>
        <nav className="px-2 pb-4 space-y-1">
          <NavLink to="/admin/dashboard" className={({ isActive }) => `block px-3 py-2 rounded-md ${isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}>
            <div className="flex items-center gap-2"><BarChart3 className="h-4 w-4" /><span>Dashboard</span></div>
          </NavLink>
          <NavLink to="/admin/merchants" className={({ isActive }) => `block px-3 py-2 rounded-md ${isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}>
            <div className="flex items-center gap-2"><Store className="h-4 w-4" /><span>Merchants</span></div>
          </NavLink>
          <NavLink to="/admin/buyers" className={({ isActive }) => `block px-3 py-2 rounded-md ${isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}>
            <div className="flex items-center gap-2"><Users className="h-4 w-4" /><span>Buyers</span></div>
          </NavLink>
          <NavLink to="/admin/products" className={({ isActive }) => `block px-3 py-2 rounded-md ${isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}>
            <div className="flex items-center gap-2"><Package className="h-4 w-4" /><span>Products</span></div>
          </NavLink>
          <NavLink to="/admin/orders" className={({ isActive }) => `block px-3 py-2 rounded-md ${isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}>
            <div className="flex items-center gap-2"><ShoppingCart className="h-4 w-4" /><span>Requirements</span></div>
          </NavLink>
          <NavLink to="/admin/subscribers" className={({ isActive }) => `block px-3 py-2 rounded-md ${isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}>
            <div className="flex items-center gap-2"><Mail className="h-4 w-4" /><span>Subscribers</span></div>
          </NavLink>
        </nav>
        <div className="mt-auto px-2 pb-4">
          <Button
            className="w-full bg-transparent hover:bg-orange-100 text-red-600"
            onClick={() => {
              signOut()
              localStorage.clear();
              sessionStorage.clear();
            }}
          >
            <LogOut className="h-4 w-4 mr-2" /> Sign out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-col min-h-screen">
        <header className="hidden md:flex h-14 border-b items-center justify-between px-4 gap-2">
          <div className="font-semibold">Admin Panel</div>
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <button aria-label="Admin profile" className="inline-flex items-center justify-center rounded-full h-8 w-8 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={adminProfile.photoUrl} alt={adminProfile.name} />
                    <AvatarFallback>AD</AvatarFallback>
                  </Avatar>
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader>
                  <SheetTitle>Admin</SheetTitle>
                </SheetHeader>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={adminProfile.photoUrl} alt={adminProfile.name} />
                      <AvatarFallback>AD</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-base font-semibold">{adminProfile.name}</div>
                      <div className="text-muted-foreground">Signed in</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="col-span-1 text-muted-foreground">Email</span>
                    <span className="col-span-2 break-all font-medium">{adminProfile.email}</span>
                    <span className="col-span-1 text-muted-foreground">Phone</span>
                    <span className="col-span-2 font-medium">{adminProfile.phone}</span>
                    <span className="col-span-1 text-muted-foreground">ID</span>
                    <span className="col-span-2 font-medium">{adminProfile.id}</span>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </header>
        <main className="flex-1 p-2 sm:p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;