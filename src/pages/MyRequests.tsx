import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calendar, 
  MapPin, 
  Package, 
  Search,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { Link } from "react-router-dom";

const MyRequests = () => {
  const requests = [
    {
      id: 1,
      productName: "Premium W320 Cashews",
      merchantName: "Premium Cashews Ltd",
      quantityRequested: "25 tons",
      bidPrice: "$8,200/ton",
      totalValue: "$205,000",
      status: "pending",
      submittedDate: "2024-08-20",
      expectedResponse: "2024-08-22",
      message: "Looking for high quality cashews for export to Europe",
      location: "Mumbai, India"
    },
    {
      id: 2,
      productName: "SW240 Cashews",
      merchantName: "Vietnam Cashew Export", 
      quantityRequested: "50 tons",
      bidPrice: "$9,000/ton",
      totalValue: "$450,000",
      status: "approved",
      submittedDate: "2024-08-18",
      respondedDate: "2024-08-19",
      message: "Bulk order for retail distribution",
      location: "Ho Chi Minh City, Vietnam"
    },
    {
      id: 3,
      productName: "Organic W240 Cashews",
      merchantName: "Global Nuts Trading",
      quantityRequested: "15 tons", 
      bidPrice: "$8,500/ton",
      totalValue: "$127,500",
      status: "rejected",
      submittedDate: "2024-08-15",
      respondedDate: "2024-08-16",
      rejectionReason: "Minimum order quantity not met",
      location: "California, USA"
    },
    {
      id: 4,
      productName: "W320 Cashews",
      merchantName: "African Cashew Co",
      quantityRequested: "40 tons",
      bidPrice: "$7,800/ton", 
      totalValue: "$312,000",
      status: "negotiating",
      submittedDate: "2024-08-17",
      lastActivity: "2024-08-21",
      message: "Price negotiation in progress",
      location: "Accra, Ghana"
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock size={16} className="text-yellow-500" />;
      case 'approved': return <CheckCircle size={16} className="text-green-500" />;
      case 'rejected': return <XCircle size={16} className="text-red-500" />;
      case 'negotiating': return <AlertCircle size={16} className="text-blue-500" />;
      default: return <Clock size={16} className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'negotiating': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">My Requests</h1>
        <p className="text-muted-foreground">Track your bid requests and order status</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Requests", value: "12", color: "text-blue-600" },
          { label: "Pending", value: "5", color: "text-yellow-600" },
          { label: "Approved", value: "4", color: "text-green-600" },
          { label: "In Negotiation", value: "3", color: "text-orange-600" }
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
          <CardTitle>Filter Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search requests..." className="pl-10" />
            </div>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="negotiating">Negotiating</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Last Week</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
                <SelectItem value="quarter">Last 3 Months</SelectItem>
              </SelectContent>
            </Select>
            <Button>Apply Filters</Button>
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      <div className="space-y-4">
        {requests.map((request) => (
          <Card key={request.id} className="hover:shadow-warm transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-lg font-semibold">{request.productName}</h3>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(request.status)}
                      <Badge className={getStatusColor(request.status)}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-muted-foreground">{request.merchantName}</p>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <MapPin size={14} className="mr-1" />
                    {request.location}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">{request.totalValue}</div>
                  <div className="text-sm text-muted-foreground">Total Value</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center space-x-2">
                  <Package size={16} className="text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Quantity</div>
                    <div className="font-medium">{request.quantityRequested}</div>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Bid Price</div>
                  <div className="font-medium">{request.bidPrice}</div>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar size={16} className="text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Submitted</div>
                    <div className="font-medium">{new Date(request.submittedDate).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock size={16} className="text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">
                      {request.status === 'pending' ? 'Expected Response' : 
                       request.status === 'negotiating' ? 'Last Activity' : 'Responded'}
                    </div>
                    <div className="font-medium">
                      {request.status === 'pending' ? new Date(request.expectedResponse).toLocaleDateString() :
                       request.status === 'negotiating' ? new Date(request.lastActivity).toLocaleDateString() :
                       new Date(request.respondedDate || request.submittedDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              {request.message && (
                <div className="bg-accent/50 p-3 rounded-lg mb-4">
                  <div className="text-sm text-muted-foreground mb-1">Message</div>
                  <p className="text-sm">{request.message}</p>
                </div>
              )}

              {request.rejectionReason && (
                <div className="bg-red-50 border border-red-200 p-3 rounded-lg mb-4">
                  <div className="text-sm text-red-700 font-medium mb-1">Rejection Reason</div>
                  <p className="text-sm text-red-600">{request.rejectionReason}</p>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Link to={`/request/${request.id}`}>
                  <Button variant="outline" size="sm">
                    <Eye size={14} className="mr-2" />
                    View Details
                  </Button>
                </Link>
                {request.status === 'negotiating' && (
                  <Button size="sm">Continue Negotiation</Button>
                )}
                {request.status === 'approved' && (
                  <Button size="sm">Proceed to Order</Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-8">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button size="sm">1</Button>
          <Button variant="outline" size="sm">2</Button>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MyRequests;