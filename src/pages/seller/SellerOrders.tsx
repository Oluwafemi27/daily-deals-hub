import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, ShoppingCart, Truck } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ContactButton } from "@/components/ContactButton";
import { DriverRatingDialog } from "@/components/DriverRatingDialog";
import { useState } from "react";
import { Star } from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-accent/20 text-accent-foreground",
  processing: "bg-primary/20 text-primary",
  shipped: "bg-secondary/20 text-secondary",
  delivered: "bg-success/20 text-success",
  cancelled: "bg-destructive/20 text-destructive",
};

const SellerOrders = () => {
  const { user } = useAuth();
  const [ratingDialog, setRatingDialog] = useState<{
    isOpen: boolean;
    driverId?: string;
    driverName?: string;
    orderId?: string;
  }>({ isOpen: false });

  const { data: orderItems = [] } = useQuery({
    queryKey: ["seller-orders", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("order_items")
        .select(`
          *,
          product:products(title, images),
          order:orders(id, status, created_at, buyer_id)
        `)
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false });

      // Fetch delivery jobs for these orders
      if (data && data.length > 0) {
        const orderIds = [...new Set(data.map((item: any) => item.order_id))];
        const { data: deliveryJobs } = await supabase
          .from("delivery_jobs")
          .select("*, driver:profiles!driver_id(*)")
          .in("order_id", orderIds);

        // Map delivery jobs to order items
        const deliveryMap = new Map();
        deliveryJobs?.forEach((job: any) => {
          if (!deliveryMap.has(job.order_id)) {
            deliveryMap.set(job.order_id, []);
          }
          deliveryMap.get(job.order_id).push(job);
        });

        return data.map((item: any) => ({
          ...item,
          delivery: deliveryMap.get(item.order_id) || [],
        }));
      }
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: ratedDeliveries = [] } = useQuery({
    queryKey: ["seller-rated-deliveries", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("driver_ratings")
        .select("order_id")
        .eq("seller_id", user.id);
      return data?.map(r => r.order_id) ?? [];
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
          {orderItems.map((item: any) => {
            const hasDriver = item.delivery && item.delivery.length > 0;
            return (
              <div key={item.id} className="rounded-xl bg-card p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-muted-foreground">
                    {new Date(item.order?.created_at).toLocaleDateString()}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge className={statusColors[item.order?.status] || "bg-muted"}>
                      {item.order?.status}
                    </Badge>
                    {hasDriver && (
                      <Badge className="bg-green-100 text-green-800">Driver Assigned</Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 mb-3">
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
                {!hasDriver && item.order?.status !== "cancelled" && (
                  <Link
                    to={`/seller/delivery-drivers?order_id=${item.order?.id}`}
                    className="w-full"
                  >
                    <Button variant="outline" size="sm" className="w-full gap-2">
                      <Truck className="h-4 w-4" />
                      Assign Driver
                    </Button>
                  </Link>
                )}

                {hasDriver && (
                  <div className="mt-3 space-y-3 pt-3 border-t border-border">
                    {item.delivery.map((job: any) => {
                      const isRated = ratedDeliveries.includes(item.order_id);
                      return (
                        <div key={job.driver_id} className="flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-muted overflow-hidden flex-shrink-0">
                                {job.driver?.avatar_url ? (
                                  <img src={job.driver.avatar_url} alt="" className="h-full w-full object-cover" />
                                ) : (
                                  <div className="flex h-full items-center justify-center text-sm">👤</div>
                                )}
                              </div>
                              <span className="text-xs font-semibold">{job.driver?.display_name || "Driver"}</span>
                            </div>
                            <Badge variant="outline" className="text-[10px] h-5">{job.status}</Badge>
                          </div>

                          <div className="flex gap-2">
                            <ContactButton
                              targetUserId={job.driver_id}
                              targetUserName={job.driver?.display_name}
                              variant="outline"
                              size="sm"
                              className="flex-1 text-[10px] h-8"
                              label="Contact Driver"
                            />
                            {job.status === "delivered" && !isRated && (
                              <Button
                                variant="default"
                                size="sm"
                                className="flex-1 gap-1 text-[10px] h-8"
                                onClick={() => setRatingDialog({
                                  isOpen: true,
                                  driverId: job.driver_id,
                                  driverName: job.driver?.display_name,
                                  orderId: item.order_id,
                                })}
                              >
                                <Star className="h-3 w-3" />
                                Rate Driver
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <DriverRatingDialog
        open={ratingDialog.isOpen}
        onOpenChange={(open) => setRatingDialog(prev => ({ ...prev, isOpen: open }))}
        driverId={ratingDialog.driverId || ""}
        driverName={ratingDialog.driverName}
        orderId={ratingDialog.orderId}
      />
    </div>
  );
};

export default SellerOrders;
