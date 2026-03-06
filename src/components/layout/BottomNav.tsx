import { Home, Grid3X3, ShoppingCart, Heart, User, Store, Package, Wallet, LayoutDashboard, MapPin, MessageCircle } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUnreadMessagesCount } from "@/hooks/useUnreadMessagesCount";

const BottomNav = () => {
  const location = useLocation();
  const { user, roles } = useAuth();
  const isSeller = roles.includes("seller");
  const isDriver = roles.includes("driver");

  const { data: cartCount = 0 } = useQuery({
    queryKey: ["cart-count", user?.id],
    queryFn: async () => {
      if (!user) return 0;
      try {
        const { count, error } = await supabase
          .from("cart_items")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);
        if (error) {
          console.error("Error fetching cart count:", error);
          return 0;
        }
        return count ?? 0;
      } catch (error) {
        console.error("Error fetching cart count:", error);
        return 0;
      }
    },
    enabled: !!user && !isSeller && !isDriver,
    staleTime: 30000, // Cache for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    retry: 1,
  });

  const { data: unreadMessages = 0 } = useUnreadMessagesCount();

  const isDriverPath = location.pathname.startsWith("/driver");
  const isSellerPath = location.pathname.startsWith("/seller");

  const buyerNav = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Grid3X3, label: "Categories", path: "/categories" },
    { icon: ShoppingCart, label: "Cart", path: "/cart", badge: cartCount },
    { icon: MessageCircle, label: "Messages", path: "/messages", badge: unreadMessages },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  const sellerNav = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/seller" },
    { icon: MessageCircle, label: "Messages", path: "/messages", badge: unreadMessages },
    { icon: Package, label: "Products", path: "/seller/products" },
    { icon: Wallet, label: "Wallet", path: "/seller/wallet" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  const driverNav = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/driver" },
    { icon: MessageCircle, label: "Messages", path: "/messages", badge: unreadMessages },
    { icon: MapPin, label: "Jobs", path: "/driver/jobs" },
    { icon: Wallet, label: "Wallet", path: "/driver/wallet" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  let navItems = buyerNav;
  if (isDriverPath && isDriver) {
    navItems = driverNav;
  } else if (isSellerPath && isSeller) {
    navItems = sellerNav;
  } else if (location.pathname === "/profile" || location.pathname === "/messages") {
    // For shared pages like Profile/Messages, stick to the current context if possible
    // or use the primary role
    if (isDriver && !isSeller) navItems = driverNav;
    else if (isSeller) navItems = sellerNav;
    else navItems = buyerNav;
  } else if (isDriver && !isSeller && !isSellerPath && !buyerNav.some(i => i.path !== "/" && location.pathname.startsWith(i.path))) {
    // If only a driver and not on a specific buyer page, default to driver nav
    navItems = driverNav;
  } else if (isSeller && !isDriver && !isDriverPath && !buyerNav.some(i => i.path !== "/" && location.pathname.startsWith(i.path))) {
    // If only a seller and not on a specific buyer page, default to seller nav
    navItems = sellerNav;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card pb-safe">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path !== "/" && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "relative flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors",
                isActive ? "text-primary font-semibold" : "text-muted-foreground"
              )}
            >
              <div className="relative">
                <item.icon className={cn("h-5 w-5", isActive && "stroke-[2.5px]")} />
                {"badge" in item && (item as any).badge > 0 && (
                  <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                    {(item as any).badge > 99 ? "99+" : (item as any).badge}
                  </span>
                )}
              </div>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
