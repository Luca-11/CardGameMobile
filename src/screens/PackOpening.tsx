import React, { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator, Text } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import {
  PackOpeningRouteProp,
  PackOpeningNavigationProp,
} from "../types/navigation";
import { Card } from "../types/database";
import { supabase } from "../lib/supabase";
import PackOpeningAnimation from "../components/PackOpening";

export const PackOpening = () => {
  const route = useRoute<PackOpeningRouteProp>();
  const navigation = useNavigation<PackOpeningNavigationProp>();
  const { purchaseId } = route.params;
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState<Card[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    openPack();
  }, []);

  const openPack = async () => {
    try {
      console.log("🎁 Tentative d'ouverture du pack:", purchaseId);
      console.log("🔍 Vérification de l'authentification...");

      // Vérifier l'authentification
      const {
        data: { session },
        error: authError,
      } = await supabase.auth.getSession();
      console.log("🔐 Session utilisateur:", session?.user?.id);
      console.log("❌ Erreur d'authentification:", authError);

      if (!session) {
        throw new Error("Utilisateur non authentifié");
      }

      const { data: packData, error: packError } = await supabase
        .from("user_packs")
        .select(
          `
          *,
          pack:packs(*)
        `
        )
        .eq("id", purchaseId)
        .single();

      console.log("🔍 ID du pack recherché:", purchaseId);
      console.log("🔵 Données du pack:", packData);
      console.log("❌ Erreur éventuelle:", packError);

      if (packError || !packData) {
        console.error("❌ Pack non trouvé ou erreur:", packError);
        throw new Error("Pack non trouvé");
      }

      if (packData.opened_at) {
        console.log("❌ Pack déjà ouvert à:", packData.opened_at);
        throw new Error("Ce pack a déjà été ouvert");
      }

      console.log("🔍 Paramètres pour open_pack:");
      console.log("  - user_id:", packData.user_id);
      console.log("  - pack_id:", packData.pack_id);
      console.log("  - pack_data:", packData.pack);

      // Appel de la RPC pour ouvrir le pack
      console.log("🔍 Appel de la fonction RPC open_pack...");
      const { data: cards, error: openError } = await supabase.rpc(
        "open_pack",
        {
          p_user_id: packData.user_id,
          p_pack_id: packData.pack_id,
        }
      );

      console.log("🎴 Cartes obtenues:", cards);
      console.log("❌ Erreur d'ouverture:", openError);

      if (openError) {
        console.error("❌ Erreur détaillée lors de l'ouverture:", {
          message: openError.message,
          code: openError.code,
          details: openError.details,
          hint: openError.hint,
        });
        throw openError;
      }

      // Mise à jour du statut du pack
      console.log("🔍 Marquage du pack comme ouvert...");
      const { error: updateError } = await supabase
        .from("user_packs")
        .update({ opened_at: new Date().toISOString() })
        .eq("id", purchaseId);

      console.log("✏️ Erreur de mise à jour:", updateError);

      if (updateError) {
        console.error("❌ Erreur lors de la mise à jour du pack:", updateError);
        throw updateError;
      }

      console.log("✅ Pack marqué comme ouvert avec succès");
      console.log(
        "✅ Ouverture du pack réussie, cartes obtenues:",
        cards?.length || 0
      );

      setCards(cards || []);
    } catch (error) {
      console.log("❌ Erreur lors de l'ouverture du pack:", error);
      console.error("❌ Détails de l'erreur:", {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        error: error,
      });
      setError(error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  };

  const handleAnimationComplete = () => {
    console.log("🎬 Animation d'ouverture terminée, navigation vers ShopMain");
    navigation.navigate("ShopMain");
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2ecc71" />
        <Text style={styles.loadingText}>Ouverture du pack...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Erreur lors de l'ouverture du pack</Text>
        <Text style={styles.errorDetails}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PackOpeningAnimation
        cards={cards}
        onComplete={handleAnimationComplete}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  loadingText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    padding: 20,
  },
  errorText: {
    color: "#e74c3c",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 16,
  },
  errorDetails: {
    color: "#e74c3c",
    fontSize: 14,
    textAlign: "center",
    opacity: 0.8,
  },
});
