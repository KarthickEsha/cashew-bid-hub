import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useRequirements } from '@/hooks/useRequirements';
import { useResponses } from '@/hooks/useResponses';
import { X } from 'lucide-react';
import {
    ArrowLeft,
    Calendar,
    MapPin,
    Package,
    DollarSign,
    Clock,
    CheckCircle,
    AlertTriangle,
    Edit,
    Eye,
    MessageSquare,
    Users
} from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { apiFetch } from '@/lib/api';

const RequirementDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { profile, setProfile } = useProfile();
    const { toast } = useToast();
    const { getMyRequirements, updateRequirementStatus, updateRequirement } = useRequirements();
    const {
        getResponsesByRequirementId,
        updateResponseStatus,
        deleteResponse
    } = useResponses();

    // State for managing responses (fetched from backend quotes endpoint)
    const [responses, setResponses] = useState<any[]>([]);

    // Requirement state fetched from API
    const [requirement, setRequirement] = useState<any | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            if (!id) return;
            setLoading(true);
            setError(null);
            try {
                // Fetch combined requirement + quotes
                const data: any = await apiFetch(`/api/quotes/with-requirement/${id}`);
                const root = data?.data ?? data;
                if (!root) throw new Error('Requirement not found');

                const item = root.requirement ?? root.Requirement ?? root.req ?? root.Req ?? root;
                const quotes = (root.quotes ?? root.Quotes ?? []) as any[];

                // Normalize requirement shape
                const nid = String(item?.id ?? item?._id ?? item?.ID ?? id);
                const grade = item?.grade || item?.productGrade || item?.product?.grade || 'W320';
                const quantity = String(item?.requiredqty ?? item?.qty ?? item?.totalQuantity ?? item?.quantity ?? '0');
                const origin = (item?.origin || item?.preferredOrigin || item?.source || 'any')?.toString?.() ?? 'any';
                const expectedPrice = Number(item?.minimumqty ?? item?.price ?? item?.expected_price ?? item?.expectedPrice ?? 0);
                const deliveryLocation = item?.deliveryLocation || item?.location || '';
                const deliveryDeadline = item?.deliveryDeadline || item?.deliverydate || item?.requirementExpiry || '';
                const status = (item?.status || 'active').toString();
                const description = item.description || '';
                const createdAt = item?.createdAt || item?.created_at || new Date().toISOString();

                const normalized = {
                    id: nid,
                    title: item?.title || `${quantity} of ${grade} Cashews`,
                    grade,
                    quantity,
                    preferredOrigin: origin,
                    budgetRange: `₹${(expectedPrice as number)?.toLocaleString?.() || expectedPrice}/kg`,
                    requirementExpiry: deliveryDeadline,
                    deliveryLocation,
                    deliveryDeadline,
                    status,
                    description,
                    createdDate: createdAt,
                    lastModified: item?.updatedAt || item?.updated_at || createdAt,
                };

                // Map quotes to UI responses structure
                const mappedResponses = (quotes || []).map((q: any) => {
                    const rid = String(q?.id ?? q?._id ?? q?.ID ?? q?.quoteId ?? '');
                    const supplyQty = q?.supplyQtyKg ?? q?.SupplyQtyKg ?? q?.supply_qty ?? q?.quantity ?? '';
                    const priceINR = q?.priceINR ?? q?.PriceINR ?? q?.price ?? '';
                    const remarks = q?.remarks ?? q?.Remarks ?? '';
                    const created = q?.createdAt ?? q?.CreatedAt ?? new Date().toISOString();
                    const merchantId = q?.merchantId ?? q?.MerchantID ?? q?.merchantID ?? '';
                    return {
                        id: rid,
                        merchantId,
                        merchantName: q?.merchantCompanyName || merchantId || 'Merchant',
                        merchantLocation: q?.merchantAddress || '-',
                        price: priceINR ? `₹${Number(priceINR).toLocaleString()}/kg` : '',
                        quantity: supplyQty ? `${supplyQty} kg` : '',
                        origin: q?.origin || '',
                        grade: q?.grade || '',
                        deliveryTime: q?.deliveryTime || '',
                        contact: q?.contact || '',
                        message: remarks,
                        certifications: q?.certifications || [],
                        responseDate: created,
                        status: (q?.status || 'new').toString(),
                    };
                });

                if (mounted) {
                    setRequirement(normalized);
                    setResponses(mappedResponses);
                }
            } catch (e: any) {
                console.error('Failed to fetch requirement:', e);
                if (mounted) setError(e?.message || 'Failed to load requirement');
            } finally {
                if (mounted) setLoading(false);
            }
        };
        load();
        return () => { mounted = false; };
    }, [id]);

    // State for managing responses popup
    const [showAllResponses, setShowAllResponses] = useState(false);
    const [showResponseDetail, setShowResponseDetail] = useState(false);
    const [selectedResponse, setSelectedResponse] = useState<any>(null);
    const [orders, setOrders] = useState<any[]>([]);

    // Format date exactly as provided by backend (avoid timezone shifts)
    const formatDateExact = (input: any) => {
        if (!input) return '-';
        try {
            const s = String(input);

            // If ISO-like string
            if (s.includes('T')) {
                const datePart = s.split('T')[0]; // yyyy-MM-dd
                const [year, month, day] = datePart.split('-');
                return `${day}-${month}-${year}`; // DD-MM-YYYY
            }

            // If already yyyy-MM-dd
            if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
                const [year, month, day] = s.split('-');
                return `${day}-${month}-${year}`; // DD-MM-YYYY
            }

            // Fallback: return original string
            return s;
        } catch {
            return String(input);
        }
    };


    // Loading and error states
    if (loading) {
        return (
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                        <ArrowLeft size={16} className="mr-2" />
                        Back to My Requirements
                    </Button>
                </div>
                <Card className="p-10 text-center">
                    <h1 className="text-xl font-semibold text-foreground mb-2">Loading requirement...</h1>
                </Card>
            </div>
        );
    }

    if (error || !requirement) {
        return (
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                        <ArrowLeft size={16} className="mr-2" />
                        Back to My Requirements
                    </Button>
                </div>
                <Card className="p-10 text-center">
                    <h1 className="text-2xl font-bold text-foreground mb-2">Requirement Not Found</h1>
                    <p className="text-muted-foreground mb-4">
                        {error || "The requirement you're looking for doesn't exist or has been deleted."}
                    </p>
                    <Button onClick={() => navigate('/my-requirements')}>
                        Back to My Requirements
                    </Button>
                </Card>
            </div>
        );
    }

    // Handle response deletion
    const handleDeleteResponse = (responseId: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card click event

        // Optimistic UI update
        setResponses(prev => prev.filter(r => r.id !== responseId));

        // Call the API to delete
        deleteResponse(responseId);

        // Show success message
        toast({
            title: "Response Deleted",
            description: "The response has been removed successfully.",
        });
    };

    // Mock specifications - in real app this would come from requirement data
    const mockSpecifications = {
        moisture: "Max 5%",
        broken: "Max 5%",
        defects: "Max 2%",
        packaging: "Vacuum packed in 25kg bags",
        certifications: ["ISO 22000", "HACCP", "Organic (preferred)"],
        minShelfLife: "12 months"
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "active":
                return <CheckCircle size={20} className="text-green-500" />;
            case "draft":
                return <Edit size={20} className="text-gray-500" />;
            case "expired":
                return <Clock size={20} className="text-red-500" />;
            case "closed":
                return <AlertTriangle size={20} className="text-orange-500" />;
            default:
                return <Clock size={20} className="text-gray-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "active":
                return "bg-green-100 text-green-800";
            case "draft":
                return "bg-gray-100 text-gray-800";
            case "expired":
                return "bg-red-100 text-red-800";
            case "closed":
                return "bg-orange-100 text-orange-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    // Badge colors for quote/response statuses
    const getQuoteBadgeClasses = (status: string) => {
        if (status === 'Confirmed') return 'bg-green-100 text-green-800';
        if (status === 'Rejected') return 'bg-red-100 text-red-800';
        return 'bg-gray-100 text-gray-800';
    };

    // Place Order functionality
    const handlePlaceOrder = (response: any) => {
        const order = {
            id: Date.now(), // Simple ID generation
            requirementId: requirement.id,
            requirementTitle: requirement.title,
            merchantName: response.merchantName,
            merchantLocation: response.location,
            price: response.price,
            grade: response.grade,
            quantity: response.quantity,
            origin: response.origin,
            orderDate: new Date().toISOString(),
            status: "Confirmed",
            deliveryTime: response.deliveryTime,
            contact: response.contact
        };

        setOrders(prev => [...prev, order]);

        toast({
            title: "Order Placed Successfully",
            description: `Order placed with ${response.merchantName} for ${response.price}`,
        });

        // Close the popup
        setShowAllResponses(false);
    };

    // Handle response click to show detail popup
    const handleResponseClick = (response: any) => {
        setSelectedResponse({
            ...response,
            status: '',
            remarks: response.remarks || ''
        });
        setShowResponseDetail(true);
    };

    // Handle status update for response
    const handleStatusUpdate = async (
        responseId: string,
        status: string,
        remarks: string = ''
    ) => {
        // Normalize to backend allowed values: "Confirmed" | "Rejected"
        const backendStatus = status === 'accepted' ? 'Confirmed' : status === 'rejected' ? 'Rejected' : status;

        try {
            // Call backend to persist status
            const res: any = await apiFetch(`/api/quotes/${responseId}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status: backendStatus })
            });

            const updated = res?.data ?? res;

            // Update local responses UI list with returned status
            const returnedStatus: string = String(updated?.status ?? backendStatus);
            setResponses(prev =>
                prev.map(r =>
                    r.id === responseId
                        ? { ...r, status: returnedStatus, ...(remarks ? { remarks } : {}) }
                        : r
                )
            );

            // Update selected response UI if open
            if (selectedResponse?.id === responseId) {
                setSelectedResponse(prev => ({
                    ...prev!,
                    status: returnedStatus,
                    ...(remarks ? { remarks } : {}),
                }));
            }

            // Also update local store for any dependent flows (orders etc.)
            // Map back to local store's accepted/rejected if needed
            const localStatus = returnedStatus === 'Confirmed' ? 'accepted' : returnedStatus === 'Rejected' ? 'rejected' : 'viewed';
            updateResponseStatus(responseId, localStatus as any, remarks);

            toast({
                title: 'Status Updated',
                description: `Response status changed to ${returnedStatus}`,
            });
        } catch (e: any) {
            console.error('Failed to update quote status', e);
            toast({
                title: 'Error',
                description: e?.message || 'Failed to update response status',
                variant: 'destructive'
            });
            return;
        }

        // If confirmed, optionally update requirement quantity and status
        if (requirement && (status === 'accepted' || backendStatus === 'Confirmed')) {
            const resp = responses.find(r => r.id === responseId);
            const currentQty = Number(String(requirement.quantity).toString().replace(/[^0-9.]/g, '')) || 0;
            const acceptedQty = Number(String(resp?.quantity ?? '0').toString().replace(/[^0-9.]/g, '')) || 0;
            const newQty = Math.max(0, currentQty - acceptedQty);

            try {
                const updatedRequirement = {
                    ...requirement,
                    quantity: newQty,
                    status: newQty <= 0 ? 'closed' : requirement.status,
                } as any;

                // Persist both the quantity and, if needed, status
                updateRequirement(String(requirement.id), updatedRequirement);
                if (newQty <= 0) {
                    updateRequirementStatus(requirement.id, 'closed');
                }
            } catch {
                // Fallback: at least close if zero
                if (newQty <= 0) {
                    updateRequirementStatus(requirement.id, 'closed');
                }
            }
        }
        setShowResponseDetail(false);
    };

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                    <ArrowLeft size={16} className="mr-2" />
                    Back to My Requirements
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Requirement Details</h1>
                    <p className="text-muted-foreground">Requirement #{requirement.id}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Requirement Overview */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle className="text-xl">{requirement.title}</CardTitle>
                                    <p className="text-muted-foreground mt-1">Grade: {requirement.grade}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    {getStatusIcon(requirement.status)}
                                    <Badge className={getStatusColor(requirement.status)}>
                                        {requirement.status.charAt(0).toUpperCase() + requirement.status.slice(1)}
                                    </Badge>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center space-x-2">
                                    <Package size={16} className="text-muted-foreground" />
                                    <div>
                                        <div className="text-sm text-muted-foreground">Quantity</div>
                                        <div className="font-medium">{Number(requirement.quantity).toLocaleString()}</div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <DollarSign size={16} className="text-muted-foreground" />
                                    <div>
                                        <div className="text-sm text-muted-foreground">Budget Range</div>
                                        <div className="font-medium">{requirement.budgetRange}</div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <MapPin size={16} className="text-muted-foreground" />
                                    <div>
                                        <div className="text-sm text-muted-foreground">Preferred Origin</div>
                                        <div className="font-medium">
                                            {requirement.preferredOrigin
                                                ? requirement.preferredOrigin.charAt(0).toUpperCase() + requirement.preferredOrigin.slice(1)
                                                : ''}
                                        </div>
                                    </div>

                                </div>
                                <div className="flex items-center space-x-2">
                                    <Calendar size={16} className="text-muted-foreground" />
                                    <div>
                                        <div className="text-sm text-muted-foreground">Delivery Deadline</div>
                                        <div className="font-medium">
                                            {formatDateExact(requirement.requirementExpiry)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div>
                                <div className="text-sm text-muted-foreground mb-1">Delivery Location</div>
                                <div className="font-medium">{requirement.deliveryLocation}</div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Description */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Description</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm leading-relaxed">
                              {requirement.description}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Specifications */}
                    {/* <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Product Specifications</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-sm text-muted-foreground">Moisture:</span>
                                    <div className="font-medium">{mockSpecifications.moisture}</div>
                                </div>
                                <div>
                                    <span className="text-sm text-muted-foreground">Broken:</span>
                                    <div className="font-medium">{mockSpecifications.broken}</div>
                                </div>
                                <div>
                                    <span className="text-sm text-muted-foreground">Defects:</span>
                                    <div className="font-medium">{mockSpecifications.defects}</div>
                                </div>
                                <div>
                                    <span className="text-sm text-muted-foreground">Min Shelf Life:</span>
                                    <div className="font-medium">{mockSpecifications.minShelfLife}</div>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-sm text-muted-foreground">Packaging:</span>
                                    <div className="font-medium">{mockSpecifications.packaging}</div>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-sm text-muted-foreground">Required Certifications:</span>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {mockSpecifications.certifications.map((cert, index) => (
                                            <Badge key={index} variant="secondary">{cert}</Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card> */}
                </div>

                {/* Sidebar - Responses */}
                <div className="space-y-6">
                    {/* All Responses */}
                    <Card className="h-[486px] flex flex-col">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center">
                                <MessageSquare size={18} className="mr-2" />
                                All Responses ({responses.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto pr-2">
                            <div className="space-y-3">
                                {responses.length === 0
                                    ? null
                                    : responses.map((response) => (
                                        <Card
                                            key={response.id}
                                            className="p-3 border cursor-pointer hover:bg-accent/50 transition-colors relative"
                                            onClick={() => handleResponseClick(response)}
                                        >
                                            <button
                                                className="absolute right-2 top-2 p-1 rounded-full hover:bg-accent transition-colors"
                                                onClick={(e) => handleDeleteResponse(response.id, e)}
                                                aria-label="Delete response"
                                            >
                                                <X className="h-4 w-4 text-muted-foreground" />
                                            </button>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="font-medium">{profile.companyName}</div>
                                                    <div className="text-sm text-muted-foreground flex items-center">
                                                        <MapPin size={12} className="mr-1" />
                                                        {response.merchantLocation}
                                                    </div>
                                                    {response.price && (
                                                        <div className="text-sm text-primary font-medium">
                                                            Merchant Price: {response.price}
                                                        </div>
                                                    )}
                                                    {response.quantity && (
                                                        <div className="text-sm text-muted-foreground">
                                                            Available: {response.quantity}
                                                        </div>
                                                    )}
                                                    {response.message && (
                                                        <div className="text-sm text-muted-foreground mt-1">
                                                            Remarks: {response.message}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <Badge
                                                        className={`text-xs capitalize ${getQuoteBadgeClasses(response.status)}`}
                                                    >
                                                        {response.status}
                                                    </Badge>
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        {new Date(response.responseDate).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* View All Responses Popup */}
            <Dialog open={showAllResponses} onOpenChange={setShowAllResponses}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center">
                            <MessageSquare size={20} className="mr-2" />
                            All Responses ({responses.length})
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        {responses.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                No responses yet. Merchants will see your requirement and can respond with their offers.
                            </div>
                        ) : (
                            responses.map((response) => (
                                <Card key={response.id} className="p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {/* Merchant Info */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-semibold text-lg">{response.merchantName}</h3>
                                                <Badge
                                                    variant={response.status === "new" ? "default" : "secondary"}
                                                    className="text-xs capitalize"
                                                >
                                                    {response.status.charAt(0).toUpperCase() + response.status.slice(1)}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center text-muted-foreground text-sm">
                                                <MapPin size={14} className="mr-1" />
                                                {response.merchantLocation}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                Origin: {response.origin}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                Contact: {response.contact}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                Message: {response.message}
                                            </div>
                                        </div>

                                        {/* Product Details */}
                                        <div className="space-y-2">
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div>
                                                    <span className="text-muted-foreground">Grade:</span>
                                                    <div className="font-medium">{response.grade}</div>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Quantity:</span>
                                                    <div className="font-medium">{response.quantity}</div>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Delivery:</span>
                                                    <div className="font-medium">{response.deliveryTime}</div>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Response Date:</span>
                                                    <div className="font-medium">
                                                        {new Date(response.responseDate).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground text-sm">Certifications:</span>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {response.certifications.map((cert, index) => (
                                                        <Badge key={index} variant="outline" className="text-xs">
                                                            {cert}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Price & Actions */}
                                        <div className="space-y-3">
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-primary">{response.price}</div>
                                                <div className="text-sm text-muted-foreground">per kg</div>
                                            </div>
                                            <div className="space-y-2">
                                                <Button
                                                    className="w-full"
                                                    onClick={async () => {
                                                        console.log('Placing order for response:', response.id);
                                                        try {
                                                            await updateResponseStatus(response.id, 'accepted');
                                                            console.log('Order placed successfully');
                                                            toast({
                                                                title: "Order Placed",
                                                                description: `Order placed with ${response.merchantName}`,
                                                            });
                                                        } catch (error) {
                                                            console.error('Error placing order:', error);
                                                            toast({
                                                                title: "Error",
                                                                description: "Failed to place order. Please try again.",
                                                                variant: "destructive"
                                                            });
                                                        }
                                                    }}
                                                >
                                                    Place Order
                                                </Button>
                                                <Button variant="outline" className="w-full">
                                                    <MessageSquare size={14} className="mr-2" />
                                                    Contact Merchant
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Response Detail Modal */}
            <Dialog open={showResponseDetail} onOpenChange={setShowResponseDetail}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Response Details</DialogTitle>
                    </DialogHeader>

                    {selectedResponse && (
                        <div className="space-y-4">
                            <div>
                                <div className="text-sm text-muted-foreground">Company Name</div>
                                <div className="font-medium">{profile.companyName}</div>
                            </div>

                            <div>
                                <div className="text-sm text-muted-foreground">Origin</div>
                                <div className="font-medium">
                                    {selectedResponse.origin
                                        ? selectedResponse.origin.charAt(0).toUpperCase() + selectedResponse.origin.slice(1)
                                        : ""}
                                </div>
                            </div>


                            <div>
                                <div className="text-sm text-muted-foreground">Merchant Price</div>
                                <div className="font-medium text-primary">{selectedResponse.price}</div>
                            </div>

                            <div>
                                <div className="text-sm text-muted-foreground">Available Quantity</div>
                                <div className="font-medium">{selectedResponse.quantity}</div>
                            </div>

                            <div>
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={selectedResponse.status || undefined}
                                    onValueChange={(value) => {
                                        setSelectedResponse({ ...selectedResponse, status: value });
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Confirmed">Confirmed</SelectItem>
                                        <SelectItem value="Rejected">Rejected</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="remarks">Remarks</Label>
                                    <textarea
                                        id="remarks"
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={selectedResponse.remarks || ""}
                                        onChange={(e) =>
                                            setSelectedResponse({ ...selectedResponse, remarks: e.target.value })
                                        }
                                        placeholder="Enter any remarks or notes..."
                                    />
                                </div>
                                <div className="flex gap-2 justify-end">
                                    <Button variant="outline" onClick={() => setShowResponseDetail(false)}>
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            const remarksInput = document.getElementById(
                                                "remarks"
                                            ) as HTMLTextAreaElement; // ✅ cast to textarea
                                            handleStatusUpdate(
                                                selectedResponse.id,
                                                selectedResponse.status,
                                                remarksInput.value // ✅ now TypeScript knows `.value`
                                            );
                                        }}
                                    >
                                        Submit
                                    </Button>
                                </div>
                            </div>

                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

// Response Detail Modal Component
const ResponseDetailModal = ({ isOpen, onClose, response, onStatusUpdate }: {
    isOpen: boolean;
    onClose: () => void;
    response: any;
    onStatusUpdate: (responseId: string, status: string, remarks?: string) => void;
}) => {
    const [selectedStatus, setSelectedStatus] = useState(response?.status || '');
    const [remarks, setRemarks] = useState(response?.remarks || '');

    const handleSubmit = () => {
        onStatusUpdate(response.id, selectedStatus, remarks);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Response Details</DialogTitle>
                </DialogHeader>

                {response && (
                    <div className="space-y-4">
                        <div>
                            <div className="text-sm text-muted-foreground">Company Name</div>
                            <div className="font-medium">{response.merchantName}</div>
                        </div>

                        <div>
                            <div className="text-sm text-muted-foreground">Origin</div>
                            <div className="font-medium">{response.origin}</div>
                        </div>

                        <div>
                            <div className="text-sm text-muted-foreground">Merchant Price</div>
                            <div className="font-medium text-primary">{response.price}</div>
                        </div>

                        <div>
                            <div className="text-sm text-muted-foreground">Available Quantity</div>
                            <div className="font-medium">{response.quantity}</div>
                        </div>

                        <div>
                            <Label htmlFor="status">Status</Label>
                            <Select value={selectedStatus || undefined} onValueChange={setSelectedStatus}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Confirmed">Confirmed</SelectItem>
                                    <SelectItem value="Rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex gap-2 justify-end">
                            <Button variant="outline" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button onClick={handleSubmit}>
                                Submit
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default RequirementDetails;