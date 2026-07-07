import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    const { name, email, password } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (authError) throw authError;

    const user = authData.user;
const { data: insertedAdmin, error: insertError } = await supabase
  .from("admins")
  .insert({
    auth_id: user.id,
    name,
    email,
    status: "active",
  })
  .select();

console.log("INSERTED ADMIN:", insertedAdmin);
console.error("INSERT ERROR:", insertError);

if (insertError) {
  return new Response(
    JSON.stringify({
      success: false,
      step: "insert_admin",
      error: insertError,
    }),
    {
      status: 400,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    }
  );
}

    return new Response(
      JSON.stringify({
        success: true,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }  catch (err: any) {
  console.error("EDGE FUNCTION ERROR:", err);

  return new Response(
    JSON.stringify({
      success: false,
      message: err?.message,
      error: err,
    }),
    {
      status: 400,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    }
  );
}
});