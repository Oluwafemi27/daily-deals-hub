import { supabase } from "@/integrations/supabase/client";

export const debugAuth = async () => {
  console.log("=== Auth Debug Info ===");

  try {
    // Get current session
    const {
      data: { session },
    } = await supabase.auth.getSession();
    console.log("Session:", session?.user?.id);

    if (session?.user) {
      // Check profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

      console.log("Profile Error:", profileError?.message);
      console.log("Profile Data:", profile);

      // Check roles
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", session.user.id);

      console.log("Roles Error:", rolesError?.message);
      console.log("Roles Data:", roles);
    }
  } catch (error) {
    console.error("Debug error:", error);
  }

  console.log("======================");
};
