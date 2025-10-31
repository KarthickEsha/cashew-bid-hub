import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  FileText,
  MessageSquare,
  ArrowRight,
  Eye,
  Calendar,
  Store
} from "lucide-react";
import cashewHero from "@/assets/cashew-hero.jpg";
import { Link, useNavigate } from "react-router-dom"; // ✅ import navigate
import { useRole } from "@/hooks/useRole";
import { useRequirements } from "@/hooks/useRequirements";
import { useOrders } from "@/hooks/useOrders";
import path from "path";
import { useResponses } from "@/hooks/useResponses";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { apiFetch } from "@/lib/api";
import { extractBackendUserId } from "@/lib/profile";
import { useProfile } from "@/hooks/useProfile";

const Dashboard = () => {
  const { t } = useTranslation();
  const { role, setRole } = useRole();
  const navigate = useNavigate();
  const { getMyRequirements } = useRequirements();
  const { orders } = useOrders();
  const [newResponseCount, setNewResponseCount] = useState(0);
  const { responses } = useResponses();
  const [showAllActivity, setShowAllActivity] = useState(false);
  const [dashCards, setDashCards] = useState<any | null>(null);
  const [dashLists, setDashLists] = useState<any | null>(null);
  const [loadingDash, setLoadingDash] = useState(false);
  const [errorDash, setErrorDash] = useState<string | null>(null);
  const [enquiriesCount, setEnquiriesCount] = useState<number>(0);
  const { profile } = useProfile();
  const [marketplaceCount, setMarketplaceCount] = useState<number>(0);

  // Fetch protected buyer dashboard
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingDash(true);
        setErrorDash(null);
        const userId = extractBackendUserId();
        const url = userId
          ? `/api/users/${encodeURIComponent(userId)}/buyer-dashboard`
          : "/api/users/buyer-dashboard"; // fallback if ID missing
        const data = await apiFetch(url);
        // expected shape: { status: 'success', data: { cards }, lists? }
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
    return () => {
      mounted = false;
    };
  }, []);

  // Fetch marketplace count for dashboard card
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const role = String(profile?.role || '').toLowerCase();
        const view = role === 'processor' ? 'merchant' : 'buyer';
        const userIdParam = role === 'processor' && profile?.id ? `&userId=${encodeURIComponent(profile.id)}` : '';
        const types = ['RCN', 'Kernel'];
        const results = await Promise.all(
          types.map(async (type) => {
            const url = `/api/stocks/get-all-stocks?type=${encodeURIComponent(type)}&view=${view}${userIdParam}`;
            const resp: any = await apiFetch(url, { method: 'GET' });
            const list: any[] = Array.isArray(resp?.data) ? resp.data : Array.isArray(resp) ? resp : [];
            // Count only items with positive available quantity when possible
            const count = list.filter((s: any) => Number(s?.availableqty ?? s?.quantity ?? 0) > 0).length;
            return count;
          })
        );
        if (!mounted) return;
        setMarketplaceCount(results.reduce((a, b) => a + b, 0));
      } catch {
        if (!mounted) return;
        setMarketplaceCount(0);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [profile?.role, profile?.id]);

  // Fetch buyer enquiries to compute myResponses count from enquiries endpoint
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // const res = await apiFetch("/api/stocks/enquiries?view=buyer");
        // if (!mounted) return;
        // // Try common response shapes: { data: [...] } | [...] | { records: [...] }
        // const list = Array.isArray((res as any)?.data)
        //   ? (res as any).data
        //   : Array.isArray(res)
        //   ? (res as any)
        //   : ((res as any)?.records ?? []);
        // setEnquiriesCount(Array.isArray(list) ? list.length : 0);
      } catch {
        if (!mounted) return;
        setEnquiriesCount(0);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Get dynamic data from requirements
  const requirements = getMyRequirements();
  const activeRequirements = requirements.filter(req => req.status === 'active').length;
  const draftRequirements = requirements.filter(req => req.status === 'draft').length;
  const totalResponses = responses.length
  // Get dynamic order counts
  const ordersCount = orders.filter(order => order.productId && order.productId.trim() !== '').length;
  const confirmedOrders = orders.filter(order => order.productId && order.productId.trim() !== '' && order.status === 'Confirmed').length;
  const pendingOrders = orders.filter(order => order.status === 'Processing').length;

  // Derive My Responses confirmed/pending aligning with API and table
  // Prefer backend-provided counts when available
  const backendMyRespConfirmed = (dashCards as any)?.myResponses?.confirmed;
  const backendMyRespPending = (dashCards as any)?.myResponses?.pending;

  // Derive from responses table/store: treat these statuses as pending-like
  const pendingLikeStatuses = new Set(['new', 'viewed', 'accepted', 'processing', 'pending']);
  const responsesConfirmed = responses.filter(r => String(r.status || '').toLowerCase() === 'confirmed').length;
  const responsesPending = responses.filter(r => pendingLikeStatuses.has(String(r.status || '').toLowerCase())).length;

  // Compose final counts: backend > derived-from-responses > fallback-to-orders
  const myResponsesConfirmed =
    typeof backendMyRespConfirmed === 'number'
      ? backendMyRespConfirmed
      : (responsesConfirmed || confirmedOrders);
  const myResponsesPending =
    typeof backendMyRespPending === 'number'
      ? backendMyRespPending
      : (responsesPending + pendingOrders);

  // Prefer backend-provided cards when available
  const myReqCard = dashCards?.myRequirements;
  const sellerRespCard = dashCards?.sellerResponses;
  const myRespCard = dashCards?.myResponses;
  const marketplaceCard = (dashCards as any)?.marketplace;

  const stats = [
    {
      title: t('dashboard.myRequirements'),
      value: (myReqCard?.count ?? requirements.length).toString(),
      icon: FileText,
      color: "text-blue-500",
      trend: t('dashboard.requirementsStats', { active: myReqCard?.active ?? activeRequirements, draft: myReqCard?.draft ?? draftRequirements }),
      path: "/my-requirements"
    },
    {
      title: t('dashboard.sellerResponses'),
      value: (sellerRespCard?.count ?? totalResponses).toString(),
      icon: MessageSquare,
      color: "text-green-500",
      trend: t('dashboard.fromRequirements', { count: sellerRespCard?.fromRequirements ?? requirements.length }),
      path: "/responses"
    },
    {
      title: t('dashboard.totalEnquiries'),
      // Use backend total when present, otherwise sum of confirmed + pending
      value: (myRespCard?.count ?? (myResponsesConfirmed + myResponsesPending)).toString(),
      icon: Clock,
      color: "text-orange-500",
      // Trend should reflect confirmed/pending aligned with API/table
      trend: t('dashboard.orderStats', { confirmed: myResponsesConfirmed, pending: myResponsesPending }),
      path: "/my-orders"
    },
    {
      title: 'Marketplace',
      value: (marketplaceCard?.count ?? marketplaceCount).toString(),
      icon: Store,
      color: "text-violet-500",
      trend: t('dashboard.browseMarketplace'),
      path: "/marketplace",
    }
  ];



  // Helper to convert timestamps to localized relative strings using i18n keys
  const relativeTime = (isoOrDate: string) => {
    try {
      const date = new Date(isoOrDate);
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);
      if (diffMins < 5) return t('dashboard.activity.recently');
      if (diffHours < 24) return t('dashboard.activity.hoursAgo', { count: diffHours || 1 });
      return t('dashboard.activity.daysAgo', { count: diffDays || 1 });
    } catch {
      return t('dashboard.activity.recently');
    }
  };

  // Build recent activity from backend lists when available
  const backendActivity = (() => {
    if (!dashLists) return [] as Array<any>;
    const items: Array<any> = [];
    const add = (arr: any[], makeMsg: (it: any) => { message: string; status?: string; createdAt?: string }) => {
      for (const it of arr) {
        const info = makeMsg(it);
        const createdAt = it.createdAt || info.createdAt || new Date().toISOString();
        items.push({
          type: 'backend',
          message: info.message,
          time: relativeTime(createdAt),
          status: (it.status || info.status || '').toString().toLowerCase(),
          createdAt,
        });
      }
    };
    if (Array.isArray(dashLists.myRequirements)) {
      add(dashLists.myRequirements, (it) => ({
        message: t('dashboard.activity.requirementPosted', { grade: it.grade, quantity: it.quantity }),
        status: it.status,
        createdAt: it.createdAt,
      }));
    }
    if (Array.isArray(dashLists.sellerResponses)) {
      add(dashLists.sellerResponses, (it) => ({
        message: t('dashboard.activity.supplierResponded'),
        status: it.status,
        createdAt: it.createdAt,
      }));
    }
    if (Array.isArray(dashLists.myResponses)) {
      add(dashLists.myResponses, (it) => ({
        message: t('dashboard.activity.orderPlaced', {
          type:
            it.productName ||
            (it.product && (it.product.name || it.product.title || it.product.label)) ||
            it.productTitle ||
            it.productLabel ||
            it.origin ||
            it.grade ||
            it.name ||
            it.title ||
            it.productId ||
            'Cashews',
          quantity: it.quantity
        }),
        status: it.status,
        createdAt: it.createdAt,
      }));
    }
    return items.sort((a, b) => new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime());
  })();

  // Fallback: Build recent activity from local state
  const recentOrders = [...orders]
    .filter(o => (o.productId ?? '').trim() !== '')
    .sort((a, b) => new Date(b.createdAt || b.orderDate).getTime() - new Date(a.createdAt || a.orderDate).getTime())
    .map(o => {
      const createdAt = o.createdAt || o.orderDate;
      return {
      type: 'order',
      message: t('dashboard.activity.orderPlaced', {
        type: o.productName || o.origin || 'Cashews',
        quantity: o.quantity
      }),
      time: relativeTime(createdAt),
      status: o.status,
      createdAt: createdAt
    }; 
    });

  const recentResponses = [...responses]
    .filter(r => r.status !== 'skipped')
    .sort((a, b) => new Date(b.createdAt || b.responseDate).getTime() - new Date(a.createdAt || a.responseDate).getTime())
    .map(r => {
      const createdAt = r.createdAt || r.responseDate;
      return {
      type: 'response',
      message: t('dashboard.activity.supplierResponded'),
      time: relativeTime(createdAt),
      status: r.status,
      createdAt: createdAt
    };
    });

  // Generate recent activity (prefer backend)
  const fallbackActivity = [
    ...requirements.map(req => {
      const createdAt = req.createdAt || req.createdDate || new Date().toISOString();
      return {
        type: 'requirement',
        message: t('dashboard.activity.requirementPosted', { grade: req.grade, quantity: req.quantity }),
        time: relativeTime(createdAt),
        status: req.status,
        createdAt: createdAt
      };
    }),
    ...recentOrders,
    ...recentResponses,
  ].sort((a, b) => new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime());

  const recentActivity = backendActivity.length ? backendActivity : fallbackActivity;

  // Limit activity items unless toggled to show all
  const displayedActivity = showAllActivity ? recentActivity : recentActivity.slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Hero Section */}
      <div className="relative rounded-xl overflow-hidden">
        <img
          src={cashewHero}
          alt="Premium Cashew Marketplace"
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary-dark/60 flex items-center">
          <div className="px-6 text-white">
            <h1 className="text-3xl font-bold mb-2">{t('dashboard.welcome')}</h1>
            <p className="text-lg opacity-90 mb-4">{t('dashboard.subtitle')}</p>
            <Link to="/marketplace">
              <Button size="lg" variant="secondary">
                {t('dashboard.browseMarketplace')}
                <ArrowRight size={16} className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={index}
              className="hover:shadow-warm transition-shadow cursor-pointer"
              onClick={() => navigate(stat.path)} // ✅ navigate on click
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <Icon size={20} className={stat.color} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.trend}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock size={20} className="mr-2" />
              {t('dashboard.recentActivity')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {displayedActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.message}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                      <Badge
                        variant={activity.status === 'confirmed' ? 'default' : 'secondary'}
                        className="text-xs capitalize"
                      >
                        {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* <div className="mt-4">
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => setShowAllActivity(prev => !prev)}
              >
                {showAllActivity ? 'Show Less' : t('dashboard.viewAllActivity')}
                <ArrowRight size={14} className="ml-2" />
              </Button>
            </div> */}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.quickActions')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/marketplace" className="block">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Eye size={16} className="mr-2" />
                {t('dashboard.browseProducts')}
              </Button>
            </Link>
            <Link to="/post-requirement" className="block">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <FileText size={16} className="mr-2" />
                {t('dashboard.postRequirement')}
              </Button>
            </Link>
            <Link to="/my-orders" className="block">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <MessageSquare size={16} className="mr-2" />
                {t('dashboard.viewMyOrders')}
              </Button>
            </Link>
            <Link to="/my-requirements" className="block">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Calendar size={16} className="mr-2" />
                {t('dashboard.manageRequirements')}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;