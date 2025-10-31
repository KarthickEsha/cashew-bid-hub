import { useEffect, useState, useMemo } from "react";
import { useProfile } from "@/hooks/useProfile";
import { useRequirements } from "@/hooks/useRequirements";
import { useOrders } from "@/hooks/useOrders";
import { useToast } from "@/components/ui/use-toast";
import { useUser } from "@clerk/clerk-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    MapPin,
    Calendar,
    TrendingUp,
    Filter,
    Search,
    Eye,
    Star,
    List,
    Grid3X3,
    ArrowUpDown,
    ArrowUp,
    ArrowDown
} from "lucide-react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Product, ProductType } from "@/types/user";
import { apiFetch } from "@/lib/api";

const Marketplace = () => {
    const { toast } = useToast();
    const { user } = useUser();
    const [merchant, setMerchant] = useState<Product | null>(null);
    const { addRequirement } = useRequirements();
    const { addOrder } = useOrders();
    const [filters, setFilters] = useState({
        search: "",
        grade: "",
        location: "",
        pricingType: "",
        minPrice: "",
        maxPrice: ""
    });

    const [bidAmount, setBidAmount] = useState<number | "">("");
    const [quantity, setQuantity] = useState<number | "">("");
    const [totalValue, setTotalValue] = useState<number>(0);
    const [currentProductType, setCurrentProductType] = useState<ProductType>();
    const { profile } = useProfile();
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
    const [sortConfig, setSortConfig] = useState<{
        key: string;
        direction: 'asc' | 'desc';
    } | null>(null);

    useEffect(() => {
        setSortConfig({ key: 'expiry', direction: 'desc' });
    }, []);

    useEffect(() => {
        if (profile?.productType && profile.productType !== 'Both') {
            setCurrentProductType(profile.productType);
        } else {
            setCurrentProductType('RCN');
        }
    }, [profile?.productType]);

    // Backend stocks mapped to marketplace display items
    const [products, setProducts] = useState<any[]>([]);
    
    // Dynamic filter options derived from products for the current product type
    const gradeOptions = useMemo(() => {
        const set = new Set<string>();
        products
            .filter((p) => !currentProductType || p.type === currentProductType)
            .forEach((p) => {
                const g = String(p?.grade || '').trim();
                if (g) set.add(g);
            });
        return Array.from(set).sort((a, b) => a.localeCompare(b));
    }, [products, currentProductType]);

    const originOptions = useMemo(() => {
        const set = new Set<string>();
        products
            .filter((p) => !currentProductType || p.type === currentProductType)
            .forEach((p) => {
                const o = String(p?.origin || '').trim();
                if (o) set.add(o);
            });
        return Array.from(set).sort((a, b) => a.localeCompare(b));
    }, [products, currentProductType]);

    // Ensure selected filter values remain valid when options change
    useEffect(() => {
        setFilters((prev) => {
            let next = { ...prev };
            if (prev.grade && !gradeOptions.includes(prev.grade)) {
                next.grade = "";
            }
            if (prev.location && !originOptions.includes(prev.location)) {
                next.location = "";
            }
            return next;
        });
    }, [gradeOptions, originOptions]);

    useEffect(() => {
        if (!currentProductType) return;
        const loadStocks = async () => {
            try {
                const role = String(profile?.role || '').toLowerCase();
                const view = role === 'processor' ? 'merchant' : 'buyer';
                const baseUrl = `/api/stocks/get-all-stocks?type=${encodeURIComponent(currentProductType)}&view=${view}`;
                const url = role === 'processor' && profile?.id ? `${baseUrl}&userId=${encodeURIComponent(profile.id)}` : baseUrl;
                const resp: any = await apiFetch(url, { method: "GET" });
                const list: any[] = Array.isArray(resp?.data) ? resp.data : Array.isArray(resp) ? resp : [];
                const mapped = list.map((s: any) => {
                    const price = Number(s?.sellingprice ?? 0);
                    const availableqty = Number(s?.availableqty ?? 0);
                    const location = s?.location || s?.origin || '';
                    const createdAt = s?.createdAt || s?.createdat || new Date().toISOString();
                    const rawType = String(s?.type ?? 'RCN');
                    const normalizedType = rawType.toLowerCase().startsWith('kern') ? 'Kernel' : 'RCN';
                    return {
                        id: String(s?.id || s?._id || Math.random().toString(36).slice(2)),
                        merchantName: s?.merchantCompanyName || profile?.companyName || "Your Company Name",
                        location: typeof location === 'string' ? location : String(location ?? ''),
                        origin: s?.origin || 'Not specified',
                        grade: s?.grade || 'RAW Cashews',
                        quantity: availableqty,
                        quantityUnit: 'kg',
                        pricePerTon: `$${price * 1000}`,
                        pricePerKg: `$${price}`,
                        pricingType: s?.pricingType || "fixed",
                        expiry: s?.expiredate ? String(s?.expiredate).slice(0, 10) : '',
                        type: normalizedType,
                        createdAt,
                        rating: 4.5,
                        verified: true,
                        description: s?.description || 'Premium quality cashews',
                        status: availableqty > 0 ? 'active' : 'out_of_stock'
                    };
                });
                setProducts(mapped);
            } catch (e) {
                // On error, keep empty list; you may toast if desired
                setProducts([]);
            }
        };
        loadStocks();
    }, [currentProductType]);

    const [filteredProducts, setFilteredProducts] = useState(products);

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(6);
    const itemsToShow = filteredProducts
        .filter((p) => p.type === currentProductType && Number(p.quantity) > 0)
        .sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    const totalPages = Math.ceil(itemsToShow.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const currentProducts = itemsToShow.slice(startIndex, startIndex + pageSize);

    // Sorting function
    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
        const sortedProducts = [...filteredProducts].sort((a, b) => {
            let aValue: any = a[key as keyof typeof a];
            let bValue: any = b[key as keyof typeof b];

            // Handle different data types
            if (key === 'quantity') {
                aValue = a.quantity;
                bValue = b.quantity;
            } else if (key === 'pricePerKg') {
                aValue = parseFloat(a.pricePerKg.replace('$', ''));
                bValue = parseFloat(b.pricePerKg.replace('$', ''));
            } else if (key === 'expiry') {
                aValue = new Date(a.expiry);
                bValue = new Date(b.expiry);
            } else if (key === 'createdAt') {
                aValue = new Date(a.createdAt as any);
                bValue = new Date(b.createdAt as any);
            } else if (key === 'rating') {
                aValue = a.rating;
                bValue = b.rating;
            } else {
                aValue = String(aValue).toLowerCase();
                bValue = String(bValue).toLowerCase();
            }
            if (aValue < bValue) {
                return direction === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return direction === 'asc' ? 1 : -1;
            }
            return 0;
        });

        setFilteredProducts(sortedProducts);
        setCurrentPage(1);
    };

    // Default to recent-first ordering whenever products change
    useEffect(() => {
        const sorted = [...products].sort((a: any, b: any) => {
            const aDate = new Date(a.createdAt || 0).getTime();
            const bDate = new Date(b.createdAt || 0).getTime();
            return bDate - aDate; // desc
        });
        setFilteredProducts(sorted);
        setCurrentPage(1);
    }, [products]);

    const formatWithCommas = (val: any) => {
        if (val === null || val === undefined) return "0";
        const num = typeof val === 'number' ? val : parseInt(String(val).replace(/,/g, ''), 10);
        if (isNaN(num)) return String(val);
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    const getSortIcon = (key: string) => {
        if (!sortConfig || sortConfig.key !== key) {
            return <ArrowUpDown size={16} className="text-muted-foreground" />;
        }
        return sortConfig.direction === 'asc'
            ? <ArrowUp size={16} className="text-primary" />
            : <ArrowDown size={16} className="text-primary" />;
    };
    useEffect(() => {
        if (bidAmount && quantity) {
            setTotalValue(Number(bidAmount) * Number(quantity));
        } else {
            setTotalValue(0);
        }
    }, [bidAmount, quantity]);

    const applyFilters = () => {
        let result = [...products];

        if (filters.search) {
            result = result.filter(
                (p) =>
                    p.merchantName.toLowerCase().includes(filters.search.toLowerCase()) ||
                    p.description.toLowerCase().includes(filters.search.toLowerCase())
            );
        }

        if (filters.grade) {
            result = result.filter((p) => String(p.grade).toLowerCase() === String(filters.grade).toLowerCase());
        }

        if (filters.location) {
            result = result.filter((p) => String(p.origin || p.location).toLowerCase() === String(filters.location).toLowerCase());
        }

        if (filters.pricingType) {
            result = result.filter((p) => p.pricingType === filters.pricingType);
        }

        if (filters.minPrice) {
            result = result.filter(
                (p) =>
                    parseInt(p.pricePerTon.replace(/[^0-9]/g, "")) >=
                    parseInt(filters.minPrice)
            );
        }

        if (filters.maxPrice) {
            result = result.filter(
                (p) =>
                    parseInt(p.pricePerTon.replace(/[^0-9]/g, "")) <=
                    parseInt(filters.maxPrice)
            );
        }

        setFilteredProducts(result);
        setCurrentPage(1);
    };

    // Auto-apply filters whenever filters or products change
    useEffect(() => {
        applyFilters();
    }, [filters, products]);

    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [showRequestDialog, setShowRequestDialog] = useState(false);
    const [showQuickOrderDialog, setShowQuickOrderDialog] = useState(false);
    const [requestQuantity, setRequestQuantity] = useState("");
    const [requestPrice, setRequestPrice] = useState("");
    const [requestMessage, setRequestMessage] = useState("");
    const [quickOrderQuantity, setQuickOrderQuantity] = useState("");

    const handleSendRequest = () => {
        if (!selectedProduct || !requestQuantity || !requestPrice) {
            toast({
                title: "Missing Information",
                description: "Please fill in all required fields.",
                variant: "destructive",
            });
            return;
        }

        // Create requirement from marketplace product
        addRequirement({
            customerName: user?.fullName || profile?.name || 'Anonymous Buyer',
            grade: selectedProduct.grade || 'N/A',
            quantity: `${requestQuantity} ${selectedProduct.quantityUnit}`,
            origin: selectedProduct.origin?.toLowerCase() || 'any',
            expectedPrice: parseFloat(requestPrice),
            minSupplyQuantity: requestQuantity,
            deliveryLocation: profile?.address || 'Not specified',
            city: profile?.city || 'Not specified',
            state: profile?.state || 'Not specified',
            country: profile?.country || 'India',
            deliveryDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            specifications: requestMessage || 'Standard quality requirements',
            allowLowerBid: true,
            date: new Date().toISOString().split('T')[0],
            status: 'active' as const,
            isDraft: false,
        });

        toast({
            title: "Request Sent Successfully",
            description: "Your request has been sent to the merchant.",
        });

        // Reset form and close dialog
        setRequestQuantity("");
        setRequestPrice("");
        setRequestMessage("");
        setShowRequestDialog(false);
        setSelectedProduct(null);
    };

    const handleQuickOrder = (product: any) => {
        setSelectedProduct(product);
        setShowQuickOrderDialog(true);
    };

    const handleConfirmQuickOrder = () => {
        if (!selectedProduct || !quickOrderQuantity) {
            toast({
                title: "Missing Information",
                description: "Please enter quantity.",
                variant: "destructive",
            });
            return;
        }

        // Create order directly
        const unitPrice = parseFloat(selectedProduct.pricePerKg.replace('$', ''));
        const totalAmount = unitPrice * parseFloat(quickOrderQuantity);


        const orderData = {
            id: `ORD-${Date.now()}`,
            requirementId: `REQ-${Date.now()}`,
            responseId: `RES-${Date.now()}`,
            productName: `${selectedProduct.grade} Cashews`,
            merchantName: profile?.companyName,
            merchantId: selectedProduct.id || 'merchant-1',
            customerName: user?.fullName || profile?.name || 'Anonymous Buyer',
            quantity: `${quickOrderQuantity} ${selectedProduct.quantityUnit}`,
            unitPrice: `₹${unitPrice}`,
            totalAmount: `₹${totalAmount.toFixed(2)}`,
            status: 'Processing' as const,
            orderDate: new Date().toISOString().split('T')[0],
            location: selectedProduct.location || 'N/A',
            grade: selectedProduct.grade,
            origin: selectedProduct.origin || 'N/A',
            productId: selectedProduct.id,
            source: 'marketplace',
            statusHistory: [{
                status: 'Processing',
                timestamp: new Date().toISOString(),
                remarks: 'Quick order placed from marketplace',
                updatedBy: user?.fullName || 'Customer'
            }],
        };
        addOrder(orderData);

        toast({
            title: "Enquiry Sent Successfully",
            description: "Your order has been placed and sent to the merchant.",
        });

        // Reset and close
        setQuickOrderQuantity("");
        setShowQuickOrderDialog(false);
        setSelectedProduct(null);
    };
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">Cashew Marketplace</h1>
                    <p className="text-sm sm:text-base text-muted-foreground">
                        Discover premium cashews from verified merchants worldwide
                    </p>
                </div>
                {/* 🔹 Filter and View Toggle Buttons */}
                <div className="flex items-center space-x-2">
                    {/* Product Type Selector */}
                    <Select value={currentProductType} onValueChange={(v) => setCurrentProductType(v as ProductType)}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Product Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="RCN">RCN</SelectItem>
                            <SelectItem value="Kernel">Kernel</SelectItem>
                        </SelectContent>
                    </Select>
                    {/* View Toggle Button (hidden on small screens) */}
                    <div className="hidden lg:flex border rounded-md">
                        <Button
                            variant={viewMode === 'card' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('card')}
                            className="rounded-r-none"
                        >
                            <Grid3X3 size={16} />
                        </Button>
                        <Button
                            variant={viewMode === 'list' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('list')}
                            className="rounded-l-none"
                        >
                            <List size={16} />
                        </Button>
                    </div>
                    {/* Filter Icon Button */}
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <Filter size={20} />
                    </Button>
                </div>
            </div>

            {/* Filters - show only when toggled */}
            {showFilters && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            Filter Products
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Search */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">Search</label>
                                <div className="relative">
                                    <Search
                                        size={16}
                                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                                    />
                                    <Input
                                        placeholder="Search"
                                        className="pl-10"
                                        value={filters.search}
                                        onChange={(e) =>
                                            setFilters({ ...filters, search: e.target.value })
                                        }
                                    />
                                </div>
                            </div>
                            {/* Grade */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">Grade</label>
                                <Select
                                    value={filters.grade}
                                    onValueChange={(value) =>
                                        setFilters({ ...filters, grade: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select grade" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {gradeOptions.length === 0 ? (
                                            <div className="px-3 py-2 text-sm text-muted-foreground">No grades available</div>
                                        ) : (
                                            gradeOptions.map((g) => (
                                                <SelectItem key={g} value={g}>{g}</SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                            {/* Location */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">Origin</label>
                                <Select
                                    value={filters.location}
                                    onValueChange={(value) =>
                                        setFilters({ ...filters, location: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select location" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {originOptions.length === 0 ? (
                                            <div className="px-3 py-2 text-sm text-muted-foreground">No origins available</div>
                                        ) : (
                                            originOptions.map((o) => (
                                                <SelectItem key={o} value={o}>{o}</SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Buttons removed: filters now auto-apply on change, keeping label alignment unchanged */}
                    </CardContent>
                </Card>
            )}

            {/* Products Display */}
            {currentProducts.length === 0 ? (
                <div className="text-center text-muted-foreground py-10 text-lg font-medium">
                    No data found for the selected filters.
                </div>
            ) : (
                <>
                    {/* Card View - always visible on mobile/tablet */}
                    <div className="grid lg:hidden grid-cols-1 md:grid-cols-2 gap-6">
                        {currentProducts.map((product) => (
                            <Card
                                key={product.id}
                                className="hover:shadow-warm transition-all duration-200 hover:-translate-y-1"
                            >
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="flex items-center justify-between mb-1">
                                                    <CardTitle className="text-base sm:text-lg md:text-xl">{product.merchantName || 'Your Company'}</CardTitle>
                                                    {/* {product.verified && (
                                                        <Badge variant="default" className="text-xs ml-2">
                                                            Verified
                                                        </Badge>
                                                    )} */}
                                                </div>

                                                <div className="flex items-center text-muted-foreground text-sm">
                                                    <MapPin size={14} className="mr-1" />
                                                    {product.origin}
                                                </div>
                                            </div>
                                            {/* <div className="flex items-center space-x-1">
                                                <Star size={14} className="text-yellow-500 fill-current" />
                                                <span className="text-sm font-medium">{product.rating}</span>
                                            </div> */}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <p className="text-sm sm:text-base text-muted-foreground">{product.description}</p>

                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <span className="text-muted-foreground">Grade:</span>
                                                <div className="font-semibold">{product.grade}</div>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Quantity:</span>
                                                <div className="font-semibold">
                                                    {product.quantity?.toLocaleString('en-IN')} {product.quantityUnit}
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Price:</span>
                                                <div className="font-semibold text-primary">
                                                    ₹{Number(String(product.pricePerKg).replace('$', '')).toLocaleString("en-IN")}/kg
                                                </div>
                                            </div>
                                            {/* <div>
                                                <span className="text-muted-foreground">Type:</span>
                                                <div className="flex items-center">
                                                    {product.pricingType === "bidding" && (
                                                        <TrendingUp size={14} className="mr-1 text-primary" />
                                                    )}
                                                    <span className="font-semibold capitalize">
                                                        {product.pricingType}
                                                    </span>
                                                </div>
                                            </div> */}
                                        </div>

                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <Calendar size={14} className="mr-1" />
                                            Stock Available Until: {new Date(product.expiry).toLocaleDateString()}
                                        </div>

                                        <div className="flex space-x-2 pt-2">
                                            <Link to={`/product/${product.id}`} className="flex-1">
                                                <Button size="sm" className="w-full">
                                                    <Eye size={14} className="mr-2" />
                                                    View Details
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Card View - desktop only when selected */}
                    {viewMode === 'card' && (
                        <div className="hidden lg:grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {currentProducts.map((product) => (
                                <Card
                                    key={product.id}
                                    className="hover:shadow-warm transition-all duration-200 hover:-translate-y-1"
                                >
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="flex items-center justify-between mb-1">
                                                    <CardTitle className="text-lg">{product.merchantName || 'Your Company'}</CardTitle>
                                                </div>

                                                <div className="flex items-center text-muted-foreground text-sm">
                                                    <MapPin size={14} className="mr-1" />
                                                    {product.origin}
                                                </div>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <p className="text-sm text-muted-foreground">{product.description}</p>

                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <span className="text-xs sm:text-sm text-muted-foreground">Grade:</span>
                                                <div className="font-semibold text-sm sm:text-base md:text-lg">{product.grade}</div>
                                            </div>
                                            <div>
                                                <span className="text-xs sm:text-sm text-muted-foreground">Quantity:</span>
                                                <div className="font-semibold text-sm sm:text-base md:text-lg">
                                                    {product.quantity?.toLocaleString('en-IN')} {product.quantityUnit}
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-xs sm:text-sm text-muted-foreground">Price:</span>
                                                <div className="font-semibold text-primary text-sm sm:text-base md:text-lg">
                                                    ₹{Number(String(product.pricePerKg).replace('$', '')).toLocaleString("en-IN")}/kg
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                                            <Calendar size={14} className="mr-1" />
                                            Stock Available Until: {new Date(product.expiry).toLocaleDateString()}
                                        </div>

                                        <div className="flex space-x-2 pt-2">
                                            <Link to={`/product/${product.id}`} className="flex-1">
                                                <Button size="sm" className="w-full">
                                                    <Eye size={14} className="mr-2" />
                                                    View Details
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Pagination for Card View - always on mobile/tablet */}
                    {itemsToShow.length > 0 && (
                        <div className="lg:hidden flex items-center justify-between px-4 py-3">
                            <div className="text-sm text-muted-foreground">
                                Showing {startIndex + 1} to {Math.min(startIndex + pageSize, itemsToShow.length)} of {itemsToShow.length} products
                            </div>
                            <div className="flex items-center space-x-4">
                                <Select
                                    value={String(pageSize)}
                                    onValueChange={(value) => {
                                        setPageSize(Number(value));
                                        setCurrentPage(1);
                                    }}
                                >
                                    <SelectTrigger className="w-[100px] h-8">
                                        <SelectValue placeholder="Page size" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="6">6</SelectItem>
                                        <SelectItem value="12">12</SelectItem>
                                        <SelectItem value="24">24</SelectItem>
                                        <SelectItem value="48">48</SelectItem>
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
                    )}

                    {/* List/Table View */}
                    {viewMode === 'list' && (
                        <Card className="hidden lg:block">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead
                                            className="cursor-pointer hover:bg-muted/50"
                                            onClick={() => handleSort('grade')}
                                        >
                                            <div className="flex items-center space-x-2">
                                                <span>Grade</span>
                                                {getSortIcon('grade')}
                                            </div>
                                        </TableHead>
                                        <TableHead
                                            className="cursor-pointer hover:bg-muted/50"
                                            onClick={() => handleSort('origin')}
                                        >
                                            <div className="flex items-center space-x-2">
                                                <span>Origin</span>
                                                {getSortIcon('origin')}
                                            </div>
                                        </TableHead>
                                        <TableHead
                                            className="cursor-pointer hover:bg-muted/50"
                                            onClick={() => handleSort('quantity')}
                                        >
                                            <div className="flex items-center space-x-2">
                                                <span>Quantity</span>
                                                {getSortIcon('quantity')}
                                            </div>
                                        </TableHead>
                                        <TableHead
                                            className="cursor-pointer hover:bg-muted/50"
                                            onClick={() => handleSort('pricePerKg')}
                                        >
                                            <div className="flex items-center space-x-2">
                                                <span>Price/kg</span>
                                                {getSortIcon('pricePerKg')}
                                            </div>
                                        </TableHead>
                                        <TableHead
                                            className="cursor-pointer hover:bg-muted/50"
                                            onClick={() => handleSort('expiry')}
                                        >
                                            <div className="flex items-center space-x-2">
                                                <span>Expiry Date</span>
                                                {getSortIcon('expiry')}
                                            </div>
                                        </TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {currentProducts.map((product) => (
                                        <TableRow key={product.id}>
                                            <TableCell>
                                                <Badge variant="outline" className="font-medium">
                                                    {product.grade}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center text-muted-foreground">
                                                    <MapPin size={14} className="mr-1" />
                                                    {product.origin}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {formatWithCommas(product.quantity)} {product.quantityUnit}
                                            </TableCell>
                                            <TableCell className="font-semibold text-primary">
                                                ₹{Number(String(product.pricePerKg).replace('$', '')).toLocaleString("en-IN")}/kg
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {new Date(product.expiry).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex space-x-2">
                                                    <Link to={`/product/${product.id}`}>
                                                        <Button size="sm" variant="outline">
                                                            <Eye size={14} className="mr-1" />
                                                            View
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {/* Table Pagination */}
                            {totalPages >= 1 && (
                                <div className="flex items-center justify-between px-4 py-3 border-t">
                                    <div className="text-sm text-muted-foreground">
                                        Showing {startIndex + 1} to {Math.min(startIndex + pageSize, itemsToShow.length)} of {itemsToShow.length} products
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <Select
                                            value={String(pageSize)}
                                            onValueChange={(value) => {
                                                setPageSize(Number(value));
                                                setCurrentPage(1);
                                            }}
                                        >
                                            <SelectTrigger className="w-[100px] h-8">
                                                <SelectValue placeholder="Page size" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="6">6</SelectItem>
                                                <SelectItem value="12">12</SelectItem>
                                                <SelectItem value="24">24</SelectItem>
                                                <SelectItem value="48">48</SelectItem>
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
                            )}
                        </Card>
                    )}

                    {/* Pagination for Card View - desktop when card view selected */}
                    {viewMode === 'card' && itemsToShow.length > 0 && (
                        <div className="hidden lg:flex items-center justify-between px-4 py-3">
                            <div className="text-sm text-muted-foreground">
                                Showing {startIndex + 1} to {Math.min(startIndex + pageSize, itemsToShow.length)} of {itemsToShow.length} products
                            </div>
                            <div className="flex items-center space-x-4">
                                <Select
                                    value={String(pageSize)}
                                    onValueChange={(value) => {
                                        setPageSize(Number(value));
                                        setCurrentPage(1);
                                    }}
                                >
                                    <SelectTrigger className="w-[100px] h-8">
                                        <SelectValue placeholder="Page size" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="6">6</SelectItem>
                                        <SelectItem value="12">12</SelectItem>
                                        <SelectItem value="24">24</SelectItem>
                                        <SelectItem value="48">48</SelectItem>
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
                    )}
                </>
            )}

            {/* Request Dialog */}
            <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Send Product Request</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <h4 className="font-medium">{selectedProduct?.grade} Cashews</h4>
                            <p className="text-sm text-muted-foreground">
                                From {selectedProduct?.merchantName} - {selectedProduct?.origin}
                            </p>
                            <p className="text-sm font-medium text-primary">
                                {selectedProduct?.pricePerKg}/kg
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Quantity ({selectedProduct?.quantityUnit})</label>
                            <Input
                                type="number"
                                placeholder="Enter quantity needed"
                                value={requestQuantity}
                                onChange={(e) => setRequestQuantity(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Expected Price (₹/{selectedProduct?.quantityUnit})</label>
                            <Input
                                type="number"
                                placeholder="Enter your expected price"
                                value={requestPrice}
                                onChange={(e) => setRequestPrice(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Message (Optional)</label>
                            <Textarea
                                placeholder="Add any specific requirements..."
                                value={requestMessage}
                                onChange={(e) => setRequestMessage(e.target.value)}
                                rows={3}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowRequestDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSendRequest}>
                            Send Request
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Quick Order Dialog */}
            <Dialog open={showQuickOrderDialog} onOpenChange={setShowQuickOrderDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Quick Order</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="p-4 border rounded-lg bg-primary/5">
                            <h4 className="font-medium">{selectedProduct?.grade} Cashews</h4>
                            <p className="text-sm text-muted-foreground">
                                From {profile?.companyName} - {selectedProduct?.origin}
                            </p>
                            <p className="text-lg font-bold text-primary mt-2">
                                {selectedProduct?.pricePerKg}/{selectedProduct?.quantityUnit}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Quantity ({selectedProduct?.quantityUnit})</label>
                            <Input
                                type="number"
                                placeholder="Enter quantity to order"
                                value={quickOrderQuantity}
                                onChange={(e) => setQuickOrderQuantity(e.target.value)}
                            />
                            {quickOrderQuantity && selectedProduct && (
                                <p className="text-sm text-muted-foreground">
                                    Total: ₹{(parseFloat(selectedProduct.pricePerKg.replace('$', '')) * parseFloat(quickOrderQuantity)).toFixed(2)}
                                </p>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowQuickOrderDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleConfirmQuickOrder}>
                            Place Order
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Marketplace;