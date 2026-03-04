import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Truck, Power } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DriverProfile = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [vehicleName, setVehicleName] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [pricePerKm, setPricePerKm] = useState("");
  const [pricePerMile, setPricePerMile] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [saving, setSaving] = useState(false);

  const { data: driverProfile } = useQuery({
    queryKey: ["driver-profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("driver_profiles")
        .select("*")
        .eq("driver_id", user.id)
        .maybeSingle();
      if (data) {
        setVehicleName(data.vehicle_name || "");
        setVehicleType(data.vehicle_type || "");
        setLicensePlate(data.license_plate || "");
        setPricePerKm(data.price_per_km || "");
        setPricePerMile(data.price_per_mile || "");
        setIsAvailable(data.is_available);
      }
      return data;
    },
    enabled: !!user,
  });

  const handleSave = async () => {
    if (!user || !vehicleName || !vehicleType || !licensePlate || (!pricePerKm && !pricePerMile)) {
      toast({
        title: "Error",
        description: "Please fill in all fields (including at least one price rate)",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("driver_profiles")
        .upsert({
          driver_id: user.id,
          vehicle_name: vehicleName,
          vehicle_type: vehicleType,
          license_plate: licensePlate,
          price_per_km: parseFloat(pricePerKm) || 0,
          price_per_mile: parseFloat(pricePerMile) || 0,
          is_available: isAvailable,
        })
        .eq("driver_id", user.id);

      if (error) throw error;

      toast({ title: "Success", description: "Profile updated!" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleAvailability = async () => {
    try {
      await supabase
        .from("driver_profiles")
        .update({ is_available: !isAvailable })
        .eq("driver_id", user!.id);
      
      setIsAvailable(!isAvailable);
      toast({
        title: "Success",
        description: isAvailable ? "You're now offline" : "You're now available",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 flex items-center gap-3 bg-card px-4 py-3 shadow-sm">
        <Link to="/driver"><ArrowLeft className="h-5 w-5" /></Link>
        <h1 className="text-lg font-bold">Vehicle Information</h1>
      </header>

      <div className="p-4 space-y-4">
        {/* Profile Section */}
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <Truck className="h-10 w-10 text-primary" />
          </div>
          <div className="text-center">
            <p className="font-semibold">{profile?.display_name || "Driver"}</p>
            <p className="text-sm text-muted-foreground">{driverProfile?.average_rating?.toFixed(1) || "0"} ⭐ ({driverProfile?.total_deliveries || 0} deliveries)</p>
          </div>
        </div>

        {/* Availability Toggle */}
        <Card className={isAvailable ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium">Availability Status</p>
              <p className="text-sm text-muted-foreground">
                {isAvailable ? "You're available for deliveries" : "You're currently offline"}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleAvailability}
              className={isAvailable ? "border-green-500 text-green-600" : "border-red-500 text-red-600"}
            >
              <Power className="h-4 w-4 mr-2" />
              {isAvailable ? "Online" : "Offline"}
            </Button>
          </CardContent>
        </Card>

        {/* Vehicle Information Form */}
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Vehicle Name</label>
              <Input 
                value={vehicleName} 
                onChange={(e) => setVehicleName(e.target.value)} 
                placeholder="e.g., Honda CB 200" 
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Vehicle Type</label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="">Select vehicle type</option>
                <option value="motorcycle">Motorcycle</option>
                <option value="car">Car</option>
                <option value="van">Van</option>
                <option value="truck">Truck</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">License Plate</label>
              <Input 
                value={licensePlate} 
                onChange={(e) => setLicensePlate(e.target.value)} 
                placeholder="e.g., ABC-1234" 
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Price Per Km ($)</label>
                <Input
                  type="number"
                  value={pricePerKm}
                  onChange={(e) => setPricePerKm(e.target.value)}
                  placeholder="e.g., 5.00"
                  step="0.01"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Price Per Mile ($)</label>
                <Input
                  type="number"
                  value={pricePerMile}
                  onChange={(e) => setPricePerMile(e.target.value)}
                  placeholder="e.g., 8.05"
                  step="0.01"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Button className="w-full" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};

export default DriverProfile;
