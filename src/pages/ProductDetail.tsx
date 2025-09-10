import { useEffect, useState } from "react";
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
import { Product, Location as LocationType } from "@/types/user";
import { useInventory } from "@/hooks/useInventory";
import { useUser } from "@clerk/clerk-react";
import { useProfile } from "@/hooks/useProfile";

const ProductDetail = () => {
  // Hooks must be called at the top level
  const { id } = useParams<{ id: string }>();
  const { products: inventoryProducts } = useInventory();
  const navigate = useNavigate();
  const { role } = useRole();
  const { user } = useUser();
  const { profile, setProfile } = useProfile();

  // State hooks - all hooks must be called unconditionally at the top level
  const [isLoading, setIsLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [merchant, setMerchant] = useState<{
    id: string;
    name: string;
    rating?: number;
    totalOrders?: number;
    location: string | LocationType;
    verified?: boolean;
    responseTime?: string;
    phone?: string;
    email?: string;
    website?: string;
    description?: string;
  } | null>(null);
  const [bidQuantity, setBidQuantity] = useState("");
  const [bidPrice, setBidPrice] = useState("");
  const [bidMessage, setBidMessage] = useState("");
  const [timeLeft, setTimeLeft] = useState("");

  // Derived state
  const auctionEnd = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);

  // All effects must be defined before any conditional returns
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = auctionEnd.getTime() - now;

      if (distance <= 0) {
        clearInterval(timer);
        setTimeLeft("Auction Ended");
      } else {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const foundProduct = inventoryProducts.find((p) => p.id === id);
        if (foundProduct) {
          setProduct(foundProduct);
          // In a real app, you would fetch merchant data based on product.merchantId or similar
          const merchantData = merchants.find((m) => m.id === foundProduct.merchantId) || {
            id: user?.id || 'default-merchant',
            name: profile?.companyName || 'Unknown Merchant',
            rating: 4.5,
            totalOrders: 0,
            location: profile?.location || 'Unknown',
            verified: false,
            responseTime: 'Within 24 hours',
            phone: profile?.phone || 'N/A',
            email: profile?.email || 'N/A',
            website: 'www.kriyatec.in',
            description: 'Merchant information not available'
          };
          setMerchant(merchantData);
        }
      } catch (error) {
        console.error('Error loading product:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, inventoryProducts]);


  // Get product specifications safely
  const getProductSpecs = () => {
    if (!product) return [];

    const specs = [];

    // Add type-specific specs
    if (product.type === 'RCN') {
      if (product.yearOfCrop) specs.push(['Crop Year', product.yearOfCrop]);
      if (product.nutCount) specs.push(['Nut Count', product.nutCount]);
      if (product.outTurn) specs.push(['Out Turn', product.outTurn]);
    } else if (product.type === 'Kernel') {
      if (product.grade) specs.push(['Grade', product.grade]);
    }

    // Add common specs
    specs.push(
      ['Stock', `${product.stock} ${product.unit}`],
      ['Minimum Order', product.minOrderQty ? `${product.minOrderQty} ${product.unit}` : 'No minimum'],
      ['Pricing Type', product.pricingType === 'bidding' ? 'Bidding' : 'Fixed Price'],
      ['Origin', product.location || 'N/A']
    );

    return specs;
  };

  // Mock Current Bids (replace with API later)
  const currentBids = [
    { id: 1, bidder: "Food Corp Ltd", price: "$950/ton", quantity: "20 tons", time: "2h ago" },
    { id: 2, bidder: "SnackHub Traders", price: "$970/ton", quantity: "15 tons", time: "1h ago" },
  ];
  debugger
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <h2 className="text-2xl font-semibold mb-4">Product Not Found</h2>
        <p className="text-muted-foreground mb-6">The product you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate('/marketplace')} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Marketplace
        </Button>
      </div>
    );
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
                    {merchant?.verified && (
                      <Badge variant="default">
                        <Shield size={12} className="mr-1" /> Verified
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground">{product.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary">
                    {new Intl.NumberFormat("en-IN", {
                      style: "currency",
                      currency: "INR",
                      maximumFractionDigits: 0,
                    }).format(product.price)}
                  </div>
                  <div className="text-sm text-muted-foreground">Per ton</div>
                </div>

              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Package size={20} />
                  <div>
                    <div className="text-sm text-muted-foreground">Quantity</div>
                    <div className="font-semibold">{product.availableQty}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin size={20} />
                  <div>
                    <div className="text-sm text-muted-foreground">Origin</div>
                    <div className="font-semibold">
                      {typeof merchant.location === 'string'
                        ? merchant.location
                        : [
                          (merchant.location as LocationType)?.address,
                          (merchant.location as LocationType)?.city,
                          (merchant.location as LocationType)?.region,
                          (merchant.location as LocationType)?.country
                        ].filter(Boolean).join(', ')
                      }
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar size={20} />
                  <div>
                    <div className="text-sm text-muted-foreground">Expiry</div>
                    <div className="font-semibold">{new Date(product.expireDate).toLocaleDateString()}</div>
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
                {getProductSpecs().map(([key, value], index) => (
                  <div key={index} className="flex justify-between border-b py-2">
                    <span className="text-muted-foreground capitalize">{key}</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Order/Bid - Hide in processor mode */}
          {role !== "processor" && (
            <Card>
              <CardHeader>
                <CardTitle>{product.pricingType === "bidding" ? "Place Bid" : "My Offers"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium">Quantity (kg)</label>
                    <Input value={bidQuantity} onChange={(e) => setBidQuantity(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Your Expected Price ($/kg)</label>
                    <Input value={bidPrice} onChange={(e) => setBidPrice(e.target.value)} />
                  </div>
                  {/* {product.pricingType === "bidding" && (
 <div>
 <label className="block text-sm font-medium">Your Price ($/ton)</label>
 <Input value={bidPrice} onChange={(e) => setBidPrice(e.target.value)} />
 </div>
 )} */}
                </div>
                <div>
                  <label className="block text-sm font-medium">Message</label>
                  <Textarea value={bidMessage} onChange={(e) => setBidMessage(e.target.value)} />
                </div>
                <Button onClick={handlePlaceBid} className="w-full">
                  {product.pricingType === "bidding" ? "Place Bid" : "Send Request"}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Merchant Card */}
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
                <span>{merchant?.rating || 'N/A'}</span>
                <span className="text-muted-foreground ml-1">
                  ({merchant?.totalOrders || 0} {merchant?.totalOrders === 1 ? 'order' : 'orders'})
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-3">{merchant?.description || 'No description available'}</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <MapPin size={16} className="mr-2" />
                  {typeof merchant?.location === 'string'
                    ? merchant.location
                    : [
                      (merchant?.location as LocationType)?.address,
                      (merchant?.location as LocationType)?.city,
                      (merchant?.location as LocationType)?.region,
                      (merchant?.location as LocationType)?.country
                    ].filter(Boolean).join(', ') || 'N/A'}
                </div>
                <div className="flex items-center"><Phone size={16} className="mr-2" /> {merchant?.phone || 'N/A'}</div>
                <div className="flex items-center"><Mail size={16} className="mr-2" /> {merchant?.email || 'N/A'}</div>
                <div className="flex items-center"><Globe size={16} className="mr-2" /> {merchant?.website || 'N/A'}</div>
                <div className="flex items-center"><Clock size={16} className="mr-2" /> Response: {merchant?.responseTime || 'N/A'}</div>
              </div>
              <div className="mt-4 space-y-2">
                <Button variant="outline" className="w-full">Contact Merchant</Button>
                <Button variant="ghost" className="w-full" onClick={handleViewAllProducts}>View All Products</Button>
              </div>
            </CardContent>
          </Card>

          {/* Bid Details Card */}
          {product.pricingType === "bidding" && role !== "processor" && (
            <Card className="sticky top-20 shadow-md rounded-lg border border-gray-200 max-w-sm">
              <CardHeader className="pb-1">
                <CardTitle className="text-base font-semibold">Bid History</CardTitle>
                <p className="text-xs text-muted-foreground">Live trading updates</p>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Auction Timer */}
                <div className="p-3 rounded-lg border bg-purple-50 flex justify-between items-center">
                  <h4 className="text-xs font-medium">Auction Ends In</h4>
                  <p className="font-semibold text-purple-600 text-sm">{timeLeft}</p>
                </div>

                {/* Opening Bid */}
                <div className="p-3 rounded-lg border bg-muted/30">
                  <h4 className="text-xs font-medium mb-1">Opening Bid</h4>
                  <p className="text-base font-semibold text-primary">
                    {product.price} $/ton
                  </p>
                </div>

                {/* Current Bids Timeline */}
                <div className="p-3 rounded-lg border bg-muted/30">
                  <h4 className="text-xs font-medium mb-2">Bid Timeline</h4>
                  <ul className="space-y-3 text-xs relative">
                    {currentBids.map((bid, idx) => (
                      <li key={bid.id} className="relative flex items-start gap-2 pl-5">
                        {/* timeline line */}
                        {idx !== currentBids.length - 1 && (
                          <span className="absolute left-[4px] top-2 w-[1px] h-full bg-gray-300"></span>
                        )}
                        {/* timeline dot */}
                        <span className="absolute left-0 top-2 w-2.5 h-2.5 rounded-full bg-primary border-2 border-white shadow"></span>

                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{bid.bidder}</span>
                            <span className="text-[10px] text-muted-foreground">{bid.time}</span>
                          </div>
                          <div className="text-xs">
                            {bid.price} $/ton &nbsp; | &nbsp; {bid.quantity} tons
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Your Bid */}
                <div className="p-3 rounded-lg border bg-muted/30">
                  <h4 className="text-xs font-medium mb-1">Your Bid</h4>
                  {bidPrice || bidQuantity ? (
                    <p className="text-xs">
                      <span className="font-medium">Qty:</span> {bidQuantity || "-"} tons
                      &nbsp; | &nbsp;
                      <span className="font-medium">Price:</span> {bidPrice || "-"} $/ton
                    </p>
                  ) : (
                    <p className="text-muted-foreground text-xs">
                      You haven’t placed a bid yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;