import { useState } from "react";
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
  FileText
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const PostRequirement = () => {
  const [formData, setFormData] = useState({
    title: "",
    grade: "",
    quantity: "",
    unit: "",
    preferredOrigin: "",
    minBudget: "",
    maxBudget: "",
    deliveryLocation: "",
    city: "",
    country: "",
    specifications: "",
    deliveryDeadline: undefined as Date | undefined,
    requirementExpiry: undefined as Date | undefined,
  });

  const handleSubmit = (isDraft = false) => {
    console.log("Requirement submitted:", { ...formData, isDraft });
    // Handle form submission logic here
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Post Requirement</h1>
        <p className="text-muted-foreground">
          Let merchants know what you're looking for and receive competitive offers
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
            
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Looking for Premium Grade Cashews"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="grade">Product / Grade *</Label>
                <Select value={formData.grade} onValueChange={(value) => setFormData({ ...formData, grade: value })}>
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
                <Label htmlFor="preferredOrigin">Origin *</Label>
                <Select value={formData.preferredOrigin} onValueChange={(value) => setFormData({ ...formData, preferredOrigin: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="e.g., Vietnam, India" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="india">India</SelectItem>
                    <SelectItem value="vietnam">Vietnam</SelectItem>
                    <SelectItem value="ghana">Ghana</SelectItem>
                    <SelectItem value="tanzania">Tanzania</SelectItem>
                    <SelectItem value="any">Any Origin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quantity">Required Quantity *</Label>
                <Input
                  id="quantity"
                  placeholder="e.g., 50"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="unit">Unit *</Label>
                <Select value={formData.unit} onValueChange={(value) => setFormData({ ...formData, unit: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tons">Tons</SelectItem>
                    <SelectItem value="kg">Kilograms</SelectItem>
                    <SelectItem value="grams">Grams</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Budget Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Budget Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minBudget">
                  Min Budget ($/
                  {formData.unit ? formData.unit.slice(0, -1) || 'unit' : 'unit'}) *
                </Label>
                <Input
                  id="minBudget"
                  placeholder="e.g., 8000"
                  value={formData.minBudget}
                  onChange={(e) => setFormData({ ...formData, minBudget: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="maxBudget">
                  Max Budget ($/
                  {formData.unit ? formData.unit.slice(0, -1) || 'unit' : 'unit'}) *
                </Label>
                <Input
                  id="maxBudget"
                  placeholder="e.g., 9500"
                  value={formData.maxBudget}
                  onChange={(e) => setFormData({ ...formData, maxBudget: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
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

            <div>
              <Label>Delivery Deadline *</Label>
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
                    {formData.deliveryDeadline ? format(formData.deliveryDeadline, "dd/MM/yyyy") : "Select delivery date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.deliveryDeadline}
                    onSelect={(date) => setFormData({ ...formData, deliveryDeadline: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
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

            <div>
              <Label>Requirement Expires On *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal mt-1",
                      !formData.requirementExpiry && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.requirementExpiry ? format(formData.requirementExpiry, "dd/MM/yyyy") : "Select expiry date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.requirementExpiry}
                    onSelect={(date) => setFormData({ ...formData, requirementExpiry: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-border">
            <Button variant="outline" onClick={() => handleSubmit(true)}>
              <Save size={16} className="mr-2" />
              Save as Draft
            </Button>
            <Button onClick={() => handleSubmit(false)} size="lg">
              <Send size={16} className="mr-2" />
              Post Requirement
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PostRequirement;