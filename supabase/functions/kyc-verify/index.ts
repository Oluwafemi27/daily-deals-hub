// Supabase Edge Function: kyc-verify
// Proxies the multipart request to the KYC verifier backend, keeping x-api-key secret.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const verifyUrl = Deno.env.get("KYC_VERIFY_URL") ??
    "https://kyc-backend-698o.onrender.com/api/kyc/verify";
  const apiKey = Deno.env.get("KYC_API_KEY");

  if (!apiKey) {
    return new Response(JSON.stringify({
      error: "Missing KYC_API_KEY secret in Edge Function environment",
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("multipart/form-data")) {
    return new Response(JSON.stringify({
      error: "Expected multipart/form-data",
    }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const form = await req.formData();
  const idDocument = form.get("idDocument");
  const selfie = form.get("selfie");

  if (!(idDocument instanceof File)) {
    return new Response(JSON.stringify({ error: "idDocument file is required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!(selfie instanceof File)) {
    return new Response(JSON.stringify({ error: "selfie file is required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const forwardForm = new FormData();
  forwardForm.set("idDocument", idDocument, idDocument.name);
  forwardForm.set("selfie", selfie, selfie.name);

  const resp = await fetch(verifyUrl, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
    },
    body: forwardForm,
  });

  const respContentType = resp.headers.get("content-type") ?? "application/json";
  const body = await resp.text();

  return new Response(body, {
    status: resp.status,
    headers: {
      ...corsHeaders,
      "Content-Type": respContentType,
    },
  });
});
