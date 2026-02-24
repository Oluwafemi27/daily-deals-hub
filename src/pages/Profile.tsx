import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import {
  User, Package, MapPin, CreditCard, Settings, LogOut, Store, Shield, ChevronRight, MessageCircle, Bell, DollarSign
} from "lucide-react";

const Profile = () => {
  const { user, profile, roles, signOut } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
        <User className="h-16 w-16 text-muted-foreground" />
        <p className="text-lg font-semibold">Sign in to your account</p>
        <Button onClick={() => navigate("/auth")}>Sign in</Button>
      </div>
    );
  }

  const isSeller = roles.includes("seller");
  const isAdmin = roles.includes("admin");

  const menuItems = [
    { icon: Package, label: "My Orders", path: "/orders" },
    { icon: MapPin, label: "Addresses", path: "/addresses" },
    { icon: MessageCircle, label: "Messages", path: "/messages" },
    { icon: Bell, label: "Notifications", path: "/notifications" },
    ...(isSeller ? [
      { icon: Store, label: "Seller Dashboard", path: "/seller" },
      { icon: DollarSign, label: "Wallet", path: "/seller/wallet" },
    ] : []),
    ...(isAdmin ? [{ icon: Shield, label: "Admin Panel", path: "/admin" }] : []),
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Profile header */}
      <div className="bg-primary px-4 pb-6 pt-safe">
        <div className="flex items-center gap-4 pt-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-foreground/20 text-2xl font-bold text-primary-foreground">
            {profile?.display_name?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="text-primary-foreground">
            <h2 className="text-xl font-bold">{profile?.display_name || "User"}</h2>
            <p className="text-sm opacity-80">{user.email}</p>
            <div className="mt-1 flex gap-1.5">
              {roles.map((r) => (
                <span key={r} className="rounded-full bg-primary-foreground/20 px-2 py-0.5 text-[10px] font-semibold uppercase">
                  {r}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="divide-y divide-border bg-card mx-4 -mt-3 rounded-xl shadow-sm">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="flex items-center gap-3 px-4 py-3.5"
          >
            <item.icon className="h-5 w-5 text-muted-foreground" />
            <span className="flex-1 text-sm font-medium">{item.label}</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        ))}
      </div>

      <div className="p-4">
        <Button
          variant="outline"
          className="w-full text-destructive"
          onClick={async () => {
            await signOut();
            navigate("/");
          }}
        >
          <LogOut className="mr-2 h-4 w-4" /> Sign out
        </Button>
      </div>
    </div>
  );
};

export default Profile;
