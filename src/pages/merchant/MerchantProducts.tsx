import { useState } from "react";
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
  Eye,
  Edit,
  MessageSquare,
  ShoppingCart,
  Plus,
  Filter,
  Search,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useInventory } from "@/hooks/useInventory";
import { useProfile } from "@/hooks/useProfile";
import ProductTypeToggle from "@/components/ProductTypeToggle";
import EnquiryOrderDrawer from "@/components/EnquiryOrderDrawer";
import ProductListTable from "@/components/ProductListTable";
import { ProductType, Product } from "@/types/user";
import React from "react";

const MerchantProducts = () => {
  const navigate = useNavigate();
  const { products } = useInventory();
  const { profile } = useProfile();
  
  // Determine current product type for display
  const getInitialProductType = (): ProductType => {
    if (profile?.productType === 'Both') {
      return 'RCN'; // Default to RCN when both are available
    }
    return profile?.productType || 'RCN';
  };
  
  const [currentProductType, setCurrentProductType] = useState<ProductType>(getInitialProductType());
  
  // Filter products based on current type (only if user has "Both" selected)
  const filteredProductsByType = profile?.productType === 'Both' 
    ? products.filter(p => p.type === currentProductType)
    : products;

  // filters state
  const [filters, setFilters] = useState({
    search: "",
    grade: "",
    location: "",
    minPrice: "",
    maxPrice: "",
    status: "",
  });

  const [filteredProducts, setFilteredProducts] = useState(filteredProductsByType);

  // pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // popup state
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // apply filters
  const applyFilters = () => {
    let result = [...filteredProductsByType];

    if (filters.search) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          (p.grade && p.grade.toLowerCase().includes(filters.search.toLowerCase()))
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

    if (filters.status) {
      result = result.filter((p) => p.status === filters.status);
    }

    if (filters.minPrice) {
      result = result.filter((p) => p.price >= parseFloat(filters.minPrice));
    }

    if (filters.maxPrice) {
      result = result.filter((p) => p.price <= parseFloat(filters.maxPrice));
    }

    setFilteredProducts(result);
    setCurrentPage(1);
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
  
  // Update filtered products when product type changes
  React.useEffect(() => {
    setFilteredProducts(filteredProductsByType);
    clearFilters();
  }, [currentProductType, filteredProductsByType]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">My Product Stocks</h1>
          <p className="text-muted-foreground mt-2">
            Manage your {currentProductType === 'RCN' ? 'Raw Cashew Nut' : 'Kernel'} inventory
          </p>
        </div>
        <Button
          onClick={() => navigate("/merchant/add-product")}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Inventory
        </Button>
      </div>

      {/* Product Type Toggle */}
      <ProductTypeToggle 
        currentType={currentProductType}
        onTypeChange={setCurrentProductType}
      />

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Products
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

            {/* Grade - Only show for Kernel products */}
            {currentProductType === 'Kernel' && (
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

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Product Inventory</CardTitle>
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
              navigate(`/merchant/edit-product/${product.id}`);
            }}
          />

          {/* Pagination */}
          {filteredProducts.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to{" "}
                {Math.min(startIndex + itemsPerPage, filteredProducts.length)} of{" "}
                {filteredProducts.length} products
              </div>
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
          )}
        </CardContent>
      </Card>

      {/* Enquiry/Order Drawer */}
      <EnquiryOrderDrawer
        isOpen={open}
        onClose={() => setOpen(false)}
        productName={selectedProduct?.name || ''}
        productId={selectedProduct?.id || ''}
      />

    </div>
  );
};

export default MerchantProducts;
