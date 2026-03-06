import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Package, ArrowLeft, Star, Truck } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RatingDialog } from "@/components/RatingDialog";
import { SellerRatingDialog } from "@/components/SellerRatingDialog";
import { DriverRatingDialog } from "@/components/DriverRatingDialog";
import { useState } from "react";

const statusColors: Record<string, string> = {
  pending: "bg-accent/20 text-accent-foreground",
  processing: "bg-primary/20 text-primary",
  shipped: "bg-secondary/20 text-secondary",
  delivered: "bg-success/20 text-success",
  cancelled: "bg-destructive/20 text-destructive",
};

const Orders = () => {
  const { user } = useAuth();
  const [ratingDialog, setRatingDialog] = useState<{
    isOpen: boolean;
    sellerId?: string;
    sellerName?: string;
    orderId?: string;
  }>({ isOpen: false });
  const [driverRatingDialog, setDriverRatingDialog] = useState<{
    isOpen: boolean;
    driverId?: string;
    driverName?: string;
    deliveryJobId?: string;
  }>({ isOpen: false });

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("orders")
        .select("*, order_items(*, product:products(title, images), seller:profiles!order_items_seller_id_fkey(id, display_name, store_name))")
        .eq("buyer_id", user.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: deliveryJobs = [] } = useQuery({
    queryKey: ["delivery-jobs", orders.map(o => o.id).join(",")],
    queryFn: async () => {
      if (!orders.length) return [];
      const { data } = await supabase
        .from("delivery_jobs")
        .select("*, driver:profiles!driver_id(id, display_name, avatar_url)")
        .in("order_id", orders.map(o => o.id));
      return data ?? [];
    },
    enabled: !!orders.length,
  });

  const { data: userRatings = [] } = useQuery({
    queryKey: ["user-ratings", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data: sellerRatings } = await supabase
        .from("seller_ratings")
        .select("order_id")
        .eq("buyer_id", user.id);
      const { data: driverRatings } = await supabase
        .from("driver_ratings")
        .select("order_id")
        .eq("seller_id", user.id);
      return {
        rated_orders: sellerRatings?.map(r => r.order_id) ?? [],
        rated_deliveries: driverRatings?.map(r => r.order_id) ?? [],
      };
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
          {orders.map((order: any) => {
            const deliveryJob = deliveryJobs.find(j => j.order_id === order.id);
            const isRated = userRatings?.rated_orders?.includes(order.id);
            const driverRated = userRatings?.rated_deliveries?.includes(order.id);
            const seller = order.order_items?.[0]?.seller;

            return (
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

                {/* Seller Rating Section */}
                {seller && order.status === "delivered" && !isRated && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-xs font-medium text-muted-foreground">Rate seller</p>
                        <p className="text-xs text-muted-foreground">{seller.store_name || seller.display_name}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setRatingDialog({
                            isOpen: true,
                            sellerId: seller.id,
                            sellerName: seller.store_name || seller.display_name,
                            orderId: order.id,
                          })
                        }
                      >
                        <Star className="h-3 w-3 mr-1" />
                        Rate
                      </Button>
                    </div>
                  </div>
                )}

                {/* Driver Info & Rating Section */}
                {deliveryJob && order.status === "delivered" && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <Link
                      to={`/driver/${deliveryJob.driver_id}`}
                      className="flex items-center gap-2 mb-2 hover:opacity-80 transition-opacity"
                    >
                      <Truck className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs font-medium text-primary">
                        {deliveryJob.driver?.display_name || "Driver"}
                      </span>
                    </Link>
                    {!driverRated && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full text-xs"
                        onClick={() =>
                          setDriverRatingDialog({
                            isOpen: true,
                            driverId: deliveryJob.driver_id,
                            driverName: deliveryJob.driver?.display_name,
                            deliveryJobId: deliveryJob.id,
                          })
                        }
                      >
                        <Star className="h-3 w-3 mr-1" />
                        Rate Delivery
                      </Button>
                    )}
                  </div>
                )}

                <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="text-lg font-extrabold text-primary">${order.total}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Rating Dialogs */}
      <SellerRatingDialog
        open={ratingDialog.isOpen}
        onOpenChange={(open) => setRatingDialog(prev => ({ ...prev, isOpen: open }))}
        sellerId={ratingDialog.sellerId || ""}
        sellerName={ratingDialog.sellerName}
        orderId={ratingDialog.orderId}
      />

      <DriverRatingDialog
        open={driverRatingDialog.isOpen}
        onOpenChange={(open) => setDriverRatingDialog(prev => ({ ...prev, isOpen: open }))}
        driverId={driverRatingDialog.driverId || ""}
        driverName={driverRatingDialog.driverName}
        orderId={driverRatingDialog.orderId}
      />
    </div>
  );
};

export default Orders;
