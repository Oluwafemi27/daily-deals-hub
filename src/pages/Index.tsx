import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search, Bell, ChevronRight, Star, Zap, MessageCircle, DollarSign, TrendingUp, Package, Heart, LayoutGrid } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link, Navigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import BannerSlideshow from "@/components/BannerSlideshow";
import CategorySlider from "@/components/CategorySlider";

const buyerBanners = [
  { title: "Up to 90% OFF", subtitle: "New user exclusive offers", gradient: "bg-gradient-to-r from-primary to-secondary", emoji: "⚡" },
  { title: "Free Shipping", subtitle: "On orders over $15", gradient: "bg-gradient-to-r from-secondary to-primary", emoji: "🚚" },
  { title: "Flash Deals", subtitle: "Limited time only — grab now!", gradient: "bg-gradient-to-br from-accent to-primary", emoji: "🔥" },
];

const Index = () => {
  const { user, roles } = useAuth();
  const isSeller = roles.includes("seller") && !roles.includes("buyer");

  // If pure seller (not also a buyer), redirect to seller dashboard
  if (isSeller) return <Navigate to="/seller" replace />;

  const { data: categories = [], isLoading: catLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("product_categories").select("*").order("sort_order");
      return data ?? [];
    },
  });

  const { data: products = [], isLoading: prodLoading } = useQuery({
    queryKey: ["featured-products"],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("status", "active")
        .order("sales_count", { ascending: false })
        .limit(20);
      return data ?? [];
    },
  });

  // Buyer spending
  const { data: totalSpent = 0 } = useQuery({
    queryKey: ["buyer-spending", user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { data } = await supabase
        .from("orders")
        .select("total")
        .eq("buyer_id", user.id)
        .in("status", ["processing", "shipped", "delivered"]);
      return (data ?? []).reduce((sum: number, o: any) => sum + Number(o.total), 0);
    },
    enabled: !!user,
  });

  return (
    <div className="min-h-screen bg-background pb-4">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-primary px-4 pb-3 pt-safe">
        <div className="flex items-center gap-3 pt-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="h-10 rounded-full border-none bg-card pl-10 text-sm shadow-sm"
              readOnly
            />
          </div>
          <Link to="/notifications" className="relative text-primary-foreground">
            <Bell className="h-6 w-6" />
          </Link>
          <Link to="/messages" className="relative text-primary-foreground">
            <MessageCircle className="h-6 w-6" />
          </Link>
        </div>
      </header>

      {/* Banner Slideshow */}
      <BannerSlideshow slides={buyerBanners} />

      {/* Quick Action Buttons */}
      {user && (
        <div className="grid grid-cols-5 gap-2 px-4 mt-4">
          <CategorySlider />
          <Link to="/orders" className="flex flex-col items-center gap-1 rounded-xl bg-card p-3 shadow-sm">
            <Package className="h-5 w-5 text-primary" />
            <span className="text-[10px] font-medium">Orders</span>
          </Link>
          <Link to="/messages" className="flex flex-col items-center gap-1 rounded-xl bg-card p-3 shadow-sm">
            <MessageCircle className="h-5 w-5 text-secondary" />
            <span className="text-[10px] font-medium">Messages</span>
          </Link>
          <Link to="/wishlist" className="flex flex-col items-center gap-1 rounded-xl bg-card p-3 shadow-sm">
            <Heart className="h-5 w-5 text-destructive" />
            <span className="text-[10px] font-medium">Wishlist</span>
          </Link>
          <Link to="/notifications" className="flex flex-col items-center gap-1 rounded-xl bg-card p-3 shadow-sm">
            <Bell className="h-5 w-5 text-accent" />
            <span className="text-[10px] font-medium">Alerts</span>
          </Link>
        </div>
      )}

      {/* Spending Card */}
      {user && totalSpent > 0 && (
        <div className="mx-4 mt-4">
          <Card className="bg-gradient-to-r from-success to-primary/80 text-primary-foreground">
            <CardContent className="flex items-center gap-3 p-4">
              <DollarSign className="h-8 w-8" />
              <div>
                <p className="text-sm opacity-90">Total Spent</p>
                <p className="text-2xl font-extrabold">${totalSpent.toFixed(2)}</p>
              </div>
              <TrendingUp className="ml-auto h-6 w-6 opacity-60" />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Categories */}
      <section className="px-4 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Categories</h2>
          <Link to="/categories" className="flex items-center text-sm text-primary">
            See all <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-8">
          {catLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <Skeleton className="h-14 w-14 rounded-2xl" />
                  <Skeleton className="h-3 w-12" />
                </div>
              ))
            : categories.slice(0, 8).map((cat: any) => (
                <Link key={cat.id} to={`/categories/${cat.id}`} className="flex flex-col items-center gap-1">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-2xl">
                    {cat.icon || "📦"}
                  </div>
                  <span className="text-xs font-medium text-center line-clamp-1">{cat.name}</span>
                </Link>
              ))}
        </div>
      </section>

      {/* Products Grid */}
      <section className="px-4 py-2">
        <h2 className="mb-3 text-lg font-bold">Recommended for you</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {prodLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="aspect-square w-full rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))
            : products.map((product: any) => (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  className="group overflow-hidden rounded-xl bg-card shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt={product.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-4xl text-muted-foreground">📦</div>
                    )}
                    {product.discount_price && product.discount_price < product.price && (
                      <Badge className="absolute left-1.5 top-1.5 bg-secondary text-secondary-foreground text-[10px] px-1.5 py-0.5">
                        -{Math.round(((product.price - product.discount_price) / product.price) * 100)}%
                      </Badge>
                    )}
                  </div>
                  <div className="p-2.5">
                    <p className="text-xs line-clamp-2 leading-snug text-foreground">{product.title}</p>
                    <div className="mt-1.5 flex items-baseline gap-1.5">
                      <span className="text-base font-extrabold text-primary">${product.discount_price ?? product.price}</span>
                      {product.discount_price && product.discount_price < product.price && (
                        <span className="text-xs text-muted-foreground line-through">${product.price}</span>
                      )}
                    </div>
                    {product.rating_count > 0 && (
                      <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <Star className="h-3 w-3 fill-accent text-accent" />
                        <span>{product.rating_avg}</span>
                        <span>({product.rating_count})</span>
                      </div>
                    )}
                    {product.sales_count > 0 && (
                      <p className="mt-0.5 text-[10px] text-muted-foreground">{product.sales_count}+ sold</p>
                    )}
                  </div>
                </Link>
              ))}
        </div>
        {products.length === 0 && !prodLoading && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="text-5xl">🛍️</span>
            <p className="mt-3 text-lg font-semibold">No products yet</p>
            <p className="text-sm text-muted-foreground">Check back soon for amazing deals!</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Index;
