import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Filter, Check, X, MessageCircle, Calendar, Clock, Package } from "lucide-react";
import { useResponses, type MerchantResponse } from "@/hooks/useResponses";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "@/components/ui/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { format, isToday, parseISO, subDays } from 'date-fns';

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

    // Sort enquiries by date (newest first)
    const filteredEnquiries = useMemo(() => {
        return [...enquiries].sort((a, b) =>
            new Date(b.responseDate || b.createdAt).getTime() - new Date(a.responseDate || a.createdAt).getTime()
        );
    }, [enquiries]);

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
        <div className="container mx-auto px-4 py-8">
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

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">My Stock Enquiries</h2>
                    <p className="text-sm text-muted-foreground">
                        View and manage your stock responses to buyer enquiries
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search by product, customer, or grade..."
                            className="w-full pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="rounded-md border">
                {filteredEnquiries.length > 0 ? (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 capitalize tracking-wider">
                                    Product
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 capitalize tracking-wider">
                                    Buyer Name
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 capitalize tracking-wider">
                                    Quantity
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 capitalize tracking-wider">
                                    Price
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 capitalize tracking-wider">
                                    Status
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 capitalize tracking-wider">
                                    Date
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 capitalize tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredEnquiries.map((enquiry) => (
                                <tr key={enquiry.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{enquiry.productName || 'N/A'}</div>
                                        {/* <div className="text-sm text-gray-500">{enquiry.grade || 'N/A'}</div> */}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{enquiry.customerName || 'N/A'}</div>
                                        <div className="text-sm text-gray-500">{enquiry.contact || ''}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {enquiry.quantity || '0'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        ₹{enquiry.price || '0'}/kg
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Badge variant={getStatusColor(enquiry.status)}>
                                            {enquiry.status}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(enquiry.responseDate || enquiry.createdAt)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        {enquiry.status === 'Pending' ? (
                                            <div className="flex space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleActionClick(enquiry, 'reject')}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleActionClick(enquiry, 'accept')}
                                                >
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground">
                                                {enquiry.status}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="text-center py-12">
                        <Package className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No responses</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            You don't have any stock responses yet.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StockResponse;