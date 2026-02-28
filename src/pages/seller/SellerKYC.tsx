import { useAuth } from "@/contexts/AuthContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle, Clock, XCircle } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface KYCData {
  full_name: string;
  date_of_birth: string;
  id_type: string;
  id_number: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  business_name: string;
  business_registration_number: string;
  tax_id: string;
  bank_account_name: string;
  bank_account_number: string;
  bank_name: string;
  bank_code: string;
}

const SellerKYC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Partial<KYCData>>({
    country: "US",
    id_type: "national_id",
  });

  const { data: kycStatus } = useQuery({
    queryKey: ["seller-kyc", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("seller_kyc")
        .select("*")
        .eq("seller_id", user?.id)
        .single();
      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (kycStatus) {
        const { error } = await supabase
          .from("seller_kyc")
          .update(formData)
          .eq("seller_id", user?.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("seller_kyc")
          .insert([{ seller_id: user?.id, ...formData }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(
        kycStatus ? "KYC information updated" : "KYC submitted for verification"
      );
      queryClient.invalidateQueries({ queryKey: ["seller-kyc"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to submit KYC");
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const getStatusDisplay = () => {
    if (!kycStatus) return null;

    switch (kycStatus.status) {
      case "approved":
        return (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            <span>KYC Approved</span>
          </div>
        );
      case "rejected":
        return (
          <div className="flex items-center gap-2 text-red-600">
            <XCircle className="h-5 w-5" />
            <span>KYC Rejected</span>
          </div>
        );
      case "under_review":
        return (
          <div className="flex items-center gap-2 text-yellow-600">
            <Clock className="h-5 w-5" />
            <span>Under Review</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="h-5 w-5" />
            <span>Pending Verification</span>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-2xl">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/seller")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>KYC Verification</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Complete your identity verification to unlock all seller features
                </p>
              </div>
              {kycStatus && getStatusDisplay()}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {kycStatus?.rejection_reason && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="font-semibold text-red-800 text-sm mb-1">
                  Rejection Reason
                </p>
                <p className="text-red-700 text-sm">{kycStatus.rejection_reason}</p>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitMutation.mutate();
              }}
              className="space-y-4"
            >
              {/* Personal Information */}
              <div className="space-y-3 pb-4 border-b">
                <h3 className="font-semibold">Personal Information</h3>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Full Name *
                  </label>
                  <Input
                    name="full_name"
                    value={formData.full_name || ""}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Date of Birth
                  </label>
                  <Input
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth || ""}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* ID Verification */}
              <div className="space-y-3 pb-4 border-b">
                <h3 className="font-semibold">Identity Verification</h3>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    ID Type *
                  </label>
                  <Select
                    value={formData.id_type || "national_id"}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, id_type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="passport">Passport</SelectItem>
                      <SelectItem value="driver_license">Driver License</SelectItem>
                      <SelectItem value="national_id">National ID</SelectItem>
                      <SelectItem value="business_registration">
                        Business Registration
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    ID Number *
                  </label>
                  <Input
                    name="id_number"
                    value={formData.id_number || ""}
                    onChange={handleInputChange}
                    placeholder="Enter ID number"
                    required
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-3 pb-4 border-b">
                <h3 className="font-semibold">Address</h3>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Street Address *
                  </label>
                  <Input
                    name="address"
                    value={formData.address || ""}
                    onChange={handleInputChange}
                    placeholder="Street address"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      City *
                    </label>
                    <Input
                      name="city"
                      value={formData.city || ""}
                      onChange={handleInputChange}
                      placeholder="City"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      State
                    </label>
                    <Input
                      name="state"
                      value={formData.state || ""}
                      onChange={handleInputChange}
                      placeholder="State"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Postal Code *
                    </label>
                    <Input
                      name="postal_code"
                      value={formData.postal_code || ""}
                      onChange={handleInputChange}
                      placeholder="Postal code"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Country
                    </label>
                    <Input
                      name="country"
                      value={formData.country || ""}
                      onChange={handleInputChange}
                      placeholder="Country"
                    />
                  </div>
                </div>
              </div>

              {/* Business Information */}
              <div className="space-y-3 pb-4 border-b">
                <h3 className="font-semibold">Business Information</h3>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Business Name
                  </label>
                  <Input
                    name="business_name"
                    value={formData.business_name || ""}
                    onChange={handleInputChange}
                    placeholder="Your business name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Business Registration Number
                  </label>
                  <Input
                    name="business_registration_number"
                    value={formData.business_registration_number || ""}
                    onChange={handleInputChange}
                    placeholder="Registration number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Tax ID
                  </label>
                  <Input
                    name="tax_id"
                    value={formData.tax_id || ""}
                    onChange={handleInputChange}
                    placeholder="Tax ID or EIN"
                  />
                </div>
              </div>

              {/* Bank Information */}
              <div className="space-y-3">
                <h3 className="font-semibold">Bank Information</h3>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Account Holder Name
                  </label>
                  <Input
                    name="bank_account_name"
                    value={formData.bank_account_name || ""}
                    onChange={handleInputChange}
                    placeholder="Name on bank account"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Account Number
                  </label>
                  <Input
                    name="bank_account_number"
                    value={formData.bank_account_number || ""}
                    onChange={handleInputChange}
                    placeholder="Bank account number"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Bank Name
                    </label>
                    <Input
                      name="bank_name"
                      value={formData.bank_name || ""}
                      onChange={handleInputChange}
                      placeholder="Bank name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Bank Code
                    </label>
                    <Input
                      name="bank_code"
                      value={formData.bank_code || ""}
                      onChange={handleInputChange}
                      placeholder="SWIFT/Routing code"
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={submitMutation.isPending}
                className="w-full"
              >
                {submitMutation.isPending
                  ? "Submitting..."
                  : kycStatus
                  ? "Update KYC"
                  : "Submit KYC for Verification"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SellerKYC;
