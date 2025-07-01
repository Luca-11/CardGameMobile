import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../stores/authStore";
import { getErrorMessage } from "../constants/errorMessages";
import { useGameStore } from "../stores/gameStore";
import { addCoins } from "../services/supabase";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../types";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type ProfileScreenNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

export const Profile = () => {
  console.log("🔵 Profile - Rendu initial du composant");
  const {
    user,
    loading: authLoading,
    initialized,
    initialize,
    logout,
  } = useAuthStore();
  console.log("🔵 Profile - État de l'authentification:", {
    user,
    authLoading,
    initialized,
  });

  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [username, setUsername] = useState(user?.username || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const { userBalance, loadUserBalance } = useGameStore();
  console.log("🔵 Profile - Balance utilisateur:", { userBalance });

  const navigation = useNavigation<ProfileScreenNavigationProp>();

  useEffect(() => {
    const initAuth = async () => {
      console.log("🔵 Profile - Initialisation de l'authentification");
      if (!initialized) {
        await initialize();
      }
    };
    initAuth();
  }, [initialized, initialize]);

  // Surveiller les changements d'état d'authentification
  useEffect(() => {
    console.log("🔵 Profile - Changement d'état user:", {
      hasUser: !!user,
      userId: user?.id,
      initialized,
      authLoading,
    });
  }, [user, initialized, authLoading]);

  useEffect(() => {
    console.log("🔵 Profile - useEffect déclenché avec user:", user);
    if (!initialized || authLoading) {
      console.log("⚠️ Profile - En attente de l'initialisation");
      return;
    }

    if (user?.avatar_url) {
      console.log("🔵 Profile - Mise à jour de l'avatar:", user.avatar_url);
      setAvatar(user.avatar_url);
    }
    if (user?.username) {
      console.log("🔵 Profile - Mise à jour du username:", user.username);
      setUsername(user.username);
    }
    if (user) {
      loadUserBalanceData();
    }
  }, [user, initialized, authLoading]);

  const loadUserBalanceData = async () => {
    console.log("🔵 Profile - Début du chargement de la balance");
    try {
      if (!user) {
        console.warn(
          "⚠️ Profile - Tentative de chargement de la balance sans utilisateur"
        );
        return;
      }

      console.log(
        "🔵 Profile - Chargement de la balance pour l'utilisateur:",
        user.id
      );
      await loadUserBalance(user.id);
      console.log("🔵 Profile - Balance chargée avec succès");
    } catch (error) {
      console.error(
        "🔴 Profile - Erreur lors du chargement de la balance:",
        error
      );
    }
  };

  const pickImage = async () => {
    console.log("🔵 Profile - Début de la sélection d'image");
    if (loading) {
      console.log(
        "⚠️ Profile - Sélection d'image annulée car chargement en cours"
      );
      return;
    }

    try {
      setLoading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        const file = {
          uri: result.assets[0].uri,
          type: "image/jpeg",
          name: "avatar.jpg",
        };

        // Convertir l'image en Blob pour le web
        const response = await fetch(file.uri);
        const blob = await response.blob();

        // Upload vers Supabase Storage
        const { data, error } = await supabase.storage
          .from("avatars")
          .upload(`${user?.id}/avatar.jpg`, blob, {
            upsert: true,
          });

        if (error) {
          Alert.alert("Erreur", getErrorMessage(error));
          return;
        }

        // Obtenir l'URL publique
        const { data: publicUrl } = supabase.storage
          .from("avatars")
          .getPublicUrl(`${user?.id}/avatar.jpg`);

        // Mettre à jour le profil utilisateur
        const { error: updateError } = await supabase
          .from("users")
          .update({ avatar_url: publicUrl.publicUrl })
          .eq("id", user?.id);

        if (updateError) {
          Alert.alert("Erreur", getErrorMessage(updateError));
          return;
        }

        setAvatar(publicUrl.publicUrl);
      }
    } catch (error) {
      Alert.alert("Erreur", getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    console.log("🔵 Profile - Début de la mise à jour du profil");
    if (loading) {
      console.log("⚠️ Profile - Mise à jour annulée car chargement en cours");
      return;
    }
    if (!username.trim()) {
      console.warn(
        "⚠️ Profile - Tentative de mise à jour avec un username vide"
      );
      Alert.alert("Erreur", "Le nom d'utilisateur est requis");
      return;
    }

    try {
      setLoading(true);
      console.log("🔵 Profile - Envoi de la mise à jour:", { username });

      const { error } = await supabase
        .from("users")
        .update({ username, updated_at: new Date().toISOString() })
        .eq("id", user?.id);

      if (error) {
        console.error("🔴 Profile - Erreur lors de la mise à jour:", error);
        throw error;
      }

      console.log("🟢 Profile - Profil mis à jour avec succès");
      Alert.alert("Succès", "Profil mis à jour avec succès");
      setEditing(false);
    } catch (error) {
      console.error("🔴 Profile - Exception lors de la mise à jour:", error);
      Alert.alert("Erreur", getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    console.log("🔵 Profile - Début du changement de mot de passe");
    if (loading) {
      console.log("⚠️ Profile - Changement annulé car chargement en cours");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      console.warn("⚠️ Profile - Les mots de passe ne correspondent pas");
      Alert.alert("Erreur", "Les nouveaux mots de passe ne correspondent pas");
      return;
    }

    try {
      setLoading(true);
      console.log("🔵 Profile - Envoi de la mise à jour du mot de passe");

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        console.error(
          "🔴 Profile - Erreur lors de la mise à jour du mot de passe:",
          error
        );
        throw error;
      }

      console.log("🟢 Profile - Mot de passe mis à jour avec succès");
      Alert.alert("Succès", "Mot de passe mis à jour avec succès");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error) {
      console.error(
        "🔴 Profile - Exception lors de la mise à jour du mot de passe:",
        error
      );
      Alert.alert("Erreur", getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    console.log("🔵 Profile - Début de la déconnexion");
    if (loading) {
      console.log("⚠️ Profile - Déconnexion annulée car chargement en cours");
      return;
    }

    try {
      setLoading(true);
      console.log("🔵 Profile - Envoi de la requête de déconnexion");

      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("🔴 Profile - Erreur lors de la déconnexion:", error);
        throw error;
      }

      console.log("🟢 Profile - Déconnexion réussie");
    } catch (error) {
      console.error("🔴 Profile - Exception lors de la déconnexion:", error);
      Alert.alert("Erreur", getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleAddCoins = async () => {
    console.log("🔵 Profile - Début de l'ajout de pièces");
    try {
      setLoading(true);
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      console.log("🔵 Profile - Résultat getUser pour ajout de pièces:", {
        user,
        userError,
      });

      if (userError) {
        console.error(
          "🔴 Profile - Erreur lors de la récupération de l'utilisateur:",
          userError
        );
        throw userError;
      }

      if (!user) {
        console.warn(
          "⚠️ Profile - Tentative d'ajout de pièces sans utilisateur connecté"
        );
        Alert.alert(
          "Erreur",
          "Vous devez être connecté pour recharger votre solde"
        );
        return;
      }

      console.log("🔵 Profile - Ajout de pièces pour l'utilisateur:", user.id);
      const { error } = await addCoins(user.id, 1000);

      if (error) {
        console.error("🔴 Profile - Erreur lors de l'ajout de pièces:", error);
        throw error;
      }

      console.log("🟢 Profile - Pièces ajoutées avec succès");
      await loadUserBalance(user.id);
      Alert.alert("Succès", "1000 pièces ont été ajoutées à votre compte");
    } catch (error) {
      console.error("🔴 Profile - Exception lors de l'ajout de pièces:", error);
      Alert.alert(
        "Erreur",
        "Une erreur est survenue lors de l'ajout des pièces"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!initialized || authLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Chargement du profil...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.messageText}>
          Veuillez vous connecter pour accéder à votre profil
        </Text>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={async () => {
            // Rediriger vers l'authentification en déconnectant l'utilisateur
            await logout();
          }}
        >
          <Text style={styles.loginButtonText}>Se connecter</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={pickImage}
          disabled={loading}
        >
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={40} color="#9ca3af" />
            </View>
          )}
          <View style={styles.avatarBadge}>
            <Ionicons name="camera" size={14} color="#ffffff" />
          </View>
        </TouchableOpacity>

        <View style={styles.userInfo}>
          {editing ? (
            <TextInput
              style={styles.usernameInput}
              value={username}
              onChangeText={setUsername}
              placeholder="Nom d'utilisateur"
              autoCapitalize="none"
              editable={!loading}
            />
          ) : (
            <Text style={styles.username}>{username}</Text>
          )}
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => {
            if (editing) {
              handleUpdateProfile();
            } else {
              setEditing(true);
            }
          }}
          disabled={loading}
        >
          <Text style={styles.editButtonText}>
            {loading
              ? "Chargement..."
              : editing
              ? "Enregistrer"
              : "Modifier le profil"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Changer le mot de passe</Text>
        <TextInput
          style={styles.input}
          value={currentPassword}
          onChangeText={setCurrentPassword}
          placeholder="Mot de passe actuel"
          secureTextEntry
          editable={!loading}
        />
        <TextInput
          style={styles.input}
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="Nouveau mot de passe"
          secureTextEntry
          editable={!loading}
        />
        <TextInput
          style={styles.input}
          value={confirmNewPassword}
          onChangeText={setConfirmNewPassword}
          placeholder="Confirmer le nouveau mot de passe"
          secureTextEntry
          editable={!loading}
        />
        <TouchableOpacity
          style={[styles.button, styles.changePasswordButton]}
          onPress={handleChangePassword}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Chargement..." : "Changer le mot de passe"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Statistiques</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Parties jouées</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Victoires</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Cartes</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Decks</Text>
          </View>
        </View>
      </View>

      <View style={styles.balanceContainer}>
        <Text style={styles.balanceLabel}>Votre solde :</Text>
        <Text style={styles.balanceValue}>
          {userBalance !== null ? `${userBalance} 💰` : "Chargement..."}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.button, styles.signOutButton]}
        onPress={handleSignOut}
        disabled={loading}
      >
        <Text style={[styles.buttonText, styles.signOutButtonText]}>
          {loading ? "Chargement..." : "Déconnexion"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleAddCoins}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Ajouter 1000 pièces</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#ffffff",
    padding: 20,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#3b82f6",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  userInfo: {
    alignItems: "center",
    marginBottom: 15,
  },
  username: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 5,
  },
  usernameInput: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 5,
    textAlign: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 8,
    minWidth: 200,
  },
  email: {
    fontSize: 16,
    color: "#6b7280",
  },
  editButton: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  editButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  section: {
    backgroundColor: "#ffffff",
    padding: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 15,
  },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: Platform.OS === "ios" ? 15 : 12,
    fontSize: 16,
    marginBottom: 10,
  },
  button: {
    borderRadius: 8,
    padding: Platform.OS === "ios" ? 16 : 14,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  changePasswordButton: {
    backgroundColor: "#3b82f6",
  },
  signOutButton: {
    backgroundColor: "#ef4444",
    margin: 20,
  },
  signOutButtonText: {
    color: "#ffffff",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statItem: {
    width: "48%",
    backgroundColor: "#f9fafb",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#3b82f6",
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  balanceContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 18,
    color: "#666",
    marginBottom: 10,
  },
  balanceValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2ecc71",
  },
  buttonDisabled: {
    backgroundColor: "#95a5a6",
  },
  messageText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  loginButton: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  loginButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
