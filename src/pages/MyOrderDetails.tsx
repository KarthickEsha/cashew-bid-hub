import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { apiFetch } from "@/lib/api";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, MapPin, Package, DollarSign, CheckCircle, Clock } from "lucide-react";

const formatINR = (val: any) => `₹${new Intl.NumberFormat('en-IN').format(
  typeof val === 'number' ? val : parseFloat(String(val).replace(/[^0-9.-]+/g, "")) || 0
)}`;

const formatWithCommas = (val: any) => {
  if (val === null || val === undefined) return "0";
  const num = typeof val === 'number' ? val : parseFloat(String(val).replace(/[^0-9.-]+/g, ""));
  if (isNaN(num)) return String(val);
  return new Intl.NumberFormat('en-IN').format(num);
};

const getStatusBadge = (status: string) => {
  switch ((status || "").toLowerCase()) {
    case 'processing':
      return <Badge variant="outline" className="text-yellow-600 border-yellow-300 bg-yellow-50">Processing</Badge>;
    case 'confirmed':
      return <Badge variant="outline" className="text-blue-600 border-blue-300 bg-blue-50">Confirmed</Badge>;
    case 'shipped':
      return <Badge variant="outline" className="text-orange-600 border-orange-300 bg-orange-50">Shipped</Badge>;
    case 'delivered':
      return <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50">Delivered</Badge>;
    case 'cancelled':
      return <Badge variant="outline" className="text-red-600 border-red-300 bg-red-50">Cancelled</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const MyOrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation() as { state?: { order?: any } };
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<any | null>(null);

  useEffect(() => {
    let ignore = false;
    const normalize = (it: any) => {
      return {
        id: it.id,
        productName: it.productName || '',
        merchantName: it.companyName || it.merchantName || '',
        quantity: `${it.quantity ?? it.qty ?? 0}`,
        unitPrice: (() => {
          if (it.expectedPrice != null) return Number(it.expectedPrice) || 0;
          // from list row where totalAmount is "₹X"
          const parsed = parseFloat(String(it.totalAmount ?? '').replace(/[^0-9.-]+/g, ""));
          return isNaN(parsed) ? 0 : parsed;
        })(),
        totalAmount: (() => {
          const q = parseFloat(String(it.quantity ?? '0').replace(/[^0-9.-]+/g, "")) || 0;
          const p = (() => {
            if (it.expectedPrice != null) return Number(it.expectedPrice) || 0;
            const parsed = parseFloat(String(it.totalAmount ?? '').replace(/[^0-9.-]+/g, ""));
            return isNaN(parsed) ? 0 : parsed;
          })();
          return q * p;
        })(),
        status: String(it.status || 'processing').toLowerCase(),
        orderDate: it.createdAt || it.orderDate || new Date().toISOString(),
        location: it.usercountry || it.location || '',
        productId: it.productId || '',
        source: it.source || '',
        remarks: it.remark || it.remarks || '',
        shippingDate: it.shippingDate || '',
        deliveryDate: it.deliveryDate || '',
        trackingNumber: it.trackingNumber || '',
      };
    };

    const load = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        // Prefer data passed via navigation state
        const stateOrder = location?.state?.order;
        if (stateOrder) {
          if (!ignore) setOrder(normalize(stateOrder));
          return;
        }

        // Fallback: fetch list and pick by id
        const params = new URLSearchParams({ view: 'buyer' });
        params.set('ownOnly', 'true');
        const res: any = await apiFetch(`/api/stocks/enquiries?${params.toString()}`, { method: 'GET' });
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        const found = list.find((x: any) => String(x.id) === String(id));
        if (!found) throw new Error('Enquiry not found');
        if (!ignore) setOrder(normalize(found));
      } catch (e: any) {
        if (!ignore) setError(e?.message || 'Failed to load enquiry');
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    load();
    return () => { ignore = true; };
  }, [id, location?.state]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Card className="p-10 text-center">
          <h1 className="text-xl font-semibold text-foreground mb-2">Loading details...</h1>
        </Card>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Card className="p-10 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Not Found</h1>
          <p className="text-muted-foreground mb-1">{error || "The item you're looking for doesn't exist or has been deleted."}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/my-orders')}>
          <ArrowLeft size={16} className="mr-2" />
          Back to My Responses
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Response Details</h1>
          <p className="text-muted-foreground">Enquiry #{order.id}</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Main Content */}
        <div className="space-y-6">
          {/* Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{order.productName || 'Cashews'}</CardTitle>
                  <p className="text-muted-foreground mt-1">Source: {order.source || '-'}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(order.status)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Package size={16} className="text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Quantity</div>
                    <div className="font-medium">{formatWithCommas(order.quantity)} Kg</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign size={16} className="text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Unit Price</div>
                    <div className="font-medium">{formatINR(order.unitPrice)}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign size={16} className="text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Total Amount</div>
                    <div className="font-medium">{formatINR(order.totalAmount)}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar size={16} className="text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Date</div>
                    <div className="font-medium">
                      {new Date(order.orderDate).toLocaleDateString('en-GB')}
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Merchant</div>
                  <div className="font-medium">{order.merchantName || '-'}</div>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin size={16} className="text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Location</div>
                    <div className="font-medium">{order.location || '-'}</div>
                  </div>
                </div>
              </div>

              {order.remarks ? (
                <div className="pt-2">
                  <div className="text-sm text-muted-foreground mb-1">Remarks</div>
                  <div className="text-sm">{order.remarks}</div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          {/* Shipping Timeline */}
          {(order.shippingDate || order.deliveryDate || order.trackingNumber) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Shipping</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {order.trackingNumber && (
                  <div className="text-sm"><span className="text-muted-foreground">Tracking: </span>{order.trackingNumber}</div>
                )}
                {order.shippingDate && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock size={14} className="mr-2" /> Shipped: {order.shippingDate}
                  </div>
                )}
                {order.deliveryDate && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CheckCircle size={14} className="mr-2" /> Delivery: {order.deliveryDate}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyOrderDetails;
