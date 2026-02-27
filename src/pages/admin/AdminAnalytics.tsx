import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { ArrowLeft, TrendingUp, Users, Package, DollarSign, ShoppingCart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AdminAnalytics = () => {
  const { roles } = useAuth();
  const isAdmin = roles.includes("admin");

  const { data: stats } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: async () => {
      const [profiles, products, orders, sellers, reviews] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("total, status"),
        supabase.from("user_roles").select("*", { count: "exact", head: true }).eq("role", "seller"),
        supabase.from("reviews").select("*", { count: "exact", head: true }),
      ]);
      const orderData = orders.data ?? [];
      const totalRevenue = orderData.reduce((s: number, o: any) => s + Number(o.total), 0);
      const delivered = orderData.filter((o: any) => o.status === "delivered").length;
      const pending = orderData.filter((o: any) => o.status === "pending").length;

      return {
        totalUsers: profiles.count ?? 0,
        totalProducts: products.count ?? 0,
        totalOrders: orderData.length,
        totalRevenue,
        totalSellers: sellers.count ?? 0,
        totalReviews: reviews.count ?? 0,
        deliveredOrders: delivered,
        pendingOrders: pending,
        avgOrderValue: orderData.length > 0 ? totalRevenue / orderData.length : 0,
      };
    },
    enabled: isAdmin,
  });

  if (!isAdmin) return <div className="flex min-h-screen items-center justify-center"><p>Access denied</p></div>;

  const metrics = [
    { icon: Users, label: "Total Users", value: stats?.totalUsers ?? 0, color: "text-primary" },
    { icon: Users, label: "Sellers", value: stats?.totalSellers ?? 0, color: "text-secondary" },
    { icon: Package, label: "Products", value: stats?.totalProducts ?? 0, color: "text-accent" },
    { icon: ShoppingCart, label: "Total Orders", value: stats?.totalOrders ?? 0, color: "text-success" },
    { icon: DollarSign, label: "Revenue", value: `$${(stats?.totalRevenue ?? 0).toFixed(2)}`, color: "text-primary" },
    { icon: TrendingUp, label: "Avg Order", value: `$${(stats?.avgOrderValue ?? 0).toFixed(2)}`, color: "text-secondary" },
    { icon: ShoppingCart, label: "Delivered", value: stats?.deliveredOrders ?? 0, color: "text-success" },
    { icon: ShoppingCart, label: "Pending", value: stats?.pendingOrders ?? 0, color: "text-accent" },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 flex items-center gap-3 bg-foreground px-4 py-3 pt-safe">
        <Link to="/admin-panel" className="text-background"><ArrowLeft className="h-5 w-5" /></Link>
        <h1 className="text-lg font-bold text-background">Analytics</h1>
      </header>

      <div className="grid grid-cols-2 gap-3 p-4">
        {metrics.map((m) => (
          <Card key={m.label}>
            <CardContent className="flex items-center gap-3 p-4">
              <m.icon className={`h-7 w-7 ${m.color}`} />
              <div>
                <p className="text-xl font-extrabold">{m.value}</p>
                <p className="text-xs text-muted-foreground">{m.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminAnalytics;
