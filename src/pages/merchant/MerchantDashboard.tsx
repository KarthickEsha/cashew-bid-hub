import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, MessageSquare, ShoppingCart, TrendingUp, DollarSign, Users, Mail, ToggleLeft, ToggleRight, ArrowRightLeft } from "lucide-react";
import { useRole } from "@/hooks/useRole";

const mockStats = {
  totalProducts: 24,
  activeProducts: 18,
  pendingOrders: 7,
  totalEnquiries: 12,
  monthlyRevenue: 45000,
  newCustomers: 8
};

const mockRecentActivity = [
  { id: 1, type: "order", message: "New order received for Premium Cashews W240", time: "2 hours ago" },
  { id: 2, type: "enquiry", message: "Customer enquiry about W320 grade pricing", time: "4 hours ago" },
  { id: 3, type: "product", message: "Low stock alert for W180 Cashews", time: "6 hours ago" },
  { id: 4, type: "order", message: "Order #ORD-123 marked as shipped", time: "1 day ago" },
];

const MerchantDashboard = () => {
  const { role, setRole } = useRole();

  return (
    <div className="p-6 space-y-6">
      {/* Role Switcher */}
      <div className="flex justify-end">
       <div className="flex justify-end">
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="px-3 py-1">
            {role === "buyer" ? "Buyer Mode" : "Merchant Mode"}
          </Badge>
          <Button
            onClick={() => setRole(role === 'buyer' ? 'processor' : 'buyer')}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowRightLeft className="h-4 w-4" />
            Switch to {role === "buyer" ? "Merchant" : "Buyer"}
          </Button>
        </div>
      </div>
      </div>
     
      <div>
        <h1 className="text-3xl font-bold text-primary">Merchant Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Manage your cashew business and track performance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">{mockStats.activeProducts}</span> active products
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.pendingOrders}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting processing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Enquiries</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalEnquiries}</div>
            <p className="text-xs text-muted-foreground">
              Requiring response
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${mockStats.monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.newCustomers}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+24%</div>
            <p className="text-xs text-muted-foreground">
              Quarter over quarter
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates on your business</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockRecentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.message}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {activity.type}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MerchantDashboard;