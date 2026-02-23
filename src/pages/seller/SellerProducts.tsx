import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const statusColors: Record<string, string> = {
  active: "bg-success text-success-foreground",
  draft: "bg-muted text-muted-foreground",
  inactive: "bg-accent text-accent-foreground",
};

const SellerProducts = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: products = [] } = useQuery({
    queryKey: ["seller-products", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("seller_id", user!.id)
        .neq("status", "deleted")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("products").update({ status: "deleted" as any }).eq("id", id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-products"] });
      toast({ title: "Product deleted" });
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 flex items-center justify-between bg-card px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <Link to="/seller"><ArrowLeft className="h-5 w-5" /></Link>
          <h1 className="text-lg font-bold">My Products</h1>
        </div>
        <Link to="/seller/products/new">
          <Button size="sm"><Plus className="mr-1 h-4 w-4" /> Add</Button>
        </Link>
      </header>

      <div className="divide-y divide-border">
        {products.map((p: any) => (
          <div key={p.id} className="flex items-center gap-3 p-4">
            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
              {p.images?.[0] ? (
                <img src={p.images[0]} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center">📦</div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{p.title}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm font-bold text-primary">${p.discount_price ?? p.price}</span>
                <Badge variant="secondary" className={statusColors[p.status] || ""}>{p.status}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">Stock: {p.stock}</p>
            </div>
            <div className="flex gap-1">
              <Link to={`/seller/products/${p.id}/edit`} className="p-2 text-muted-foreground hover:text-foreground">
                <Edit className="h-4 w-4" />
              </Link>
              <button onClick={() => deleteProduct.mutate(p.id)} className="p-2 text-muted-foreground hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
      {products.length === 0 && (
        <div className="flex flex-col items-center py-20 text-muted-foreground">
          <p>No products yet</p>
          <Link to="/seller/products/new" className="mt-2 text-primary hover:underline">Add your first product</Link>
        </div>
      )}
    </div>
  );
};

export default SellerProducts;
