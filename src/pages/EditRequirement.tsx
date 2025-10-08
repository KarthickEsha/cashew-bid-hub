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
import { apiFetch } from "@/lib/api";
import { useProfile } from "@/hooks/useProfile";
import { useUser } from "@clerk/clerk-react";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

// Format number with commas (e.g., 1000 -> 1,000)
const formatNumber = (value: string): string => {
  // Remove all non-digit characters
  const num = value.replace(/\D/g, '');
  // Add commas as thousand separators
  return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// Parse formatted number back to number string (e.g., 1,000 -> 1000)
const parseFormattedNumber = (value: string): string => {
  return value.replace(/,/g, '');
};

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
  const { updateRequirement } = useRequirements();
  const { profile } = useProfile();
  const { user } = useUser();

  const [formData, setFormData] = useState({
    grade: "",
    quantity: "",
    origin: "",
    targetDate: undefined as Date | undefined,
    minimumqty: "",
    expectedPrice: "",
    deliveryLocation: "",
    city: "",
    country: "",
    description: "",
    deliveryDeadline: undefined as Date | undefined,
    requirementExpiry: undefined as Date | undefined,
    allowLowerBid: false
  });

  const [priceError, setPriceError] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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
  // Fetch requirement data from API by ID (do not use local storage)
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!id) return;
      setLoading(true);
      try {
        // Adjust path if your backend differs
        const data: any = await apiFetch(`/api/requirement/get-requirement/${id}`);

        // Normalize potential backend payload shapes
        const item = Array.isArray(data) ? data[0] : (data?.data ?? data);
        if (!item) throw new Error('Requirement not found');

        const grade = item.grade || item.productGrade || item.product?.grade || '';
        const quantity = String(item.requiredqty ?? item.qty ?? item.totalQuantity ?? item.quantity ?? '');
        const origin = (item.origin || item.preferredOrigin || item.source || '').toString().toLowerCase();
        const expectedPrice = String(item.expectedprice ?? item.price ?? item.expected_price ?? item.expectedPrice ?? '');
        const deliveryLocation = item.deliveryLocation || item.location || '';
        const city = item.city || '';
        const country = item.country || '';
        const description = item.description || item.specifications || item.specs || '';
        const allowLowerBid = Boolean(
          item.lowerbit ?? item.LowerBit ?? item.allowLowerBid ?? item.allow_lower_bid ?? false
        );
        const minimumqty = String(item.minimumqty ?? item.min_qty ?? '');
        const deliveryDeadline = item.deliveryDeadline || item.deliverydate || item.requirementExpiry || '';

        if (!mounted) return;
        setFormData({
          grade,
          quantity,
          origin,
          targetDate: undefined,
          minimumqty,
          expectedPrice,
          deliveryLocation,
          city,
          country,
          description,
          deliveryDeadline: deliveryDeadline ? new Date(deliveryDeadline) : undefined,
          requirementExpiry: deliveryDeadline ? new Date(deliveryDeadline) : undefined,
          allowLowerBid,
        });
      } catch (e) {
        console.error('Failed to load requirement:', e);
        navigate('/my-requirements');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [id, navigate]);

  const handleSubmit = async (isDraft = false) => {
    if (!id) return;

    // Parse formatted numbers back to raw numbers for submission
    const quantity = formData.quantity ? parseFormattedNumber(formData.quantity) : '';
    const minSupplyQuantity = formData.minimumqty ? parseFormattedNumber(formData.minimumqty) : '';
    const expectedPrice = formData.expectedPrice ? parseFormattedNumber(formData.expectedPrice) : '';

    // Validate required fields
    if (!isDraft) {
      if (!formData.grade || !quantity || !formData.origin ||
        !expectedPrice || !formData.deliveryLocation ||
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
      quantity: quantity,
      origin: formData.origin,
      expectedPrice: parseFloat(expectedPrice) || 0,
      minSupplyQuantity: minSupplyQuantity,
      deliveryLocation: formData.deliveryLocation,
      city: formData.city,
      country: formData.country,
      deliveryDeadline: formData.deliveryDeadline ? format(formData.deliveryDeadline, 'yyyy-MM-dd') : '',
      specifications: formData.description,
      allowLowerBid: formData.allowLowerBid,
      date: format(new Date(), 'yyyy-MM-dd'),
      status: 'active' as const,
      isDraft,
      customerName
    };

    try {
      // Call backend update API
      await apiFetch(`/api/requirement/update-requirement/${id}`, {
        method: 'PUT',
        body: JSON.stringify(requirementData),
      });

      // Optionally sync local store if needed elsewhere
      try {
        updateRequirement(id, requirementData as any);
      } catch (_) { /* ignore */ }

      // Show success message and redirect
      toast({
        title: isDraft ? "Draft Saved" : "Requirement Updated",
        description: isDraft
          ? "Your requirement has been saved as a draft."
          : "Your requirement has been updated successfully!",
      });

      setTimeout(() => {
        navigate('/my-requirements');
      }, 800);
    } catch (e) {
      console.error('Update failed:', e);
      toast({
        title: 'Update failed',
        description: 'Could not update the requirement. Please try again.',
        variant: 'destructive' as any,
      });
    }
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
    <>
      <Toaster />
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
                    value={formData.quantity ? formatNumber(formData.quantity) : ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      const unformattedValue = parseFormattedNumber(value);
                      setFormData({ ...formData, quantity: unformattedValue });
                    }}
                    className="mt-1"
                    inputMode="numeric"
                  />
                </div>
                <div>
                  <Label htmlFor="minSupplyQuantity">
                    Minimum Supply Quantity (kg) *
                  </Label>
                  <Input
                    id="minSupplyQuantity"
                    placeholder="e.g., 100"
                    value={formData.minimumqty ? formatNumber(formData.minimumqty) : ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      const unformattedValue = parseFormattedNumber(value);
                      setFormData({ ...formData, minimumqty: unformattedValue });
                    }}
                    className="mt-1"
                    inputMode="numeric"
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
                    value={formData.expectedPrice ? formatNumber(formData.expectedPrice) : ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      const unformattedValue = parseFormattedNumber(value);
                      setFormData({ ...formData, expectedPrice: unformattedValue });
                      validateExpectedPrice(unformattedValue);
                    }}
                    className={cn("mt-1", priceError && "border-red-500")}
                    inputMode="numeric"
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
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    placeholder="e.g., USA"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="mt-1"
                  />
                </div>

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
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                />
              </div>

            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-border">
              <Button variant="outline" onClick={handleBack}>
                Cancel
              </Button>
              <Button onClick={() => handleSubmit(false)} size="lg">
                <Send size={16} className="mr-2" />
                Update Requirement
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default EditRequirement;