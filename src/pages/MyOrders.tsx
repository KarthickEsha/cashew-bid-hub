import { useState, useMemo, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useOrders } from "@/hooks/useOrders";
import {
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
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
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Trash2,
} from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useProfile } from "@/hooks/useProfile";
import { apiFetch } from "@/lib/api";
import { extractBackendUserId } from "@/lib/profile";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type SortField = 'productName' | 'orderDate' | 'status' | 'totalAmount' | 'quantity';
type SortDirection = 'asc' | 'desc';

const MyOrders = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [sortConfig, setSortConfig] = useState<{ field: SortField; direction: SortDirection }>({
    field: 'orderDate',
    direction: 'desc',
  });

  const { orders, updateOrderStatus, deleteOrder } = useOrders();
  const { profile } = useProfile();
  const [buyerOrders, setBuyerOrders] = useState<any[]>([]);

  // filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");

  // dialog states
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [trackingOpen, setTrackingOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);

  // Drive this page from API enquiries instead of local store
  const allOrders = buyerOrders;

  // Dynamic filter option sources (derived from current data)
  const availableStatuses = useMemo(
    () => Array.from(new Set(
      (allOrders || [])
        .map(o => String(o.status || '').toLowerCase())
        .filter(Boolean)
    )),
    [allOrders]
  );

  const availableLocations = useMemo(
    () => Array.from(new Set(
      (allOrders || [])
        .map(o => String(o.location || '').trim())
        .filter(Boolean)
    )),
    [allOrders]
  );

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const view = 'buyer';
        // const userID = extractBackendUserId() || (profile as any)?.id || '';
        const params = new URLSearchParams({ view });
        params.set('ownOnly', "true");
        // if (userID) params.set('userID', userID);
        const res: any = await apiFetch(`/api/stocks/enquiries?${params.toString()}`, { method: 'GET' });
        const arr = Array.isArray(res?.data) ? res.data : [];
        const normalized = arr.map((it: any) => ({
          id: it.id,
          productName: it.productName || '',
          merchantName: it.username || '',
          quantity: `${it.quantity ?? 0}`,
          totalAmount: `₹${it.expectedPrice ?? 0}`,
          status: String(it.status || 'processing').toLowerCase(),
          orderDate: it.createdAt || new Date().toISOString(),
          location: it.usercountry || '',
          productId: it.productId || '',
          source: it.source || '',
        }));
        if (!ignore) setBuyerOrders(normalized);
      } catch (e) {
        console.error('Failed to load enquiries for MyOrders', e);
      }
    })();
    return () => { ignore = true; };
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'processing':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-300 bg-yellow-50">Processing</Badge>;
      case 'confirmed':
        return <Badge variant="outline" className="text-blue-600 border-blue-300 bg-blue-50">Confirmed</Badge>;
      case 'shipped':
        return <Badge variant="outline" className="text-orange-600 border-orange-300 bg-orange-50">Shipped</Badge>;
      case 'delivered':
        return <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50">Delivered</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="text-red-600 border-red-300 bg-red-50">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleSort = (field: SortField) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };
  
  const formatWithCommas = (val: any) => {
    if (val === null || val === undefined) return "0";
    const num = typeof val === 'number' ? val : parseFloat(String(val).replace(/[^0-9.-]+/g, ""));
    if (isNaN(num)) return String(val);
    return new Intl.NumberFormat('en-IN').format(num);
  }

  const formatINR = (val: any) => `₹${new Intl.NumberFormat('en-IN').format(
    typeof val === 'number' ? val : parseFloat(String(val).replace(/[^0-9.-]+/g, "")) || 0
  )}`;

  const getSortIcon = (field: SortField) => {
    if (sortConfig.field !== field) {
      return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />;
    }
    return sortConfig.direction === 'asc'
      ? <ArrowUp className="ml-2 h-4 w-4" />
      : <ArrowDown className="ml-2 h-4 w-4" />;
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
  const filteredAndSortedOrders = useMemo(() => {
    const filtered = allOrders.filter((order) => {
      const searchTermLower = searchTerm.toLowerCase();
      const productName = order.productName || '';
      const orderId = order.id || '';
      const orderStatus = order.status || '';
      const orderLocation = order.location || '';
      const merchantName = order.merchantName || '';

      const matchesSearch =
        productName.toLowerCase().includes(searchTermLower) ||
        merchantName.toLowerCase().includes(searchTermLower) ||
        orderId.toLowerCase().includes(searchTermLower);

      const matchesStatus =
        statusFilter === "all" ||
        orderStatus.toLowerCase() === statusFilter.toLowerCase();

      const matchesLocation =
        locationFilter === "all" ||
        orderLocation.toLowerCase() === locationFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesLocation;
    });

    // Apply sorting
    return [...filtered].sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortConfig.field) {
        case 'productName':
          aValue = a.productName.toLowerCase();
          bValue = b.productName.toLowerCase();
          break;
        case 'orderDate':
          aValue = new Date(a.orderDate);
          bValue = new Date(b.orderDate);
          break;
        case 'status':
          aValue = a.status.toLowerCase();
          bValue = b.status.toLowerCase();
          break;
        case 'totalAmount':
          aValue = parseFloat(a.totalAmount.replace(/[^0-9.-]+/g, ""));
          bValue = parseFloat(b.totalAmount.replace(/[^0-9.-]+/g, ""));
          break;
        case 'quantity':
          aValue = parseFloat(a.quantity.split(' ')[0]);
          bValue = parseFloat(b.quantity.split(' ')[0]);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [allOrders, searchTerm, statusFilter, locationFilter, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentOrders = filteredAndSortedOrders.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Responses</h1>
          <p className="text-muted-foreground">
            View and manage your responses
          </p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by product or merchant..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {availableStatuses.map(s => (
                <SelectItem key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={locationFilter}
            onValueChange={(value) => {
              setLocationFilter(value);
              setCurrentPage(1);
            }}
          >
          </Select>
        </div>
      </div>

      {/* Orders Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('productName')}
              >
                <div className="flex items-center">
                  Product
                  {getSortIcon('productName')}
                </div>
              </TableHead>
              <TableHead>Merchant</TableHead>
              <TableHead
                className="text-right cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('quantity')}
              >
                <div className="flex items-center justify-end">
                  Quantity
                  {getSortIcon('quantity')}
                </div>
              </TableHead>
              <TableHead
                className="text-right cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('totalAmount')}
              >
                <div className="flex items-center justify-end">
                  Amount/kg
                  {getSortIcon('totalAmount')}
                </div>
              </TableHead>
              <TableHead className="text-right">Total Amount</TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center">
                  Status
                  {getSortIcon('status')}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('orderDate')}
              >
                <div className="flex items-center">
                  Date
                  {getSortIcon('orderDate')}
                </div>
              </TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center py-6">
                    <Package className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No enquiries found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              currentOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{order.productName || 'Cashews'}</span>
                      {/* <span className="text-xs text-muted-foreground">#{order.id}</span> */}
                    </div>
                  </TableCell>
                  <TableCell>{order.merchantName || '-'}</TableCell>
                  <TableCell className="text-right">{formatWithCommas(order.quantity)} Kg</TableCell>
                  <TableCell className="text-right font-medium">{order.totalAmount}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatINR(
                      (parseFloat(String(order.quantity).replace(/[^0-9.-]+/g, "")) || 0) *
                      (parseFloat(String(order.totalAmount).replace(/[^0-9.-]+/g, "")) || 0)
                    )}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(order.status)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{format(new Date(order.orderDate), 'MM/dd/yyyy')}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(order.orderDate), 'h:mm a')}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          setSelectedOrder(order);
                          setDetailsOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View details</span>
                      </Button>
                      {order.trackingNumber && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            setSelectedOrder(order);
                            setTrackingOpen(true);
                          }}
                        >
                          <Truck className="h-4 w-4" />
                          <span className="sr-only">Track order</span>
                        </Button>
                      )}
                      {(order.status === 'confirmed' || order.status === 'rejected') && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-700"
                          onClick={() => {
                            setOrderToDelete(order.id);
                            setDeleteConfirmOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete enquiry</span>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {filteredAndSortedOrders.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredAndSortedOrders.length)} of {filteredAndSortedOrders.length} enquiries
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">Rows per page</p>
                <Select
                  value={`${itemsPerPage}`}
                  onValueChange={(value) => {
                    setItemsPerPage(Number(value));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="h-8 w-[70px]">
                    <SelectValue placeholder={itemsPerPage} />
                  </SelectTrigger>
                  <SelectContent side="top">
                    {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                      <SelectItem key={pageSize} value={`${pageSize}`}>
                        {pageSize}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                >
                  <ChevronsLeft className="h-4 w-4" />
                  <span className="sr-only">First page</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Previous page</span>
                </Button>
                <div className="text-sm">
                  Page {currentPage} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">Next page</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronsRight className="h-4 w-4" />
                  <span className="sr-only">Last page</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* View Details Popup */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Enquiries Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <Card>
              <CardContent className="space-y-4 p-6">
                {/* Order Info */}
                <div>
                  <h3 className="font-semibold text-lg mb-2 flex items-center">
                    <Package className="mr-2 h-5 w-5 text-blue-500" /> Enquirie Information
                  </h3>
                  {/* <p><strong>Order ID:</strong> {selectedOrder.id}</p> */}
                  <p><strong>Status:</strong> {selectedOrder.status}</p>
                  <p className="flex items-center text-sm text-muted-foreground">
                    <Calendar size={14} className="mr-1" /> Enquire on: {selectedOrder.orderDate}
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
                  <p><strong>Quantity:</strong> {formatWithCommas(selectedOrder.quantity)} Kg</p>
                  <p><strong>Unit Price:</strong> {formatINR(selectedOrder.unitPrice)}</p>
                  <p>
                    <strong> Total Amount:</strong> {formatINR(selectedOrder.totalAmount)}
                  </p>
                </div>

                {/* Merchant & Location */}
                <div>
                  <h3 className="font-semibold text-lg mb-2 flex items-center">
                    <User className="mr-2 h-5 w-5 text-purple-500" /> Merchant & Location
                  </h3>
                  <p><strong>Merchant:</strong> {profile.companyName}</p>
                  <p className="flex items-center text-sm text-muted-foreground">
                    <MapPin size={14} className="mr-1" /> {profile.city}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete this enquiry? This action cannot be undone.</p>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (orderToDelete) {
                  try {
                    await apiFetch(`/api/stocks/enquiries/${encodeURIComponent(orderToDelete)}?view=buyer`, { method: 'DELETE' });
                    setBuyerOrders(prev => prev.filter(o => o.id !== orderToDelete));
                  } catch (e) {
                  } finally {
                    setDeleteConfirmOpen(false);
                    setOrderToDelete(null);
                  }
                }
              }}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyOrders;