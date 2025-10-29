import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Upload, X, CalendarIcon, ArrowLeft } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useProfile } from "@/hooks/useProfile";
import { useInventory } from "@/hooks/useInventory";
import { apiFetch } from "@/lib/api";

// Utility function to format number with commas
const formatNumber = (value: string): string => {
    if (!value) return '';
    // Remove all non-digit characters except decimal point
    const numStr = value.replace(/[^0-9.]/g, '');
    if (!numStr) return '';
    // Format with commas
    return parseFloat(numStr).toLocaleString('en-IN', {
        maximumFractionDigits: 2,
        useGrouping: true
    });
};

// Utility function to parse formatted number back to raw number string
const parseFormattedNumber = (formattedValue: string): string => {
    return formattedValue.replace(/[^0-9.]/g, '');
};
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
    const { products } = useInventory();

    // Check if we're in edit mode
    const editProductId = searchParams.get('edit');
    const isEditMode = !!editProductId;
    const editingProduct = isEditMode ? products.find(p => p.id === editProductId) : null;
    const [images, setImages] = useState<string[]>([]);
    const [imageFiles, setImageFiles] = useState<File[]>([]);

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

    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

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

    // Compute if all required fields are filled correctly to enable submit button
    const isFormComplete = useMemo(() => {
        const hasValue = (v?: string) => !!(v && v.toString().trim().length > 0);

        const availableQtyNum = parseFloat(formData.availableQty);
        const minOrderQtyNum = parseFloat(formData.minOrderQty);
        const priceNum = parseFloat(formData.price);

        const commonComplete =
            hasValue(formData.origin) &&
            hasValue(formData.location) &&
            hasValue(formData.description) &&
            !isNaN(availableQtyNum) && availableQtyNum > 0 &&
            !isNaN(minOrderQtyNum) && minOrderQtyNum > 0 &&
            minOrderQtyNum <= availableQtyNum &&
            !isNaN(priceNum) && priceNum > 0 &&
            !!expireDate;

        const kernelComplete = currentProductType !== 'Kernel' || hasValue(formData.grade);
        const rcnComplete = currentProductType !== 'RCN' || (
            hasValue(formData.yearOfCrop) && hasValue(formData.nutCount) && hasValue(formData.outTurn)
        );

        // Also ensure there are no validation errors present
        const noErrors = Object.keys(formErrors).length === 0;

        return commonComplete && kernelComplete && rcnComplete && noErrors;
    }, [formData, currentProductType, expireDate, formErrors]);

    useEffect(() => {

        if (profile?.productType && profile.productType !== "Both") {
            setCurrentProductType(profile.productType);
        } else {
            setCurrentProductType("RCN")
        }
    }, [profile?.productType]);

    // Update form data when editing product is found (from local inventory)
    useEffect(() => {
        if (isEditMode && editingProduct) {
            // Set product type
            if (editingProduct.type) {
                setCurrentProductType(editingProduct.type as ProductType);
            }

            // Set expiry date if available
            if (editingProduct.expireDate) {
                const expDate = new Date(editingProduct.expireDate);
                if (!isNaN(expDate.getTime())) {
                    setExpireDate(expDate);
                }
            }

            // Set images
            if (Array.isArray(editingProduct.images)) {
                setImages(editingProduct.images);
            }

            // Update form data
            setFormData(prev => ({
                ...prev,
                name: editingProduct.name || '',
                availableQty: String(editingProduct.availableQty || ''),
                minOrderQty: String(editingProduct.minOrderQty || ''),
                price: String(editingProduct.price || ''),
                unit: editingProduct.unit || 'kg',
                location: typeof editingProduct.location === 'string'
                    ? editingProduct.location
                    : (editingProduct.location as Location)?.address || '',
                origin: editingProduct.origin || '',
                description: editingProduct.description || '',
                allowBuyerOffers: Boolean(editingProduct.allowBuyerOffers),
                yearOfCrop: editingProduct.yearOfCrop || '',
                nutCount: editingProduct.nutCount || '',
                outTurn: editingProduct.outTurn || '',
                grade: editingProduct.grade || '',
                stockAvailable: String(editingProduct.stock || '')
            }));
        }
    }, [isEditMode, editingProduct]);

    // If editing via API-driven list, fetch selected stock by ID and prefill
    useEffect(() => {
        let isMounted = true;

        const fetchAndPrefill = async () => {
            if (!isEditMode || !editProductId) return;

            try {
                const resp: any = await apiFetch(`/api/stocks/get-stock/${editProductId}`, { method: 'GET' });
                if (!isMounted) return;

                console.log('API Response:', resp); // Debug log

                const stockData = resp?.data?.stock;
                if (!stockData) {
                    console.warn('No stock data found in response');
                    return;
                }

                const s = stockData;

                // Set product type if available
                const productType = (s.type || '').toString().toLowerCase() === 'rcn' ? 'RCN' : 'Kernel';
                setCurrentProductType(productType as ProductType);

                // Set expiry date if available
                if (s.expiredate) {
                    const expDate = new Date(s.expiredate);
                    if (!isNaN(expDate.getTime())) {
                        setExpireDate(expDate);
                    }
                }

                // Update form data with the stock data
                setFormData(prev => ({
                    ...prev,
                    name: s.productId || '', // Using productId as name if name is not available
                    availableQty: String(s.availableqty || ''),
                    minOrderQty: String(s.minimumqty || ''),
                    price: String(s.sellingprice || ''),
                    unit: 'kg', // Default unit as it's not in the response
                    location: s.location || '',
                    origin: s.origin || '',
                    description: s.description || '',
                    allowBuyerOffers: Boolean(s.negotiatePrice || false),
                    yearOfCrop: '', // Not in the response
                    nutCount: '', // Not in the response
                    outTurn: '', // Not in the response
                    grade: s.grade || '',
                    stockAvailable: String(s.availableqty || '')
                }));

                console.log('Form data updated with:', {
                    name: s.productId,
                    availableQty: s.availableqty,
                    minOrderQty: s.minimumqty,
                    price: s.sellingprice,
                    location: s.location,
                    origin: s.origin,
                    description: s.description,
                    allowBuyerOffers: s.negotiatePrice,
                    grade: s.grade
                });

            } catch (e) {
                console.warn('Failed to load stock for editing', e);
            }
        };

        fetchAndPrefill();

        return () => {
            isMounted = false;
        };
    }, [isEditMode, editProductId]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        const filesArr = Array.from(files);
        const newPreviews = filesArr.map(file => URL.createObjectURL(file));
        setImages(prev => [...prev, ...newPreviews]);
        setImageFiles(prev => [...prev, ...filesArr]);
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setImageFiles(prev => prev.filter((_, i) => i !== index));
    };

    const validateForm = () => {
        const errors: { [key: string]: string } = {};
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

            // Build base payload (JSON). If backend needs multipart, switch to FormData using imageFiles.
            const baseProductData = {
                grade: formData.grade,
                type: currentProductType,
                netCount: formData.nutCount || '',
                outTurn: formData.outTurn || '',
                yearOfCrop: formData.yearOfCrop || new Date().getFullYear().toString(),
                stock: parseFloat(formData.stockAvailable) || 0,
                price: parseFloat(formData.price) || 0,
                unit: formData.unit,
                location: formData.location,
                description: formData.description || '',
                images, // preview URLs; replace with uploaded URLs if backend returns them
                allowBuyerOffers: formData.allowBuyerOffers || false,
                expiredate: expireDate.toISOString().split('T')[0],
                status: 'active' as const,
                enquiries: 0,
                orders: 0,
                origin: formData.origin || '',
                negotiatePrice: formData.allowBuyerOffers || false,
                availableQty: parseFloat(formData.availableQty) || 0,
                minOrderQty: parseFloat(formData.minOrderQty) || 1,
            };

            const productData: any = {
                ...baseProductData,
                ...(currentProductType === 'RCN'
                    ? {
                        yearOfCrop: formData.yearOfCrop || new Date().getFullYear().toString(),
                        nutCount: formData.nutCount || '',
                        outTurn: formData.outTurn || '',
                        grade: undefined,
                    }
                    : {
                        grade: formData.grade || '',
                        yearOfCrop: undefined,
                        nutCount: undefined,
                        outTurn: undefined,
                    }),
            };

            if (isEditMode && editProductId) {
                // Map to backend-required keys for update
                const updateStockPayload = {
                    name: formData.name,
                    grade: formData.grade,
                    netcount: parseInt(formData.nutCount) || 0,
                    outturn: parseInt(formData.outTurn) || 0,
                    yearofcrop: parseInt(formData.yearOfCrop) || 0,
                    origin: formData.origin,
                    availableqty: parseFloat(formData.availableQty) || 0,
                    minimumqty: parseFloat(formData.minOrderQty) || 0,
                    sellingprice: parseFloat(formData.price) || 0,
                    location: formData.location,
                    description: formData.description,
                    expiredate: expireDate ? new Date(expireDate).toISOString() : null, // Format date properly
                    type: currentProductType,
                    negotiatePrice: formData.allowBuyerOffers,
                    status: 'active'
                };

                await apiFetch(`/api/stocks/update-stock/${editProductId}`, {
                    method: 'PUT',
                    body: JSON.stringify(updateStockPayload),
                });
            } else {
                // Map to backend-required keys to satisfy validation
                const createStockPayload = {
                    grade: currentProductType === 'Kernel' ? formData.grade : "",

                    // RCN-only fields mapped to backend names and types
                    netcount: currentProductType === 'RCN' ? parseInt(formData.nutCount || '0', 10) : 0,
                    outturn: currentProductType === 'RCN' ? parseInt(formData.outTurn || '0', 10) : 0,
                    yearofcrop: currentProductType === 'RCN' ? parseInt(formData.yearOfCrop || '0', 10) : 0,
                    origin: formData.origin || '',
                    availableqty: parseInt(formData.availableQty || '0', 10),
                    minimumqty: parseInt(formData.minOrderQty || '1', 10),
                    sellingprice: parseFloat(formData.price || '0'),
                    location: formData.location,
                    expiredate: new Date(expireDate).toISOString(), // RFC3339 string is OK for time.Time
                    description: formData.description || '',
                    negotiateprice: !!formData.allowBuyerOffers,
                    type: currentProductType,
                };

                await apiFetch(`/api/stocks/create-stock`, {
                    method: 'POST',
                    body: JSON.stringify(createStockPayload),
                });
            }

            toast({
                title: 'Stock',
                description: `Stock ${isEditMode ? 'updated' : 'added'} successfully!`,
            });

            // Notify other parts of the app (e.g., sidebar) to refresh stock counts
            window.dispatchEvent(new CustomEvent('stocks:changed'));
            navigate('/merchant/products');
        } catch (error: any) {
            console.error('Error saving product:', error);
            toast({
                title: 'Error',
                description: error?.message ?? 'Failed to save product. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
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
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => navigate('/merchant/products')}>
                    <ArrowLeft size={16} className="mr-2" />
                    Back to Products
                </Button>
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
                                    type="text"
                                    inputMode="decimal"
                                    value={formatNumber(formData.availableQty)}
                                    onChange={(e) => {
                                        const rawValue = parseFormattedNumber(e.target.value);
                                        // Only update if the value is a valid number or empty
                                        if (rawValue === '' || /^\d*\.?\d*$/.test(rawValue)) {
                                            setFormData(prev => {
                                                const newData = {
                                                    ...prev,
                                                    availableQty: rawValue,
                                                    minOrderQty: rawValue && parseFloat(prev.minOrderQty) > parseFloat(rawValue) ? rawValue : prev.minOrderQty
                                                };

                                                // Clear error if fixed
                                                if (formErrors.minOrderQty && parseFloat(prev.minOrderQty) <= parseFloat(rawValue)) {
                                                    setFormErrors(prevErrors => {
                                                        const newErrors = { ...prevErrors };
                                                        delete newErrors.minOrderQty;
                                                        return newErrors;
                                                    });
                                                }

                                                return newData;
                                            });
                                        }
                                    }}
                                    placeholder="e.g., 1,000"
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
                                    type="text"
                                    inputMode="decimal"
                                    value={formatNumber(formData.minOrderQty)}
                                    onChange={(e) => {
                                        const rawValue = parseFormattedNumber(e.target.value);
                                        // Only update if the value is a valid number or empty
                                        if (rawValue === '' || /^\d*\.?\d*$/.test(rawValue)) {
                                            const availableQty = parseFloat(formData.availableQty) || 0;
                                            const minOrderQty = parseFloat(rawValue) || 0;

                                            setFormData(prev => ({ ...prev, minOrderQty: rawValue }));

                                            // Validate in real-time
                                            if (minOrderQty > availableQty) {
                                                setFormErrors(prev => ({
                                                    ...prev,
                                                    minOrderQty: 'Cannot exceed available quantity'
                                                }));
                                            } else {
                                                setFormErrors(prev => {
                                                    const newErrors = { ...prev };
                                                    delete newErrors.minOrderQty;
                                                    return newErrors;
                                                });
                                            }
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
                                    type="text"
                                    inputMode="decimal"
                                    value={formatNumber(formData.price)}
                                    onChange={(e) => {
                                        const rawValue = parseFormattedNumber(e.target.value);
                                        // Only update if the value is a valid number or empty
                                        if (rawValue === '' || /^\d*\.?\d{0,2}$/.test(rawValue)) {
                                            setFormData({ ...formData, price: rawValue });
                                        }
                                    }}
                                    placeholder="e.g., 1,250.50"
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
                                <Label>Stock Available Until *</Label>
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
                                            {expireDate ? format(expireDate, "PPP") : <span>Pick a date</span>}
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
                                            classNames={{
                                                day_selected:
                                                    "bg-purple-600 text-white hover:bg-purple-600 hover:text-white focus:bg-purple-600 focus:text-white",
                                                day_today:
                                                    "bg-purple-100 text-purple-700",
                                                nav_button:
                                                    "h-7 w-7 bg-transparent p-0 text-purple-600 hover:text-purple-700 hover:bg-purple-50",
                                                caption_label:
                                                    "text-sm font-semibold text-purple-700",
                                            }}
                                            disabled={(date) => {
                                                const today = new Date();
                                                today.setHours(0, 0, 0, 0);
                                                return date < today;
                                            }}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Product Description *</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Describe your product, including specifications, quality, etc."
                                    rows={4}
                                    required
                                />
                            </div>
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
                                disabled={isSubmitting || !isFormComplete}
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