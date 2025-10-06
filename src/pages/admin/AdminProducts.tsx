import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useInventory } from "@/hooks/useInventory";
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

const AdminProducts = () => {
  const { products } = useInventory();

  const [query, setQuery] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(DEFAULT_PAGE_SIZE);
  const [showFilters, setShowFilters] = React.useState(false);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(p =>
      (p.name || '').toLowerCase().includes(q) ||
      (p.type || '').toLowerCase().includes(q) ||
      (typeof p.location === 'string' ? p.location : '')?.toLowerCase().includes(q)
    );
  }, [products, query]);

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
  const formatWithCommas = (val: any) => {
    if (val === null || val === undefined) return "0";
    const num = typeof val === 'number' ? val : parseInt(String(val).replace(/,/g, ''), 10);
    if (isNaN(num)) return String(val);
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Product List</CardTitle>
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
                    placeholder="Search name, type..."
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
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">No products found.</TableCell>
                  </TableRow>
                ) : (
                  paged.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.grade ?? 'Raw Cashew'}</TableCell>
                      <TableCell>{p.type}</TableCell>
                      <TableCell>{formatWithCommas(p.availableQty)} Kg</TableCell>
                      <TableCell>{typeof p.price === 'number' ? `₹${p.price.toLocaleString()}` : p.price}</TableCell>
                      <TableCell className="capitalize">{p.status}</TableCell>
                      <TableCell>{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '—'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between text-sm">
            <div>
              Showing {paged.length > 0 ? start + 1 : 0} to {end} of {filtered.length} products
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

export default AdminProducts;