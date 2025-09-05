import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useRequirements } from '@/hooks/useRequirements';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Package,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  Edit,
  Eye,
  MessageSquare,
  Users
} from 'lucide-react';

const RequirementDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getMyRequirements } = useRequirements();
  
  // State for managing responses popup
  const [showAllResponses, setShowAllResponses] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);

  // Get requirements and find the one with matching ID
  const requirements = getMyRequirements();
  const requirement = requirements.find(req => req.id.toString() === id);

  // If requirement not found, show error state
  if (!requirement) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} className="mr-2" />
            Back to My Requirements
          </Button>
        </div>
        <Card className="p-10 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Requirement Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The requirement you're looking for doesn't exist or has been deleted.
          </p>
          <Button onClick={() => navigate('/my-requirements')}>
            Back to My Requirements
          </Button>
        </Card>
      </div>
    );
  }

  // Mock responses data - in real app this would come from API
  const mockResponses = [
    {
      id: 1,
      merchantName: "Golden Cashew Co.",
      location: "Mumbai, India",
      price: "$8,200/ton",
      responseDate: "2024-08-18",
      status: "new",
      grade: requirement.grade,
      quantity: requirement.quantity,
      origin: requirement.preferredOrigin,
      certifications: ["ISO 22000", "HACCP"],
      deliveryTime: "15 days",
      contact: "+91-9876543210"
    },
    {
      id: 2,
      merchantName: "Premium Nuts Export",
      location: "Kerala, India",
      price: "$8,500/ton", 
      responseDate: "2024-08-19",
      status: "viewed",
      grade: requirement.grade,
      quantity: requirement.quantity,
      origin: requirement.preferredOrigin,
      certifications: ["ISO 22000", "HACCP", "Organic"],
      deliveryTime: "12 days",
      contact: "+91-9876543211"
    },
    {
      id: 3,
      merchantName: "Vietnam Cashew Export",
      location: "Ho Chi Minh City, Vietnam",
      price: "$8,100/ton",
      responseDate: "2024-08-20",
      status: "new",
      grade: requirement.grade,
      quantity: requirement.quantity,
      origin: "Binh Phuoc, Vietnam",
      certifications: ["ISO 22000", "HACCP"],
      deliveryTime: "18 days",
      contact: "+84-9876543212"
    },
    {
      id: 4,
      merchantName: "African Cashew Co.",
      location: "Accra, Ghana",
      price: "$7,800/ton",
      responseDate: "2024-08-21",
      status: "new",
      grade: requirement.grade,
      quantity: requirement.quantity,
      origin: "Northern Ghana",
      certifications: ["ISO 22000", "HACCP", "Fair Trade"],
      deliveryTime: "20 days",
      contact: "+233-9876543213"
    },
    {
      id: 5,
      merchantName: "Brazilian Nuts Ltd",
      location: "São Paulo, Brazil",
      price: "$8,300/ton",
      responseDate: "2024-08-22",
      status: "viewed",
      grade: requirement.grade,
      quantity: requirement.quantity,
      origin: "Ceará, Brazil",
      certifications: ["ISO 22000", "HACCP", "Organic"],
      deliveryTime: "25 days",
      contact: "+55-9876543214"
    }
  ];

  // Mock specifications - in real app this would come from requirement data
  const mockSpecifications = {
    moisture: "Max 5%",
    broken: "Max 5%",
    defects: "Max 2%",
    packaging: "Vacuum packed in 25kg bags",
    certifications: ["ISO 22000", "HACCP", "Organic (preferred)"],
    minShelfLife: "12 months"
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle size={20} className="text-green-500" />;
      case "draft":
        return <Edit size={20} className="text-gray-500" />;
      case "expired":
        return <Clock size={20} className="text-red-500" />;
      case "closed":
        return <AlertTriangle size={20} className="text-orange-500" />;
      default:
        return <Clock size={20} className="text-gray-500" />;
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

  // Place Order functionality
  const handlePlaceOrder = (response: any) => {
    const order = {
      id: Date.now(), // Simple ID generation
      requirementId: requirement.id,
      requirementTitle: requirement.title,
      merchantName: response.merchantName,
      merchantLocation: response.location,
      price: response.price,
      grade: response.grade,
      quantity: response.quantity,
      origin: response.origin,
      orderDate: new Date().toISOString(),
      status: "pending",
      deliveryTime: response.deliveryTime,
      contact: response.contact
    };

    setOrders(prev => [...prev, order]);
    
    toast({
      title: "Order Placed Successfully",
      description: `Order placed with ${response.merchantName} for ${response.price}`,
    });

    // Close the popup
    setShowAllResponses(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} className="mr-2" />
          Back to My Requirements
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Requirement Details</h1>
          <p className="text-muted-foreground">Requirement #{requirement.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Requirement Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{requirement.title}</CardTitle>
                  <p className="text-muted-foreground mt-1">Grade: {requirement.grade}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(requirement.status)}
                  <Badge className={getStatusColor(requirement.status)}>
                    {requirement.status.charAt(0).toUpperCase() + requirement.status.slice(1)}
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
                    <div className="font-medium">{requirement.quantity}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign size={16} className="text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Budget Range</div>
                    <div className="font-medium">{requirement.budgetRange}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin size={16} className="text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Preferred Origin</div>
                    <div className="font-medium">{requirement.preferredOrigin}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar size={16} className="text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Delivery Deadline</div>
                    <div className="font-medium">
                      {new Date(requirement.deliveryDeadline).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <div className="text-sm text-muted-foreground mb-1">Delivery Location</div>
                <div className="font-medium">{requirement.deliveryLocation}</div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">
                Looking for premium quality {requirement.grade} cashews from {requirement.preferredOrigin}. 
                Required quantity: {requirement.quantity}. Delivery to {requirement.deliveryLocation} by {new Date(requirement.deliveryDeadline).toLocaleDateString()}.
              </p>
            </CardContent>
          </Card>

          {/* Specifications */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Product Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Moisture:</span>
                  <div className="font-medium">{mockSpecifications.moisture}</div>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Broken:</span>
                  <div className="font-medium">{mockSpecifications.broken}</div>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Defects:</span>
                  <div className="font-medium">{mockSpecifications.defects}</div>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Min Shelf Life:</span>
                  <div className="font-medium">{mockSpecifications.minShelfLife}</div>
                </div>
                <div className="col-span-2">
                  <span className="text-sm text-muted-foreground">Packaging:</span>
                  <div className="font-medium">{mockSpecifications.packaging}</div>
                </div>
                <div className="col-span-2">
                  <span className="text-sm text-muted-foreground">Required Certifications:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {mockSpecifications.certifications.map((cert, index) => (
                      <Badge key={index} variant="secondary">{cert}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Responses */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <MessageSquare size={18} className="mr-2" />
                Recent Responses ({mockResponses.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockResponses.slice(0, 2).map((response) => (
                  <div key={response.id} className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                    <div>
                      <div className="font-medium">{response.merchantName}</div>
                      <div className="text-sm text-muted-foreground flex items-center">
                        <MapPin size={12} className="mr-1" />
                        {response.location}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-primary">{response.price}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(response.responseDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
                {mockResponses.length > 2 && (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setShowAllResponses(true)}
                  >
                    View All Responses ({mockResponses.length})
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Users size={18} className="mr-2" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Responses</span>
                <span className="font-medium">{requirement.responsesCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Created</span>
                <span className="font-medium">
                  {new Date(requirement.createdDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Last Modified</span>
                <span className="font-medium">
                  {new Date(requirement.lastModified).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Expires</span>
                <span className="font-medium">
                  {new Date(requirement.requirementExpiry).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {(requirement.status === "draft" || requirement.status === "active") && (
                <Button className="w-full">
                  <Edit size={16} className="mr-2" />
                  Edit Requirement
                </Button>
              )}
              {/* <Button variant="outline" className="w-full">
                <Eye size={16} className="mr-2" />
                View All Responses
              </Button>
              <Button variant="outline" className="w-full">
                <MessageSquare size={16} className="mr-2" />
                Promote Requirement
              </Button> */}
              <Button variant="outline" className="w-full">
                Download Summary
              </Button>
              {requirement.status === "draft" && (
                <Button variant="destructive" className="w-full">
                  Delete Draft
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* View All Responses Popup */}
      <Dialog open={showAllResponses} onOpenChange={setShowAllResponses}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <MessageSquare size={20} className="mr-2" />
              All Responses ({mockResponses.length})
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {mockResponses.map((response) => (
              <Card key={response.id} className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Merchant Info */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">{response.merchantName}</h3>
                      <Badge 
                        variant={response.status === "new" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {response.status}
                      </Badge>
                    </div>
                    <div className="flex items-center text-muted-foreground text-sm">
                      <MapPin size={14} className="mr-1" />
                      {response.location}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Origin: {response.origin}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Contact: {response.contact}
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Grade:</span>
                        <div className="font-medium">{response.grade}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Quantity:</span>
                        <div className="font-medium">{response.quantity}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Delivery:</span>
                        <div className="font-medium">{response.deliveryTime}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Response Date:</span>
                        <div className="font-medium">
                          {new Date(response.responseDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-sm">Certifications:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {response.certifications.map((cert, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Price and Actions */}
                  <div className="space-y-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{response.price}</div>
                      <div className="text-sm text-muted-foreground">per ton</div>
                    </div>
                    <div className="space-y-2">
                      <Button 
                        className="w-full"
                        onClick={() => handlePlaceOrder(response)}
                      >
                        Place Order
                      </Button>
                      <Button variant="outline" className="w-full">
                        <MessageSquare size={14} className="mr-2" />
                        Contact Merchant
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RequirementDetails;