import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, Clock, Eye, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface SellerKYC {
  id: string;
  seller_id: string;
  full_name: string;
  status: "pending" | "approved" | "rejected" | "under_review";
  id_type: string;
  id_number: string;
  business_name?: string;
  created_at: string;
  verified_at?: string;
  rejection_reason?: string;
  profile?: {
    display_name: string;
    store_name: string;
  };
}

const AdminKYC = () => {
  const { roles } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedKYC, setSelectedKYC] = useState<SellerKYC | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const isAdmin = roles.includes("admin");

  const { data: kycList, isLoading } = useQuery({
    queryKey: ["seller-kyc"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("seller_kyc")
        .select("*, profile:profiles(display_name, store_name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as SellerKYC[];
    },
    enabled: isAdmin,
  });

  const approveMutation = useMutation({
    mutationFn: async (kycId: string) => {
      const { error } = await supabase
        .from("seller_kyc")
        .update({
          status: "approved",
          verified_at: new Date().toISOString(),
          verified_by: (await supabase.auth.getSession()).data.session?.user.id,
        })
        .eq("id", kycId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("KYC approved successfully");
      queryClient.invalidateQueries({ queryKey: ["seller-kyc"] });
      setSelectedKYC(null);
      setActionType(null);
    },
    onError: () => {
      toast.error("Failed to approve KYC");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ kycId, reason }: { kycId: string; reason: string }) => {
      const { error } = await supabase
        .from("seller_kyc")
        .update({
          status: "rejected",
          rejection_reason: reason,
          verified_at: new Date().toISOString(),
          verified_by: (await supabase.auth.getSession()).data.session?.user.id,
        })
        .eq("id", kycId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("KYC rejected");
      queryClient.invalidateQueries({ queryKey: ["seller-kyc"] });
      setSelectedKYC(null);
      setActionType(null);
      setRejectionReason("");
    },
    onError: () => {
      toast.error("Failed to reject KYC");
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "under_review":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "under_review":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
        <p className="text-lg font-bold">Access Denied</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/admin-panel")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Seller KYC Management</h1>
            <p className="text-muted-foreground">
              Review and verify seller identity and business documents
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading KYC documents...</p>
          </div>
        ) : !kycList || kycList.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No KYC submissions found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {kycList.map((kyc) => (
              <Card key={kyc.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">
                          {kyc.profile?.store_name || kyc.full_name}
                        </h3>
                        <Badge className={`${getStatusColor(kyc.status)}`}>
                          <span className="mr-1">{getStatusIcon(kyc.status)}</span>
                          {kyc.status.replace("_", " ").toUpperCase()}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Full Name</p>
                          <p className="font-medium">{kyc.full_name}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">ID Type</p>
                          <p className="font-medium">{kyc.id_type}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Business Name</p>
                          <p className="font-medium">{kyc.business_name || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Submitted</p>
                          <p className="font-medium">
                            {new Date(kyc.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {kyc.rejection_reason && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                          <p className="text-sm font-semibold text-red-800">
                            Rejection Reason
                          </p>
                          <p className="text-sm text-red-700">{kyc.rejection_reason}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedKYC(kyc)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      {kyc.status === "pending" || kyc.status === "under_review" ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedKYC(kyc);
                              setActionType("approve");
                            }}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setSelectedKYC(kyc);
                              setActionType("reject");
                            }}
                          >
                            Reject
                          </Button>
                        </>
                      ) : null}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Approve Dialog */}
      {actionType === "approve" && selectedKYC && (
        <AlertDialog open={true} onOpenChange={() => {
          setActionType(null);
          setSelectedKYC(null);
        }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Approve KYC?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to approve this seller's KYC verification?
                This will grant them seller status.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                approveMutation.mutate(selectedKYC.id)
              }
            >
              Approve
            </AlertDialogAction>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Reject Dialog */}
      {actionType === "reject" && selectedKYC && (
        <AlertDialog open={true} onOpenChange={() => {
          setActionType(null);
          setSelectedKYC(null);
          setRejectionReason("");
        }}>
          <AlertDialogContent className="max-w-lg">
            <AlertDialogHeader>
              <AlertDialogTitle>Reject KYC</AlertDialogTitle>
              <AlertDialogDescription>
                Provide a reason for rejection. The seller will be notified.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="min-h-24"
            />
            <div className="flex justify-end gap-2">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <Button
                variant="destructive"
                onClick={() =>
                  rejectMutation.mutate({
                    kycId: selectedKYC.id,
                    reason: rejectionReason,
                  })
                }
                disabled={!rejectionReason.trim()}
              >
                Reject
              </Button>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default AdminKYC;
