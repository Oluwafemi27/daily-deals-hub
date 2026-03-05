import { useRef, useState, useCallback, ReactNode } from "react";
import { RefreshCw } from "lucide-react";

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  threshold?: number;
}

export const PullToRefresh = ({
  children,
  onRefresh,
  threshold = 80,
}: PullToRefreshProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startYRef = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const scrollTop = containerRef.current?.scrollTop || 0;
    if (scrollTop === 0) {
      startYRef.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startYRef.current === null || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const distance = currentY - startYRef.current;

    if (distance > 0) {
      e.preventDefault();
      // Cap the pull distance at 150px for visual effect
      setPullDistance(Math.min(distance, 150));
    }
  };

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance > threshold && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
    startYRef.current = null;
  }, [pullDistance, threshold, onRefresh, isRefreshing]);

  const rotateAngle = Math.min((pullDistance / threshold) * 180, 180);

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative overflow-y-auto"
      style={{ overscrollBehavior: "contain" }}
    >
      {/* Pull indicator */}
      {pullDistance > 0 && (
        <div
          className="sticky top-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm transition-all"
          style={{
            height: `${pullDistance}px`,
            opacity: Math.min(pullDistance / threshold, 1),
          }}
        >
          <RefreshCw
            className="h-6 w-6 text-primary transition-transform"
            style={{
              transform: `rotate(${rotateAngle}deg)`,
            }}
          />
        </div>
      )}

      {/* Loading indicator */}
      {isRefreshing && (
        <div className="sticky top-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm py-4">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-primary animate-spin" />
            <span className="text-sm text-muted-foreground">Refreshing...</span>
          </div>
        </div>
      )}

      {/* Content */}
      <div
        style={{
          transform: `translateY(${Math.min(pullDistance, 80)}px)`,
          transition: isRefreshing ? "none" : "transform 0.3s ease-out",
        }}
      >
        {children}
      </div>
    </div>
  );
};
