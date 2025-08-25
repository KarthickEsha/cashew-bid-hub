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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Eye,
  Edit,
  MessageSquare,
  ShoppingCart,
  Plus,
  Filter,
  Search,
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useNavigate } from "react-router-dom";

const mockProducts = [
  {
    id: 1,
    name: "Premium Cashews W240",
    grade: "W240",
    weight: "25kg",
    stock: 500,
    price: 8.5,
    unit: "kg",
    location: "Kerala, India",
    expireDate: "2025-12-15",
    status: "active",
    enquiries: 3,
    orders: 2,
  },
  {
    id: 2,
    name: "Organic Cashews W320",
    grade: "W320",
    weight: "50kg",
    stock: 200,
    price: 7.8,
    unit: "kg",
    location: "Tamil Nadu, India",
    expireDate: "2025-10-30",
    status: "active",
    enquiries: 5,
    orders: 1,
  },
  {
    id: 3,
    name: "Broken Cashews BB",
    grade: "Broken BB",
    weight: "25kg",
    stock: 0,
    price: 6.2,
    unit: "kg",
    location: "Kerala, India",
    expireDate: "2025-09-20",
    status: "out_of_stock",
    enquiries: 1,
    orders: 0,
  },
];

const MerchantProducts = () => {
  const navigate = useNavigate();

  // filters state
  const [filters, setFilters] = useState({
    search: "",
    grade: "",
    location: "",
    minPrice: "",
    maxPrice: "",
    status: "",
  });

  const [filteredProducts, setFilteredProducts] = useState(mockProducts);

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
    let result = [...mockProducts];

    if (filters.search) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          p.grade.toLowerCase().includes(filters.search.toLowerCase())
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
    setFilteredProducts(mockProducts);
    setCurrentPage(1);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">My Product Stocks</h1>
          <p className="text-muted-foreground mt-2">
            Manage your product inventory
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
                  <SelectItem value="W240">W240</SelectItem>
                  <SelectItem value="W320">W320</SelectItem>
                  <SelectItem value="Broken BB">Broken BB</SelectItem>
                </SelectContent>
              </Select>
            </div>

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
          <Table className="w-full border-collapse">
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Origin</TableHead>
                <TableHead>Expire Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Enquiries</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedProducts.length > 0 ? (
                paginatedProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.grade}</TableCell>
                    <TableCell>
                      <span
                        className={
                          product.stock === 0 ? "text-red-600" : "text-green-600"
                        }
                      >
                        {product.stock} {product.unit}
                      </span>
                    </TableCell>
                    <TableCell>
                      ${product.price}/{product.unit}
                    </TableCell>
                    <TableCell>{product.location}</TableCell>
                    <TableCell>{product.expireDate}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          product.status === "active" ? "default" : "destructive"
                        }
                      >
                        {product.status === "active" ? "Active" : "Out of Stock"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div onClick={() => {
                        setSelectedProduct(product);
                        setOpen(true);
                      }} className="flex items-center space-x-1 cursor-pointer hover:text-blue-600">
                        <MessageSquare className="h-4 w-4" />
                        <span>{product.enquiries}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <ShoppingCart className="h-4 w-4" />
                        <span>{product.orders}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-6">
                    No products found for selected filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

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

      {/* Right side sheet for enquiries */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-[400px] sm:w-[500px]">
          <SheetHeader>
            <SheetTitle>
              Enquiries for {selectedProduct?.name}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-3">
            {selectedProduct?.enquiriesList?.length ? (
              selectedProduct.enquiriesList.map((enq, idx) => (
                <div
                  key={idx}
                  className="p-3 border rounded-lg shadow-sm hover:bg-muted"
                >
                  <p className="text-sm font-medium">{enq.customer}</p>
                  <p className="text-xs text-muted-foreground">{enq.message}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No enquiries yet</p>
            )}
          </div>
        </SheetContent>
      </Sheet>

    </div>
  );
};

export default MerchantProducts;
