import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useOrders } from "@/hooks/useOrders";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  MapPin,
  Search,
  Eye,
  Truck,
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
  User,
  Inbox,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { profile } from "console";
import { useProfile } from "@/hooks/useProfile";

const MyOrders = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const { orders, updateOrderStatus } = useOrders();

  // filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");

  // applied filters
  const [appliedFilters, setAppliedFilters] = useState({
    searchTerm: "",
    statusFilter: "all",
    locationFilter: "all",
  });

  // dialog states
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { profile, setProfile } = useProfile();
  const [trackingOpen, setTrackingOpen] = useState(false);

  // Add some mock orders if none exist
  const allOrders = orders.length > 0 ? orders : [
    // {
    //   id: "ORD-001",
    //   productName: "Premium W320 Cashews",
    //   merchantName: "Golden Cashew Co.",
    //   quantity: "25 tons",
    //   unitPrice: "$8,200/ton",
    //   totalAmount: "$205,000",
    //   status: "confirmed" as const,
    //   orderDate: "2024-08-20",
    //   shippingDate: "2024-08-22",
    //   deliveryDate: "2024-09-05",
    //   location: "Mumbai, India",
    //   trackingNumber: "TRK123456789",
    //   steps: [
    //     { label: "Order Placed", date: "2024-08-20", done: true },
    //     { label: "Confirmed", date: "2024-08-21", done: true },
    //     { label: "Shipped", date: "2024-08-22", done: true },
    //     { label: "In Transit", date: "2024-08-28", done: false },
    //     { label: "Delivered", date: "2024-09-05", done: false },
    //   ],
    // },
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

  // filtering
  const filteredOrders = allOrders.filter((order) => {
    const matchesSearch = appliedFilters.searchTerm
      ? order.productName.toLowerCase().includes(appliedFilters.searchTerm.toLowerCase()) ||
      order.merchantName.toLowerCase().includes(appliedFilters.searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(appliedFilters.searchTerm.toLowerCase())
      : true;

    const matchesStatus =
      appliedFilters.statusFilter !== "all"
        ? order.status === appliedFilters.statusFilter
        : true;

    const matchesLocation =
      appliedFilters.locationFilter !== "all"
        ? order.location === appliedFilters.locationFilter
        : true;

    return matchesSearch && matchesStatus && matchesLocation;
  });

  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  const uniqueLocations = Array.from(new Set(allOrders.map((o) => o.location)));

  const handleApplyFilters = () => {
    setAppliedFilters({
      searchTerm,
      statusFilter,
      locationFilter,
    });
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setLocationFilter("all");
    setAppliedFilters({
      searchTerm: "",
      statusFilter: "all",
      locationFilter: "all",
    });
    setCurrentPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-3xl font-bold mb-4">My Orders</h1>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filter Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
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

            {/* Status */}
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value)}>
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

            {/* Location */}
            <Select value={locationFilter} onValueChange={(value) => setLocationFilter(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {uniqueLocations.map((loc, i) => (
                  <SelectItem key={i} value={loc}>
                    {loc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Buttons */}
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleClearFilters}>
                Clear Filters
              </Button>
              <Button onClick={handleApplyFilters}>Apply Filters</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders */}
      <div className="space-y-4">
        {currentOrders.length === 0 ? (
          <Card className="p-10 text-center">
            <Inbox className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-lg font-medium">
              No data found for the selected filters
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Try changing your search or filter options
            </p>
          </Card>
        ) : (
          currentOrders.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">Order #{order.id}</h3>
                      {getStatusIcon(order.status)}
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                    <p className="font-medium">{order.productName}</p>
                    <p className="text-sm text-muted-foreground">{profile.companyName}</p>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <MapPin size={14} className="mr-1" /> {order.location}
                    </div>
                  </div>
                  <div>
                    <div className="text-lg font-bold">
                      {new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR",
                        maximumFractionDigits: 2,
                      }).format(parseFloat(order.totalAmount.replace(/[^0-9.-]+/g, "")))}
                    </div>
                  </div>

                </div>

                <div className="flex justify-end space-x-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedOrder(order);
                      setDetailsOpen(true);
                    }}
                  >
                    <Eye size={14} className="mr-2" /> View Details
                  </Button>

                  {order.trackingNumber && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedOrder(order);
                        setTrackingOpen(true);
                      }}
                    >
                      <Truck size={14} className="mr-2" /> Track Order
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* View Details Popup */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <Card>
              <CardContent className="space-y-4 p-6">
                {/* Order Info */}
                <div>
                  <h3 className="font-semibold text-lg mb-2 flex items-center">
                    <Package className="mr-2 h-5 w-5 text-blue-500" /> Order Information
                  </h3>
                  <p><strong>Order ID:</strong> {selectedOrder.id}</p>
                  <p><strong>Status:</strong> {selectedOrder.status}</p>
                  <p className="flex items-center text-sm text-muted-foreground">
                    <Calendar size={14} className="mr-1" /> Ordered on: {selectedOrder.orderDate}
                  </p>
                  {selectedOrder.shippingDate && (
                    <p className="flex items-center text-sm text-muted-foreground">
                      <Truck size={14} className="mr-1" /> Shipped: {selectedOrder.shippingDate}
                    </p>
                  )}
                  {selectedOrder.deliveryDate && (
                    <p className="flex items-center text-sm text-muted-foreground">
                      <CheckCircle size={14} className="mr-1" /> Delivery: {selectedOrder.deliveryDate}
                    </p>
                  )}
                </div>

                {/* Product Info */}
                <div>
                  <h3 className="font-semibold text-lg mb-2 flex items-center">
                    <Package className="mr-2 h-5 w-5 text-green-500" /> Product Information
                  </h3>
                  <p><strong>Product:</strong> {selectedOrder.productName}</p>
                  <p><strong>Quantity:</strong> {selectedOrder.quantity}</p>
                  <p><strong>Unit Price:</strong> {selectedOrder.unitPrice}</p>
                  <p className="font-bold text-lg flex items-center">
                    <DollarSign size={16} className="mr-1 text-primary" /> {selectedOrder.totalAmount}
                  </p>
                </div>

                {/* Merchant & Location */}
                <div>
                  <h3 className="font-semibold text-lg mb-2 flex items-center">
                    <User className="mr-2 h-5 w-5 text-purple-500" /> Merchant & Location
                  </h3>
                  <p><strong>Merchant:</strong> {selectedOrder.merchantName}</p>
                  <p className="flex items-center text-sm text-muted-foreground">
                    <MapPin size={14} className="mr-1" /> {selectedOrder.location}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </DialogContent>
      </Dialog>

      {/* Track Order Popup */}
      <Dialog open={trackingOpen} onOpenChange={setTrackingOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Track Order</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <p><strong>Tracking Number:</strong> {selectedOrder.trackingNumber}</p>
              <p><strong>Shipping Date:</strong> {selectedOrder.shippingDate}</p>
              <p><strong>Estimated Arrival:</strong> {selectedOrder.deliveryDate}</p>

              <div className="mt-4 border-l-2 border-gray-300 pl-4 space-y-3">
                {selectedOrder.steps?.map((step: any, idx: number) => (
                  <div key={idx} className="flex items-start space-x-2">
                    {step.done ? (
                      <CheckCircle className="text-green-500 h-5 w-5" />
                    ) : idx === selectedOrder.steps.findIndex((s: any) => !s.done) ? (
                      <Clock className="text-yellow-500 h-5 w-5" />
                    ) : (
                      <Package className="text-gray-400 h-5 w-5" />
                    )}
                    <div>
                      <p className="font-medium">{step.label}</p>
                      <p className="text-sm text-gray-500">{step.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyOrders;
