import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, Edit, MessageSquare, ShoppingCart, Trash2, TrendingUp, ArrowUpDown, ArrowUp, ArrowDown, Package } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Product, Location } from '@/types/user';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useOrders } from '@/hooks/useOrders';
import { useResponses } from '@/hooks/useResponses';


interface ProductListTableProps {
  products: Product[];
  currentProductType: string;
  onEnquiryClick: (product: Product) => void;
  onOrderClick: (product: Product) => void;
  onViewClick: (product: Product) => void;
  onEditClick: (product: Product) => void;
  onDeleteClick?: (productId: string) => void;
  onBidClick?: (product: Product) => void;
  isMerchantView?: boolean;
}

const ProductListTable = ({
  products,
  currentProductType,
  onEnquiryClick,
  onOrderClick,
  onViewClick,
  onEditClick,
  onDeleteClick,
  onBidClick,
  isMerchantView = false
}: ProductListTableProps) => {
  const { orders: allOrders, addOrder, updateOrderStatus } = useOrders();
  const { responses, getResponsesByProductId } = useResponses();
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [enquiryCounts, setEnquiryCounts] = useState<Record<string, { pending: number; processing: number; total: number }>>({});

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  useEffect(() => {
    try {
      const counts: Record<string, { pending: number; processing: number; total: number }> = {};

      // Initialize for all products
      products.forEach((p) => {
        counts[p.id] = { pending: 0, processing: 0, total: 0 };
      });

      products.forEach((p) => {
        const pid = String(p.id);

        // Responses for this product
        const productResponses = getResponsesByProductId(pid) || [];
        const pendingResp = productResponses.filter(
          (r) => r.status === 'new' || r.status === 'viewed'
        ).length;
        // Note: accepted responses are intentionally NOT counted

        // Orders for this product (active only)
        const productOrders = allOrders.filter(
          (order) => order.productId === pid && order.status !== 'Cancelled' && order.status !== 'Delivered' && order.status !== 'Confirmed'
        );
        const processingOrders = productOrders.length;

        counts[pid].pending = pendingResp;
        counts[pid].processing = processingOrders;
        counts[pid].total = pendingResp + processingOrders; // exclude accepted-only and completed/cancelled orders
      });

      setEnquiryCounts(counts);
    } catch {
      setEnquiryCounts({});
    }
  }, [products, allOrders, responses, getResponsesByProductId]);


  const sortedProducts = [...products].sort((a, b) => {
    if (!sortField) return 0;

    let aValue = a[sortField as keyof Product] as any;
    let bValue = b[sortField as keyof Product] as any;

    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = (bValue as string).toLowerCase();
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 text-muted-foreground opacity-50" />;
    }
    return sortDirection === 'asc'
      ? <ArrowUp className="h-4 w-4 text-primary" />
      : <ArrowDown className="h-4 w-4 text-primary" />;
  };

  const SortableHeader = ({ field, children }: { field: string; children: React.ReactNode }) => (
    <TableHead
      className="cursor-pointer hover:bg-muted/50 select-none"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center justify-between">
        {children}
        {getSortIcon(field)}
      </div>
    </TableHead>
  );
  const formatWithCommas = (val: any) => {
    if (val === null || val === undefined) return "0";
    const num = typeof val === 'number' ? val : parseInt(String(val).replace(/,/g, ''), 10);
    if (isNaN(num)) return String(val);
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  return (
    <Table className="w-full border-collapse">
      <TableHeader>
        <TableRow>
          <SortableHeader field="name">Product</SortableHeader>
          {currentProductType === "Kernel" ? (
            <>
              <SortableHeader field="grade">Grade</SortableHeader>
              <SortableHeader field="availableQty">Available Stock</SortableHeader>
              <SortableHeader field="price">Offer/kg</SortableHeader>
              <SortableHeader field="location">Origin</SortableHeader>
              <SortableHeader field="expireDate">Date</SortableHeader>
            </>
          ) : (
            <>
              <SortableHeader field="yearOfCrop">Year of Crop</SortableHeader>
              <SortableHeader field="nutCount">Nut Count</SortableHeader>
              <SortableHeader field="outTurn">Out Turn</SortableHeader>
              <SortableHeader field="location">Origin</SortableHeader>
            </>
          )}
          {/* <TableHead className="w-[100px]">Enquiries</TableHead> */}
          {/* <TableHead className="w-[120px]">Buyer Responses</TableHead> */}
          {/* <TableHead>Orders</TableHead> */}
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {sortedProducts.length > 0 ? (
          sortedProducts.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <img
                    src={Array.isArray((product as any).images) && (product as any).images[0] ? (product as any).images[0] : '/placeholder.svg'}
                    alt={product.name || 'Product'}
                    className="h-10 w-10 rounded object-cover bg-muted"
                  />
                  {/* <div className="min-w-[120px]">
                    <div className="font-medium text-sm leading-tight">{product.name || product.grade || 'Product'}</div>
                    {product.grade && (
                      <div className="text-xs text-muted-foreground">{product.grade}</div>
                    )}
                  </div> */}
                </div>
              </TableCell>
              {currentProductType === "Kernel" ? (
                <>
                  <TableCell>{product.grade || "-"}</TableCell>
                  <TableCell>
                    <span
                      className={
                        product.availableQty === 0 ? "text-red-600" : "text-green-600"
                      }
                    >
                      {formatWithCommas(product.availableQty)} {product.unit}
                    </span>
                  </TableCell>
                  <TableCell>₹{product.price.toLocaleString("en-IN")}</TableCell>
                  <TableCell>
                    {typeof product.location === 'string'
                      ? product.location
                      : (product.location as Location).city || (product.location as Location).region || (product.location as Location).country || 'N/A'
                    }
                  </TableCell>
                  <TableCell>
                    <span>{new Date(product.expireDate).toLocaleDateString()}</span>
                  </TableCell>
                </>
              ) : (
                <>
                  <TableCell>{product.yearOfCrop || "-"}</TableCell>
                  <TableCell>{product.nutCount || "-"}</TableCell>
                  <TableCell>{product.outTurn || "-"}</TableCell>
                  <TableCell>
                    {typeof product.location === 'string'
                      ? product.location
                      : (product.location as Location).city || (product.location as Location).region || (product.location as Location).country || 'N/A'
                    }
                  </TableCell>
                </>
              )}
              {/* Enquiries and Buyer Responses */}
              {/* <TableCell>
                <div
                  onClick={() => onEnquiryClick(product)}
                  className="flex items-center space-x-1 cursor-pointer hover:text-blue-600"
                  title="Enquiries"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>{product.enquiries || 0}</span>
                </div>
              </TableCell> */}
              {/* <TableCell>
                <div
                  className="flex items-center space-x-1"
                  title="Buyer Responses"
                >
                  <MessageSquare className="h-4 w-4 text-green-600" />
                  <span className={product.buyerResponses ? 'text-green-600 font-medium' : ''}>
                    {product.buyerResponses || 0}
                  </span>
                </div>
              </TableCell> */}
              {/* <TableCell>
                <div
                  onClick={() => onOrderClick(product)}
                  className="flex items-center space-x-1 cursor-pointer hover:text-blue-600"
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span>{product.orders}</span>
                </div>
              </TableCell> */}
              <TableCell>
                <div className="flex space-x-2">
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewClick(product)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>

                    {(enquiryCounts[product.id]?.total ?? 0) > 0 && (
                      <span className="absolute -top-1 -right-1">
                        <Badge
                          variant={(enquiryCounts[product.id]?.pending ?? 0) > 0 ? 'destructive' : 'default'}
                          className="h-4 min-w-4 px-1 text-[10px] leading-4 rounded-full"
                        >
                          {enquiryCounts[product.id]?.total}
                        </Badge>
                      </span>
                    )}
                  </div>
                  {isMerchantView && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onEditClick(product)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive/90"
                        onClick={() => onDeleteClick?.(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell
              colSpan={currentProductType === "Kernel" ? 9 : 8} // +1 to account for the new Product (image) column
              className="text-center py-6 text-muted-foreground"
            >
              <div className="text-center py-8">
                <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                No products found for selected filters.
              </div>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>


  );
};

export default ProductListTable;