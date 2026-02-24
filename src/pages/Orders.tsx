import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Package, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const statusColors: Record<string, string> = {
  pending: "bg-accent/20 text-accent-foreground",
  processing: "bg-primary/20 text-primary",
  shipped: "bg-secondary/20 text-secondary",
  delivered: "bg-success/20 text-success",
  cancelled: "bg-destructive/20 text-destructive",
};

const Orders = () => {
  const { user } = useAuth();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("orders")
        .select("*, order_items(*, product:products(title, images))")
        .eq("buyer_id", user.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
        <Package className="h-16 w-16 text-muted-foreground" />
        <p className="text-lg font-semibold">Sign in to view orders</p>
        <Link to="/auth"><Button>Sign in</Button></Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 flex items-center gap-3 bg-card px-4 py-3 shadow-sm">
        <Link to="/profile"><ArrowLeft className="h-5 w-5" /></Link>
        <h1 className="text-lg font-bold">My Orders</h1>
      </header>
      {orders.length === 0 && !isLoading ? (
        <div className="flex flex-col items-center py-20">
          <Package className="h-16 w-16 text-muted-foreground" />
          <p className="mt-3 text-lg font-semibold">No orders yet</p>
          <Link to="/" className="mt-2 text-sm text-primary hover:underline">Start shopping</Link>
        </div>
      ) : (
        <div className="space-y-3 p-4">
          {orders.map((order: any) => (
            <div key={order.id} className="rounded-xl bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-muted-foreground">
                  {new Date(order.created_at).toLocaleDateString()}
                </p>
                <Badge className={statusColors[order.status] || "bg-muted"}>
                  {order.status}
                </Badge>
              </div>
              <div className="space-y-2">
                {order.order_items?.slice(0, 3).map((item: any) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                      {item.product?.images?.[0] ? (
                        <img src={item.product.images[0]} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center">📦</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{item.product?.title}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold">${item.unit_price}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-lg font-extrabold text-primary">${order.total}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
