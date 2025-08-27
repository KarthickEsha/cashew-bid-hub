import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Calendar,
  MapPin,
  DollarSign,
  Search,
  Eye,
  Truck,
  Package,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";

const MyOrders = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const orders = [
    {
      id: "ORD-001",
      productName: "Premium W320 Cashews",
      merchantName: "Golden Cashew Co.",
      quantity: "25 tons",
      unitPrice: "$8,200/ton",
      totalAmount: "$205,000",
      status: "confirmed",
      orderDate: "2024-08-20",
      deliveryDate: "2024-09-05",
      location: "Mumbai, India",
      trackingNumber: "TRK123456789"
    },
    {
      id: "ORD-002",
      productName: "Organic SW240 Cashews",
      merchantName: "Vietnam Nuts Ltd.",
      quantity: "15 tons",
      unitPrice: "$9,500/ton",
      totalAmount: "$142,500",
      status: "shipped",
      orderDate: "2024-08-18",
      shippedDate: "2024-08-22",
      deliveryDate: "2024-09-01",
      location: "Ho Chi Minh, Vietnam",
      trackingNumber: "TRK987654321"
    },
    {
      id: "ORD-003",
      productName: "W240 Cashews",
      merchantName: "African Cashew Co",
      quantity: "30 tons",
      unitPrice: "$7,800/ton",
      totalAmount: "$234,000",
      status: "delivered",
      orderDate: "2024-08-10",
      deliveredDate: "2024-08-25",
      location: "Accra, Ghana",
      trackingNumber: "TRK555666777"
    },
    {
      id: "ORD-004",
      productName: "Premium Cashews",
      merchantName: "Cashew Palace",
      quantity: "20 tons",
      unitPrice: "$8,000/ton",
      totalAmount: "$160,000",
      status: "processing",
      orderDate: "2024-08-22",
      expectedShipping: "2024-08-28",
      location: "Kerala, India"
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "processing":
        return <Clock size={16} className="text-yellow-500" />;
      case "confirmed":
        return <CheckCircle size={16} className="text-blue-500" />;
      case "shipped":
        return <Truck size={16} className="text-orange-500" />;
      case "delivered":
        return <Package size={16} className="text-green-500" />;
      default:
        return <AlertCircle size={16} className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-orange-100 text-orange-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = searchTerm
      ? order.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.merchantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    const matchesStatus = statusFilter !== "all" ? order.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">My Orders</h1>
        <p className="text-muted-foreground">
          Track your orders and delivery status
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Orders", value: orders.length.toString(), color: "text-blue-600" },
          { label: "Processing", value: orders.filter(o => o.status === "processing").length.toString(), color: "text-yellow-600" },
          { label: "Shipped", value: orders.filter(o => o.status === "shipped").length.toString(), color: "text-orange-600" },
          { label: "Delivered", value: orders.filter(o => o.status === "delivered").length.toString(), color: "text-green-600" }
        ].map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className={`text-sm ${stat.color}`}>{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filter Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
              />
              <Input
                placeholder="Search orders..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select onValueChange={(value) => setStatusFilter(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={() => setCurrentPage(1)}>Apply Filters</Button>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="space-y-4 mb-8">
        {currentOrders.map((order) => (
          <Card key={order.id} className="hover:shadow-warm transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-lg font-semibold">Order #{order.id}</h3>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(order.status)}
                      <Badge className={getStatusColor(order.status)}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  <p className="font-medium">{order.productName}</p>
                  <p className="text-muted-foreground">{order.merchantName}</p>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <MapPin size={14} className="mr-1" />
                    {order.location}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">{order.totalAmount}</div>
                  <div className="text-sm text-muted-foreground">Total Amount</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center space-x-2">
                  <Package size={16} className="text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Quantity</div>
                    <div className="font-medium">{order.quantity}</div>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground">Unit Price</div>
                  <div className="font-medium">{order.unitPrice}</div>
                </div>

                <div className="flex items-center space-x-2">
                  <Calendar size={16} className="text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Order Date</div>
                    <div className="font-medium">
                      {new Date(order.orderDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Truck size={16} className="text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">
                      {order.status === "delivered" ? "Delivered" : 
                       order.status === "shipped" ? "Expected Delivery" : 
                       order.status === "confirmed" ? "Expected Delivery" : "Expected Shipping"}
                    </div>
                    <div className="font-medium">
                      {order.status === "delivered" ? new Date(order.deliveredDate).toLocaleDateString() :
                       order.status === "shipped" ? new Date(order.deliveryDate).toLocaleDateString() :
                       order.status === "confirmed" ? new Date(order.deliveryDate).toLocaleDateString() :
                       new Date(order.expectedShipping).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              {order.trackingNumber && (
                <div className="bg-accent/50 p-3 rounded-lg mb-4">
                  <div className="text-sm text-muted-foreground mb-1">Tracking Number</div>
                  <p className="font-mono text-sm font-medium">{order.trackingNumber}</p>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button variant="outline" size="sm">
                  <Eye size={14} className="mr-2" /> View Details
                </Button>

                {order.trackingNumber && (
                  <Button variant="outline" size="sm">
                    <Truck size={14} className="mr-2" /> Track Order
                  </Button>
                )}

                {order.status === "delivered" && (
                  <Button size="sm">Rate & Review</Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Previous
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                size="sm"
                variant={currentPage === page ? "default" : "outline"}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders;