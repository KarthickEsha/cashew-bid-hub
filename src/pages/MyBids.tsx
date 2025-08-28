import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Calendar,
  MapPin,
  Search,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Package,
  Inbox
} from "lucide-react";

const MyBids = () => {
  const [currentPage, setCurrentPage] = useState(1);

  // temporary states for UI inputs
  const [tempSearchTerm, setTempSearchTerm] = useState("");
  const [tempStatusFilter, setTempStatusFilter] = useState("all");
  const [tempLocationFilter, setTempLocationFilter] = useState("all");

  // applied filters (used for actual filtering)
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");

  // dialog state
  const [selectedBid, setSelectedBid] = useState<any>(null);

  const bids = [
    {
      id: 1,
      productName: "Premium W320 Cashews",
      merchantName: "Golden Cashew Co.",
      bidAmount: "$8,200/ton",
      quantity: "25 tons",
      totalValue: "$205,000",
      status: "pending",
      bidDate: "2024-08-20",
      expiryDate: "2024-08-25",
      location: "Mumbai, India"
    },
    {
      id: 2,
      productName: "Organic SW240 Cashews",
      merchantName: "Vietnam Nuts Ltd.",
      bidAmount: "$9,500/ton",
      quantity: "15 tons",
      totalValue: "$142,500",
      status: "accepted",
      bidDate: "2024-08-18",
      acceptedDate: "2024-08-19",
      location: "Ho Chi Minh, Vietnam"
    },
    {
      id: 3,
      productName: "W240 Cashews",
      merchantName: "African Cashew Co",
      bidAmount: "$7,800/ton",
      quantity: "30 tons",
      totalValue: "$234,000",
      status: "rejected",
      bidDate: "2024-08-15",
      rejectedDate: "2024-08-16",
      location: "Accra, Ghana"
    }
  ];

  // get unique locations for filter dropdown
  const uniqueLocations = ["all", ...Array.from(new Set(bids.map((b) => b.location)))];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock size={16} className="text-yellow-500" />;
      case "accepted":
        return <CheckCircle size={16} className="text-green-500" />;
      case "rejected":
        return <XCircle size={16} className="text-red-500" />;
      default:
        return <AlertCircle size={16} className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // apply filters
  const filteredBids = bids.filter((bid) => {
    const matchesSearch = searchTerm
      ? bid.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bid.merchantName.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    const matchesStatus = statusFilter !== "all" ? bid.status === statusFilter : true;
    const matchesLocation = locationFilter !== "all" ? bid.location === locationFilter : true;
    return matchesSearch && matchesStatus && matchesLocation;
  });

  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredBids.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentBids = filteredBids.slice(startIndex, startIndex + itemsPerPage);

  // handle Apply Filters
  const handleApplyFilters = () => {
    setSearchTerm(tempSearchTerm);
    setStatusFilter(tempStatusFilter);
    setLocationFilter(tempLocationFilter);
    setCurrentPage(1);
  };

  // handle Clear Filters
  const handleClearFilters = () => {
    setTempSearchTerm("");
    setTempStatusFilter("all");
    setTempLocationFilter("all");
    setSearchTerm("");
    setStatusFilter("all");
    setLocationFilter("all");
    setCurrentPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">My Bids</h1>
        <p className="text-muted-foreground">
          Track your submitted bids and their status
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Bids", value: bids.length.toString(), color: "text-blue-600" },
          { label: "Pending", value: bids.filter(b => b.status === "pending").length.toString(), color: "text-yellow-600" },
          { label: "Accepted", value: bids.filter(b => b.status === "accepted").length.toString(), color: "text-green-600" },
          { label: "Rejected", value: bids.filter(b => b.status === "rejected").length.toString(), color: "text-red-600" }
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
          <CardTitle>Filter Bids</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
              />
              <Input
                placeholder="Search bids..."
                className="pl-10"
                value={tempSearchTerm}
                onChange={(e) => setTempSearchTerm(e.target.value)}
              />
            </div>

            {/* Status */}
            <Select value={tempStatusFilter} onValueChange={(value) => setTempStatusFilter(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            {/* Location */}
            <Select value={tempLocationFilter} onValueChange={(value) => setTempLocationFilter(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                {uniqueLocations.map((loc) => (
                  <SelectItem key={loc} value={loc}>
                    {loc === "all" ? "All Locations" : loc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Buttons */}
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleClearFilters}>
                Clear Filters
              </Button>
              <Button onClick={handleApplyFilters}>Apply Filters</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bids List */}
      <div className="space-y-4 mb-8">
        {currentBids.length === 0 ? (
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
          currentBids.map((bid) => (
            <Card key={bid.id} className="hover:shadow-warm transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-lg font-semibold">{bid.productName}</h3>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(bid.status)}
                        <Badge className={getStatusColor(bid.status)}>
                          {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-muted-foreground">{bid.merchantName}</p>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <MapPin size={14} className="mr-1" />
                      {bid.location}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">{bid.totalValue}</div>
                    <div className="text-sm text-muted-foreground">Total Value</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <Package size={16} className="text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Quantity</div>
                      <div className="font-medium">{bid.quantity}</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground">Bid Amount</div>
                    <div className="font-medium">{bid.bidAmount}</div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Calendar size={16} className="text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Bid Date</div>
                      <div className="font-medium">
                        {new Date(bid.bidDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Clock size={16} className="text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">
                        {bid.status === "pending" ? "Expires" :
                          bid.status === "accepted" ? "Accepted" : "Rejected"}
                      </div>
                      <div className="font-medium">
                        {bid.status === "pending" ? new Date(bid.expiryDate).toLocaleDateString() :
                          bid.status === "accepted" ? new Date(bid.acceptedDate).toLocaleDateString() :
                            new Date(bid.rejectedDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedBid(bid)}
                  >
                    <Eye size={14} className="mr-2" /> View Details
                  </Button>

                  {bid.status === "accepted" && (
                    <Button size="sm">Proceed to Order</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}

      </div>

      {/* Pagination */}
      {totalPages > 1 && (
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

      {/* View Details Dialog */}
      <Dialog open={!!selectedBid} onOpenChange={() => setSelectedBid(null)}>
        <DialogContent className="max-w-lg">
          {selectedBid && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedBid.productName}</DialogTitle>
                <DialogDescription>
                  Details of your bid with {selectedBid.merchantName}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 mt-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Merchant:</span>
                  <span className="font-medium">{selectedBid.merchantName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location:</span>
                  <span className="font-medium">{selectedBid.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quantity:</span>
                  <span className="font-medium">{selectedBid.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bid Amount:</span>
                  <span className="font-medium">{selectedBid.bidAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Value:</span>
                  <span className="font-medium">{selectedBid.totalValue}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-medium capitalize">{selectedBid.status}</span>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <Button variant="outline" onClick={() => setSelectedBid(null)}>
                  Close
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyBids;
