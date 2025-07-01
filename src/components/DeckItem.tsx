import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface DeckItemProps {
  name: string;
  cardCount: number;
  averageMana: number;
  onPress: () => void;
}

export const DeckItem = ({
  name,
  cardCount,
  averageMana,
  onPress,
}: DeckItemProps) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{name}</Text>
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </View>

        <View style={styles.stats}>
          <View style={styles.stat}>
            <Ionicons name="albums-outline" size={20} color="#666" />
            <Text style={styles.statText}>{cardCount} cartes</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statText}>🔮 {averageMana.toFixed(1)}</Text>
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
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
  },
  stats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
  },
  statText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#666",
  },
});
