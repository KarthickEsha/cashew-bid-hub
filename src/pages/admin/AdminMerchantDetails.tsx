import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { merchants as mockMerchants, products as mockProducts } from "@/data/mockdata";
import { ArrowLeft, Store, MapPin, Phone, Mail, Globe, Package, ShieldCheck, Star, ExternalLink } from "lucide-react";
import React from "react";
import { useProfile } from "@/hooks/useProfile";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { XAxis, YAxis, CartesianGrid, AreaChart, Area, ResponsiveContainer } from "recharts";

const AdminMerchantDetails = () => {
  const { profile } = useProfile();
  const navigate = useNavigate();
  const { merchantId } = useParams();
  const location = useLocation() as { state?: { merchant?: any } };

  // Prefer merchant passed via navigation state; otherwise, try to find by id from mock data
  const merchantFromState = location.state?.merchant;
  const merchant = React.useMemo(() => {
    if (merchantFromState) return merchantFromState;
    if (merchantId) return mockMerchants.find((m) => m.id === merchantId);
    return undefined;
  }, [merchantFromState, merchantId]);

  // Compute product count using merchant id if available
  const productCount = React.useMemo(() => {
    if (!merchant) return 0;
    const id = merchant.id;
    if (!id) return 0;
    return mockProducts.filter((p) => p.merchantId === id).length;
  }, [merchant]);

  const merchantProducts = React.useMemo(() => {
    const id = merchant?.id;
    if (!id) return [] as typeof mockProducts;
    return mockProducts.filter((p) => p.merchantId === id);
  }, [merchant]);

  const [showAllProducts, setShowAllProducts] = React.useState(false);
  const displayedProducts = showAllProducts ? merchantProducts : merchantProducts.slice(0, 3);

  // Mock date-wise stock sold data (fallback if backend is not ready)
  const salesData = React.useMemo(() => {
    // Create a simple 8-point series. Could be replaced by real API data later.
    const base = (productCount || 1) * 10;
    return [
      { label: "Jan", sold: Math.round(base * 0.6) },
      { label: "Feb", sold: Math.round(base * 0.7) },
      { label: "Mar", sold: Math.round(base * 0.8) },
      { label: "Apr", sold: Math.round(base * 0.75) },
      { label: "May", sold: Math.round(base * 0.9) },
      { label: "Jun", sold: Math.round(base * 1.0) },
      { label: "Jul", sold: Math.round(base * 0.95) },
      { label: "Aug", sold: Math.round(base * 1.1) },
    ];
  }, [productCount]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <div className="text-xl font-semibold">Merchant Details</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              {merchant?.name || merchant?.companyName || "Merchant"}
            </CardTitle>
            {merchant?.verified && (
              <div className="inline-flex items-center text-green-600 text-sm font-medium">
                <ShieldCheck className="h-4 w-4 mr-1" /> Verified
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Location</div>
                  <div className="font-medium">{merchant?.location || "—"}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Phone</div>
                  <div className="font-medium">{merchant?.phone || "—"}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Email</div>
                  <div className="font-medium break-all">{merchant?.email || "—"}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Globe className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Established</div>
                   <div className="font-medium">{merchant?.establishedYear ?? profile?.establishedYear ?? "—"}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">About</div>
            <div className="text-sm leading-relaxed">
              {merchant?.description || "No description available."}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Date-wise Stock Sold Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Stock Sold (last month)</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{ sold: { label: "Sold", color: "hsl(var(--chart-1))" } }} className="w-full h-[320px]">
            <ResponsiveContainer>
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="soldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-sold)" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="var(--color-sold)" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="sold" stroke="var(--color-sold)" fill="url(#soldGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
      </div>

      {/* Products Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" /> Products ({productCount})
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate("/admin/products")}> 
                <ExternalLink className="h-4 w-4 mr-2" /> Open Products Page
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {merchantProducts.length === 0 ? (
            <div className="text-sm text-muted-foreground">No products found for this merchant.</div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayedProducts.map((p) => (
                  <div key={p.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold truncate" title={p.name}>{p.name}</div>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">{p.pricingType || 'fixed'}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">Grade: <span className="font-medium text-foreground">{p.grade}</span></div>
                    <div className="text-sm text-muted-foreground">Quantity: <span className="font-medium text-foreground">{p.quantity}</span></div>
                    {p.pricePerTon && (
                      <div className="text-sm text-muted-foreground">Price/Ton: <span className="font-medium text-foreground">{p.pricePerTon}</span></div>
                    )}
                    {p.expiry && (
                      <div className="text-xs text-muted-foreground">Expiry: {p.expiry}</div>
                    )}
                  </div>
                ))}
              </div>
              {merchantProducts.length > 3 && (
                <div className="flex justify-center">
                  <Button variant="ghost" onClick={() => setShowAllProducts(!showAllProducts)}>
                    {showAllProducts ? "Show less" : `View all products (${merchantProducts.length})`}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminMerchantDetails;
