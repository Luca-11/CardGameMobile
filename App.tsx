import React, { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Stores
import { useAuthStore } from "./src/stores/authStore";

// Navigators
import AuthStack from "./src/navigation/AuthStack";
import MainStack from "./src/navigation/MainStack";

const RootStack = createNativeStackNavigator();

export default function App() {
  const { user, loading, initialized, initialize } = useAuthStore();

  // Initialiser l'authentification au démarrage
  useEffect(() => {
    console.log("🔵 App - Initialisation de l'authentification");
    initialize();
  }, [initialize]);

  // Affichage de chargement pendant l'initialisation
  if (!initialized || loading) {
    console.log("⏳ App - Chargement...", { initialized, loading });
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2ecc71" />
      </View>
    );
  }

  console.log("🔵 App - État final:", { hasUser: !!user, userId: user?.id });

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          // Utilisateur connecté → Application principale
          <RootStack.Screen name="Main" component={MainStack} />
        ) : (
          // Utilisateur non connecté → Authentification
          <RootStack.Screen name="Auth" component={AuthStack} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
});
