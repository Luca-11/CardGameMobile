import React from "react";
import { StyleSheet, TouchableOpacity, Text, View } from "react-native";
import { Card as CardType } from "../../types/cards";

interface CardProps {
  card: CardType;
  onPress?: () => void;
  disabled?: boolean;
}

export const Card: React.FC<CardProps> = ({ card, onPress, disabled }) => {
  const { suit, rank, isFlipped } = card;

  if (!isFlipped) {
    return (
      <TouchableOpacity
        style={[styles.card, styles.cardBack]}
        onPress={onPress}
        disabled={disabled}
      >
        <Text style={styles.backPattern}>🎴</Text>
      </TouchableOpacity>
    );
  }

  const suitSymbol = {
    hearts: "♥️",
    diamonds: "♦️",
    clubs: "♣️",
    spades: "♠️",
  }[suit];

  return (
    <TouchableOpacity
      style={[styles.card, styles.cardFront]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text
        style={[
          styles.rank,
          suit === "hearts" || suit === "diamonds" ? styles.red : styles.black,
        ]}
      >
        {rank}
      </Text>
      <Text style={styles.suit}>{suitSymbol}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 70,
    height: 100,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    margin: 5,
    elevation: 3,
    boxShadow: "0px 2px 3.84px rgba(0, 0, 0, 0.25)",
  },
  cardFront: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  cardBack: {
    backgroundColor: "#1e90ff",
  },
  rank: {
    fontSize: 24,
    fontWeight: "bold",
  },
  suit: {
    fontSize: 32,
  },
  red: {
    color: "#ff0000",
  },
  black: {
    color: "#000000",
  },
  backPattern: {
    fontSize: 40,
  },
});
