-- Rename insurance_certificate_url to drivers_license_url in driver_kyc table
ALTER TABLE public.driver_kyc 
RENAME COLUMN insurance_certificate_url TO drivers_license_url;

-- Ensure it's not null if required (optional, but good for data integrity)
-- ALTER TABLE public.driver_kyc ALTER COLUMN drivers_license_url SET NOT NULL;
