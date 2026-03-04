import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type UserRole = "buyer" | "seller" | "admin" | "driver";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  roles: UserRole[];
  profile: any | null;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  roles: [],
  profile: null,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [profile, setProfile] = useState<any | null>(null);

  const fetchUserData = async (userId: string) => {
    console.log("Fetching user data for:", userId);
    try {
      const [profileRes, rolesRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", userId),
      ]);

      if (profileRes.error) {
        console.warn("Failed to fetch profile:", profileRes.error.message);
      } else if (profileRes.data) {
        setProfile(profileRes.data);
      } else {
        console.log("No profile found for user:", userId);
      }

      if (rolesRes.error) {
        console.warn("Failed to fetch roles:", rolesRes.error.message);
      } else if (rolesRes.data) {
        const userRoles = rolesRes.data.map((r: any) => r.role as UserRole);
        console.log("User roles fetched:", userRoles);
        setRoles(userRoles);
      }
    } catch (error) {
      console.error("Critical error in fetchUserData:", error);
    }
  };

  const refreshProfile = async () => {
    if (user) await fetchUserData(user.id);
  };

  useEffect(() => {
    let isMounted = true;
    let sessionCheckTimeout: NodeJS.Timeout;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!isMounted) return;
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          // Fetch user data and wait for it to complete
          try {
            await fetchUserData(session.user.id);
          } catch (err) {
            console.error("Error fetching user data:", err);
          }
        } else {
          setRoles([]);
          setProfile(null);
        }
        if (isMounted) {
          console.log("Auth state change complete. Loading: false");
          setLoading(false);
        }
      }
    );

    // Set a timeout to ensure loading completes even if Supabase is slow
    sessionCheckTimeout = setTimeout(() => {
      if (isMounted && loading) {
        console.warn("Forcing auth loading to complete after timeout");
        setLoading(false);
      }
    }, 5000);

    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!isMounted) return;

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Wait for user data to be fetched
          try {
            await fetchUserData(session.user.id);
          } catch (err) {
            console.error("Error fetching user data:", err);
          }
        }
      } catch (error) {
        console.error("Failed to load session:", error);
        if (!isMounted) return;
        setSession(null);
        setUser(null);
        setRoles([]);
        setProfile(null);
      } finally {
        if (isMounted) {
          clearTimeout(sessionCheckTimeout);
          setLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
      clearTimeout(sessionCheckTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      // First clear local state immediately to prevent any UI flashing
      setUser(null);
      setSession(null);
      setRoles([]);
      setProfile(null);

      // Then sign out from Supabase (in background)
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error signing out:", error);
      }
    } catch (error) {
      console.error("Sign out error:", error);
      // Still clear state even if there was an error
      setUser(null);
      setSession(null);
      setRoles([]);
      setProfile(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, roles, profile, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
