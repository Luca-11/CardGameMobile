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
import {
  Card as CardType,
  RARITY_COLORS,
  ELEMENT_ICONS,
  ELEMENT_COLORS,
} from "../types/cards";
import RarityEffect from "./RarityEffect";
import useImageCache from "../hooks/useImageCache";

interface CardProps {
  card: CardType;
  quantity?: number;
  onPress?: () => void;
  size?: "small" | "normal" | "large";
}

export const Card: React.FC<CardProps> = ({
  card,
  quantity,
  onPress,
  size = "normal",
}) => {
  const {
    localUri,
    loading: imageLoading,
    error: imageError,
  } = useImageCache(card.image_url);

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

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      style={[styles.container, dimensions]}
    >
      <RarityEffect rarity={card.rarity} style={dimensions} />
      <LinearGradient
        colors={[ELEMENT_COLORS[card.element], "#FFFFFF"]}
        style={[styles.card, dimensions]}
      >
        {/* En-tête de la carte */}
        <View style={styles.header}>
          <View style={styles.manaContainer}>
            <Text style={styles.manaText}>{card.mana_cost}</Text>
          </View>
          <Text
            style={[styles.name, { fontSize: fontSize.title }]}
            numberOfLines={1}
          >
            {card.name}
          </Text>
          <Text style={styles.element}>{ELEMENT_ICONS[card.element]}</Text>
        </View>

        {/* Image de la carte */}
        <View style={styles.imageContainer}>
          {imageLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={ELEMENT_COLORS[card.element]} />
            </View>
          ) : localUri ? (
            <Image
              source={{ uri: localUri }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View
              style={[
                styles.placeholderImage,
                { backgroundColor: ELEMENT_COLORS[card.element] },
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
            {card.description}
          </Text>
        </View>

        {/* Stats (pour les créatures) */}
        {card.card_type === "creature" && (
          <View style={styles.statsContainer}>
            <Text style={[styles.stats, { fontSize: fontSize.stats }]}>
              {card.attack} / {card.defense}
            </Text>
          </View>
        )}

        {/* Indicateur de quantité */}
        {quantity !== undefined && quantity > 0 && (
          <View style={styles.quantityContainer}>
            <Text style={styles.quantityText}>x{quantity}</Text>
          </View>
        )}

        {/* Indicateur de rareté */}
        <View
          style={[
            styles.rarityIndicator,
            { backgroundColor: RARITY_COLORS[card.rarity] },
          ]}
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
  },
  statsContainer: {
    alignItems: "center",
    marginTop: "auto",
  },
  stats: {
    fontWeight: "bold",
    color: "#2d3748",
  },
  quantityContainer: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#48bb78",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  quantityText: {
    color: "white",
    fontSize: 12,
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Card;
