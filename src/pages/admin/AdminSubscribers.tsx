import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AdminSubscribers = () => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Subscribers</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Coming soon: list of newsletter/plan subscribers.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSubscribers;
