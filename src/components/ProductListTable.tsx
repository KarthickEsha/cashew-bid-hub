import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, MessageSquare, ShoppingCart, TrendingUp } from 'lucide-react';
import { Product } from '@/types/user';

interface ProductListTableProps {
  products: Product[];
  currentProductType: string;
  onEnquiryClick: (product: Product) => void;
  onOrderClick: (product: Product) => void;
  onViewClick: (product: Product) => void;
  onEditClick: (product: Product) => void;
  onBidClick?: (product: Product) => void;
}

const ProductListTable = ({
  products,
  currentProductType,
  onEnquiryClick,
  onOrderClick,
  onViewClick,
  onEditClick,
  onBidClick
}: ProductListTableProps) => {
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedProducts = [...products].sort((a, b) => {
    if (!sortField) return 0;

    let aValue = a[sortField as keyof Product];
    let bValue = b[sortField as keyof Product];

    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = (bValue as string).toLowerCase();
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const SortableHeader = ({ field, children }: { field: string; children: React.ReactNode }) => (
    <TableHead
      className="cursor-pointer hover:bg-muted/50 select-none"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center justify-between">
        {children}
        {sortField === field && (
          <span className="text-xs ml-1">
            {sortDirection === 'asc' ? '↑' : '↓'}
          </span>
        )}
      </div>
    </TableHead>
  );

  return (
    <Table className="w-full border-collapse">
      <TableHeader>
        <TableRow>
          {currentProductType === "Kernel" ? (
            <SortableHeader field="grade">Grade</SortableHeader>
          ) : (
            <>
              <SortableHeader field="yearOfCrop">Year of Crop</SortableHeader>
              <SortableHeader field="nutCount">Nut Count</SortableHeader>
              <SortableHeader field="outTurn">Out Turn</SortableHeader>
            </>
          )}
          <SortableHeader field="stock">Stock</SortableHeader>
          <SortableHeader field="price">Price/kg</SortableHeader>
          <SortableHeader field="location">Origin</SortableHeader>
          <SortableHeader field="expireDate">Expire Date</SortableHeader>
          <SortableHeader field="status">Status</SortableHeader>
          <TableHead>Enquiries</TableHead>
          <TableHead>Orders</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedProducts.length > 0 ? (
          sortedProducts.map((product) => (
            <TableRow key={product.id}>
              {currentProductType === "Kernel" ? (
                <TableCell>{product.grade || "-"}</TableCell>
              ) : (
                <>
                  <TableCell>{product.yearOfCrop || "-"}</TableCell>
                  <TableCell>{product.nutCount || "-"}</TableCell>
                  <TableCell>{product.outTurn || "-"}</TableCell>
                </>
              )}
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
                   ₹{product.price.toLocaleString("en-IN")}
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
                <div
                  onClick={() => onEnquiryClick(product)}
                  className="flex items-center space-x-1 cursor-pointer hover:text-blue-600"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>{product.enquiries}</span>
                </div>
              </TableCell>
              <TableCell>
                <div
                  onClick={() => onOrderClick(product)}
                  className="flex items-center space-x-1 cursor-pointer hover:text-blue-600"
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span>{product.orders}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewClick(product)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditClick(product)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell
              colSpan={currentProductType === "Kernel" ? 9 : 11}
              className="text-center py-6 text-muted-foreground"
            >
              No products found for selected filters.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>

  );
};

export default ProductListTable;