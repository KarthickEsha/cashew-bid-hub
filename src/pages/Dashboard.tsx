import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Clock,
  FileText,
  MessageSquare,
  ArrowRight,
  Eye,
  Calendar
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

const Dashboard = () => {
  const { t } = useTranslation();
  const { role, setRole } = useRole();
  const navigate = useNavigate();
  const { getMyRequirements } = useRequirements();
  const { orders } = useOrders();
  const [newResponseCount, setNewResponseCount] = useState(0);
  const { responses } = useResponses();

  // Get dynamic data from requirements
  const requirements = getMyRequirements();
  const activeRequirements = requirements.filter(req => req.status === 'active').length;
  const draftRequirements = requirements.filter(req => req.status === 'draft').length;
  const totalResponses = newResponseCount

  // Get dynamic order counts
  const ordersCount = orders.filter(order => order.productId && order.productId.trim() !== '').length;
 const confirmedOrders = orders.filter(order => order.productId && order.productId.trim() !== '' && order.status === 'Confirmed').length;
  const pendingOrders = orders.filter(order => order.status === 'Processing').length;

  // Calculate total value (mock calculation - in real app this would come from orders)
  const totalValue = requirements.reduce((acc, req) => {
    const price = parseFloat(req.budgetRange?.replace(/[₹,]/g, '') || '0');
    const quantity = parseFloat(req.quantity?.replace(/[kg,]/g, '') || '0');
    return acc + (price * quantity / 1000); // Convert to tons for calculation
  }, 0);
  useEffect(() => {
    // Count new/unread responses
    const count = responses.length;
    setNewResponseCount(count);
  }, [responses]);
  const stats = [
    {
      title: t('dashboard.myRequirements'),
      value: requirements.length.toString(),
      icon: FileText,
      color: "text-blue-500",
      trend: t('dashboard.requirementsStats', { active: activeRequirements, draft: draftRequirements }),
      path: "/my-requirements"
    },
    {
      title: t('dashboard.sellerResponses'),
      value: totalResponses.toString(),
      icon: MessageSquare,
      color: "text-green-500",
      trend: t('dashboard.fromRequirements', { count: requirements.length }),
      path: "/responses"
    },
    {
      title: t('dashboard.totalEnquiries'),
      value: ordersCount.toString(),
      icon: Clock,
      color: "text-orange-500",
      trend: t('dashboard.orderStats', { confirmed: confirmedOrders, pending: pendingOrders }),
      path: "/my-orders"
    },
    {
      title: t('dashboard.totalValue'),
      value: `₹${(totalValue / 100000).toFixed(1)}L`,
      icon: TrendingUp,
      color: "text-primary",
      trend: t('dashboard.estimatedFromRequirements'),
    }
  ];

  // Generate recent activity based on requirements
  const recentActivity = [
    ...requirements.slice(0, 2).map(req => ({
      type: "requirement",
      message: t('dashboard.activity.requirementPosted', { grade: req.grade, quantity: req.quantity }),
      time: t('dashboard.activity.recently'),
      status: req.status
    })),
    {
      type: "order",
      message: t('dashboard.activity.orderPlaced', { type: 'Vietnam Origin Cashews', quantity: '1000kg' }),
      time: t('dashboard.activity.hoursAgo', { hours: 5 }),
      status: "pending"
    },
    {
      type: "response",
      message: t('dashboard.activity.supplierResponded'),
      time: t('dashboard.activity.daysAgo', { days: 1 }),
      status: "new"
    }
  ];

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
              {recentActivity.map((activity, index) => (
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
            <div className="mt-4">
              <Button variant="ghost" size="sm" className="w-full">
                {t('dashboard.viewAllActivity')}
                <ArrowRight size={14} className="ml-2" />
              </Button>
            </div>
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