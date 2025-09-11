import { useEffect, useState, useMemo } from "react";
import { useInventory } from "@/hooks/useInventory";
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

const Marketplace = () => {
    const { toast } = useToast();
    const { user } = useUser();
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

    const [showFilters, setShowFilters] = useState(false); // 🔹 state for filter toggle
    const [viewMode, setViewMode] = useState<'card' | 'list'>('card'); // 🔹 state for view toggle
    const [sortConfig, setSortConfig] = useState<{
        key: string;
        direction: 'asc' | 'desc';
    } | null>(null); // 🔹 state for sorting

    // Get products and delete function from inventory

    const { products: inventoryProducts, deleteProduct } = useInventory();

    // Get merchant's company name from profile
    const { profile } = useProfile();
    const merchantCompanyName = profile?.companyName || "Your Company Name";

    // Handle product deletion (for merchants)
    const handleDeleteProduct = (productId: string) => {
        deleteProduct(productId);
        // The inventoryProducts will automatically update due to the useInventory hook
    };

    // Combine demo products with merchant products
    const products = useMemo(() => {
        const demoProducts = [
            // {
            // id: 1,
            // merchantName: merchantCompanyName,
            // location: "Mumbai, India",
            // origin: "Kerala, India",
            // grade: "W320",
            // quantity: 50,
            // quantityUnit: "tons",
            // pricePerTon: "$8,500",
            // pricePerKg: "$8.50",
            // pricingType: "fixed",
            // expiry: "2024-12-15",
            // rating: 4.8,
            // verified: true,
            // description: "Premium grade W320 cashews from Kerala, India"
            // },
            // {
            // id: 2,
            // merchantName: merchantCompanyName,
            // location: "Ho Chi Minh City, Vietnam",
            // origin: "Binh Phuoc, Vietnam",
            // grade: "SW240",
            // quantity: 100,
            // quantityUnit: "tons",
            // pricePerTon: "$9,200",
            // pricePerKg: "$9.20",
            // pricingType: "bidding",
            // expiry: "2024-11-30",
            // rating: 4.9,
            // verified: true,
            // description: "High quality SW240 cashews for export"
            // },
            // {
            // id: 3,
            // merchantName: merchantCompanyName,
            // location: "California, USA",
            // origin: "Ghana, West Africa",
            // grade: "W240",
            // quantity: 25,
            // quantityUnit: "tons",
            // pricePerTon: "$8,800",
            // pricePerKg: "$8.80",
            // pricingType: "fixed",
            // expiry: "2024-10-20",
            // rating: 4.6,
            // verified: false,
            // description: "Organic W240 cashews, premium quality"
            // },
            // {
            // id: 4,
            // merchantName: merchantCompanyName,
            // location: "Accra, Ghana",
            // origin: "Northern Ghana",
            // grade: "W180",
            // quantity: 75,
            // quantityUnit: "tons",
            // pricePerTon: "$7,200",
            // pricePerKg: "$7.20",
            // pricingType: "bidding",
            // expiry: "2024-12-01",
            // rating: 4.7,
            // verified: true,
            // description: "Premium W180 cashews from Ghana"
            // },
            // {
            // id: 5,
            // merchantName: merchantCompanyName,
            // location: "São Paulo, Brazil",
            // origin: "Ceará, Brazil",
            // grade: "SW320",
            // quantity: 40,
            // quantityUnit: "tons",
            // pricePerTon: "$8,000",
            // pricePerKg: "$8.00",
            // pricingType: "fixed",
            // expiry: "2024-11-15",
            // rating: 4.5,
            // verified: true,
            // description: "High quality SW320 cashews from Brazil"
            // },
            // {
            // id: 6,
            // merchantName: merchantCompanyName,
            // location: "Dar es Salaam, Tanzania",
            // origin: "Mtwara, Tanzania",
            // grade: "W240",
            // quantity: 60,
            // quantityUnit: "tons",
            // pricePerTon: "$7,800",
            // pricePerKg: "$7.80",
            // pricingType: "bidding",
            // expiry: "2024-12-30",
            // rating: 4.4,
            // verified: false,
            // description: "Organic W240 cashews from Tanzania"
            // },
        ];

        // Convert inventory products to marketplace format
        const merchantProducts = inventoryProducts.map((product, index) => ({
            id: product.id,
            merchantName: "Your Company Name", // Hardcoded company name
            location: typeof product.location === 'string'
                ? product.location
                : [
                    (product.location as any)?.city,
                    (product.location as any)?.region,
                    (product.location as any)?.country
                ].filter(Boolean).join(', '),
            origin: product.origin || 'Not specified',
            grade: product.grade || 'N/A',
            quantity: product.stock,
            quantityUnit: product.unit || 'kg',
            pricePerTon: `$${product.price * 1000}`, // Assuming price is per kg
            pricePerKg: `$${product.price}`,
            pricingType: "fixed",
            expiry: product.expireDate,
            rating: 4.5, // Default rating
            verified: true,
            description: product.description || 'Premium quality cashews',
            status: product.status || 'active'
        }));

        return [...demoProducts, ...merchantProducts];
    }, [inventoryProducts]);

    const [filteredProducts, setFilteredProducts] = useState(products);

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(6);
    const itemsToShow = filteredProducts;
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
            result = result.filter((p) => p.grade === filters.grade);
        }

        if (filters.location) {
            result = result.filter((p) =>
                p.location.toLowerCase().includes(filters.location.toLowerCase())
            );
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

    const clearFilters = () => {
        setFilters({
            search: "",
            grade: "",
            location: "",
            pricingType: "",
            minPrice: "",
            maxPrice: ""
        });
        setFilteredProducts(products);
        setCurrentPage(1);
    };

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
            city: profile?.location || 'Not specified',
            country: 'India',
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

        addOrder({
            requirementId: `REQ-${Date.now()}`,
            responseId: `RES-${Date.now()}`,
            productName: `${selectedProduct.grade} Cashews`,
            merchantName: selectedProduct.merchantName,
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
            statusHistory: [{
                status: 'Processing',
                timestamp: new Date().toISOString(),
                remarks: 'Quick order placed from marketplace',
                updatedBy: user?.fullName || 'Customer'
            }],
        });

        toast({
            title: "Order Placed Successfully",
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
                    <h1 className="text-3xl font-bold text-foreground mb-2">Cashew Marketplace</h1>
                    <p className="text-muted-foreground">
                        Discover premium cashews from verified merchants worldwide
                    </p>
                </div>
                {/* 🔹 Filter and View Toggle Buttons */}
                <div className="flex items-center space-x-2">
                    {/* View Toggle Button */}
                    <div className="flex border rounded-md">
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
                            <Filter size={20} className="mr-2" />
                            Filter Products
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
                                        <SelectItem value="W180">W180</SelectItem>
                                        <SelectItem value="W240">W240</SelectItem>
                                        <SelectItem value="W320">W320</SelectItem>
                                        <SelectItem value="SW240">SW240</SelectItem>
                                        <SelectItem value="SW320">SW320</SelectItem>
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
                                        <SelectItem value="india">India</SelectItem>
                                        <SelectItem value="vietnam">Vietnam</SelectItem>
                                        <SelectItem value="ghana">Ghana</SelectItem>
                                        <SelectItem value="usa">USA</SelectItem>
                                        <SelectItem value="any">Any</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {/* Pricing Type */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">Pricing Type</label>
                                <Select
                                    value={filters.pricingType}
                                    onValueChange={(value) =>
                                        setFilters({ ...filters, pricingType: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="fixed">Fixed Price</SelectItem>
                                        <SelectItem value="bidding">Bidding</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {/* Price Range */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">
                                    Price Range ($/ton)
                                </label>
                                <div className="flex space-x-2">
                                    <Input
                                        placeholder="Min"
                                        value={filters.minPrice}
                                        onChange={(e) =>
                                            setFilters({ ...filters, minPrice: e.target.value })
                                        }
                                    />
                                    <Input
                                        placeholder="Max"
                                        value={filters.maxPrice}
                                        onChange={(e) =>
                                            setFilters({ ...filters, maxPrice: e.target.value })
                                        }
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end mt-4 space-x-3">
                            <Button variant="outline" onClick={clearFilters}>
                                Clear Filters
                            </Button>
                            <Button onClick={applyFilters}>Apply Filters</Button>
                        </div>
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
                    {/* Card View */}
                    {viewMode === 'card' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {currentProducts.map((product) => (
                                <Card
                                    key={product.id}
                                    className="hover:shadow-warm transition-all duration-200 hover:-translate-y-1"
                                >
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="flex items-center justify-between mb-1 px-2">
                                                    <CardTitle className="text-lg">{profile?.companyName || 'Your Company'}</CardTitle>
                                                    {product.verified && (
                                                        <Badge variant="default" className="text-xs ml-2">
                                                            Verified
                                                        </Badge>
                                                    )}
                                                </div>

                                                <div className="flex items-center text-muted-foreground text-sm">
                                                    <MapPin size={14} className="mr-1" />
                                                    {product.origin}
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <Star size={14} className="text-yellow-500 fill-current" />
                                                <span className="text-sm font-medium">{product.rating}</span>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <p className="text-sm text-muted-foreground">{product.description}</p>

                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <span className="text-muted-foreground">Grade:</span>
                                                <div className="font-semibold">{product.grade}</div>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Quantity:</span>
                                                <div className="font-semibold">{product.quantity} {product.quantityUnit}</div>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Price:</span>
                                                <div className="font-semibold text-primary">
                                                    {product.pricePerKg}/kg
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Type:</span>
                                                <div className="flex items-center">
                                                    {product.pricingType === "bidding" && (
                                                        <TrendingUp size={14} className="mr-1 text-primary" />
                                                    )}
                                                    <span className="font-semibold capitalize">
                                                        {product.pricingType}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <Calendar size={14} className="mr-1" />
                                            Expires: {new Date(product.expiry).toLocaleDateString()}
                                        </div>

                                        <div className="flex space-x-2 pt-2">
                                            <Link to={`/product/${product.id}`} className="flex-1">
                                                <Button size="sm" className="w-full">
                                                    <Eye size={14} className="mr-2" />
                                                    View Details
                                                </Button>
                                            </Link>
                                            {product.pricingType === "bidding" ? (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setSelectedProduct(product);
                                                        setShowRequestDialog(true);
                                                    }}
                                                >
                                                    Place Bid
                                                </Button>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleQuickOrder(product)}
                                                >
                                                    Quick Order
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* List/Table View */}
                    {viewMode === 'list' && (
                        <Card>
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
                                            onClick={() => handleSort('pricingType')}
                                        >
                                            <div className="flex items-center space-x-2">
                                                <span>Type</span>
                                                {getSortIcon('pricingType')}
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
                                                {product.quantity} {product.quantityUnit}
                                            </TableCell>
                                            <TableCell className="font-semibold text-primary">
                                                {product.pricePerKg}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    {product.pricingType === "bidding" && (
                                                        <TrendingUp size={14} className="mr-1 text-primary" />
                                                    )}
                                                    <Badge
                                                        variant={product.pricingType === "bidding" ? "default" : "secondary"}
                                                        className="capitalize"
                                                    >
                                                        {product.pricingType}
                                                    </Badge>
                                                </div>
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
                                                    {product.pricingType === "bidding" ? (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => {
                                                                setSelectedProduct(product);
                                                                setShowRequestDialog(true);
                                                            }}
                                                        >
                                                            Place Bid
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleQuickOrder(product)}
                                                        >
                                                            Quick Order
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {/* Table Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between mt-4">
                                    <div className="text-sm text-muted-foreground">
                                        Showing {startIndex + 1} to {" "}
                                        {Math.min(startIndex + pageSize, itemsToShow.length)} of {" "}
                                        {itemsToShow.length} products
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        {/* Page Size Selector */}
                                        <Select
                                            value={String(pageSize)}
                                            onValueChange={(value) => {
                                                setPageSize(Number(value));
                                                setCurrentPage(1);
                                            }}
                                        >
                                            <SelectTrigger className="w-[100px]">
                                                <SelectValue placeholder="Page size" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="6">6</SelectItem>
                                                <SelectItem value="12">12</SelectItem>
                                                <SelectItem value="24">24</SelectItem>
                                                <SelectItem value="48">48</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        {/* Prev/Next Buttons */}
                                        <div className="flex space-x-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                disabled={currentPage === 1}
                                            >
                                                Previous
                                            </Button>
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
                                </div>
                            )}
                        </Card>
                    )}

                    {/* Pagination for Card View */}
                    {viewMode === 'card' && itemsToShow.length > 0 && (
                        <div className="flex items-center justify-between mt-4">
                            <div className="text-sm text-muted-foreground">
                                Showing {startIndex + 1} to {" "}
                                {Math.min(startIndex + pageSize, itemsToShow.length)} of {" "}
                                {itemsToShow.length} products
                            </div>
                            <div className="flex items-center space-x-4">
                                {/* Page Size Selector */}
                                <Select
                                    value={String(pageSize)}
                                    onValueChange={(value) => {
                                        setPageSize(Number(value));
                                        setCurrentPage(1);
                                    }}
                                >
                                    <SelectTrigger className="w-[100px]">
                                        <SelectValue placeholder="Page size" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="6">6</SelectItem>
                                        <SelectItem value="12">12</SelectItem>
                                        <SelectItem value="24">24</SelectItem>
                                        <SelectItem value="48">48</SelectItem>
                                    </SelectContent>
                                </Select>

                                {/* Prev/Next Buttons */}
                                <div className="flex space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                    >
                                        Previous
                                    </Button>
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