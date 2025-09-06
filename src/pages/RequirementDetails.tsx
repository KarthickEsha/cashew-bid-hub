import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useRequirements } from '@/hooks/useRequirements';
import { useResponses } from '@/hooks/useResponses';
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
  const { getResponsesByRequirementId, updateResponseStatus } = useResponses();
  
  // State for managing responses popup
  const [showAllResponses, setShowAllResponses] = useState(false);
  const [showResponseDetail, setShowResponseDetail] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<any>(null);
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

  // Get dynamic responses from merchants
  const responses = getResponsesByRequirementId(id || '');

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

  // Handle response click to show detail popup
  const handleResponseClick = (response: any) => {
    setSelectedResponse(response);
    setShowResponseDetail(true);
  };

  // Handle status update for response
  const handleStatusUpdate = (responseId: string, status: string) => {
    updateResponseStatus(responseId, status as any);
    toast({
      title: "Status Updated",
      description: `Response status changed to ${status}`,
    });
    setShowResponseDetail(false);
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
        </div>

        {/* Sidebar - Responses */}
        <div className="space-y-6">
          {/* All Responses */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <MessageSquare size={18} className="mr-2" />
                All Responses ({responses.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {responses.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No responses yet. Merchants will see your requirement and can respond with their offers.
                  </div>
                 ) : (
                   responses.map((response) => (
                     <Card 
                       key={response.id} 
                       className="p-3 border cursor-pointer hover:bg-accent/50 transition-colors"
                       onClick={() => handleResponseClick(response)}
                     >
                       <div className="flex items-center justify-between">
                         <div>
                           <div className="font-medium">{response.merchantName}</div>
                           <div className="text-sm text-muted-foreground flex items-center">
                             <MapPin size={12} className="mr-1" />
                             {response.merchantLocation}
                           </div>
                           {response.price && (
                             <div className="text-sm text-primary font-medium">
                               Merchant Price: {response.price}
                             </div>
                           )}
                           {response.quantity && (
                             <div className="text-sm text-muted-foreground">
                               Available: {response.quantity}
                             </div>
                           )}
                           {response.message && (
                             <div className="text-sm text-muted-foreground mt-1">
                               Remarks: {response.message}
                             </div>
                           )}
                         </div>
                         <div className="text-right">
                           <Badge 
                             variant={response.status === "new" ? "default" : "secondary"}
                             className="text-xs"
                           >
                             {response.status}
                           </Badge>
                           <div className="text-xs text-muted-foreground mt-1">
                             {new Date(response.responseDate).toLocaleDateString()}
                           </div>
                         </div>
                       </div>
                     </Card>
                   ))
                 )}
              </div>
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
              All Responses ({responses.length})
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {responses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No responses yet. Merchants will see your requirement and can respond with their offers.
              </div>
            ) : (
              responses.map((response) => (
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
                        {response.merchantLocation}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Origin: {response.origin}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Contact: {response.contact}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Message: {response.message}
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

                    {/* Price & Actions */}
                    <div className="space-y-3">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{response.price}</div>
                        <div className="text-sm text-muted-foreground">per kg</div>
                      </div>
                      <div className="space-y-2">
                        <Button 
                          className="w-full"
                          onClick={() => {
                            updateResponseStatus(response.id, 'accepted');
                            toast({
                              title: "Order Placed",
                              description: `Order placed with ${response.merchantName}`,
                            });
                          }}
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
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Response Detail Modal */}
      <Dialog open={showResponseDetail} onOpenChange={setShowResponseDetail}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Response Details</DialogTitle>
          </DialogHeader>
          
          {selectedResponse && (
            <div className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground">Company Name</div>
                <div className="font-medium">{selectedResponse.merchantName}</div>
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground">Origin</div>
                <div className="font-medium">{selectedResponse.origin}</div>
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground">Merchant Price</div>
                <div className="font-medium text-primary">{selectedResponse.price}</div>
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground">Available Quantity</div>
                <div className="font-medium">{selectedResponse.quantity}</div>
              </div>
              
              <div>
                <Label htmlFor="status">Status</Label>
                <Select 
                  defaultValue={selectedResponse.status}
                  onValueChange={(value) => {
                    setSelectedResponse({...selectedResponse, status: value});
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Selected</SelectItem>
                    <SelectItem value="accepted">Confirmation</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowResponseDetail(false)}>
                  Cancel
                </Button>
                <Button onClick={() => handleStatusUpdate(selectedResponse.id, selectedResponse.status)}>
                  Submit
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Response Detail Modal Component
const ResponseDetailModal = ({ isOpen, onClose, response, onStatusUpdate }: {
  isOpen: boolean;
  onClose: () => void;
  response: any;
  onStatusUpdate: (responseId: string, status: string) => void;
}) => {
  const [selectedStatus, setSelectedStatus] = useState(response?.status || 'new');

  const handleSubmit = () => {
    onStatusUpdate(response.id, selectedStatus);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Response Details</DialogTitle>
        </DialogHeader>
        
        {response && (
          <div className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">Company Name</div>
              <div className="font-medium">{response.merchantName}</div>
            </div>
            
            <div>
              <div className="text-sm text-muted-foreground">Origin</div>
              <div className="font-medium">{response.origin}</div>
            </div>
            
            <div>
              <div className="text-sm text-muted-foreground">Merchant Price</div>
              <div className="font-medium text-primary">{response.price}</div>
            </div>
            
            <div>
              <div className="text-sm text-muted-foreground">Available Quantity</div>
              <div className="font-medium">{response.quantity}</div>
            </div>
            
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">Selected</SelectItem>
                  <SelectItem value="accepted">Confirmation</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                Submit
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RequirementDetails;