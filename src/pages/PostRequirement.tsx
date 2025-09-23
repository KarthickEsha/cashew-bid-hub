import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Save, Send, FileText } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useRequirements } from "@/hooks/useRequirements";
import { useNavigate } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { useUser } from "@clerk/clerk-react";
import { toast } from "@/hooks/use-toast";

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

const PostRequirement = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addRequirement } = useRequirements();
  const { profile } = useProfile();
  const { user } = useUser();
  const [formData, setFormData] = useState({
    title: "",
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
  const [quantityError, setQuantityError] = useState("");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [numberError, setNumberError] = useState("");

  // Format number with commas
  const formatNumberWithCommas = (value: string) => {
    // Remove all non-digit characters
    const numbers = value.replace(/\D/g, '');
    // Add commas as thousands separators
    return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Validate if input contains only numbers and commas
  const isValidNumberInput = (value: string) => {
    return /^\d{1,3}(,\d{3})*$/.test(value) || value === '';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // Handle numeric fields (quantity, minSupplyQuantity, expectedPrice)
    if (['quantity', 'minSupplyQuantity', 'expectedPrice'].includes(name)) {
      // Allow only numbers and backspace
      if (value !== '' && !/^\d*$/.test(value.replace(/,/g, ''))) {
        setNumberError('Please enter numbers only');
        return;
      }

      // Format the number with commas
      const formattedValue = formatNumberWithCommas(value);

      // Update the form data with the formatted value
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }));

      // Clear any previous number error
      setNumberError('');

      // For quantity fields, validate the relationship between min and max
      if ((name === 'quantity' || name === 'minSupplyQuantity') && formData.quantity && formData.minSupplyQuantity) {
        validateQuantity(
          name === 'minSupplyQuantity' ? formattedValue : formData.minSupplyQuantity,
          name === 'quantity' ? formattedValue : formData.quantity
        );
      }

      return;
    }

    // For non-numeric fields, update normally
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Get fixed price based on product and origin
  const getFixedPrice = (): number => {
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
    // Remove commas for validation
    const cleanPrice = price.replace(/,/g, '');
    const numPrice = parseFloat(cleanPrice);
    const currentFixedPrice = getFixedPrice();

    if (isNaN(numPrice)) {
      setPriceError('Please enter a valid number');
      return false;
    }

    if (price && currentFixedPrice && numPrice > currentFixedPrice) {
      setPriceError(`Expected price cannot exceed fixed price of ₹${currentFixedPrice.toLocaleString()}`);
      return false;
    }

    setPriceError("");
    return true;
  };

  // Validate minimum quantity against required quantity
  const validateQuantity = (minQty: string, reqQty: string) => {
    // Remove commas for comparison
    const cleanMinQty = minQty.replace(/,/g, '');
    const cleanReqQty = reqQty.replace(/,/g, '');

    if (cleanMinQty && cleanReqQty && parseFloat(cleanMinQty) > parseFloat(cleanReqQty)) {
      setQuantityError('Minimum quantity cannot be greater than required quantity');
      return false;
    }
    setQuantityError('');
    return true;
  };

  const handleSubmit = (isDraft = false) => {
    // Reset errors
    setQuantityError('');
    setNumberError('');

    // Validate quantities
    if (formData.minSupplyQuantity && formData.quantity) {
      if (!validateQuantity(formData.minSupplyQuantity, formData.quantity)) {
        return;
      }
    }

    // Validate required fields
    if (!isDraft) {
      if (!formData.grade || !formData.quantity || !formData.origin ||
        !formData.expectedPrice || !formData.deliveryLocation ||
        !formData.city || !formData.country || !formData.deliveryDeadline) {
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
      expectedPrice: formData.expectedPrice,
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

    // Save to local storage
    addRequirement(requirementData);

    // Show success message and redirect
    if (isDraft) {
      toast({
        title: t('postRequirement.title'),
        description: t('postRequirement.successDraft'),
      });
    } else {
      toast({
        title: t('postRequirement.title'),
        description: t('postRequirement.successPosted'),
      });
      navigate('/my-requirements'); // Redirect to dashboard after successful submission
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">{t('postRequirement.title')}</h1>
        <p className="text-muted-foreground">
          {t('postRequirement.subtitle')}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText size={20} className="mr-2" />
            {t('postRequirement.requirementDetails')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('postRequirement.basicInfo')}</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="grade">{t('postRequirement.productGrade')} *</Label>
                <Select
                  value={formData.grade}
                  onValueChange={(value) =>
                    setFormData({ ...formData, grade: value })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder={t('postRequirement.selectGrade')} />
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
                <Label htmlFor="origin">{t('postRequirement.origin')} *</Label>
                <Select
                  value={formData.origin}
                  onValueChange={(value) => {
                    setFormData({ ...formData, origin: value, expectedPrice: "" });
                    setPriceError("");
                  }}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder={t('postRequirement.selectOrigin')} />
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
                <Label htmlFor="quantity">{t('postRequirement.requiredQuantity')} *</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="text"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  placeholder="e.g. 1,000"
                  required
                  inputMode="numeric"
                />
                {quantityError && <p className="text-sm text-red-500">{quantityError}</p>}
                {numberError && formData.quantity && !isValidNumberInput(formData.quantity) && (
                  <p className="text-sm text-red-500">{numberError}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="minSupplyQuantity">{t('postRequirement.minSupplyQuantity')} *</Label>
                <Input
                  id="minSupplyQuantity"
                  name="minSupplyQuantity"
                  type="text"
                  value={formData.minSupplyQuantity}
                  onChange={handleInputChange}
                  placeholder="e.g. 500"
                  inputMode="numeric"
                />
                {quantityError && <p className="text-sm text-red-500">{quantityError}</p>}
                {numberError && formData.minSupplyQuantity && !isValidNumberInput(formData.minSupplyQuantity) && (
                  <p className="text-sm text-red-500">{numberError}</p>
                )}
              </div>
            </div>

            {/* ... */}
          </div>

          {/* Budget Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* First Expected Price Field */}
              <div className="grid gap-2">
                <Label htmlFor="expectedPrice">{t('postRequirement.expectedPrice')} *</Label>
                <Input
                  id="expectedPrice"
                  name="expectedPrice"
                  type="text"
                  value={formData.expectedPrice}
                  onChange={handleInputChange}
                  onBlur={(e) => {
                    const isValid = validateExpectedPrice(e.target.value.replace(/,/g, ''));
                    if (!isValid) {
                      // The error will be shown by the priceError state
                      return;
                    }
                  }}
                  placeholder="e.g. 75,000"
                  required
                  inputMode="numeric"
                />
                {priceError && <p className="text-sm text-red-500">{priceError}</p>}
                {numberError && formData.expectedPrice && !isValidNumberInput(formData.expectedPrice) && (
                  <p className="text-sm text-red-500">{numberError}</p>
                )}
              </div>
              {/* ... */}
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
                <Label htmlFor="allowLowerBid">{t('postRequirement.allowLowerBid')}</Label>
              </div>
            </div>
          </div>

          <div>
            <Label>{t('postRequirement.expectedDeliveryDate')} *</Label>
            <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.deliveryDeadline && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.deliveryDeadline ? (
                    format(formData.deliveryDeadline, "PPP")
                  ) : (
                    <span>{t('postRequirement.pickDate')}</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.deliveryDeadline}
                  onSelect={(date) => {
                    setFormData({ ...formData, deliveryDeadline: date });
                    setIsDatePickerOpen(false);
                  }}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  defaultMonth={new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Mode of Pricing */}
          {/* {formData.origin && formData.grade && formData.origin !== "any" && fixedPrice > 0 && (
 <div className="space-y-4">
 <h3 className="text-lg font-semibold">Mode of Pricing</h3>

 <div className="bg-muted/50 p-4 rounded-lg">
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <div>
 <Label className="text-sm font-medium">Product Grade</Label>
 <p className="text-sm text-muted-foreground mt-1">
 {formData.grade}
 </p>
 </div>

 <div>
 <Label className="text-sm font-medium">Origin</Label>
 <p className="text-sm text-muted-foreground mt-1">
 {selectedOrigin?.name}
 </p>
 </div>

 <div>
 <Label className="text-sm font-medium">Fixed Price</Label>
 <p className="text-lg font-semibold text-primary mt-1">
 ₹{fixedPrice.toLocaleString()}/kg
 </p>
 </div>
 </div>

 <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200 dark:border-blue-800">
 <p className="text-sm text-blue-700 dark:text-blue-300">
 <strong>Note:</strong> Your expected price must not exceed the fixed
 price of ₹{fixedPrice.toLocaleString()} per kg.
 </p>
 </div>
 </div>
 </div>
 )} */}

          {/* Delivery Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('postRequirement.deliveryInfo')}</h3>

            <div>
              <Label htmlFor="deliveryLocation">{t('postRequirement.deliveryLocation')} *</Label>
              <Input
                id="deliveryLocation"
                placeholder={t('postRequirement.enterDeliveryLocation')}
                value={formData.deliveryLocation}
                onChange={(e) =>
                  setFormData({ ...formData, deliveryLocation: e.target.value })
                }
                className="mt-1"
              />
            </div>




            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>
                <Label>{t('postRequirement.country')} *</Label>
                <Select
                  value={formData.country}
                  onValueChange={(value) =>
                    setFormData({ ...formData, country: value })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder={t('postRequirement.selectCountry')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="India">India</SelectItem>
                    <SelectItem value="United States">United States</SelectItem>
                    <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                    <SelectItem value="Canada">Canada</SelectItem>
                    <SelectItem value="Australia">Australia</SelectItem>
                    <SelectItem value="Germany">Germany</SelectItem>
                    <SelectItem value="France">France</SelectItem>
                    <SelectItem value="Japan">Japan</SelectItem>
                    <SelectItem value="China">China</SelectItem>
                    <SelectItem value="Brazil">Brazil</SelectItem>
                    <SelectItem value="Vietnam">Vietnam</SelectItem>
                    <SelectItem value="Ghana">Ghana</SelectItem>
                    <SelectItem value="Tanzania">Tanzania</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="city">{t('postRequirement.city')} *</Label>
                <Input
                  id="city"
                  placeholder={t('postRequirement.enterCity')}
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('postRequirement.additionalInfo')}</h3>

            <div>
              <Label htmlFor="specifications">{t('postRequirement.specifications')}</Label>
              <p className="text-sm text-muted-foreground mb-2">
                {t('postRequirement.specificationsHint')}
              </p>
              <Textarea
                id="specifications"
                placeholder={t('postRequirement.specificationsPlaceholder')}
                value={formData.specifications}
                onChange={(e) =>
                  setFormData({ ...formData, specifications: e.target.value })
                }
                rows={4}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-border">
            <Button variant="outline" onClick={() => handleSubmit(true)}>
              <Save size={16} className="mr-2" />
              {t('postRequirement.saveDraft')}
            </Button>
            <Button onClick={() => handleSubmit(false)} size="lg">
              <Send size={16} className="mr-2" />
              {t('postRequirement.postRequirementBtn')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PostRequirement;