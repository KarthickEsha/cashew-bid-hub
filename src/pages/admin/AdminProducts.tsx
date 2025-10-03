import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AdminProducts = () => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Product List</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Coming soon: product management with filters and pagination.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminProducts;
