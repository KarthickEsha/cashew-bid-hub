import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Eye, MessageSquare, MapPin } from "lucide-react";
import ChatModal from "@/components/ChatModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const mockRequirements = [
  {
    id: 1,
    title: "Premium Quality Cashews W240",
    customer: "Restaurant Chain ABC",
    grade: "W240",
    quantity: "500kg",
    unit: "kg",
    origin: "Kerala, India",
    minBudget: 8.00,
    maxBudget: 10.00,
    deliveryDeadline: "2024-02-15",
    location: "New York, USA",
    posted: "2024-01-10",
    expires: "2024-01-25"
  },
  {
    id: 2,
    title: "Organic Broken Cashews",
    customer: "Food Processing Ltd",
    grade: "Broken BB",
    quantity: "2 tons",
    unit: "tons",
    origin: "Vietnam",
    minBudget: 5.50,
    maxBudget: 7.00,
    deliveryDeadline: "2024-03-01",
    location: "California, USA",
    posted: "2024-01-12",
    expires: "2024-01-30"
  },
  {
    id: 3,
    title: "High Grade Cashews for Export",
    customer: "International Trader",
    grade: "W180",
    quantity: "1 ton",
    unit: "tons",
    origin: "India",
    minBudget: 12.00,
    maxBudget: 15.00,
    deliveryDeadline: "2024-02-28",
    location: "London, UK",
    posted: "2024-01-14",
    expires: "2024-02-01"
  }
];

const MerchantRequirements = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [locationFilter, setLocationFilter] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState<any>(null);
  const itemsPerPage = 10;

  const filteredRequirements = mockRequirements.filter(req => 
    (locationFilter === '' || req.location.toLowerCase().includes(locationFilter.toLowerCase())) &&
    (gradeFilter === '' || req.grade.toLowerCase().includes(gradeFilter.toLowerCase())) &&
    (searchFilter === '' || req.title.toLowerCase().includes(searchFilter.toLowerCase()) || req.customer.toLowerCase().includes(searchFilter.toLowerCase()))
  );

  const handleViewClick = (requirement: any) => {
    setSelectedRequirement(requirement);
    setViewModalOpen(true);
  };

  const handleChatClick = (requirement: any) => {
    setSelectedRequirement(requirement);
    setChatModalOpen(true);
  };

  const totalPages = Math.ceil(filteredRequirements.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRequirements = filteredRequirements.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">Customer Requirements</h1>
        <p className="text-muted-foreground mt-2">
          View requirements posted by customers and respond with your offers
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <Input
                placeholder="Search title, customer..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Filter by Grade</label>
              <Input
                placeholder="Enter grade..."
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Filter by Location</label>
              <Input
                placeholder="Enter location..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Requirements by Location</CardTitle>
          <CardDescription>Customer requirements sorted by delivery location</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Budget Range</TableHead>
                <TableHead>Delivery Location</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedRequirements.map((requirement) => (
                <TableRow key={requirement.id}>
                  <TableCell className="font-medium">{requirement.title}</TableCell>
                  <TableCell>{requirement.customer}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{requirement.grade}</Badge>
                  </TableCell>
                  <TableCell>{requirement.quantity}</TableCell>
                  <TableCell>
                    ${requirement.minBudget} - ${requirement.maxBudget}/{requirement.unit}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{requirement.location}</span>
                    </div>
                  </TableCell>
                  <TableCell>{new Date(requirement.deliveryDeadline).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant="destructive" className="text-xs">
                      {new Date(requirement.expires).toLocaleDateString()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleViewClick(requirement)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-green-600" onClick={() => handleChatClick(requirement)}>
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
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredRequirements.length)} of {filteredRequirements.length} requirements
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

      {/* View Requirement Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Requirement Details</DialogTitle>
            <DialogDescription>Complete information about the customer requirement</DialogDescription>
          </DialogHeader>
          {selectedRequirement && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Customer</h4>
                  <p className="font-medium">{selectedRequirement.customer}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Title</h4>
                  <p className="font-medium">{selectedRequirement.title}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Grade</h4>
                  <Badge variant="outline">{selectedRequirement.grade}</Badge>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Quantity</h4>
                  <p className="font-medium">{selectedRequirement.quantity}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Budget Range</h4>
                  <p className="font-medium">${selectedRequirement.minBudget} - ${selectedRequirement.maxBudget}/{selectedRequirement.unit}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Origin</h4>
                  <p className="font-medium">{selectedRequirement.origin}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Delivery Location</h4>
                  <p className="font-medium">{selectedRequirement.location}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Delivery Deadline</h4>
                  <p className="font-medium">{new Date(selectedRequirement.deliveryDeadline).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={() => handleChatClick(selectedRequirement)} className="flex-1">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Message
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
        customerName={selectedRequirement?.customer || ''}
        productName={selectedRequirement?.title || ''}
        userType="merchant"
      />
    </div>
  );
};

export default MerchantRequirements;