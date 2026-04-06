import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonResponse({ error: "Missing authorization header" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const jwt = authHeader.replace(/^Bearer\s+/i, "");
    const {
      data: { user },
      error: userError,
    } = await adminClient.auth.getUser(jwt);

    if (userError || !user) {
      return jsonResponse(
        { error: `Unauthorized: ${userError?.message || "no user"}` },
        401
      );
    }

    const { email } = await req.json();
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return jsonResponse({ error: "Invalid email" }, 400);
    }

    const trimmed = email.trim().toLowerCase();

    if (trimmed === user.email?.toLowerCase()) {
      return jsonResponse(
        { error: "You can't invite your own email address." },
        400
      );
    }

    const { error: inviteError } =
      await adminClient.auth.admin.inviteUserByEmail(trimmed, {
        data: { invited_by: user.id },
      });

    if (inviteError) {
      const msg = inviteError.message.toLowerCase().includes("already")
        ? "That email is already registered on SocialSnout."
        : inviteError.message;
      return jsonResponse({ error: msg }, 400);
    }

    await adminClient
      .from("invites")
      .upsert(
        { inviter_id: user.id, invited_email: trimmed },
        { onConflict: "inviter_id,invited_email" }
      );

    return jsonResponse({ success: true });
  } catch (err) {
    return jsonResponse(
      { error: err instanceof Error ? err.message : "Unknown error" },
      500
    );
  }
});

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
