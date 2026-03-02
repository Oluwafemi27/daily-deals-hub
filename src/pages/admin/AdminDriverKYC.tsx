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
import { CheckCircle, XCircle, Clock, Eye, ArrowLeft, FileText } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface DriverKYC {
  id: string;
  driver_id: string;
  full_name: string;
  phone: string;
  address: string;
  id_type: string;
  id_number: string;
  id_image_url?: string;
  proof_of_address_url?: string;
  vehicle_registration_url?: string;
  insurance_certificate_url?: string;
  status: "pending" | "approved" | "rejected";
  rejection_reason?: string;
  submitted_at: string;
  profile?: {
    display_name: string;
  };
}

const AdminDriverKYC = () => {
  const { roles } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedKYC, setSelectedKYC] = useState<DriverKYC | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const isAdmin = roles.includes("admin");

  const { data: kycList, isLoading } = useQuery({
    queryKey: ["driver-kyc"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("driver_kyc")
        .select("*, profile:profiles!driver_kyc_driver_id_fkey(display_name)")
        .order("submitted_at", { ascending: false });
      if (error) throw error;
      return data as DriverKYC[];
    },
    enabled: isAdmin,
  });

  const approveMutation = useMutation({
    mutationFn: async (kycId: string) => {
      const { error } = await supabase
        .from("driver_kyc")
        .update({
          status: "approved",
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", kycId);
      if (error) throw error;

      // Also update driver profile KYC status
      const kyc = kycList?.find(k => k.id === kycId);
      if (kyc) {
        await supabase
          .from("driver_profiles")
          .update({
            kyc_status: "approved",
            kyc_verified_at: new Date().toISOString(),
          })
          .eq("driver_id", kyc.driver_id);
      }
    },
    onSuccess: () => {
      toast.success("Driver KYC approved successfully");
      queryClient.invalidateQueries({ queryKey: ["driver-kyc"] });
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
        .from("driver_kyc")
        .update({
          status: "rejected",
          rejection_reason: reason,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", kycId);
      if (error) throw error;

      // Also update driver profile KYC status
      const kyc = kycList?.find(k => k.id === kycId);
      if (kyc) {
        await supabase
          .from("driver_profiles")
          .update({
            kyc_status: "rejected",
          })
          .eq("driver_id", kyc.driver_id);
      }
    },
    onSuccess: () => {
      toast.success("Driver KYC rejected");
      queryClient.invalidateQueries({ queryKey: ["driver-kyc"] });
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
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
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
            <h1 className="text-3xl font-bold">Driver KYC Management</h1>
            <p className="text-muted-foreground">
              Review and verify driver identity and vehicle documents
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
                          {kyc.profile?.display_name || kyc.full_name}
                        </h3>
                        <Badge className={`${getStatusColor(kyc.status)}`}>
                          <span className="mr-1">{getStatusIcon(kyc.status)}</span>
                          {kyc.status.toUpperCase()}
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
                          <p className="text-muted-foreground">Phone</p>
                          <p className="font-medium">{kyc.phone}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Submitted</p>
                          <p className="font-medium">
                            {new Date(kyc.submitted_at).toLocaleDateString()}
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
                      
                      {/* Document Links */}
                      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                        {kyc.id_image_url && (
                          <a
                            href={kyc.id_image_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-primary hover:underline"
                          >
                            <FileText className="h-4 w-4" />
                            View ID Image
                          </a>
                        )}
                        {kyc.proof_of_address_url && (
                          <a
                            href={kyc.proof_of_address_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-primary hover:underline"
                          >
                            <FileText className="h-4 w-4" />
                            View Proof of Address
                          </a>
                        )}
                        {kyc.vehicle_registration_url && (
                          <a
                            href={kyc.vehicle_registration_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-primary hover:underline"
                          >
                            <FileText className="h-4 w-4" />
                            View Vehicle Registration
                          </a>
                        )}
                        {kyc.insurance_certificate_url && (
                          <a
                            href={kyc.insurance_certificate_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-primary hover:underline"
                          >
                            <FileText className="h-4 w-4" />
                            View Insurance Certificate
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {kyc.status === "pending" ? (
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
              <AlertDialogTitle>Approve Driver KYC?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to approve this driver's KYC verification?
                They will be able to accept delivery jobs.
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
              <AlertDialogTitle>Reject Driver KYC</AlertDialogTitle>
              <AlertDialogDescription>
                Provide a reason for rejection. The driver will be notified.
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

export default AdminDriverKYC;
