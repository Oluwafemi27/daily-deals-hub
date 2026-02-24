import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Wallet, ArrowLeft, TrendingUp, ArrowDownToLine } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const SellerWallet = () => {
  const { user } = useAuth();

  const { data: wallet } = useQuery({
    queryKey: ["seller-wallet", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("seller_wallets")
        .select("*")
        .eq("seller_id", user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 flex items-center gap-3 bg-card px-4 py-3 shadow-sm">
        <Link to="/seller"><ArrowLeft className="h-5 w-5" /></Link>
        <h1 className="text-lg font-bold">Wallet</h1>
      </header>

      <div className="p-4 space-y-4">
        <Card className="bg-gradient-to-br from-primary to-secondary text-primary-foreground">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Wallet className="h-5 w-5" />
              <span className="text-sm font-medium opacity-90">Available Balance</span>
            </div>
            <p className="text-4xl font-extrabold">${wallet?.balance?.toFixed(2) ?? "0.00"}</p>
            <div className="mt-4 flex gap-3">
              <Button size="sm" variant="secondary" className="flex-1">
                <ArrowDownToLine className="mr-1 h-4 w-4" /> Withdraw
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="flex flex-col items-center p-4">
              <TrendingUp className="h-5 w-5 text-success mb-1" />
              <p className="text-xl font-bold">${wallet?.total_earned?.toFixed(2) ?? "0.00"}</p>
              <p className="text-xs text-muted-foreground">Total Earned</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center p-4">
              <ArrowDownToLine className="h-5 w-5 text-primary mb-1" />
              <p className="text-xl font-bold">${wallet?.total_withdrawn?.toFixed(2) ?? "0.00"}</p>
              <p className="text-xs text-muted-foreground">Total Withdrawn</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SellerWallet;
