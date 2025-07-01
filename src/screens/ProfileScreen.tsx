import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { useAuthStore } from "../stores/authStore";
import { AdminTools } from "../components/AdminTools";

const ProfileScreen = () => {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert("Déconnexion", "Êtes-vous sûr de vouloir vous déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      { text: "Déconnexion", style: "destructive", onPress: logout },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profil</Text>
        <Text style={styles.subtitle}>Bonjour, {user?.username} !</Text>
        {user?.role === "admin" && (
          <Text style={styles.adminBadge}>👑 Administrateur</Text>
        )}
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{user?.coins || 0}</Text>
          <Text style={styles.statLabel}>Pièces</Text>
        </View>
      </View>

      {user?.role === "admin" && <AdminTools />}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Se déconnecter</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  header: {
    padding: 20,
    backgroundColor: "white",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 18,
    color: "#6b7280",
  },
  adminBadge: {
    fontSize: 16,
    color: "#3b82f6",
    marginTop: 5,
    fontWeight: "600",
  },
  statsContainer: {
    flexDirection: "row",
    padding: 20,
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
  },
  statLabel: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 5,
  },
  logoutButton: {
    backgroundColor: "#ef4444",
    padding: 15,
    borderRadius: 10,
    margin: 20,
    alignItems: "center",
  },
  logoutText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ProfileScreen;
