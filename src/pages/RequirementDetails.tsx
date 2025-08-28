import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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

  // Mock data - in real app this would come from API based on ID
  const requirement = {
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
    description: "Looking for premium quality W320 cashews for export to European markets. Need consistent supply with proper certifications and quality documentation.",
    specifications: {
      moisture: "Max 5%",
      broken: "Max 5%",
      defects: "Max 2%",
      packaging: "Vacuum packed in 25kg bags",
      certifications: ["ISO 22000", "HACCP", "Organic (preferred)"],
      minShelfLife: "12 months"
    },
    responses: [
      {
        id: 1,
        merchantName: "Golden Cashew Co.",
        location: "Mumbai, India",
        price: "$8,200/ton",
        responseDate: "2024-08-18",
        status: "new"
      },
      {
        id: 2,
        merchantName: "Premium Nuts Export",
        location: "Kerala, India",
        price: "$8,500/ton", 
        responseDate: "2024-08-19",
        status: "viewed"
      }
    ]
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
          {requirement.description && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{requirement.description}</p>
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
                  <span className="text-sm text-muted-foreground">Moisture:</span>
                  <div className="font-medium">{requirement.specifications.moisture}</div>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Broken:</span>
                  <div className="font-medium">{requirement.specifications.broken}</div>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Defects:</span>
                  <div className="font-medium">{requirement.specifications.defects}</div>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Min Shelf Life:</span>
                  <div className="font-medium">{requirement.specifications.minShelfLife}</div>
                </div>
                <div className="col-span-2">
                  <span className="text-sm text-muted-foreground">Packaging:</span>
                  <div className="font-medium">{requirement.specifications.packaging}</div>
                </div>
                <div className="col-span-2">
                  <span className="text-sm text-muted-foreground">Required Certifications:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {requirement.specifications.certifications.map((cert, index) => (
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
                Recent Responses ({requirement.responsesCount})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {requirement.responses.map((response) => (
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
                {requirement.responsesCount > 2 && (
                  <Button variant="outline" className="w-full">
                    View All Responses ({requirement.responsesCount})
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
    </div>
  );
};

export default RequirementDetails;