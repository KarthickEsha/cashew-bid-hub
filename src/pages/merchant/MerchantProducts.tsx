import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Edit, MessageSquare, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";

const mockProducts = [
  {
    id: 1,
    name: "Premium Cashews W240",
    grade: "W240",
    weight: "25kg",
    stock: 500,
    price: 8.50,
    unit: "kg",
    location: "Kerala, India",
    status: "active",
    enquiries: 3,
    orders: 2
  },
  {
    id: 2,
    name: "Organic Cashews W320",
    grade: "W320", 
    weight: "50kg",
    stock: 200,
    price: 7.80,
    unit: "kg",
    location: "Tamil Nadu, India",
    status: "active",
    enquiries: 5,
    orders: 1
  },
  {
    id: 3,
    name: "Broken Cashews BB",
    grade: "Broken BB",
    weight: "25kg",
    stock: 0,
    price: 6.20,
    unit: "kg", 
    location: "Kerala, India",
    status: "out_of_stock",
    enquiries: 1,
    orders: 0
  }
];

const MerchantProducts = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(mockProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = mockProducts.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">My Products</h1>
          <p className="text-muted-foreground mt-2">
            Manage your product inventory
          </p>
        </div>
        <Button onClick={() => navigate('/merchant/add-product')}>
          Add New Product
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Inventory</CardTitle>
          <CardDescription>View and manage all your listed products</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Product Name</TableHead>
                  <TableHead className="min-w-[100px]">Grade</TableHead>
                  <TableHead className="min-w-[80px]">Stock</TableHead>
                  <TableHead className="min-w-[100px]">Price</TableHead>
                  <TableHead className="min-w-[150px]">Location</TableHead>
                  <TableHead className="min-w-[100px]">Status</TableHead>
                  <TableHead className="min-w-[100px]">Enquiries</TableHead>
                  <TableHead className="min-w-[80px]">Orders</TableHead>
                  <TableHead className="min-w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
            <TableBody>
              {paginatedProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.grade}</TableCell>
                  <TableCell>
                    <span className={product.stock === 0 ? "text-red-600" : "text-green-600"}>
                      {product.stock} {product.unit}
                    </span>
                  </TableCell>
                  <TableCell>${product.price}/{product.unit}</TableCell>
                  <TableCell>{product.location}</TableCell>
                  <TableCell>
                    <Badge variant={product.status === 'active' ? 'default' : 'destructive'}>
                      {product.status === 'active' ? 'Active' : 'Out of Stock'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
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
              ))}
            </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, mockProducts.length)} of {mockProducts.length} products
            </div>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default MerchantProducts;