-- Update the handle_new_user function to allow multiple roles and ensure everyone has a buyer role by default
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  
  -- Everyone is a buyer by default to ensure they can browse and shop
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'buyer')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- If a specific role was requested in metadata (seller or driver), add it as well
  IF (NEW.raw_user_meta_data->>'role') IS NOT NULL AND (NEW.raw_user_meta_data->>'role') != 'buyer' THEN
    BEGIN
      INSERT INTO public.user_roles (user_id, role)
      VALUES (NEW.id, (NEW.raw_user_meta_data->>'role')::app_role)
      ON CONFLICT (user_id, role) DO NOTHING;
    EXCEPTION WHEN OTHERS THEN
      -- Ignore errors if the role cast fails or other issues
      NULL;
    END;
  END IF;
  
  RETURN NEW;
END;
$$;
