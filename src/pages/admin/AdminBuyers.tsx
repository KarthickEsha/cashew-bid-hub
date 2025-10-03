import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AdminBuyers = () => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Buyer List</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Coming soon: searchable, pageable buyer list.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminBuyers;
