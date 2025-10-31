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
// Keep dialog components for delete confirmation (inline view dialog has been removed)
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useOrders } from "@/hooks/useOrders";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { useInventory } from "@/hooks/useInventory";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "@/lib/api";
import { extractBackendUserId } from "@/lib/profile";

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
  const [filters, setFilters] = useState({ search: "", product: "all", status: "all" });
  const [showFilterCard, setShowFilterCard] = useState(false);
  // Removed inline dialog state; we'll navigate to QuoteView instead
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const navigate = useNavigate();
  const [buyerResponses, setBuyerResponses] = useState<any[]>([]);

  // Use API-driven buyer responses for listing
  const merchantOrders = buyerResponses;

  // Build dynamic filter options from API data
  const productOptions = useMemo(() => {
    const set = new Set<string>();
    merchantOrders.forEach(o => {
      if (o.productName) set.add(String(o.productName));
    });
    return ["all", ...Array.from(set)];
  }, [merchantOrders]);

  const statusOptions = useMemo(() => {
    const set = new Set<string>();
    merchantOrders.forEach(o => {
      if (o.status) set.add(String(o.status).toLowerCase());
    });
    return ["all", ...Array.from(set)];
  }, [merchantOrders]);

  // Calculate displayed orders based on filters and sorting
  const displayedOrders = useMemo(() => {
    if (!merchantOrders) return [];
    let result = [...merchantOrders];

    // Apply filters
    result = result.filter(order => {
      const matchesSearch = filters.search
        ? [order.id, order.customerName, order.productName]
            .map(v => String(v || "").toLowerCase())
            .some(v => v.includes(filters.search.toLowerCase()))
        : true;

      const matchesProduct = filters.product !== "all"
        ? String(order.productName || "").toLowerCase() === String(filters.product).toLowerCase()
        : true;

      const matchesStatus = filters.status !== "all"
        ? String(order.status || "").toLowerCase() === String(filters.status).toLowerCase()
        : true;

      return matchesSearch && matchesProduct && matchesStatus;
    });

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
        const view = 'merchant';
        // const userID = extractBackendUserId() || (profile as any)?.id || '';
        const params = new URLSearchParams({ view });
        // if (userID) params.set('userID', userID);
        params.set('ownOnly', "true");
        const res: any = await apiFetch(`/api/stocks/enquiries?${params.toString()}`, { method: "GET" });
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
          requirementId: it.requirementId || it.reqId || it.requirement_id || '',
          quoteId: it.quoteId || it.quote_id || '',
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

      // Notify other parts of the app (e.g., ProductDetail) to update UI
      try { window.dispatchEvent(new CustomEvent('enquiry:status-updated', { detail: { id: orderId, status: 'confirmed' } })); } catch {}

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

      // Notify other parts of the app (e.g., ProductDetail) to update UI
      try { window.dispatchEvent(new CustomEvent('enquiry:status-updated', { detail: { id: orderId, status: 'cancelled' } })); } catch {}

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

  // Filters are auto-applied via state changes and useMemo; no explicit handlers needed

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

  const handleViewDetails = async (order: any) => {
    const source = String(order?.source || '').toLowerCase();

    // If order came from Market Place, go to product details page
    if (source.includes('market')) {
      const pid = (order as any).productId;
      if (pid) {
        navigate(`/product/${pid}?from=merchant-orders`);
        return;
      }
    }

    // Otherwise, navigate to the new split view. Prefer using requirementId and quoteId embedded in row
    try {
      const requirementId = String(order?.requirementId);
      if (!requirementId) throw new Error('Missing requirement id');
      const view = 'merchant';
      const knownQuoteId = String(order?.quoteId || '');
      if (knownQuoteId) {
        navigate(`/quote/${requirementId}/${knownQuoteId}?view=${view}`);
        return;
      }
      // Fallback: fetch requirement and find confirmed quote
      const data: any = await apiFetch(`/api/quotes/with-requirement/${encodeURIComponent(requirementId)}?view=${view}`);
      const root = data?.data ?? data;
      const quotes: any[] = (root?.quotes ?? root?.Quotes ?? []) as any[];
      const confirmed = quotes.find((q: any) => String(q?.status || '').toLowerCase() === 'confirmed');
      if (!confirmed) {
        toast({ title: 'No confirmed quote', description: 'This requirement has no confirmed quote yet.' });
        return;
      }
      const quoteId = String(confirmed?.id ?? confirmed?._id ?? confirmed?.ID ?? confirmed?.quoteId ?? '');
      if (!quoteId) throw new Error('Missing quote id');
      navigate(`/quote/${requirementId}/${quoteId}?view=${view}`);
    } catch (e) {
      console.error('Failed to open quote view', e);
      toast({ title: 'Error', description: 'Unable to open quote details', variant: 'destructive' });
    }
  };

  const handleDeleteClick = (orderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOrderToDelete(orderId);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!orderToDelete) return;
    try {
      const view = 'merchant';
      const userID = extractBackendUserId() || (profile as any)?.id || '';
      const params = new URLSearchParams({ view });
      if (userID) params.set('userID', userID);
      await apiFetch(`/api/stocks/enquiries/${encodeURIComponent(orderToDelete)}?${params.toString()}`, { method: 'DELETE' });
      setBuyerResponses(prev => prev.filter(item => item.id !== orderToDelete));

      toast({
        title: "Response Deleted",
        description: "The response has been hidden from your view.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to delete response',
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setOrderToDelete(null);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-primary">Buyer Response</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-2">
            Manage buyer response and shipments
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilterCard(prev => !prev)}
          className="flex items-center space-x-1"
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Filter Card */}
      {showFilterCard && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Filter Response</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-xs md:text-sm font-medium mb-2 block">Search</label>
                <Input
                  type="text"
                  placeholder="Search by Buyer or Product..."
                  value={filters.search}
                  onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs md:text-sm font-medium mb-2 block">Product</label>
                <Select
                  value={filters.product}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, product: value }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All products" />
                  </SelectTrigger>
                  <SelectContent>
                    {productOptions.map(opt => (
                      <SelectItem key={opt} value={opt}>
                        {opt === "all" ? "All" : opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs md:text-sm font-medium mb-2 block">Status</label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(opt => (
                      <SelectItem key={opt} value={opt}>
                        {opt === "all" ? "All" : opt.charAt(0).toUpperCase() + opt.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Orders Table - Desktop only */}
      <Card className="hidden lg:block">
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
                  <TableHead className="w-[12%] select-none">
                    <div className="flex items-center justify-between">
                      Total Amount
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
                      <TableCell>
                        {formatINR(
                          (parseFloat(String(order.quantity).replace(/[^0-9.-]+/g, '')) || 0) *
                          (parseFloat(String(order.totalAmount).replace(/[^0-9.-]+/g, '')) || 0)
                        )}
                      </TableCell>
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
                          {(String(order.status).toLowerCase() === 'confirmed' || String(order.status).toLowerCase() === 'rejected') && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={(e) => handleDeleteClick(order.id, e)}
                              title="Delete Response"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
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
                    <TableCell colSpan={10} className="text-center py-4 text-muted-foreground">
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

      {/* Orders Cards - Mobile & Tablet only */}
      <div className="grid grid-cols-1 gap-4 lg:hidden">
        {paginatedOrders && paginatedOrders.length > 0 ? (
          paginatedOrders.map((order) => (
            <Card key={order.id} className="shadow-sm border border-muted/40">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base md:text-lg">
                      {order.productName || 'Cashews'}
                    </CardTitle>
                    <p className="text-xs md:text-sm text-muted-foreground mt-1">Buyer: {order.customerName || profile.name}</p>
                  </div>
                  <Badge variant={getStatusColor(order.status)} className="text-[10px] md:text-xs">
                    {String(order.status).toLowerCase() === 'processing' ? 'New' : (order.status.charAt(0).toUpperCase() + order.status.slice(1))}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-xs md:text-sm">
                  <span className="text-muted-foreground">Source</span>
                  <span className="font-medium">{order.source || 'Market Place'}</span>
                </div>
                <div className="flex items-center justify-between text-xs md:text-sm">
                  <span className="text-muted-foreground">Quantity</span>
                  <span className="font-medium">{order.quantity}</span>
                </div>
                <div className="flex items-center justify-between text-xs md:text-sm">
                  <span className="text-muted-foreground">Unit Price</span>
                  <span className="font-semibold">{formatINR(parseFloat(order.totalAmount.replace(/[^0-9.-]+/g, "")))}</span>
                </div>
                <div className="flex items-center justify-between text-xs md:text-sm">
                  <span className="text-muted-foreground">Total Amount</span>
                  <span className="font-semibold">
                    {formatINR(
                      (parseFloat(String(order.quantity).replace(/[^0-9.-]+/g, '')) || 0) *
                      (parseFloat(String(order.totalAmount).replace(/[^0-9.-]+/g, '')) || 0)
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs md:text-sm">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium">{new Date(order.orderDate).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleViewDetails(order)}
                    className="text-xs md:text-sm"
                  >
                    <Eye className="h-4 w-4 mr-1" /> View
                  </Button>
                  {(String(order.status).toLowerCase() === 'confirmed' || String(order.status).toLowerCase() === 'rejected') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={(e) => handleDeleteClick(order.id, e as any)}
                      title="Delete Response"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  {String(order.status).toLowerCase() === "processing" && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-green-600 hover:text-green-700"
                        onClick={() => handleAcceptOrder(order.id)}
                        title="Confirm"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleRejectOrder(order.id)}
                        title="Reject"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="lg:hidden">
            <CardContent className="py-6 text-center text-muted-foreground">
              <Package className="mx-auto h-10 w-10 mb-2" />
              {merchantOrders.length === 0 ? 'No buyer response found' : 'No orders match the current filters'}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pagination - Mobile & Tablet only (desktop has its own inside the table card) */}
      {merchantOrders.length > 0 && (
        <div className="flex items-center justify-between mt-2 lg:hidden">
          <div className="text-xs md:text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(startIndex + pageSize, merchantOrders.length)} of {merchantOrders.length} orders
          </div>
          <div className="flex items-center space-x-2 md:space-x-4">
            <Select
              value={String(pageSize)}
              onValueChange={(value) => {
                setPageSize(Number(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[88px] md:w-[100px]">
                <SelectValue placeholder="Page size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
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