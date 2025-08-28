import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Eye, MessageSquare, Search, Filter } from "lucide-react";
import ChatModal from "@/components/ChatModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const mockEnquiries = [
  { id: 1, customerName: "John Doe", productName: "Premium Cashews W240", quantity: "100kg", message: "I'm interested in bulk purchase for my restaurant chain. Can you provide pricing for 500kg monthly supply?", date: "2024-01-15", status: "pending" },
  { id: 2, customerName: "Sarah Wilson", productName: "Organic Cashews W320", quantity: "50kg", message: "Need organic certification details and delivery timeline to New York.", date: "2024-01-14", status: "responded" },
  { id: 3, customerName: "Mike Johnson", productName: "Broken Cashews BB", quantity: "200kg", message: "Looking for competitive pricing for broken cashews for my processing unit.", date: "2024-01-13", status: "pending" },
  { id: 4, customerName: "Alice Brown", productName: "Cashews W180", quantity: "75kg", message: "Can you provide wholesale pricing?", date: "2024-01-12", status: "pending" },
  { id: 5, customerName: "Bob Smith", productName: "Premium Cashews W240", quantity: "120kg", message: "Interested in monthly subscription.", date: "2024-01-11", status: "responded" },
  { id: 6, customerName: "Carol White", productName: "Organic Cashews W320", quantity: "90kg", message: "Do you ship internationally?", date: "2024-01-10", status: "pending" },
  { id: 7, customerName: "David Green", productName: "Broken Cashews BB", quantity: "150kg", message: "Need delivery by next week.", date: "2024-01-09", status: "pending" }
];

const MerchantEnquiries = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Actual filters applied to the table
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Temporary filters (controlled inputs)
  const [tempSearchFilter, setTempSearchFilter] = useState('');
  const [tempStatusFilter, setTempStatusFilter] = useState('');

  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState<any>(null);
  const [filterOpen, setFilterOpen] = useState(false);

  // Filter enquiries only when Apply clicked
  const filteredEnquiries = mockEnquiries.filter(enquiry =>
    (searchFilter === '' ||
      enquiry.customerName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      enquiry.productName.toLowerCase().includes(searchFilter.toLowerCase())) &&
    (statusFilter === '' || enquiry.status === statusFilter)
  );

  const totalPages = Math.ceil(filteredEnquiries.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredEnquiries.length);
  const paginatedEnquiries = filteredEnquiries.slice(startIndex, endIndex);

  const handleViewClick = (enquiry: any) => {
    setSelectedEnquiry(enquiry);
    setViewModalOpen(true);
  };

  const handleChatClick = (enquiry: any) => {
    setSelectedEnquiry(enquiry);
    setChatModalOpen(true);
  };

  const handleApplyFilters = () => {
    setSearchFilter(tempSearchFilter);
    setStatusFilter(tempStatusFilter);
    setFilterOpen(false);
    setCurrentPage(1);
  };

  const handleCancelFilters = () => {
    // Clear both applied and temporary filters
    setSearchFilter('');
    setStatusFilter('');
    setTempSearchFilter('');
    setTempStatusFilter('');
    setFilterOpen(false);
    setCurrentPage(1);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Customer Enquiries</h1>
          <p className="text-muted-foreground mt-2">
            Manage enquiries from customers about your products
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setFilterOpen(prev => !prev)}>
          <Filter className="h-4 w-4 mr-2" />
          Filter Enquiries
        </Button>
      </div>

      {/* Filters */}
      {filterOpen && (
        <Card>
          <CardHeader></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search customer, product..."
                    className="pl-8"
                    value={tempSearchFilter}
                    onChange={(e) => setTempSearchFilter(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Filter by Status</label>
                <select
                  value={tempStatusFilter}
                  onChange={(e) => setTempStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="responded">Responded</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={handleCancelFilters}>Cancel</Button>
              <Button onClick={handleApplyFilters}>Apply</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enquiries Table */}
      <Card>
        <CardHeader>
          <CardTitle>Product Enquiries</CardTitle>
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
              {filteredEnquiries.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                    No enquiries found for selected filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {filteredEnquiries.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {endIndex} of {filteredEnquiries.length} enquiries
              </div>

              <div className="flex items-center space-x-4">
                <Select value={String(pageSize)} onValueChange={(value) => { setPageSize(Number(value)); setCurrentPage(1); }}>
                  <SelectTrigger className="w-[100px]"><SelectValue placeholder="Page size" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>Previous</Button>
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>Next</Button>
                </div>
              </div>
            </div>
          )}
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
                <Button onClick={() => handleChatClick(selectedEnquiry)} className="flex-1 bg-purple-600 text-white hover:bg-purple-700">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Reply to Enquiry
                </Button>
                <Button
                  variant="outline"
                  className="border-purple-600 text-black hover:text-purple-600 hover:bg-purple-50"
                  onClick={() => setViewModalOpen(false)}
                >
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
