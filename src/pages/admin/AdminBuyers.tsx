import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProfile } from "@/hooks/useProfile";
import { useRole as useRoleStore } from "@/hooks/useRole";
import React, { useMemo, useState } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown, Package, Filter, Search, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

type BuyerRow = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
};

const DEFAULT_PAGE_SIZE = 5;

const AdminBuyers = () => {
  const { profile } = useProfile();
  const { role } = useRoleStore();
  const effectiveRole = role || profile?.role;
  const navigate = useNavigate();

  // Build buyers dataset based on role
  const allBuyers: BuyerRow[] = useMemo(() => {
    if (effectiveRole === 'buyer' || effectiveRole === 'both') {
      return [
        {
          id: profile?.id || 'me',
          name: profile?.name || 'My Buyer Profile',
          email: profile?.email || 'N/A',
          phone: profile?.phone,
          location: `${profile?.city ?? ''}${profile?.city && (profile?.state || profile?.country) ? ', ' : ''}${profile?.state ?? ''}${profile?.state && profile?.country ? ', ' : ''}${profile?.country ?? ''}` || undefined,
        },
      ];
    }

    // For other roles, show empty list as requested
    return [];
  }, [effectiveRole, profile?.id, profile?.name, profile?.email, profile?.phone, profile?.city, profile?.state, profile?.country]);

  // Filter and pagination state
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [sortField, setSortField] = useState<keyof BuyerRow | "">("");
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  // Removed dialog state; navigating to details page instead

  const handleSort = (field: keyof BuyerRow) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: keyof BuyerRow) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4 text-muted-foreground opacity-50" />;
    return sortDirection === 'asc' ? (
      <ArrowUp className="h-4 w-4 text-primary" />
    ) : (
      <ArrowDown className="h-4 w-4 text-primary" />
    );
  };

  const SortableHeader = ({ field, children }: { field: keyof BuyerRow; children: React.ReactNode }) => (
    <TableHead
      className="cursor-pointer hover:bg-muted/50 select-none"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center justify-between">
        {children}
        {getSortIcon(field)}
      </div>
    </TableHead>
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allBuyers;
    return allBuyers.filter(b =>
      (b.name || '').toLowerCase().includes(q) ||
      (b.email || '').toLowerCase().includes(q) ||
      (b.location || '').toLowerCase().includes(q)
    );
  }, [allBuyers, query]);

  const sorted = useMemo(() => {
    if (!sortField) return filtered;
    const list = [...filtered].sort((a, b) => {
      const av = (a[sortField] || '').toString().toLowerCase();
      const bv = (b[sortField] || '').toString().toLowerCase();
      if (av < bv) return sortDirection === 'asc' ? -1 : 1;
      if (av > bv) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [filtered, sortField, sortDirection]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * pageSize;
  const end = Math.min(start + pageSize, sorted.length);
  const paged = sorted.slice(start, end);

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

  // Reset to first page when query, sort, or page size changes
  React.useEffect(() => { setPage(1); }, [query, sortField, sortDirection, pageSize]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Buyer's List</CardTitle>
            <Button variant="outline" size="icon" onClick={() => setShowFilters(!showFilters)}>
              <Filter size={18} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters Panel (toggle like Marketplace) */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Search</label>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search name..."
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
                  <SortableHeader field="name">Name</SortableHeader>
                  <SortableHeader field="email">Email</SortableHeader>
                  <SortableHeader field="phone">Phone</SortableHeader>
                  <SortableHeader field="location">Location</SortableHeader>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                      <div className="text-center py-8">
                        <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                        No buyers found for selected filters.
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paged.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-medium">{b.name}</TableCell>
                      <TableCell>{b.email}</TableCell>
                      <TableCell>{b.phone || '—'}</TableCell>
                      <TableCell>{b.location || '—'}</TableCell>
                      <TableCell className="w-16">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            navigate(`/admin/buyers/${b.id}` , { state: { buyer: b } });
                          }}
                          aria-label={`View buyer ${b.name}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination (Marketplace style numbers) */}
          <div className="flex items-center justify-between mt-2 text-sm">
            <div className="text-muted-foreground">
              Showing {paged.length > 0 ? start + 1 : 0} to {end} of {sorted.length} buyers
            </div>
            <div className="flex items-center gap-4">
              {/* Page Size Selector */}
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Show:</span>
                <Select
                  value={String(pageSize)}
                  onValueChange={(v) => {
                    setPageSize(Number(v));
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
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={goPrev} disabled={currentPage === 1}>
                  Previous
                </Button>
                <span className="px-2">Page {currentPage} of {pageCount}</span>
                <Button variant="outline" size="sm" onClick={goNext} disabled={currentPage >= pageCount}>
                  Next
                </Button>
              </div>
            </div>
          </div>

          {/* Dialog removed; details are shown in AdminBuyerDetails screen */}

        </CardContent>
      </Card>
    </div>
  );
};

export default AdminBuyers;