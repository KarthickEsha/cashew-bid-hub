import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Check, X } from "lucide-react";

const mockOrders = [
  {
    id: "ORD-001",
    customerName: "Restaurant ABC",
    productName: "Premium Cashews W240",
    quantity: "100kg",
    totalAmount: 850,
    date: "2024-01-15",
    status: "pending",
    deliveryDate: "2024-01-25"
  },
  {
    id: "ORD-002",
    customerName: "Food Corp Ltd",
    productName: "Organic Cashews W320",
    quantity: "200kg",
    totalAmount: 1560,
    date: "2024-01-14",
    status: "accepted",
    deliveryDate: "2024-01-28"
  },
  {
    id: "ORD-003",
    customerName: "Snack Factory",
    productName: "Broken Cashews BB",
    quantity: "300kg",
    totalAmount: 1860,
    date: "2024-01-13",
    status: "shipped",
    deliveryDate: "2024-01-20"
  }
];

const MerchantOrders = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [orders, setOrders] = useState(mockOrders);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = orders.slice(startIndex, startIndex + itemsPerPage);

  const handleAcceptOrder = (orderId: string) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: 'accepted' } : order
    ));
  };

  const handleRejectOrder = (orderId: string) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: 'rejected' } : order
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'destructive';
      case 'accepted': return 'default';
      case 'shipped': return 'secondary';
      case 'rejected': return 'outline';
      default: return 'default';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">Orders</h1>
        <p className="text-muted-foreground mt-2">
          Manage customer orders and shipments
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Orders</CardTitle>
          <CardDescription>View and manage all customer orders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[100px]">Order ID</TableHead>
                  <TableHead className="min-w-[150px]">Customer</TableHead>
                  <TableHead className="min-w-[200px]">Product</TableHead>
                  <TableHead className="min-w-[100px]">Quantity</TableHead>
                  <TableHead className="min-w-[100px]">Amount</TableHead>
                  <TableHead className="min-w-[120px]">Order Date</TableHead>
                  <TableHead className="min-w-[130px]">Delivery Date</TableHead>
                  <TableHead className="min-w-[100px]">Status</TableHead>
                  <TableHead className="min-w-[150px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
            <TableBody>
              {paginatedOrders.map((order) => (
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
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {order.status === 'pending' && (
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
            </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, orders.length)} of {orders.length} orders
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MerchantOrders;