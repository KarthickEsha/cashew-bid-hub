import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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

  // Filter responses based on search and filters
  const filteredResponses = responsesWithDetails.filter(response => {
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
  });

  // Pagination
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredResponses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentResponses = filteredResponses.slice(startIndex, startIndex + itemsPerPage);

  // Handle status update
  const handleStatusUpdate = async (responseId: string, status: 'Accepted' | 'Rejected') => {
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Merchant Responses</h1>
          <p className="text-muted-foreground">
            View and manage responses from merchants for your requirements
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col space-y-4 rounded-md border p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by merchant or requirement..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={statusFilter}
              onValueChange={(value: ResponseStatus | 'all') => setStatusFilter(value)}
            >
              <SelectTrigger className="w-[180px]">
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
            <Button onClick={handleApplyFilters} variant="outline">
              Apply
            </Button>
            <Button onClick={resetFilters} variant="ghost">
              Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Responses Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Merchant</TableHead>
              <TableHead>Requirement</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Response Date</TableHead>
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
                          onClick={() => handleStatusUpdate(response.id, 'Rejected')}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          title="Reject"
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Reject</span>
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(response.id, 'Accepted')}
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
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-muted-foreground">
            Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
            <span className="font-medium">
              {Math.min(startIndex + itemsPerPage, filteredResponses.length)}
            </span>{' '}
            of <span className="font-medium">{filteredResponses.length}</span> responses
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
              <span className="sr-only">First page</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous page</span>
            </Button>
            <div className="text-sm">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next page</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
              <span className="sr-only">Last page</span>
            </Button>
          </div>
        </div>
      )}

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
                    <p className="font-medium">{selectedResponse.quantity} MT</p>
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
                    <p className="font-medium">{selectedResponse.origin}</p>
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

                {selectedResponse.remarks && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Remarks</h4>
                    <p className="text-muted-foreground">{selectedResponse.remarks}</p>
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
                        handleStatusUpdate(selectedResponse.id, 'Rejected');
                        setSelectedResponse(null);
                      }}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4 mr-1" /> Reject
                    </Button>
                    <Button
                      onClick={() => {
                        handleStatusUpdate(selectedResponse.id, 'Accepted');
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
