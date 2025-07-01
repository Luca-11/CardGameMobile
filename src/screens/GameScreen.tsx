import React from "react";
import { View, Text, StyleSheet } from "react-native";

const GameScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Partie en cours</Text>
      <Text style={styles.subtitle}>Le système de jeu sera implémenté ici</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
  },
});

export default GameScreen;
