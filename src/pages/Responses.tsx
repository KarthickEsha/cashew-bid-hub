import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { profile } from "console";
import { useProfile } from "@/hooks/useProfile";

type ResponseStatus = 'new' | 'viewed' | 'accepted' | 'rejected' | 'skipped';

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
  contact: string;
  message: string;
  remarks?: string;
  createdAt: string;
}

interface ResponseWithDetails extends MerchantResponse {
  requirementTitle: string;
  merchantRating: number;
  isStarred: boolean;
}

const Responses = () => {
  const { profile, setProfile } = useProfile();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedResponse, setSelectedResponse] = useState<ResponseWithDetails | null>(null);
  const { responses, updateResponseStatus } = useResponses();
  const { requirements } = useRequirements();
  const [isLoading, setIsLoading] = useState(false);
  const [sortField, setSortField] = useState<string>('responseDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Filter states
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<ResponseStatus | 'all'>("all");
  const [appliedFilters, setAppliedFilters] = useState({
    searchText: "",
    status: "all" as ResponseStatus | 'all'
  });

  // Get requirement title by ID
  const getRequirementTitle = (requirementId: string) => {
    const requirement = requirements.find(req => req.id === requirementId);
    return requirement ? requirement.productName : 'Unknown Requirement';
  };

  // Get all merchant responses with details
  const getMerchantResponses = (): ResponseWithDetails[] => {
    return responses.map(response => {
      const requirement = requirements.find(req => req.id === response.requirementId);
      return {
        ...response,
        status: response.status.toLowerCase() as ResponseStatus,
        requirementTitle: requirement?.productName || 'Unknown Requirement',
        merchantRating: 4.5, // This would come from merchant data in a real app
        isStarred: false, // Default value, can be managed in state if needed
        grade: response.grade || requirement?.grade || 'N/A',
        quantity: response.quantity || (requirement?.quantity ? `${requirement.quantity} MT` : 'N/A')
      };
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

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (!sortField) return 0;

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
  const handleStatusUpdate = async (responseId: string, status: 'accepted' | 'rejected') => {
    try {
      await updateResponseStatus(responseId, status);
      toast({
        title: 'Success',
        description: `Response ${status} successfully`,
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

  // Reset filters
  const resetFilters = () => {
    setSearchText('');
    setStatusFilter('all');
    setFilterOpen(false);
    setAppliedFilters({
      searchText: '',
      status: 'all'
    });
  };

  // Handle Apply Filters
  const handleApplyFilters = () => {
    setAppliedFilters({
      searchText,
      status: statusFilter
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

  // No responses state
  if (responses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Inbox className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900">No responses yet</h3>
        <p className="text-gray-500">Your responses will appear here once merchants respond to your requirements.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Seller Responses</h1>
          <p className="text-muted-foreground mt-1">
            View and manage responses from merchants for your requirements
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
            <CardTitle>Filter Responses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search responses..."
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
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="viewed">Viewed</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <Button onClick={handleApplyFilters} className="w-full md:w-auto">
                  Apply Filters
                </Button>
                <Button variant="outline" onClick={resetFilters} className="w-full md:w-auto">
                  Reset
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
            {Object.values(appliedFilters).some(Boolean) && (
              <Button variant="outline" onClick={resetFilters}>
                Clear all filters
              </Button>
            )}
          </div>
        ) : (
          <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('merchantName')}>
                <div className="flex items-center">
                  Merchant
                  {getSortIcon('merchantName')}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('requirementTitle')}>
                <div className="flex items-center">
                  Requirement
                  {getSortIcon('requirementTitle')}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('price')}>
                <div className="flex items-center">
                  Price
                  {getSortIcon('price')}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('quantity')}>
                <div className="flex items-center">
                  Quantity
                  {getSortIcon('quantity')}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('grade')}>
                <div className="flex items-center">
                  Grade
                  {getSortIcon('grade')}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('status')}>
                <div className="flex items-center">
                  Status
                  {getSortIcon('status')}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('responseDate')}>
                <div className="flex items-center">
                  Response Date
                  {getSortIcon('responseDate')}
                </div>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
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
                <TableCell>{response.requirementTitle}</TableCell>
                <TableCell>₹{response.price} / kg</TableCell>
                <TableCell>{response.quantity}</TableCell>
                <TableCell>{response.grade || 'N/A'}</TableCell>
                <TableCell>
                  <Badge
                    variant={response.status === 'accepted' ? 'default' :
                      response.status === 'rejected' ? 'destructive' : 'outline'}
                    className="capitalize"
                  >
                    {response.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {format(parseISO(response.responseDate), 'MMM d, yyyy')}
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
                      <span className="sr-only">View details</span>
                    </Button>
                    {(response.status === 'new' || response.status === 'viewed') && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusUpdate(response.id, 'rejected')}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          title="Reject"
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Reject</span>
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(response.id, 'accepted')}
                          className="h-8 w-8 p-0"
                          title="Accept"
                        >
                          <Check className="h-4 w-4" />
                          <span className="sr-only">Accept</span>
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
                      Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredResponses.length)} of {filteredResponses.length} responses
                    </div>
                    <div className="flex items-center space-x-4">
                      <Select
                        value={String(itemsPerPage)}
                        onValueChange={(value) => {
                          setItemsPerPage(Number(value));
                          setCurrentPage(1);
                        }}
                      >
                        <SelectTrigger className="w-[100px] h-8">
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
                          className="h-8"
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8"
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                        >
                          Next
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

      {/* Response Details Dialog */}
      <Dialog
        open={!!selectedResponse}
        onOpenChange={(open) => !open && setSelectedResponse(null)}
      >
        <DialogContent className="max-w-3xl">
          {selectedResponse && (
            <>
              <DialogHeader>
                <DialogTitle>Response Details</DialogTitle>
                <DialogDescription>
                  Detailed information about the merchant's response
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h4 className="font-medium">Requirement</h4>
                    <p className="text-muted-foreground">
                      {selectedResponse.requirementTitle}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Merchant</h4>
                    <p className="text-muted-foreground">
                      {profile.companyName}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Price</h4>
                    <p className="font-medium">{selectedResponse.price} / kg</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Quantity</h4>
                    <p className="font-medium">{selectedResponse.quantity}</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Grade</h4>
                    <p className="font-medium">{selectedResponse.grade}</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Delivery Time</h4>
                    <p className="font-medium">{selectedResponse.deliveryTime}</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Origin</h4>
                    <p className="font-medium">
                      {selectedResponse.origin
                        ? selectedResponse.origin.charAt(0).toUpperCase() + selectedResponse.origin.slice(1)
                        : ''}
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
                    <h4 className="font-medium">Merchant's Message</h4>
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
                  Close
                </Button>
                {(selectedResponse.status === 'new' || selectedResponse.status === 'viewed') && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        handleStatusUpdate(selectedResponse.id, 'rejected');
                        setSelectedResponse(null);
                      }}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4 mr-1" /> Reject
                    </Button>
                    <Button
                      onClick={() => {
                        handleStatusUpdate(selectedResponse.id, 'accepted');
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
