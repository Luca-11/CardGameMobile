import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
} from "react-native";
import { supabase } from "../../lib/supabase";
import { getErrorMessage } from "../../constants/errorMessages";

interface ResetPasswordFormProps {
  onBack: () => void;
}

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  onBack,
}) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert("Erreur", "Veuillez entrer votre adresse email");
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "myapp://reset-password",
      });

      if (error) {
        Alert.alert("Erreur", getErrorMessage(error));
        return;
      }

      Alert.alert(
        "Email envoyé",
        "Vérifiez votre boîte mail pour réinitialiser votre mot de passe",
        [{ text: "OK", onPress: onBack }]
      );
    } catch (error) {
      Alert.alert("Erreur", getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Réinitialiser le mot de passe</Text>
      <Text style={styles.description}>
        Entrez votre adresse email pour recevoir un lien de réinitialisation
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        editable={!loading}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleResetPassword}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Envoi en cours..." : "Envoyer le lien"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>Retour</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  description: {
    textAlign: "center",
    marginBottom: 20,
    color: "#666",
  },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    padding: Platform.OS === "ios" ? 15 : 12,
    fontSize: 16,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#3b82f6",
    borderRadius: 10,
    padding: Platform.OS === "ios" ? 16 : 14,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  backButton: {
    alignItems: "center",
    padding: 10,
  },
  backButtonText: {
    color: "#3b82f6",
    fontSize: 16,
  },
});
