import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { ResetPasswordForm } from "../components/auth/ResetPasswordForm";
import { getErrorMessage } from "../constants/errorMessages";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Stores
import { useAuthStore } from "../stores/authStore";

const AuthScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const { login, register, loading, error, clearError } = useAuthStore();

  const handleSubmit = async () => {
    clearError();
    if (Platform.OS !== "web") {
      Keyboard.dismiss();
    }

    // Validation basique
    if (!email || !password) {
      Alert.alert("Erreur", getErrorMessage("Email required"));
      return;
    }

    if (!isLogin) {
      if (!username) {
        Alert.alert("Erreur", getErrorMessage("Username required"));
        return;
      }
      if (password !== confirmPassword) {
        Alert.alert("Erreur", getErrorMessage("Passwords do not match"));
        return;
      }
      if (password.length < 6) {
        Alert.alert("Erreur", getErrorMessage("Password is too short"));
        return;
      }
    }

    try {
      if (isLogin) {
        const success = await login(email, password);
        if (success && rememberMe) {
          await AsyncStorage.setItem("rememberedEmail", email);
        }
        if (!success) {
          Alert.alert("Erreur", getErrorMessage(error));
        }
      } else {
        const success = await register(email, password, username);
        if (success) {
          Alert.alert(
            "Inscription réussie",
            "Vérifiez votre email pour confirmer votre compte",
            [{ text: "OK", onPress: () => setIsLogin(true) }]
          );
        } else {
          Alert.alert("Erreur", getErrorMessage(error));
        }
      }
    } catch (err) {
      Alert.alert("Erreur", getErrorMessage(err));
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setUsername("");
    setConfirmPassword("");
    clearError();
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  // Charger l'email mémorisé au démarrage
  React.useEffect(() => {
    const loadRememberedEmail = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem("rememberedEmail");
        if (savedEmail) {
          setEmail(savedEmail);
          setRememberMe(true);
        }
      } catch (error) {
        console.error("Erreur lors du chargement de l'email:", error);
      }
    };
    loadRememberedEmail();
  }, []);

  const Container = Platform.OS === "web" ? View : TouchableWithoutFeedback;
  const containerProps =
    Platform.OS === "web"
      ? {
          style: styles.container,
        }
      : {
          style: styles.container,
          onPress: Keyboard.dismiss,
        };

  if (showResetPassword) {
    return (
      <Container {...containerProps}>
        <LinearGradient
          colors={["#4f46e5", "#3b82f6"]}
          style={styles.container}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
            >
              <ResetPasswordForm onBack={() => setShowResetPassword(false)} />
            </ScrollView>
          </KeyboardAvoidingView>
        </LinearGradient>
      </Container>
    );
  }

  return (
    <Container {...containerProps}>
      <LinearGradient colors={["#4f46e5", "#3b82f6"]} style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.formContainer}>
              <Text style={styles.title}>
                {isLogin ? "Connexion" : "Inscription"}
              </Text>

              {!isLogin && (
                <TextInput
                  style={styles.input}
                  placeholder="Nom d'utilisateur"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  editable={!loading}
                />
              )}

              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!loading}
              />

              <TextInput
                style={styles.input}
                placeholder="Mot de passe"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!loading}
              />

              {!isLogin && (
                <TextInput
                  style={styles.input}
                  placeholder="Confirmer le mot de passe"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  editable={!loading}
                />
              )}

              {isLogin && (
                <TouchableOpacity
                  style={styles.rememberMeContainer}
                  onPress={() => setRememberMe(!rememberMe)}
                >
                  <Ionicons
                    name={rememberMe ? "checkbox" : "square-outline"}
                    size={24}
                    color="#3b82f6"
                  />
                  <Text style={styles.rememberMeText}>Se souvenir de moi</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.buttonText}>
                    {isLogin ? "Se connecter" : "S'inscrire"}
                  </Text>
                )}
              </TouchableOpacity>

              {isLogin && (
                <TouchableOpacity
                  style={styles.forgotPassword}
                  onPress={() => setShowResetPassword(true)}
                >
                  <Text style={styles.forgotPasswordText}>
                    Mot de passe oublié ?
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.toggleButton}
                onPress={toggleMode}
              >
                <Text style={styles.toggleButtonText}>
                  {isLogin
                    ? "Pas encore de compte ? S'inscrire"
                    : "Déjà un compte ? Se connecter"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  formContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 20,
    padding: Platform.OS === "ios" ? 30 : 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    width: "100%",
    maxWidth: Platform.OS === "web" ? 400 : undefined,
    alignSelf: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 24,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    padding: Platform.OS === "ios" ? 15 : 12,
    fontSize: 16,
    color: "#1f2937",
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#3b82f6",
    borderRadius: 10,
    padding: Platform.OS === "ios" ? 16 : 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  toggleButton: {
    marginTop: 20,
    alignItems: "center",
  },
  toggleButtonText: {
    color: "#3b82f6",
    fontSize: 14,
    fontWeight: "500",
  },
  rememberMeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  rememberMeText: {
    marginLeft: 8,
    color: "#4b5563",
    fontSize: 14,
  },
  forgotPassword: {
    marginTop: 15,
    alignItems: "center",
  },
  forgotPasswordText: {
    color: "#3b82f6",
    fontSize: 14,
    fontWeight: "500",
  },
});

export default AuthScreen;
