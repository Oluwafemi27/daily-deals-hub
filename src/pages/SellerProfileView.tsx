import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Star, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ContactButton } from "@/components/ContactButton";

const SellerProfileView = () => {
  const { sellerId } = useParams();

  const { data: seller, isLoading: sellerLoading } = useQuery({
    queryKey: ["seller", sellerId],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", sellerId!)
        .maybeSingle();
      return data;
    },
    enabled: !!sellerId,
  });

  const { data: sellerProducts = [] } = useQuery({
    queryKey: ["seller-products", sellerId],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("seller_id", sellerId!)
        .eq("status", "active")
        .limit(10);
      return data ?? [];
    },
    enabled: !!sellerId,
  });

  const { data: ratings = [] } = useQuery({
    queryKey: ["seller-ratings", sellerId],
    queryFn: async () => {
      const { data } = await supabase
        .from("seller_ratings")
        .select("*, buyer:profiles!buyer_id(display_name, avatar_url)")
        .eq("seller_id", sellerId!)
        .order("created_at", { ascending: false })
        .limit(10);
      return data ?? [];
    },
    enabled: !!sellerId,
  });

  if (sellerLoading) {
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

  if (!seller) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Seller not found</p>
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
        <h1 className="text-lg font-bold">Seller Profile</h1>
      </div>

      {/* Seller Info */}
      <Card className="m-4">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="h-20 w-20 rounded-full overflow-hidden bg-muted flex-shrink-0">
              {seller.avatar_url ? (
                <img src={seller.avatar_url} alt={seller.store_name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-2xl">🏪</div>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{seller.store_name || seller.display_name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{avgRating}</span>
                </div>
                <span className="text-sm text-muted-foreground">({ratings.length} reviews)</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">{sellerProducts.length} products</p>
            </div>
          </div>
          {seller.store_description && (
            <p className="mt-4 text-sm text-muted-foreground">{seller.store_description}</p>
          )}
        </CardContent>
      </Card>

      {/* Products */}
      <div className="px-4">
        <h3 className="text-lg font-bold mb-3">Products</h3>
        <div className="grid grid-cols-2 gap-3">
          {sellerProducts.map((product: any) => (
            <Link key={product.id} to={`/product/${product.id}`}>
              <Card className="overflow-hidden">
                <div className="aspect-square bg-muted overflow-hidden">
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">📦</div>
                  )}
                </div>
                <CardContent className="p-2">
                  <p className="text-xs font-semibold truncate">{product.title}</p>
                  <p className="text-sm font-bold text-primary">${product.price}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Ratings */}
      <div className="px-4 mt-6">
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
                      {rating.buyer?.avatar_url ? (
                        <img
                          src={rating.buyer.avatar_url}
                          alt={rating.buyer.display_name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-lg">👤</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold">{rating.buyer?.display_name}</p>
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

      {/* Contact */}
      <div className="px-4 mt-6 mb-4">
        <ContactButton
          targetUserId={sellerId!}
          targetUserName={seller.store_name || seller.display_name}
          className="w-full"
          label="Contact Seller"
        />
      </div>
    </div>
  );
};

export default SellerProfileView;
