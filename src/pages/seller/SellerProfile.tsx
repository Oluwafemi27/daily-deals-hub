import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Store } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

const SellerProfile = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [storeName, setStoreName] = useState(profile?.store_name || "");
  const [storeDesc, setStoreDesc] = useState(profile?.store_description || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    await supabase
      .from("profiles")
      .update({ store_name: storeName, store_description: storeDesc })
      .eq("user_id", user.id);
    await refreshProfile();
    setSaving(false);
    toast({ title: "Store profile updated!" });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 flex items-center gap-3 bg-card px-4 py-3 shadow-sm">
        <Link to="/seller"><ArrowLeft className="h-5 w-5" /></Link>
        <h1 className="text-lg font-bold">Store Profile</h1>
      </header>
      <div className="p-4 space-y-4">
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <Store className="h-10 w-10 text-primary" />
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-1 block">Store Name</label>
            <Input value={storeName} onChange={(e) => setStoreName(e.target.value)} placeholder="My Store" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Store Description</label>
            <Textarea value={storeDesc} onChange={(e) => setStoreDesc(e.target.value)} placeholder="Tell buyers about your store..." rows={4} />
          </div>
          <Button className="w-full" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SellerProfile;
