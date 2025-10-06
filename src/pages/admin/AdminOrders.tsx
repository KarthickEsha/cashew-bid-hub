import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useRequirements } from "@/hooks/useRequirements";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, Search } from "lucide-react";

const DEFAULT_PAGE_SIZE = 5;

const AdminOrders = () => {
  const { getRequirementsAsEnquiries } = useRequirements();

  const [query, setQuery] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(DEFAULT_PAGE_SIZE);
  const [showFilters, setShowFilters] = React.useState(false);

  const all = React.useMemo(() => getRequirementsAsEnquiries(), [getRequirementsAsEnquiries]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter((e: any) =>
      (e.customerName || '').toLowerCase().includes(q) ||
      (e.productName || '').toLowerCase().includes(q) ||
      (e.status || '').toLowerCase().includes(q) ||
      (e.city || '').toLowerCase().includes(q) ||
      (e.country || '').toLowerCase().includes(q)
    );
  }, [all, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * itemsPerPage;
  const end = Math.min(start + itemsPerPage, filtered.length);
  const paged = filtered.slice(start, end);

  const goPrev = () => {
    setPage(p => {
      const next = Math.max(1, p - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return next;
    });
  };
  const goNext = () => {
    setPage(p => {
      const next = Math.min(pageCount, p + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return next;
    });
  };
  React.useEffect(() => { setPage(1); }, [query, itemsPerPage]);

  const formatCurrency = (val: number) => `₹${(val || 0).toLocaleString()}`;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Requirements</CardTitle>
            <Button variant="outline" size="icon" onClick={() => setShowFilters(!showFilters)}>
              <Filter size={18} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters Panel (toggle like Buyers) */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Search</label>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search buyer, product, status..."
                    className="pl-10"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Expected Price</TableHead>
                  <TableHead>Fixed Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Delivery Deadline</TableHead>
                  <TableHead>Location</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">No requirements found.</TableCell>
                  </TableRow>
                ) : (
                  paged.map((e: any) => (
                    <TableRow key={e.id}>
                      <TableCell className="font-medium">{e.customerName}</TableCell>
                      <TableCell>{e.productName}</TableCell>
                      <TableCell>{e.quantity}</TableCell>
                      <TableCell>{formatCurrency(e.expectedPrice)}</TableCell>
                      <TableCell>{formatCurrency(e.fixedPrice)}</TableCell>
                      <TableCell className="capitalize">{e.status}</TableCell>
                      <TableCell>{e.deliveryDeadline || '—'}</TableCell>
                      <TableCell>{[e.city, e.country].filter(Boolean).join(', ') || '—'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between text-sm">
            <div>
              Showing {paged.length > 0 ? start + 1 : 0} to {end} of {filtered.length} orders
            </div>
            <div className="flex items-center space-x-4">
              {/* Page Size Selector */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Show:</span>
                <Select
                  value={String(itemsPerPage)}
                  onValueChange={(value) => {
                    setItemsPerPage(Number(value));
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-[80px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Prev/Next Buttons */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goPrev}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="px-2">Page {currentPage} of {pageCount}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goNext}
                  disabled={currentPage >= pageCount}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOrders;