-- Add 'driver' to app_role enum
ALTER TYPE public.app_role ADD VALUE 'driver';

-- Helper function for driver role check
CREATE OR REPLACE FUNCTION public.is_driver(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'driver')
$$;

-- Driver profiles table - extends profiles with driver-specific info
CREATE TABLE public.driver_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  vehicle_name TEXT,
  vehicle_type TEXT, -- e.g., 'motorcycle', 'car', 'van'
  license_plate TEXT,
  price_per_km NUMERIC(10,2) DEFAULT 5,
  is_available BOOLEAN DEFAULT true,
  average_rating NUMERIC(3,2) DEFAULT 0,
  total_deliveries INT DEFAULT 0,
  kyc_status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  kyc_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Driver wallets table
CREATE TABLE public.driver_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  balance NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_earned NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_withdrawn NUMERIC(10,2) NOT NULL DEFAULT 0,
  bank_account_name TEXT,
  bank_account_number TEXT,
  bank_code TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Delivery jobs table - for order assignments to drivers
CREATE TABLE public.delivery_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  driver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'available', -- 'available', 'accepted', 'picked_up', 'in_transit', 'delivered', 'cancelled'
  price NUMERIC(10,2),
  picked_up_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  delivery_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- KYC applications table for drivers
CREATE TABLE public.driver_kyc (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  id_type TEXT NOT NULL, -- 'drivers_license', 'national_id', 'passport'
  id_number TEXT NOT NULL,
  id_image_url TEXT,
  proof_of_address_url TEXT,
  vehicle_registration_url TEXT,
  insurance_certificate_url TEXT,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  rejection_reason TEXT,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Delivery ratings table
CREATE TABLE public.delivery_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_job_id UUID REFERENCES public.delivery_jobs(id) ON DELETE CASCADE NOT NULL,
  buyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  driver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (delivery_job_id, buyer_id)
);

-- Triggers
CREATE TRIGGER update_driver_profiles_updated_at BEFORE UPDATE ON public.driver_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_driver_wallets_updated_at BEFORE UPDATE ON public.driver_wallets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_delivery_jobs_updated_at BEFORE UPDATE ON public.delivery_jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_driver_kyc_updated_at BEFORE UPDATE ON public.driver_kyc
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS on new tables
ALTER TABLE public.driver_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_kyc ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for driver_profiles
CREATE POLICY "Drivers can view own profile" ON public.driver_profiles FOR SELECT TO authenticated
  USING (driver_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "Admins can view all driver profiles" ON public.driver_profiles FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));
CREATE POLICY "Sellers can view available drivers" ON public.driver_profiles FOR SELECT TO authenticated
  USING (is_available = true OR public.is_admin(auth.uid()));
CREATE POLICY "Drivers can update own profile" ON public.driver_profiles FOR UPDATE TO authenticated
  USING (driver_id = auth.uid());
CREATE POLICY "Admins can update driver profiles" ON public.driver_profiles FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()));

-- RLS Policies for driver_wallets
CREATE POLICY "Drivers can view own wallet" ON public.driver_wallets FOR SELECT TO authenticated
  USING (driver_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "Drivers can update own wallet" ON public.driver_wallets FOR UPDATE TO authenticated
  USING (driver_id = auth.uid() OR public.is_admin(auth.uid()));

-- RLS Policies for delivery_jobs
CREATE POLICY "Drivers view own delivery jobs" ON public.delivery_jobs FOR SELECT TO authenticated
  USING (driver_id = auth.uid() OR seller_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "Admins view all delivery jobs" ON public.delivery_jobs FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));
CREATE POLICY "Insert delivery jobs" ON public.delivery_jobs FOR INSERT TO authenticated
  WITH CHECK (public.is_seller(auth.uid()) OR public.is_admin(auth.uid()));
CREATE POLICY "Update own delivery jobs" ON public.delivery_jobs FOR UPDATE TO authenticated
  USING (driver_id = auth.uid() OR seller_id = auth.uid() OR public.is_admin(auth.uid()));

-- RLS Policies for driver_kyc
CREATE POLICY "Drivers view own KYC" ON public.driver_kyc FOR SELECT TO authenticated
  USING (driver_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "Drivers submit KYC" ON public.driver_kyc FOR INSERT TO authenticated
  WITH CHECK (driver_id = auth.uid() AND public.is_driver(auth.uid()));
CREATE POLICY "Drivers update own KYC" ON public.driver_kyc FOR UPDATE TO authenticated
  USING (driver_id = auth.uid());
CREATE POLICY "Admins update KYC" ON public.driver_kyc FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()));

-- RLS Policies for delivery_ratings
CREATE POLICY "Anyone can view delivery ratings" ON public.delivery_ratings FOR SELECT
  USING (true);
CREATE POLICY "Buyers can create ratings" ON public.delivery_ratings FOR INSERT TO authenticated
  WITH CHECK (buyer_id = auth.uid());
CREATE POLICY "Buyers update own ratings" ON public.delivery_ratings FOR UPDATE TO authenticated
  USING (buyer_id = auth.uid());

-- Indexes for performance
CREATE INDEX idx_driver_profiles_driver ON public.driver_profiles(driver_id);
CREATE INDEX idx_driver_profiles_available ON public.driver_profiles(is_available);
CREATE INDEX idx_driver_wallets_driver ON public.driver_wallets(driver_id);
CREATE INDEX idx_delivery_jobs_order ON public.delivery_jobs(order_id);
CREATE INDEX idx_delivery_jobs_driver ON public.delivery_jobs(driver_id);
CREATE INDEX idx_delivery_jobs_seller ON public.delivery_jobs(seller_id);
CREATE INDEX idx_delivery_jobs_status ON public.delivery_jobs(status);
CREATE INDEX idx_driver_kyc_driver ON public.driver_kyc(driver_id);
CREATE INDEX idx_driver_kyc_status ON public.driver_kyc(status);
CREATE INDEX idx_delivery_ratings_driver ON public.delivery_ratings(driver_id);
CREATE INDEX idx_delivery_ratings_delivery_job ON public.delivery_ratings(delivery_job_id);
