import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Truck, Eye, EyeOff } from "lucide-react";
import Footer from "@/components/layout/Footer";

const DriverAuth = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    if (!email || !password) {
      toast({
        title: "Validation error",
        description: "Please enter both email and password",
        variant: "destructive"
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Validation error",
        description: "Password must be at least 6 characters",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({ email, password });

      if (authError) {
        console.error("Auth error:", authError);
        toast({
          title: "Login failed",
          description: authError.message,
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      if (!user) {
        toast({
          title: "Login failed",
          description: "Authentication failed. Please try again.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Check if user has driver role - use maybeSingle() instead of single()
      const { data: userRoles, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "driver")
        .maybeSingle();

      if (roleError) {
        console.error("Role check error:", roleError);
        await supabase.auth.signOut();
        toast({
          title: "Error",
          description: "Could not verify driver status. Please try again.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      if (!userRoles) {
        console.warn("User has no driver role:", user.id);
        await supabase.auth.signOut();
        toast({
          title: "Access denied",
          description: "You don't have driver privileges. Please sign up as a driver first.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Success - navigate to driver dashboard
      toast({
        title: "Welcome!",
        description: "You've been signed in successfully.",
      });
      navigate("/driver");
    } catch (error) {
      console.error("Unexpected login error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    if (!displayName || !email || !password) {
      toast({
        title: "Validation error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Validation error",
        description: "Password must be at least 6 characters",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName, role: "driver" },
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) {
        console.error("Signup error:", error);
        toast({
          title: "Signup failed",
          description: error.message,
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      if (!data.user) {
        toast({
          title: "Signup failed",
          description: "Could not create account. Please try again.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      toast({
        title: "Check your email",
        description: "We sent you a confirmation link. Please verify to start delivering.",
        variant: "default"
      });

      // Reset form
      setDisplayName("");
      setEmail("");
      setPassword("");
    } catch (error) {
      console.error("Unexpected signup error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email
    if (!email) {
      toast({
        title: "Validation error",
        description: "Please enter your email address",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error("Password reset error:", error);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      toast({
        title: "Check your email",
        description: "We sent you a password reset link. Please check your inbox and spam folder."
      });
    } catch (error) {
      console.error("Unexpected password reset error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="flex-1 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-none shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent">
            <Truck className="h-7 w-7 text-accent-foreground" />
          </div>
          <CardTitle className="text-2xl font-extrabold">
            {mode === "login" ? "Driver Login" : mode === "signup" ? "Become a Driver" : "Reset password"}
          </CardTitle>
          <CardDescription>
            {mode === "login"
              ? "Sign in to your account"
              : mode === "signup"
              ? "Join our delivery team"
              : "Enter your email to reset"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={mode === "login" ? handleLogin : mode === "signup" ? handleSignup : handleForgot} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input 
                  id="name" 
                  value={displayName} 
                  onChange={(e) => setDisplayName(e.target.value)} 
                  placeholder="Your full name" 
                  required 
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="you@example.com" 
                required 
              />
            </div>
            {mode !== "forgot" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  {mode === "login" && (
                    <button 
                      type="button" 
                      onClick={() => setMode("forgot")} 
                      className="text-xs text-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}
            <Button type="submit" className="w-full font-semibold" size="lg" disabled={loading}>
              {loading
                ? "Please wait..."
                : mode === "login"
                ? "Sign in"
                : mode === "signup"
                ? "Create account"
                : "Send reset link"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            {mode === "login" ? (
              <>
                Don't have an account?{" "}
                <button onClick={() => setMode("signup")} className="text-primary font-semibold hover:underline">
                  Sign up
                </button>
              </>
            ) : mode === "signup" ? (
              <>
                Already have an account?{" "}
                <button onClick={() => setMode("login")} className="text-primary font-semibold hover:underline">
                  Sign in
                </button>
              </>
            ) : (
              <>
                Remember your password?{" "}
                <button 
                  onClick={() => setMode("login")} 
                  className="text-primary font-semibold hover:underline"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
      </div>
      <Footer />
    </div>
  );
};

export default DriverAuth;
