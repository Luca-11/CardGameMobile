import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useAuthStore } from "../stores/authStore";

const AuthScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login, register, error, clearError } = useAuthStore();

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      Alert.alert("Erreur", "Les mots de passe ne correspondent pas");
      return;
    }

    console.log(`🔵 AuthScreen - ${isLogin ? "Connexion" : "Inscription"}:`, {
      email,
    });
    setLoading(true);

    try {
      let success = false;
      if (isLogin) {
        success = await login(email, password);
      } else {
        success = await register(email, password, email.split("@")[0]);
      }

      if (!success) {
        // Afficher l'erreur du store
        if (error) {
          Alert.alert("Erreur d'authentification", error);
        }
        return;
      }

      if (!isLogin) {
        Alert.alert(
          "Inscription réussie !",
          "Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter.",
          [{ text: "OK" }]
        );
      }
    } catch (error: any) {
      console.error("❌ Erreur d'authentification:", error);
      Alert.alert("Erreur", error.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    resetForm();
    clearError(); // Nettoyer les erreurs lors du changement de mode
  };

  const createTestAccount = async () => {
    const testEmail = `test${Math.floor(Math.random() * 10000)}@cardgame.com`;
    const testPassword = "password123";

    Alert.alert(
      "Compte de test",
      `Email: ${testEmail}\nMot de passe: ${testPassword}\n\nCe compte sera créé automatiquement.`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Créer",
          onPress: async () => {
            setEmail(testEmail);
            setPassword(testPassword);
            setIsLogin(false);

            // Essayer l'inscription avec ce compte de test
            const success = await register(
              testEmail,
              testPassword,
              `user${Math.floor(Math.random() * 1000)}`
            );
            if (success) {
              Alert.alert(
                "Succès",
                "Compte de test créé ! Vous pouvez maintenant vous connecter."
              );
              setIsLogin(true);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Ionicons name="game-controller" size={80} color="#2ecc71" />
            <Text style={styles.title}>Card Game Mobile</Text>
            <Text style={styles.subtitle}>
              {isLogin ? "Connectez-vous à votre compte" : "Créez votre compte"}
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Ionicons
                name="mail"
                size={20}
                color="#666"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed"
                size={20}
                color="#666"
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Mot de passe"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPassword ? "eye" : "eye-off"}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>

            {!isLogin && (
              <>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="lock-closed"
                    size={20}
                    color="#666"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirmer le mot de passe"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                </View>
              </>
            )}

            <TouchableOpacity
              style={[
                styles.submitButton,
                loading && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>
                {loading ? "..." : isLogin ? "Se connecter" : "S'inscrire"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={toggleMode} style={styles.toggleButton}>
              <Text style={styles.toggleButtonText}>
                {isLogin
                  ? "Pas de compte ? Créer un compte"
                  : "Déjà un compte ? Se connecter"}
              </Text>
            </TouchableOpacity>

            {/* Bouton temporaire pour contourner le problème d'inscription */}
            <TouchableOpacity
              onPress={createTestAccount}
              style={styles.testButton}
            >
              <Text style={styles.testButtonText}>
                🧪 Créer un compte de test (contournement)
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2c3e50",
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#7f8c8d",
    textAlign: "center",
  },
  form: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
    minHeight: 48,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#2c3e50",
  },
  passwordInput: {
    paddingRight: 40,
  },
  eyeIcon: {
    position: "absolute",
    right: 12,
    padding: 4,
  },
  submitButton: {
    backgroundColor: "#2ecc71",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  submitButtonDisabled: {
    backgroundColor: "#95a5a6",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  toggleButton: {
    alignItems: "center",
    paddingVertical: 8,
  },
  toggleButtonText: {
    color: "#2ecc71",
    fontSize: 14,
    fontWeight: "500",
  },
  warningText: {
    backgroundColor: "#fff3cd",
    color: "#856404",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 14,
    textAlign: "center",
    borderWidth: 1,
    borderColor: "#ffeaa7",
  },
  testButton: {
    backgroundColor: "#2ecc71",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  testButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default AuthScreen;
