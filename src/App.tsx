import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import AppLayout from "@/components/layout/AppLayout";
import CustomerServiceBot from "@/components/CustomerServiceBot";
import ErrorBoundary from "@/components/ErrorBoundary";

// Lazy load all page components
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const AdminAuth = lazy(() => import("./pages/AdminAuth"));
const DriverAuth = lazy(() => import("./pages/DriverAuth"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Categories = lazy(() => import("./pages/Categories"));
const Cart = lazy(() => import("./pages/Cart"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const Profile = lazy(() => import("./pages/Profile"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Messages = lazy(() => import("./pages/Messages"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Orders = lazy(() => import("./pages/Orders"));
const Addresses = lazy(() => import("./pages/Addresses"));
const Settings = lazy(() => import("./pages/Settings"));
const SellerDashboard = lazy(() => import("./pages/seller/SellerDashboard"));
const SellerProducts = lazy(() => import("./pages/seller/SellerProducts"));
const AddProduct = lazy(() => import("./pages/seller/AddProduct"));
const SellerWallet = lazy(() => import("./pages/seller/SellerWallet"));
const SellerOrders = lazy(() => import("./pages/seller/SellerOrders"));
const SellerProfile = lazy(() => import("./pages/seller/SellerProfile"));
const SellerKYC = lazy(() => import("./pages/seller/SellerKYC"));
const SellerDeliveryDrivers = lazy(() => import("./pages/seller/SellerDeliveryDrivers"));
const SellerProfileView = lazy(() => import("./pages/SellerProfileView"));
const DriverProfileView = lazy(() => import("./pages/DriverProfileView"));
const DriverDashboard = lazy(() => import("./pages/driver/DriverDashboard"));
const DriverJobs = lazy(() => import("./pages/driver/DriverJobs"));
const DriverProfile = lazy(() => import("./pages/driver/DriverProfile"));
const DriverKYC = lazy(() => import("./pages/driver/DriverKYC"));
const DriverWallet = lazy(() => import("./pages/driver/DriverWallet"));
const DriverSettings = lazy(() => import("./pages/driver/DriverSettings"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminCategories = lazy(() => import("./pages/admin/AdminCategories"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminReports = lazy(() => import("./pages/admin/AdminReports"));
const AdminKYC = lazy(() => import("./pages/admin/AdminKYC"));
const AdminDriverKYC = lazy(() => import("./pages/admin/AdminDriverKYC"));
const AdminNotifications = lazy(() => import("./pages/admin/AdminNotifications"));
const AdminActivityLogs = lazy(() => import("./pages/admin/AdminActivityLogs"));
const FAQ = lazy(() => import("./pages/FAQ"));
const GetStarted = lazy(() => import("./pages/GetStarted"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Loading fallback component - shows immediately for better perceived performance
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="text-center">
      <div className="w-8 h-8 border-4 border-muted-foreground border-t-primary rounded-full animate-spin mx-auto mb-3"></div>
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  </div>
);

// Minimal loading fallback for nested routes
const PageLoadingFallback = () => (
  <div className="flex items-center justify-center p-8">
    <div className="text-center">
      <div className="w-5 h-5 border-2 border-muted-foreground border-t-primary rounded-full animate-spin mx-auto mb-2"></div>
      <p className="text-xs text-muted-foreground">Loading...</p>
    </div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      retry: 1, // Retry failed queries once
      refetchOnWindowFocus: false, // Don't refetch on window focus
    },
  },
});

// App content component - wrapped with providers
const AppContent = () => (
  <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <Routes>
      {/* Auth routes */}
      <Route path="/get-started" element={<Suspense fallback={<LoadingFallback />}><GetStarted /></Suspense>} />
      <Route path="/auth" element={<Suspense fallback={<LoadingFallback />}><Auth /></Suspense>} />
      <Route path="/admin" element={<Suspense fallback={<LoadingFallback />}><AdminAuth /></Suspense>} />
      <Route path="/driver-auth" element={<Suspense fallback={<LoadingFallback />}><DriverAuth /></Suspense>} />
      <Route path="/reset-password" element={<Suspense fallback={<LoadingFallback />}><ResetPassword /></Suspense>} />
      <Route path="/faq" element={<Suspense fallback={<PageLoadingFallback />}><FAQ /></Suspense>} />

      {/* Admin routes - separate from buyer/seller layout */}
      <Route path="/admin-panel" element={<Suspense fallback={<LoadingFallback />}><AdminDashboard /></Suspense>} />
      <Route path="/admin-panel/users" element={<Suspense fallback={<PageLoadingFallback />}><AdminUsers /></Suspense>} />
      <Route path="/admin-panel/products" element={<Suspense fallback={<PageLoadingFallback />}><AdminProducts /></Suspense>} />
      <Route path="/admin-panel/orders" element={<Suspense fallback={<PageLoadingFallback />}><AdminOrders /></Suspense>} />
      <Route path="/admin-panel/categories" element={<Suspense fallback={<PageLoadingFallback />}><AdminCategories /></Suspense>} />
      <Route path="/admin-panel/analytics" element={<Suspense fallback={<PageLoadingFallback />}><AdminAnalytics /></Suspense>} />
      <Route path="/admin-panel/reports" element={<Suspense fallback={<PageLoadingFallback />}><AdminReports /></Suspense>} />
      <Route path="/admin-panel/kyc" element={<Suspense fallback={<PageLoadingFallback />}><AdminKYC /></Suspense>} />
      <Route path="/admin-panel/driver-kyc" element={<Suspense fallback={<PageLoadingFallback />}><AdminDriverKYC /></Suspense>} />
      <Route path="/admin-panel/send-notifications" element={<Suspense fallback={<PageLoadingFallback />}><AdminNotifications /></Suspense>} />
      <Route path="/admin-panel/activity-logs" element={<Suspense fallback={<PageLoadingFallback />}><AdminActivityLogs /></Suspense>} />
      <Route path="/admin-panel/notifications" element={<Suspense fallback={<PageLoadingFallback />}><Notifications /></Suspense>} />
      <Route path="/admin-panel/messages" element={<Suspense fallback={<PageLoadingFallback />}><Messages /></Suspense>} />
      <Route path="/admin-panel/settings" element={<Suspense fallback={<PageLoadingFallback />}><Settings /></Suspense>} />

      {/* Main app layout for buyers & sellers */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<Suspense fallback={<PageLoadingFallback />}><Index /></Suspense>} />
        <Route path="/categories" element={<Suspense fallback={<PageLoadingFallback />}><Categories /></Suspense>} />
        <Route path="/categories/:id" element={<Suspense fallback={<PageLoadingFallback />}><Categories /></Suspense>} />
        <Route path="/cart" element={<Suspense fallback={<PageLoadingFallback />}><Cart /></Suspense>} />
        <Route path="/wishlist" element={<Suspense fallback={<PageLoadingFallback />}><Wishlist /></Suspense>} />
        <Route path="/profile" element={<Suspense fallback={<PageLoadingFallback />}><Profile /></Suspense>} />
        <Route path="/product/:id" element={<Suspense fallback={<PageLoadingFallback />}><ProductDetail /></Suspense>} />
        <Route path="/seller/:sellerId" element={<Suspense fallback={<PageLoadingFallback />}><SellerProfileView /></Suspense>} />
        <Route path="/driver/:driverId" element={<Suspense fallback={<PageLoadingFallback />}><DriverProfileView /></Suspense>} />
        <Route path="/messages" element={<Suspense fallback={<PageLoadingFallback />}><Messages /></Suspense>} />
        <Route path="/notifications" element={<Suspense fallback={<PageLoadingFallback />}><Notifications /></Suspense>} />
        <Route path="/orders" element={<Suspense fallback={<PageLoadingFallback />}><Orders /></Suspense>} />
        <Route path="/addresses" element={<Suspense fallback={<PageLoadingFallback />}><Addresses /></Suspense>} />
        <Route path="/settings" element={<Suspense fallback={<PageLoadingFallback />}><Settings /></Suspense>} />
        <Route path="/seller" element={<Suspense fallback={<PageLoadingFallback />}><SellerDashboard /></Suspense>} />
        <Route path="/seller/products" element={<Suspense fallback={<PageLoadingFallback />}><SellerProducts /></Suspense>} />
        <Route path="/seller/products/new" element={<Suspense fallback={<PageLoadingFallback />}><AddProduct /></Suspense>} />
        <Route path="/seller/wallet" element={<Suspense fallback={<PageLoadingFallback />}><SellerWallet /></Suspense>} />
        <Route path="/seller/orders" element={<Suspense fallback={<PageLoadingFallback />}><SellerOrders /></Suspense>} />
        <Route path="/seller/delivery-drivers" element={<Suspense fallback={<PageLoadingFallback />}><SellerDeliveryDrivers /></Suspense>} />
        <Route path="/seller/profile" element={<Suspense fallback={<PageLoadingFallback />}><SellerProfile /></Suspense>} />
        <Route path="/seller/kyc" element={<Suspense fallback={<PageLoadingFallback />}><SellerKYC /></Suspense>} />
        <Route path="/driver" element={<Suspense fallback={<PageLoadingFallback />}><DriverDashboard /></Suspense>} />
        <Route path="/driver/jobs" element={<Suspense fallback={<PageLoadingFallback />}><DriverJobs /></Suspense>} />
        <Route path="/driver/profile" element={<Suspense fallback={<PageLoadingFallback />}><DriverProfile /></Suspense>} />
        <Route path="/driver/kyc" element={<Suspense fallback={<PageLoadingFallback />}><DriverKYC /></Suspense>} />
        <Route path="/driver/wallet" element={<Suspense fallback={<PageLoadingFallback />}><DriverWallet /></Suspense>} />
        <Route path="/driver/settings" element={<Suspense fallback={<PageLoadingFallback />}><DriverSettings /></Suspense>} />
      </Route>

      <Route path="*" element={<Suspense fallback={<LoadingFallback />}><NotFound /></Suspense>} />
    </Routes>
    <CustomerServiceBot />
  </BrowserRouter>
);

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppContent />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
