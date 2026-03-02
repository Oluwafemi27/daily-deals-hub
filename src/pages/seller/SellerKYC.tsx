import { useAuth } from "@/contexts/AuthContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle, Clock, XCircle, Camera } from "lucide-react";
import { useState, useRef, useEffect } from "react";
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
  nin: string;
  face_photo: string | null;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  bank_account_name: string;
  bank_account_number: string;
  bank_name: string;
  bvn: string;
}

const SellerKYC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Partial<KYCData>>({
    country: "NG",
    id_type: "nin",
    face_photo: null,
  });
  const [idDocumentFile, setIdDocumentFile] = useState<File | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

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
      if (!user?.id) throw new Error("You must be logged in");

      if (!idDocumentFile) {
        throw new Error("Please upload your ID document");
      }

      if (!formData.face_photo) {
        throw new Error("Please capture a selfie");
      }

      const selfieFile = dataUrlToFile(formData.face_photo, "selfie.jpg");

      // 1) Verify with backend (via Edge Function proxy)
      const verificationResult = await verifyWithBackend({
        idDocument: idDocumentFile,
        selfie: selfieFile,
      });

      // 2) Save KYC record
      const payload = {
        ...formData,
        status: "under_review" as const,
      };

      if (kycStatus) {
        const { error } = await supabase
          .from("seller_kyc")
          .update(payload)
          .eq("seller_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("seller_kyc")
          .insert([{ seller_id: user.id, ...payload }]);
        if (error) throw error;
      }

      return verificationResult;
    },
    onSuccess: (verificationResult: any) => {
      const maybeMessage =
        verificationResult?.message ||
        verificationResult?.result ||
        verificationResult?.status ||
        null;

      toast.success(
        maybeMessage
          ? `Submitted. Verifier response: ${String(maybeMessage)}`
          : "KYC submitted and sent to verifier"
      );
      queryClient.invalidateQueries({ queryKey: ["seller-kyc"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to submit KYC");
    },
  });

  const dataUrlToFile = (dataUrl: string, filename: string) => {
    const [meta, b64] = dataUrl.split(",");
    const mime = meta.match(/data:(.*?);base64/)?.[1] ?? "image/jpeg";
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new File([bytes], filename, { type: mime });
  };

  const verifyWithBackend = async ({
    idDocument,
    selfie,
  }: {
    idDocument: File;
    selfie: File;
  }) => {
    const { data } = await supabase.auth.getSession();
    const accessToken = data.session?.access_token;
    if (!accessToken) throw new Error("Please sign in again");

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
    const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

    const fd = new FormData();
    fd.set("idDocument", idDocument, idDocument.name);
    fd.set("selfie", selfie, selfie.name);

    const resp = await fetch(`${supabaseUrl}/functions/v1/kyc-verify`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        apikey: anonKey,
      },
      body: fd,
    });

    const contentType = resp.headers.get("content-type") ?? "";
    const result = contentType.includes("application/json")
      ? await resp.json()
      : await resp.text();

    if (!resp.ok) {
      const msg =
        typeof result === "string"
          ? result
          : result?.error || result?.message || "Verification failed";
      throw new Error(msg);
    }

    return result;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (error) {
      toast.error("Failed to access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
      setCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const photoData = canvasRef.current.toDataURL("image/jpeg");
        setFormData((prev) => ({ ...prev, face_photo: photoData }));
        stopCamera();
        toast.success("Photo captured successfully");
      }
    }
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
                    value={formData.id_type || "nin"}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, id_type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nin">NIN (National ID)</SelectItem>
                      <SelectItem value="passport">Passport</SelectItem>
                      <SelectItem value="driver_license">Driver License</SelectItem>
                      <SelectItem value="national_id">National ID Card</SelectItem>
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

                <div>
                  <label className="block text-sm font-medium mb-1">
                    NIN (National Identification Number) *
                  </label>
                  <Input
                    name="nin"
                    value={formData.nin || ""}
                    onChange={handleInputChange}
                    placeholder="11-digit NIN (e.g., 12345678901)"
                    maxLength={11}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Upload ID Document *
                  </label>
                  <Input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0] ?? null;
                      setIdDocumentFile(file);
                    }}
                    required
                  />
                  {idDocumentFile && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Selected: {idDocumentFile.name}
                    </p>
                  )}
                </div>
              </div>

              {/* Face Capture */}
              <div className="space-y-3 pb-4 border-b">
                <h3 className="font-semibold">Face Verification</h3>

                {!formData.face_photo ? (
                  <div className="space-y-3">
                    {!cameraActive ? (
                      <Button
                        type="button"
                        onClick={startCamera}
                        variant="outline"
                        className="w-full"
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Start Camera & Capture Face
                      </Button>
                    ) : (
                      <div className="space-y-3">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          className="w-full rounded-lg bg-black"
                        />
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            onClick={capturePhoto}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            Capture Photo
                          </Button>
                          <Button
                            type="button"
                            onClick={stopCamera}
                            variant="outline"
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <img
                      src={formData.face_photo}
                      alt="Face capture"
                      className="w-full rounded-lg"
                    />
                    <Button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, face_photo: null }))}
                      variant="outline"
                      className="w-full"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Retake Photo
                    </Button>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  📸 A clear photo of your face is required for verification
                </p>
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
                      value={formData.country || "NG"}
                      onChange={handleInputChange}
                      placeholder="Country"
                    />
                  </div>
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

                <div>
                  <label className="block text-sm font-medium mb-1">
                    BVN (Bank Verification Number) *
                  </label>
                  <Input
                    name="bvn"
                    value={formData.bvn || ""}
                    onChange={handleInputChange}
                    placeholder="11-digit BVN (e.g., 12345678901)"
                    maxLength={11}
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Your 11-digit Bank Verification Number (BVN)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Bank Name
                  </label>
                  <Input
                    name="bank_name"
                    value={formData.bank_name || ""}
                    onChange={handleInputChange}
                    placeholder="e.g., Access Bank, GTBank, etc."
                  />
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

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
};

export default SellerKYC;
