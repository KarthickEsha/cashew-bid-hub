import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import React from "react";
import { ArrowLeft, Mail, MapPin, Phone, Package } from "lucide-react";
import { useRequirements } from "@/hooks/useRequirements";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { XAxis, YAxis, CartesianGrid, AreaChart, Area, ResponsiveContainer } from "recharts";

interface Buyer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
}

const AdminBuyerDetails: React.FC = () => {
  const navigate = useNavigate();
  const { buyerId } = useParams();
  const location = useLocation() as { state?: { buyer?: Buyer } };
  const buyerFromState = location.state?.buyer;

  // Resolve buyer from navigation state first; otherwise minimal fallback from URL id
  const buyer = React.useMemo<Buyer | undefined>(() => {
    if (buyerFromState) return buyerFromState;
    if (buyerId) {
      return { id: buyerId, name: buyerId, email: "N/A" } as Buyer;
    }
    return undefined;
  }, [buyerFromState, buyerId]);

  const { getMyRequirements } = useRequirements();
  const allReqs = getMyRequirements();

  // Heuristic: match requirements by customerName === buyer.name
  const buyerRequirements = React.useMemo(() => {
    if (!buyer?.name) return [] as typeof allReqs;
    return allReqs.filter((r) => (r as any).customerName ? (r as any).customerName === buyer.name : true);
  }, [allReqs, buyer?.name]);

  // Build simple monthly series from createdDate
  const chartData = React.useMemo(() => {
    const map = new Map<string, number>();
    buyerRequirements.forEach((r) => {
      const d = new Date(r.createdDate || r.createdAt || Date.now());
      const key = d.toLocaleString("en-US", { month: "short" });
      map.set(key, (map.get(key) || 0) + 1);
    });
    const order = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return order.map((m) => ({ label: m, count: map.get(m) || 0 }));
  }, [buyerRequirements]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <div className="text-xl font-semibold">Buyer Details</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Buyer Info */}
        <Card>
          <CardHeader>
            <CardTitle>{buyer?.name || "Buyer"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Email</div>
                  <div className="font-medium break-all">{buyer?.email || "—"}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Phone</div>
                  <div className="font-medium">{buyer?.phone || "—"}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Location</div>
                  <div className="font-medium">{buyer?.location || "—"}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Requirements Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Requirements Posted (by month)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{ count: { label: "Requirements", color: "hsl(var(--chart-1))" } }} className="w-full h-[320px]">
              <ResponsiveContainer>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="reqGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-count)" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="var(--color-count)" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="count" stroke="var(--color-count)" fill="url(#reqGradient)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Requirements List */}
      <Card>
        <CardHeader>
          <CardTitle>
            <span className="inline-flex items-center gap-2"><Package className="h-5 w-5" /> Buyer Requirements ({buyerRequirements.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {buyerRequirements.length === 0 ? (
            <div className="text-sm text-muted-foreground">No requirements found for this buyer.</div>
          ) : (
            <div className="space-y-3">
              {buyerRequirements.map((r) => (
                <div key={r.id} className="border rounded-md p-3">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{r.title || `${r.quantity} of ${r.grade}`}</div>
                    <div className="text-xs text-muted-foreground">{r.createdDate?.toString().slice(0, 10) || ""}</div>
                  </div>
                  <div className="text-sm text-muted-foreground">Preferred Origin: <span className="font-medium text-foreground">{r.preferredOrigin || "—"}</span></div>
                  <div className="text-sm text-muted-foreground">Delivery: <span className="font-medium text-foreground">{r.deliveryLocation}</span></div>
                  <div className="text-xs text-muted-foreground">Status: <span className="capitalize">{r.status}</span> • Responses: {r.responsesCount ?? 0}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminBuyerDetails;
