import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calendar,
  MapPin,
  DollarSign,
  Search,
  Eye,
  MessageCircle,
  User,
  Clock,
  CheckCircle,
  Star,
  Building
} from "lucide-react";
import { Link } from "react-router-dom";

const Responses = () => {
  const [currentPage, setCurrentPage] = useState(1);
  
  const responses = [
    {
      id: 1,
      requirementId: 1,
      requirementTitle: "Premium W320 Cashews for Export",
      merchantName: "Golden Cashew Co.",
      merchantLocation: "Mumbai, India",
      merchantRating: 4.8,
      responseDate: "2024-08-20",
      status: "new",
      offerPrice: "$8,200/ton",
      quantity: "50 tons",
      grade: "W320",
      deliveryTime: "15-20 days",
      minimumOrder: "10 tons",
      specifications: "Moisture: 5%, Broken: <5%, Premium quality kernels",
      merchantImage: "/api/placeholder/40/40",
      isStarred: false
    },
    {
      id: 2,
      requirementId: 1,
      requirementTitle: "Premium W320 Cashews for Export",
      merchantName: "Vietnam Nuts Ltd.",
      merchantLocation: "Ho Chi Minh, Vietnam",
      merchantRating: 4.6,
      responseDate: "2024-08-19",
      status: "viewed",
      offerPrice: "$7,800/ton",
      quantity: "50+ tons",
      grade: "W320",
      deliveryTime: "10-15 days",
      minimumOrder: "25 tons",
      specifications: "Organic certified, Moisture: 4.5%, Premium grade",
      merchantImage: "/api/placeholder/40/40",
      isStarred: true
    },
    {
      id: 3,
      requirementId: 2,
      requirementTitle: "Organic SW240 Cashews",
      merchantName: "Organic Harvest Inc.",
      merchantLocation: "Accra, Ghana",
      merchantRating: 4.9,
      responseDate: "2024-08-18",
      status: "contacted",
      offerPrice: "$9,500/ton",
      quantity: "25 tons",
      grade: "SW240",
      deliveryTime: "20-25 days",
      minimumOrder: "5 tons",
      specifications: "USDA Organic, Fair Trade certified, Premium quality",
      merchantImage: "/api/placeholder/40/40",
      isStarred: false
    },
    {
      id: 4,
      requirementId: 1,
      requirementTitle: "Premium W320 Cashews for Export",
      merchantName: "Cashew Palace",
      merchantLocation: "Kerala, India",
      merchantRating: 4.7,
      responseDate: "2024-08-17",
      status: "negotiating",
      offerPrice: "$8,000/ton",
      quantity: "100 tons",
      grade: "W320",
      deliveryTime: "12-18 days",
      minimumOrder: "20 tons",
      specifications: "Premium grade, Moisture: 5%, Perfect for export",
      merchantImage: "/api/placeholder/40/40",
      isStarred: true
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'viewed': return 'bg-gray-100 text-gray-800';
      case 'contacted': return 'bg-green-100 text-green-800';
      case 'negotiating': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <Clock size={16} className="text-blue-500" />;
      case 'viewed': return <Eye size={16} className="text-gray-500" />;
      case 'contacted': return <MessageCircle size={16} className="text-green-500" />;
      case 'negotiating': return <CheckCircle size={16} className="text-orange-500" />;
      default: return <Clock size={16} className="text-gray-500" />;
    }
  };

  const itemsPerPage = 6;
  const totalPages = Math.ceil(responses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentResponses = responses.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Responses</h1>
        <p className="text-muted-foreground">Merchant responses to your posted requirements</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Responses", value: "23", color: "text-blue-600" },
          { label: "New", value: "7", color: "text-green-600" },
          { label: "In Discussion", value: "4", color: "text-orange-600" },
          { label: "Starred", value: "6", color: "text-yellow-600" }
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
          <CardTitle>Filter Responses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search responses..." className="pl-10" />
            </div>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="viewed">Viewed</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="negotiating">Negotiating</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Requirement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Requirements</SelectItem>
                <SelectItem value="1">Premium W320 Cashews for Export</SelectItem>
                <SelectItem value="2">Organic SW240 Cashews</SelectItem>
              </SelectContent>
            </Select>
            <Button>Apply Filters</Button>
          </div>
        </CardContent>
      </Card>

      {/* Responses List */}
      <div className="space-y-4 mb-8">
        {currentResponses.map((response) => (
          <Card key={response.id} className="hover:shadow-warm transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-primary">
                      Response to: {response.requirementTitle}
                    </h3>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(response.status)}
                      <Badge className={getStatusColor(response.status)}>
                        {response.status.charAt(0).toUpperCase() + response.status.slice(1)}
                      </Badge>
                    </div>
                    {response.isStarred && (
                      <Star size={16} className="text-yellow-500 fill-yellow-500" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Requirement ID: #{response.requirementId}
                  </p>
                </div>
                <div className="text-sm text-muted-foreground">
                  {new Date(response.responseDate).toLocaleDateString()}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Merchant Info */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center">
                    <Building size={16} className="mr-2" />
                    Merchant Details
                  </h4>
                  <div className="bg-accent/50 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <img 
                        src={response.merchantImage} 
                        alt={response.merchantName}
                        className="w-10 h-10 rounded-full bg-gray-200"
                      />
                      <div>
                        <div className="font-medium">{response.merchantName}</div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin size={12} className="mr-1" />
                          {response.merchantLocation}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Star size={14} className="text-yellow-500 fill-yellow-500 mr-1" />
                      <span className="text-sm font-medium">{response.merchantRating}</span>
                      <span className="text-sm text-muted-foreground ml-1">rating</span>
                    </div>
                  </div>
                </div>

                {/* Offer Details */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center">
                    <DollarSign size={16} className="mr-2" />
                    Offer Details
                  </h4>
                  <div className="bg-accent/50 rounded-lg p-4 space-y-2">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Price:</span>
                        <div className="font-semibold text-primary">{response.offerPrice}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Quantity:</span>
                        <div className="font-semibold">{response.quantity}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Grade:</span>
                        <div className="font-semibold">{response.grade}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Delivery:</span>
                        <div className="font-semibold">{response.deliveryTime}</div>
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Min Order:</span>
                        <div className="font-semibold">{response.minimumOrder}</div>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-border">
                      <span className="text-muted-foreground text-sm">Specifications:</span>
                      <p className="text-sm mt-1">{response.specifications}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center mt-6 pt-4 border-t border-border">
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Star size={14} className="mr-2" />
                    {response.isStarred ? 'Unstar' : 'Star'}
                  </Button>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Eye size={14} className="mr-2" />
                    View Details
                  </Button>
                  <Button variant="outline" size="sm">
                    <MessageCircle size={14} className="mr-2" />
                    Contact
                  </Button>
                  <Button size="sm">
                    Enquire
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
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
    </div>
  );
};

export default Responses;