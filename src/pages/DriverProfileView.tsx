import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Star, Truck, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const DriverProfileView = () => {
  const { driverId } = useParams();

  const { data: driver, isLoading: driverLoading } = useQuery({
    queryKey: ["driver", driverId],
    queryFn: async () => {
      const { data } = await supabase
        .from("driver_profiles")
        .select("*")
        .eq("driver_id", driverId!)
        .single();
      return data;
    },
    enabled: !!driverId,
  });

  const { data: driverProfile } = useQuery({
    queryKey: ["driver-profile", driverId],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", driverId!)
        .single();
      return data;
    },
    enabled: !!driverId,
  });

  const { data: ratings = [] } = useQuery({
    queryKey: ["driver-ratings", driverId],
    queryFn: async () => {
      const { data } = await supabase
        .from("seller_driver_ratings")
        .select("*, seller:profiles!seller_id(display_name, avatar_url)")
        .eq("driver_id", driverId!)
        .order("created_at", { ascending: false })
        .limit(10);
      return data ?? [];
    },
    enabled: !!driverId,
  });

  if (driverLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Skeleton className="h-12 w-full" />
        <div className="space-y-4 p-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Driver not found</p>
      </div>
    );
  }

  const avgRating =
    ratings.length > 0
      ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
      : "0";

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 flex items-center gap-3 bg-card px-4 py-3 shadow-sm">
        <Link to="/">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-bold">Driver Profile</h1>
      </div>

      {/* Driver Info */}
      <Card className="m-4">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="h-20 w-20 rounded-full overflow-hidden bg-muted flex-shrink-0">
              {driverProfile?.avatar_url ? (
                <img src={driverProfile.avatar_url} alt={driverProfile.display_name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-2xl">🚗</div>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{driverProfile?.display_name || driver.full_name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{avgRating}</span>
                </div>
                <span className="text-sm text-muted-foreground">({ratings.length} reviews)</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                <Truck className="h-4 w-4" />
                <span>{driver.total_deliveries} deliveries</span>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-2 border-t border-border pt-4">
            {driver.vehicle_info && (
              <div>
                <p className="text-xs text-muted-foreground">Vehicle</p>
                <p className="text-sm font-medium">{driver.vehicle_info}</p>
              </div>
            )}
            {driver.price_per_km && (
              <div>
                <p className="text-xs text-muted-foreground">Price per km</p>
                <p className="text-sm font-bold text-primary">${driver.price_per_km}</p>
              </div>
            )}
            {driver.price_per_mile && (
              <div>
                <p className="text-xs text-muted-foreground">Price per mile</p>
                <p className="text-sm font-bold text-primary">${driver.price_per_mile}</p>
              </div>
            )}
            {driver.kyc_status === "approved" && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <div className="h-2 w-2 rounded-full bg-green-600" />
                Verified
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Ratings */}
      <div className="px-4">
        <h3 className="text-lg font-bold mb-3">Reviews</h3>
        <div className="space-y-3">
          {ratings.length === 0 ? (
            <p className="text-sm text-muted-foreground">No reviews yet</p>
          ) : (
            ratings.map((rating: any) => (
              <Card key={rating.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted flex-shrink-0 overflow-hidden">
                      {rating.seller?.avatar_url ? (
                        <img
                          src={rating.seller.avatar_url}
                          alt={rating.seller.display_name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-lg">🏪</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold">{rating.seller?.display_name || "Seller"}</p>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < rating.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-muted-foreground"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {rating.comment && (
                        <p className="text-xs text-muted-foreground mt-1">{rating.comment}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(rating.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverProfileView;
