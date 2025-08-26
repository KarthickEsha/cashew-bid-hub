import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Eye, MessageSquare, Search } from "lucide-react";
import ChatModal from "@/components/ChatModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

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
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState<any>(null);
  const itemsPerPage = 10;

  const filteredEnquiries = mockEnquiries.filter(enquiry => 
    (searchFilter === '' || 
     enquiry.customerName.toLowerCase().includes(searchFilter.toLowerCase()) || 
     enquiry.productName.toLowerCase().includes(searchFilter.toLowerCase())) &&
    (statusFilter === '' || enquiry.status === statusFilter)
  );

  const handleViewClick = (enquiry: any) => {
    setSelectedEnquiry(enquiry);
    setViewModalOpen(true);
  };

  const handleChatClick = (enquiry: any) => {
    setSelectedEnquiry(enquiry);
    setChatModalOpen(true);
  };

  const totalPages = Math.ceil(filteredEnquiries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEnquiries = filteredEnquiries.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">Customer Enquiries</h1>
        <p className="text-muted-foreground mt-2">
          Manage enquiries from customers about your products
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search customer, product..."
                  className="pl-8"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Filter by Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="responded">Responded</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

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
                      <Button variant="ghost" size="sm" onClick={() => handleViewClick(enquiry)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleChatClick(enquiry)}>
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
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredEnquiries.length)} of {filteredEnquiries.length} enquiries
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

      {/* View Enquiry Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Enquiry Details</DialogTitle>
            <DialogDescription>Complete information about the customer enquiry</DialogDescription>
          </DialogHeader>
          {selectedEnquiry && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Customer</h4>
                  <p className="font-medium">{selectedEnquiry.customerName}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Product</h4>
                  <p className="font-medium">{selectedEnquiry.productName}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Quantity</h4>
                  <p className="font-medium">{selectedEnquiry.quantity}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Date</h4>
                  <p className="font-medium">{new Date(selectedEnquiry.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Status</h4>
                  <Badge variant={selectedEnquiry.status === 'pending' ? 'destructive' : 'default'}>
                    {selectedEnquiry.status === 'pending' ? 'Pending' : 'Responded'}
                  </Badge>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-2">Message</h4>
                <p className="p-3 bg-muted rounded-md">{selectedEnquiry.message}</p>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={() => handleChatClick(selectedEnquiry)} className="flex-1">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Reply to Enquiry
                </Button>
                <Button variant="outline" onClick={() => setViewModalOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Chat Modal */}
      <ChatModal
        isOpen={chatModalOpen}
        onClose={() => setChatModalOpen(false)}
        customerName={selectedEnquiry?.customerName || ''}
        productName={selectedEnquiry?.productName || ''}
        userType="merchant"
      />
    </div>
  );
};

export default MerchantEnquiries;