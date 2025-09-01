import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { merchants, products } from "@/data/mockdata";

const ViewAllProducts = () => {
  const { merchantId } = useParams<{ merchantId: string }>();
  const navigate = useNavigate();

  const merchant = merchants.find((m) => m.id === merchantId);
  const merchantProducts = products.filter((p) => p.merchantId === merchantId);

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
          <CardTitle className="text-2xl font-bold">{merchant.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-3">{merchant.description}</p>
          <div className="flex flex-wrap gap-3">
            <Badge variant="secondary">Location: {merchant.location}</Badge>
            <Badge variant="secondary">Established: {merchant.establishedYear}</Badge>
            <Badge variant="secondary">Rating: ⭐ {merchant.rating || "N/A"}</Badge>
            <Badge variant="secondary">Total Products: {merchantProducts.length}</Badge>
            <Badge variant="secondary">Total Orders: {merchant.totalOrders}</Badge>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            📞 {merchant.phone} | ✉️ {merchant.email} | 🌐{" "}
            <a
              href={merchant.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {merchant.website}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {merchantProducts.map((prod) => (
            <Card key={prod.id} className="shadow-sm hover:shadow-lg transition rounded-xl">
              <CardHeader>
                <CardTitle className="text-lg">{prod.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">Price: ₹{prod.pricePerTon} / ton</p>
                <p className="text-sm text-muted-foreground">Available: {prod.quantity}</p>
                <p className="text-sm text-muted-foreground">Grade: {prod.grade}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Expiry: {prod.expiry}
                </p>

                {/* Show specifications */}
                <div className="mt-2 text-xs text-muted-foreground">
                  <p>Moisture: {prod.specifications.moisture}</p>
                  <p>Kernel Size: {prod.specifications.kernelSize}</p>
                  <p>Broken Rate: {prod.specifications.brokenRate}</p>
                  <p>Origin: {prod.specifications.origin}</p>
                  <p>Packaging: {prod.specifications.packaging}</p>
                  <p>Certification: {prod.specifications.certification}</p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 w-full"
                  onClick={() => navigate(`/product/${prod.id}`)}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewAllProducts;
