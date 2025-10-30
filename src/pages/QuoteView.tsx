import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Calendar, MapPin, Package, IndianRupee, User, Building } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useRole } from '@/hooks/useRole';

interface RequirementNorm {
  id: string;
  title: string;
  grade: string;
  quantity: string | number;
  minQty: number;
  preferredOrigin: string;
  budgetRange: string;
  requirementExpiry: string;
  deliveryLocation: string;
  deliveryDeadline: string;
  status: string;
  createdDate: string;
  lastModified: string;
  expectedPrice: number;
  buyerName?: string;
  buyerCompany?: string;
}

interface QuoteNorm {
  id: string;
  merchantId: string;
  merchantName: string;
  merchantLocation: string;
  price: string;
  quantity: string;
  minQty?: string;
  origin?: string;
  grade?: string;
  deliveryTime?: string;
  contact?: string;
  message?: string;
  certifications?: string[];
  responseDate: string;
  status: string;
}

const QuoteView = () => {
  const { requirementId = '', quoteId = '' } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { role } = useRole();

  const [requirement, setRequirement] = useState<RequirementNorm | null>(null);
  const [quote, setQuote] = useState<QuoteNorm | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const view = useMemo(() => {
    const qp = searchParams.get('view');
    if (qp) return qp;
    const r = String(role || '').toLowerCase();
    return r === 'processor' || r === 'merchant' ? 'merchant' : 'buyer';
  }, [searchParams, role]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!requirementId) return;
      setLoading(true);
      setError(null);
      try {
        const data: any = await apiFetch(`/api/quotes/with-requirement/${requirementId}?view=${view}`);
        const root = data?.data ?? data;
        if (!root) throw new Error('Requirement not found');
        const item = root.requirement ?? root.Requirement ?? root.req ?? root.Req ?? root;
        const quotes = (root.quotes ?? root.Quotes ?? []) as any[];

        const nid = String(item?.id ?? item?._id ?? item?.ID ?? requirementId);
        const grade = item?.grade || item?.productGrade || item?.product?.grade || 'W320';
        const quantity = String(item?.requiredqty ?? item?.qty ?? item?.totalQuantity ?? item?.quantity ?? '0');
        const minQty = Number(item?.minimumqty ?? item?.minQty ?? 0);
        const origin = (item?.origin || item?.preferredOrigin || item?.source || 'any')?.toString?.() ?? 'any';
        const expectedPrice = Number(item?.expectedprice ?? item?.price ?? item?.expected_price ?? item?.expectedPrice ?? 0);
        const deliveryLocation = item?.deliveryLocation || item?.location || '';
        const deliveryDeadline = item?.deliveryDeadline || item?.deliverydate || item?.requirementExpiry || '';
        const status = (item?.status || 'active').toString();
        const createdAt = item?.createdAt || item?.created_at || new Date().toISOString();

        const normalizedReq: RequirementNorm = {
          id: nid,
          title: item?.title || `${quantity} of ${grade} Cashews`,
          grade,
          quantity,
          minQty,
          preferredOrigin: origin,
          budgetRange: `₹${(expectedPrice as number)?.toLocaleString?.() || expectedPrice}/kg`,
          requirementExpiry: deliveryDeadline,
          deliveryLocation,
          deliveryDeadline,
          status,
          createdDate: createdAt,
          lastModified: item?.updatedAt || item?.updated_at || createdAt,
          expectedPrice,
          buyerName: item?.buyerName || item?.userName || item?.username || '',
          buyerCompany: item?.buyerCompany || item?.companyName || '',
        };

        const mappedQuotes: QuoteNorm[] = (quotes || []).map((q: any) => {
          const rid = String(q?.id ?? q?._id ?? q?.ID ?? q?.quoteId ?? '');
          const supplyQty = q?.supplyQtyKg ?? q?.SupplyQtyKg ?? q?.supply_qty ?? q?.quantity ?? '';
          const priceINR = q?.priceINR ?? q?.PriceINR ?? q?.price ?? '';
          const created = q?.createdAt ?? q?.CreatedAt ?? new Date().toISOString();
          const merchantId = q?.merchantId ?? q?.MerchantID ?? q?.merchantID ?? '';
          return {
            id: rid,
            merchantId,
            merchantName: q?.merchantCompanyName || merchantId || 'Merchant',
            merchantLocation: q?.officeAddress || '-',
            price: priceINR ? `₹${Number(priceINR).toLocaleString()}/kg` : '',
            quantity: supplyQty ? `${supplyQty} kg` : '',
            minQty: q?.minimumqty ? `${q?.minimumqty} kg` : '',
            origin: q?.origin || '',
            grade: q?.grade || '',
            deliveryTime: q?.deliveryTime || '',
            contact: q?.contact || '',
            message: q?.remarks ?? q?.Remarks ?? '',
            certifications: q?.certifications || [],
            responseDate: created,
            status: (q?.status || 'new').toString(),
          };
        });

        if (!mounted) return;
        setRequirement(normalizedReq);
        const selected = mappedQuotes.find(q => q.id === String(quoteId));
        if (!selected) throw new Error('Quote not found for this requirement');
        setQuote(selected);
      } catch (e: any) {
        if (mounted) setError(e?.message || 'Failed to load quote');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [requirementId, quoteId, view]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} className="mr-2" />
            Back
          </Button>
        </div>
        <Card className="p-10 text-center">
          <h1 className="text-xl font-semibold text-foreground mb-2">Loading...</h1>
        </Card>
      </div>
    );
  }

  if (error || !requirement || !quote) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} className="mr-2" />
            Back
          </Button>
        </div>
        <Card className="p-10 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Not Found</h1>
          <p className="text-muted-foreground mb-4">{error || 'The requested quote could not be found.'}</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} className="mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quote Details</h1>
          <p className="text-muted-foreground">Requirement #{requirement.id} • Quote #{quote.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Right: Merchant quote details */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Merchant Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Merchant Name</div>
                  <div className="font-medium">{quote.merchantName}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Location</div>
                  <div className="font-medium">{quote.merchantLocation}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Offered Price</div>
                  <div className="font-medium">{quote.price}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Available Qty</div>
                  <div className="font-medium">{quote.quantity}</div>
                </div>
                {quote.grade && (
                  <div>
                    <div className="text-sm text-muted-foreground">Grade</div>
                    <div className="font-medium">{quote.grade}</div>
                  </div>
                )}
                {quote.origin && (
                  <div>
                    <div className="text-sm text-muted-foreground">Origin</div>
                    <div className="font-medium">{quote.origin}</div>
                  </div>
                )}
              </div>
              {quote.message && (
                <div>
                  <div className="text-sm text-muted-foreground">Remarks</div>
                  <div className="font-medium whitespace-pre-wrap">{quote.message}</div>
                </div>
              )}
              <Separator />
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Quote Status</span>
                <Badge className="capitalize">{requirement.status}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Left: Buyer details */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Buyer Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <User size={16} className="text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Buyer Name</div>
                    <div className="font-medium">{requirement.buyerName || '-'}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Package size={16} className="text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Required Qty</div>
                    <div className="font-medium">{Number(requirement.quantity).toLocaleString()} kg</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <IndianRupee size={16} className="text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Expected Price</div>
                    <div className="font-medium">{requirement.budgetRange}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin size={16} className="text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Delivery Location</div>
                    <div className="font-medium">{requirement.deliveryLocation || '-'}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar size={16} className="text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Deadline</div>
                    <div className="font-medium">{requirement.deliveryDeadline || '-'}</div>
                  </div>
                </div>
              </div>
              <Separator />
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge className="capitalize">{quote.status}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default QuoteView;
