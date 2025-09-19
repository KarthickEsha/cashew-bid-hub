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
import { ProductType, Location } from "@/types/user";
import { toast } from "@/hooks/use-toast";

interface ProductFormData {
    name: string;
    availableQty: string;
    minOrderQty: string;
    price: string;
    unit: string;
    location: string;
    origin: string;
    description: string;
    allowBuyerOffers: boolean;
    stockAvailable: string;
    yearOfCrop: string;
    nutCount: string;
    outTurn: string;
    grade: string;
}

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
        if (profile?.dealingWith === 'Both') {
            return profile?.productType;
        }
        return profile?.productType || 'RCN';
    };

    const [currentProductType, setCurrentProductType] = useState<ProductType>(
        isEditMode && editingProduct ? editingProduct.type : getInitialProductType()
    );
    const [expireDate, setExpireDate] = useState<Date | undefined>(
        isEditMode && editingProduct ? new Date(editingProduct.expireDate) : undefined
    );
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

    const [formData, setFormData] = useState<ProductFormData>({
        name: isEditMode && editingProduct ? editingProduct.name : '',
        availableQty: isEditMode && editingProduct ? (editingProduct.availableQty || '').toString() : '',
        minOrderQty: isEditMode && editingProduct ? (editingProduct.minOrderQty || '').toString() : '',
        price: isEditMode && editingProduct ? editingProduct.price.toString() : '',
        unit: isEditMode && editingProduct ? editingProduct.unit : 'kg',
        location: (() => {
            if (!isEditMode || !editingProduct) return '';
            if (typeof editingProduct.location === 'string') {
                return editingProduct.location;
            }
            return (editingProduct.location as Location)?.address || '';
        })(),
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

    useEffect(() => {    
        if (profile?.productType && profile.productType !== "Both") {
            setCurrentProductType(profile.productType);
        }else{
            setCurrentProductType("RCN")
        }
    }, [profile?.productType]);

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
                location: typeof editingProduct.location === 'string' ? editingProduct.location :
                    (editingProduct.location as Location)?.address || '',
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

    const validateForm = () => {
        const errors: {[key: string]: string} = {};
        const availableQty = parseFloat(formData.availableQty);
        const minOrderQty = parseFloat(formData.minOrderQty);

        if (isNaN(availableQty) || availableQty <= 0) {
            errors.availableQty = 'Please enter a valid available quantity';
        }

        if (isNaN(minOrderQty) || minOrderQty <= 0) {
            errors.minOrderQty = 'Please enter a valid minimum order quantity';
        } else if (minOrderQty > availableQty) {
            errors.minOrderQty = 'Cannot exceed available quantity';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!expireDate) {
            toast({
                title: 'Error',
                description: 'Please select an expiry date',
                variant: 'destructive',
            });
            return;
        }

        if (!validateForm()) {
            return;
        }

        try {
            setIsSubmitting(true);

            // Base product data
            const baseProductData = {
                name: formData.name,
                type: currentProductType,
                stock: parseFloat(formData.stockAvailable) || 0,
                price: parseFloat(formData.price) || 0,
                unit: formData.unit,
                location: formData.location,
                description: formData.description || '',
                images,
                allowBuyerOffers: formData.allowBuyerOffers || false,
                expireDate: expireDate.toISOString().split('T')[0],
                status: 'active' as const,
                enquiries: 0,
                orders: 0,
                origin: formData.origin || '',
                availableQty: parseFloat(formData.availableQty) || 0,
                minOrderQty: parseFloat(formData.minOrderQty) || 1,
            };

            // Add type-specific fields
            const productData = {
                ...baseProductData,
                // Add RCN specific fields
                ...(currentProductType === 'RCN' && {
                    yearOfCrop: formData.yearOfCrop || new Date().getFullYear().toString(),
                    nutCount: formData.nutCount || '',
                    outTurn: formData.outTurn || '',
                    grade: undefined, // Ensure grade is not set for RCN
                }),
                // Add Kernel specific fields
                ...(currentProductType === 'Kernel' && {
                    grade: formData.grade || '',
                    yearOfCrop: undefined, // Ensure RCN fields are not set for Kernel
                    nutCount: undefined,
                    outTurn: undefined,
                }),
            };

            if (isEditMode && editingProduct) {
                updateProduct(editingProduct.id, productData);
            } else {
                // For new products, generate ID and createdAt
                const newProduct = {
                    ...productData,
                    id: Date.now().toString(),
                    createdAt: new Date().toISOString().split('T')[0],
                };
                addProduct(newProduct);
            }

            // Show success message
            // alert(`Product ${isEditMode ? 'updated' : 'added'} successfully!`);
            toast({
                title: 'Product',
                description: `Product ${isEditMode ? 'updated' : 'added'} successfully!`,
            });
            // Navigate to products list
            navigate('/merchant/products');

        } catch (error) {
            console.error('Error saving product:', error);
            alert('Failed to save product. Please try again.');
        }
    };

    const renderProductTypeSelector = () => {
        const productTypes = profile?.productType === 'Both'
            ? ['RCN', 'Kernel']
            : [profile?.productType || 'RCN'];

        return (
            <div className="flex justify-center items-center mb-6">
                <div className="flex w-64 bg-gray-100 rounded-full shadow-md border border-gray-200 overflow-hidden">
                    {productTypes.map((type) => (
                        <button
                            key={type}
                            type="button"
                            onClick={() => setCurrentProductType(type as ProductType)}
                            className={`flex-1 py-2 flex items-center justify-center gap-2 font-semibold transition-colors duration-300 ${currentProductType === type
                                    ? type === 'RCN'
                                        ? 'bg-amber-500 text-white'
                                        : 'bg-orange-500 text-white'
                                    : 'bg-transparent text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-5 h-5"
                                fill="currentColor"
                                viewBox={type === 'RCN' ? '0 0 512 512' : '0 0 24 24'}
                            >
                                {type === 'RCN' ? (
                                    <path d="M256 32c-97 0-176 79-176 176s79 176 176 176 176-79 176-176S353 32 256 32z" />
                                ) : (
                                    <path d="M12 2c-4 0-7 3-7 7 0 3 1.5 5.5 4 6.5V22h6v-6.5c2.5-1 4-3.5 4-6.5 0-4-3-7-7-7z" />
                                )}
                            </svg>
                            {type}
                        </button>
                    ))}
                </div>
            </div>
        );
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
                                    min="1"
                                    value={formData.availableQty}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setFormData(prev => {
                                            const newData = {
                                                ...prev, 
                                                availableQty: value,
                                                minOrderQty: value && parseFloat(prev.minOrderQty) > parseFloat(value) ? value : prev.minOrderQty
                                            };
                                            
                                            // Clear error if fixed
                                            if (formErrors.minOrderQty && parseFloat(prev.minOrderQty) <= parseFloat(value)) {
                                                setFormErrors(prevErrors => {
                                                    const newErrors = {...prevErrors};
                                                    delete newErrors.minOrderQty;
                                                    return newErrors;
                                                });
                                            }
                                            
                                            return newData;
                                        });
                                    }}
                                    placeholder="e.g., 400"
                                    required
                                    className={formErrors.availableQty ? 'border-destructive' : ''}
                                />
                                {formErrors.availableQty && (
                                    <p className="text-sm text-destructive">{formErrors.availableQty}</p>
                                )}
                            </div>

                            {/* Minimum Order Quantity */}
                            <div className="space-y-2">
                                <Label htmlFor="minOrderQty">Minimum Order Quantity (kg)*</Label>
                                <Input
                                    id="minOrderQty"
                                    type="number"
                                    min="1"
                                    value={formData.minOrderQty}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        const availableQty = parseFloat(formData.availableQty) || 0;
                                        const minOrderQty = parseFloat(value) || 0;
                                        
                                        setFormData(prev => ({...prev, minOrderQty: value}));
                                        
                                        // Validate in real-time
                                        if (minOrderQty > availableQty) {
                                            setFormErrors(prev => ({
                                                ...prev,
                                                minOrderQty: 'Cannot exceed available quantity'
                                            }));
                                        } else {
                                            setFormErrors(prev => {
                                                const newErrors = {...prev};
                                                delete newErrors.minOrderQty;
                                                return newErrors;
                                            });
                                        }
                                    }}
                                    placeholder="e.g., 50"
                                    required
                                    className={formErrors.minOrderQty ? 'border-destructive' : ''}
                                />
                                {formErrors.minOrderQty && (
                                    <p className="text-sm text-destructive">{formErrors.minOrderQty}</p>
                                )}
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


                            {/* <div className="space-y-2">
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
                            </div> */}


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
                                <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
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
                                            onSelect={(date) => {
                                                setExpireDate(date);
                                                setIsDatePickerOpen(false);
                                            }}
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
                            <Button
                                type="submit"
                                className="w-full md:w-48"  // makes Add button long
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg
                                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 
              5.373 0 12h4zm2 5.291A7.962 7.962 
              0 014 12H0c0 3.042 1.135 5.824 3 
              7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                        {isEditMode ? "Updating..." : "Adding..."}
                                    </>
                                ) : isEditMode ? "Update Product" : "Add Product"}
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                className="w-auto"  // keeps Cancel small
                                onClick={() => navigate("/merchant/products")}
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