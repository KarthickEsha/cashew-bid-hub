import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  MapPin,
  DollarSign,
  Search,
  Eye,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  AlertTriangle,
  Plus,
  Inbox,
  Filter,
  List,
  Grid3X3,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useRequirements } from "@/hooks/useRequirements";
import { useResponses } from "@/hooks/useResponses";

const MyRequirements = () => {
  const { getMyRequirements, deleteRequirement, fetchAllRequirements } = useRequirements();
  // Subscribe to store requirements so derived list recomputes on updates
  const storeRequirements = useRequirements((s: any) => s.requirements);
  const { getResponseCount } = useResponses();
  const lastFetched = useResponses((s: any) => s.lastFetched);
  const { ensureLoaded } = useResponses.getState();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [filteredRequirements, setFilteredRequirements] = useState<any[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('list');
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>({ key: 'statusPriority', direction: 'desc' });
  // Track locally deleted ids so UI updates immediately post-delete
  const [deletedIds, setDeletedIds] = useState<Set<number>>(new Set());

  // Load from API on mount, then get requirements from the hook
  useEffect(() => {
    fetchAllRequirements?.().catch((e) => console.error('Failed loading requirements:', e));
    ensureLoaded?.(true).catch((e: any) => console.error('Failed loading responses:', e));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const requirements = useMemo(() => getMyRequirements(), [storeRequirements, lastFetched]);

  // Dynamic filter options derived from data
  const statusOptions = useMemo(() => {
    const set = new Set<string>();
    requirements.forEach((r: any) => {
      if (r?.status) set.add(String(r.status));
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [requirements]);

  const gradeOptions = useMemo(() => {
    const set = new Set<string>();
    requirements.forEach((r: any) => {
      if (r?.grade) set.add(String(r.grade));
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [requirements]);

  // Delete popup state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const getStatusIcon = (status: string) => {
    return status.toLowerCase() === 'confirmed'
      ? <CheckCircle size={16} className="text-green-500" />
      : <Clock size={16} className="text-blue-500" />;
  };

  const getStatusColor = (status: string) => {
    return status.toLowerCase() === 'confirmed'
      ? "bg-green-100 text-green-800"
      : "bg-blue-100 text-blue-800";
  };

  const getDisplayStatus = (status: string) => {
    return status.toLowerCase() === 'closed' ? 'Closed' : 'Active';
  };

  // Status priority: Active > Draft > Confirmed > Closed (customize as needed)
  const getStatusPriority = (status: string) => {
    const s = status?.toLowerCase();
    if (s === 'active') return 7;
    if (s === 'selected') return 5;
    if (s === 'viewed') return 4;
    if (s === 'responded') return 3;
    if (s === 'draft') return 2;
    if (s === 'confirmed') return 1;
    if (s === 'closed') return 0;
    return -1;
  };

  // Apply filter and sorting, prioritizing processing count when selected
  const applyFilters = () => {
    let temp = [...requirements];

    // Exclude locally deleted items (optimistic UI update)
    if (deletedIds.size > 0) {
      temp = temp.filter((req) => !deletedIds.has(Number(req.id)));
    }

    // Apply filters
    if (searchTerm) {
      temp = temp.filter((req) =>
        req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (req.description && req.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    if (statusFilter !== "all") {
      temp = temp.filter((req) => req.status === statusFilter);
    }
    if (gradeFilter !== "all") {
      temp = temp.filter((req) => req.grade === gradeFilter);
    }

    // Apply sorting
    if (sortConfig !== null) {
      temp.sort((a, b) => {
        let aValue: any = a[sortConfig.key as keyof typeof a];
        let bValue: any = b[sortConfig.key as keyof typeof b];

        // Handle date sorting
        if (sortConfig.key === 'createdAt' || sortConfig.key === 'lastModified' || sortConfig.key === 'requirementExpiry') {
          aValue = new Date(aValue as string).getTime();
          bValue = new Date(bValue as string).getTime();
        }
        // Handle numeric sorting
        else if (sortConfig.key === 'quantity') {
          aValue = parseFloat(aValue as string) || 0;
          bValue = parseFloat(bValue as string) || 0;
        }
        // Handle price range sorting (extract first number from string like "$1,000 - $1,200")
        else if (sortConfig.key === 'priceRange') {
          const extractNumber = (str: string) => {
            if (!str) return 0;
            const match = str.match(/\$([\d,]+)/);
            return match ? parseFloat(match[1].replace(/,/g, '')) : 0;
          };
          aValue = extractNumber(a.budgetRange || '');
          bValue = extractNumber(b.budgetRange || '');
        }
        // Status priority: place Active first
        else if (sortConfig.key === 'statusPriority' || sortConfig.key === 'status') {
          aValue = getStatusPriority(a.status);
          bValue = getStatusPriority(b.status);
        } else {
          // Fallback: string compare
          if (typeof aValue === 'string') aValue = aValue.toLowerCase();
          if (typeof bValue === 'string') bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredRequirements(temp);
  }

  // Format a numeric value with commas for display (e.g., 1000 -> 1,000)
  const formatWithCommas = (val: any) => {
    if (val === null || val === undefined) return "0";
    const num = typeof val === 'number' ? val : parseInt(String(val).replace(/,/g, ''), 10);
    if (isNaN(num)) return String(val);
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  // Safely format a date (string or Date) without timezone shifts
  // Prefer formatting date-only strings (yyyy-MM-dd) directly to dd-MM-yyyy
  const formatDateSafe = (input: any) => {
    if (!input) return '-';
    try {
      const str = String(input);
      // If we have an ISO or date-like string, take the date part
      const datePart = str.length >= 10 ? str.slice(0, 10) : str;
      const parts = datePart.split('-');
      if (parts.length === 3) {
        const [y, m, d] = parts;
        if (y.length === 4) {
          return `${d.padStart(2, '0')}-${m.padStart(2, '0')}-${y}`;
        }
      }
      // Fallback to locale formatting
      const d = new Date(str);
      if (!isNaN(d.getTime())) return d.toLocaleDateString();
      return '-';
    } catch {
      return '-';
    }
  };

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  }

  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown className="ml-1 h-3 w-3" />;
    }
    return sortConfig.direction === 'asc'
      ? <ArrowUp className="ml-1 h-3 w-3" />
      : <ArrowDown className="ml-1 h-3 w-3" />;
  }

  // Run filters automatically when dependencies change
  useEffect(() => {
    applyFilters();
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [requirements, searchTerm, statusFilter, gradeFilter, sortConfig, lastFetched, deletedIds]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredRequirements.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredRequirements.length);
  const currentRequirements = filteredRequirements.slice(startIndex, endIndex);

  // Handle delete confirm
  const handleDelete = async () => {
  if (deleteId !== null) {
    try {
      // Just call deleteRequirement, it will update the store
      await deleteRequirement(deleteId.toString());
    } catch (e) {
      console.error('Delete failed:', e);
      // Re-fetch requirements to restore the correct state
      await fetchAllRequirements();
    } finally {
      setDeleteId(null);
      setDeleteOpen(false);
    }
  }
};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1 md:mb-2">
            My Requirements
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Manage your posted requirements and track responses
          </p>
        </div>
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <div className="hidden lg:flex items-center space-x-1 bg-muted p-1 rounded-md">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
              <span className="sr-only">List View</span>
            </Button>
            <Button
              variant={viewMode === 'card' ? 'default' : 'ghost'}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setViewMode('card')}
            >
              <Grid3X3 className="h-4 w-4" />
              <span className="sr-only">Card View</span>
            </Button>
          </div>
          <Button
            variant="outline"
            size="lg"
            onClick={() => setFilterOpen(!filterOpen)}
            className="h-10 w-10 p-0 flex items-center justify-center"
          >
            <Filter size={18} />
          </Button>
          <Link to="/post-requirement">
            <Button size="lg">
              <Plus size={16} className="mr-2" /> Post New Requirement
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      {filterOpen && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filter Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search requirements..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {String(status).charAt(0).toUpperCase() + String(status).slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Grade</label>
                <Select value={gradeFilter} onValueChange={setGradeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Grades</SelectItem>
                    {gradeOptions.map((grade) => (
                      <SelectItem key={grade} value={grade}>
                        {grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mobile/Tablet: Card-only view */}
      <div className="block lg:hidden">
        {filteredRequirements.length === 0 ? (
          <Card className="p-10 text-center">
            <Inbox className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-lg font-medium">No data found for the selected filters</p>
            <p className="text-sm text-muted-foreground mt-1">Try changing your search or filter options</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {currentRequirements.map((requirement) => (
              <Card
                key={requirement.id}
                className="hover:shadow-warm transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <CardTitle className="text-lg">{requirement.title}</CardTitle>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(requirement.status)}
                          <Badge className={getStatusColor(requirement.status)}>
                            {getDisplayStatus(requirement.status)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Grade:</span>
                      <div className="font-semibold">{requirement.grade}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Quantity:</span>
                      <div className="font-semibold">{requirement.quantity} kg</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Origin:</span>
                      <div className="font-semibold">
                        {requirement.preferredOrigin
                          ? requirement.preferredOrigin.charAt(0).toUpperCase() + requirement.preferredOrigin.slice(1).toLowerCase()
                          : ""}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Responses:</span>
                      <div className="font-semibold text-primary">{getResponseCount(requirement.id.toString())}</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <DollarSign size={14} className="mr-1 text-muted-foreground" />
                      <span className="font-medium">{requirement.budgetRange}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin size={14} className="mr-1" />
                      {requirement.deliveryLocation}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar size={14} className="mr-1" />
                      Expires: {formatDateSafe(requirement.requirementExpiry)}
                    </div>
                  </div>
                  <div className="pt-3 border-t border-border">
                    <div className="flex justify-between items-center text-xs text-muted-foreground mb-3">
                      <span>Created: {new Date(requirement.createdDate).toLocaleDateString()}</span>
                      <span>Modified: {new Date(requirement.lastModified).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <div className="relative inline-block">
                        <Link to={`/requirement/${requirement.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye size={14} className="mr-2" /> View
                          </Button>
                        </Link>
                        {(() => {
                          const totalCount = getResponseCount(requirement.id.toString());
                          return totalCount > 0 ? (
                            <span className="absolute -top-1 -right-1 inline-flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] h-4 min-w-4 px-1 leading-none">
                              {totalCount}
                            </span>
                          ) : null;
                        })()}
                      </div>
                      <Link to={`/edit-requirement/${requirement.id}`}>
                        <Button variant="outline" size="sm">
                          <Edit size={14} className="mr-2" /> Edit
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => {
                          setDeleteId(requirement.id);
                          setDeleteOpen(true);
                        }}
                      >
                        <Trash2 size={14} className="mr-2" /> Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Desktop/Laptop: existing toggle between Table and Cards */}
      <div className="hidden lg:block">
      {viewMode === 'list' ? (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => requestSort('title')}
                >
                  <div className="flex items-center">
                    Requirement
                    {getSortIcon('title')}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => requestSort('grade')}
                >
                  <div className="flex items-center">
                    Grade
                    {getSortIcon('grade')}
                  </div>
                </TableHead>
                {/* <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => requestSort('deliveryLocation')}
                >
                  <div className="flex items-center">
                    Location
                    {getSortIcon('deliveryLocation')}
                  </div>
                </TableHead> */}
                <TableHead
                  className="text-right cursor-pointer hover:bg-muted/50"
                  onClick={() => requestSort('quantity')}
                >
                  <div className="flex items-center justify-end">
                    Quantity
                    {getSortIcon('quantity')}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => requestSort('priceRange')}
                >
                  <div className="flex items-center">
                    Price
                    {getSortIcon('priceRange')}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => requestSort('statusPriority')}
                >
                  <div className="flex items-center">
                    Status
                    {getSortIcon('statusPriority')}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => requestSort('requirementExpiry')}
                >
                  <div className="flex items-center">
                    Delivery Date
                    {getSortIcon('requirementExpiry')}
                  </div>
                </TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequirements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center py-6">
                      <Inbox className="h-10 w-10 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">
                        {searchTerm || statusFilter !== "all" || gradeFilter !== "all"
                          ? 'No requirements match your current filters.'
                          : 'You haven\'t created any requirements yet'}
                      </p>
                      <Link to="/post-requirement" className="mt-4">
                        <Button size="sm">
                          <Plus className="mr-2 h-4 w-4" />
                          Create Requirement
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                currentRequirements.map((requirement) => (
                  <TableRow key={requirement.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{requirement.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {requirement.description?.substring(0, 50)}{requirement.description?.length > 50 ? '...' : ''}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{requirement.grade || 'N/A'}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatWithCommas(requirement.quantity)} kg
                    </TableCell>
                    <TableCell>
                      {requirement.budgetRange || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(requirement.status)}>
                        {getDisplayStatus(requirement.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatDateSafe(requirement.requirementExpiry)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <div className="relative">
                          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                            <Link to={`/requirement/${requirement.id}`}>
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View</span>
                            </Link>
                          </Button>
                          {(() => {
                            const totalCount = getResponseCount(requirement.id.toString());
                            return totalCount > 0 ? (
                              <span className="absolute -top-1 -right-1 inline-flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] h-4 min-w-4 px-1 leading-none">
                                {totalCount}
                              </span>
                            ) : null;
                          })()}
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                          <Link to={`/edit-requirement/${requirement.id}`}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            setDeleteId(requirement.id);
                            setDeleteOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination removed from table view as per requirements */}
        </Card>
      ) : filteredRequirements.length === 0 ? (
        <Card className="p-10 text-center">
          <Inbox className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-lg font-medium">
            No data found for the selected filters
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Try changing your search or filter options
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {currentRequirements.map((requirement) => (
            <Card
              key={requirement.id}
              className="hover:shadow-warm transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <CardTitle className="text-lg">
                        {requirement.title}
                      </CardTitle>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(requirement.status)}
                        <Badge className={getStatusColor(requirement.status)}>
                          {getDisplayStatus(requirement.status)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Grade:</span>
                    <div className="font-semibold">{requirement.grade}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Quantity:</span>
                    <div className="font-semibold">{requirement.quantity} kg</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Origin:</span>
                    <div className="font-semibold">
                      {requirement.preferredOrigin
                        ? requirement.preferredOrigin.charAt(0).toUpperCase() + requirement.preferredOrigin.slice(1).toLowerCase()
                        : ""}
                    </div>
                  </div>

                  <div>
                    <span className="text-muted-foreground">Responses:</span>
                    <div className="font-semibold text-primary">
                      {getResponseCount(requirement.id.toString())}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <DollarSign
                      size={14}
                      className="mr-1 text-muted-foreground"
                    />
                    <span className="font-medium">
                      {requirement.budgetRange}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin size={14} className="mr-1" />
                    {requirement.deliveryLocation}
                  </div>
                  {/* <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar size={14} className="mr-1" />
                    Delivery:{" "}
                    {new Date(requirement.deliveryDeadline).toLocaleDateString()}
                  </div> */}
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar size={14} className="mr-1" />
                    Expires: {formatDateSafe(requirement.requirementExpiry)}
                  </div>
                </div>
                <div className="pt-3 border-t border-border">
                  <div className="flex justify-between items-center text-xs text-muted-foreground mb-3">
                    <span>
                      Created:{" "}
                      {new Date(requirement.createdDate).toLocaleDateString()}
                    </span>
                    <span>
                      Modified:{" "}
                      {new Date(requirement.lastModified).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <div className="relative inline-block">
                      <Link to={`/requirement/${requirement.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye size={14} className="mr-2" /> View
                        </Button>
                      </Link>
                      {(() => {
                        const totalCount = getResponseCount(requirement.id.toString());
                        return totalCount > 0 ? (
                          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] h-4 min-w-4 px-1 leading-none">
                            {totalCount}
                          </span>
                        ) : null;
                      })()}
                    </div>
                    <Link to={`/edit-requirement/${requirement.id}`}>
                      <Button variant="outline" size="sm">
                        <Edit size={14} className="mr-2" /> Edit
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => {
                        setDeleteId(requirement.id);
                        setDeleteOpen(true);
                      }}
                    >
                      <Trash2 size={14} className="mr-2" /> Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      </div>

      {/* Pagination */}
      {filteredRequirements.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {" "}
            {Math.min(startIndex + itemsPerPage, filteredRequirements.length)} of {" "}
            {filteredRequirements.length} requirements
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
                  <SelectItem value="6">6</SelectItem>
                  <SelectItem value="12">12</SelectItem>
                  <SelectItem value="24">24</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Prev/Next Buttons */}
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const prevPage = Math.max(1, currentPage - 1);
                  setCurrentPage(prevPage);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const nextPage = Math.min(totalPages, currentPage + 1);
                  setCurrentPage(nextPage);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={currentPage >= totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation popup */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Requirement</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this requirement? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyRequirements;