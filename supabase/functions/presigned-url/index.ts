// Supabase Edge Function — generates presigned S3 URLs for client-side uploads
// Deploy with: supabase functions deploy presigned-url

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const AWS_REGION = Deno.env.get("AWS_REGION")!;
const AWS_S3_BUCKET_NAME = Deno.env.get("AWS_S3_BUCKET_NAME")!;
// TODO: These will be needed once full SigV4 signing is implemented
// const AWS_ACCESS_KEY_ID = Deno.env.get("AWS_ACCESS_KEY_ID")!;
// const AWS_SECRET_ACCESS_KEY = Deno.env.get("AWS_SECRET_ACCESS_KEY")!;

serve(async (req: Request) => {
  // Verify auth
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Parse request
  const { filename, contentType } = await req.json();

  if (!filename || !contentType) {
    return new Response(
      JSON.stringify({ error: "filename and contentType are required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Generate the S3 key
  const key = `uploads/${user.id}/${filename}`;

  // TODO: Implement full AWS Signature V4 presigned URL generation.
  // For now, returns the target S3 URL. In production, you would compute
  // a signed URL using AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY with
  // SigV4 (or use an AWS SDK for Deno).
  const presignedUrl = `https://${AWS_S3_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${key}`;
  const publicUrl = presignedUrl;

  return new Response(
    JSON.stringify({ presignedUrl, publicUrl, key }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
});
