import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Check, X, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Make sure you have your Select component
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog"; // Add Dialog components

const mockOrders = [
  {
    id: "ORD-001",
    customerName: "Restaurant ABC",
    productName: "Premium Cashews W240",
    quantity: "100kg",
    totalAmount: 850,
    date: "2024-01-15",
    status: "pending",
    deliveryDate: "2024-01-25",
  },
  {
    id: "ORD-002",
    customerName: "Food Corp Ltd",
    productName: "Organic Cashews W320",
    quantity: "200kg",
    totalAmount: 1560,
    date: "2024-01-14",
    status: "accepted",
    deliveryDate: "2024-01-28",
  },
  {
    id: "ORD-003",
    customerName: "Snack Factory",
    productName: "Broken Cashews BB",
    quantity: "300kg",
    totalAmount: 1860,
    date: "2024-01-13",
    status: "shipped",
    deliveryDate: "2024-01-20",
  },
  {
    id: "ORD-004",
    customerName: "Cafe Delight",
    productName: "Cashew Kernels W180",
    quantity: "150kg",
    totalAmount: 1200,
    date: "2024-01-12",
    status: "pending",
    deliveryDate: "2024-01-22",
  },
  {
    id: "ORD-005",
    customerName: "Bistro House",
    productName: "Organic Almonds",
    quantity: "250kg",
    totalAmount: 2500,
    date: "2024-01-11",
    status: "accepted",
    deliveryDate: "2024-01-30",
  },
  {
    id: "ORD-006",
    customerName: "Gourmet Snacks",
    productName: "Walnuts Premium",
    quantity: "180kg",
    totalAmount: 2000,
    date: "2024-01-10",
    status: "shipped",
    deliveryDate: "2024-01-18",
  },
  {
    id: "ORD-007",
    customerName: "Healthy Bites",
    productName: "Pistachios Roasted",
    quantity: "120kg",
    totalAmount: 1500,
    date: "2024-01-09",
    status: "pending",
    deliveryDate: "2024-01-19",
  },
  {
    id: "ORD-008",
    customerName: "Snack World",
    productName: "Cashew Pieces W210",
    quantity: "220kg",
    totalAmount: 1800,
    date: "2024-01-08",
    status: "rejected",
    deliveryDate: "2024-01-20",
  },
  {
    id: "ORD-009",
    customerName: "Tasty Treats",
    productName: "Almond Slivers",
    quantity: "140kg",
    totalAmount: 1400,
    date: "2024-01-07",
    status: "accepted",
    deliveryDate: "2024-01-17",
  },
  {
    id: "ORD-010",
    customerName: "Nutri Snacks",
    productName: "Mixed Nuts Premium",
    quantity: "200kg",
    totalAmount: 2200,
    date: "2024-01-06",
    status: "shipped",
    deliveryDate: "2024-01-16",
  },
];

const MerchantOrders = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [orders, setOrders] = useState(mockOrders);
  const [filters, setFilters] = useState({ orderId: "", customer: "", product: "" });
  const [showFilterCard, setShowFilterCard] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAcceptOrder = (orderId: string) => {
    setOrders(prev =>
      prev.map(order =>
        order.id === orderId ? { ...order, status: "accepted" } : order
      )
    );
  };

  const handleRejectOrder = (orderId: string) => {
    setOrders(prev =>
      prev.map(order =>
        order.id === orderId ? { ...order, status: "rejected" } : order
      )
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "destructive";
      case "accepted":
        return "default";
      case "shipped":
        return "secondary";
      case "rejected":
        return "outline";
      default:
        return "default";
    }
  };

  const handleApplyFilter = () => {
    const filtered = mockOrders.filter(order =>
      order.id.toLowerCase().includes(filters.orderId.toLowerCase()) &&
      order.customerName.toLowerCase().includes(filters.customer.toLowerCase()) &&
      order.productName.toLowerCase().includes(filters.product.toLowerCase())
    );
    setOrders(filtered);
    setCurrentPage(1);
    setShowFilterCard(false);
  };

  const handleCancelFilter = () => {
    setFilters({ orderId: "", customer: "", product: "" });
    setOrders(mockOrders);
    setCurrentPage(1);
    setShowFilterCard(false);
  };

  const handleViewDetails = (order: any) => {
    setSelectedOrder(order);
    setIsDialogOpen(true);
  };

  const totalPages = Math.ceil(orders.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedOrders = orders.slice(startIndex, startIndex + pageSize);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">Orders</h1>
          <p className="text-muted-foreground mt-2">
            Manage customer orders and shipments
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilterCard(prev => !prev)}
          className="flex items-center space-x-1"
        >
          <Filter className="h-4 w-4" /> <span>Filter Orders</span>
        </Button>
      </div>

      {/* Filter Card */}
      {showFilterCard && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Filter Orders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Search Order ID</label>
                <Input
                  type="text"
                  placeholder="Enter Order ID"
                  value={filters.orderId}
                  onChange={e => setFilters(prev => ({ ...prev, orderId: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Customer</label>
                <Input
                  type="text"
                  placeholder="Enter Customer Name"
                  value={filters.customer}
                  onChange={e => setFilters(prev => ({ ...prev, customer: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Product</label>
                <Input
                  type="text"
                  placeholder="Enter Product Name"
                  value={filters.product}
                  onChange={e => setFilters(prev => ({ ...prev, product: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" size="sm" onClick={handleCancelFilter}>
                Cancel
              </Button>
              <Button variant="default" size="sm" onClick={handleApplyFilter}>
                Apply
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-x-auto">
            <Table className="min-w-[1000px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[10%]">Order ID</TableHead>
                  <TableHead className="w-[15%]">Customer</TableHead>
                  <TableHead className="w-[20%]">Product</TableHead>
                  <TableHead className="w-[10%]">Quantity</TableHead>
                  <TableHead className="w-[10%]">Amount</TableHead>
                  <TableHead className="w-[10%]">Order Date</TableHead>
                  <TableHead className="w-[10%]">Delivery Date</TableHead>
                  <TableHead className="w-[7%]">Status</TableHead>
                  <TableHead className="w-[8%]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedOrders.map(order => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>{order.productName}</TableCell>
                    <TableCell>{order.quantity}</TableCell>
                    <TableCell>${order.totalAmount}</TableCell>
                    <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(order.deliveryDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(order.status)}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleViewDetails(order)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {order.status === "pending" && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-green-600 hover:text-green-700"
                              onClick={() => handleAcceptOrder(order.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleRejectOrder(order.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {paginatedOrders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-4 text-muted-foreground">
                      No orders found for selected filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {orders.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(startIndex + pageSize, orders.length)} of {orders.length} orders
              </div>
              <div className="flex items-center space-x-4">
                {/* Page Size Selector */}
                <Select
                  value={String(pageSize)}
                  onValueChange={(value) => {
                    setPageSize(Number(value));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="Page size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>

                {/* Prev/Next Buttons */}
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Details Popup */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Detailed information about the selected order
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="mt-4 space-y-3">
              <div className="flex justify-between">
                <span className="font-medium text-muted-foreground">Order ID</span>
                <span className="font-semibold">{selectedOrder.id}</span>
              </div>

              <div className="flex justify-between">
                <span className="font-medium text-muted-foreground">Customer Name</span>
                <span className="font-semibold">{selectedOrder.customerName}</span>
              </div>

              <div className="flex justify-between">
                <span className="font-medium text-muted-foreground">Product</span>
                <span className="font-semibold">{selectedOrder.productName}</span>
              </div>

              <div className="flex justify-between">
                <span className="font-medium text-muted-foreground">Quantity</span>
                <span className="font-semibold">{selectedOrder.quantity}</span>
              </div>

              <div className="flex justify-between">
                <span className="font-medium text-muted-foreground">Total Amount</span>
                <span className="font-semibold">${selectedOrder.totalAmount}</span>
              </div>

              <div className="flex justify-between">
                <span className="font-medium text-muted-foreground">Order Date</span>
                <span className="font-semibold">{new Date(selectedOrder.date).toLocaleDateString()}</span>
              </div>

              <div className="flex justify-between">
                <span className="font-medium text-muted-foreground">Delivery Date</span>
                <span className="font-semibold">{new Date(selectedOrder.deliveryDate).toLocaleDateString()}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-medium text-muted-foreground">Status</span>
                <Badge variant={getStatusColor(selectedOrder.status)}>
                  {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                </Badge>
              </div>
            </div>
          )}

          {/* <div className="mt-6 flex justify-end">
            <DialogClose asChild>
              <Button
                className="bg-purple-600 text-white hover:bg-purple-700"
                size="sm"
              >
                Close
              </Button>
            </DialogClose>
          </div> */}

        </DialogContent>
      </Dialog>

    </div>
  );
};

export default MerchantOrders;
