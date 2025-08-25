import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, MessageSquare, Users, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import RoleSwitcher from "@/components/RoleSwitcher";
import { useInventory } from "@/hooks/useInventory";
import { useProfile } from "@/hooks/useProfile";
import ProductTypeToggle from "@/components/ProductTypeToggle";
import { useState } from "react";
import { ProductType } from "@/types/user";

const MerchantDashboard = () => {
  const { getProductStats } = useInventory();
  const { profile } = useProfile();
  const stats = getProductStats();
  
  // State for product type toggle (only for "Both" users)
  const getInitialProductType = (): ProductType => {
    if (profile?.productType === 'Both') {
      return 'RCN';
    }
    return profile?.productType || 'RCN';
  };
  
  const [currentProductType, setCurrentProductType] = useState<ProductType>(getInitialProductType());
  
  // Calculate display stats based on current type
  const getDisplayStats = () => {
    if (profile?.productType === 'Both') {
      return currentProductType === 'RCN' 
        ? { products: stats.rcnProducts, stock: stats.totalStock.rcn }
        : { products: stats.kernelProducts, stock: stats.totalStock.kernel };
    }
    
    // For single type users, show their specific type
    if (profile?.productType === 'RCN') {
      return { products: stats.rcnProducts, stock: stats.totalStock.rcn };
    } else {
      return { products: stats.kernelProducts, stock: stats.totalStock.kernel };
    }
  };
  
  const displayStats = getDisplayStats();

  const mockStats = {
    totalEnquiries: 12,
    quotesSubmitted: 9,
    newCustomers: 8
  };

  const mockRecentActivity = [
    { id: 1, type: "order", message: "New order received for Premium Cashews W240", time: "2 hours ago" },
    { id: 2, type: "enquiry", message: "Customer enquiry about W320 grade pricing", time: "4 hours ago" },
    { id: 3, type: "product", message: "Low stock alert for W180 Cashews", time: "6 hours ago" },
    { id: 4, type: "order", message: "Order #ORD-123 marked as shipped", time: "1 day ago" },
  ];
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">Merchant Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage your cashew business and track performance
          </p>
        </div>
        <RoleSwitcher />
      </div>

      {/* Product Type Toggle */}
      <ProductTypeToggle 
        currentType={currentProductType}
        onTypeChange={setCurrentProductType}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1 - New Enquiry */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Enquiries</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalEnquiries}</div>
            <p className="text-xs text-muted-foreground">Requiring response</p>
          </CardContent>
        </Card>

        {/* Card 2 - Quote Submitted */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quote Submitted</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.quotesSubmitted}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        {/* Card 3 - My Product */}
        <Link to="/merchant/products">
          <Card className="cursor-pointer hover:shadow-md transition">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                My {currentProductType} Products
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{displayStats.products}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">{displayStats.stock}</span> total stock
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Card 4 - New Customer */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Customer</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.newCustomers}</div>
            <p className="text-xs text-muted-foreground">This month</p>
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