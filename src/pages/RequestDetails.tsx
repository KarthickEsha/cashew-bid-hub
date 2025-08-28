import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Package,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare,
  User
} from 'lucide-react';

const RequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock data
  const request = {
    id: 1,
    productName: "Premium W320 Cashews",
    merchantName: "Premium Cashews Ltd",
    quantityRequested: "25 tons",
    bidPrice: "$8,200/ton",
    totalValue: "$205,000",
    status: "pending",
    submittedDate: "2024-08-20",
    expectedResponse: "2024-08-22",
    message: "Looking for high quality cashews for export to Europe. Need certificates of quality and organic certification if available.",
    location: "Mumbai, India",
    merchantImage: "/api/placeholder/60/60",
    merchantRating: 4.8,
    specifications: {
      grade: "W320",
      moisture: "Max 5%",
      broken: "Max 5%",
      packaging: "Vacuum packed in 25kg bags",
      origin: "India",
      certifications: ["ISO 22000", "HACCP", "Organic"]
    },
    timeline: [
      { date: "2024-08-20", event: "Request submitted", status: "completed" },
      { date: "2024-08-21", event: "Under review", status: "completed" },
      { date: "2024-08-22", event: "Response expected", status: "pending" },
      { date: "2024-08-25", event: "Request expires", status: "upcoming" }
    ]
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock size={20} className="text-yellow-500" />;
      case "approved":
        return <CheckCircle size={20} className="text-green-500" />;
      case "rejected":
        return <XCircle size={20} className="text-red-500" />;
      case "negotiating":
        return <AlertCircle size={20} className="text-blue-500" />;
      default:
        return <Clock size={20} className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "negotiating":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="w-full min-h-screen px-6 py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} className="mr-2" />
          Back to My Requests
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Request Details</h1>
          <p className="text-muted-foreground">Request #{request.id}</p>
        </div>
      </div>

      {/* Main grid layout full width */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        {/* Left section (Main Content) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Request Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{request.productName}</CardTitle>
                  <p className="text-muted-foreground mt-1">{request.merchantName}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(request.status)}
                  <Badge className={getStatusColor(request.status)}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Package size={16} className="text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Quantity</div>
                    <div className="font-medium">{request.quantityRequested}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign size={16} className="text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Bid Price</div>
                    <div className="font-medium">{request.bidPrice}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin size={16} className="text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Location</div>
                    <div className="font-medium">{request.location}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar size={16} className="text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Submitted</div>
                    <div className="font-medium">
                      {new Date(request.submittedDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-primary/5 p-4 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{request.totalValue}</div>
                  <div className="text-sm text-muted-foreground">Total Request Value</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Message */}
          {request.message && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <MessageSquare size={18} className="mr-2" />
                  Request Message
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{request.message}</p>
              </CardContent>
            </Card>
          )}

          {/* Specifications */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Product Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Grade:</span>
                  <div className="font-medium">{request.specifications.grade}</div>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Moisture:</span>
                  <div className="font-medium">{request.specifications.moisture}</div>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Broken:</span>
                  <div className="font-medium">{request.specifications.broken}</div>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Origin:</span>
                  <div className="font-medium">{request.specifications.origin}</div>
                </div>
                <div className="col-span-2">
                  <span className="text-sm text-muted-foreground">Packaging:</span>
                  <div className="font-medium">{request.specifications.packaging}</div>
                </div>
                <div className="col-span-2">
                  <span className="text-sm text-muted-foreground">Certifications:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {request.specifications.certifications.map((cert, index) => (
                      <Badge key={index} variant="secondary">{cert}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Merchant Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <User size={18} className="mr-2" />
                Merchant Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3 mb-4">
                <img
                  src={request.merchantImage}
                  alt={request.merchantName}
                  className="w-12 h-12 rounded-full bg-gray-200"
                />
                <div>
                  <div className="font-medium">{request.merchantName}</div>
                  <div className="text-sm text-muted-foreground flex items-center">
                    <MapPin size={12} className="mr-1" />
                    {request.location}
                  </div>
                </div>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Rating: </span>
                <span className="font-medium">{request.merchantRating}/5.0</span>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Request Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {request.timeline.map((item, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        item.status === 'completed'
                          ? 'bg-green-500'
                          : item.status === 'pending'
                          ? 'bg-yellow-500'
                          : 'bg-gray-300'
                      }`}
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{item.event}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(item.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full">
                <MessageSquare size={16} className="mr-2" />
                Contact Merchant
              </Button>
              {request.status === "negotiating" && (
                <Button variant="outline" className="w-full">
                  Continue Negotiation
                </Button>
              )}
              {request.status === "approved" && (
                <Button variant="outline" className="w-full">
                  Proceed to Order
                </Button>
              )}
              <Button variant="outline" className="w-full">
                Download Details
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RequestDetails;
