import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

const statusColors: Record<string, string> = {
  pending: "bg-accent text-accent-foreground",
  processing: "bg-primary text-primary-foreground",
  shipped: "bg-secondary text-secondary-foreground",
  delivered: "bg-success text-success-foreground",
  cancelled: "bg-destructive text-destructive-foreground",
};

const AdminOrders = () => {
  const { roles } = useAuth();
  const qc = useQueryClient();
  const isAdmin = roles.includes("admin");

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: isAdmin,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("orders").update({ status: status as any }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-orders"] }); toast({ title: "Order updated" }); },
  });

  if (!isAdmin) return <div className="flex min-h-screen items-center justify-center"><p>Access denied</p></div>;

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 flex items-center gap-3 bg-foreground px-4 py-3 pt-safe">
        <Link to="/admin-panel" className="text-background"><ArrowLeft className="h-5 w-5" /></Link>
        <h1 className="text-lg font-bold text-background">Manage Orders</h1>
        <Badge className="ml-auto">{orders.length}</Badge>
      </header>

      <div className="p-4 space-y-3">
        {isLoading ? <p className="text-center text-muted-foreground py-8">Loading...</p> :
          orders.map((o: any) => (
            <Card key={o.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-sm">Order #{o.id.slice(0, 8)}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(o.created_at), "MMM d, yyyy")}</p>
                    <p className="text-sm font-bold mt-1">${Number(o.total).toFixed(2)}</p>
                  </div>
                  <Select defaultValue={o.status} onValueChange={(status) => updateStatus.mutate({ id: o.id, status })}>
                    <SelectTrigger className="w-28 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["pending", "processing", "shipped", "delivered", "cancelled"].map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))
        }
        {orders.length === 0 && !isLoading && (
          <p className="text-center text-muted-foreground py-8">No orders yet</p>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
