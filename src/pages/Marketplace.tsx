import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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

  const products = [
    {
      id: 1,
      merchantName: "Premium Cashews Ltd",
      location: "Mumbai, India",
      origin: "Kerala, India",
      grade: "W320",
      quantity: 50,
      quantityUnit: "tons",
      pricePerTon: "$8,500",
      pricePerKg: "$8.50",
      pricingType: "fixed",
      expiry: "2024-12-15",
      rating: 4.8,
      verified: true,
      description: "Premium grade W320 cashews from Kerala, India"
    },
    {
      id: 2,
      merchantName: "Vietnam Cashew Export",
      location: "Ho Chi Minh City, Vietnam",
      origin: "Binh Phuoc, Vietnam",
      grade: "SW240",
      quantity: 100,
      quantityUnit: "tons",
      pricePerTon: "$9,200",
      pricePerKg: "$9.20",
      pricingType: "bidding",
      expiry: "2024-11-30",
      rating: 4.9,
      verified: true,
      description: "High quality SW240 cashews for export"
    },
    {
      id: 3,
      merchantName: "Global Nuts Trading",
      location: "California, USA",
      origin: "Ghana, West Africa",
      grade: "W240",
      quantity: 25,
      quantityUnit: "tons",
      pricePerTon: "$8,800",
      pricePerKg: "$8.80",
      pricingType: "fixed",
      expiry: "2024-10-20",
      rating: 4.6,
      verified: false,
      description: "Organic W240 cashews, premium quality"
    },
    {
      id: 4,
      merchantName: "African Cashew Co.",
      location: "Accra, Ghana",
      origin: "Northern Ghana",
      grade: "W180",
      quantity: 75,
      quantityUnit: "tons",
      pricePerTon: "$7,200",
      pricePerKg: "$7.20",
      pricingType: "bidding",
      expiry: "2024-12-01",
      rating: 4.7,
      verified: true,
      description: "Premium W180 cashews from Ghana"
    },
    {
      id: 5,
      merchantName: "Brazilian Nuts Ltd",
      location: "São Paulo, Brazil",
      origin: "Ceará, Brazil",
      grade: "SW320",
      quantity: 40,
      quantityUnit: "tons",
      pricePerTon: "$8,000",
      pricePerKg: "$8.00",
      pricingType: "fixed",
      expiry: "2024-11-15",
      rating: 4.5,
      verified: true,
      description: "High quality SW320 cashews from Brazil"
    },
    {
      id: 6,
      merchantName: "Tanzania Cashew Export",
      location: "Dar es Salaam, Tanzania",
      origin: "Mtwara, Tanzania",
      grade: "W240",
      quantity: 60,
      quantityUnit: "tons",
      pricePerTon: "$7,800",
      pricePerKg: "$7.80",
      pricingType: "bidding",
      expiry: "2024-12-30",
      rating: 4.4,
      verified: false,
      description: "Organic W240 cashews from Tanzania"
    },
  ];

  const [filteredProducts, setFilteredProducts] = useState(products);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Reduced for better table pagination
  const itemsToShow = filteredProducts;
  const totalPages = Math.ceil(itemsToShow.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = itemsToShow.slice(startIndex, startIndex + itemsPerPage);

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

  const placeOrder = () => {
    const orderData = {
      id: `ORD-${Date.now()}`,
      requirementId: `REQ-${Date.now()}`,
      responseId: `RES-${Date.now()}`,
      productName: selectedProduct?.name || 'Cashew Nuts',
      merchantName: selectedProduct?.merchantName || 'Premium Cashews Ltd',
      merchantId: selectedProduct?.merchantId || 'merchant-123',
      customerName: 'Customer',
      quantity: quantity?.toString() || '1',
      unitPrice: bidAmount?.toString() || '0',
      totalAmount: totalValue.toString(),
      status: 'processing',
      orderDate: new Date().toISOString(),
      location: selectedProduct?.location || 'Mumbai, India',
      grade: selectedProduct?.grade || 'W320',
      origin: selectedProduct?.origin || 'India',
      steps: []
    };

    // Add order placement logic here
    console.log(orderData);
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
                        <div className="flex items-center space-x-2 mb-1">
                          <CardTitle className="text-lg">{product.merchantName}</CardTitle>
                          {product.verified && (
                            <Badge variant="default" className="text-xs">
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
                          onClick={() => setSelectedProduct(product)}
                        >
                          Place Bid
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline">
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
                          {/* {product.pricingType === "bidding" ? (
                            <Button
                              size="sm"
                              onClick={() => setSelectedProduct(product)}
                            >
                              Place Bid
                            </Button>
                          ) : (
                            <Button size="sm">
                              Quick Order
                            </Button>
                          )} */}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {/* Table Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, itemsToShow.length)} of {itemsToShow.length} results
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      Previous
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        size="sm"
                        variant={currentPage === page ? "default" : "outline"}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Pagination for Card View */}
          {viewMode === 'card' && itemsToShow.length > 0 && (
            <div className="flex justify-center mt-8">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    size="sm"
                    variant={currentPage === page ? "default" : "outline"}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* 🔹 Place Bid Dialog */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Place Bid - {selectedProduct?.merchantName}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 text-sm">
            <p>
              <strong>Current highest bid:</strong> ${selectedProduct?.highestBid}/ton
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-muted-foreground">Highest Bid</p>
                <p className="font-semibold">${selectedProduct?.highestBid}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Active Bidders</p>
                <p className="font-semibold">{selectedProduct?.activeBidders}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Time Left</p>
                <p className="font-semibold">{selectedProduct?.timeLeft}</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Bid Amount (per ton)</label>
              <Input
                type="number"
                placeholder="Enter bid amount"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value ? Number(e.target.value) : "")}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Quantity (ton)</label>
              <Input
                type="number"
                placeholder="Enter quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value ? Number(e.target.value) : "")}
              />
            </div>
            <div className="space-y-2">
              <p className="text-muted-foreground">Total Value</p>
              <p className="font-semibold">${totalValue}</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedProduct(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                console.log({
                  merchant: selectedProduct?.merchantName,
                  bidAmount,
                  quantity,
                  totalValue,
                });
                setSelectedProduct(null);
              }}
            >
              Place Bid
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Marketplace;
