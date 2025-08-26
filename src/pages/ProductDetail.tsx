import { useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  MapPin,
  Calendar,
  Star,
  Phone,
  Mail,
  Globe,
  ArrowLeft,
  TrendingUp,
  Package,
  Shield,
  Clock
} from "lucide-react";
import { useRole } from "@/hooks/useRole";

const ProductDetail = () => {
  const { id } = useParams();
  const [bidQuantity, setBidQuantity] = useState("");
  const [bidPrice, setBidPrice] = useState("");
  const [bidMessage, setBidMessage] = useState("");

  // Mock product data
  const product = {
    id: 1,
    merchantName: "Premium Cashews Ltd",
    location: "Mumbai, India",
    grade: "W320",
    quantity: "50 tons",
    pricePerTon: "$8,500",
    pricingType: "fixed",
    expiry: "2024-12-15",
    rating: 4.8,
    verified: true,
    description: "Premium grade W320 cashews from Kerala, India. These cashews are carefully selected and processed to maintain the highest quality standards.",
    specifications: {
      moisture: "5% max",
      kernelSize: "320 pieces/kg",
      brokenRate: "5% max",
      origin: "Kerala, India",
      packaging: "Vacuum packed in 25kg bags",
      certification: "FSSAI, ISO 22000"
    },
    merchant: {
      name: "Premium Cashews Ltd",
      establishedYear: "2010",
      location: "Mumbai, India",
      phone: "+91-98765-43210",
      email: "sales@premiumcashews.com",
      website: "www.premiumcashews.com",
      rating: 4.8,
      totalOrders: 1247,
      responseTime: "2 hours",
      verified: true,
      description: "Leading cashew exporter with 14 years of experience in premium quality cashews."
    }
  };

  const handlePlaceBid = () => {
    // Handle bid placement logic here
    console.log("Bid placed:", { quantity: bidQuantity, price: bidPrice, message: bidMessage });
  };
  const { role, setRole } = useRole();
  const backLink = role === "processor" ? "/merchant/products" : "/marketplace";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Back Navigation */}
      <Link to={backLink} className="inline-flex items-center text-muted-foreground hover:text-primary mb-6">
        <ArrowLeft size={16} className="mr-2" />
        {role === "processor" ? "Back to My Product Stocks" : "Back to Marketplace"}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Product Info */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <CardTitle className="text-2xl">{product.grade} Cashews</CardTitle>
                    {product.verified && (
                      <Badge variant="default">
                        <Shield size={12} className="mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground">{product.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary">{product.pricePerTon}</div>
                  <div className="text-sm text-muted-foreground">per ton</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Package size={20} className="text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Available Quantity</div>
                    <div className="font-semibold">{product.quantity}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin size={20} className="text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Origin</div>
                    <div className="font-semibold">{product.location}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar size={20} className="text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Expires On</div>
                    <div className="font-semibold">{new Date(product.expiry).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>

              {product.pricingType === 'bidding' && (
                <div className="flex items-center space-x-2 p-3 bg-accent/50 rounded-lg">
                  <TrendingUp size={20} className="text-primary" />
                  <span className="font-medium">This product accepts bidding</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Specifications */}
          <Card>
            <CardHeader>
              <CardTitle>Product Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-2 border-b border-border last:border-b-0">
                    <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Place Order/Bid */}
          <Card>
            <CardHeader>
              <CardTitle>
                {product.pricingType === 'bidding' ? 'Place Your Bid' : 'Place Order'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Quantity (tons)</label>
                  <Input
                    placeholder="Enter quantity needed"
                    value={bidQuantity}
                    onChange={(e) => setBidQuantity(e.target.value)}
                  />
                </div>
                {product.pricingType === 'bidding' && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Your Price ($/ton)</label>
                    <Input
                      placeholder="Enter your bid price"
                      value={bidPrice}
                      onChange={(e) => setBidPrice(e.target.value)}
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Message (Optional)</label>
                <Textarea
                  placeholder="Add any special requirements or messages"
                  value={bidMessage}
                  onChange={(e) => setBidMessage(e.target.value)}
                />
              </div>
              <Button onClick={handlePlaceBid} size="lg" className="w-full">
                {product.pricingType === 'bidding' ? 'Place Bid' : 'Send Order Request'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Merchant Information */}
        <div>
          <Card className="sticky top-20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{product.merchant.name}</CardTitle>
                {product.merchant.verified && (
                  <Badge variant="default">
                    <Shield size={12} className="mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  <Star size={16} className="text-yellow-500 fill-current mr-1" />
                  <span className="font-medium">{product.merchant.rating}</span>
                  <span className="text-muted-foreground ml-1">({product.merchant.totalOrders} orders)</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{product.merchant.description}</p>

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <MapPin size={16} className="text-muted-foreground" />
                  <span className="text-sm">{product.merchant.location}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone size={16} className="text-muted-foreground" />
                  <span className="text-sm">{product.merchant.phone}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail size={16} className="text-muted-foreground" />
                  <span className="text-sm">{product.merchant.email}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Globe size={16} className="text-muted-foreground" />
                  <span className="text-sm">{product.merchant.website}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock size={16} className="text-muted-foreground" />
                  <span className="text-sm">Response time: {product.merchant.responseTime}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-border">
                <div className="text-sm text-muted-foreground mb-2">Established</div>
                <div className="font-medium">{product.merchant.establishedYear}</div>
              </div>

              <div className="space-y-2">
                <Button variant="outline" className="w-full">
                  <Phone size={16} className="mr-2" />
                  Contact Merchant
                </Button>
                <Button variant="ghost" className="w-full">
                  View All Products
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;