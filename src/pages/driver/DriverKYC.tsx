import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, FileCheck, Upload, CheckCircle, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const DriverKYC = () => {
  const { user } = useAuth();
  const [idType, setIdType] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [idImageUrl, setIdImageUrl] = useState("");
  const [proofOfAddressUrl, setProofOfAddressUrl] = useState("");
  const [vehicleRegistrationUrl, setVehicleRegistrationUrl] = useState("");
  const [insuranceCertificateUrl, setInsuranceCertificateUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data: kycData } = useQuery({
    queryKey: ["driver-kyc", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("driver_kyc")
        .select("*")
        .eq("driver_id", user.id)
        .maybeSingle();
      
      if (data) {
        setIdType(data.id_type || "");
        setIdNumber(data.id_number || "");
        setFullName(data.full_name || "");
        setPhone(data.phone || "");
        setAddress(data.address || "");
        setIdImageUrl(data.id_image_url || "");
        setProofOfAddressUrl(data.proof_of_address_url || "");
        setVehicleRegistrationUrl(data.vehicle_registration_url || "");
        setInsuranceCertificateUrl(data.insurance_certificate_url || "");
      }
      return data;
    },
    enabled: !!user,
  });

  const handleUploadImage = async (file: File, field: string) => {
    if (!user) return;
    
    try {
      const fileName = `kyc/${user.id}/${field}-${Date.now()}`;
      const { data, error } = await supabase.storage
        .from("kyc-documents")
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from("kyc-documents")
        .getPublicUrl(data.path);

      switch (field) {
        case "id_image":
          setIdImageUrl(publicUrl);
          break;
        case "proof_of_address":
          setProofOfAddressUrl(publicUrl);
          break;
        case "vehicle_registration":
          setVehicleRegistrationUrl(publicUrl);
          break;
        case "insurance_certificate":
          setInsuranceCertificateUrl(publicUrl);
          break;
      }

      toast({ title: "Success", description: "Image uploaded successfully" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    if (!idType || !idNumber || !fullName || !phone || !address) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!idImageUrl || !proofOfAddressUrl || !vehicleRegistrationUrl || !insuranceCertificateUrl) {
      toast({
        title: "Error",
        description: "Please upload all required documents",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      await supabase.from("driver_kyc").upsert(
        {
          driver_id: user.id,
          id_type: idType,
          id_number: idNumber,
          id_image_url: idImageUrl,
          proof_of_address_url: proofOfAddressUrl,
          vehicle_registration_url: vehicleRegistrationUrl,
          insurance_certificate_url: insuranceCertificateUrl,
          full_name: fullName,
          phone: phone,
          address: address,
          status: "pending",
        },
        { onConflict: "driver_id" }
      );

      toast({
        title: "Success",
        description: "KYC application submitted! Our team will review it shortly.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = () => {
    switch (kycData?.status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending Review</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Not Submitted</Badge>;
    }
  };

  const renderImageUpload = (field: string, label: string, imageUrl: string, setUrl: Function) => (
    <div>
      <label className="text-sm font-medium mb-2 block">{label}</label>
      {imageUrl ? (
        <div className="mb-2">
          <img src={imageUrl} alt={label} className="h-24 w-24 rounded-lg object-cover" />
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => document.getElementById(field)?.click()}
          >
            Change
          </Button>
        </div>
      ) : (
        <button
          onClick={() => document.getElementById(field)?.click()}
          className="w-full border-2 border-dashed border-input rounded-lg p-6 text-center hover:bg-muted transition-colors"
        >
          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm font-medium">Click to upload</p>
          <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
        </button>
      )}
      <input
        id={field}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUploadImage(file, field);
        }}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 flex items-center gap-3 bg-card px-4 py-3 shadow-sm">
        <Link to="/driver"><ArrowLeft className="h-5 w-5" /></Link>
        <h1 className="text-lg font-bold">KYC Verification</h1>
      </header>

      <div className="p-4 space-y-4">
        {/* Status Card */}
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <FileCheck className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">KYC Status</p>
                <p className="text-sm text-muted-foreground">Required to accept deliveries</p>
              </div>
            </div>
            {getStatusBadge()}
          </CardContent>
        </Card>

        {kycData?.status === "rejected" && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="flex items-start gap-3 p-4">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-800">Application Rejected</p>
                <p className="text-sm text-red-600">{kycData?.rejection_reason}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {kycData?.status === "approved" && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="flex items-center gap-3 p-4">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">Verified!</p>
                <p className="text-sm text-green-600">You can now accept deliveries</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Full Name</label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                disabled={kycData?.status === "approved"}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Phone Number</label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 234 567 8900"
                disabled={kycData?.status === "approved"}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Address</label>
              <Textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Your residential address"
                rows={3}
                disabled={kycData?.status === "approved"}
              />
            </div>
          </CardContent>
        </Card>

        {/* ID Information */}
        <Card>
          <CardHeader>
            <CardTitle>Identification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1 block">ID Type</label>
              <select
                value={idType}
                onChange={(e) => setIdType(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
                disabled={kycData?.status === "approved"}
              >
                <option value="">Select ID type</option>
                <option value="drivers_license">Driver's License</option>
                <option value="national_id">National ID</option>
                <option value="passport">Passport</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">ID Number</label>
              <Input
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                placeholder="ID number"
                disabled={kycData?.status === "approved"}
              />
            </div>
            <div className="grid grid-cols-1 gap-3">
              {renderImageUpload("id_image", "ID Image", idImageUrl, setIdImageUrl)}
              {renderImageUpload("proof_of_address", "Proof of Address", proofOfAddressUrl, setProofOfAddressUrl)}
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Information */}
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 gap-3">
              {renderImageUpload("vehicle_registration", "Vehicle Registration", vehicleRegistrationUrl, setVehicleRegistrationUrl)}
              {renderImageUpload("insurance_certificate", "Insurance Certificate", insuranceCertificateUrl, setInsuranceCertificateUrl)}
            </div>
          </CardContent>
        </Card>

        {kycData?.status !== "approved" && (
          <Button 
            className="w-full" 
            onClick={handleSubmit} 
            disabled={submitting || kycData?.status === "pending"}
          >
            {kycData?.status === "pending" ? "Awaiting Review..." : submitting ? "Submitting..." : "Submit KYC"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default DriverKYC;
