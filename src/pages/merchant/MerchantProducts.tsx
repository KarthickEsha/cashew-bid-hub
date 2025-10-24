import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useInventory } from "@/hooks/useInventory";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/components/ui/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ProductListTable from "@/components/ProductListTable";
import ChatModal from "@/components/ChatModal";
import EnquireModal from "@/components/EnquireModal";
import MerchantBidManagement from "@/components/MerchantBidManagement";
import ProductTypeToggle from "@/components/ProductTypeToggle";
import EnquiryOrderDrawer from "@/components/EnquiryOrderDrawer";
import { ProductType, Product } from "@/types/user";
import {
    Package,
    Search,
    Eye,
    Edit,
    MessageSquare,
    Plus,
    Filter,
    MoreHorizontal,
    ShoppingCart,
    AlertCircle,
    TrendingUp,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useRole } from "@/hooks/useRole";

const MerchantProducts = () => {
    const navigate = useNavigate();
    const { products, deleteProduct } = useInventory();
    const { profile } = useProfile();
    const uiRole = useRole(state => state.role);

    const [merchant, setMerchant] = useState<{
          id: string;
          name: string;
          rating?: number;
          totalOrders?: number;
          location: string | Location;
          verified?: boolean;
          responseTime?: string;
          phone?: string;
          email?: string;
          website?: string;
          description?: string;
        } | null>(null);
    const { toast } = useToast();

    // Keep local state for products so we can update them
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [productToDelete, setProductToDelete] = useState<string | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    // Determine current product type for display
    const getInitialProductType = (): ProductType => {
        if (profile?.productType === "Both") {
            return "RCN"; // Default to RCN when both are available
        }
        return profile?.productType || "RCN";
    };

    const [currentProductType, setCurrentProductType] =
        useState<ProductType>(getInitialProductType());

    // Products loaded from API (stocks)
    const [apiProducts, setApiProducts] = useState<Product[]>([]);
    // Keep per-type API lists so we can render empty when a type has no results
    type StockType = 'RCN' | 'Kernel';
    const [apiByType, setApiByType] = useState<Record<StockType, Product[] | undefined>>({
        RCN: undefined,
        Kernel: undefined,
    });
    // LocalStorage key for sidebar counts
    const STOCK_COUNTS_KEY = "stocks_counts_v1";

    // Filter products based on current type (prefer API-loaded stocks if present)
    const filteredProductsByType = useMemo(() => {
        if (!profile) return [];

        // If we've fetched for the current type (even if it returned 0), use that explicitly
        const fetchedForType = apiByType[currentProductType];
        if (fetchedForType !== undefined) {
            return fetchedForType;
        }
        // Otherwise (before first fetch), fallback to local inventory filtered by type
        return products.filter(p => p.type === currentProductType);
    }, [products, apiProducts, apiByType, currentProductType, profile]);

    // filters state
    const [filters, setFilters] = useState({
        search: "",
        grade: "",
        location: "",
        minPrice: "",
        maxPrice: "",
        status: "",
    });

    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

    // pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [pageSize, setPageSize] = useState(5); // 
    const totalPages = Math.ceil(filteredProducts.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedProducts = filteredProducts.slice(
        startIndex,
        startIndex + pageSize
    );

    // popup state
    const [open, setOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [showChatModal, setShowChatModal] = useState(false);
    const [showEnquireModal, setShowEnquireModal] = useState(false);
    const [showBidManagement, setShowBidManagement] = useState(false);
    const [chatProduct, setChatProduct] = useState<any>(null);
    const [enquireProduct, setEnquireProduct] = useState<any>(null);
    const [bidProduct, setBidProduct] = useState<any>(null);
    const [showEditStockModal, setShowEditStockModal] = useState(false);
    const [editStockData, setEditStockData] = useState<any>({
        stock: '',
        price: '',
        expireDate: '',
        location: ''
    });

    // applyFilters is now handled by the useEffect above
    const applyFilters = () => {
        // Just close the filters panel - filtering is handled by the useEffect
        setShowFilters(false);
    };

    const clearFilters = () => {
        setFilters({
            search: "",
            grade: "",
            location: "",
            minPrice: "",
            maxPrice: "",
            status: "",
        });
        setFilteredProducts(filteredProductsByType);
        setCurrentPage(1);
    };

    const [showFilters, setShowFilters] = useState(false);

    // Update current product type when profile changes (from RoleSwitcher)
    useEffect(() => {
        if (profile?.productType && profile.productType !== "Both") {
            setCurrentProductType(profile.productType);
        }
    }, [profile?.productType]);

    // Update filtered products when product type or filters change
    useEffect(() => {
        if (!profile) return;

        let result = [...filteredProductsByType];

        // Apply search filter
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            result = result.filter(p =>
                p.name.toLowerCase().includes(searchTerm) ||
                (p.grade && p.grade.toLowerCase().includes(searchTerm)) ||
                (p.type === 'RCN' && p.yearOfCrop?.toLowerCase().includes(searchTerm))
            );
        }

        // Apply grade filter for Kernel
        if (filters.grade && currentProductType === 'Kernel') {
            result = result.filter(p => p.grade === filters.grade);
        }

        // Apply location filter
        if (filters.location) {
            const locationTerm = filters.location.toLowerCase();
            result = result.filter(p =>
                (typeof p.location === "string" && p.location.toLowerCase().includes(locationTerm)) ||
                (p.origin && typeof p.origin === "string" && p.origin.toLowerCase().includes(locationTerm))
            );
        }

        // Apply status filter
        if (filters.status) {
            result = result.filter(p => p.status === filters.status);
        }

        // Apply price range filter
        if (filters.minPrice) {
            const minPrice = parseFloat(filters.minPrice);
            if (!isNaN(minPrice)) {
                result = result.filter(p => p.price >= minPrice);
            }
        }

        if (filters.maxPrice) {
            const maxPrice = parseFloat(filters.maxPrice);
            if (!isNaN(maxPrice)) {
                result = result.filter(p => p.price <= maxPrice);
            }
        }

        setFilteredProducts(result);
        setCurrentPage(1); // Reset to first page when filters change
    }, [filteredProductsByType, filters, currentProductType, profile]);

    // Initialize and sync products
    useEffect(() => {
        if (products.length > 0) {
            setAllProducts(products);
            setIsLoading(false);
        }
    }, [products]);

    // Load stocks from backend API and map to Product shape expected by ProductListTable
    useEffect(() => {
        const loadStocks = async () => {
            try {
                setIsLoading(true);
                const effectiveRole = String(uiRole || profile?.role || '').toLowerCase();
                const view = effectiveRole === 'processor' ? 'merchant' : 'buyer';
                // Prefer backend type filtering if supported
                const baseUrl = `/api/stocks/get-all-stocks?type=${encodeURIComponent(currentProductType)}&view=${view}`;
                const url = effectiveRole === 'processor' && profile?.id ? `${baseUrl}&userId=${encodeURIComponent(profile.id)}` : baseUrl;
                const resp = await apiFetch(url, { method: "GET" });
                const stocks = Array.isArray(resp?.data) ? resp.data : [];

                // Map backend stock to Product
                // Backend fields: grade, origin, availableqty, minimumqty, sellingprice, location, description, created_at
                const mapped: Product[] = stocks.map((s: any, idx: number) => ({
                    id: String(s.id || s._id || idx),
                    name: s.description || s.grade || "Stock",
                    type: s.type,
                    grade: s.grade,
                    stock: Number(s.availableqty ?? 0),
                    price: Number(s.sellingprice ?? 0),
                    unit: "kg",
                    location: s.location || s.origin || "",
                    expireDate: s.expiredate ? String(s.expiredate).slice(0, 10) : "",
                    status: (s.availableqty ?? 0) > 0 ? "active" : "out_of_stock",
                    enquiries: 0,
                    orders: 0,
                    buyerResponses: 0,
                    availableQty: Number(s.availableqty ?? 0), // used by table
                    images: [],
                    yearOfCrop: s.yearofcrop ? String(s.yearofcrop) : undefined,
                   nutCount: s.netcount ? `${s.netcount} kg` : undefined,
                    outTurn: s.outturn ? `${s.outturn} %` : undefined,
                    origin: s.origin,
                }));

                // Enforce client-side type filter for safety
                const byType = mapped.filter(p => p.type === currentProductType);
                setApiProducts(byType);
                setApiByType(prev => ({ ...prev, [currentProductType]: byType }));

                // Compute and persist counts for the CURRENT type only (preserve other type)
                try {
                    const currentCounts = {
                        active: byType.filter(i => i.status === "active").length,
                        out_of_stock: byType.filter(i => i.status === "out_of_stock").length,
                    };
                    let existing: any = undefined;
                    try {
                        const raw = localStorage.getItem(STOCK_COUNTS_KEY);
                        existing = raw ? JSON.parse(raw) : undefined;
                    } catch { }
                    const prevCounts = existing?.counts || {};
                    const merged = {
                        counts: {
                            ...prevCounts,
                            [currentProductType]: currentCounts,
                        },
                        updatedAt: Date.now(),
                    };
                    localStorage.setItem(STOCK_COUNTS_KEY, JSON.stringify(merged));
                } catch { /* ignore storage errors */ }

                // Let listeners (sidebar) refresh counts
                window.dispatchEvent(new CustomEvent('stocks:changed'));
            } catch (err: any) {
                // toast({
                //     title: "Failed to load stocks",
                //     description: err?.message || "Please try again.",
                //     variant: "destructive",
                // });
            } finally {
                setIsLoading(false);
            }
        };

        loadStocks();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentProductType, uiRole]);

    const handleDeleteClick = (productId: string) => {
        setProductToDelete(productId);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!productToDelete) return;

        try {
            // If the product exists in API-loaded list, delete from backend
            const existsInApi = apiProducts.some(p => p.id === productToDelete);

            if (existsInApi) {
                await apiFetch(`/api/stocks/delete-stock/${productToDelete}`, {
                    method: "DELETE",
                });
                // Remove locally from apiProducts-driven view and persist counts
                // Remove locally and update per-type cache
                setApiProducts(prev => {
                    const next = prev.filter(p => p.id !== productToDelete);
                    setApiByType(prevCache => ({ ...prevCache, [currentProductType]: next }));
                    try {
                        const countsByType = ["RCN", "Kernel"].reduce((acc, t) => {
                            const items = next.filter(p => p.type === (t as ProductType));
                            acc[t] = {
                                active: items.filter(i => i.status === "active").length,
                                out_of_stock: items.filter(i => i.status === "out_of_stock").length,
                            } as any;
                            return acc;
                        }, {} as Record<string, { active: number; out_of_stock: number }>);
                        localStorage.setItem(
                            STOCK_COUNTS_KEY,
                            JSON.stringify({ counts: countsByType, updatedAt: Date.now() })
                        );
                    } catch { }
                    // notify sidebar
                    window.dispatchEvent(new CustomEvent('stocks:changed'));
                    return next;
                });
                setFilteredProducts(prev => prev.filter(p => p.id !== productToDelete));
            } else {
                // Fallback to local inventory store deletion
                deleteProduct(productToDelete);
                setAllProducts(prev => {
                    const next = prev.filter(p => p.id !== productToDelete);
                    // Persist counts based on whatever list is currently driving the UI
                    const source = apiProducts.length > 0 ? apiProducts : next;
                    try {
                        const countsByType = ["RCN", "Kernel"].reduce((acc, t) => {
                            const items = source.filter((p: any) => p.type === t);
                            acc[t] = {
                                active: items.filter((i: any) => i.status === "active").length,
                                out_of_stock: items.filter((i: any) => i.status === "out_of_stock").length,
                            } as any;
                            return acc;
                        }, {} as Record<string, { active: number; out_of_stock: number }>);
                        localStorage.setItem(
                            STOCK_COUNTS_KEY,
                            JSON.stringify({ counts: countsByType, updatedAt: Date.now() })
                        );
                    } catch { }
                    // notify sidebar
                    window.dispatchEvent(new CustomEvent('stocks:changed'));
                    return next;
                });
                setFilteredProducts(prev => prev.filter(p => p.id !== productToDelete));
            }

            toast({
                title: "Success",
                description: "Stock deleted successfully",
            });

            // Notify other parts of the app (e.g., sidebar) to refresh stock counts
            window.dispatchEvent(new CustomEvent('stocks:changed'));
        } catch (error: any) {
            toast({
                title: "Error",
                description: error?.message || "Failed to delete product. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsDeleteDialogOpen(false);
            setProductToDelete(null);
        }
    };

    const handleUpdateStock = () => {
        if (!editingProduct) return;

        const updatedProducts = allProducts.map((product) =>
            product.id === editingProduct.id
                ? {
                    ...product,
                    stock: Number(editStockData.stock),
                    price: Number(editStockData.price),
                    expireDate: editStockData.expireDate,
                    location: editStockData.location,
                }
                : product
        );

        setAllProducts(updatedProducts);
        setShowEditStockModal(false);

        // Show success message (you can replace this with a toast notification)
        console.log('Stock updated successfully for product:', editingProduct.name);
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header with Add & Filter Buttons */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-primary">My Stocks</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage your{" "}
                        {currentProductType === "RCN" ? "Raw Cashew Nut" : "Kernel"} Stocks
                    </p>
                </div>

                {/* Buttons in same line */}
                <div className="flex items-center gap-[10px]">
                    {/* Filter Button */}
                    {/* <Button
 variant="outline"
 onClick={() => setShowFilters(!showFilters)}
 className="flex items-center gap-2"
 >
 <Filter className="h-4 w-4" />
 </Button> */}

                    {/* Add Product Button */}
                    <Button
                        onClick={() => navigate("/merchant/add-product")}
                        className="flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Add New Stocks
                    </Button>
                </div>
            </div>

            {/* Product Type Toggle */}
            <ProductTypeToggle
                currentType={currentProductType}
                onTypeChange={setCurrentProductType}
            />

            {/* Filters */}


            {/* Table */}
            <Card>
                <CardHeader className="pb-2">
                    <div className="flex">
                        <Button
                            variant="outline"
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 ml-auto"
                        >
                            <Filter className="h-4 w-4" />
                        </Button>
                    </div>

                    {showFilters && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Filter className="h-5 w-5" />
                                    Filter Stocks
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                    {/* Search */}
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Search</label>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                            <Input
                                                placeholder="Search products..."
                                                className="pl-8"
                                                value={filters.search}
                                                onChange={(e) =>
                                                    setFilters({ ...filters, search: e.target.value })
                                                }
                                            />
                                        </div>
                                    </div>

                                    {/* Grade - Only for Kernel */}
                                    {currentProductType === "Kernel" && (
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
                                                    <SelectItem value="W240">W240</SelectItem>
                                                    <SelectItem value="W320">W320</SelectItem>
                                                    <SelectItem value="Broken BB">Broken BB</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    {/* Location */}
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Location</label>
                                        <Input
                                            placeholder="Enter location..."
                                            value={filters.location}
                                            onChange={(e) =>
                                                setFilters({ ...filters, location: e.target.value })
                                            }
                                        />
                                    </div>

                                    {/* Status */}
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Status</label>
                                        <Select
                                            value={filters.status}
                                            onValueChange={(value) =>
                                                setFilters({ ...filters, status: value })
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Price Range */}
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Price Range</label>
                                        <div className="flex space-x-2">
                                            <Input
                                                className="w-[6.5rem]" // 
                                                placeholder="Min"
                                                value={filters.minPrice}
                                                onChange={(e) =>
                                                    setFilters({ ...filters, minPrice: e.target.value })
                                                }
                                            />
                                            <Input
                                                className="w-[6.5rem]"
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
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            clearFilters();
                                            setShowFilters(false); // also close when clearing
                                        }}
                                    >
                                        Clear Filters
                                    </Button>
                                    <Button onClick={applyFilters}>Apply Filters</Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </CardHeader>
                <CardContent>
                    <ProductListTable
                        products={paginatedProducts}
                        currentProductType={currentProductType}
                        onEnquiryClick={(product: Product) => {
                            setSelectedProduct(product);
                            setOpen(true);
                        }}
                        onOrderClick={(product: Product) => {
                            setSelectedProduct(product);
                            setOpen(true);
                        }}
                        onViewClick={(product: Product) => {
                            navigate(`/product/${product.id}`);
                        }}
                        onEditClick={(product: Product) => {
                            navigate(`/merchant/add-product?edit=${product.id}`);
                        }}
                        onDeleteClick={handleDeleteClick}
                        onBidClick={(product: Product) => {
                            setBidProduct(product);
                            setShowBidManagement(true);
                        }}
                        isMerchantView={true}
                    />

                    {/* Pagination */}
                    {filteredProducts.length > 0 && (
                        <div className="flex items-center justify-between mt-4">
                            <div className="text-sm text-muted-foreground">
                                Showing {startIndex + 1} to{" "}
                                {Math.min(startIndex + pageSize, filteredProducts.length)} of{" "}
                                {filteredProducts.length} products
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
                                        <SelectItem value="5">5</SelectItem>
                                        <SelectItem value="10">10</SelectItem>
                                        <SelectItem value="20">20</SelectItem>
                                        <SelectItem value="50">50</SelectItem>
                                    </SelectContent>
                                </Select>

                                {/* Prev/Next */}
                                <div className="flex space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                                        }
                                        disabled={currentPage === 1}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                                        }
                                        disabled={currentPage === totalPages}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Enquiry/Order Drawer */}
            <EnquiryOrderDrawer
                isOpen={open}
                onClose={() => setOpen(false)}
                productName={selectedProduct?.name || ""}
                productId={selectedProduct?.id || ""}
            />

            {/* Bid Management Modal */}
            <MerchantBidManagement
                isOpen={showBidManagement}
                onClose={() => setShowBidManagement(false)}
                productId={bidProduct?.id || ''}
                productName={bidProduct?.name || ''}
            />

            {/* Edit Stock Modal */}
            <Dialog open={showEditStockModal} onOpenChange={setShowEditStockModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Stock</DialogTitle>
                        <DialogDescription>
                            Update stock information for {editingProduct?.name || 'product'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="stock">Available Stock</Label>
                            <Input
                                id="stock"
                                type="number"
                                placeholder="Enter stock quantity"
                                value={editStockData.stock}
                                onChange={(e) => setEditStockData({ ...editStockData, stock: e.target.value })}
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="price">Price per kg (₹)</Label>
                            <Input
                                id="price"
                                type="number"
                                placeholder="Enter price per kg"
                                value={editStockData.price}
                                onChange={(e) => setEditStockData({ ...editStockData, price: e.target.value })}
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="location">Origin/Location</Label>
                            <Input
                                id="location"
                                placeholder="Enter origin location"
                                value={editStockData.location}
                                onChange={(e) => setEditStockData({ ...editStockData, location: e.target.value })}
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="expireDate">Expire Date</Label>
                            <Input
                                id="expireDate"
                                type="date"
                                value={editStockData.expireDate}
                                onChange={(e) => setEditStockData({ ...editStockData, expireDate: e.target.value })}
                                className="mt-1"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-2 mt-6">
                        <Button
                            variant="outline"
                            onClick={() => setShowEditStockModal(false)}
                            className="text-purple-600 hover:bg-purple-50 hover:text-purple-700"
                        >
                            Cancel
                        </Button>

                        <Button
                            onClick={handleUpdateStock}
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                            Update Stock
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <AlertDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Stock</AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogDescription>
                        Are you sure you want to delete this product?
                    </AlertDialogDescription>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-red-600 text-white hover:bg-red-700"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default MerchantProducts;