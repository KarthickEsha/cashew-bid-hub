import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Check, X, Filter, ArrowUpDown, ArrowUp, ArrowDown, Trash2, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose, DialogFooter } from "@/components/ui/dialog";
import { useOrders } from "@/hooks/useOrders";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { useInventory } from "@/hooks/useInventory";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "@/lib/api";
// Utility function to format currency in Indian Rupees
const formatINR = (amount: number | string): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
};

const MerchantOrders = () => {
  const { orders: allOrders, updateOrderStatus, deleteOrder, getOrderById } = useOrders();
  const { toast } = useToast();
  const { profile } = useProfile();
  const { reduceAvailableStock } = useInventory();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [filters, setFilters] = useState({ orderId: "", customer: "", product: "" });
  const [showFilterCard, setShowFilterCard] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const navigate = useNavigate();
  const [buyerResponses, setBuyerResponses] = useState<any[]>([]);

  // Use API-driven buyer responses for listing
  const merchantOrders = buyerResponses;

  // Calculate displayed orders based on filters and sorting
  const displayedOrders = useMemo(() => {
    if (!merchantOrders) return [];
    let result = [...merchantOrders];

    // Apply filters
    if (filters.orderId || filters.customer || filters.product) {
      result = result.filter(order =>
        (filters.orderId ? order.id?.toLowerCase().includes(filters.orderId.toLowerCase()) : true) &&
        (filters.customer ? order.customerName?.toLowerCase().includes(filters.customer.toLowerCase()) : true) &&
        (filters.product ? order.productName?.toLowerCase().includes(filters.product.toLowerCase()) : true)
      );
    }

    // Apply sorting
    if (sortField) {
      result = [...result].sort((a, b) => {
        // Processing orders first
        const aIsProcessing = a.status?.toLowerCase() === 'processing';
        const bIsProcessing = b.status?.toLowerCase() === 'processing';

        if (aIsProcessing && !bIsProcessing) return -1; // a comes first
        if (!aIsProcessing && bIsProcessing) return 1;  // b comes first

        // Normal sorting
        const aValue = a[sortField as keyof typeof a];
        const bValue = b[sortField as keyof typeof b];

        const getComparableValue = (value: any): string | number => {
          if (Array.isArray(value)) {
            const firstItem = value[0];
            if (firstItem) {
              if (typeof firstItem === 'object' && 'date' in firstItem) {
                return new Date(firstItem.date).getTime();
              }
              if (typeof firstItem === 'object' && 'label' in firstItem) {
                return String(firstItem.label).toLowerCase();
              }
            }
            return '';
          }

          if (sortField === 'orderDate' || sortField === 'deliveryDate' || sortField === 'shippingDate') {
            return value ? new Date(String(value)).getTime() : 0;
          }

          if (sortField === 'totalAmount') {
            return Number(String(value || '').replace(/[^0-9.-]+/g, '') || 0);
          }

          if (sortField === 'quantity') {
            return parseInt(String(value || '').replace(/[^0-9]/g, '') || '0', 10) || 0;
          }

          return String(value || '').toLowerCase();
        };

        const compareA = getComparableValue(aValue);
        const compareB = getComparableValue(bValue);

        if (compareA < compareB) return sortDirection === 'asc' ? -1 : 1;
        if (compareA > compareB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    } else {
      // If no sortField, still show Processing first
      result = result.sort((a, b) => {
        const aIsProcessing = a.status?.toLowerCase() === 'processing';
        const bIsProcessing = b.status?.toLowerCase() === 'processing';
        return aIsProcessing === bIsProcessing ? 0 : aIsProcessing ? -1 : 1;
      });
    }

    return result;
  }, [merchantOrders, filters, sortField, sortDirection]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const res: any = await apiFetch('/api/stocks/enquiries', { method: "GET" });
        const arr = Array.isArray(res?.data) ? res.data : [];
        const normalized = arr.map((it: any) => ({
          id: it.id,
          customerName: it.username || '',
          productName: it.productName || '',
          source: it.source || 'Market Place',
          quantity: `${it.quantity ?? 0} kg`,
          totalAmount: `₹${it.expectedPrice ?? 0}`,
          orderDate: it.createdAt || new Date().toISOString(),
          status: String(it.status || 'processing').toLowerCase(),
          productId: it.productId || '',
          grade: it.productName || 'N/A',
          // add any fields you need in handleViewDetails, etc.
        }));
        if (!ignore) {
          setBuyerResponses(normalized);
        }
      } catch (e) {
        console.error('Failed to load enquiries', e);
      }
    })();
    return () => { ignore = true; };
  }, []);

  // Reset to first page when filters/sorting changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sortField, sortDirection, pageSize]);

  // Calculate pagination
  const totalPages = Math.ceil(displayedOrders.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedOrders = displayedOrders.slice(startIndex, startIndex + pageSize);

  const formatWithCommas = (val: any) => {
    if (val === null || val === undefined) return "0";
    const num = typeof val === 'number' ? val : parseInt(String(val).replace(/,/g, ''), 10);
    if (isNaN(num)) return String(val);
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  const handleAcceptOrder = async (orderId: string) => {
    try {
      await apiFetch(`/api/stocks/enquiries/${encodeURIComponent(orderId)}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'confirmed' }),
      });

      setBuyerResponses(prev => prev.map(item => item.id === orderId ? { ...item, status: 'confirmed' } : item));

      toast({
        title: 'Response Submitted Successfully',
        description: 'Response has been confirmed.',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error confirming enquiry:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to confirm enquiry',
        variant: 'destructive',
      });
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    try {
      await apiFetch(`/api/stocks/enquiries/${encodeURIComponent(orderId)}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'Rejected' }),
      });

      setBuyerResponses(prev => prev.map(item => item.id === orderId ? { ...item, status: 'cancelled' } : item));

      toast({
        title: 'Enquiry Cancelled',
        description: 'The enquiry has been cancelled.',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error cancelling enquiry:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to cancel enquiry',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "processing":
        return "destructive";
      case "confirmed":
        return "default";
      case "shipped":
        return "secondary";
      case "delivered":
        return "default";
      case "cancelled":
        return "outline";
      default:
        return "default";
    }
  };

  // Sort orders
  const sortOrders = (ordersToSort: any[]) => {
    if (!sortField) return ordersToSort;

    return [...ordersToSort].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle different data types
      if (sortField === 'date' || sortField === 'deliveryDate') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else if (sortField === 'totalAmount') {
        aValue = Number(aValue);
        bValue = Number(bValue);
      } else if (sortField === 'quantity') {
        // Extract numeric value from quantity string (e.g., "100kg" -> 100)
        aValue = parseInt(aValue.replace(/[^0-9]/g, '')) || 0;
        bValue = parseInt(bValue.replace(/[^0-9]/g, '')) || 0;
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const handleApplyFilter = () => {
    // The filtering is already handled by the displayedOrders useMemo
    setCurrentPage(1);
    setShowFilterCard(false);
  };

  const handleCancelFilter = () => {
    setFilters({ orderId: "", customer: "", product: "" });
    setCurrentPage(1);
    setShowFilterCard(false);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      // If clicking the same field, toggle direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // If clicking a new field, set it and default to ascending
      setSortField(field);
      setSortDirection('asc');
    }

    // Apply sorting to current orders
    const currentFiltered = [...merchantOrders];
    // Note: setOrders is not defined in this component
    // The sorting is already handled in the displayedOrders useMemo
    setCurrentPage(1); // Reset to first page when sorting
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 text-muted-foreground opacity-50" />;
    }
    return sortDirection === 'asc'
      ? <ArrowUp className="h-4 w-4 text-primary" />
      : <ArrowDown className="h-4 w-4 text-primary" />;
  };

  const handleViewDetails = (order: any) => {
    const source = String(order?.source || '').toLowerCase();

    // If order came from Market Place, go to product details page
    if (source.includes('market')) {
      const pid = (order as any).productId;
      if (pid) {
        navigate(`/product/${pid}?from=merchant-orders`);
        return;
      }
    }

    // Otherwise, show the existing inline popup
    setSelectedOrder(order);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (orderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOrderToDelete(orderId);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (orderToDelete) {
      deleteOrder(orderToDelete);
      toast({
        title: "Buyer Response Deleted",
        description: "The response has been successfully deleted.",
        variant: "default",
      });
      setIsDeleteDialogOpen(false);
      setOrderToDelete(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">Buyer Response</h1>
          <p className="text-muted-foreground mt-2">
            Manage buyer response and shipments
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
          {/* <CardTitle>Customer Orders</CardTitle> */}
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-x-auto">
            <Table className="min-w-[1000px]">
              <TableHeader>
                <TableRow>
                  {/* <TableHead
                    className="w-[10%] cursor-pointer hover:bg-muted/50 select-none"
                    onClick={() => handleSort('id')}
                  >
                    <div className="flex items-center justify-between">
                      Order ID
                      {getSortIcon('id')}
                    </div>
                  </TableHead> */}
                  <TableHead
                    className="w-[15%] cursor-pointer hover:bg-muted/50 select-none"
                    onClick={() => handleSort('customerName')}
                  >
                    <div className="flex items-center justify-between">
                      Buyer Name
                      {getSortIcon('customerName')}
                    </div>
                  </TableHead>
                  <TableHead
                    className="w-[20%] cursor-pointer hover:bg-muted/50 select-none"
                    onClick={() => handleSort('productName')}
                  >
                    <div className="flex items-center justify-between">
                      Product
                      {getSortIcon('productName')}
                    </div>
                  </TableHead>
                  <TableHead className="w-[15%] cursor-pointer hover:bg-muted/50 select-none">
                    <div className="flex items-center justify-between">
                      Source  {getSortIcon('source')}
                    </div>
                  </TableHead>
                  <TableHead
                    className="w-[10%] cursor-pointer hover:bg-muted/50 select-none"
                    onClick={() => handleSort('quantity')}
                  >
                    <div className="flex items-center justify-between">
                      Quantity
                      {getSortIcon('quantity')}
                    </div>
                  </TableHead>
                  <TableHead
                    className="w-[10%] cursor-pointer hover:bg-muted/50 select-none"
                    onClick={() => handleSort('totalAmount')}
                  >
                    <div className="flex items-center justify-between">
                      Amount
                      {getSortIcon('totalAmount')}
                    </div>
                  </TableHead>
                  <TableHead
                    className="w-[10%] cursor-pointer hover:bg-muted/50 select-none"
                    onClick={() => handleSort('orderDate')}
                  >
                    <div className="flex items-center justify-between">
                      Date
                      {getSortIcon('orderDate')}
                    </div>
                  </TableHead>
                  {/* <TableHead 
 className="w-[10%] cursor-pointer hover:bg-muted/50 select-none"
 onClick={() => handleSort('deliveryDate')}
 >
 <div className="flex items-center justify-between">
 Delivery Date
 {getSortIcon('deliveryDate')}
 </div>
 </TableHead> */}
                  <TableHead
                    className="w-[7%] cursor-pointer hover:bg-muted/50 select-none"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center justify-between">
                      Status
                      {getSortIcon('status')}
                    </div>
                  </TableHead>
                  <TableHead className="w-[8%]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedOrders && paginatedOrders.length > 0 ? (
                  paginatedOrders.map(order => (
                    <TableRow key={order.id}>
                      {/* <TableCell className="font-medium">{order.id}</TableCell> */}
                      <TableCell>{order.customerName || profile.name}</TableCell>
                      <TableCell>{order.productName || 'Cashews'}</TableCell>
                      <TableCell>{order.source || 'Market Place'}</TableCell>
                      <TableCell>{order.quantity}</TableCell>
                      <TableCell>{formatINR(parseFloat(order.totalAmount.replace(/[^0-9.-]+/g, "")))}</TableCell>
                      <TableCell>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                      {/* <TableCell>{order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : 'Not set'}</TableCell> */}
                      <TableCell>
                        <Badge variant={getStatusColor(order.status)}>
                          {String(order.status).toLowerCase() === 'processing' ? 'New' : (order.status.charAt(0).toUpperCase() + order.status.slice(1))}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(order)}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={(e) => handleDeleteClick(order.id, e)}
                            title="Delete Order"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          {String(order.status).toLowerCase() === "processing" && (
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
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-4 text-muted-foreground">
                      <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                      {merchantOrders.length === 0 ? 'No buyer response found' : 'No orders match the current filters'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {merchantOrders.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(startIndex + pageSize, merchantOrders.length)} of {merchantOrders.length} orders
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
            <DialogTitle>Buyer Response Details</DialogTitle>
            <DialogDescription>
              Detailed information about the selected response.
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="mt-4 space-y-3">

              <div className="flex justify-between">
                <span className="font-medium text-muted-foreground">Customer Name</span>
                <span className="font-semibold">{selectedOrder.customerName || profile.name}</span>
              </div>

              <div className="flex justify-between">
                <span className="font-medium text-muted-foreground">Product Name</span>
                <span className="font-semibold">{selectedOrder.productName}</span>
              </div>

              <div className="flex justify-between">
                <span className="font-medium text-muted-foreground">Quantity</span>
                <span className="font-semibold">{selectedOrder.quantity}</span>
              </div>

              <div className="flex justify-between">
                <span className="font-medium text-muted-foreground">Total Amount</span>
                <span className="font-semibold">{formatINR(parseFloat(selectedOrder.totalAmount.replace(/[^0-9.-]+/g, "")))}</span>
              </div>

              <div className="flex justify-between">
                <span className="font-medium text-muted-foreground">Date</span>
                <span className="font-semibold">{new Date(selectedOrder.orderDate).toLocaleDateString()}</span>
              </div>

              {/* <div className="flex justify-between">
 <span className="font-medium text-muted-foreground">Delivery Date</span>
 <span className="font-semibold">{new Date(selectedOrder.deliveryDate).toLocaleDateString()}</span>
 </div> */}

              <div className="flex justify-between items-center">
                <span className="font-medium text-muted-foreground">Status</span>
                <Badge variant={getStatusColor(selectedOrder.status)}>
                  {String(selectedOrder.status).toLowerCase() === "processing" ? "New" : selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                </Badge>
              </div>

              {/* Buyer Response Section */}
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-medium mb-3">Buyer Remarks</h4>

                {/* Last Status Only */}
                {selectedOrder.statusHistory?.length > 0 && (
                  <div className="mb-4">
                    {(() => {
                      const lastHistory =
                        selectedOrder.statusHistory[selectedOrder.statusHistory.length - 1];
                      return (
                        <div className="flex items-start gap-3 text-sm">
                          <div
                            className={`flex-shrink-0 w-2 h-2 mt-1.5 rounded-full ${lastHistory.status === "rejected"
                              ? "bg-destructive"
                              : "bg-primary"
                              }`}
                          ></div>
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <div>
                                <span className="font-medium">
                                  {lastHistory.updatedBy === "Buyer" ? "Buyer " : ""}
                                  <span className="capitalize">{lastHistory.status}</span>
                                </span>
                                {lastHistory.updatedBy &&
                                  lastHistory.updatedBy !== "System" && (
                                    <span className="text-xs text-muted-foreground ml-2">
                                      (by {lastHistory.updatedBy})
                                    </span>
                                  )}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {new Date(lastHistory.timestamp).toLocaleString()}
                              </span>
                            </div>
                            {lastHistory.remarks && (
                              <div className="mt-1 bg-muted/50 p-2 rounded-md">
                                <p className="text-sm whitespace-pre-wrap">
                                  {lastHistory.remarks}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Response</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this response? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setOrderToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
            >
              Delete Response
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MerchantOrders;