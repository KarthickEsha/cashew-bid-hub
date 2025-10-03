import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { XAxis, YAxis, CartesianGrid, AreaChart, Area, ResponsiveContainer } from "recharts";
import { merchants, products } from "@/data/mockdata";
import { Users, Store, Package, Bell } from "lucide-react";
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Fallback simple counts (replace with real API integration later)
const buyersCount = 42;
const merchantsCount = Array.isArray(merchants) ? merchants.length : 0;
const productsCount = Array.isArray(products) ? products.length : 0;
const subscribersCount = 18; // TODO: replace with real subscribers data

// Monthly revenue/subscribers for the spline chart
const revenueData = [
  { label: "Jan", revenue: 12000, subscribers: 80 },
  { label: "Feb", revenue: 13500, subscribers: 90 },
  { label: "Mar", revenue: 15600, subscribers: 110 },
  { label: "Apr", revenue: 14800, subscribers: 105 },
  { label: "May", revenue: 17200, subscribers: 130 },
  { label: "Jun", revenue: 19500, subscribers: 150 },
  { label: "Jul", revenue: 18800, subscribers: 145 },
  { label: "Aug", revenue: 20500, subscribers: 160 },
  { label: "Sep", revenue: 21200, subscribers: 170 },
  { label: "Oct", revenue: 22800, subscribers: 180 },
  { label: "Nov", revenue: 24000, subscribers: 190 },
  { label: "Dec", revenue: 25500, subscribers: 200 },
];

// Recent subscribers mock list for dashboard table
const recentSubscribers = [
  { id: "sub-1", name: "Aarav Gupta", email: "aarav@example.com", date: "2024-09-28", status: "active" },
  { id: "sub-2", name: "Priya Sharma", email: "priya@example.com", date: "2024-09-27", status: "active" },
  { id: "sub-3", name: "Rahul Verma", email: "rahul@example.com", date: "2024-09-25", status: "pending" },
  { id: "sub-4", name: "Sneha Iyer", email: "sneha@example.com", date: "2024-09-23", status: "inactive" },
];

const chartConfig = {
  revenue: { label: "Revenue", color: "hsl(var(--chart-1))" },
  subscribers: { label: "Subscribers", color: "hsl(var(--chart-2))" },
} as const;

const KPI = ({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <KPI title="Total Buyers" value={buyersCount} icon={<Users className="h-4 w-4 text-muted-foreground" />} />
        <KPI title="Total Merchants" value={merchantsCount} icon={<Store className="h-4 w-4 text-muted-foreground" />} />
        <KPI title="Active Stocks" value={productsCount} icon={<Package className="h-4 w-4 text-muted-foreground" />} />
        <KPI title="Active Subscribers" value={subscribersCount} icon={<Bell className="h-4 w-4 text-muted-foreground" />} />
      </div>

      {/* Two-column layout: left table, right chart modal trigger */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        {/* Left: Recent Subscribers table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Subscribers</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentSubscribers.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>{s.email}</TableCell>
                    <TableCell>{s.date}</TableCell>
                    <TableCell className="capitalize">{s.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Right: Double-colored wave (area spline) for Revenue vs Subscribers */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue & Subscribers</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="w-full h-[360px]">
              <ResponsiveContainer>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="subscribersGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-subscribers)" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="var(--color-subscribers)" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="revenue" stroke="var(--color-revenue)" fill="url(#revenueGradient)" strokeWidth={2} />
                  <Area type="monotone" dataKey="subscribers" stroke="var(--color-subscribers)" fill="url(#subscribersGradient)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AdminDashboard;
