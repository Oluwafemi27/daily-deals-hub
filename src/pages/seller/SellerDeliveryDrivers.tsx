import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, MapPin, Star, Truck, DollarSign, Check, Filter, TrendingUp, Clock, AlertCircle } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContactButton } from "@/components/ContactButton";
import { DriverRatingDialog } from "@/components/DriverRatingDialog";

const SellerDeliveryDrivers = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order_id");
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [assigning, setAssigning] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"rating" | "price" | "deliveries">("rating");
  const [ratingDialog, setRatingDialog] = useState<{
    isOpen: boolean;
    driverId?: string;
    driverName?: string;
    orderId?: string;
  }>({ isOpen: false });

  const { data: availableDrivers = [] } = useQuery({
    queryKey: ["available-drivers", sortBy],
    queryFn: async () => {
      let query = supabase
        .from("driver_profiles")
        .select("*")
        .eq("is_available", true)
        .eq("kyc_status", "approved");

      // Apply sorting
      if (sortBy === "rating") {
        query = query.order("average_rating", { ascending: false });
      } else if (sortBy === "price") {
        query = query.order("price_per_mile", { ascending: true });
      } else {
        query = query.order("total_deliveries", { ascending: false });
      }

      const { data, error } = await query;
      if (error) {
        console.error("Error fetching drivers:", error);
      }
      return data || [];
    },
  });

  const { data: assignedDrivers = [] } = useQuery({
    queryKey: ["assigned-drivers", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("delivery_jobs")
        .select("*, driver:profiles!driver_id(*)")
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
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
          price: selectedDriverData?.price_per_mile || selectedDriverData?.price_per_km || 5,
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

  // Filter drivers based on search
  const filteredDrivers = availableDrivers.filter((driver: any) =>
    driver.vehicle_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    driver.vehicle_type?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 flex items-center gap-3 bg-card px-4 py-3 shadow-sm">
        <Link to={orderId ? "/seller/orders" : "/seller"}><ArrowLeft className="h-5 w-5" /></Link>
        <h1 className="text-lg font-bold">Delivery Drivers</h1>
      </header>

      <div className="p-4 space-y-4">
        {/* Tabs */}
        <Tabs defaultValue="browse" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="browse">Browse Drivers ({availableDrivers.length})</TabsTrigger>
            <TabsTrigger value="assigned">Assigned ({assignedDrivers.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-4">
            {order && (
              <Card className="bg-primary/10">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground mb-1">Order ID</p>
                  <p className="font-semibold">{order.id.slice(0, 8)}...</p>
                </CardContent>
              </Card>
            )}

            {/* Filters and Search */}
            <div className="space-y-3">
              <Input
                placeholder="Search drivers by name or vehicle..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />

              <div className="flex gap-2 overflow-x-auto pb-2">
                {[
                  { label: "Top Rated", value: "rating" as const },
                  { label: "Lowest Price", value: "price" as const },
                  { label: "Most Experienced", value: "deliveries" as const },
                ].map((option) => (
                  <Button
                    key={option.value}
                    variant={sortBy === option.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSortBy(option.value)}
                    className="whitespace-nowrap"
                  >
                    <Filter className="h-3 w-3 mr-1" />
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {filteredDrivers.length === 0 ? (
              <div className="text-center py-12">
                <Truck className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">
                  {availableDrivers.length === 0
                    ? "No available drivers at the moment"
                    : "No drivers match your search"}
                </p>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Select a verified driver to assign delivery
                </p>
                <div className="space-y-2">
                  {filteredDrivers.map((driver: any) => (
                    <Card
                      key={driver.driver_id}
                      className={`cursor-pointer transition-all ${
                        selectedDriver === driver.driver_id
                          ? "ring-2 ring-primary"
                          : "hover:shadow-md"
                      }`}
                      onClick={() => setSelectedDriver(driver.driver_id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold">
                                {driver.vehicle_name || "Delivery Driver"}
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
                              <div className="grid grid-cols-3 gap-3 mt-2 pt-2 border-t border-border">
                                <div className="flex items-center gap-1">
                                  <Star className="h-3 w-3 text-yellow-500" />
                                  <span className="font-medium">{driver.average_rating?.toFixed(1) || "0"}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <TrendingUp className="h-3 w-3 text-blue-500" />
                                  <span className="font-medium">{driver.total_deliveries || 0} deliveries</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <DollarSign className="h-3 w-3 text-green-500" />
                                  <span className="font-medium">${driver.price_per_mile}/mi</span>
                                  <span className="text-[10px] text-muted-foreground ml-1">(${driver.price_per_km}/km)</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Link
                              to={`/driver/${driver.driver_id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-xs text-primary hover:underline px-2 py-1"
                            >
                              View Profile
                            </Link>
                            {selectedDriver === driver.driver_id && (
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary flex-shrink-0">
                                <Check className="h-4 w-4 text-primary-foreground" />
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {selectedDriver && orderId && (
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
          </TabsContent>

          <TabsContent value="assigned" className="space-y-4">
            {assignedDrivers.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">No assigned drivers yet</p>
                <p className="text-xs text-muted-foreground mt-2">Drivers you assign will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {assignedDrivers.map((job: any) => (
                  <Card key={job.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-muted flex-shrink-0 overflow-hidden">
                            {job.driver?.avatar_url ? (
                              <img src={job.driver.avatar_url} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full items-center justify-center text-xl">👤</div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold">{job.driver?.display_name || "Driver"}</p>
                            <p className="text-[10px] text-muted-foreground">Job ID: {job.id.slice(0, 8)}</p>
                          </div>
                        </div>
                        <Badge variant={
                          job.status === "delivered" ? "outline" :
                          job.status === "in_transit" ? "default" :
                          job.status === "accepted" ? "secondary" : "outline"
                        }>
                          {job.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                        <div className="flex flex-col">
                          <span className="text-muted-foreground">Order ID</span>
                          <span className="font-medium">{job.order_id.slice(0, 8)}...</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-muted-foreground">Assigned on</span>
                          <span className="font-medium">{new Date(job.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <ContactButton
                          targetUserId={job.driver_id}
                          targetUserName={job.driver?.display_name}
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        />
                        {job.status === "delivered" && (
                          <Button
                            variant="default"
                            size="sm"
                            className="flex-1 gap-1"
                            onClick={() => setRatingDialog({
                              isOpen: true,
                              driverId: job.driver_id,
                              driverName: job.driver?.display_name,
                              orderId: job.order_id,
                            })}
                          >
                            <Star className="h-3 w-3" />
                            Rate Driver
                          </Button>
                        )}
                        <Link
                          to={`/driver/${job.driver_id}`}
                          className="flex-1"
                        >
                          <Button variant="ghost" size="sm" className="w-full">
                            Profile
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

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

export default SellerDeliveryDrivers;
