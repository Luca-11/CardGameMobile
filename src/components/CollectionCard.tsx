import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { UserCard } from "../types/collection";

interface CollectionCardProps {
  card: UserCard;
  onPress?: () => void;
  size?: "small" | "normal" | "large";
}

const RARITY_COLORS = {
  common: "#B0B0B0",
  uncommon: "#00FF00",
  rare: "#0000FF",
  epic: "#800080",
  legendary: "#FFA500",
} as const;

const ELEMENT_COLORS = {
  fire: "#FF4444",
  water: "#4444FF",
  earth: "#8B4513",
  air: "#87CEEB",
  light: "#FFD700",
  dark: "#483D8B",
  neutral: "#808080",
} as const;

const ELEMENT_ICONS = {
  fire: "🔥",
  water: "💧",
  earth: "🌍",
  air: "💨",
  light: "✨",
  dark: "🌑",
  neutral: "⚪",
} as const;

export const CollectionCard: React.FC<CollectionCardProps> = ({
  card,
  onPress,
  size = "normal",
}) => {
  // Calculer les dimensions en fonction de la taille
  const dimensions = {
    small: { width: 120, height: 170 },
    normal: { width: 160, height: 220 },
    large: { width: 200, height: 280 },
  }[size];

  const fontSize = {
    small: { title: 12, stats: 10, description: 8 },
    normal: { title: 14, stats: 12, description: 10 },
    large: { title: 16, stats: 14, description: 12 },
  }[size];

  const elementColor =
    ELEMENT_COLORS[card.card_element as keyof typeof ELEMENT_COLORS] ||
    "#808080";
  const elementIcon =
    ELEMENT_ICONS[card.card_element as keyof typeof ELEMENT_ICONS] || "⚪";
  const rarityColor =
    RARITY_COLORS[card.card_rarity as keyof typeof RARITY_COLORS] || "#B0B0B0";

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      style={[styles.container, dimensions]}
    >
      <LinearGradient
        colors={[elementColor, "#FFFFFF"]}
        style={[styles.card, dimensions]}
      >
        {/* En-tête de la carte */}
        <View style={styles.header}>
          <View style={styles.manaContainer}>
            <Text style={styles.manaText}>{card.card_mana_cost}</Text>
          </View>
          <Text
            style={[styles.name, { fontSize: fontSize.title }]}
            numberOfLines={1}
          >
            {card.card_name}
          </Text>
          <Text style={styles.element}>{elementIcon}</Text>
        </View>

        {/* Image de la carte */}
        <View style={styles.imageContainer}>
          {card.card_image_url ? (
            <Image
              source={{ uri: card.card_image_url }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View
              style={[
                styles.placeholderImage,
                { backgroundColor: elementColor },
              ]}
            />
          )}
        </View>

        {/* Description */}
        <View style={styles.descriptionContainer}>
          <Text
            style={[styles.description, { fontSize: fontSize.description }]}
            numberOfLines={3}
          >
            {card.card_description}
          </Text>
        </View>

        {/* Stats (pour les créatures) */}
        {card.card_type === "creature" && (
          <View style={styles.statsContainer}>
            <Text style={[styles.stats, { fontSize: fontSize.stats }]}>
              {card.card_attack} / {card.card_defense}
            </Text>
          </View>
        )}

        {/* Indicateur de quantité */}
        {card.quantity > 0 && (
          <View style={styles.quantityContainer}>
            <Text style={styles.quantityText}>x{card.quantity}</Text>
          </View>
        )}

        {/* Indicateur de rareté */}
        <View
          style={[styles.rarityIndicator, { backgroundColor: rarityColor }]}
        />
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 5,
  },
  card: {
    borderRadius: 10,
    padding: 8,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  manaContainer: {
    backgroundColor: "#4299e1",
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 5,
  },
  manaText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },
  name: {
    flex: 1,
    fontWeight: "bold",
    color: "#1a202c",
  },
  element: {
    fontSize: 16,
    marginLeft: 5,
  },
  imageContainer: {
    aspectRatio: 16 / 9,
    width: "100%",
    borderRadius: 5,
    overflow: "hidden",
    marginBottom: 5,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    opacity: 0.5,
  },
  descriptionContainer: {
    flex: 1,
    marginBottom: 5,
  },
  description: {
    color: "#4a5568",
    textAlign: "center",
  },
  statsContainer: {
    alignItems: "center",
    marginBottom: 5,
  },
  stats: {
    fontWeight: "bold",
    color: "#2d3748",
  },
  quantityContainer: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  quantityText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  rarityIndicator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
});
