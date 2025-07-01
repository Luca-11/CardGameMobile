import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("🔵 Headers reçus:", Object.fromEntries(req.headers.entries()));
    console.log("🔵 Méthode:", req.method);

    const rawBody = await req.text();
    console.log("🔵 Corps brut de la requête:", rawBody);

    let body;
    try {
      body = JSON.parse(rawBody);
      console.log("🔵 Corps parsé:", body);
    } catch (error) {
      console.error("❌ Erreur de parsing JSON:", error);
      console.error("❌ Corps problématique:", rawBody);
      return new Response(
        JSON.stringify({
          error: "Format de requête invalide",
          details: "Le corps de la requête doit être un JSON valide",
          rawBody: rawBody,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const { userPackId } = body;
    console.log("🔵 ID du pack à ouvrir:", userPackId);

    if (!userPackId) {
      return new Response(
        JSON.stringify({
          error: "userPackId est requis",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Récupérer les informations du pack
    const { data: purchaseData, error: purchaseError } = await supabaseClient
      .from("user_packs")
      .select("*, pack:card_packs(*)")
      .eq("id", userPackId)
      .single();

    console.log("🔵 Données du pack:", purchaseData);
    console.log("❌ Erreur éventuelle:", purchaseError);

    if (purchaseError || !purchaseData) {
      return new Response(
        JSON.stringify({
          error: "Pack non trouvé",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404,
        }
      );
    }

    // Vérifier si le pack n'a pas déjà été ouvert
    if (purchaseData.opened_at) {
      return new Response(
        JSON.stringify({
          error: "Ce pack a déjà été ouvert",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Appeler la fonction SQL pour ouvrir le pack
    const { data: cards, error: openError } = await supabaseClient.rpc(
      "open_pack",
      {
        p_user_id: purchaseData.user_id,
        p_pack_id: purchaseData.pack_id,
      }
    );

    if (openError) {
      return new Response(
        JSON.stringify({
          error: "Erreur lors de l'ouverture du pack",
          details: openError.message,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    // Marquer le pack comme ouvert
    const { error: updateError } = await supabaseClient
      .from("user_packs")
      .update({ opened_at: new Date().toISOString() })
      .eq("id", userPackId);

    if (updateError) {
      console.error("Erreur lors de la mise à jour du pack:", updateError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        cards,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Erreur serveur:", error);
    return new Response(
      JSON.stringify({
        error: "Erreur interne du serveur",
        details: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
