import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, MessageSquare, MapPin } from "lucide-react";

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
  const itemsPerPage = 10;

  const filteredRequirements = mockRequirements.filter(req => 
    locationFilter === '' || req.location.toLowerCase().includes(locationFilter.toLowerCase())
  );

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
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Filter by Location</label>
              <input
                type="text"
                placeholder="Enter location..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md"
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
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-green-600">
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
    </div>
  );
};

export default MerchantRequirements;