-- Add foreign key constraint to notifications table
ALTER TABLE public.notifications
ADD CONSTRAINT notifications_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Fix seller_wallets foreign key if missing
ALTER TABLE public.seller_wallets
ADD CONSTRAINT seller_wallets_seller_id_fkey 
FOREIGN KEY (seller_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Ensure RLS policy for system to insert notifications works for admin
CREATE POLICY "Admin can insert notifications"
ON public.notifications FOR INSERT
WITH CHECK (public.is_admin(auth.uid()));
