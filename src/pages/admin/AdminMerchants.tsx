import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AdminMerchants = () => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Merchant List</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Coming soon: searchable, pageable merchant list.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminMerchants;
