import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Eye, MessageSquare, MapPin, Filter } from "lucide-react";
import ChatModal from "@/components/ChatModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Import Select components

const mockRequirements = [
  {
    id: 1,
    title: "Premium Cashews W210",
    customer: "Gourmet Foods Ltd",
    grade: "W210",
    quantity: "300kg",
    unit: "kg",
    origin: "India",
    minBudget: 9.0,
    maxBudget: 11.0,
    deliveryDeadline: "2024-03-10",
    location: "Chicago, USA",
    posted: "2024-02-01",
    expires: "2024-03-01",
  },
  {
    id: 2,
    title: "Organic Cashews BB",
    customer: "Healthy Snacks Co",
    grade: "W210",
    quantity: "1 ton",
    unit: "tons",
    origin: "Vietnam",
    minBudget: 6.0,
    maxBudget: 7.5,
    deliveryDeadline: "2024-04-15",
    location: "Los Angeles, USA",
    posted: "2024-02-05",
    expires: "2024-04-01",
  },
  {
    id: 3,
    title: "Cashews W180 Export",
    customer: "Global Traders Inc",
    grade: "W180",
    quantity: "2 tons",
    unit: "tons",
    origin: "India",
    minBudget: 12.0,
    maxBudget: 15.0,
    deliveryDeadline: "2024-03-20",
    location: "London, UK",
    posted: "2024-02-10",
    expires: "2024-03-15",
  },
  {
    id: 4,
    title: "Raw Cashews W240",
    customer: "NutriMart Ltd",
    grade: "W240",
    quantity: "500kg",
    unit: "kg",
    origin: "Brazil",
    minBudget: 10.0,
    maxBudget: 12.0,
    deliveryDeadline: "2024-05-05",
    location: "Toronto, Canada",
    posted: "2024-02-12",
    expires: "2024-04-30",
  },
  {
    id: 5,
    title: "High Grade Cashews W320",
    customer: "Premium Exporters",
    grade: "W320",
    quantity: "750kg",
    unit: "kg",
    origin: "India",
    minBudget: 14.0,
    maxBudget: 16.0,
    deliveryDeadline: "2024-03-25",
    location: "Dubai, UAE",
    posted: "2024-02-15",
    expires: "2024-03-20",
  },
  {
    id: 6,
    title: "Cashews BB for Retail",
    customer: "SnackWorld Pvt Ltd",
    grade: "W320",
    quantity: "1.5 tons",
    unit: "tons",
    origin: "Vietnam",
    minBudget: 5.5,
    maxBudget: 6.8,
    deliveryDeadline: "2024-04-10",
    location: "New York, USA",
    posted: "2024-02-18",
    expires: "2024-04-05",
  },
  {
    id: 7,
    title: "Raw Cashews W180",
    customer: "FoodMart International",
    grade: "W180",
    quantity: "1 ton",
    unit: "tons",
    origin: "India",
    minBudget: 11.0,
    maxBudget: 13.0,
    deliveryDeadline: "2024-03-30",
    location: "Sydney, Australia",
    posted: "2024-02-20",
    expires: "2024-03-25",
  },
  {
    id: 8,
    title: "Organic Cashews W240",
    customer: "EcoFoods Ltd",
    grade: "W240",
    quantity: "400kg",
    unit: "kg",
    origin: "Brazil",
    minBudget: 9.5,
    maxBudget: 11.0,
    deliveryDeadline: "2024-04-15",
    location: "Berlin, Germany",
    posted: "2024-02-22",
    expires: "2024-04-10",
  },
  {
    id: 9,
    title: "Cashews W320 Export",
    customer: "Global Nuts Traders",
    grade: "W320",
    quantity: "800kg",
    unit: "kg",
    origin: "India",
    minBudget: 15.0,
    maxBudget: 18.0,
    deliveryDeadline: "2024-05-05",
    location: "Paris, France",
    posted: "2024-02-25",
    expires: "2024-04-30",
  },
  {
    id: 10,
    title: "Broken Cashews BB",
    customer: "Snack Factory Co",
    grade: "W210",
    quantity: "2 tons",
    unit: "tons",
    origin: "Vietnam",
    minBudget: 5.0,
    maxBudget: 6.5,
    deliveryDeadline: "2024-04-20",
    location: "San Francisco, USA",
    posted: "2024-02-28",
    expires: "2024-04-15",
  },
];

const MerchantRequirements = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5); // Added page size state
  const [locationFilter, setLocationFilter] = useState("");
  const [gradeFilter, setGradeFilter] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState<any>(null);
  const [showFilterCard, setShowFilterCard] = useState(false);

  // Temporary states for filter inputs
  const [tempLocation, setTempLocation] = useState("");
  const [tempGrade, setTempGrade] = useState("");
  const [tempSearch, setTempSearch] = useState("");

  const filteredRequirements = mockRequirements.filter(
    (req) =>
      (locationFilter === "" || req.location.toLowerCase().includes(locationFilter.toLowerCase())) &&
      (gradeFilter === "" || req.grade.toLowerCase().includes(gradeFilter.toLowerCase())) &&
      (searchFilter === "" ||
        req.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
        req.customer.toLowerCase().includes(searchFilter.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredRequirements.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedRequirements = filteredRequirements.slice(startIndex, startIndex + pageSize);

  const handleViewClick = (requirement: any) => {
    setSelectedRequirement(requirement);
    setViewModalOpen(true);
  };

  const handleChatClick = (requirement: any) => {
    setSelectedRequirement(requirement);
    setChatModalOpen(true);
  };

  const applyFilters = () => {
    setLocationFilter(tempLocation);
    setGradeFilter(tempGrade);
    setSearchFilter(tempSearch);
    setShowFilterCard(false);
    setCurrentPage(1); // reset to first page
  };

  const cancelFilters = () => {
    setTempLocation(locationFilter);
    setTempGrade(gradeFilter);
    setTempSearch(searchFilter);
    setShowFilterCard(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">Customer Requirements</h1>
          <p className="text-muted-foreground mt-2">View requirements posted by customers and respond with your offers</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowFilterCard(!showFilterCard)}>
          <Filter className="h-4 w-4 mr-2" />
          Filter Requirements
        </Button>
      </div>

      {showFilterCard && (
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Search</label>
                <Input placeholder="Search title, customer..." value={tempSearch} onChange={(e) => setTempSearch(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Filter by Grade</label>
                <Input placeholder="Enter grade..." value={tempGrade} onChange={(e) => setTempGrade(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Filter by Location</label>
                <Input placeholder="Enter location..." value={tempLocation} onChange={(e) => setTempLocation(e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end mt-4 space-x-2">
              <Button variant="outline" onClick={cancelFilters}>Cancel</Button>
              <Button onClick={applyFilters}>Apply</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Requirements by Location</CardTitle>
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
                  <TableCell><Badge variant="outline">{requirement.grade}</Badge></TableCell>
                  <TableCell>{requirement.quantity}</TableCell>
                  <TableCell>${requirement.minBudget} - ${requirement.maxBudget}/{requirement.unit}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{requirement.location}</span>
                    </div>
                  </TableCell>
                  <TableCell>{new Date(requirement.deliveryDeadline).toLocaleDateString()}</TableCell>
                  <TableCell><Badge variant="destructive" className="text-xs">{new Date(requirement.expires).toLocaleDateString()}</Badge></TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleViewClick(requirement)}><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" className="text-green-600" onClick={() => handleChatClick(requirement)}><MessageSquare className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination with Page Size Selector */}
          {filteredRequirements.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(startIndex + pageSize, filteredRequirements.length)} of {filteredRequirements.length} requirements
              </div>
              <div className="flex items-center space-x-4">
                {/* Page Size Selector */}
                <Select value={String(pageSize)} onValueChange={(value) => { setPageSize(Number(value)); setCurrentPage(1); }}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="Page size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>

                {/* Prev/Next Buttons */}
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>Previous</Button>
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>Next</Button>
                </div>
              </div>
            </div>
          )}
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
                <Button variant="outline" onClick={() => setViewModalOpen(false)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Chat Modal */}
      <ChatModal
        isOpen={chatModalOpen}
        onClose={() => setChatModalOpen(false)}
        customerName={selectedRequirement?.customer || ""}
        productName={selectedRequirement?.title || ""}
        userType="merchant"
      />
    </div>
  );
};

export default MerchantRequirements;
