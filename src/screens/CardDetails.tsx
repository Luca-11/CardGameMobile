import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, ScrollView } from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";
import { CollectionStackParamList } from "../types/navigation";
import { supabase } from "../lib/supabase";
import { Card } from "../types/database";

type CardDetailsRouteProp = RouteProp<CollectionStackParamList, "CardDetails">;

export const CardDetails = () => {
  const route = useRoute<CardDetailsRouteProp>();
  const [card, setCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCardDetails();
  }, []);

  const fetchCardDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("cards")
        .select("*")
        .eq("id", route.params.cardId)
        .single();

      if (error) throw error;
      setCard(data);
    } catch (error) {
      console.error("Erreur lors du chargement de la carte:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !card) {
    return (
      <View style={styles.container}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  const elementColors = {
    fire: "#ff4d4d",
    water: "#4d4dff",
    earth: "#8b4513",
    air: "#87ceeb",
    light: "#ffff00",
    dark: "#800080",
    neutral: "#808080",
  };

  const rarityColors = {
    common: "#808080",
    uncommon: "#00FF00",
    rare: "#0000FF",
    epic: "#800080",
    legendary: "#FFD700",
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imageContainer}>
        {card.image_url ? (
          <Image source={{ uri: card.image_url }} style={styles.image} />
        ) : (
          <View
            style={[
              styles.image,
              { backgroundColor: elementColors[card.element] },
            ]}
          >
            <Text style={styles.elementText}>
              {card.element.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.name}>{card.name}</Text>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Mana</Text>
            <Text style={styles.statValue}>🔮 {card.mana_cost}</Text>
          </View>
          {card.attack !== null && (
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Attaque</Text>
              <Text style={styles.statValue}>⚔️ {card.attack}</Text>
            </View>
          )}
          {card.defense !== null && (
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Défense</Text>
              <Text style={styles.statValue}>🛡️ {card.defense}</Text>
            </View>
          )}
        </View>

        <View style={styles.tagsRow}>
          <View
            style={[
              styles.tag,
              { backgroundColor: elementColors[card.element] },
            ]}
          >
            <Text style={styles.tagText}>{card.element}</Text>
          </View>
          <View
            style={[styles.tag, { backgroundColor: rarityColors[card.rarity] }]}
          >
            <Text style={styles.tagText}>{card.rarity}</Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{card.card_type}</Text>
          </View>
        </View>

        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionTitle}>Description</Text>
          <Text style={styles.description}>{card.description}</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  imageContainer: {
    width: "100%",
    height: 300,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  elementText: {
    fontSize: 96,
    fontWeight: "bold",
    color: "white",
  },
  contentContainer: {
    padding: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  statBox: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    minWidth: 100,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  tag: {
    backgroundColor: "#666",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    textTransform: "capitalize",
  },
  descriptionContainer: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
  },
});
