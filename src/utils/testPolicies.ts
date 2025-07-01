import { supabase } from "../services/supabase";

export const testRLSPolicies = async () => {
  try {
    console.log("🔒 Test des politiques RLS...");

    // Test de lecture des cartes (devrait réussir)
    const { data: cards, error: cardsError } = await supabase
      .from("cards")
      .select("*")
      .limit(1);

    console.log(
      "📋 Test lecture cartes:",
      cards ? "✅" : "❌",
      cardsError?.message || ""
    );

    // Test de modification d'une carte (devrait échouer pour un utilisateur normal)
    const { error: cardUpdateError } = await supabase
      .from("cards")
      .update({ description: "Test" })
      .eq("id", cards?.[0]?.id || "");

    console.log(
      "✏️ Test modification carte:",
      cardUpdateError ? "✅" : "❌ (devrait échouer)"
    );

    // Test de lecture des decks (devrait retourner uniquement les decks de l'utilisateur)
    const { data: decks, error: decksError } = await supabase
      .from("decks")
      .select("*");

    console.log(
      "🎴 Test lecture decks:",
      !decksError ? "✅" : "❌",
      decksError?.message || ""
    );

    // Test de lecture des packs (devrait réussir)
    const { data: packs, error: packsError } = await supabase
      .from("card_packs")
      .select("*");

    console.log(
      "📦 Test lecture packs:",
      packs ? "✅" : "❌",
      packsError?.message || ""
    );

    // Test de modification d'un pack (devrait échouer pour un utilisateur normal)
    const { error: packUpdateError } = await supabase
      .from("card_packs")
      .update({ description: "Test" })
      .eq("id", packs?.[0]?.id || "");

    console.log(
      "✏️ Test modification pack:",
      packUpdateError ? "✅" : "❌ (devrait échouer)"
    );

    return {
      success: true,
      message: "Tests des politiques RLS terminés",
    };
  } catch (error) {
    console.error("❌ Erreur lors des tests RLS:", error);
    return {
      success: false,
      message: "Erreur lors des tests RLS",
    };
  }
};
