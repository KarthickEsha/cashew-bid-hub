import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Eye, MapPin, Star, TrendingUp } from "lucide-react";
import { merchants, products } from "@/data/mockdata";
import { useInventory } from "@/hooks/useInventory";
import { useProfile } from "@/hooks/useProfile";

const ViewAllProducts = () => {
  const { merchantId } = useParams<{ merchantId: string }>();
  const navigate = useNavigate();
  const { products: inventoryProducts } = useInventory();
  const { profile, setProfile } = useProfile();
  const merchant = profile;
  const merchantProducts = inventoryProducts;

  if (!merchant) return <div className="p-6">Merchant not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
        <ArrowLeft size={16} className="mr-2" /> Back
      </Button>

      {/* Company / Merchant Details */}
      <Card className="mb-6 shadow-md border rounded-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{merchant.companyName}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Cashew merchant specializing in high-quality products and reliable service.</p>
          <div className="flex flex-wrap gap-3">
            <Badge variant="secondary">Location: {merchant.city}</Badge>
            <Badge variant="secondary">Established: {profile.establishedYear}</Badge>
            <Badge variant="secondary">Rating: ⭐ 4.5</Badge>
            <Badge variant="secondary">Total Products: {merchantProducts.length}</Badge>
            <Badge variant="secondary">Total Orders: 150</Badge>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            📞 {merchant.phone} | ✉️ {merchant.email} | 🌐{" "}
            <a
              href="https://www.kriyartec.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              www.kriyartec.com
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Product Section */}
      <h2 className="text-xl font-semibold mb-4">
        Products ({merchantProducts.length})
      </h2>

      {merchantProducts.length === 0 ? (
        <p className="text-muted-foreground">No products available for this company.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {merchantProducts.map((prod) => (
            <Card
              key={prod.id}
              className="hover:shadow-warm transition-all duration-200 hover:-translate-y-1"
            >
              {/* Card Header */}
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <CardTitle className="text-lg">{prod.name}</CardTitle>
                      {"verified" in prod && prod.verified && (
                        <Badge variant="default" className="text-xs">
                          Verified
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center text-muted-foreground text-sm">
                      <MapPin size={14} className="mr-1" />
                      {merchant.city}
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star size={14} className="text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">{'rating' in prod ? String(prod.rating) : '5'}</span>
                  </div>
                </div>
              </CardHeader>

              {/* Card Content */}
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{prod.description}</p>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Grade:</span>
                    <div className="font-semibold">{prod.grade ?? "RCN"} </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Quantity:</span>
                    <div className="font-semibold">{prod.availableQty}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Price:</span>
                    <div className="font-semibold text-primary">
                      ₹{prod.price} / kg
                    </div>
                  </div>
                  {/* <div>
                    <span className="text-muted-foreground">Type:</span>
                    <div className="flex items-center">
                      {prod.pricingType === "bidding" && (
                        <TrendingUp size={14} className="mr-1 text-primary" />
                      )}
                      <span className="font-semibold capitalize">{prod.pricingType ?? "fixed"}</span>
                    </div>
                  </div> */}
                </div>

                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar size={14} className="mr-1" />
                  Expires: {new Date(prod.expireDate).toLocaleDateString()}
                </div>

                <div className="flex space-x-2 pt-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/product/${prod.id}`)}
                  >
                    <Eye size={14} className="mr-2" />
                    View Details
                  </Button>
                  {/* <Button size="sm" variant="outline">
                    {prod.pricingType === "bidding" ? "Place Bid" : "Quick Order"}
                  </Button> */}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

      )}
    </div>
  );
};

export default ViewAllProducts;