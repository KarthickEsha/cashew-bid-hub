import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Upload, X, CalendarIcon } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useProfile } from "@/hooks/useProfile";
import { useInventory } from "@/hooks/useInventory";
import ProductTypeToggle from "@/components/ProductTypeToggle";
import { ProductType } from "@/types/user";

const MerchantAddProduct = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { profile } = useProfile();
  const { addProduct, products, updateProduct } = useInventory();

  // Check if we're in edit mode
  const editProductId = searchParams.get('edit');
  const isEditMode = !!editProductId;
  const editingProduct = isEditMode ? products.find(p => p.id === editProductId) : null;
  const [images, setImages] = useState<string[]>([]);

  // Determine initial product type based on profile
  const getInitialProductType = (): ProductType => {
    if (profile?.productType === 'Both') {
      return 'RCN';
    }
    return profile?.productType || 'RCN';
  };

  const [currentProductType, setCurrentProductType] = useState<ProductType>(
    isEditMode && editingProduct ? editingProduct.type : getInitialProductType()
  );
  const [expireDate, setExpireDate] = useState<Date | undefined>(
    isEditMode && editingProduct ? new Date(editingProduct.expireDate) : undefined
  );

  const [formData, setFormData] = useState({
    name: isEditMode && editingProduct ? editingProduct.name : '',
    availableQty: isEditMode && editingProduct ? (editingProduct.availableQty || '').toString() : '',
    minOrderQty: isEditMode && editingProduct ? (editingProduct.minOrderQty || '').toString() : '',
    price: isEditMode && editingProduct ? editingProduct.price.toString() : '',
    unit: isEditMode && editingProduct ? editingProduct.unit : 'kg',
    location: isEditMode && editingProduct ? editingProduct.location : '',
    origin: isEditMode && editingProduct ? editingProduct.origin || '' : '',
    description: isEditMode && editingProduct ? editingProduct.description || '' : '',
    allowBuyerOffers: isEditMode && editingProduct ? editingProduct.allowBuyerOffers || false : false,
    stockAvailable: isEditMode && editingProduct ? (editingProduct.stock || '').toString() : '',

    // RCN specific fields
    yearOfCrop: isEditMode && editingProduct ? editingProduct.yearOfCrop || '' : '',
    nutCount: isEditMode && editingProduct ? editingProduct.nutCount || '' : '',
    outTurn: isEditMode && editingProduct ? editingProduct.outTurn || '' : '',

    // Kernel specific fields
    grade: isEditMode && editingProduct ? editingProduct.grade || '' : '',
  });

  // Update form data when editing product is found
  useEffect(() => {
    if (isEditMode && editingProduct) {
      setCurrentProductType(editingProduct.type);
      setExpireDate(new Date(editingProduct.expireDate));
      setImages(editingProduct.images || []);
      setFormData({
        name: editingProduct.name,
        availableQty: (editingProduct.availableQty || '').toString(),
        minOrderQty: (editingProduct.minOrderQty || '').toString(),
        price: editingProduct.price.toString(),
        unit: editingProduct.unit,
        location: editingProduct.location,
        origin: editingProduct.origin || '',
        description: editingProduct.description || '',
        allowBuyerOffers: editingProduct.allowBuyerOffers || false,
        yearOfCrop: editingProduct.yearOfCrop || '',
        nutCount: editingProduct.nutCount || '',
        outTurn: editingProduct.outTurn || '',
        grade: editingProduct.grade || '',
        stockAvailable: (editingProduct.stock || '').toString(),
      });
    }
  }, [isEditMode, editingProduct]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map(file => URL.createObjectURL(file));
      setImages(prev => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!expireDate) {
      alert('Please select an expire date');
      return;
    }

    const productData: any = {
      name: formData.name,
      type: currentProductType,
      origin: formData.origin,
      availableQty: parseInt(formData.availableQty),
      minOrderQty: parseInt(formData.minOrderQty),
      price: parseFloat(formData.price),
      unit: formData.unit,
      location: formData.location,
      description: formData.description,
      allowBuyerOffers: formData.allowBuyerOffers,
      images,
      expireDate: format(expireDate, 'yyyy-MM-dd'),
      status: 'active' as const,
      enquiries: 0,
      orders: 0,
    };

    if (currentProductType === 'RCN') {
      Object.assign(productData, {
        yearOfCrop: formData.yearOfCrop,
        nutCount: formData.nutCount,
        outTurn: formData.outTurn,
      });
    } else {
      Object.assign(productData, {
        grade: formData.grade,
      });
    }

    if (isEditMode && editProductId) {
      updateProduct(editProductId, productData);
    } else {
      addProduct(productData);
    }
    navigate('/merchant/products');
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">
          {isEditMode ? 'Edit Stock' : 'Add New Stocks'}
        </h1>
        <p className="text-muted-foreground mt-2">
          {isEditMode
            ? `Update your ${currentProductType === 'RCN' ? 'Raw Cashew Nut' : 'Kernel'} product information`
            : `List a new ${currentProductType === 'RCN' ? 'Raw Cashew Nut' : 'Kernel'} product for sale`
          }
        </p>
      </div>

      {/* Product Type Toggle */}
      <ProductTypeToggle
        currentType={currentProductType}
        onTypeChange={setCurrentProductType}
      />

      <Card>
        <CardHeader>
          <CardTitle>{isEditMode ? 'Edit Product Details' : 'Product Details'}</CardTitle>
          <CardDescription>
            {isEditMode
              ? 'Update the information for your product'
              : 'Fill in the information for your new product'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {currentProductType === 'Kernel' ? (
                <div className="space-y-2">
                  <Label htmlFor="grade">Product / Grade *</Label>
                  <Select value={formData.grade} onValueChange={(value) => setFormData({ ...formData, grade: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="W180">W180</SelectItem>
                      <SelectItem value="W240">W240</SelectItem>
                      <SelectItem value="W320">W320</SelectItem>
                      <SelectItem value="W450">W450</SelectItem>
                      <SelectItem value="W500">W500</SelectItem>
                      <SelectItem value="Broken BB">Broken BB</SelectItem>
                      <SelectItem value="Broken LP">Broken LP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="yearOfCrop">Year of Crop *</Label>
                    <Select value={formData.yearOfCrop} onValueChange={(value) => setFormData({ ...formData, yearOfCrop: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2024">2024</SelectItem>
                        <SelectItem value="2023">2023</SelectItem>
                        <SelectItem value="2022">2022</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nutCount">Nut Count *</Label>
                    <Input
                      id="nutCount"
                      value={formData.nutCount}
                      onChange={(e) => setFormData({ ...formData, nutCount: e.target.value })}
                      placeholder="e.g., 200-220 per kg"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="outTurn">Out Turn *</Label>
                    <Input
                      id="outTurn"
                      value={formData.outTurn}
                      onChange={(e) => setFormData({ ...formData, outTurn: e.target.value })}
                      placeholder="e.g., 22-24%"
                      required
                    />
                  </div>
                </>
              )}

              {/* Replaced Stock with Origin */}
              <div className="space-y-2">
                <Label htmlFor="origin">Origin *</Label>
                <Select value={formData.origin} onValueChange={(value) => setFormData({ ...formData, origin: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select origin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="India">India</SelectItem>
                    <SelectItem value="Vietnam">Vietnam</SelectItem>
                    <SelectItem value="Nigeria">Nigeria</SelectItem>
                    <SelectItem value="Ivory Coast">Ivory Coast</SelectItem>
                    <SelectItem value="Ghana">Ghana</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* NEW FIELD: Available Quantity */}
              <div className="space-y-2">
                <Label htmlFor="availableQty">Available Quantity (kg)*</Label>
                <Input
                  id="availableQty"
                  type="number"
                  value={formData.availableQty}
                  onChange={(e) => setFormData({ ...formData, availableQty: e.target.value })}
                  placeholder="e.g., 400"
                  required
                />
              </div>

              {/* NEW FIELD: Minimum Order Quantity */}
              <div className="space-y-2">
                <Label htmlFor="minOrderQty">Minimum Order Quantity (kg)*</Label>
                <Input
                  id="minOrderQty"
                  type="number"
                  value={formData.minOrderQty}
                  onChange={(e) => setFormData({ ...formData, minOrderQty: e.target.value })}
                  placeholder="e.g., 50"
                  required
                />
              </div>

              {/* <div className="space-y-2">
                <Label htmlFor="unit">Unit *</Label>
                <Select value={formData.unit} onValueChange={(value) => setFormData({ ...formData, unit: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">Kilograms (kg)</SelectItem>
                    <SelectItem value="tons">Tons</SelectItem>
                    <SelectItem value="gms">Grams (gms)</SelectItem>
                  </SelectContent>
                </Select>
              </div> */}

              <div className="space-y-2">
                <Label htmlFor="price">Expected Selling Price (₹) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="e.g., 8.50"
                  required
                />
              </div>

              <div className="flex items-center space-x-2 mt-6">
                <Checkbox
                  id="allowBuyerOffers"
                  checked={formData.allowBuyerOffers}
                  onCheckedChange={(checked) => setFormData({ ...formData, allowBuyerOffers: !!checked })}
                />
                <Label htmlFor="allowBuyerOffers" className="text-sm">
                  Allow buyers to negotiate price
                </Label>
              </div>


              <div className="space-y-2">
                <Label htmlFor="stockAvailable">Stock Available *</Label>
                <Input
                  id="stockAvailable"
                  type="number"
                  value={formData.stockAvailable}
                  onChange={(e) =>
                    setFormData({ ...formData, stockAvailable: e.target.value })
                  }
                  placeholder="e.g., 1000"
                  required
                />
              </div>


              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Kerala, India"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Expire Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !expireDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {expireDate ? format(expireDate, "PPP") : <span>Pick expire date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={expireDate}
                      onSelect={setExpireDate}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Product Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your product, including specifications, quality, etc."
                rows={4}
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-4">
              <Label>Product Images</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload images or drag and drop
                  </p>
                </label>
              </div>

              {/* Image Preview */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Product ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <Button type="submit" className="flex-1">
                {isEditMode ? 'Update Product' : 'Add Product'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate('/merchant/products')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default MerchantAddProduct;
