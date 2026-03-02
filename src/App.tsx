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

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/get-started" element={<GetStarted />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/admin" element={<AdminAuth />} />
                <Route path="/driver-auth" element={<DriverAuth />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/faq" element={<FAQ />} />
                {/* Admin routes - separate from buyer/seller layout */}
                <Route path="/admin-panel" element={<AdminDashboard />} />
                <Route path="/admin-panel/users" element={<AdminUsers />} />
                <Route path="/admin-panel/products" element={<AdminProducts />} />
                <Route path="/admin-panel/orders" element={<AdminOrders />} />
                <Route path="/admin-panel/categories" element={<AdminCategories />} />
                <Route path="/admin-panel/analytics" element={<AdminAnalytics />} />
                <Route path="/admin-panel/reports" element={<AdminReports />} />
                <Route path="/admin-panel/kyc" element={<AdminKYC />} />
                <Route path="/admin-panel/driver-kyc" element={<AdminDriverKYC />} />
                <Route path="/admin-panel/send-notifications" element={<AdminNotifications />} />
                <Route path="/admin-panel/activity-logs" element={<AdminActivityLogs />} />
                <Route path="/admin-panel/notifications" element={<Notifications />} />
                <Route path="/admin-panel/messages" element={<Messages />} />
                <Route path="/admin-panel/settings" element={<Settings />} />
                {/* Main app layout for buyers & sellers */}
                <Route element={<AppLayout />}>
                  <Route path="/" element={<Index />} />
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/categories/:id" element={<Categories />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/messages" element={<Messages />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/addresses" element={<Addresses />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/seller" element={<SellerDashboard />} />
                  <Route path="/seller/products" element={<SellerProducts />} />
                  <Route path="/seller/products/new" element={<AddProduct />} />
                  <Route path="/seller/wallet" element={<SellerWallet />} />
                  <Route path="/seller/orders" element={<SellerOrders />} />
                  <Route path="/seller/delivery-drivers" element={<SellerDeliveryDrivers />} />
                  <Route path="/seller/profile" element={<SellerProfile />} />
                  <Route path="/seller/kyc" element={<SellerKYC />} />
                  <Route path="/driver" element={<DriverDashboard />} />
                  <Route path="/driver/jobs" element={<DriverJobs />} />
                  <Route path="/driver/profile" element={<DriverProfile />} />
                  <Route path="/driver/kyc" element={<DriverKYC />} />
                  <Route path="/driver/wallet" element={<DriverWallet />} />
                  <Route path="/driver/settings" element={<DriverSettings />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            <CustomerServiceBot />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
