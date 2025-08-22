import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  Store, 
  FileText, 
  MessageSquare, 
  Plus,
  User,
  Bell
} from "lucide-react";

const Navigation = () => {
  const location = useLocation();
  
  const navItems = [
    { path: "/", label: "Dashboard", icon: Home },
    { path: "/marketplace", label: "Marketplace", icon: Store },
    { path: "/post-requirement", label: "Post Requirement", icon: Plus },
    { path: "/my-requests", label: "My Requests", icon: MessageSquare },
    { path: "/my-requirements", label: "My Requirements", icon: FileText },
  ];

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CM</span>
            </div>
            <span className="text-xl font-bold text-primary">Cashew Marketplace</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              
              return (
                <Link key={item.path} to={item.path}>
                  <Button 
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm">
              <Bell size={16} />
              <Badge variant="destructive" className="ml-1 px-1 min-w-[16px] h-4 text-xs">
                3
              </Badge>
            </Button>
            <Button variant="ghost" size="sm">
              <User size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-border">
        <div className="flex justify-around py-2">
          {navItems.slice(0, 5).map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link key={item.path} to={item.path} className="flex flex-col items-center p-2">
                <Icon size={20} className={isActive ? "text-primary" : "text-muted-foreground"} />
                <span className={`text-xs mt-1 ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                  {item.label.split(' ')[0]}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;