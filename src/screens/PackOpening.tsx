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

      const { data: packData, error: packError } = await supabase
        .from("user_packs")
        .select(
          `
          *,
          pack:card_packs(*)
        `
        )
        .eq("id", purchaseId)
        .single();

      console.log("🔍 ID du pack recherché:", purchaseId);
      console.log("🔵 Données du pack:", packData);
      console.log("❌ Erreur éventuelle:", packError);

      if (packError || !packData) {
        throw new Error("Pack non trouvé");
      }

      if (packData.opened_at) {
        throw new Error("Ce pack a déjà été ouvert");
      }

      // Appel de la RPC pour ouvrir le pack
      const { data: cards, error: openError } = await supabase.rpc(
        "open_pack",
        {
          p_user_id: packData.user_id,
          p_pack_id: packData.pack_id,
        }
      );

      console.log("🎴 Cartes obtenues:", cards);
      console.log("❌ Erreur d'ouverture:", openError);

      if (openError) throw openError;

      // Mise à jour du statut du pack
      const { error: updateError } = await supabase
        .from("user_packs")
        .update({ opened_at: new Date().toISOString() })
        .eq("id", purchaseId);

      console.log("✏️ Erreur de mise à jour:", updateError);

      if (updateError) throw updateError;

      setCards(cards);
    } catch (error) {
      console.log("❌ Erreur lors de l'ouverture du pack:", error);
      setError(error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  };

  const handleAnimationComplete = () => {
    navigation.navigate("ShopMain");
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2ecc71" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
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
  },
});
