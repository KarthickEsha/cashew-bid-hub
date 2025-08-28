import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  MapPin,
  DollarSign,
  Search,
  Eye,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  AlertTriangle,
  Plus,
  Inbox,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const MyRequirements = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [filteredRequirements, setFilteredRequirements] = useState<any[]>([]);
  const [requirements, setRequirements] = useState<any[]>([
    {
      id: 1,
      title: "Premium W320 Cashews for Export",
      grade: "W320",
      quantity: "50 tons",
      preferredOrigin: "India",
      budgetRange: "$8,000 - $9,000/ton",
      deliveryLocation: "Port of Los Angeles, USA",
      deliveryDeadline: "2024-12-15",
      requirementExpiry: "2024-11-30",
      status: "active",
      responsesCount: 5,
      createdDate: "2024-08-15",
      lastModified: "2024-08-20",
    },
    {
      id: 2,
      title: "Organic SW240 Cashews",
      grade: "SW240",
      quantity: "25 tons",
      preferredOrigin: "Vietnam",
      budgetRange: "$9,200 - $10,000/ton",
      deliveryLocation: "Hamburg Port, Germany",
      deliveryDeadline: "2024-11-20",
      requirementExpiry: "2024-10-25",
      status: "draft",
      responsesCount: 0,
      createdDate: "2024-08-18",
      lastModified: "2024-08-18",
    },
    {
      id: 3,
      title: "Bulk W240 Cashews",
      grade: "W240",
      quantity: "100 tons",
      preferredOrigin: "Any",
      budgetRange: "$7,500 - $8,500/ton",
      deliveryLocation: "Rotterdam, Netherlands",
      deliveryDeadline: "2024-10-30",
      requirementExpiry: "2024-08-25",
      status: "expired",
      responsesCount: 8,
      createdDate: "2024-07-20",
      lastModified: "2024-07-25",
    },
    {
      id: 4,
      title: "Premium Cashews for Retail",
      grade: "W180",
      quantity: "30 tons",
      preferredOrigin: "Ghana",
      budgetRange: "$9,500 - $11,000/ton",
      deliveryLocation: "New York Port, USA",
      deliveryDeadline: "2024-12-01",
      requirementExpiry: "2024-11-15",
      status: "closed",
      responsesCount: 12,
      createdDate: "2024-08-01",
      lastModified: "2024-08-10",
    },
  ]);

  // Delete popup state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle size={16} className="text-green-500" />;
      case "draft":
        return <Edit size={16} className="text-gray-500" />;
      case "expired":
        return <Clock size={16} className="text-red-500" />;
      case "closed":
        return <AlertTriangle size={16} className="text-orange-500" />;
      default:
        return <Clock size={16} className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "expired":
        return "bg-red-100 text-red-800";
      case "closed":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Apply filter function
  const applyFilters = () => {
    let temp = [...requirements];
    if (searchTerm) {
      temp = temp.filter((req) =>
        req.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== "all") {
      temp = temp.filter((req) => req.status === statusFilter);
    }
    if (gradeFilter !== "all") {
      temp = temp.filter((req) => req.grade === gradeFilter);
    }
    setFilteredRequirements(temp);
    setCurrentPage(1); // reset to first page
  };

  // Run filters on mount
  useEffect(() => {
    setFilteredRequirements(requirements);
  }, [requirements]);

  // Pagination
  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredRequirements.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentRequirements = filteredRequirements.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Handle delete confirm
  const handleDelete = () => {
    if (deleteId !== null) {
      setRequirements(requirements.filter((req) => req.id !== deleteId));
      setDeleteId(null);
      setDeleteOpen(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            My Requirements
          </h1>
          <p className="text-muted-foreground">
            Manage your posted requirements and track responses
          </p>
        </div>
        <Link to="/post-requirement">
          <Button size="lg">
            <Plus size={16} className="mr-2" /> Post New Requirement
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Total Requirements",
            value: requirements.length,
            color: "text-blue-600",
          },
          {
            label: "Active",
            value: requirements.filter((r) => r.status === "active").length,
            color: "text-green-600",
          },
          {
            label: "Draft",
            value: requirements.filter((r) => r.status === "draft").length,
            color: "text-gray-600",
          },
          {
            label: "Total Responses",
            value: requirements.reduce((acc, r) => acc + r.responsesCount, 0),
            color: "text-orange-600",
          },
        ].map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className={`text-sm ${stat.color}`}>{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filter Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
              />
              <Input
                placeholder="Search requirements..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select onValueChange={(value) => setStatusFilter(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select onValueChange={(value) => setGradeFilter(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grades</SelectItem>
                <SelectItem value="W180">W180</SelectItem>
                <SelectItem value="W240">W240</SelectItem>
                <SelectItem value="W320">W320</SelectItem>
                <SelectItem value="SW240">SW240</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={applyFilters}>Apply Filters</Button>
          </div>
        </CardContent>
      </Card>

      {/* Requirements Grid */}
      {filteredRequirements.length === 0 ? (
        <Card className="p-10 text-center">
          <Inbox className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-lg font-medium">
            No data found for the selected filters
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Try changing your search or filter options
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {currentRequirements.map((requirement) => (
            <Card
              key={requirement.id}
              className="hover:shadow-warm transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <CardTitle className="text-lg">
                        {requirement.title}
                      </CardTitle>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(requirement.status)}
                        <Badge className={getStatusColor(requirement.status)}>
                          {requirement.status.charAt(0).toUpperCase() +
                            requirement.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Grade:</span>
                    <div className="font-semibold">{requirement.grade}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Quantity:</span>
                    <div className="font-semibold">{requirement.quantity}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Origin:</span>
                    <div className="font-semibold">
                      {requirement.preferredOrigin}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Responses:</span>
                    <div className="font-semibold text-primary">
                      {requirement.responsesCount}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <DollarSign
                      size={14}
                      className="mr-1 text-muted-foreground"
                    />
                    <span className="font-medium">
                      {requirement.budgetRange}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin size={14} className="mr-1" />
                    {requirement.deliveryLocation}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar size={14} className="mr-1" />
                    Delivery:{" "}
                    {new Date(requirement.deliveryDeadline).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock size={14} className="mr-1" />
                    Expires:{" "}
                    {new Date(
                      requirement.requirementExpiry
                    ).toLocaleDateString()}
                  </div>
                </div>
                <div className="pt-3 border-t border-border">
                  <div className="flex justify-between items-center text-xs text-muted-foreground mb-3">
                    <span>
                      Created:{" "}
                      {new Date(requirement.createdDate).toLocaleDateString()}
                    </span>
                    <span>
                      Modified:{" "}
                      {new Date(requirement.lastModified).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Link to={`/requirement/${requirement.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye size={14} className="mr-2" /> View
                      </Button>
                    </Link>
                    {(requirement.status === "draft" ||
                      requirement.status === "active") && (
                        <Link to={`/edit-requirement/${requirement.id}`}>
                          <Button variant="outline" size="sm">
                            <Edit size={14} className="mr-2" /> Edit
                          </Button>
                        </Link>
                      )}
                    {requirement.status === "draft" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setDeleteId(requirement.id);
                          setDeleteOpen(true);
                        }}
                      >
                        <Trash2 size={14} className="mr-2" /> Delete
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {filteredRequirements.length > 0 && (
        <div className="flex justify-center">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Previous
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                size="sm"
                variant={currentPage === page ? "default" : "outline"}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Delete confirmation popup */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Requirement</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this requirement? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyRequirements;
