import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface RatingsDisplayProps {
  targetId: string;
  type: "seller" | "driver";
  showComments?: boolean;
}

export const RatingsDisplay = ({
  targetId,
  type,
  showComments = false,
}: RatingsDisplayProps) => {
  const table = type === "seller" ? "seller_ratings" : "driver_ratings";
  const filterColumn = type === "seller" ? "seller_id" : "driver_id";

  const { data: ratings = [], isLoading } = useQuery({
    queryKey: [`${type}-ratings`, targetId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .eq(filterColumn, targetId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-3 w-32" />
      </div>
    );
  }

  if (ratings.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No ratings yet</p>
    );
  }

  const avgRating =
    ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / ratings.length;

  return (
    <div className="space-y-3">
      {/* Average Rating */}
      <div className="flex items-center gap-2">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-4 w-4 ${
                star <= Math.round(avgRating)
                  ? "fill-accent text-accent"
                  : "text-muted-foreground"
              }`}
            />
          ))}
        </div>
        <span className="text-sm font-medium">
          {avgRating.toFixed(1)} ({ratings.length} {ratings.length === 1 ? "rating" : "ratings"})
        </span>
      </div>

      {/* Comments */}
      {showComments && ratings.some((r: any) => r.comment) && (
        <div className="space-y-2 border-t pt-3">
          {ratings
            .filter((r: any) => r.comment)
            .slice(0, 3)
            .map((rating: any) => (
              <div key={rating.id} className="text-sm">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-3 w-3 ${
                          star <= rating.rating
                            ? "fill-accent text-accent"
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(rating.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-muted-foreground">{rating.comment}</p>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};
