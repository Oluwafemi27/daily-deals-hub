import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp, Wallet, MapPin, FileCheck, MessageCircle,
  Bell, Settings, User, Truck, ChevronRight, MapPinCheck, Clock
} from "lucide-react";
import BannerSlideshow from "@/components/BannerSlideshow";

const driverBanners = [
  { title: "Earn More", subtitle: "Set your own rates per km", gradient: "bg-gradient-to-r from-primary to-secondary", emoji: "💰" },
  { title: "Be Your Own Boss", subtitle: "Work whenever you want", gradient: "bg-gradient-to-br from-secondary to-accent", emoji: "🚚" },
  { title: "Get Verified", subtitle: "Complete KYC to start earning", gradient: "bg-gradient-to-r from-accent to-primary", emoji: "✓" },
];

const DriverDashboard = () => {
  const { user, roles, profile, loading } = useAuth();
  const navigate = useNavigate();
  const isDriver = roles.includes("driver");

  const { data: driverInfo, isLoading: driverInfoLoading } = useQuery({
    queryKey: ["driver-info", user?.id],
    queryFn: async () => {
      if (!user) return null;
      try {
        const { data, error } = await supabase.from("driver_profiles").select("*").eq("driver_id", user.id).maybeSingle();
        if (error) {
          console.error("Error fetching driver info:", error);
          return null;
        }
        return data;
      } catch (error) {
        console.error("Error fetching driver info:", error);
        return null;
      }
    },
    enabled: !!user && isDriver,
    staleTime: 60000, // Cache for 1 minute
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    retry: 1,
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["driver-stats", user?.id],
    queryFn: async () => {
      if (!user) return null;
      try {
        const [jobsRes, completedJobsRes, earningsRes] = await Promise.all([
          supabase.from("delivery_jobs").select("id", { count: "exact" }).eq("driver_id", user.id),
          supabase.from("delivery_jobs").select("id", { count: "exact" }).eq("driver_id", user.id).eq("status", "delivered"),
          supabase.from("driver_wallets").select("balance, total_earned").eq("driver_id", user.id).maybeSingle(),
        ]);
        return {
          totalJobs: jobsRes.count ?? 0,
          completedJobs: completedJobsRes.count ?? 0,
          balance: earningsRes.data?.balance ?? 0,
          totalEarned: earningsRes.data?.total_earned ?? 0,
        };
      } catch (error) {
        console.error("Error fetching driver stats:", error);
        return { totalJobs: 0, completedJobs: 0, balance: 0, totalEarned: 0 };
      }
    },
    enabled: !!user && isDriver,
    staleTime: 60000,
    gcTime: 5 * 60 * 1000,
    retry: 1,
  });

  // Unread notifications count - only refetch every 30 seconds instead of 5
  const { data: notificationCount = 0 } = useQuery({
    queryKey: ["unread-notifications-count", user?.id],
    queryFn: async () => {
      if (!user) return 0;
      try {
        const { count, error } = await supabase
          .from("notifications")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("is_read", false);
        if (error) {
          console.error("Error fetching notifications:", error);
          return 0;
        }
        return count ?? 0;
      } catch (error) {
        console.error("Error fetching notifications:", error);
        return 0;
      }
    },
    enabled: !!user,
    refetchInterval: 30000, // Reduced from 5000 to 30000
    staleTime: 10000,
    gcTime: 5 * 60 * 1000,
  });

  // Show loading state while auth is loading
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-muted-foreground border-t-primary rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-muted-foreground">Loading driver profile...</p>
        </div>
      </div>
    );
  }

  if (!user || !isDriver) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <p className="text-muted-foreground font-medium mb-4">Access Denied</p>
          <p className="text-sm text-muted-foreground mb-4">You need a driver account to access this page.</p>
          <Button onClick={() => navigate("/driver-auth")} className="mt-2">
            Login as Driver
          </Button>
        </div>
      </div>
    );
  }

  const quickActions = [
    { icon: MapPinCheck, label: "Active Jobs", path: "/driver/jobs", color: "text-primary" },
    { icon: Clock, label: "Available Jobs", path: "/driver/available-jobs", color: "text-success" },
    { icon: FileCheck, label: "KYC Status", path: "/driver/kyc", color: "text-blue-600" },
    { icon: Wallet, label: "Wallet", path: "/driver/wallet", color: "text-accent" },
    { icon: Truck, label: "Vehicle Info", path: "/driver/profile", color: "text-secondary" },
    { icon: MessageCircle, label: "Messages", path: "/messages", color: "text-primary" },
    { icon: Bell, label: "Notifications", path: "/notifications", color: "text-destructive" },
    { icon: Settings, label: "Settings", path: "/driver/settings", color: "text-muted-foreground" },
  ];

  return (
    <div className="min-h-screen bg-background pb-4">
      {/* Header */}
      <header className="bg-primary px-4 pb-4 pt-safe">
        <div className="flex items-center justify-between pt-3">
          <div>
            <p className="text-sm text-primary-foreground/80">Welcome back,</p>
            <h1 className="text-xl font-bold text-primary-foreground">
              {profile?.display_name || "Driver"}
            </h1>
          </div>
          <div className="flex gap-2">
            <Link to="/notifications" className="relative text-primary-foreground">
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <Badge className="absolute -right-2 -top-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-destructive text-white">
                  {notificationCount > 99 ? "99+" : notificationCount}
                </Badge>
              )}
            </Link>
            <Link to="/messages" className="text-primary-foreground">
              <MessageCircle className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Banner */}
      <BannerSlideshow slides={driverBanners} />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 px-4 mt-4">
        <Card>
          <CardContent className="flex flex-col items-center p-3">
            <Truck className="h-5 w-5 text-primary mb-1" />
            <p className="text-xl font-bold">{statsLoading ? "..." : stats?.completedJobs ?? 0}</p>
            <p className="text-[10px] text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center p-3">
            <MapPin className="h-5 w-5 text-secondary mb-1" />
            <p className="text-xl font-bold">{statsLoading ? "..." : stats?.totalJobs ?? 0}</p>
            <p className="text-[10px] text-muted-foreground">Total Jobs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center p-3">
            <TrendingUp className="h-5 w-5 text-success mb-1" />
            <p className="text-xl font-bold">{driverInfoLoading ? "..." : driverInfo?.average_rating?.toFixed(1) ?? "0"}</p>
            <p className="text-[10px] text-muted-foreground">Rating</p>
          </CardContent>
        </Card>
      </div>

      {/* Wallet Card */}
      <div className="px-4 mt-4">
        <Link to="/driver/wallet">
          <Card className="bg-gradient-to-r from-primary to-secondary text-primary-foreground">
            <CardContent className="flex items-center gap-3 p-4">
              <Wallet className="h-8 w-8" />
              <div>
                <p className="text-sm opacity-90">Wallet Balance</p>
                <p className="text-2xl font-extrabold">${stats?.balance?.toFixed(2) ?? "0.00"}</p>
              </div>
              <ChevronRight className="ml-auto h-5 w-5 opacity-60" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Quick Actions Grid */}
      <section className="px-4 mt-4">
        <h2 className="text-lg font-bold mb-3">Quick Actions</h2>
        <div className="grid grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.path}
              to={action.path}
              className="flex flex-col items-center gap-1.5 rounded-xl bg-card p-3 shadow-sm transition-shadow hover:shadow-md"
            >
              <action.icon className={`h-6 w-6 ${action.color}`} />
              <span className="text-[10px] font-medium text-center leading-tight">{action.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* KYC Status */}
      {driverInfo?.kyc_status !== 'approved' && (
        <section className="px-4 mt-4">
          <Link to="/driver/kyc" className="flex items-center gap-3 rounded-xl bg-blue-50 p-4 shadow-sm border-l-4 border-blue-500">
            <FileCheck className="h-5 w-5 text-blue-600" />
            <div className="flex-1">
              <span className="font-medium">Complete KYC Verification</span>
              <p className="text-xs text-muted-foreground">Required to accept deliveries</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        </section>
      )}

      {/* Manage Section */}
      <section className="px-4 mt-4">
        <h2 className="text-lg font-bold mb-3">Manage</h2>
        <div className="space-y-2">
          <Link to="/driver/profile" className="flex items-center gap-3 rounded-xl bg-card p-4 shadow-sm">
            <Truck className="h-5 w-5 text-muted-foreground" />
            <span className="flex-1 font-medium">Vehicle Information</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
          <Link to="/driver/wallet" className="flex items-center gap-3 rounded-xl bg-card p-4 shadow-sm">
            <Wallet className="h-5 w-5 text-muted-foreground" />
            <span className="flex-1 font-medium">Wallet & Earnings</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
          <Link to="/driver/jobs" className="flex items-center gap-3 rounded-xl bg-card p-4 shadow-sm">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <span className="flex-1 font-medium">View Jobs</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default DriverDashboard;
