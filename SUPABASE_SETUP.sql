-- Step 1: Update the app_role enum to include "driver"
ALTER TYPE app_role ADD VALUE 'driver' IF NOT EXISTS;

-- Step 2: Create seller_ratings table (buyers rate sellers)
CREATE TABLE IF NOT EXISTS public.seller_ratings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id uuid NOT NULL,
  seller_id uuid NOT NULL,
  order_id uuid,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Step 3: Create driver_ratings table (sellers rate drivers)
CREATE TABLE IF NOT EXISTS public.driver_ratings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id uuid NOT NULL,
  driver_id uuid NOT NULL,
  order_id uuid,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Step 4: Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_seller_ratings_buyer_id ON public.seller_ratings(buyer_id);
CREATE INDEX IF NOT EXISTS idx_seller_ratings_seller_id ON public.seller_ratings(seller_id);
CREATE INDEX IF NOT EXISTS idx_seller_ratings_order_id ON public.seller_ratings(order_id);

CREATE INDEX IF NOT EXISTS idx_driver_ratings_seller_id ON public.driver_ratings(seller_id);
CREATE INDEX IF NOT EXISTS idx_driver_ratings_driver_id ON public.driver_ratings(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_ratings_order_id ON public.driver_ratings(order_id);

-- Step 5: Enable RLS (Row Level Security)
ALTER TABLE public.seller_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_ratings ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS policies for seller_ratings
-- Anyone authenticated can view seller ratings
CREATE POLICY "Everyone can view seller ratings"
  ON public.seller_ratings
  FOR SELECT
  USING (true);

-- Buyers can insert their own ratings
CREATE POLICY "Buyers can create seller ratings"
  ON public.seller_ratings
  FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

-- Buyers can update their own ratings
CREATE POLICY "Buyers can update their own seller ratings"
  ON public.seller_ratings
  FOR UPDATE
  USING (auth.uid() = buyer_id);

-- Step 7: Create RLS policies for driver_ratings
-- Anyone authenticated can view driver ratings
CREATE POLICY "Everyone can view driver ratings"
  ON public.driver_ratings
  FOR SELECT
  USING (true);

-- Sellers can insert their own ratings
CREATE POLICY "Sellers can create driver ratings"
  ON public.driver_ratings
  FOR INSERT
  WITH CHECK (auth.uid() = seller_id);

-- Sellers can update their own ratings
CREATE POLICY "Sellers can update their own driver ratings"
  ON public.driver_ratings
  FOR UPDATE
  USING (auth.uid() = seller_id);
