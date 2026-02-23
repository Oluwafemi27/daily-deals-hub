import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Heart, ShoppingCart, Star, Share2, Minus, Plus, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const ProductDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedImage, setSelectedImage] = useState(0);
  const [qty, setQty] = useState(1);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*").eq("id", id).single();
      return data;
    },
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["reviews", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("reviews")
        .select("*, profile:profiles(display_name, avatar_url)")
        .eq("product_id", id!)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!id,
  });

  const { data: isWishlisted = false } = useQuery({
    queryKey: ["wishlist-check", id, user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data } = await supabase
        .from("wishlist_items")
        .select("id")
        .eq("user_id", user.id)
        .eq("product_id", id!)
        .maybeSingle();
      return !!data;
    },
    enabled: !!user && !!id,
  });

  const addToCart = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not logged in");
      const { error } = await supabase.from("cart_items").upsert(
        { user_id: user.id, product_id: id!, quantity: qty },
        { onConflict: "user_id,product_id" }
      );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["cart-count"] });
      toast({ title: "Added to cart!", description: `${qty} item(s) added` });
    },
    onError: () => {
      toast({ title: "Please sign in first", variant: "destructive" });
      navigate("/auth");
    },
  });

  const toggleWishlist = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not logged in");
      if (isWishlisted) {
        await supabase.from("wishlist_items").delete().eq("user_id", user.id).eq("product_id", id!);
      } else {
        await supabase.from("wishlist_items").insert({ user_id: user.id, product_id: id! });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      queryClient.invalidateQueries({ queryKey: ["wishlist-check"] });
      toast({ title: isWishlisted ? "Removed from wishlist" : "Added to wishlist" });
    },
    onError: () => navigate("/auth"),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Skeleton className="aspect-square w-full" />
        <div className="space-y-3 p-4">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Product not found</p>
      </div>
    );
  }

  const images = product.images?.length ? product.images : [];
  const discount = product.discount_price && product.discount_price < product.price
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 flex items-center justify-between bg-card/80 backdrop-blur-md px-4 py-3">
        <Link to="/" className="rounded-full bg-card p-2 shadow-sm"><ArrowLeft className="h-5 w-5" /></Link>
        <div className="flex gap-2">
          <button onClick={() => toggleWishlist.mutate()} className="rounded-full bg-card p-2 shadow-sm">
            <Heart className={cn("h-5 w-5", isWishlisted && "fill-secondary text-secondary")} />
          </button>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="relative aspect-square bg-muted">
        {images[selectedImage] ? (
          <img src={images[selectedImage]} alt={product.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-6xl">📦</div>
        )}
        {discount > 0 && (
          <Badge className="absolute left-3 top-3 bg-secondary text-secondary-foreground">-{discount}%</Badge>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 p-3 overflow-x-auto scrollbar-hide">
          {images.map((img: string, i: number) => (
            <button
              key={i}
              onClick={() => setSelectedImage(i)}
              className={cn(
                "h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2",
                i === selectedImage ? "border-primary" : "border-transparent"
              )}
            >
              <img src={img} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Info */}
      <div className="p-4 space-y-4">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-primary">${product.discount_price ?? product.price}</span>
            {discount > 0 && <span className="text-sm text-muted-foreground line-through">${product.price}</span>}
          </div>
          <h1 className="mt-2 text-base font-semibold leading-snug">{product.title}</h1>
        </div>

        {product.rating_count > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={cn("h-4 w-4", i < Math.round(product.rating_avg) ? "fill-accent text-accent" : "text-muted")} />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">{product.rating_avg} ({product.rating_count} reviews)</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm">
          {product.stock > 0 ? (
            <span className="flex items-center gap-1 text-success"><Check className="h-4 w-4" /> In stock ({product.stock})</span>
          ) : (
            <span className="text-destructive font-medium">Out of stock</span>
          )}
          {product.sales_count > 0 && <span className="text-muted-foreground">· {product.sales_count}+ sold</span>}
        </div>

        {product.description && (
          <div>
            <h3 className="text-sm font-semibold mb-1">Description</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-line">{product.description}</p>
          </div>
        )}

        {/* Reviews */}
        {reviews.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-2">Reviews ({reviews.length})</h3>
            <div className="space-y-3">
              {reviews.slice(0, 5).map((review: any) => (
                <div key={review.id} className="rounded-lg bg-muted p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">{review.profile?.display_name || "User"}</span>
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={cn("h-3 w-3", i < review.rating ? "fill-accent text-accent" : "text-muted-foreground")} />
                      ))}
                    </div>
                  </div>
                  {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-20 left-0 right-0 flex items-center gap-3 border-t border-border bg-card p-4">
        <div className="flex items-center gap-2 rounded-full border border-border">
          <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-2"><Minus className="h-4 w-4" /></button>
          <span className="w-8 text-center font-semibold">{qty}</span>
          <button onClick={() => setQty(qty + 1)} className="p-2"><Plus className="h-4 w-4" /></button>
        </div>
        <Button
          className="flex-1 font-semibold"
          size="lg"
          disabled={product.stock <= 0}
          onClick={() => addToCart.mutate()}
        >
          <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
        </Button>
      </div>
    </div>
  );
};

export default ProductDetail;
