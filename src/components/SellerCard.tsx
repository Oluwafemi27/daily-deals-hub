import { Star, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RatingsDisplay } from "@/components/RatingsDisplay";
import { ContactButton } from "@/components/ContactButton";

interface SellerCardProps {
  sellerId: string;
  sellerName: string;
  location?: string;
  storeName?: string;
  storeDescription?: string;
  productCount?: number;
  showContact?: boolean;
  showRating?: boolean;
}

export const SellerCard = ({
  sellerId,
  sellerName,
  location,
  storeName,
  storeDescription,
  productCount = 0,
  showContact = true,
  showRating = true,
}: SellerCardProps) => {
  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        {/* Seller Info */}
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
            {sellerName[0]?.toUpperCase()}
          </div>
          <div className="flex-1">
            <Link
              to={`/seller/${sellerId}`}
              className="text-sm font-semibold hover:underline"
            >
              {storeName || sellerName}
            </Link>
            {location && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <MapPin className="h-3 w-3" />
                {location}
              </div>
            )}
          </div>
        </div>

        {/* Store Description */}
        {storeDescription && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {storeDescription}
          </p>
        )}

        {/* Ratings */}
        {showRating && (
          <div className="py-2 border-t border-border">
            <RatingsDisplay targetId={sellerId} type="seller" />
          </div>
        )}

        {/* Product Count */}
        {productCount > 0 && (
          <p className="text-xs text-muted-foreground">
            {productCount} product{productCount !== 1 ? "s" : ""} available
          </p>
        )}

        {/* Actions */}
        {showContact && (
          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" className="flex-1" asChild>
              <Link to={`/seller/${sellerId}`}>View Store</Link>
            </Button>
            <ContactButton
              targetUserId={sellerId}
              targetUserName={storeName || sellerName}
              size="sm"
              variant="default"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
