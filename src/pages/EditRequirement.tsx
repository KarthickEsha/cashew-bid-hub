import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  CalendarIcon,
  Save,
  Send,
  FileText,
  ArrowLeft
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useRequirements } from "@/hooks/useRequirements";
import { useProfile } from "@/hooks/useProfile";
import { useUser } from "@clerk/clerk-react";

// Origin countries
const origins = [
  { id: "india", name: "India" },
  { id: "vietnam", name: "Vietnam" },
  { id: "ghana", name: "Ghana" },
  { id: "tanzania", name: "Tanzania" },
  { id: "any", name: "Any Origin" }
];

// Product-based fixed prices by origin (₹ per kg)
const productPrices = {
  W180: {
    india: 8500,
    vietnam: 8200,
    ghana: 7800,
    tanzania: 7500
  },
  W240: {
    india: 8300,
    vietnam: 8000,
    ghana: 7600,
    tanzania: 7300
  },
  W320: {
    india: 8100,
    vietnam: 7800,
    ghana: 7400,
    tanzania: 7100
  },
  SW240: {
    india: 8200,
    vietnam: 7900,
    ghana: 7500,
    tanzania: 7200
  },
  SW320: {
    india: 8000,
    vietnam: 7700,
    ghana: 7300,
    tanzania: 7000
  },
  mixed: {
    india: 7800,
    vietnam: 7500,
    ghana: 7100,
    tanzania: 6800
  }
};

const EditRequirement = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getRequirementById, updateRequirement } = useRequirements();
  const { profile } = useProfile();
  const { user } = useUser();
  
  const [formData, setFormData] = useState({
    grade: "",
    quantity: "",
    origin: "",
    targetDate: undefined as Date | undefined,
    minSupplyQuantity: "",
    expectedPrice: "",
    deliveryLocation: "",
    city: "",
    country: "",
    specifications: "",
    deliveryDeadline: undefined as Date | undefined,
    requirementExpiry: undefined as Date | undefined,
    allowLowerBid: false
  });

  const [priceError, setPriceError] = useState("");
  const [loading, setLoading] = useState(true);

  // Get fixed price based on product and origin
  const getFixedPrice = () => {
    if (!formData.grade || !formData.origin || formData.origin === "any") {
      return 0;
    }
    return (
      productPrices[formData.grade as keyof typeof productPrices]?.[
      formData.origin as keyof typeof productPrices.W180
      ] || 0
    );
  };

  const fixedPrice = getFixedPrice();
  const selectedOrigin = origins.find((o) => o.id === formData.origin);

  // Validate expected price
  const validateExpectedPrice = (price: string) => {
    const numPrice = parseFloat(price);
    const currentFixedPrice = getFixedPrice();
    if (price && currentFixedPrice && numPrice > currentFixedPrice) {
      setPriceError(`Expected price cannot exceed fixed price of ₹${currentFixedPrice}`);
      return false;
    }
    setPriceError("");
    return true;
  };

  // Fetch requirement data
  useEffect(() => {
    if (id) {
      const requirement = getRequirementById(id);
      if (requirement) {
        setFormData({
          grade: requirement.grade,
          quantity: requirement.quantity,
          origin: requirement.origin,
          targetDate: undefined,
          minSupplyQuantity: requirement.minSupplyQuantity,
          expectedPrice: requirement.expectedPrice.toString(),
          deliveryLocation: requirement.deliveryLocation,
          city: requirement.city,
          country: requirement.country,
          specifications: requirement.specifications,
          deliveryDeadline: requirement.deliveryDeadline ? new Date(requirement.deliveryDeadline) : undefined,
          requirementExpiry: requirement.requirementExpiry ? new Date(requirement.requirementExpiry) : undefined,
          allowLowerBid: requirement.allowLowerBid
        });
      } else {
        // Requirement not found, redirect back
        navigate('/my-requirements');
      }
      setLoading(false);
    }
  }, [id, getRequirementById, navigate]);

  const handleSubmit = (isDraft = false) => {
    if (!id) return;

    // Validate required fields
    if (!isDraft) {
      if (!formData.grade || !formData.quantity || !formData.origin || 
          !formData.expectedPrice || !formData.deliveryLocation || 
          !formData.city || !formData.country || !formData.deliveryDeadline) {
        alert('Please fill in all required fields');
        return;
      }
    }

    // Get customer name from profile or user data
    const customerName = profile?.name || user?.fullName || 'Anonymous Buyer';

    // Prepare requirement data
    const requirementData = {
      grade: formData.grade,
      quantity: formData.quantity,
      origin: formData.origin,
      expectedPrice: parseFloat(formData.expectedPrice) || 0,
      minSupplyQuantity: formData.minSupplyQuantity,
      deliveryLocation: formData.deliveryLocation,
      city: formData.city,
      country: formData.country,
      deliveryDeadline: formData.deliveryDeadline ? format(formData.deliveryDeadline, 'yyyy-MM-dd') : '',
      specifications: formData.specifications,
      allowLowerBid: formData.allowLowerBid,
      date: format(new Date(), 'yyyy-MM-dd'),
      status: 'pending' as const,
      isDraft,
      customerName
    };

    // Update requirement
    updateRequirement(id, requirementData);

    // Show success message and redirect
    if (isDraft) {
      alert('Requirement saved as draft successfully!');
    } else {
      alert('Requirement updated successfully!');
    }
    navigate('/my-requirements');
  };

  const handleBack = () => {
    navigate("/my-requirements");
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center py-10">
          <p>Loading requirement data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={handleBack} className="mb-4">
          <ArrowLeft size={16} className="mr-2" />
          Back to My Requirements
        </Button>
        <h1 className="text-3xl font-bold text-foreground mb-2">Edit Requirement</h1>
        <p className="text-muted-foreground">
          Update your requirement details
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText size={20} className="mr-2" />
            Requirement Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="grade">Product / Grade *</Label>
                <Select
                  value={formData.grade}
                  onValueChange={(value) =>
                    setFormData({ ...formData, grade: value })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="W180">W180</SelectItem>
                    <SelectItem value="W240">W240</SelectItem>
                    <SelectItem value="W320">W320</SelectItem>
                    <SelectItem value="SW240">SW240</SelectItem>
                    <SelectItem value="SW320">SW320</SelectItem>
                    <SelectItem value="mixed">Mixed Grades</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="origin">Origin *</Label>
                <Select
                  value={formData.origin}
                  onValueChange={(value) => {
                    setFormData({ ...formData, origin: value, expectedPrice: "" });
                    setPriceError("");
                  }}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select origin" />
                  </SelectTrigger>
                  <SelectContent>
                    {origins.map((origin) => (
                      <SelectItem key={origin.id} value={origin.id}>
                        {origin.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quantity">Required Quantity (kg) *</Label>
                <Input
                  id="quantity"
                  placeholder="e.g., 500"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="minSupplyQuantity">
                  Minimum Supply Quantity (kg) *
                </Label>
                <Input
                  id="minSupplyQuantity"
                  placeholder="e.g., 100"
                  value={formData.minSupplyQuantity}
                  onChange={(e) =>
                    setFormData({ ...formData, minSupplyQuantity: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Budget Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Expected Price Field */}
              <div>
                <Label htmlFor="expectedPrice">Expected Price (₹/kg) *</Label>
                <Input
                  id="expectedPrice"
                  placeholder="Enter expected price"
                  value={formData.expectedPrice}
                  onChange={(e) => {
                    setFormData({ ...formData, expectedPrice: e.target.value });
                    validateExpectedPrice(e.target.value);
                  }}
                  className={cn("mt-1", priceError && "border-red-500")}
                />
                {priceError && (
                  <p className="text-sm text-red-500 mt-1">{priceError}</p>
                )}
              </div>

              {/* Checkbox Field */}
              <div className="flex items-center space-x-2 mt-6">
                <input
                  id="allowLowerBid"
                  type="checkbox"
                  checked={formData.allowLowerBid}
                  onChange={(e) =>
                    setFormData({ ...formData, allowLowerBid: e.target.checked })
                  }
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <Label htmlFor="allowLowerBid">Seller can bid lower price?</Label>
              </div>
            </div>
          </div>

          <div>
            <Label>Expected Delivery Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal mt-1",
                    !formData.deliveryDeadline && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.deliveryDeadline
                    ? format(formData.deliveryDeadline, "dd/MM/yyyy")
                    : "Select delivery date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.deliveryDeadline}
                  onSelect={(date) =>
                    setFormData({ ...formData, deliveryDeadline: date })
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Delivery Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Delivery Information</h3>
            
            <div>
              <Label htmlFor="deliveryLocation">Delivery Location *</Label>
              <Input
                id="deliveryLocation"
                placeholder="e.g., Port of Los Angeles"
                value={formData.deliveryLocation}
                onChange={(e) => setFormData({ ...formData, deliveryLocation: e.target.value })}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  placeholder="e.g., Los Angeles"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  placeholder="e.g., USA"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>

          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Additional Information</h3>
            
            <div>
              <Label htmlFor="specifications">Specifications</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Include details like moisture content, kernel size, etc.
              </p>
              <Textarea
                id="specifications"
                placeholder="e.g., Moisture content: 5% max, Kernel size: 320 pieces/kg, No broken kernels"
                value={formData.specifications}
                onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
                rows={4}
              />
            </div>

          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-border">
            <Button variant="outline" onClick={handleBack}>
              Cancel
            </Button>
            <Button variant="outline" onClick={() => handleSubmit(true)}>
              <Save size={16} className="mr-2" />
              Save as Draft
            </Button>
            <Button onClick={() => handleSubmit(false)} size="lg">
              <Send size={16} className="mr-2" />
              Update Requirement
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditRequirement;