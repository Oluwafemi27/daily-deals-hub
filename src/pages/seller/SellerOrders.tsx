import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const statusColors: Record<string, string> = {
  pending: "bg-accent/20 text-accent-foreground",
  processing: "bg-primary/20 text-primary",
  shipped: "bg-secondary/20 text-secondary",
  delivered: "bg-success/20 text-success",
  cancelled: "bg-destructive/20 text-destructive",
};

const SellerOrders = () => {
  const { user } = useAuth();

  const { data: orderItems = [] } = useQuery({
    queryKey: ["seller-orders", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("order_items")
        .select("*, product:products(title, images), order:orders(status, created_at, buyer_id)")
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 flex items-center gap-3 bg-card px-4 py-3 shadow-sm">
        <Link to="/seller"><ArrowLeft className="h-5 w-5" /></Link>
        <h1 className="text-lg font-bold">Orders</h1>
      </header>
      {orderItems.length === 0 ? (
        <div className="flex flex-col items-center py-20">
          <ShoppingCart className="h-16 w-16 text-muted-foreground" />
          <p className="mt-3 text-lg font-semibold">No orders yet</p>
        </div>
      ) : (
        <div className="space-y-3 p-4">
          {orderItems.map((item: any) => (
            <div key={item.id} className="rounded-xl bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground">
                  {new Date(item.order?.created_at).toLocaleDateString()}
                </p>
                <Badge className={statusColors[item.order?.status] || "bg-muted"}>
                  {item.order?.status}
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                  {item.product?.images?.[0] ? (
                    <img src={item.product.images[0]} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center">📦</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate font-medium">{item.product?.title}</p>
                  <p className="text-xs text-muted-foreground">Qty: {item.quantity} × ${item.unit_price}</p>
                </div>
                <p className="text-sm font-bold text-primary">${(item.quantity * item.unit_price).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SellerOrders;
