import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useEnsureProfile = () => {
  const { user, refreshProfile } = useAuth();

  useEffect(() => {
    const ensureProfile = async () => {
      if (!user) return;

      try {
        // Check if profile exists
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();

        // If profile doesn't exist, create it
        if (!profile && !profileError) {
          console.log("Creating missing profile for user:", user.id);
          const { error: insertError } = await supabase.from("profiles").insert({
            user_id: user.id,
            display_name: user.user_metadata?.display_name || user.email,
          });
          if (insertError) {
            console.error("Failed to create profile:", insertError);
          } else {
            await refreshProfile();
          }
        }

        // Check if roles exist
        const { data: roles, error: rolesError } = await supabase
          .from("user_roles")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();

        // If roles don't exist, create them
        if (!roles && !rolesError) {
          console.log("Creating missing roles for user:", user.id);
          const { error: insertError } = await supabase.from("user_roles").insert({
            user_id: user.id,
            role: user.user_metadata?.role || "buyer",
          });
          if (insertError) {
            console.error("Failed to create role:", insertError);
          } else {
            await refreshProfile();
          }
        }
      } catch (error) {
        console.error("Error ensuring profile:", error);
      }
    };

    ensureProfile();
  }, [user, refreshProfile]);
};
