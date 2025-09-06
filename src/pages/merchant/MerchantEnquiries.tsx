import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Eye, MessageSquare, Search, Filter, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import ChatModal from "@/components/ChatModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRequirements } from "@/hooks/useRequirements";
import { useResponses } from "@/hooks/useResponses";
import { useToast } from "@/hooks/use-toast";

const mockEnquiries = [
  // { id: 1, customerName: "John Doe", productName: "Premium Cashews W240", quantity: "100kg", message: "I'm interested in bulk purchase for my restaurant chain. Can you provide pricing for 500kg monthly supply?", date: "2024-01-15", status: "pending", expectedPrice: 8200, fixedPrice: 8500, origin: "India", grade: "W240" },
  // { id: 2, customerName: "Sarah Wilson", productName: "Organic Cashews W320", quantity: "50kg", message: "Need organic certification details and delivery timeline to New York.", date: "2024-01-14", status: "responded", expectedPrice: 7600, fixedPrice: 7800, origin: "Vietnam", grade: "W320" },
  // { id: 3, customerName: "Mike Johnson", productName: "Broken Cashews BB", quantity: "200kg", message: "Looking for competitive pricing for broken cashews for my processing unit.", date: "2024-01-13", status: "pending", expectedPrice: 7200, fixedPrice: 7500, origin: "Ghana", grade: "mixed" },
  // { id: 4, customerName: "Alice Brown", productName: "Cashews W180", quantity: "75kg", message: "Can you provide wholesale pricing?", date: "2024-01-12", status: "pending", expectedPrice: 8400, fixedPrice: 8500, origin: "India", grade: "W180" },
  // { id: 5, customerName: "Bob Smith", productName: "Premium Cashews W240", quantity: "120kg", message: "Interested in monthly subscription.", date: "2024-01-11", status: "responded", expectedPrice: 8100, fixedPrice: 8300, origin: "India", grade: "W240" },
  // { id: 6, customerName: "Carol White", productName: "Organic Cashews W320", quantity: "90kg", message: "Do you ship internationally?", date: "2024-01-10", status: "pending", expectedPrice: 7700, fixedPrice: 8000, origin: "Vietnam", grade: "W320" },
  // { id: 7, customerName: "David Green", productName: "Broken Cashews BB", quantity: "150kg", message: "Need delivery by next week.", date: "2024-01-09", status: "pending", expectedPrice: 7000, fixedPrice: 7300, origin: "Tanzania", grade: "mixed" }
];

const MerchantEnquiries = () => {
  const { getRequirementsAsEnquiries, updateRequirementStatus } = useRequirements();
  const { addResponse, getResponsesByRequirementId } = useResponses();
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Actual filters applied to the table
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); // '' means no filter / "All"

  // Temporary filters (controlled inputs)
  const [tempSearchFilter, setTempSearchFilter] = useState('');
  const [tempStatusFilter, setTempStatusFilter] = useState(''); // keep '' so placeholder shows

  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [responseModalOpen, setResponseModalOpen] = useState(false);
  const [responseListModalOpen, setResponseListModalOpen] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState<any>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Response form state
  const [merchantPrice, setMerchantPrice] = useState('');
  const [availableQuantity, setAvailableQuantity] = useState('');
  const [remarks, setRemarks] = useState('');

  // Map UI status values to the underlying enquiry statuses in your data
  // (adjust as you add real workflow statuses)
  const statusMap: Record<string, string[]> = {
    all: [],            // no filter
    '': [],             // treat empty like "all"
    new: ['pending'],
    viewed: ['responded'],
    contacted: ['responded'],
    negotiating: ['pending'],
  };

  // Check if an enquiry is expired
  const isExpired = (enquiry: any) => {
    const today = new Date();
    const expiryDate = new Date(enquiry.deliveryDeadline);
    return expiryDate < today;
  };

  // Check if an enquiry is expiring soon (within 3 days)
  const isExpiringSoon = (enquiry: any) => {
    const today = new Date();
    const expiryDate = new Date(enquiry.deliveryDeadline);
    const threeDaysFromNow = new Date(today.getTime() + (3 * 24 * 60 * 60 * 1000));
    return expiryDate <= threeDaysFromNow && expiryDate >= today;
  };

  // Sort enquiries
  const sortEnquiries = (enquiries: any[]) => {
    if (!sortField) return enquiries;

    return [...enquiries].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle different data types
      if (sortField === 'deliveryDeadline') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else if (sortField === 'quantity') {
        // Extract numeric value from quantity string (e.g., "100kg" -> 100)
        aValue = parseInt(aValue.replace(/[^0-9]/g, '')) || 0;
        bValue = parseInt(bValue.replace(/[^0-9]/g, '')) || 0;
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // Get enquiries from local storage and combine with mock data
  const storedEnquiries = getRequirementsAsEnquiries();
  const allEnquiries = [...mockEnquiries, ...storedEnquiries];

  // Filter out expired enquiries
  const activeEnquiries = useMemo(() => {
    return allEnquiries.filter(enquiry => !isExpired(enquiry));
  }, [allEnquiries]);

  // Filter enquiries only when Apply clicked (excluding expired ones)
  const filteredEnquiries = sortEnquiries(activeEnquiries.filter(enquiry => {
    const matchesSearch =
      searchFilter === '' ||
      enquiry.customerName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      enquiry.productName.toLowerCase().includes(searchFilter.toLowerCase());

    const normalized = statusFilter === '' ? '' : statusFilter; // '' or one of: all/new/viewed/contacted/negotiating
    const allowedStatuses = statusMap[normalized] ?? [];
    const matchesStatus =
      normalized === '' || normalized === 'all' || allowedStatuses.includes(enquiry.status);

    return matchesSearch && matchesStatus;
  }));

  const totalPages = Math.ceil(filteredEnquiries.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredEnquiries.length);
  const paginatedEnquiries = filteredEnquiries.slice(startIndex, endIndex);

  const handleViewClick = (enquiry: any) => {
    setSelectedEnquiry(enquiry);
    setResponseModalOpen(true);
  };

  const handleResponsesClick = (enquiry: any) => {
    setSelectedEnquiry(enquiry);
    setResponseListModalOpen(true);
  };

  const handleChatClick = (enquiry: any) => {
    setSelectedEnquiry(enquiry);
    setChatModalOpen(true);

    // Update status to 'responded' if it was 'pending' and this is from stored requirements
    if (enquiry.status === 'pending' && enquiry.id > 1000) { // Assuming stored enquiries have higher IDs
      updateRequirementStatus(enquiry.id.toString(), 'responded');
    }
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

  const handleSort = (field: string) => {
    if (sortField === field) {
      // If clicking the same field, toggle direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // If clicking a new field, set it and default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 text-muted-foreground opacity-50" />;
    }
    return sortDirection === 'asc'
      ? <ArrowUp className="h-4 w-4 text-primary" />
      : <ArrowDown className="h-4 w-4 text-primary" />;
  };

  const handleSubmitResponse = () => {
    if (!merchantPrice || !availableQuantity) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const response = {
      requirementId: selectedEnquiry.id.toString(),
      merchantId: "merchant-1", // This would come from auth context
      merchantName: "ABC Trading Co.", // This would come from merchant profile
      merchantLocation: "Mumbai, India",
      price: `₹${merchantPrice}/kg`,
      responseDate: new Date().toISOString(),
      status: 'new' as const,
      grade: selectedEnquiry.grade,
      quantity: availableQuantity + " kg",
      origin: selectedEnquiry.origin,
      certifications: ["ISO 22000", "HACCP"],
      deliveryTime: "15-20 days",
      contact: "+91-9876543210",
      message: remarks || `We can supply ${availableQuantity}kg of ${selectedEnquiry.grade} cashews at ₹${merchantPrice}/kg.`
    };

    addResponse(response);
    
    toast({
      title: "Response Submitted",
      description: "Your response has been sent to the buyer",
    });

    // Reset form and close modal
    setMerchantPrice('');
    setAvailableQuantity('');
    setRemarks('');
    setResponseModalOpen(false);
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

              {/* ✅ Filter by Status — shadcn/ui Select (exact structure you asked for) */}
              <div>
                <label className="text-sm font-medium mb-2 block">Filter by Status</label>
                <Select
                  value={tempStatusFilter}
                  onValueChange={(value) => setTempStatusFilter(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="new">Pending</SelectItem>
                    <SelectItem value="viewed">Responded</SelectItem>
                  </SelectContent>
                </Select>
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
                <TableHead
                  className="cursor-pointer hover:bg-muted/50 select-none"
                  onClick={() => handleSort('customerName')}
                >
                  <div className="flex items-center justify-between">
                    Buyer Name
                    {getSortIcon('customerName')}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50 select-none"
                  onClick={() => handleSort('productName')}
                >
                  <div className="flex items-center justify-between">
                    Product
                    {getSortIcon('productName')}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50 select-none"
                  onClick={() => handleSort('quantity')}
                >
                  <div className="flex items-center justify-between">
                    Required Qty (kg)
                    {getSortIcon('quantity')}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50 select-none"
                  onClick={() => handleSort('expectedPrice')}
                >
                  <div className="flex items-center justify-between">
                    Expected Price
                    {getSortIcon('expectedPrice')}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50 select-none"
                  onClick={() => handleSort('deliveryDeadline')}
                >
                  <div className="flex items-center justify-between">
                    Expected Date
                    {getSortIcon('deliveryDeadline')}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50 select-none"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center justify-between">
                    Buyer Status
                    {getSortIcon('status')}
                  </div>
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedEnquiries.map((enquiry) => (
                <TableRow key={enquiry.id}>
                  <TableCell className="font-medium">{enquiry.customerName}</TableCell>
                  <TableCell>{enquiry.productName}</TableCell>
                  <TableCell>{enquiry.quantity}</TableCell>
                  <TableCell>₹{enquiry.expectedPrice}/kg</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{new Date(enquiry.deliveryDeadline).toLocaleDateString()}</span>
                      {isExpiringSoon(enquiry) && (
                        <Badge variant="outline" className="text-orange-600 border-orange-600 text-xs">
                          Expiring Soon
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={enquiry.status === 'pending' ? 'destructive' : 'default'}>
                      {enquiry.status === 'pending' ? 'Pending' : 'Responded'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleViewClick(enquiry)} title="Submit Response">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleResponsesClick(enquiry)} title="View Responses">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredEnquiries.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
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

      {/* Submit Response Modal */}
      <Dialog open={responseModalOpen} onOpenChange={setResponseModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>View Details & Reply</DialogTitle>
            <DialogDescription>
              Enquiry from {selectedEnquiry?.customerName} for {selectedEnquiry?.productName}
            </DialogDescription>
          </DialogHeader>
          {selectedEnquiry && (
            <div className="space-y-4">
              {/* Enquiry Details */}
              <div className="bg-muted/50 p-3 rounded-lg">
                <h4 className="font-medium mb-2">Customer Message:</h4>
                <p className="text-sm text-muted-foreground">{selectedEnquiry?.message || "Customer is interested in your product."}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Buyer</Label>
                  <p className="font-medium">{selectedEnquiry.customerName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Product</Label>
                  <p className="font-medium">{selectedEnquiry.productName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Required Qty</Label>
                  <p className="font-medium">{selectedEnquiry.quantity}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Expected Price</Label>
                  <p className="font-medium">₹{selectedEnquiry.expectedPrice}/kg</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {/* Reply Message Input */}
                <div>
                  <Label htmlFor="replyMessage">Reply Message</Label>
                  <Textarea
                    id="replyMessage"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Type your reply message to the customer..."
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="merchantPrice">Your Price (₹/kg) *</Label>
                  <Input
                    id="merchantPrice"
                    type="number"
                    placeholder="Enter your price per kg"
                    value={merchantPrice}
                    onChange={(e) => setMerchantPrice(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="availableQuantity">Available Quantity (kg) *</Label>
                  <Input
                    id="availableQuantity"
                    type="number"
                    placeholder="Enter available quantity"
                    value={availableQuantity}
                    onChange={(e) => setAvailableQuantity(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSubmitResponse} className="flex-1">
                  Submit Response
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setResponseModalOpen(false);
                    setMerchantPrice('');
                    setAvailableQuantity('');
                    setRemarks('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* View Responses Modal */}
      <Dialog open={responseListModalOpen} onOpenChange={setResponseListModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Merchant Responses</DialogTitle>
            <DialogDescription>View all responses for this requirement</DialogDescription>
          </DialogHeader>
          {selectedEnquiry && (
            <div className="space-y-4">
              {getResponsesByRequirementId(selectedEnquiry.id.toString()).map((response) => (
                <Card key={response.id} className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold">{response.merchantName}</h3>
                      <p className="text-sm text-muted-foreground">Origin: {response.origin}</p>
                      <p className="text-sm text-muted-foreground">Contact: {response.contact}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Price:</span>
                        <span className="font-medium ml-2">{response.price}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Available Qty:</span>
                        <span className="font-medium ml-2">{response.quantity}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Message:</span>
                        <p className="text-sm mt-1">{response.message}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Select defaultValue={response.status}>
                        <SelectTrigger>
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">Selected</SelectItem>
                          <SelectItem value="accepted">Confirmation</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button size="sm" className="w-full">Submit</Button>
                    </div>
                  </div>
                </Card>
              ))}
              {getResponsesByRequirementId(selectedEnquiry.id.toString()).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No responses yet for this requirement.
                </div>
              )}
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
        enquiry={selectedEnquiry}
      />
    </div>
  );
};

export default MerchantEnquiries;
