import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Filter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  MapPin,
  Search,
  Eye,
  MessageCircle,
  User,
  Clock,
  CheckCircle,
  XCircle,
  Building,
  Inbox,
  Star,
  Calendar,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Trash2,
} from "lucide-react";
import { useResponses } from "@/hooks/useResponses";
import { useRequirements } from "@/hooks/useRequirements";
import { format, parseISO } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useProfile } from "@/hooks/useProfile";
import { apiFetch } from "@/lib/api";
import { extractBackendUserId } from "@/lib/profile";
import { useRole } from "@/hooks/useRole";

type ResponseStatus = 'new' | 'viewed' | 'confirmed' | 'rejected' | 'skipped' | 'accepted';

interface Requirement {
  id: string;
  productName: string;
  grade: string;
  quantity: number;
  location: string;
  status: string;
  createdAt: string;
}

interface MerchantResponse {
  id: string;
  requirementId: string;
  merchantId: string;
  merchantName: string;
  merchantLocation: string;
  price: string;
  responseDate: string;
  status: ResponseStatus;
  grade: string;
  quantity: string;
  origin: string;
  certifications: string[];
  deliveryTime: string;
  productName: string;
  contact: string;
  message: string;
  remarks?: string;
  createdAt: string;
  productId?: string;
  stockId?: string;
}

interface ResponseWithDetails extends MerchantResponse {
  requirementTitle: string;
  merchantRating: number;
  isStarred: boolean;
}

const Responses = () => {
  const { t } = useTranslation();
  const { profile, setProfile } = useProfile();
  const role = useRole(state => state.role);

  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedResponse, setSelectedResponse] = useState<ResponseWithDetails | null>(null);
  const [responseToDelete, setResponseToDelete] = useState<{ id: string, name: string } | null>(null);
  const responses = useResponses(s => s.responses);
  const setResponses = useResponses(s => s.setResponses);
  const deleteFromStore = useResponses(s => s.deleteResponse);
  const { requirements, updateRequirement, updateRequirementStatus } = useRequirements();
  const [isLoading, setIsLoading] = useState(false);
  const [sortField, setSortField] = useState<string>('responseDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [apiResponses, setApiResponses] = useState<any[]>([]);

  // Filter states
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<ResponseStatus | 'all'>("all");
  const [gradeFilter, setGradeFilter] = useState<string | 'all'>("all");
  const [appliedFilters, setAppliedFilters] = useState({
    searchText: "",
    status: "all" as ResponseStatus | 'all',
    grade: "all" as string | 'all',
  });

  // Load quotes from backend
  useEffect(() => {
    setIsLoading(true);
    const effectiveRole = String(role || profile?.role || '').toLowerCase();
    const view = effectiveRole === 'buyer' ? 'buyer' : 'merchant';
    const userID = extractBackendUserId() || (profile as any)?.id || '';
    const params = new URLSearchParams({ view });
    if (userID) params.set('userID', userID);
    apiFetch(`/api/quotes/get-all-quotes?${params.toString()}`)
      .then((data) => {
        const arr = (data as any)?.data;
        const list = Array.isArray(arr) ? arr : [];
        setApiResponses(list);

        // Also sync with global store so sidebar badge reflects the same source
        const mapped = list.map((q: any) => {
          const createdAt = q?.createdAt || new Date().toISOString();
          const rawStatus = String(q?.status ?? 'new');
          const lowered = rawStatus.toLowerCase();
          const status = (lowered === 'confirmed' ? 'confirmed' : lowered);
          const req = requirements.find(r => r.id === q?.requirementId);
          const grade = (q?.grade ?? req?.grade ?? 'N/A') as string;
          return {
            id: q?.id || String(Date.now()),
            requirementId: q?.requirementId || '',
            merchantId: q?.merchantId || '',
            merchantName: q?.merchantCompanyName || 'Unknown',
            merchantLocation: q?.merchantAddress || '',
            price: String(q?.priceINR ?? ''),
            responseDate: createdAt,
            status: status as any,
            grade,
            quantity: String(q?.supplyQtyKg ?? ''),
            origin: '',
            certifications: [],
            deliveryTime: '',
            productName: '',
            contact: '',
            message: q?.remarks || '',
            remarks: q?.remarks,
            createdAt,
            productId: q?.productId || q?.product_id,
            stockId: q?.stockId || q?.stock_id,
          };
        });
        setResponses(mapped as any);
      })
      .catch((err) => {
        console.error("Failed to load quotes:", err);
      })
      .finally(() => setIsLoading(false));
  }, [role]);

  // Get requirement title by ID
  const getRequirementTitle = (requirementId: string) => {
    const requirement = requirements.find(req => req.id === requirementId);
    return requirement ? requirement.productName : 'Unknown Requirement';
  };

  // Get all merchant responses with details
  const getMerchantResponses = (): ResponseWithDetails[] => {
    return apiResponses.map((q: any) => {
      // Normalize backend status to our UI enum (lowercase). Backend may return
      // "Confirmed" | "Rejected" | "new" | ...
      const rawStatus = String(q?.status ?? 'new');
      const lowered = rawStatus.toLowerCase();
      const status = (lowered === 'confirmed' ? 'confirmed' : lowered) as ResponseStatus;
      const createdAt = q?.createdAt || new Date().toISOString();
      const req = requirements.find(r => r.id === q?.requirementId);
      const requirementTitle = 'Unknown Requirement';
      const grade = (q?.grade ?? req?.grade ?? 'N/A') as string;
      return {
        id: q?.id || String(Date.now()),
        requirementId: q?.requirementId || '',
        merchantId: q?.merchantId || '',
        merchantName: q?.merchantCompanyName || 'Unknown',
        merchantLocation: q?.merchantAddress || '',
        price: String(q?.priceINR ?? ''),
        responseDate: createdAt,
        status,
        grade,
        quantity: String(q?.supplyQtyKg ?? ''),
        origin: '',
        certifications: [],
        deliveryTime: '',
        productName: requirementTitle,
        contact: '',
        message: q?.remarks || '',
        remarks: q?.remarks,
        createdAt,
        requirementTitle,
        merchantRating: 4.5,
        isStarred: false,
      } as ResponseWithDetails;
    });
  };

  // Get responses with requirement details
  const responsesWithDetails = getMerchantResponses();

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      // Toggle sort direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Default to ascending sort when changing fields
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Get sort icon for a column
  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-1 h-4 w-4 text-muted-foreground opacity-50" />;
    }
    return sortDirection === 'asc'
      ? <ArrowUp className="ml-1 h-4 w-4 text-primary" />
      : <ArrowDown className="ml-1 h-4 w-4 text-primary" />;
  };

  // Build dynamic filter options from current data
  const availableStatuses: (ResponseStatus)[] = Array.from(
    new Set(
      getMerchantResponses()
        .map(r => r.status)
        .filter((s): s is ResponseStatus => !!s)
    )
  );
  const availableGrades: string[] = Array.from(
    new Set(
      getMerchantResponses()
        .map(r => r.grade)
        .filter((g): g is string => !!g && g !== 'N/A')
    )
  );

  // Filter and sort responses
  const filteredResponses = responsesWithDetails
    .filter(response => {
      // Handle search text matching
      const searchLower = appliedFilters.searchText.toLowerCase();
      const matchesSearch = appliedFilters.searchText === '' ||
        (response.merchantName?.toLowerCase().includes(searchLower) ||
          response.requirementTitle?.toLowerCase().includes(searchLower) ||
          response.grade?.toLowerCase().includes(searchLower) ||
          response.origin?.toLowerCase().includes(searchLower));

      // Handle status filtering
      const matchesStatus = appliedFilters.status === 'all' ||
        (response.status && response.status.toLowerCase() === appliedFilters.status.toLowerCase());

      // Handle grade filtering
      const matchesGrade = appliedFilters.grade === 'all' ||
        (response.grade && response.grade.toLowerCase() === String(appliedFilters.grade).toLowerCase());

      return matchesSearch && matchesStatus && matchesGrade;
    })
    .sort((a, b) => {
      if (!sortField) return 0;

      // Priority: when using default date sort, show 'new' status first
      if (sortField === 'responseDate') {
        const aIsNew = a.status?.toLowerCase() === 'new';
        const bIsNew = b.status?.toLowerCase() === 'new';
        if (aIsNew && !bIsNew) return -1;
        if (bIsNew && !aIsNew) return 1;
      }

      let aValue = a[sortField as keyof typeof a];
      let bValue = b[sortField as keyof typeof b];

      // Handle different data types
      if (sortField === 'responseDate' || sortField === 'createdAt') {
        aValue = new Date(aValue as string).getTime();
        bValue = new Date(bValue as string).getTime();
      } else if (sortField === 'price') {
        // Remove currency symbols and convert to number
        aValue = parseFloat((aValue as string).replace(/[^0-9.-]+/g, ''));
        bValue = parseFloat((bValue as string).replace(/[^0-9.-]+/g, ''));
      } else if (sortField === 'quantity') {
        // Extract numeric value from quantity string (e.g., "100kg" -> 100)
        aValue = parseInt((aValue as string).replace(/[^0-9]/g, '')) || 0;
        bValue = parseInt((bValue as string).replace(/[^0-9]/g, '')) || 0;
      }

      // Handle string comparison
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      // Handle number/date comparison
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  // Pagination
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [filterOpen, setFilterOpen] = useState(false);
  const totalPages = Math.ceil(filteredResponses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentResponses = filteredResponses.slice(startIndex, startIndex + itemsPerPage);

// Handle status update
// Calls backend and updates local UI state
const handleStatusUpdate = async (responseId: string, status: 'confirmed' | 'rejected') => {
  try {
    // Persist to backend
    const backendStatus = status === 'confirmed' ? 'Confirmed' : 'Rejected';
    await apiFetch(`/api/quotes/${responseId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: backendStatus }),
    });

    // Update local table data immediately
    setApiResponses(prev => prev.map(q => (q?.id === responseId ? { ...q, status: backendStatus } : q)));

    // After confirming, optionally reduce requirement quantity and close if zero
    if (status === 'confirmed') {
      // Attempt to send an enquiry to the stock endpoint with confirmed values
      try {
        // Find the confirmed response from the in-memory responses list (store has richer fields)
        const resp = responses.find(r => r.id === responseId) as any;
        // Locate the raw quote from the API list as a fallback for identifiers
        const rawQuote = (apiResponses as any[]).find((q) => q?.id === responseId) || {};
        const productId = resp?.productId || rawQuote.productId || rawQuote.product_id;

        if (resp) {
          const qty = parseFloat(String(resp.quantity ?? '0').replace(/[^\d.]/g, '')) || 0;
          const price = parseFloat(String(resp.price ?? '0').replace(/[^\d.]/g, '')) || 0;
          const remark = resp.message || resp.remarks || 'Response confirmed';

          await apiFetch(`/api/stocks/send-enquiry`, {
            method: 'POST',
            body: JSON.stringify({
              quantity: qty,
              expectedPrice: price,
              remark,
              source: 'Requirement',
              requirementId: resp.requirementId,
              status: 'confirmed',
              productId: productId ? String(productId) : undefined,
            }),
          });
          // Notify listeners (e.g., sidebar) to refresh My Enquiries count immediately
          try { window.dispatchEvent(new Event('enquiry:created')); } catch {}
        } else {
          console.warn('Skipping send-enquiry: missing response or stockId for responseId', responseId, { hasResp: !!resp });
        }
      } catch (sendErr) {
        console.error('Failed to send enquiry after confirmation:', sendErr);
      }

      const resp = responses.find(r => r.id === responseId);
      if (resp) {
        const req = requirements.find(r => r.id === resp.requirementId);
        if (req) {
          const reqQty = parseFloat(String((req as any).quantity ?? '0').replace(/[^\d.]/g, '')) || 0;
          const respQty = parseFloat(String(resp.quantity ?? '0').replace(/[^\d.]/g, '')) || 0;
          const newQty = Math.max(0, reqQty - respQty);
          updateRequirement(req.id, { quantity: String(newQty) } as any);
          if (newQty === 0) updateRequirementStatus(req.id, 'closed');
        }
      }
    }

    toast({
      title: 'Success',
      description: `Response ${backendStatus} successfully`,
    });
  } catch (error) {
    console.error('Error updating response status:', error);
    toast({
      title: 'Error',
      description: 'Failed to update response status',
      variant: 'destructive',
    });
  }
};

  // Handle delete response (calls backend and updates local UI)
  const handleDeleteResponse = async (responseId: string) => {
    try {
      // Call backend DELETE /api/quotes/:quoteID
      await apiFetch(`/api/quotes/${responseId}`, {
        method: 'DELETE',
      });

      // Remove from local table data
      setApiResponses((prev) => prev.filter((q: any) => q?.id !== responseId));

      // Also update global store so sidebar badge decrements automatically
      deleteFromStore(responseId);

      setResponseToDelete(null);
      toast({
        title: 'Success',
        description: 'Seller Response deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting response:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete response',
        variant: 'destructive',
      });
    }
  };

  // Reset filters
  const resetFilters = () => {
    setSearchText('');
    setStatusFilter('all');
    setGradeFilter('all');
    setFilterOpen(false);
    setAppliedFilters({
      searchText: '',
      status: 'all',
      grade: 'all'
    });
  };
  

  // Handle Apply Filters
  const handleApplyFilters = () => {
    setAppliedFilters({
      searchText,
      status: statusFilter,
      grade: gradeFilter,
    });
    setFilterOpen(false);
    setCurrentPage(1);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">{t('responses.title')}</h1>
          <p className="text-muted-foreground mt-1">
            {t('responses.subtitle')}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setFilterOpen(prev => !prev)}>
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Filters */}
      {filterOpen && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t('responses.filter.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder={t('responses.filter.searchPlaceholder')}
                  className="pl-10"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(value: ResponseStatus | 'all') => setStatusFilter(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('responses.filter.status.all')}</SelectItem>
                  {availableStatuses.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={gradeFilter}
                onValueChange={(value: string | 'all') => setGradeFilter(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Grades</SelectItem>
                  {availableGrades.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <Button onClick={handleApplyFilters} className="w-full md:w-auto">
                  {t('common.actions.applyFilters')}
                </Button>
                <Button variant="outline" onClick={resetFilters} className="w-full md:w-auto">
                  {t('common.actions.reset')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Responses Table */}
      <div className="rounded-md border">
        {filteredResponses.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-1">No responses found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {Object.values(appliedFilters).some(Boolean)
                ? 'Try adjusting your filters or search criteria.'
                : 'There are no responses available at the moment.'}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('merchantName')}>
                  <div className="flex items-center">
                    {t('responses.table.merchant')}
                    {getSortIcon('merchantName')}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('price')}>
                  <div className="flex items-center">
                    {t('responses.table.price')}
                    {getSortIcon('price')}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('quantity')}>
                  <div className="flex items-center">
                    {t('responses.table.quantity')}
                    {getSortIcon('quantity')}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('grade')}>
                  <div className="flex items-center">
                    {t('responses.table.grade')}
                    {getSortIcon('grade')}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('status')}>
                  <div className="flex items-center">
                    {t('responses.table.status')}
                    {getSortIcon('status')}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('responseDate')}>
                  <div className="flex items-center">
                    {t('responses.table.responseDate')}
                    {getSortIcon('responseDate')}
                  </div>
                </TableHead>
                <TableHead className="text-right">{t('common.actions.title')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentResponses.map((response) => (
                <TableRow key={response.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {response.merchantName}
                      {response.isStarred && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                    </div>
                  </TableCell>
                  <TableCell>₹{response.price} / kg</TableCell>
                  <TableCell>{response.quantity} kg</TableCell>
                  <TableCell>{response.grade || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge
                      variant={response.status === 'confirmed' ? 'default' :
                        response.status === 'rejected' ? 'destructive' : 'outline'}
                      className="capitalize"
                    >
                      {response.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(parseISO(response.responseDate), 'MM/dd/yyyy')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedResponse(response)}
                        className="h-8 w-8 p-0"
                        title="View details"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">{t('common.actions.viewDetails')}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setResponseToDelete({
                            id: response.id,
                            name: `${response.merchantName}'s response for ${response.requirementTitle}`
                          });
                        }}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">{t('common.actions.delete')}</span>
                      </Button>
                      {(response.status === 'new' || response.status === 'viewed') && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusUpdate(response.id, 'rejected');
                            }}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            title="Reject"
                          >
                            <X className="h-4 w-4" />
                            <span className="sr-only">{t('common.actions.reject')}</span>
                          </Button>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusUpdate(response.id, 'confirmed');
                            }}
                            className="h-8 w-8 p-0"
                            title="Accept"
                          >
                            <Check className="h-4 w-4" />
                            <span className="sr-only">{t('common.actions.accept')}</span>
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            {filteredResponses.length > 0 && (
              <tfoot>
                <tr>
                  <td colSpan={8} className="border-t px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        {t('common.pagination.showing', {
                          start: startIndex + 1,
                          end: Math.min(startIndex + itemsPerPage, filteredResponses.length),
                          total: filteredResponses.length,
                          item: t('common.pagination.responses')
                        })}
                      </div>
                      <div className="flex items-center space-x-4">
                        <Select
                          value={String(itemsPerPage)}
                          onValueChange={(value) => {
                            setItemsPerPage(Number(value));
                            setCurrentPage(1);
                          }}
                        >
                          <SelectTrigger className="w-[70px] h-8">
                            <SelectValue placeholder="Page size" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5">5 </SelectItem>
                            <SelectItem value="10">10 </SelectItem>
                            <SelectItem value="20">20 </SelectItem>
                            <SelectItem value="50">50 </SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                          >
                            {t('common.pagination.previous')}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                          >
                            {t('common.pagination.next')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              </tfoot>
            )}
          </Table>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!responseToDelete}
        onOpenChange={(open) => !open && setResponseToDelete(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('responses.dialogs.delete.title')}</DialogTitle>
            <DialogDescription>
              {t('responses.dialogs.delete.description', { name: responseToDelete?.name })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setResponseToDelete(null)}
            >
              {t('common.actions.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={() => responseToDelete && handleDeleteResponse(responseToDelete.id)}
            >
              {t('common.actions.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Response Details Dialog */}
      <Dialog
        open={!!selectedResponse}
        onOpenChange={(open) => !open && setSelectedResponse(null)}
      >
        <DialogContent className="max-w-3xl">
          {selectedResponse && (
            <>
              <DialogHeader>
                <DialogTitle>{t('responses.dialogs.details.title')}</DialogTitle>
                <DialogDescription>
                  {t('responses.dialogs.details.description')}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h4 className="font-medium">{t('responses.details.merchant')}</h4>
                    <p className="text-muted-foreground">
                      {profile.companyName}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">{t('responses.details.price')}</h4>
                    <p className="font-medium">₹{selectedResponse.price} / kg</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">{t('responses.details.quantity')}</h4>
                    <p className="font-medium">{selectedResponse.quantity} / kg</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">{t('responses.details.grade')}</h4>
                    <p className="font-medium">{selectedResponse.grade}</p>
                  </div>
                  {/* <div className="space-y-2">
                    <h4 className="font-medium">Delivery Time</h4>
                    <p className="font-medium">{selectedResponse.deliveryTime}</p>
                  </div> */}
                  <div className="space-y-2">
                    <h4 className="font-medium">
                      {selectedResponse.origin
                        ? t('responses.details.origin')
                        : selectedResponse.merchantLocation
                          ? t('responses.details.merchantLocation')
                          : ""}
                    </h4>

                    <p className="font-medium">
                      {selectedResponse.origin
                        ? selectedResponse.origin.charAt(0).toUpperCase() + selectedResponse.origin.slice(1)
                        : selectedResponse.merchantLocation || "N/A"}
                    </p>
                  </div>

                  {/* <div className="space-y-2">
 <h4 className="font-medium">Certifications</h4>
 <div className="flex flex-wrap gap-2">
 {selectedResponse.certifications?.length > 0 ? (
 selectedResponse.certifications.map((cert, i) => (
 <Badge key={i} variant="secondary">
 {cert}
 </Badge>
 ))
 ) : (
 <p className="text-muted-foreground">No certifications</p>
 )}
 </div>
 </div> */}
                </div>

                {selectedResponse.message && (
                  <div className="space-y-2">
                    <h4 className="font-medium">{t('responses.details.merchantMessage')}</h4>
                    <p className="text-muted-foreground whitespace-pre-line">
                      {selectedResponse.message}
                    </p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setSelectedResponse(null)}
                >
                  {t('common.actions.close')}
                </Button>
                {(selectedResponse.status === 'new' || selectedResponse.status === 'viewed') && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        handleStatusUpdate(selectedResponse.id, 'rejected');
                        setSelectedResponse(null);
                      }}
                    >
                      <X className="h-4 w-4 mr-1" /> Reject
                    </Button>

                    <Button
                      onClick={() => {
                        handleStatusUpdate(selectedResponse.id, 'confirmed');
                        setSelectedResponse(null);
                      }}
                    >
                      <Check className="h-4 w-4 mr-1" /> Accept
                    </Button>
                  </div>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Responses;