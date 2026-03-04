-- Add price_per_mile column to driver_profiles
ALTER TABLE public.driver_profiles 
ADD COLUMN price_per_mile NUMERIC(10,2) DEFAULT 8.05;

-- Backfill price_per_mile from price_per_km (1 mile = 1.60934 km)
UPDATE public.driver_profiles
SET price_per_mile = ROUND(price_per_km * 1.60934, 2)
WHERE price_per_mile IS NULL AND price_per_km IS NOT NULL;
