import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, DollarSign, Clock, Check, Truck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const statusColorMap = {
  available: "bg-blue-100 text-blue-800",
  accepted: "bg-yellow-100 text-yellow-800",
  picked_up: "bg-orange-100 text-orange-800",
  in_transit: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const DriverJobs = () => {
  const { user, roles } = useAuth();
  const navigate = useNavigate();
  const isDriver = roles.includes("driver");

  const { data: jobs, isLoading } = useQuery({
    queryKey: ["driver-jobs", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("delivery_jobs")
        .select(`
          *,
          order:orders(id, tracking_number, estimated_delivery, buyer_id, address_id),
          seller:profiles!delivery_jobs_seller_id_fkey(display_name, store_name)
        `)
        .eq("driver_id", user.id)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user && isDriver,
  });

  const { data: availableJobs } = useQuery({
    queryKey: ["available-jobs", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("delivery_jobs")
        .select(`
          *,
          order:orders(id, tracking_number),
          seller:profiles!delivery_jobs_seller_id_fkey(display_name, store_name)
        `)
        .eq("status", "available")
        .isNull("driver_id")
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user && isDriver,
  });

  if (!isDriver) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <p className="text-muted-foreground">You need a driver account to access this page.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center gap-3 bg-card px-4 py-3 shadow-sm">
        <Link to="/driver"><ArrowLeft className="h-5 w-5" /></Link>
        <h1 className="text-lg font-bold">Delivery Jobs</h1>
      </header>

      <div className="p-4 space-y-4">
        {/* Active Jobs Tab */}
        <div>
          <h2 className="text-lg font-bold mb-3">Your Active Jobs</h2>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : jobs && jobs.length > 0 ? (
            <div className="space-y-2">
              {jobs.map((job: any) => (
                <Link key={job.id} to={`/driver/jobs/${job.id}`}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold">{job.seller?.store_name || job.seller?.display_name}</p>
                          <p className="text-xs text-muted-foreground">Order: {job.order?.tracking_number}</p>
                        </div>
                        <Badge className={statusColorMap[job.status as keyof typeof statusColorMap] || "bg-gray-100"}>
                          {job.status}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <DollarSign className="h-4 w-4" />
                          <span>${job.price?.toFixed(2)}</span>
                        </div>
                        {job.order?.estimated_delivery && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>Est: {new Date(job.order.estimated_delivery).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Truck className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-muted-foreground">No active jobs</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => navigate("/driver/available-jobs")}>
                View Available Jobs
              </Button>
            </div>
          )}
        </div>

        {/* Available Jobs Tab */}
        <div>
          <h2 className="text-lg font-bold mb-3">Available Jobs</h2>
          {availableJobs && availableJobs.length > 0 ? (
            <div className="space-y-2">
              {availableJobs.map((job: any) => (
                <Card key={job.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <Link to={`/driver/jobs/${job.id}`} className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold">{job.seller?.store_name || job.seller?.display_name}</p>
                        <p className="text-xs text-muted-foreground">Order: {job.order?.tracking_number}</p>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">Available</Badge>
                    </Link>
                    {job.price && (
                      <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-success">
                        <DollarSign className="h-4 w-4" />
                        <span>${job.price.toFixed(2)}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Truck className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-muted-foreground">No available jobs at the moment</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverJobs;
