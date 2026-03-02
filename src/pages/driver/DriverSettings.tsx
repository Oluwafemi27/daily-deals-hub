import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, LogOut, Smartphone } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

const DriverSettings = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
    toast({ title: "Logged out successfully" });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 flex items-center gap-3 bg-card px-4 py-3 shadow-sm">
        <Link to="/driver"><ArrowLeft className="h-5 w-5" /></Link>
        <h1 className="text-lg font-bold">Settings</h1>
      </header>

      <div className="p-4 space-y-4">
        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link to="/driver/profile" className="flex items-center justify-between p-3 hover:bg-muted rounded-lg transition-colors">
              <span className="text-sm font-medium">Edit Profile</span>
              <span>→</span>
            </Link>
            <Link to="/driver/kyc" className="flex items-center justify-between p-3 hover:bg-muted rounded-lg transition-colors">
              <span className="text-sm font-medium">KYC Verification</span>
              <span>→</span>
            </Link>
            <Link to="/driver/wallet" className="flex items-center justify-between p-3 hover:bg-muted rounded-lg transition-colors">
              <span className="text-sm font-medium">Bank Details</span>
              <span>→</span>
            </Link>
          </CardContent>
        </Card>

        {/* App Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">App</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between p-3 hover:bg-muted rounded-lg transition-colors">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Notifications</span>
              </div>
              <span className="text-sm text-muted-foreground">Enabled</span>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-base text-red-800">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              variant="destructive" 
              className="w-full gap-2"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Log Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DriverSettings;
