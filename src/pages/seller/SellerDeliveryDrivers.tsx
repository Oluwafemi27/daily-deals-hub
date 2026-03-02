import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, MapPin, Star, Truck, DollarSign, Check } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";

const SellerDeliveryDrivers = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order_id");
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [assigning, setAssigning] = useState(false);

  const { data: availableDrivers = [] } = useQuery({
    queryKey: ["available-drivers"],
    queryFn: async () => {
      const { data } = await supabase
        .from("driver_profiles")
        .select(`
          *,
          profile:auth.users!driver_profiles_driver_id_fkey(display_name)
        `)
        .eq("is_available", true)
        .eq("kyc_status", "approved")
        .order("average_rating", { ascending: false });
      return data || [];
    },
  });

  const { data: order } = useQuery({
    queryKey: ["order-details", orderId],
    queryFn: async () => {
      if (!orderId) return null;
      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .maybeSingle();
      return data;
    },
    enabled: !!orderId,
  });

  const handleAssignDriver = async () => {
    if (!user || !selectedDriver || !orderId) return;

    const selectedDriverData = availableDrivers.find(d => d.driver_id === selectedDriver);
    
    setAssigning(true);
    try {
      // Create delivery job
      const { error } = await supabase
        .from("delivery_jobs")
        .insert({
          order_id: orderId,
          driver_id: selectedDriver,
          seller_id: user.id,
          status: "accepted",
          price: selectedDriverData?.price_per_km || 5,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Driver assigned successfully!",
      });

      // Redirect back to orders
      window.history.back();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 flex items-center gap-3 bg-card px-4 py-3 shadow-sm">
        <Link to="/seller/orders"><ArrowLeft className="h-5 w-5" /></Link>
        <h1 className="text-lg font-bold">Select Delivery Driver</h1>
      </header>

      <div className="p-4 space-y-4">
        {order && (
          <Card className="bg-primary/10">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Order ID</p>
              <p className="font-semibold">{order.id.slice(0, 8)}...</p>
            </CardContent>
          </Card>
        )}

        {availableDrivers.length === 0 ? (
          <div className="text-center py-12">
            <Truck className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">No available drivers at the moment</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Choose a verified driver to deliver this order
            </p>
            <div className="space-y-2">
              {availableDrivers.map((driver: any) => (
                <Card
                  key={driver.driver_id}
                  className={`cursor-pointer transition-all ${
                    selectedDriver === driver.driver_id
                      ? "ring-2 ring-primary"
                      : ""
                  }`}
                  onClick={() => setSelectedDriver(driver.driver_id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">
                            {driver.profile?.display_name || "Driver"}
                          </p>
                          {driver.kyc_status === "approved" && (
                            <Check className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4" />
                            <span>
                              {driver.vehicle_name} ({driver.vehicle_type})
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4" />
                            <span>
                              {driver.average_rating?.toFixed(1) || "0"} ({driver.total_deliveries} deliveries)
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            <span>${driver.price_per_km}/km</span>
                          </div>
                        </div>
                      </div>
                      {selectedDriver === driver.driver_id && (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                          <Check className="h-4 w-4 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {selectedDriver && (
              <Button 
                className="w-full mt-4" 
                onClick={handleAssignDriver}
                disabled={assigning}
              >
                {assigning ? "Assigning Driver..." : "Assign Driver"}
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SellerDeliveryDrivers;
