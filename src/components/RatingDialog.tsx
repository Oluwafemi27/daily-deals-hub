import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Star, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

interface RatingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRatingSubmitted?: () => void;
  rateeId: string;
  rateeName?: string;
  orderId?: string;
  deliveryJobId?: string;
  type: "seller" | "driver"; // "seller" for buyer->seller, "driver" for seller->driver
}

export const RatingDialog = ({
  isOpen,
  onClose,
  onRatingSubmitted,
  rateeId,
  rateeName,
  orderId,
  deliveryJobId,
  type,
}: RatingDialogProps) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const queryClient = useQueryClient();

  const submitRating = useMutation({
    mutationFn: async () => {
      if (type === "seller") {
        // Buyer rating seller
        await supabase.from("buyer_seller_ratings").insert({
          seller_id: rateeId,
          rating,
          comment: comment || null,
          order_id: orderId!,
        });
      } else {
        // Seller rating driver
        await supabase.from("seller_driver_ratings").insert({
          driver_id: rateeId,
          rating,
          comment: comment || null,
          delivery_job_id: deliveryJobId!,
        });
      }
    },
    onSuccess: () => {
      toast({ title: "Rating submitted!", description: "Thank you for your feedback" });
      queryClient.invalidateQueries({ queryKey: [`${type}-ratings`] });
      setRating(0);
      setComment("");
      onRatingSubmitted?.();
      onClose();
    },
    onError: (error: any) => {
      if (error.message?.includes("unique")) {
        toast({ title: "Already rated", description: "You've already rated this.", variant: "destructive" });
      } else {
        toast({ title: "Error", description: "Failed to submit rating", variant: "destructive" });
      }
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/50 animate-in fade-in-0">
      <div className="w-full rounded-t-2xl bg-background p-6 shadow-lg animate-in slide-in-from-bottom-2">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold">Rate {rateeName || "this " + type}</h2>
            <p className="text-xs text-muted-foreground mt-1">
              {type === "seller"
                ? "How was your experience with this seller?"
                : "How was the delivery service?"}
            </p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Stars */}
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                onClick={() => setRating(value)}
                onMouseEnter={() => setHoverRating(value)}
                onMouseLeave={() => setHoverRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`h-10 w-10 ${
                    value <= (hoverRating || rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground"
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Comment */}
          <div>
            <label className="text-sm font-medium block mb-2">Comments (optional)</label>
            <Textarea
              placeholder="Share your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="h-24 resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={() => submitRating.mutate()}
              disabled={!rating || submitRating.isPending}
              className="flex-1"
            >
              {submitRating.isPending ? "Submitting..." : "Submit Rating"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
