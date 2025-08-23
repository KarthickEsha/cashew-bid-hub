import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, MessageSquare } from "lucide-react";

const mockEnquiries = [
  {
    id: 1,
    customerName: "John Doe",
    productName: "Premium Cashews W240",
    quantity: "100kg",
    message: "I'm interested in bulk purchase for my restaurant chain. Can you provide pricing for 500kg monthly supply?",
    date: "2024-01-15",
    status: "pending"
  },
  {
    id: 2,
    customerName: "Sarah Wilson",
    productName: "Organic Cashews W320",
    quantity: "50kg",
    message: "Need organic certification details and delivery timeline to New York.",
    date: "2024-01-14",
    status: "responded"
  },
  {
    id: 3,
    customerName: "Mike Johnson",
    productName: "Broken Cashews BB",
    quantity: "200kg",
    message: "Looking for competitive pricing for broken cashews for my processing unit.",
    date: "2024-01-13",
    status: "pending"
  }
];

const MerchantEnquiries = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(mockEnquiries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEnquiries = mockEnquiries.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">Customer Enquiries</h1>
        <p className="text-muted-foreground mt-2">
          Manage enquiries from customers about your products
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Enquiries</CardTitle>
          <CardDescription>View and respond to customer enquiries</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedEnquiries.map((enquiry) => (
                <TableRow key={enquiry.id}>
                  <TableCell className="font-medium">{enquiry.customerName}</TableCell>
                  <TableCell>{enquiry.productName}</TableCell>
                  <TableCell>{enquiry.quantity}</TableCell>
                  <TableCell>{new Date(enquiry.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={enquiry.status === 'pending' ? 'destructive' : 'default'}>
                      {enquiry.status === 'pending' ? 'Pending' : 'Responded'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, mockEnquiries.length)} of {mockEnquiries.length} enquiries
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

export default MerchantEnquiries;