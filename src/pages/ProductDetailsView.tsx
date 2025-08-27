import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import ProductListTable from '@/components/ProductListTable';
import {
  ArrowLeft,
  Building,
  MapPin,
  Star,
  Phone,
  Mail,
  Globe,
  Package,
  DollarSign,
  Calendar
} from 'lucide-react';
import { Product } from '@/types/user';

const ProductDetailsView = () => {
  const { merchantName } = useParams();
  const navigate = useNavigate();

  // Mock merchant data
  const merchant = {
    name: merchantName || "Golden Cashew Co.",
    location: "Mumbai, India",
    rating: 4.8,
    totalProducts: 15,
    establishedYear: 2010,
    phone: "+91 9876543210",
    email: "info@goldencashew.com",
    website: "www.goldencashew.com",
    description: "Leading exporter of premium quality cashews with over 14 years of experience in the industry. We specialize in W320, W240, and SW240 grades with international certifications.",
    certifications: ["ISO 22000", "HACCP", "FSSAI", "USDA Organic"],
    logo: "/api/placeholder/80/80"
  };

  // Mock products data for this merchant
  const products: Product[] = [
    {
      id: '1',
      name: 'Premium W320 Cashews',
      type: 'RCN',
      grade: 'W320',
      yearOfCrop: '2024',
      nutCount: '320/lb',
      outTurn: '48-50 lbs',
      stock: 150,
      price: 8200,
      unit: 'ton',
      location: 'Mumbai, India',
      expireDate: '2024-12-15',
      status: 'active',
      enquiries: 12,
      orders: 8
    },
    {
      id: '2',
      name: 'Export Quality W240',
      type: 'RCN',
      grade: 'W240',
      yearOfCrop: '2024',
      nutCount: '240/lb',
      outTurn: '50-52 lbs',
      stock: 200,
      price: 8500,
      unit: 'ton',
      location: 'Mumbai, India',
      expireDate: '2024-11-30',
      status: 'active',
      enquiries: 18,
      orders: 15
    },
    {
      id: '3',
      name: 'Premium Cashew Kernels',
      type: 'Kernel',
      grade: 'W320',
      stock: 85,
      price: 12500,
      unit: 'ton',
      location: 'Mumbai, India',
      expireDate: '2024-10-20',
      status: 'active',
      enquiries: 25,
      orders: 12
    }
  ];

  const handleEnquiryClick = (product: Product) => {
    console.log('Enquiry clicked for:', product.name);
  };

  const handleOrderClick = (product: Product) => {
    console.log('Order clicked for:', product.name);
  };

  const handleViewClick = (product: Product) => {
    console.log('View clicked for:', product.name);
  };

  const handleEditClick = (product: Product) => {
    console.log('Edit clicked for:', product.name);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} className="mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Merchant Products</h1>
          <p className="text-muted-foreground">{merchant.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        {/* Merchant Info - Takes 1 column */}
        <div className="lg:col-span-1">
          <Card className="h-fit">
            <CardHeader className="text-center">
              <div className="flex flex-col items-center space-y-4">
                <img 
                  src={merchant.logo} 
                  alt={merchant.name}
                  className="w-20 h-20 rounded-full bg-gray-200"
                />
                <div>
                  <CardTitle className="text-lg">{merchant.name}</CardTitle>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <MapPin size={14} className="text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{merchant.location}</span>
                  </div>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <Star size={14} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-medium">{merchant.rating}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">About</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {merchant.description}
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Package size={14} className="text-muted-foreground" />
                  <span>{merchant.totalProducts} Products</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar size={14} className="text-muted-foreground" />
                  <span>Est. {merchant.establishedYear}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone size={14} className="text-muted-foreground" />
                  <span>{merchant.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail size={14} className="text-muted-foreground" />
                  <span>{merchant.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Globe size={14} className="text-muted-foreground" />
                  <span>{merchant.website}</span>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-2">Certifications</h4>
                <div className="flex flex-wrap gap-1">
                  {merchant.certifications.map((cert, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {cert}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <Button className="w-full mb-2">
                  Contact Merchant
                </Button>
                <Button variant="outline" className="w-full">
                  Visit Website
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Products Table - Takes 3 columns */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Package size={18} />
                  Products ({products.length})
                </CardTitle>
                <Badge variant="secondary">
                  All Product Types
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ProductListTable
                products={products}
                currentProductType="All"
                onEnquiryClick={handleEnquiryClick}
                onOrderClick={handleOrderClick}
                onViewClick={handleViewClick}
                onEditClick={handleEditClick}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsView;