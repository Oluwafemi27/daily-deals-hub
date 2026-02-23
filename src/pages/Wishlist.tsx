import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Heart, ArrowLeft, Star } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

const Wishlist = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["wishlist", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("wishlist_items")
        .select("*, product:products(*)")
        .eq("user_id", user.id);
      return data ?? [];
    },
    enabled: !!user,
  });

  const removeItem = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("wishlist_items").delete().eq("id", id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast({ title: "Removed from wishlist" });
    },
  });

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
        <Heart className="h-16 w-16 text-muted-foreground" />
        <p className="text-lg font-semibold">Sign in to view your wishlist</p>
        <Button onClick={() => navigate("/auth")}>Sign in</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 flex items-center gap-3 bg-card px-4 py-3 shadow-sm">
        <Link to="/"><ArrowLeft className="h-5 w-5" /></Link>
        <h1 className="text-lg font-bold">Wishlist ({items.length})</h1>
      </header>
      {items.length === 0 && !isLoading ? (
        <div className="flex flex-col items-center py-20">
          <Heart className="h-16 w-16 text-muted-foreground" />
          <p className="mt-3 text-lg font-semibold">Your wishlist is empty</p>
          <Link to="/" className="mt-2 text-sm text-primary hover:underline">Explore products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 md:grid-cols-4">
          {items.map((item: any) => (
            <div key={item.id} className="group relative overflow-hidden rounded-xl bg-card shadow-sm">
              <button
                onClick={() => removeItem.mutate(item.id)}
                className="absolute right-2 top-2 z-10 rounded-full bg-card/80 p-1.5"
              >
                <Heart className="h-4 w-4 fill-secondary text-secondary" />
              </button>
              <Link to={`/product/${item.product?.id}`}>
                <div className="aspect-square bg-muted">
                  {item.product?.images?.[0] ? (
                    <img src={item.product.images[0]} alt="" className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-4xl">📦</div>
                  )}
                </div>
                <div className="p-2.5">
                  <p className="text-xs line-clamp-2">{item.product?.title}</p>
                  <p className="mt-1 text-base font-extrabold text-primary">
                    ${item.product?.discount_price ?? item.product?.price}
                  </p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
