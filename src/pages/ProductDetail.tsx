import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  MapPin, Calendar, Star, Phone, Mail, Globe, ArrowLeft,
  TrendingUp, Package, Shield, Clock
} from "lucide-react";
import { useRole } from "@/hooks/useRole";
import { merchants, products } from "@/data/mockdata";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const product = products.find((p) => p.id === Number(id));
  const merchant = merchants.find((m) => m.id === product?.merchantId);

  const navigate = useNavigate();
  const { role } = useRole();

  const [bidQuantity, setBidQuantity] = useState("");
  const [bidPrice, setBidPrice] = useState("");
  const [bidMessage, setBidMessage] = useState("");

  if (!product || !merchant) {
    return <div className="p-6 text-center">Product not found</div>;
  }

  const handleBack = () => {
    if (role === "processor") navigate("/merchant/products");
    else navigate("/marketplace");
  };

  const handlePlaceBid = () => {
    console.log("Bid placed:", { bidQuantity, bidPrice, bidMessage });
  };

  const handleViewAllProducts = () => {
    navigate(`/merchant/${merchant.id}/products`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        className="inline-flex items-center mb-6"
        onClick={handleBack}
      >
        <ArrowLeft size={16} className="mr-2" />
        {role === "processor" ? "Back to My Product Stocks" : "Back to Marketplace"}
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Card */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <CardTitle className="text-2xl">{product.grade} Cashews</CardTitle>
                    {merchant.verified && (
                      <Badge variant="default">
                        <Shield size={12} className="mr-1" /> Verified
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
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Package size={20} />
                  <div>
                    <div className="text-sm text-muted-foreground">Quantity</div>
                    <div className="font-semibold">{product.quantity}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin size={20} />
                  <div>
                    <div className="text-sm text-muted-foreground">Origin</div>
                    <div className="font-semibold">{merchant.location}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar size={20} />
                  <div>
                    <div className="text-sm text-muted-foreground">Expiry</div>
                    <div className="font-semibold">{new Date(product.expiry).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
              {product.pricingType === "bidding" && (
                <div className="flex items-center space-x-2 p-3 bg-accent/50 rounded-lg mt-4">
                  <TrendingUp size={20} className="text-primary" />
                  <span className="font-medium">This product accepts bidding</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Specs */}
          <Card>
            <CardHeader><CardTitle>Specifications</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between border-b py-2">
                    <span className="text-muted-foreground capitalize">{key}</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Order/Bid */}
          <Card>
            <CardHeader>
              <CardTitle>{product.pricingType === "bidding" ? "Place Bid" : "Place Order"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Quantity (tons)</label>
                  <Input value={bidQuantity} onChange={(e) => setBidQuantity(e.target.value)} />
                </div>
                {product.pricingType === "bidding" && (
                  <div>
                    <label className="block text-sm font-medium">Your Price ($/ton)</label>
                    <Input value={bidPrice} onChange={(e) => setBidPrice(e.target.value)} />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium">Message</label>
                <Textarea value={bidMessage} onChange={(e) => setBidMessage(e.target.value)} />
              </div>
              <Button onClick={handlePlaceBid} className="w-full">
                {product.pricingType === "bidding" ? "Place Bid" : "Send Order Request"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Merchant Sidebar */}
        <div>
          <Card className="sticky top-20">
            <CardHeader>
              <div className="flex justify-between">
                <CardTitle>{merchant.name}</CardTitle>
                {merchant.verified && (
                  <Badge><Shield size={12} className="mr-1" /> Verified</Badge>
                )}
              </div>
              <div className="flex items-center">
                <Star size={16} className="text-yellow-500 mr-1" />
                <span>{merchant.rating}</span>
                <span className="text-muted-foreground ml-1">({merchant.totalOrders} orders)</span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-3">{merchant.description}</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center"><MapPin size={16} className="mr-2" /> {merchant.location}</div>
                <div className="flex items-center"><Phone size={16} className="mr-2" /> {merchant.phone}</div>
                <div className="flex items-center"><Mail size={16} className="mr-2" /> {merchant.email}</div>
                <div className="flex items-center"><Globe size={16} className="mr-2" /> {merchant.website}</div>
                <div className="flex items-center"><Clock size={16} className="mr-2" /> Response: {merchant.responseTime}</div>
              </div>
              <div className="mt-4 space-y-2">
                <Button variant="outline" className="w-full">Contact Merchant</Button>
                <Button variant="ghost" className="w-full" onClick={handleViewAllProducts}>View All Products</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
