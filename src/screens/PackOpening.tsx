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
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.functions.invoke("open-pack", {
        body: { userPackId: purchaseId },
      });

      if (error) {
        throw error;
      }

      if (!data.success || !data.cards) {
        throw new Error("Erreur lors de l'ouverture du pack");
      }

      setCards(data.cards);
    } catch (err) {
      console.error("Erreur lors de l'ouverture du pack:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors de l'ouverture du pack"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAnimationComplete = () => {
    navigation.navigate("Collection");
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
