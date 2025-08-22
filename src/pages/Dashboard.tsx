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
import { Link } from "react-router-dom";

const Dashboard = () => {
  const stats = [
    {
      title: "Active Bids",
      value: "12",
      icon: TrendingUp,
      color: "text-primary",
      trend: "+3 from last week"
    },
    {
      title: "Pending Requests",
      value: "8",
      icon: Clock,
      color: "text-orange-500",
      trend: "2 new today"
    },
    {
      title: "My Requirements",
      value: "5",
      icon: FileText,
      color: "text-blue-500",
      trend: "1 expiring soon"
    },
    {
      title: "Total Orders",
      value: "47",
      icon: MessageSquare,
      color: "text-green-500",
      trend: "+12% this month"
    }
  ];

  const recentActivity = [
    {
      type: "bid",
      message: "Bid placed on Premium Grade W320 Cashews",
      time: "2 hours ago",
      status: "pending"
    },
    {
      type: "requirement",
      message: "New requirement posted: Vietnam Origin Cashews",
      time: "5 hours ago",
      status: "active"
    },
    {
      type: "response",
      message: "Merchant responded to your inquiry",
      time: "1 day ago",
      status: "new"
    },
    {
      type: "order",
      message: "Order confirmed for Grade SW240",
      time: "2 days ago",
      status: "confirmed"
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
            <h1 className="text-3xl font-bold mb-2">Welcome to Cashew Marketplace</h1>
            <p className="text-lg opacity-90 mb-4">Connect with premium cashew suppliers worldwide</p>
            <Link to="/marketplace">
              <Button size="lg" variant="secondary">
                Browse Marketplace
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
            <Card key={index} className="hover:shadow-warm transition-shadow">
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
              Recent Activity
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
                        className="text-xs"
                      >
                        {activity.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button variant="ghost" size="sm" className="w-full">
                View All Activity
                <ArrowRight size={14} className="ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/marketplace" className="block">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Eye size={16} className="mr-2" />
                Browse Products
              </Button>
            </Link>
            <Link to="/post-requirement" className="block">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <FileText size={16} className="mr-2" />
                Post Requirement
              </Button>
            </Link>
            <Link to="/my-requests" className="block">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <MessageSquare size={16} className="mr-2" />
                View My Requests
              </Button>
            </Link>
            <Link to="/my-requirements" className="block">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Calendar size={16} className="mr-2" />
                Manage Requirements
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;