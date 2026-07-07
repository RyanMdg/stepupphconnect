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
    const {
      name,
      industry,
      contact,
      email,
      password,
      phone,
      specializations = [],
      available_slots = 0,
    } = await req.json();

    if (!name || !industry || !contact || !email || !password) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Missing required agency registration fields.",
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

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          role: "agency",
          name,
          agency_name: name,
        },
      });

    if (authError) throw authError;

    const user = authData.user;
    const { data: insertedAgency, error: insertError } = await supabase
      .from("agencies")
      .insert({
        auth_id: user.id,
        name,
        industry,
        contact,
        contact_person: contact,
        email,
        phone: phone || null,
        specializations,
        available_slots,
        active_endorsements: 0,
        status: "active",
      })
      .select()
      .single();

    if (insertError) {
      return new Response(
        JSON.stringify({
          success: false,
          step: "insert_agency",
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
        agency: insertedAgency,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err: any) {
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
