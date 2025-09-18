import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Filter, Check, X, Package, ArrowUpDown, ArrowUp, ArrowDown, Eye } from "lucide-react";
import { useResponses, type MerchantResponse } from "@/hooks/useResponses";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "@/components/ui/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { format, isToday, parseISO, subDays } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EnquiryWithResponses extends Enquiry {
    responses: MerchantResponse[];
}

interface Enquiry {
    id: string;
    productName: string;
    requirementId: string;
    merchantId: string;
    merchantName: string;
    customerName: string;
    merchantLocation: string;
    price: string;
    responseDate: string;
    status: 'Pending' | 'Responded' | 'Closed';
    grade: string;
    quantity: string;
    origin: string;
    certifications: string[];
    deliveryTime: string;
    contact: string;
    message: string;
    remarks?: string;
    createdAt: string;
    packaging?: string;
}

type ActionType = 'accept' | 'reject';

const StockResponse = (): JSX.Element => {
    const { profile } = useProfile();
    const { getResponsesByRequirementId, updateResponseStatus, addResponse } = useResponses();
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
    const [actionType, setActionType] = useState<ActionType | ''>('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [remarks, setRemarks] = useState("");
    const [enquiries, setEnquiries] = useState<EnquiryWithResponses[]>([]);

    // Load enquiries from localStorage and attach responses
    useEffect(() => {
        const loadEnquiries = () => {
            try {
                const storedEnquiries = JSON.parse(localStorage.getItem('productEnquiries') || '[]');



                setEnquiries(storedEnquiries);
            } catch (error) {
                console.error('Error loading enquiries:', error);
                toast({
                    title: "Error",
                    description: "Failed to load enquiries. Please refresh the page.",
                    variant: "destructive",
                });
            }
        };

        // Load immediately
        loadEnquiries();

        // Set up storage event listener for changes from other tabs
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'productEnquiries') {
                loadEnquiries();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [getResponsesByRequirementId]);

    // Format date for display
    const formatDate = (dateString?: string | null) => {
        if (!dateString) return 'N/A';
        try {
            const date = parseISO(dateString);
            if (isToday(date)) {
                return format(date, 'h:mm a');
            } else if (date > subDays(new Date(), 7)) {
                return format(date, 'EEE, h:mm a');
            }
            return format(date, 'MMM d, yyyy');
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Invalid date';
        }
    };

    // Get status color for badge
    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return 'destructive';
            case 'responded': return 'default';
            case 'closed': return 'outline';
            default: return 'outline';
        }
    };

    // State for sorting and pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [filters, setFilters] = useState({ product: "", customer: "", status: "all" });
    const [showFilterCard, setShowFilterCard] = useState(false);
    const [sortField, setSortField] = useState<string>('');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    // Handle sorting
    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
        setCurrentPage(1);
    };

    // Get sort icon
    const getSortIcon = (field: string) => {
        if (sortField !== field) {
            return <ArrowUpDown className="h-4 w-4 text-muted-foreground opacity-50" />;
        }
        return sortDirection === 'asc'
            ? <ArrowUp className="h-4 w-4 text-primary" />
            : <ArrowDown className="h-4 w-4 text-primary" />;
    };

    // Filter and sort enquiries
    const filteredEnquiries = useMemo(() => {
        let result = [...enquiries];

        // Apply filters
        if (filters.product || filters.customer || filters.status !== 'all') {
            result = result.filter(enquiry =>
                (filters.product ? enquiry.productName?.toLowerCase().includes(filters.product.toLowerCase()) : true) &&
                (filters.customer ? enquiry.customerName?.toLowerCase().includes(filters.customer.toLowerCase()) : true) &&
                (filters.status !== 'all' ? enquiry.status?.toLowerCase() === filters.status.toLowerCase() : true)
            );
        }

        // Apply sorting
        if (sortField) {
            result = [...result].sort((a, b) => {
                const aValue = a[sortField as keyof typeof a];
                const bValue = b[sortField as keyof typeof b];

                // Handle different field types for sorting
                if (sortField === 'createdAt' || sortField === 'responseDate') {
                    const aDate = new Date(aValue as string || 0).getTime();
                    const bDate = new Date(bValue as string || 0).getTime();
                    return sortDirection === 'asc' ? aDate - bDate : bDate - aDate;
                } else if (sortField === 'quantity' || sortField === 'price') {
                    const aNum = parseFloat(String(aValue || '0'));
                    const bNum = parseFloat(String(bValue || '0'));
                    return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
                } else {
                    // Default string comparison
                    const aStr = String(aValue || '').toLowerCase();
                    const bStr = String(bValue || '').toLowerCase();
                    return sortDirection === 'asc'
                        ? aStr.localeCompare(bStr)
                        : bStr.localeCompare(aStr);
                }
            });
        }

        return result;
    }, [enquiries, filters, sortField, sortDirection]);

    // Calculate pagination
    const totalPages = Math.ceil(filteredEnquiries.length / pageSize);
    const paginatedEnquiries = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredEnquiries.slice(start, start + pageSize);
    }, [filteredEnquiries, currentPage, pageSize]);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filters, pageSize]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'accepted':
                return <Badge className="bg-green-500 hover:bg-green-600">Accepted</Badge>;
            case 'rejected':
                return <Badge variant="destructive">Rejected</Badge>;
            case 'pending':
                return <Badge variant="outline">Pending</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const handleStatusUpdate = async (): Promise<void> => {
        if (!selectedEnquiry || !actionType) return;

        // Type guard to ensure actionType is either 'accept' or 'reject'
        if (actionType !== 'accept' && actionType !== 'reject') return;

        try {
            // Map actionType to allowed status values
            const status: Enquiry["status"] = actionType === 'accept'
                ? 'Responded'
                : 'Closed';

            // Create the response object
            const newResponse: MerchantResponse = {
                id: `resp-${Date.now()}`,
                status: actionType === 'accept' ? 'new' : 'rejected',
                message: remarks || '',
                merchantId: profile?.id || '',
                merchantName: profile?.name || 'Merchant',
                productName: selectedEnquiry.productName,
                requirementId: selectedEnquiry.requirementId || '',
                merchantLocation: profile?.email || '',
                price: String(selectedEnquiry.price || 0),
                quantity: String(selectedEnquiry.quantity || 0),
                grade: selectedEnquiry.grade || '',
                createdAt: new Date().toISOString(),
                responseDate: new Date().toISOString(),
                origin: selectedEnquiry.origin || '',
                certifications: selectedEnquiry.certifications || [],
                deliveryTime: selectedEnquiry.deliveryTime || '',
                contact: selectedEnquiry.contact || ''
            };

            // Map the status to the expected response status
            const mapToResponseStatus = (status: 'Pending' | 'Responded' | 'Closed'): 'new' | 'viewed' | 'accepted' | 'rejected' | 'skipped' => {
                switch (status) {
                    case 'Responded':
                        return 'accepted';
                    case 'Closed':
                        return 'rejected';
                    case 'Pending':
                    default:
                        return 'new';
                }
            };

            // First, add the response to the responses store
            const responseStatus = mapToResponseStatus(status);
            await addResponse({
                ...newResponse,
                status: responseStatus,
                remarks: remarks || ''
            });

            // Then update the response status
            await updateResponseStatus(newResponse.id, responseStatus, remarks || '');

            // Update local state to reflect the change immediately
            const updatedEnquiries = enquiries.map(enquiry => {
                if (enquiry.id === selectedEnquiry.id) {
                    return {
                        ...enquiry,
                        status: status,
                        responseDate: new Date().toISOString(),
                        responses: [
                            ...(enquiry.responses || []).filter(r => r.merchantId !== profile?.id), // Remove any existing response from this merchant
                            newResponse
                        ]
                    };
                }
                return enquiry;
            });

            // Save back to localStorage
            localStorage.setItem('productEnquiries', JSON.stringify(updatedEnquiries));

            // Update the local state
            setEnquiries(updatedEnquiries);

            // Show success message
            toast({
                title: `Response ${actionType === 'accept' ? 'Accepted' : 'Rejected'}`,
                description: actionType === 'accept'
                    ? 'Your response has been recorded and will be visible to the buyer.'
                    : 'The response has been rejected.',
            });

            // Reset state
            setIsDialogOpen(false);
            setRemarks('');
            setSelectedEnquiry(null);
            setActionType(null);

            // Trigger storage event to update other tabs
            window.dispatchEvent(new Event('storage'));

            // Update the requirement status as well if accepting
            if (actionType === 'accept' && selectedEnquiry.requirementId) {
                const storedEnquiries = JSON.parse(localStorage.getItem('productEnquiries') || '[]');
                const updatedStoredEnquiries = storedEnquiries.map((e: any) =>
                    e.id === selectedEnquiry.requirementId
                        ? {
                            ...e,
                            status: 'Responded',
                            lastUpdated: new Date().toISOString(),
                            responseStatus: 'accepted',
                            responseDate: new Date().toISOString()
                        }
                        : e
                );

                localStorage.setItem('productEnquiries', JSON.stringify(updatedStoredEnquiries));
            }
        } catch (error) {
            console.error('Error updating response status:', error);
            toast({
                title: "Error",
                description: "Failed to update response status. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsDialogOpen(false);
            setSelectedEnquiry(null);
            setActionType("");
            setRemarks("");
        }
    };

    const handleActionClick = (enquiry: Enquiry, action: ActionType) => {
        setSelectedEnquiry(enquiry);
        setActionType(action);
        setRemarks("");
        setIsDialogOpen(true);
    };

    const handleViewDetails = (enquiry: Enquiry) => {
        setSelectedEnquiry(enquiry);
        // You can implement a details view or modal here
        console.log('View details:', enquiry);
    };
    // Helper function to render dialog content based on action type
    const renderDialogContent = () => {
        if (actionType !== 'accept' && actionType !== 'reject') return null;

        const isAccept = actionType === 'accept';

        return (
            <>
                <AlertDialogTitle>
                    {isAccept ? 'Accept Response' : 'Reject Response'}
                </AlertDialogTitle>
                <AlertDialogDescription>
                    {isAccept
                        ? 'Are you sure you want to accept this response?'
                        : 'Are you sure you want to reject this response?'}
                    {!isAccept && (
                        <div className="mt-4">
                            <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-1">
                                {isAccept ? 'Additional Notes (Optional)' : 'Reason for Rejection (Required)'}
                            </label>
                            <textarea
                                id="remarks"
                                rows={3}
                                className="w-full p-2 border rounded-md"
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                required={!isAccept}
                            />
                        </div>
                    )}
                </AlertDialogDescription>
            </>
        );
    };

    return (
        <div className="p-6 space-y-6">
            <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        {renderDialogContent()}
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        {actionType && (
                            <AlertDialogAction
                                onClick={handleStatusUpdate}
                                disabled={actionType === 'reject' && !remarks.trim()}
                                className={actionType === 'accept' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                            >
                                {actionType === 'accept' ? 'Accept' : 'Reject'}
                            </AlertDialogAction>
                        )}
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-primary">Stock Enquiries</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage buyer enquiries and your responses
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilterCard(prev => !prev)}
                    className="flex items-center space-x-1"
                >
                    <Filter className="h-4 w-4" /> <span>Filter Enquiries</span>
                </Button>
            </div>

            {/* Filter Card */}
            {showFilterCard && (
                <Card className="mb-4">
                    <CardHeader>
                        <CardTitle>Filter Enquiries</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="text-sm font-medium mb-2 block">Product</label>
                                <Input
                                    type="text"
                                    placeholder="Search by product"
                                    value={filters.product}
                                    onChange={e => setFilters(prev => ({ ...prev, product: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-2 block">Buyer</label>
                                <Input
                                    type="text"
                                    placeholder="Search by buyer name"
                                    value={filters.customer}
                                    onChange={e => setFilters(prev => ({ ...prev, customer: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-2 block">Status</label>
                                <Select
                                    value={filters.status}
                                    onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="responded">Responded</SelectItem>
                                        <SelectItem value="closed">Closed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Enquiries Table */}
            <Card>
                <CardContent className="p-0">
                    <div className="w-full overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead
                                        className="cursor-pointer hover:bg-muted/50 select-none"
                                        onClick={() => handleSort('productName')}
                                    >
                                        <div className="flex items-center justify-between">
                                            Product
                                            {getSortIcon('productName')}
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="cursor-pointer hover:bg-muted/50 select-none"
                                        onClick={() => handleSort('customerName')}
                                    >
                                        <div className="flex items-center justify-between">
                                            Buyer Name
                                            {getSortIcon('customerName')}
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="cursor-pointer hover:bg-muted/50 select-none"
                                        onClick={() => handleSort('quantity')}
                                    >
                                        <div className="flex items-center justify-between">
                                            Quantity
                                            {getSortIcon('quantity')}
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="cursor-pointer hover:bg-muted/50 select-none"
                                        onClick={() => handleSort('price')}
                                    >
                                        <div className="flex items-center justify-between">
                                            Price
                                            {getSortIcon('price')}
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="cursor-pointer hover:bg-muted/50 select-none"
                                        onClick={() => handleSort('status')}
                                    >
                                        <div className="flex items-center justify-between">
                                            Status
                                            {getSortIcon('status')}
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="cursor-pointer hover:bg-muted/50 select-none"
                                        onClick={() => handleSort('createdAt')}
                                    >
                                        <div className="flex items-center justify-between">
                                            Date
                                            {getSortIcon('createdAt')}
                                        </div>
                                    </TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedEnquiries.length > 0 ? (
                                    paginatedEnquiries.map((enquiry) => (
                                        <TableRow key={enquiry.id} className="hover:bg-muted/50">
                                            <TableCell>
                                                <div className="font-medium">{enquiry.productName || 'N/A'}</div>
                                                {/* {enquiry.grade && (
                                                    <div className="text-sm text-muted-foreground">{enquiry.grade}</div>
                                                )} */}
                                            </TableCell>
                                            <TableCell>
                                                <div>{enquiry.customerName || 'N/A'}</div>
                                                {enquiry.contact && (
                                                    <div className="text-sm text-muted-foreground">{enquiry.contact}</div>
                                                )}
                                            </TableCell>
                                            <TableCell>{enquiry.quantity || '0'} kg</TableCell>
                                            <TableCell>₹{enquiry.price || '0'}/kg</TableCell>
                                            <TableCell>
                                                <Badge variant={getStatusColor(enquiry.status)}>
                                                    {enquiry.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{formatDate(enquiry.responseDate || enquiry.createdAt)}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleViewDetails(enquiry)}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    {enquiry.status === 'Pending' && (
                                                        <>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="text-red-500 hover:text-red-600"
                                                                onClick={() => handleActionClick(enquiry, 'reject')}
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="text-green-500 hover:text-green-600"
                                                                onClick={() => handleActionClick(enquiry, 'accept')}
                                                            >
                                                                <Check className="h-4 w-4" />
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center">
                                            <div className="flex flex-col items-center justify-center py-6">
                                                <Package className="h-10 w-10 text-muted-foreground mb-2" />
                                                <p className="text-sm font-medium">No enquiries found</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {Object.values(filters).some(f => f && f !== 'all')
                                                        ? 'Try adjusting your filters'
                                                        : 'You don\'t have any enquiries yet'}
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {filteredEnquiries.length > 0 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t">
                            <div className="text-sm text-muted-foreground">
                                Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to{' '}
                                <span className="font-medium">
                                    {Math.min(currentPage * pageSize, filteredEnquiries.length)}
                                </span>{' '}
                                of <span className="font-medium">{filteredEnquiries.length}</span> enquiries
                            </div>
                            <div className="flex items-center space-x-2">
                                <Select
                                    value={String(pageSize)}
                                    onValueChange={(value) => setPageSize(Number(value))}
                                >
                                    <SelectTrigger className="w-[80px]">
                                        <SelectValue placeholder={pageSize} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="5">5</SelectItem>
                                        <SelectItem value="10">10</SelectItem>
                                        <SelectItem value="20">20</SelectItem>
                                        <SelectItem value="50">50</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </Button>
                                {/* <div className="flex items-center space-x-1">
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        // Show first 2 pages, current page, and last 2 pages
                                        let pageNum;
                                        if (currentPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = currentPage - 2 + i;
                                        }

                                        if (pageNum < 1 || pageNum > totalPages) return null;

                                        return (
                                            <Button
                                                key={pageNum}
                                                variant={pageNum === currentPage ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => setCurrentPage(pageNum)}
                                            >
                                                {pageNum}
                                            </Button>
                                        );
                                    })}
                                </div> */}
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
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default StockResponse;