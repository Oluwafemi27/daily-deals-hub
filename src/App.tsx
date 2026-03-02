import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import AppLayout from "@/components/layout/AppLayout";
import CustomerServiceBot from "@/components/CustomerServiceBot";
import ErrorBoundary from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AdminAuth from "./pages/AdminAuth";
import DriverAuth from "./pages/DriverAuth";
import ResetPassword from "./pages/ResetPassword";
import Categories from "./pages/Categories";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Profile from "./pages/Profile";
import ProductDetail from "./pages/ProductDetail";
import Messages from "./pages/Messages";
import Notifications from "./pages/Notifications";
import Orders from "./pages/Orders";
import Addresses from "./pages/Addresses";
import Settings from "./pages/Settings";
import SellerDashboard from "./pages/seller/SellerDashboard";
import SellerProducts from "./pages/seller/SellerProducts";
import AddProduct from "./pages/seller/AddProduct";
import SellerWallet from "./pages/seller/SellerWallet";
import SellerOrders from "./pages/seller/SellerOrders";
import SellerProfile from "./pages/seller/SellerProfile";
import SellerKYC from "./pages/seller/SellerKYC";
import SellerDeliveryDrivers from "./pages/seller/SellerDeliveryDrivers";
import DriverDashboard from "./pages/driver/DriverDashboard";
import DriverJobs from "./pages/driver/DriverJobs";
import DriverProfile from "./pages/driver/DriverProfile";
import DriverKYC from "./pages/driver/DriverKYC";
import DriverWallet from "./pages/driver/DriverWallet";
import DriverSettings from "./pages/driver/DriverSettings";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminReports from "./pages/admin/AdminReports";
import AdminKYC from "./pages/admin/AdminKYC";
import AdminDriverKYC from "./pages/admin/AdminDriverKYC";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminActivityLogs from "./pages/admin/AdminActivityLogs";
import FAQ from "./pages/FAQ";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
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
            <CustomerServiceBot />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
