import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
 
import { useProfile } from "@/hooks/useProfile";
import { useRole as useRoleStore } from "@/hooks/useRole";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ArrowUp, ArrowDown, Package, Filter, Search, Eye } from "lucide-react";
 

const AdminMerchants = () => {
  const { profile } = useProfile();
  const { role } = useRoleStore();
  const effectiveRole = role || profile?.role;
  const navigate = useNavigate();

  // Build data based on user profile
  const rows = (() => {
    if (effectiveRole === 'processor' || effectiveRole === 'both') {
      // Show only the current user's merchant row
      return [
        {
          id: profile?.id || 'me',
          name: profile?.companyName || profile?.name || 'My Merchant Profile',
          email: profile?.officeEmail || profile?.email || 'N/A',
          phone: profile?.phone || 'N/A',
          location: `${profile?.city ?? ''}${profile?.city && (profile?.state || profile?.country) ? ', ' : ''}${profile?.state ?? ''}${profile?.state && profile?.country ? ', ' : ''}${profile?.country ?? ''}` || 'N/A',
          verified: true,
        },
      ];
    }
    // For other roles, show empty list as requested
    return [];
  })();

  // Local data state (enables deletion)
  const [data, setData] = React.useState(rows);
  React.useEffect(() => {
    setData(rows);
  }, [rows]);

  // View state removed; using full-screen route instead

  // Filter, sort & pagination state
  const [query, setQuery] = React.useState("");
  const [showFilters, setShowFilters] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(10);
  const [sortField, setSortField] = React.useState<'name' | 'email' | 'phone' | 'location' | 'status' | ''>('');
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter(r =>
      (r.name || '').toLowerCase().includes(q) ||
      (r.email || '').toLowerCase().includes(q) ||
      (r.phone || '').toLowerCase().includes(q) ||
      (r.location || '').toLowerCase().includes(q) ||
      (r.verified ? 'verified' : 'unverified').includes(q)
    );
  }, [data, query]);

  const handleSort = (field: 'name' | 'email' | 'phone' | 'location' | 'status') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: 'name' | 'email' | 'phone' | 'location' | 'status') => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4 text-muted-foreground opacity-50" />;
    return sortDirection === 'asc' ? (
      <ArrowUp className="h-4 w-4 text-primary" />
    ) : (
      <ArrowDown className="h-4 w-4 text-primary" />
    );
  };

  const SortableHeader = ({ field, children }: { field: 'name' | 'email' | 'phone' | 'location' | 'status'; children: React.ReactNode }) => (
    <TableHead className="cursor-pointer hover:bg-muted/50 select-none" onClick={() => handleSort(field)}>
      <div className="flex items-center justify-between">
        {children}
        {getSortIcon(field)}
      </div>
    </TableHead>
  );

  const sorted = React.useMemo(() => {
    if (!sortField) return filtered;
    const list = [...filtered].sort((a: any, b: any) => {
      const av = (sortField === 'status' ? (a.verified ? 'verified' : 'unverified') : (a[sortField] || '')).toString().toLowerCase();
      const bv = (sortField === 'status' ? (b.verified ? 'verified' : 'unverified') : (b[sortField] || '')).toString().toLowerCase();
      if (av < bv) return sortDirection === 'asc' ? -1 : 1;
      if (av > bv) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [filtered, sortField, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const start = (safeCurrentPage - 1) * itemsPerPage;
  const end = Math.min(start + itemsPerPage, sorted.length);
  const paged = sorted.slice(start, end);

  const goPrev = () => {
    const prev = Math.max(1, currentPage - 1);
    setCurrentPage(prev);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const goNext = () => {
    const next = Math.min(totalPages, currentPage + 1);
    setCurrentPage(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  React.useEffect(() => { setCurrentPage(1); }, [query, sortField, sortDirection, itemsPerPage]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Merchant's List</CardTitle>
            <Button variant="outline" size="icon" onClick={() => setShowFilters(!showFilters)}>
              <Filter size={18} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 overflow-x-auto">
          {/* Filters Panel */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Search</label>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Filter by company name..."
                    className="pl-10"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <SortableHeader field="name">Company Name</SortableHeader>
                <SortableHeader field="email">Email</SortableHeader>
                <SortableHeader field="phone">Phone</SortableHeader>
                <SortableHeader field="location">Location</SortableHeader>
                <SortableHeader field="status">Status</SortableHeader>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    <div className="text-center py-8">
                      <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                      No merchants found for selected filters.
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paged.map(row => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>{row.phone}</TableCell>
                    <TableCell>{row.location}</TableCell>
                    <TableCell className="capitalize">{row.verified ? 'Verified' : 'Unverified'}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="View"
                          onClick={() => navigate(`/admin/merchants/${row.id}`, { state: { merchant: row } })}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Full-screen view replaces the previous dialog */}

          {/* Pagination */}
          <div className="flex items-center justify-between text-sm">
            <div>
              Showing {paged.length > 0 ? start + 1 : 0} to {end} of {sorted.length} merchants
            </div>
            <div className="flex items-center space-x-4">
              {/* Page Size Selector */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Show:</span>
                <Select
                  value={String(itemsPerPage)}
                  onValueChange={(value) => {
                    setItemsPerPage(Number(value));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-[80px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">5</SelectItem>
                    <SelectItem value="20">10</SelectItem>
                    <SelectItem value="50">20</SelectItem>
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
                  disabled={safeCurrentPage === 1}
                >
                  Previous
                </Button>
                <span className="px-2">Page {safeCurrentPage} of {totalPages}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goNext}
                  disabled={safeCurrentPage >= totalPages}
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

export default AdminMerchants;