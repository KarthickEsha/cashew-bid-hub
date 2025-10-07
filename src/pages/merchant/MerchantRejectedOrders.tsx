import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Eye, MessageSquare, Search, Filter, Package, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRequirements } from "@/hooks/useRequirements";
import { useResponses } from "@/hooks/useResponses";
import { useProfile } from "@/hooks/useProfile";

const MerchantRejectedOrders = () => {
  const { getRequirementsAsEnquiries } = useRequirements();
  const { responses } = useResponses();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const { profile, setProfile } = useProfile();
  const [searchFilter, setSearchFilter] = useState('');
  const [tempSearchFilter, setTempSearchFilter] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Get rejected orders (responses with rejected status)
  const rejectedOrders = useMemo(() => {

    const enquiries = getRequirementsAsEnquiries();
    return responses
      .filter(response => response.status === 'rejected')
      .map(response => {
        const enquiry = enquiries.find(e => e.id.toString() === response.requirementId);
        return {
          ...response,
          enquiry,
          customerName: enquiry?.customerName || profile.name ||  'Unknown',
          productName: enquiry?.productName || response.productName ||  'Unknown Product',
          expectedPrice: enquiry?.expectedPrice || response.price ||  0,
          deliveryDeadline: enquiry?.deliveryDeadline || '',
        };
      });
  }, [responses, getRequirementsAsEnquiries]);

  // Sort rejected orders
  const sortOrders = (orders: typeof rejectedOrders) => {
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

  // Filter rejected orders
  const filteredOrders = useMemo(() => {
    const filtered = rejectedOrders.filter(order => 
      searchFilter === '' ||
      order.customerName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      order.productName.toLowerCase().includes(searchFilter.toLowerCase())
    );
    
    return sortOrders(filtered);
  }, [rejectedOrders, searchFilter, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredOrders.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredOrders.length);
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  const handleApplyFilters = () => {
    setSearchFilter(tempSearchFilter);
    setFilterOpen(false);
    setCurrentPage(1);
  };

  const handleCancelFilters = () => {
    setSearchFilter('');
    setTempSearchFilter('');
    setFilterOpen(false);
    setCurrentPage(1);
  };

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
    <div className="merchant-theme p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Rejected Orders</h1>
          <p className="text-muted-foreground mt-2">
            View all rejected orders from buyers
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setFilterOpen(prev => !prev)}>
          <Filter className="h-4 w-4 mr-2" />
          Filter Orders
        </Button>
      </div>

      {/* Filters */}
      {filterOpen && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search customer, product..."
                    className="pl-8 border-input focus:ring-ring"
                    value={tempSearchFilter}
                    onChange={(e) => setTempSearchFilter(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={handleCancelFilters}>Cancel</Button>
              <Button onClick={handleApplyFilters}>Apply</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rejected Orders Table */}
      <Card>
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
                  <TableCell>{order.enquiry?.quantity || order.quantity ||  'N/A'}</TableCell>
                  <TableCell>₹{order.expectedPrice}/kg</TableCell>
                  <TableCell className="font-semibold text-primary">₹{order.price}</TableCell>
                  <TableCell>{order.quantity}</TableCell>
                  <TableCell>
                    <Badge variant="destructive">
                      Rejected
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
                    No rejected orders found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
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
    </div>
  );
};

export default MerchantRejectedOrders;