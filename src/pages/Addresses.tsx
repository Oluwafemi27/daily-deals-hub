import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { MapPin, ArrowLeft, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const Addresses = () => {
  const { user } = useAuth();

  const { data: addresses = [] } = useQuery({
    queryKey: ["addresses", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 flex items-center justify-between bg-card px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <Link to="/profile"><ArrowLeft className="h-5 w-5" /></Link>
          <h1 className="text-lg font-bold">My Addresses</h1>
        </div>
        <Button size="sm" variant="outline"><Plus className="mr-1 h-3 w-3" /> Add</Button>
      </header>
      {addresses.length === 0 ? (
        <div className="flex flex-col items-center py-20">
          <MapPin className="h-16 w-16 text-muted-foreground" />
          <p className="mt-3 text-lg font-semibold">No addresses saved</p>
          <p className="text-sm text-muted-foreground">Add an address for faster checkout</p>
        </div>
      ) : (
        <div className="space-y-3 p-4">
          {addresses.map((addr: any) => (
            <div key={addr.id} className="rounded-xl bg-card p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-semibold">{addr.full_name}</span>
                {addr.is_default && <Badge className="bg-primary/20 text-primary text-[10px]">Default</Badge>}
                {addr.label && <Badge variant="outline" className="text-[10px]">{addr.label}</Badge>}
              </div>
              <p className="text-sm text-muted-foreground">{addr.street}</p>
              <p className="text-sm text-muted-foreground">
                {addr.city}, {addr.state} {addr.postal_code}
              </p>
              <p className="text-xs text-muted-foreground mt-1">📞 {addr.phone}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Addresses;
