import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useRole } from '@/hooks/useRole';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useResponses } from '@/hooks/useResponses';
import { useProfile } from '@/hooks/useProfile';
import { useUser } from '@clerk/clerk-react';
import { useRequirements } from '@/hooks/useRequirements';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Package,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  ShoppingCart,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';

const EnquiryDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addResponse } = useResponses();
  const { profile } = useProfile();
  const { user } = useUser();
  const { updateRequirementStatus } = useRequirements();
  const { role } = useRole.getState();

  // Requirement and responses state
  const [requirement, setRequirement] = useState<any | null>(null);
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Quote form state
  const [availableQuantity, setAvailableQuantity] = useState('');
  const [merchantPrice, setMerchantPrice] = useState('');
  const [remarks, setRemarks] = useState('');
  const [quantityError, setQuantityError] = useState('');
  const [priceError, setPriceError] = useState('');

  const formatDateExact = (input: any) => {
    if (!input) return '-';
    try {
      const s = String(input);
      if (s.includes('T')) {
        const datePart = s.split('T')[0];
        const [year, month, day] = datePart.split('-');
        return `${day}-${month}-${year}`;
      }
      if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
        const [year, month, day] = s.split('-');
        return `${day}-${month}-${year}`;
      }
      return s;
    } catch {
      return String(input);
    }
  };

  // Derived form validity for enabling the Send Quote button
  const canSend = (() => {
    if (!requirement) return false;
    const qtyNum = Number(String(availableQuantity).replace(/[^0-9.]/g, ''));
    const reqQty = Number(String(requirement.quantity).replace(/[^0-9.]/g, '')) || 0;
    const minQty = Number(String(requirement.minQty).replace(/[^0-9.]/g, '')) || 0;
    const priceNum = Number(String(merchantPrice).replace(/[^0-9.]/g, ''));

    const qtyValid = !!availableQuantity && !isNaN(qtyNum) && qtyNum >= minQty && qtyNum <= reqQty && !quantityError;
    const priceValid = !!merchantPrice && !isNaN(priceNum) && priceNum > 0 && !priceError;
    return qtyValid && priceValid;
  })();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle size={20} className="text-green-500" />;
      case 'draft':
        return <Clock size={20} className="text-gray-500" />;
      case 'expired':
        return <Clock size={20} className="text-red-500" />;
      case 'closed':
        return <AlertTriangle size={20} className="text-orange-500" />;
      default:
        return <Clock size={20} className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'closed':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Load requirement with quotes
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const view = role === 'processor' ? 'merchant' : 'buyer';
        const data: any = await apiFetch(`/api/quotes/with-requirement/${id}?view=${view}`);
        const root = data?.data ?? data;
        if (!root) throw new Error('Requirement not found');
        const item = root.requirement ?? root.Requirement ?? root.req ?? root.Req ?? root;
        const quotes = (root.quotes ?? root.Quotes ?? []) as any[];

        const nid = String(item?.id ?? item?._id ?? item?.ID ?? id);
        const grade = item?.grade || item?.productGrade || item?.product?.grade || 'W320';
        const quantity = String(item?.requiredqty ?? item?.qty ?? item?.totalQuantity ?? item?.quantity ?? '0');
        const minQty = Number(item?.minimumqty ?? item?.minQty ?? 0);
        const origin = (item?.origin || item?.preferredOrigin || item?.source || 'any')?.toString?.() ?? 'any';
        const expectedPrice = Number(item?.expectedprice ?? item?.price ?? item?.expected_price ?? item?.expectedPrice ?? 0);
        const deliveryLocation = item?.deliveryLocation || item?.location || '';
        const deliveryDeadline = item?.deliveryDeadline || item?.deliverydate || item?.requirementExpiry || '';
        const status = (item?.status || 'active').toString();
        const createdAt = item?.createdAt || item?.created_at || new Date().toISOString();

        const normalized = {
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
        } as any;

        const mappedResponses = (quotes || []).map((q: any) => {
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

        if (mounted) {
          setRequirement(normalized);
          setResponses(mappedResponses);
        }
      } catch (e: any) {
        console.error('Failed to fetch requirement:', e);
        if (mounted) setError(e?.message || 'Failed to load requirement');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9.,]/g, '');
    const normalized = raw.replace(/,/g, '');
    const [intPart = '', decPart] = normalized.split('.');
    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const formatted = decPart !== undefined ? `${formattedInt}.${decPart}` : formattedInt;
    setMerchantPrice(formatted);

    const numericValue = parseFloat(normalized || '0');
    if (requirement && !isNaN(numericValue) && numericValue < Number(requirement.expectedPrice)) {
      setPriceError(`Price cannot be lower than expected price ₹${Number(requirement.expectedPrice).toLocaleString()}`);
    } else {
      setPriceError('');
    }
  };

  const validateQuantity = (val: string) => {
    if (!requirement) return false;
    const requiredQty = Number(String(requirement.quantity).replace(/[^0-9.]/g, '')) || 0;
    const minQty = Number(String(requirement.minQty).replace(/[^0-9.]/g, '')) || 0;
    const availableQty = Number(String(val).replace(/,/g, ''));
    if (!val) {
      setQuantityError('Quantity is required');
      return false;
    }
    if (isNaN(availableQty)) {
      setQuantityError('Please enter a valid quantity');
      return false;
    }
    if (availableQty < minQty) {
      setQuantityError(`Available quantity cannot be less than minimum quantity (${minQty}kg)`);
      return false;
    }
    if (availableQty > requiredQty) {
      setQuantityError(`Available quantity cannot be more than required quantity (${requiredQty}kg)`);
      return false;
    }
    setQuantityError('');
    return true;
  };

  const handleSubmitQuote = async () => {
    if (!requirement) return;

    if (!merchantPrice || !availableQuantity) {
      toast({ title: 'Error', description: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }
    if (!validateQuantity(availableQuantity) || !!priceError) {
      return;
    }

    const qty = Number(String(availableQuantity).replace(/[^0-9.]/g, ''));
    const price = Number(String(merchantPrice).replace(/[^0-9.]/g, ''));

    try {
      await apiFetch(`/api/quotes/send/${requirement.id}`,
        {
          method: 'POST',
          body: JSON.stringify({
            supplyQtyKg: Math.round(qty),
            priceINR: price,
            remarks: remarks || '',
          }) as any,
        }
      );
      toast({ title: 'Quote sent', description: 'Your quote has been submitted successfully.' });
      // Mark requirement as responded
      try {
        await updateRequirementStatus(String(requirement.id), 'responded');
        setRequirement(prev => prev ? { ...prev, status: 'responded' } : prev);
      } catch (_) { /* ignore status update error */ }
      // Refresh list
      try {
        const { role } = useRole.getState();
        const view = role === 'processor' ? 'merchant' : 'buyer';
        const data: any = await apiFetch(`/api/quotes/with-requirement/${requirement.id}?view=${view}`);
        const root = data?.data ?? data;
        const quotes = (root?.quotes ?? root?.Quotes ?? []) as any[];
        const mapped = (quotes || []).map((q: any) => ({
          id: String(q?.id ?? q?._id ?? q?.ID ?? q?.quoteId ?? ''),
          merchantId: q?.merchantId ?? q?.MerchantID ?? q?.merchantID ?? '',
          merchantName: q?.merchantCompanyName || q?.merchantId || 'Merchant',
          merchantLocation: q?.officeAddress || '-',
          price: q?.priceINR ? `₹${Number(q?.priceINR).toLocaleString()}/kg` : '',
          quantity: q?.supplyQtyKg ? `${q?.supplyQtyKg} kg` : '',
          origin: q?.origin || '',
          grade: q?.grade || '',
          deliveryTime: q?.deliveryTime || '',
          contact: q?.contact || '',
          message: q?.remarks ?? q?.Remarks ?? '',
          certifications: q?.certifications || [],
          responseDate: q?.createdAt ?? new Date().toISOString(),
          status: (q?.status || 'new').toString(),
        }));
        setResponses(mapped);
      } catch {
        // ignore refresh error
      }
      setAvailableQuantity('');
      setMerchantPrice('');
      setRemarks('');
    } catch (apiErr) {
      // Fallback to local store to preserve UX
      const merchantName = profile?.name || user?.fullName || 'Merchant';
      const merchantLocation = profile?.city || 'Location not specified';
      addResponse({
        requirementId: String(requirement.id),
        merchantId: user?.id || 'unknown',
        merchantName,
        merchantLocation,
        price: merchantPrice,
        responseDate: new Date().toISOString(),
        status: 'new',
        grade: requirement?.grade || '',
        quantity: `${availableQuantity} kg`,
        origin: requirement?.preferredOrigin || '',
        certifications: [],
        deliveryTime: 'TBD',
        contact: '',
        message: remarks,
        remarks: remarks,
        productName: requirement?.title || '',
      } as any);
      setResponses(prev => [
        ...prev,
        {
          id: String(Date.now()),
          merchantId: user?.id || 'unknown',
          merchantName,
          merchantLocation,
          price: `₹${Number(String(merchantPrice).replace(/[^0-9.]/g, '') || '0').toLocaleString()}/kg`,
          quantity: `${Number(String(availableQuantity).replace(/[^0-9.]/g, '') || '0')} kg`,
          origin: requirement?.preferredOrigin || '',
          grade: requirement?.grade || '',
          deliveryTime: 'TBD',
          contact: '',
          message: remarks,
          certifications: [],
          responseDate: new Date().toISOString(),
          status: 'new',
        }
      ]);
      toast({ title: 'Saved locally', description: 'Quote saved locally due to network/server issue.' });
      // Also update requirement status locally and attempt to mark as responded in store
      setRequirement(prev => prev ? { ...prev, status: 'responded' } : prev);
      try { await updateRequirementStatus(String(requirement.id), 'responded'); } catch (_) { /* ignore */ }
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} className="mr-2" />
            Back to Enquiries
          </Button>
        </div>
        <Card className="p-10 text-center">
          <h1 className="text-xl font-semibold text-foreground mb-2">Loading enquiry...</h1>
        </Card>
      </div>
    );
  }

  if (error || !requirement) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} className="mr-2" />
            Back to Enquiries
          </Button>
        </div>
        <Card className="p-10 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Enquiry Not Found</h1>
          <p className="text-muted-foreground mb-4">{error || "The enquiry you're looking for doesn't exist or has been deleted."}</p>
          <Button onClick={() => navigate('/merchant/enquiries')}>Back to Enquiries</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} className="mr-2" />
          Back to Enquiries
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Enquiry Details</h1>
          <p className="text-muted-foreground">Requirement #{requirement.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Enquiry Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{requirement.title}</CardTitle>
                  <p className="text-muted-foreground mt-1">Grade: {requirement.grade}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(requirement.status)}
                  <Badge className={getStatusColor(requirement.status)}>
                    {requirement.status.charAt(0).toUpperCase() + requirement.status.slice(1)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Package size={16} className="text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Required Quantity</div>
                    <div className="font-medium">{Number(requirement.quantity).toLocaleString()}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <ShoppingCart size={16} className="text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Minimum Quantity</div>
                    <div className="font-medium">{requirement.minQty}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign size={16} className="text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Expected Price</div>
                    <div className="font-medium">{requirement.budgetRange}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin size={16} className="text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Preferred Origin</div>
                    <div className="font-medium">
                      {requirement.preferredOrigin?.[0].toUpperCase() + requirement.preferredOrigin?.slice(1)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar size={16} className="text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Delivery Deadline</div>
                    <div className="font-medium">{formatDateExact(requirement.requirementExpiry)}</div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <div className="text-sm text-muted-foreground mb-1">Delivery Location</div>
                <div className="font-medium">{requirement.deliveryLocation}</div>
              </div>
            </CardContent>
          </Card>

          {/* View Details & Take Action (Send Quote) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">View Details & Take Action</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Supply Quantity (kg) *</Label>
                  <Input
                    value={availableQuantity}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^0-9.,]/g, '');
                      const normalized = raw.replace(/,/g, '');
                      const [intPart, decPart] = normalized.split('.');
                      const formattedInt = intPart ? intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '';
                      const formatted = decPart !== undefined ? `${formattedInt}.${decPart}` : formattedInt;
                      setAvailableQuantity(formatted);
                      validateQuantity(normalized);
                    }}
                    placeholder={`Min: ${requirement.minQty}, Max: ${requirement.quantity}`}
                    className={quantityError ? 'border-red-500' : ''}
                  />
                  {quantityError && <p className="text-sm text-red-500 mt-1">{quantityError}</p>}
                </div>
                <div>
                  <Label className="text-sm font-medium">Your Price (₹) *</Label>
                  <Input
                    value={merchantPrice}
                    onChange={handlePriceChange}
                    placeholder="Enter your price per kg"
                    className={priceError ? 'border-red-500' : ''}
                  />
                  {priceError && <p className="text-sm text-red-500 mt-1">{priceError}</p>}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium" htmlFor="remarks">Remarks</Label>
                <Textarea id="remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={3} />
              </div>
              <div className="flex gap-2">
                <Button className="flex-1" onClick={handleSubmitQuote} disabled={!canSend}>Send Quote</Button>
                <Button variant="ghost" onClick={() => { setAvailableQuantity(''); setMerchantPrice(''); setRemarks(''); }}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - All Responses */}
        <div className="space-y-6">
          <Card className="h-[743px] flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <MessageSquare size={18} className="mr-2" />
                My Responses ({responses.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[40rem] overflow-y-auto pr-2">
                {responses.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No responses yet.</div>
                ) : (
                  responses.map((response) => (
                    <Card key={response.id} className="p-3 border transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{response.merchantName}</div>
                          <div className="text-sm text-muted-foreground flex items-center">
                            <MapPin size={12} className="mr-1" />
                            {response.merchantLocation}
                          </div>
                          {response.price && (
                            <div className="text-sm text-primary font-medium">Merchant Price: {response.price}</div>
                          )}
                          {response.quantity && (
                            <div className="text-sm text-muted-foreground">Available: {response.quantity}</div>
                          )}
                          {response.message && (
                            <div className="text-sm text-muted-foreground mt-1">Remarks: {response.message}</div>
                          )}
                        </div>
                        <div className="text-right">
                          <Badge className="text-xs capitalize">
                            {response.status}
                          </Badge>
                          <div className="text-xs text-muted-foreground mt-1">
                            {new Date(response.responseDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EnquiryDetails;