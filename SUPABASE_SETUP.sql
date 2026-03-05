-- RUN THESE COMMANDS ONE BY ONE IN SUPABASE SQL EDITOR --

-- STEP 1: Add driver role to the enum
ALTER TYPE app_role ADD VALUE 'driver' IF NOT EXISTS;


-- STEP 2: Create seller_ratings table
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


-- STEP 3: Create driver_ratings table
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


-- STEP 4: Create index for seller_ratings on buyer_id
CREATE INDEX IF NOT EXISTS idx_seller_ratings_buyer_id ON public.seller_ratings(buyer_id);


-- STEP 5: Create index for seller_ratings on seller_id
CREATE INDEX IF NOT EXISTS idx_seller_ratings_seller_id ON public.seller_ratings(seller_id);


-- STEP 6: Create index for seller_ratings on order_id
CREATE INDEX IF NOT EXISTS idx_seller_ratings_order_id ON public.seller_ratings(order_id);


-- STEP 7: Create index for driver_ratings on seller_id
CREATE INDEX IF NOT EXISTS idx_driver_ratings_seller_id ON public.driver_ratings(seller_id);


-- STEP 8: Create index for driver_ratings on driver_id
CREATE INDEX IF NOT EXISTS idx_driver_ratings_driver_id ON public.driver_ratings(driver_id);


-- STEP 9: Create index for driver_ratings on order_id
CREATE INDEX IF NOT EXISTS idx_driver_ratings_order_id ON public.driver_ratings(order_id);


-- STEP 10: Enable RLS on seller_ratings table
ALTER TABLE public.seller_ratings ENABLE ROW LEVEL SECURITY;


-- STEP 11: Enable RLS on driver_ratings table
ALTER TABLE public.driver_ratings ENABLE ROW LEVEL SECURITY;


-- STEP 12: Allow everyone to view seller ratings
CREATE POLICY "Everyone can view seller ratings"
  ON public.seller_ratings
  FOR SELECT
  USING (true);


-- STEP 13: Allow buyers to create seller ratings
CREATE POLICY "Buyers can create seller ratings"
  ON public.seller_ratings
  FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);


-- STEP 14: Allow buyers to update their seller ratings
CREATE POLICY "Buyers can update seller ratings"
  ON public.seller_ratings
  FOR UPDATE
  USING (auth.uid() = buyer_id);


-- STEP 15: Allow everyone to view driver ratings
CREATE POLICY "Everyone can view driver ratings"
  ON public.driver_ratings
  FOR SELECT
  USING (true);


-- STEP 16: Allow sellers to create driver ratings
CREATE POLICY "Sellers can create driver ratings"
  ON public.driver_ratings
  FOR INSERT
  WITH CHECK (auth.uid() = seller_id);


-- STEP 17: Allow sellers to update their driver ratings
CREATE POLICY "Sellers can update driver ratings"
  ON public.driver_ratings
  FOR UPDATE
  USING (auth.uid() = seller_id);
