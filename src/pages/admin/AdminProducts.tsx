import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { ArrowLeft, Trash2, Eye, EyeOff } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const AdminProducts = () => {
  const { roles } = useAuth();
  const qc = useQueryClient();
  const isAdmin = roles.includes("admin");

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: isAdmin,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("products").update({ status: status as any }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-products"] }); toast({ title: "Product updated" }); },
  });

  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-products"] }); toast({ title: "Product deleted" }); },
  });

  if (!isAdmin) return <div className="flex min-h-screen items-center justify-center"><p>Access denied</p></div>;

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 flex items-center gap-3 bg-foreground px-4 py-3 pt-safe">
        <Link to="/admin-panel" className="text-background"><ArrowLeft className="h-5 w-5" /></Link>
        <h1 className="text-lg font-bold text-background">Moderate Products</h1>
        <Badge className="ml-auto">{products.length}</Badge>
      </header>

      <div className="p-4 space-y-3">
        {isLoading ? <p className="text-center text-muted-foreground py-8">Loading...</p> :
          products.map((p: any) => (
            <Card key={p.id}>
              <CardContent className="flex items-center gap-3 p-3">
                <div className="h-14 w-14 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0">
                  {p.images?.[0] ? <img src={p.images[0]} alt="" className="h-full w-full object-cover" /> : <span className="text-2xl">📦</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{p.title}</p>
                  <p className="text-xs text-muted-foreground">${p.price}</p>
                  <Badge variant={p.status === "active" ? "default" : "secondary"} className="text-[10px] mt-1">{p.status}</Badge>
                </div>
                <div className="flex gap-1 shrink-0">
                  {p.status === "active" ? (
                    <Button size="icon" variant="ghost" onClick={() => updateStatus.mutate({ id: p.id, status: "inactive" })}><EyeOff className="h-4 w-4" /></Button>
                  ) : (
                    <Button size="icon" variant="ghost" onClick={() => updateStatus.mutate({ id: p.id, status: "active" })}><Eye className="h-4 w-4" /></Button>
                  )}
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteProduct.mutate(p.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))
        }
      </div>
    </div>
  );
};

export default AdminProducts;
