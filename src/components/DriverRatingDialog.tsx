import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface DriverRatingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  driverId: string;
  driverName?: string;
  orderId?: string;
}

export const DriverRatingDialog = ({
  open,
  onOpenChange,
  driverId,
  driverName,
  orderId,
}: DriverRatingDialogProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");

  const submitRating = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      if (rating === 0) throw new Error("Please select a rating");

      const { error } = await supabase.from("driver_ratings").insert({
        seller_id: user.id,
        driver_id: driverId,
        order_id: orderId || null,
        rating,
        comment: comment.trim() || null,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Rating submitted",
        description: "Thank you for rating this driver!",
      });
      setRating(0);
      setComment("");
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ["driver-ratings", driverId] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit rating",
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rate Driver</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {driverName && (
            <p className="text-sm text-muted-foreground">
              Rating: <span className="font-medium text-foreground">{driverName}</span>
            </p>
          )}

          {/* Star Rating */}
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={cn(
                    "h-8 w-8",
                    (hoveredRating || rating) >= star
                      ? "fill-accent text-accent"
                      : "text-muted-foreground"
                  )}
                />
              </button>
            ))}
          </div>

          {rating > 0 && (
            <p className="text-center text-sm font-medium">
              {rating} out of 5 stars
            </p>
          )}

          {/* Comment */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Comment (optional)</label>
            <Textarea
              placeholder="Share your experience with this driver..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-24"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={() => submitRating.mutate()}
            disabled={rating === 0 || submitRating.isPending}
          >
            {submitRating.isPending ? "Submitting..." : "Submit Rating"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
