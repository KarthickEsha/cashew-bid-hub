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
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-[240px_1fr]">
      <aside className="border-r bg-muted/20 flex flex-col">
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
            <div className="flex items-center gap-2"><ShoppingCart className="h-4 w-4" /><span>Requirments</span></div>
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
              // Clear all local storage data
              localStorage.clear();

              // Optionally clear sessionStorage too
              sessionStorage.clear();
            }}
          >
            <LogOut className="h-4 w-4 mr-2" /> Sign out
          </Button>
        </div>

      </aside>

      <div className="flex flex-col min-h-screen">
        <header className="h-14 border-b flex items-center justify-between px-4 gap-2">
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
        <main className="flex-1 p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;