import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { testRLSPolicies } from "../utils/testPolicies";
import { useAuthStore } from "../stores/authStore";

export const AdminTools = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const { user } = useAuthStore();

  const runRLSTests = async () => {
    if (user?.role !== "admin") {
      setResults(["❌ Accès refusé : Droits administrateur requis"]);
      return;
    }

    setLoading(true);
    setResults([]);

    try {
      const result = await testRLSPolicies();
      setResults((prev) => [...prev, result.message]);
    } catch (error: any) {
      setResults((prev) => [
        ...prev,
        `❌ Erreur: ${error?.message || "Erreur inconnue"}`,
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== "admin") {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🛠️ Outils Administrateur</Text>

      <ScrollView style={styles.resultsContainer}>
        {results.map((result, index) => (
          <Text key={index} style={styles.resultText}>
            {result}
          </Text>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={runRLSTests}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Tester les politiques RLS</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    margin: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#1f2937",
  },
  resultsContainer: {
    maxHeight: 200,
    marginBottom: 20,
  },
  resultText: {
    fontSize: 14,
    marginBottom: 5,
    color: "#374151",
  },
  button: {
    backgroundColor: "#3b82f6",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
