import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Wallet, DollarSign, TrendingUp, CreditCard } from "lucide-react";
import { Link, useState } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DriverWallet = () => {
  const { user } = useAuth();
  const [bankAccountName, setBankAccountName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);
  const [saving, setSaving] = useState(false);

  const { data: wallet, refetch } = useQuery({
    queryKey: ["driver-wallet", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("driver_wallets")
        .select("*")
        .eq("driver_id", user.id)
        .maybeSingle();
      
      if (data) {
        setBankAccountName(data.bank_account_name || "");
        setBankAccountNumber(data.bank_account_number || "");
        setBankCode(data.bank_code || "");
      }
      return data;
    },
    enabled: !!user,
  });

  const handleSaveBankAccount = async () => {
    if (!user || !bankAccountName || !bankAccountNumber || !bankCode) {
      toast({
        title: "Error",
        description: "Please fill in all bank details",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      await supabase
        .from("driver_wallets")
        .update({
          bank_account_name: bankAccountName,
          bank_account_number: bankAccountNumber,
          bank_code: bankCode,
        })
        .eq("driver_id", user.id);

      toast({ title: "Success", description: "Bank account updated!" });
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleWithdraw = async () => {
    if (!user || !withdrawAmount) {
      toast({
        title: "Error",
        description: "Please enter withdrawal amount",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(withdrawAmount);
    if (amount > (wallet?.balance || 0)) {
      toast({
        title: "Error",
        description: "Insufficient balance",
        variant: "destructive",
      });
      return;
    }

    if (!bankAccountNumber) {
      toast({
        title: "Error",
        description: "Please add your bank account first",
        variant: "destructive",
      });
      return;
    }

    setWithdrawing(true);
    try {
      // Update wallet balance
      await supabase
        .from("driver_wallets")
        .update({
          balance: (wallet?.balance || 0) - amount,
          total_withdrawn: (wallet?.total_withdrawn || 0) + amount,
        })
        .eq("driver_id", user.id);

      setWithdrawAmount("");
      toast({
        title: "Success",
        description: "Withdrawal initiated! You'll receive it in 1-2 business days.",
      });
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 flex items-center gap-3 bg-card px-4 py-3 shadow-sm">
        <Link to="/driver"><ArrowLeft className="h-5 w-5" /></Link>
        <h1 className="text-lg font-bold">Wallet & Earnings</h1>
      </header>

      <div className="p-4 space-y-4">
        {/* Balance Cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-gradient-to-br from-primary to-secondary text-primary-foreground">
            <CardContent className="flex flex-col items-center p-4">
              <Wallet className="h-6 w-6 mb-2 opacity-80" />
              <p className="text-xs opacity-90">Available Balance</p>
              <p className="text-2xl font-bold">${wallet?.balance?.toFixed(2) || "0.00"}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent to-secondary text-primary-foreground">
            <CardContent className="flex flex-col items-center p-4">
              <TrendingUp className="h-6 w-6 mb-2 opacity-80" />
              <p className="text-xs opacity-90">Total Earned</p>
              <p className="text-2xl font-bold">${wallet?.total_earned?.toFixed(2) || "0.00"}</p>
            </CardContent>
          </Card>
        </div>

        {/* Earnings Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Earnings Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <span className="text-sm">Total Withdrawn</span>
              </div>
              <span className="font-semibold">${wallet?.total_withdrawn?.toFixed(2) || "0.00"}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="text-sm">Pending Balance</span>
              <span className="font-semibold">${wallet?.balance?.toFixed(2) || "0.00"}</span>
            </div>
          </CardContent>
        </Card>

        {/* Withdrawal Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Withdraw Earnings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Amount to Withdraw</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  max={wallet?.balance || 0}
                />
                <Button 
                  variant="outline" 
                  onClick={() => setWithdrawAmount(String(wallet?.balance || 0))}
                  className="whitespace-nowrap"
                >
                  Max
                </Button>
              </div>
            </div>
            <Button 
              className="w-full" 
              onClick={handleWithdraw} 
              disabled={withdrawing || !wallet?.balance || wallet.balance === 0}
            >
              {withdrawing ? "Processing..." : "Request Withdrawal"}
            </Button>
          </CardContent>
        </Card>

        {/* Bank Account Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Bank Account Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {wallet?.bank_account_number && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-xs text-green-600">Account on file</p>
                <p className="font-medium">****{wallet.bank_account_number.slice(-4)}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium mb-1 block">Account Holder Name</label>
              <Input
                value={bankAccountName}
                onChange={(e) => setBankAccountName(e.target.value)}
                placeholder="Full name as it appears on account"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Account Number</label>
              <Input
                value={bankAccountNumber}
                onChange={(e) => setBankAccountNumber(e.target.value)}
                placeholder="Bank account number"
                type="password"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Bank Code</label>
              <Input
                value={bankCode}
                onChange={(e) => setBankCode(e.target.value)}
                placeholder="Bank routing code"
              />
            </div>
            <Button 
              className="w-full" 
              onClick={handleSaveBankAccount} 
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Bank Account"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DriverWallet;
