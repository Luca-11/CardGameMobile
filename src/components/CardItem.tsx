import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Card } from "../types/database";

interface CardItemProps {
  card: Card;
  quantity?: number;
  onPress?: () => void;
  compact?: boolean;
}

export const CardItem = ({
  card,
  quantity,
  onPress,
  compact,
}: CardItemProps) => {
  const rarityColors = {
    common: "#808080",
    uncommon: "#00FF00",
    rare: "#0000FF",
    epic: "#800080",
    legendary: "#FFD700",
  };

  const elementColors = {
    fire: "#ff4d4d",
    water: "#4d4dff",
    earth: "#8b4513",
    air: "#87ceeb",
    light: "#ffff00",
    dark: "#800080",
    neutral: "#808080",
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { borderColor: rarityColors[card.rarity] },
        compact && styles.compactContainer,
      ]}
      onPress={onPress}
    >
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
        {quantity !== undefined && (
          <View style={styles.quantityBadge}>
            <Text style={styles.quantityText}>x{quantity}</Text>
          </View>
        )}
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={1}>
          {card.name}
        </Text>
        {!compact && (
          <>
            <Text style={styles.description} numberOfLines={2}>
              {card.description}
            </Text>
            <View style={styles.statsContainer}>
              <Text style={styles.stat}>🔮 {card.mana_cost}</Text>
              {card.attack !== null && (
                <Text style={styles.stat}>⚔️ {card.attack}</Text>
              )}
              {card.defense !== null && (
                <Text style={styles.stat}>🛡️ {card.defense}</Text>
              )}
            </View>
          </>
        )}
        <View style={styles.tagsContainer}>
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
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    flexDirection: "row",
    borderWidth: 2,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  compactContainer: {
    padding: 8,
    marginBottom: 4,
  },
  imageContainer: {
    position: "relative",
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  elementText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
  },
  quantityBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#2ecc71",
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  quantityText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: "row",
    marginBottom: 8,
  },
  stat: {
    marginRight: 12,
    fontSize: 14,
    fontWeight: "bold",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tag: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 4,
    marginBottom: 4,
  },
  tagText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "capitalize",
  },
});
