import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Eye, MessageSquare, Search, Filter, Package, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect } from "react";
import { apiFetch } from "@/lib/api";

const MerchantConfirmedOrders = () => {
  const [apiOrders, setApiOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  // Unified filters state; changes apply immediately
  const [filters, setFilters] = useState({ search: "", product: "all", status: "all" });
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Load confirmed quotes from backend (no requirementId in params)
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const data: any = await apiFetch(`/api/quotes/confirmed`);
        const arr: any[] = (data?.data ?? data) as any[];
        // Normalize fields for UI
        const mapped = (arr || []).map((item) => ({
          id: `${item.buyerName}-${item.product}-${item.merchantPrice}-${item.merchantAvailableQuantity}-${Math.random()}`,
          customerName: item.buyerName ?? 'Unknown',
          productName: item.product ?? 'Product',
          quantity: item.buyerRequiredQuantity ?? 0,
          expectedPrice: item.buyerExpectedPrice ?? 0,
          price: item.merchantPrice ?? 0,
          availableQty: item.merchantAvailableQuantity ?? 0,
          status: item.status ?? 'Confirmed',
        }));
        if (mounted) setApiOrders(mapped);
      } catch (e: any) {
        if (mounted) setLoadError(e?.message || 'Failed to load confirmed quotes');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false }; 
  }, []);

  // Derive dynamic filter options from API data
  const productOptions = useMemo(() => {
    const set = new Set<string>();
    apiOrders.forEach(o => { if (o.productName) set.add(String(o.productName)); });
    return ["all", ...Array.from(set).sort()];
  }, [apiOrders]);

  const statusOptions = useMemo(() => {
    const set = new Set<string>();
    apiOrders.forEach(o => { if (o.status) set.add(String(o.status).toLowerCase()); });
    return ["all", ...Array.from(set).sort()];
  }, [apiOrders]);

  // Sort confirmed orders
  const sortOrders = (orders: typeof apiOrders) => {
    if (!sortField) return orders;

    return [...orders].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle different data types
      if (sortField === 'deliveryDeadline') {
        aValue = aValue ? new Date(aValue).getTime() : 0;
        bValue = bValue ? new Date(bValue).getTime() : 0;
      } else if (sortField === 'quantity' || sortField === 'price' || sortField === 'expectedPrice') {
        // Extract numeric value from quantity/price strings if needed
        aValue = typeof aValue === 'string' ? parseFloat(aValue.replace(/[^0-9.]/g, '')) || 0 : aValue || 0;
        bValue = typeof bValue === 'string' ? parseFloat(bValue.replace(/[^0-9.]/g, '')) || 0 : bValue || 0;
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue?.toLowerCase?.() || '';
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // Filter confirmed orders
  const filteredOrders = useMemo(() => {
    const filtered = apiOrders.filter(order => {
      const matchesSearch = filters.search
        ? [order.customerName, order.productName]
            .map(v => String(v || '').toLowerCase())
            .some(v => v.includes(filters.search.toLowerCase()))
        : true;

      const matchesProduct = filters.product !== 'all'
        ? String(order.productName || '').toLowerCase() === String(filters.product).toLowerCase()
        : true;

      const matchesStatus = filters.status !== 'all'
        ? String(order.status || '').toLowerCase() === String(filters.status).toLowerCase()
        : true;

      return matchesSearch && matchesProduct && matchesStatus;
    });
    
    return sortOrders(filtered);
  }, [apiOrders, filters, sortField, sortDirection]);

  // Reset pagination when filters or sorting change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sortField, sortDirection, pageSize]);

  const totalPages = Math.ceil(filteredOrders.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredOrders.length);
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  const handleSort = (field: string) => {
    if (sortField === field) {
      // Toggle direction if clicking the same field
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Reset to first page when sorting changes
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return <ArrowUpDown className="ml-1 h-3 w-3 inline" />;
    return sortDirection === 'asc' ? 
      <ArrowUp className="ml-1 h-3 w-3 inline" /> : 
      <ArrowDown className="ml-1 h-3 w-3 inline" />;
  };

  return (
    <div className="merchant-theme p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary">Confirmed Enquiries</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-2">
            View all confirmed enquiries from buyers
          </p>
        </div>
        <Button
          aria-label="Toggle filters"
          variant="outline"
          size="sm"
          onClick={() => setFilterOpen(prev => !prev)}
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Filters (All screens - shown only when toggled) */}
      {filterOpen && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-xs sm:text-sm font-medium mb-2 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search Buyer, product..."
                    className="pl-8 border-input focus:ring-ring"
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs sm:text-sm font-medium mb-2 block">Product</label>
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
                        {opt === 'all' ? 'All' : opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs sm:text-sm font-medium mb-2 block">Status</label>
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
                        {opt === 'all' ? 'All' : opt.charAt(0).toUpperCase() + opt.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mobile/Tablet Card List */}
      <div className="space-y-3 lg:hidden">
        {paginatedOrders.map((order) => (
          <Card key={order.id} className="shadow-sm">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm sm:text-base font-semibold text-primary">{order.productName}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Buyer: {order.customerName}</div>
                </div>
                <Badge className="bg-green-100 text-green-800">Confirmed</Badge>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[11px] sm:text-xs text-muted-foreground">Required Qty</div>
                  <div className="text-sm sm:text-base font-medium">{order.quantity || 'N/A'} kg</div>
                </div>
                <div>
                  <div className="text-[11px] sm:text-xs text-muted-foreground">Available Qty</div>
                  <div className="text-sm sm:text-base font-medium">{order.availableQty} kg</div>
                </div>
                <div>
                  <div className="text-[11px] sm:text-xs text-muted-foreground">Expected Price</div>
                  <div className="text-sm sm:text-base">₹{order.expectedPrice}/kg</div>
                </div>
                <div>
                  <div className="text-[11px] sm:text-xs text-muted-foreground">Your Price</div>
                  <div className="text-sm sm:text-base font-semibold text-primary">₹ {order.price}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredOrders.length === 0 && (
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-muted-foreground">
                <Package className="mx-auto h-12 w-12 mb-2" />
                No confirmed enquiries found.
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Confirmed Orders Table (Desktop only) */}
      <Card className="hidden lg:block">
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => handleSort('customerName')}
                >
                  Buyer Name <SortIcon field="customerName" />
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => handleSort('productName')}
                >
                  Product <SortIcon field="productName" />
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => handleSort('quantity')}
                >
                  Required Qty (kg) <SortIcon field="quantity" />
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => handleSort('expectedPrice')}
                >
                  Expected Price <SortIcon field="expectedPrice" />
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => handleSort('price')}
                >
                  Your Price <SortIcon field="price" />
                </TableHead>
                <TableHead>Available Qty (kg)</TableHead>
                <TableHead>Status</TableHead>
                {/* <TableHead>Actions</TableHead> */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.customerName}</TableCell>
                  <TableCell>{order.productName}</TableCell>
                  <TableCell>{order.quantity || 'N/A'}</TableCell>
                  <TableCell>₹{order.expectedPrice}/kg</TableCell>
                  <TableCell className="font-semibold text-primary">₹ {order.price}</TableCell>
                  <TableCell>{order.availableQty}</TableCell>
                  <TableCell>
                    <Badge className="bg-green-100 text-green-800">
                      Confirmed
                    </Badge>
                  </TableCell>
                  {/* <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" title="View Details">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" title="Chat">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell> */}
                </TableRow>
              ))}
              {filteredOrders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                  <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                    No confirmed enquiries found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {/* Pagination (Desktop) */}
          {filteredOrders.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {endIndex} of {filteredOrders.length} orders
              </div>

              <div className="flex items-center space-x-4">
                <Select value={String(pageSize)} onValueChange={(value) => { setPageSize(Number(value)); setCurrentPage(1); }}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="Page size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                  </SelectContent>
                </Select>

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
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination (Mobile/Tablet) */}
      {filteredOrders.length > 0 && (
        <div className="lg:hidden flex items-center justify-between mt-2">
          <div className="text-xs sm:text-sm text-muted-foreground">
            Showing {startIndex + 1} to {endIndex} of {filteredOrders.length} orders
          </div>

          <div className="flex items-center space-x-2">
            <Select value={String(pageSize)} onValueChange={(value) => { setPageSize(Number(value)); setCurrentPage(1); }}>
              <SelectTrigger className="w-[84px] sm:w-[100px]">
                <SelectValue placeholder="Page size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                disabled={currentPage === 1}
              >
                Prev
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
        </div>
      )}
    </div>
  );
};

export default MerchantConfirmedOrders;