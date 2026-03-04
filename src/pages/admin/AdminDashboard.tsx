import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users, Package, ShoppingCart, DollarSign, BarChart3, Shield,
  Tag, Bell, MessageCircle, Settings, ChevronRight, TrendingUp, AlertTriangle,
  Verified, Send, Activity, Truck
} from "lucide-react";
import BannerSlideshow from "@/components/BannerSlideshow";

const adminBanners = [
  { title: "Admin Control Center", subtitle: "Manage your entire platform", gradient: "bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))]", emoji: "🛡️" },
  { title: "Platform Analytics", subtitle: "Track growth and performance", gradient: "bg-gradient-to-r from-[hsl(var(--secondary))] to-[hsl(var(--accent))]", emoji: "📊" },
  { title: "Stay in Control", subtitle: "Moderate users, products & orders", gradient: "bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--primary))]", emoji: "⚙️" },
];

const AdminDashboard = () => {
  const { roles, loading } = useAuth();
  const navigate = useNavigate();
  const isAdmin = roles.includes("admin");

  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [users, products, orders, categories] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("total"),
        supabase.from("product_categories").select("*", { count: "exact", head: true }),
      ]);
      const totalRevenue = (orders.data ?? []).reduce((s: number, o: any) => s + Number(o.total), 0);
      return {
        users: users.count ?? 0,
        products: products.count ?? 0,
        orders: orders.data?.length ?? 0,
        categories: categories.count ?? 0,
        revenue: totalRevenue,
      };
    },
    enabled: isAdmin,
  });

  // Show loading state while auth is loading
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-muted-foreground border-t-primary rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
        <Shield className="h-16 w-16 text-destructive" />
        <p className="text-lg font-bold">Access Denied</p>
        <p className="text-sm text-muted-foreground">You need admin privileges to view this page.</p>
        <Button onClick={() => navigate("/")}>Go Home</Button>
      </div>
    );
  }

  const statCards = [
    { icon: Users, label: "Users", value: stats?.users ?? 0, color: "text-primary" },
    { icon: Package, label: "Products", value: stats?.products ?? 0, color: "text-secondary" },
    { icon: ShoppingCart, label: "Orders", value: stats?.orders ?? 0, color: "text-accent" },
    { icon: DollarSign, label: "Revenue", value: `$${(stats?.revenue ?? 0).toFixed(0)}`, color: "text-success" },
  ];

  const quickActions = [
    { icon: Users, label: "Users", path: "/admin-panel/users", color: "text-primary" },
    { icon: Package, label: "Products", path: "/admin-panel/products", color: "text-secondary" },
    { icon: ShoppingCart, label: "Orders", path: "/admin-panel/orders", color: "text-accent" },
    { icon: Tag, label: "Categories", path: "/admin-panel/categories", color: "text-success" },
    { icon: Verified, label: "Seller KYC", path: "/admin-panel/kyc", color: "text-blue-600" },
    { icon: Truck, label: "Driver KYC", path: "/admin-panel/driver-kyc", color: "text-orange-600" },
    { icon: Send, label: "Send Notifs", path: "/admin-panel/send-notifications", color: "text-purple-600" },
    { icon: Settings, label: "Settings", path: "/admin-panel/settings", color: "text-muted-foreground" },
  ];

  const manageLinks = [
    { icon: Users, label: "Manage Users & Roles", path: "/admin-panel/users" },
    { icon: Package, label: "Moderate Products", path: "/admin-panel/products" },
    { icon: ShoppingCart, label: "Manage Orders", path: "/admin-panel/orders" },
    { icon: Tag, label: "Manage Categories", path: "/admin-panel/categories" },
    { icon: Verified, label: "Verify Seller KYC", path: "/admin-panel/kyc" },
    { icon: Truck, label: "Verify Driver KYC", path: "/admin-panel/driver-kyc" },
    { icon: Send, label: "Send User Notifications", path: "/admin-panel/send-notifications" },
    { icon: Activity, label: "View User Activity Logs", path: "/admin-panel/activity-logs" },
    { icon: AlertTriangle, label: "Reports & Moderation", path: "/admin-panel/reports" },
  ];

  return (
    <div className="min-h-screen bg-background pb-4">
      <header className="bg-foreground px-4 pb-4 pt-safe">
        <div className="flex items-center justify-between pt-3">
          <div>
            <p className="text-sm text-background/80">Admin Panel</p>
            <h1 className="text-xl font-bold text-background">Broken Store</h1>
          </div>
          <div className="flex gap-2">
            <Link to="/admin-panel/notifications" className="text-background"><Bell className="h-5 w-5" /></Link>
            <Link to="/admin-panel/settings" className="text-background"><Settings className="h-5 w-5" /></Link>
          </div>
        </div>
      </header>

      <BannerSlideshow slides={adminBanners} />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 px-4 mt-4">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-3 p-4">
              <s.icon className={`h-8 w-8 ${s.color}`} />
              <div>
                <p className="text-2xl font-extrabold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <section className="px-4 mt-4">
        <h2 className="text-lg font-bold mb-3">Quick Actions</h2>
        <div className="grid grid-cols-4 gap-3">
          {quickActions.map((a) => (
            <Link key={a.path} to={a.path} className="flex flex-col items-center gap-1.5 rounded-xl bg-card p-3 shadow-sm hover:shadow-md transition-shadow">
              <a.icon className={`h-6 w-6 ${a.color}`} />
              <span className="text-[10px] font-medium text-center">{a.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Manage */}
      <section className="px-4 mt-4">
        <h2 className="text-lg font-bold mb-3">Manage</h2>
        <div className="space-y-2">
          {manageLinks.map((m) => (
            <Link key={m.path} to={m.path} className="flex items-center gap-3 rounded-xl bg-card p-4 shadow-sm">
              <m.icon className="h-5 w-5 text-muted-foreground" />
              <span className="flex-1 font-medium">{m.label}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
