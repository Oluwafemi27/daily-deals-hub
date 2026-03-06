import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Package, DollarSign, ShoppingCart, Plus, TrendingUp, Wallet, MessageCircle,
  Bell, Settings, User, Store, Filter, ChevronRight, Verified, Truck
} from "lucide-react";
import BannerSlideshow from "@/components/BannerSlideshow";

const sellerBanners = [
  { title: "Grow Your Sales", subtitle: "Reach millions of buyers today", gradient: "bg-gradient-to-r from-primary to-secondary", emoji: "📈" },
  { title: "Seller Tools", subtitle: "Analytics, insights, and more", gradient: "bg-gradient-to-br from-secondary to-accent", emoji: "🛠️" },
  { title: "Low Fees", subtitle: "Keep more of your earnings", gradient: "bg-gradient-to-r from-accent to-primary", emoji: "💰" },
];

const SellerDashboard = () => {
  const { user, roles, profile, loading } = useAuth();
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

  const { data: wallet } = useQuery({
    queryKey: ["seller-wallet", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase.from("seller_wallets").select("*").eq("seller_id", user.id).maybeSingle();
      return data;
    },
    enabled: !!user && isSeller,
  });

  // Unread notifications count
  const { data: notificationCount = 0 } = useQuery({
    queryKey: ["unread-notifications-count", user?.id],
    queryFn: async () => {
      if (!user) return 0;
      try {
        const { count, error } = await supabase
          .from("notifications")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("is_read", false);
        if (error) {
          console.error("Error fetching notifications:", error);
          return 0;
        }
        return count ?? 0;
      } catch (error) {
        console.error("Error fetching notifications:", error);
        return 0;
      }
    },
    enabled: !!user,
    refetchInterval: 30000, // Refetch every 30 seconds (reduced from 5000 for performance)
    staleTime: 10000,
    gcTime: 5 * 60 * 1000,
  });

  // Show loading state while auth is loading
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-muted-foreground border-t-primary rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-muted-foreground">Loading seller profile...</p>
        </div>
      </div>
    );
  }

  if (loading) return null;
  if (!user || !isSeller) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <p className="text-muted-foreground font-medium mb-4">Access Denied</p>
          <p className="text-sm text-muted-foreground mb-4">You need a seller account to access this page.</p>
          <Button onClick={() => navigate("/auth")} className="mt-2">
            Login as Seller
          </Button>
        </div>
      </div>
    );
  }

  const quickActions = [
    { icon: Package, label: "Products", path: "/seller/products", color: "text-primary" },
    { icon: Plus, label: "Add Product", path: "/seller/products/new", color: "text-success" },
    { icon: ShoppingCart, label: "Orders", path: "/seller/orders", color: "text-secondary" },
    { icon: Verified, label: "KYC", path: "/seller/kyc", color: "text-blue-600" },
    { icon: Truck, label: "Delivery Drivers", path: "/seller/delivery-drivers", color: "text-orange-500" },
    { icon: Wallet, label: "Wallet", path: "/seller/wallet", color: "text-accent" },
    { icon: MessageCircle, label: "Messages", path: "/messages", color: "text-primary" },
    { icon: Bell, label: "Notifications", path: "/notifications", color: "text-destructive" },
  ];

  return (
    <div className="min-h-screen bg-background pb-4">
      {/* Header */}
      <header className="bg-primary px-4 pb-4 pt-safe">
        <div className="flex items-center justify-between pt-3">
          <div>
            <p className="text-sm text-primary-foreground/80">Welcome back,</p>
            <h1 className="text-xl font-bold text-primary-foreground">
              {profile?.store_name || profile?.display_name || "Seller"}
            </h1>
          </div>
          <div className="flex gap-2">
            <Link to="/notifications" className="relative text-primary-foreground">
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <Badge className="absolute -right-2 -top-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-destructive text-white">
                  {notificationCount > 99 ? "99+" : notificationCount}
                </Badge>
              )}
            </Link>
            <Link to="/messages" className="text-primary-foreground">
              <MessageCircle className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Banner */}
      <BannerSlideshow slides={sellerBanners} />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 px-4 mt-4">
        <Card>
          <CardContent className="flex flex-col items-center p-3">
            <Package className="h-5 w-5 text-primary mb-1" />
            <p className="text-xl font-bold">{stats?.productCount ?? 0}</p>
            <p className="text-[10px] text-muted-foreground">Products</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center p-3">
            <ShoppingCart className="h-5 w-5 text-secondary mb-1" />
            <p className="text-xl font-bold">{stats?.orderCount ?? 0}</p>
            <p className="text-[10px] text-muted-foreground">Orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center p-3">
            <DollarSign className="h-5 w-5 text-success mb-1" />
            <p className="text-xl font-bold">${stats?.revenue?.toFixed(0) ?? 0}</p>
            <p className="text-[10px] text-muted-foreground">Revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Wallet Card */}
      <div className="px-4 mt-4">
        <Link to="/seller/wallet">
          <Card className="bg-gradient-to-r from-primary to-secondary text-primary-foreground">
            <CardContent className="flex items-center gap-3 p-4">
              <Wallet className="h-8 w-8" />
              <div>
                <p className="text-sm opacity-90">Wallet Balance</p>
                <p className="text-2xl font-extrabold">${wallet?.balance?.toFixed(2) ?? "0.00"}</p>
              </div>
              <ChevronRight className="ml-auto h-5 w-5 opacity-60" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Quick Actions Grid */}
      <section className="px-4 mt-4">
        <h2 className="text-lg font-bold mb-3">Quick Actions</h2>
        <div className="grid grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.path}
              to={action.path}
              className="flex flex-col items-center gap-1.5 rounded-xl bg-card p-3 shadow-sm transition-shadow hover:shadow-md"
            >
              <action.icon className={`h-6 w-6 ${action.color}`} />
              <span className="text-[10px] font-medium text-center leading-tight">{action.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Activity */}
      <section className="px-4 mt-4">
        <h2 className="text-lg font-bold mb-3">Manage</h2>
        <div className="space-y-2">
          <Link to="/seller/kyc" className="flex items-center gap-3 rounded-xl bg-card p-4 shadow-sm border-l-4 border-blue-500">
            <Verified className="h-5 w-5 text-blue-600" />
            <span className="flex-1 font-medium">KYC Verification</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
          <Link to="/seller/products" className="flex items-center gap-3 rounded-xl bg-card p-4 shadow-sm">
            <Package className="h-5 w-5 text-muted-foreground" />
            <span className="flex-1 font-medium">Manage Products</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
          <Link to="/seller/orders" className="flex items-center gap-3 rounded-xl bg-card p-4 shadow-sm">
            <ShoppingCart className="h-5 w-5 text-muted-foreground" />
            <span className="flex-1 font-medium">Manage Orders</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
          <Link to="/seller/wallet" className="flex items-center gap-3 rounded-xl bg-card p-4 shadow-sm">
            <Wallet className="h-5 w-5 text-muted-foreground" />
            <span className="flex-1 font-medium">Wallet & Earnings</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default SellerDashboard;
