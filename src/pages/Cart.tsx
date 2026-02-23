import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ArrowLeft, ShoppingBag } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const Cart = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: cartItems = [], isLoading } = useQuery({
    queryKey: ["cart", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("cart_items")
        .select("*, product:products(*)")
        .eq("user_id", user.id);
      return data ?? [];
    },
    enabled: !!user,
  });

  const updateQty = useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      if (quantity <= 0) {
        await supabase.from("cart_items").delete().eq("id", id);
      } else {
        await supabase.from("cart_items").update({ quantity }).eq("id", id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["cart-count"] });
    },
  });

  const removeItem = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("cart_items").delete().eq("id", id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["cart-count"] });
      toast({ title: "Removed from cart" });
    },
  });

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
        <ShoppingBag className="h-16 w-16 text-muted-foreground" />
        <p className="text-lg font-semibold">Sign in to view your cart</p>
        <Button onClick={() => navigate("/auth")}>Sign in</Button>
      </div>
    );
  }

  const subtotal = cartItems.reduce((sum: number, item: any) => {
    const price = item.product?.discount_price ?? item.product?.price ?? 0;
    return sum + price * item.quantity;
  }, 0);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 flex items-center gap-3 bg-card px-4 py-3 shadow-sm">
        <Link to="/"><ArrowLeft className="h-5 w-5" /></Link>
        <h1 className="text-lg font-bold">Cart ({cartItems.length})</h1>
      </header>

      {cartItems.length === 0 && !isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <ShoppingBag className="h-16 w-16 text-muted-foreground" />
          <p className="mt-3 text-lg font-semibold">Your cart is empty</p>
          <Link to="/" className="mt-2 text-sm text-primary hover:underline">Start shopping</Link>
        </div>
      ) : (
        <>
          <div className="divide-y divide-border">
            {cartItems.map((item: any) => (
              <div key={item.id} className="flex gap-3 p-4">
                <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                  {item.product?.images?.[0] ? (
                    <img src={item.product.images[0]} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-2xl">📦</div>
                  )}
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <p className="text-sm font-medium line-clamp-2">{item.product?.title}</p>
                    <p className="text-sm font-bold text-primary mt-0.5">
                      ${item.product?.discount_price ?? item.product?.price}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 rounded-full border border-border">
                      <button
                        onClick={() => updateQty.mutate({ id: item.id, quantity: item.quantity - 1 })}
                        className="p-1.5"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQty.mutate({ id: item.id, quantity: item.quantity + 1 })}
                        className="p-1.5"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <button onClick={() => removeItem.mutate(item.id)} className="text-muted-foreground">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="fixed bottom-20 left-0 right-0 border-t border-border bg-card p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Subtotal</span>
              <span className="text-xl font-extrabold">${subtotal.toFixed(2)}</span>
            </div>
            <Button className="w-full font-semibold" size="lg" onClick={() => navigate("/checkout")}>
              Checkout
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
