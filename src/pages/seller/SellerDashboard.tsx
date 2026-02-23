import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, DollarSign, ShoppingCart, Plus, ArrowLeft, TrendingUp } from "lucide-react";

const SellerDashboard = () => {
  const { user, roles } = useAuth();
  const navigate = useNavigate();
  const isSeller = roles.includes("seller");

  const { data: stats } = useQuery({
    queryKey: ["seller-stats", user?.id],
    queryFn: async () => {
      const [products, orders] = await Promise.all([
        supabase.from("products").select("id, price, sales_count", { count: "exact" }).eq("seller_id", user!.id),
        supabase.from("order_items").select("id, unit_price, quantity").eq("seller_id", user!.id),
      ]);
      const totalRevenue = (orders.data ?? []).reduce((sum: number, oi: any) => sum + oi.unit_price * oi.quantity, 0);
      return {
        productCount: products.count ?? 0,
        orderCount: orders.data?.length ?? 0,
        revenue: totalRevenue,
      };
    },
    enabled: !!user && isSeller,
  });

  if (!isSeller) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <p className="text-muted-foreground">You need a seller account to access this page.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 flex items-center justify-between bg-card px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <Link to="/profile"><ArrowLeft className="h-5 w-5" /></Link>
          <h1 className="text-lg font-bold">Seller Dashboard</h1>
        </div>
        <Button size="sm" onClick={() => navigate("/seller/products/new")}>
          <Plus className="mr-1 h-4 w-4" /> Add Product
        </Button>
      </header>

      <div className="grid grid-cols-3 gap-3 p-4">
        <Card>
          <CardContent className="flex flex-col items-center p-4">
            <Package className="h-6 w-6 text-primary mb-1" />
            <p className="text-2xl font-bold">{stats?.productCount ?? 0}</p>
            <p className="text-xs text-muted-foreground">Products</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center p-4">
            <ShoppingCart className="h-6 w-6 text-secondary mb-1" />
            <p className="text-2xl font-bold">{stats?.orderCount ?? 0}</p>
            <p className="text-xs text-muted-foreground">Orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center p-4">
            <DollarSign className="h-6 w-6 text-success mb-1" />
            <p className="text-2xl font-bold">${stats?.revenue?.toFixed(0) ?? 0}</p>
            <p className="text-xs text-muted-foreground">Revenue</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-2 px-4">
        <Link to="/seller/products" className="flex items-center gap-3 rounded-xl bg-card p-4 shadow-sm">
          <Package className="h-5 w-5 text-muted-foreground" />
          <span className="flex-1 font-medium">Manage Products</span>
        </Link>
        <Link to="/seller/orders" className="flex items-center gap-3 rounded-xl bg-card p-4 shadow-sm">
          <ShoppingCart className="h-5 w-5 text-muted-foreground" />
          <span className="flex-1 font-medium">Manage Orders</span>
        </Link>
      </div>
    </div>
  );
};

export default SellerDashboard;
