import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, MessageSquare, Users, FileText } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useInventory } from "@/hooks/useInventory";
import { useProfile } from "@/hooks/useProfile";
import { useUser } from "@clerk/clerk-react";
import { useRequirements } from "@/hooks/useRequirements";
import { useResponses } from "@/hooks/useResponses";
import ProductTypeToggle from "@/components/ProductTypeToggle";
import { useState, useMemo, useEffect } from "react";
import { ProductType } from "@/types/user";
import { apiFetch } from "@/lib/api";

const MerchantDashboard = () => {
  const { getProductStats } = useInventory();
  const { profile } = useProfile();
  const { user } = useUser();
  const [merchant, setMerchant] = useState<{
      id: string;
      name: string;
      rating?: number;
      totalOrders?: number;
      location: string | Location;
      verified?: boolean;
      responseTime?: string;
      phone?: string;
      email?: string;
      website?: string;
      description?: string;
    } | null>(null);
  const { responses } = useResponses();
  const { getRequirementsAsEnquiries } = useRequirements();
  const { getResponsesByRequirementId, getSubmittedQuotesCount } = useResponses();
  const stats = getProductStats();
  const navigate = useNavigate();

  // Backend dashboard state
  const [dashCards, setDashCards] = useState<any | null>(null);
  const [dashLists, setDashLists] = useState<any | null>(null);
  const [loadingDash, setLoadingDash] = useState(false);
  const [errorDash, setErrorDash] = useState<string | null>(null);

  // Persisted stock counts (shared with MerchantSidebar and written by MerchantProducts)
  type StatusCounts = { active: number; out_of_stock: number };
  const STOCK_COUNTS_KEY = "stocks_counts_v1";
  const [stockCounts, setStockCounts] = useState<Record<string, StatusCounts>>({});

  // Get count of submitted quotes for the current merchant
  const submittedQuotesCount = useMemo(() => {
    return user?.id ? getSubmittedQuotesCount(user.id) : 0;
  }, [user?.id, getSubmittedQuotesCount]);

  // Calculate new enquiries count based on responses
 const newEnquiriesCount = getRequirementsAsEnquiries().filter(enquiry => {
    const expiryDate = new Date(enquiry.deliveryDeadline || 0);
    const now = new Date();
    return expiryDate > now && enquiry.status === 'active' || enquiry.status === 'responded' || enquiry.status === 'selected' || enquiry.status === 'viewed';
  }).length;
  // Filter out skipped responses and get counts
  const activeResponses = responses.filter(r => r.status !== 'skipped');
  const selectedResponses = activeResponses.filter(r => r.status === 'accepted');
  // State for product type toggle (only for "Both" users)
  const getInitialProductType = (): ProductType => {
    if (profile?.productType === 'Both') {
      return 'RCN';
    }
    return profile?.productType || 'RCN';
  };

  const [currentProductType, setCurrentProductType] = useState<ProductType>(getInitialProductType());

  // Read counts from localStorage initially and keep in sync with events
  useEffect(() => {
    const readCounts = () => {
      try {
        const raw = localStorage.getItem(STOCK_COUNTS_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (parsed?.counts) setStockCounts(parsed.counts);
      } catch { /* ignore */ }
    };

    readCounts();
    const onStocksChanged = () => readCounts();
    window.addEventListener('stocks:changed', onStocksChanged as EventListener);
    const onStorage = (e: StorageEvent) => {
      if (e.key === STOCK_COUNTS_KEY) readCounts();
    };
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('stocks:changed', onStocksChanged as EventListener);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  // Fetch protected merchant dashboard
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingDash(true);
        setErrorDash(null);
        const data = await apiFetch("/api/users/merchant-dashboard");
        if (!mounted) return;
        setDashCards((data as any)?.data?.cards ?? null);
        setDashLists((data as any)?.lists ?? null);
      } catch (e: any) {
        if (!mounted) return;
        setErrorDash(e?.message || "Failed to load dashboard");
      } finally {
        if (mounted) setLoadingDash(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Ensure counts exist for the currently selected type; if missing, fetch and persist
  useEffect(() => {
    const ensureCountsForType = async (type: ProductType) => {
      const hasCounts = stockCounts[type]?.active !== undefined || stockCounts[type]?.out_of_stock !== undefined;
      if (hasCounts) return;
      try {
        const role = String(profile?.role || '').toLowerCase();
        const view = role === 'processor' ? 'merchant' : 'buyer';
        const baseUrl = `/api/stocks/get-all-stocks?type=${encodeURIComponent(type)}&view=${view}`;
        const url = role === 'processor' && profile?.id ? `${baseUrl}&userId=${encodeURIComponent(profile.id)}` : baseUrl;
        const resp = await apiFetch(url, { method: 'GET' });
        const items = Array.isArray(resp?.data) ? resp.data : [];
        // Compute counts by status; "active" if availableqty > 0 else "out_of_stock"
        const mapped = items.map((s: any) => ({
          status: (Number(s?.availableqty ?? 0) > 0) ? 'active' : 'out_of_stock',
          type: s?.type,
        })).filter(p => p.type === type);
        const counts: StatusCounts = {
          active: mapped.filter(p => p.status === 'active').length,
          out_of_stock: mapped.filter(p => p.status === 'out_of_stock').length,
        };
        // Merge and persist to localStorage using the shared schema
        let existing: any = undefined;
        try {
          const raw = localStorage.getItem(STOCK_COUNTS_KEY);
          existing = raw ? JSON.parse(raw) : undefined;
        } catch { /* ignore */ }
        const prevCounts = existing?.counts || {};
        const merged = { counts: { ...prevCounts, [type]: counts }, updatedAt: Date.now() };
        localStorage.setItem(STOCK_COUNTS_KEY, JSON.stringify(merged));
        setStockCounts(merged.counts);
        // notify listeners (e.g., sidebar)
        window.dispatchEvent(new CustomEvent('stocks:changed'));
      } catch {
        // ignore errors on dashboard; fallback UI below will use inventory store
      }
    };
    ensureCountsForType(currentProductType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProductType]);

  // Calculate display stats based on current type using persisted API-backed counts
  const getDisplayStats = () => {
    const typeKey = profile?.productType === 'Both' ? currentProductType : (profile?.productType || 'RCN');
    const persisted = stockCounts[typeKey];
    // Total stocks for the selected type = active + out_of_stock
    const totalFromPersisted = persisted ? (persisted.active + persisted.out_of_stock) : undefined;
    if (typeKey === 'RCN') {
      return {
        products: totalFromPersisted ?? stats.rcnProducts,
        stock: stats.totalStock.rcn,
      };
    } else {
      return {
        products: totalFromPersisted ?? stats.kernelProducts,
        stock: stats.totalStock.kernel,
      };
    }
  };

  const displayStats = getDisplayStats();

  // Calculate confirmed enquiries count (enquiries with at least one accepted response)
  const confirmedEnquiriesCount = useMemo(() => {
    const enquiries = getRequirementsAsEnquiries();
    return enquiries.filter(enquiry => {
      const responses = getResponsesByRequirementId(enquiry.id);
      return responses.some(r => r.status === 'accepted');
    }).length;
  }, [getRequirementsAsEnquiries, getResponsesByRequirementId]);

  const mockStats = {
    totalEnquiries: 12,
    newCustomers: selectedResponses.length
  };

  const mockRecentActivity = [
    { id: 1, type: "order", message: "New order received for Premium Cashews W240", time: "2 hours ago" },
    { id: 2, type: "enquiry", message: "Customer enquiry about W320 grade pricing", time: "4 hours ago" },
    { id: 3, type: "product", message: "Low stock alert for W180 Cashews", time: "6 hours ago" },
    { id: 4, type: "order", message: "Order #ORD-123 marked as shipped", time: "1 day ago" },
  ];

  // Build recent activity from backend myQuotes; fallback to mock
  const recentActivity = Array.isArray(dashLists?.myQuotes)
    ? [...dashLists.myQuotes]
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .map((q: any) => ({
          id: q.id,
          type: "quote",
          message: `Quote submitted for Grade ${q.grade} • ${q.quantity} kg`,
          time: new Date(q.createdAt).toLocaleString(),
          status: q.status,
        }))
    : mockRecentActivity;
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage your cashew business and track performance
          </p>
        </div>
        {/* <RoleSwitcher /> */}
      </div>

      {/* Product Type Toggle */}
      <ProductTypeToggle
        currentType={currentProductType}
        onTypeChange={setCurrentProductType}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1 - New Enquiry */}
        <Card
          onClick={() => navigate("/merchant/enquiries")}
          className="cursor-pointer hover:shadow-md transition"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">New Enquiries</CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{dashCards?.newEnquiries?.count ?? (getRequirementsAsEnquiries().filter(enquiry => {
              const expiryDate = new Date(enquiry.deliveryDeadline || 0);
              const now = new Date();
              return expiryDate > now && enquiry.status === 'active' || enquiry.status === 'responded' || enquiry.status === 'selected' || enquiry.status === 'viewed';
            }).length)}</div>
            <p className="text-xs text-muted-foreground">Requiring response</p>
        </CardContent>
      </Card>

        {/* Card 2 - Quote Submitted */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Quote Submitted</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{dashCards?.quoteSubmitted?.count ?? (getRequirementsAsEnquiries().filter(enquiry => {
              const expiryDate = new Date(enquiry.deliveryDeadline || 0);
              const now = new Date();
              return expiryDate > now && enquiry.status === 'active' || enquiry.status === 'responded' || enquiry.status === 'selected' || enquiry.status === 'viewed';
            }).length)}</div>
            <p className="text-xs text-muted-foreground">Awaiting response</p>
        </CardContent>
      </Card>

        {/* Card 3 - My Product */}
        <Link to="/merchant/products">
          <Card className="cursor-pointer hover:shadow-md transition">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                My Stocks
                {/* My {profile?.productType} Products */}
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashCards?.myStocks?.count ?? displayStats.products}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">{dashCards?.myStocks?.count ?? displayStats.products}</span> published stock
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Card 4 - New Customer */}
        <Link to="/merchant/confirmed-orders">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirm Enquiries</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashCards?.confirmedEnquiries?.count ?? confirmedEnquiriesCount}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        </Link>
      </div>


      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates on your business</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity: any) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.message}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
                <Badge variant="outline" className="text-xs capitalize">
                   {(activity.status || activity.type).toString().charAt(0).toUpperCase() + (activity.status || activity.type).toString().slice(1)}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MerchantDashboard;