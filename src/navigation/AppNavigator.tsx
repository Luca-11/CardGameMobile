import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { View, ActivityIndicator, StyleSheet } from "react-native";

// Types
import { RootStackParamList, ScreenNames } from "../types";

// Stores
import { useAuthStore } from "../stores/authStore";

// Screens
import AuthScreen from "../screens/AuthScreen";
import HomeScreen from "../screens/HomeScreen";
import CollectionScreen from "../screens/CollectionScreen";
import ShopScreen from "../screens/ShopScreen";
import DeckBuilderScreen from "../screens/DeckBuilderScreen";
import GameScreen from "../screens/GameScreen";
import ProfileScreen from "../screens/ProfileScreen";
import { PackDetails } from "../screens/PackDetails";
import { PackOpening } from "../screens/PackOpening";
import { Decks } from "../screens/Decks";
import { DeckBuilder } from "../screens/DeckBuilder";
import { Profile } from "../screens/Profile";
import { Settings } from "../screens/Settings";

// Navigators
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();
const AuthenticatedStack = createNativeStackNavigator<RootStackParamList>();

// Configuration des icônes pour les tabs
const getTabIcon = (
  routeName: string,
  focused: boolean,
  color: string,
  size: number
) => {
  let iconName: keyof typeof Ionicons.glyphMap;

  switch (routeName) {
    case ScreenNames.HOME:
      iconName = focused ? "home" : "home-outline";
      break;
    case ScreenNames.COLLECTION:
      iconName = focused ? "library" : "library-outline";
      break;
    case ScreenNames.SHOP:
      iconName = focused ? "storefront" : "storefront-outline";
      break;
    case ScreenNames.DECKBUILDER:
      iconName = focused ? "build" : "build-outline";
      break;
    case ScreenNames.PROFILE:
      iconName = focused ? "person" : "person-outline";
      break;
    default:
      iconName = "help-outline";
  }

  return <Ionicons name={iconName} size={size} color={color} />;
};

// Navigateur principal avec tabs
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) =>
          getTabIcon(route.name, focused, color, size),
        tabBarActiveTintColor: "#3b82f6",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarStyle: {
          backgroundColor: "#1f2937",
          borderTopColor: "#374151",
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
        headerStyle: {
          backgroundColor: "#1f2937",
        },
        headerTintColor: "#ffffff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      })}
    >
      <Tab.Screen
        name={ScreenNames.HOME}
        component={HomeScreen}
        options={{
          title: "Accueil",
          tabBarLabel: "Accueil",
        }}
      />
      <Tab.Screen
        name={ScreenNames.COLLECTION}
        component={CollectionScreen}
        options={{
          title: "Collection",
          tabBarLabel: "Collection",
        }}
      />
      <Tab.Screen
        name={ScreenNames.SHOP}
        component={ShopScreen}
        options={{
          title: "Boutique",
          tabBarLabel: "Boutique",
        }}
      />
      <Tab.Screen
        name={ScreenNames.DECKBUILDER}
        component={DeckBuilderScreen}
        options={{
          title: "Deck Builder",
          tabBarLabel: "Decks",
        }}
      />
      <Tab.Screen
        name={ScreenNames.PROFILE}
        component={ProfileScreen}
        options={{
          title: "Profil",
          tabBarLabel: "Profil",
        }}
      />
    </Tab.Navigator>
  );
};

// Navigateur authentifié
const AuthenticatedNavigator = () => {
  console.log("🔵 Configuration du navigateur authentifié");
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Group>
        <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      </Stack.Group>

      <Stack.Group screenOptions={{ presentation: "modal" }}>
        <Stack.Screen
          name="PackDetails"
          component={PackDetails}
          options={{
            headerShown: true,
            title: "Détails du Pack",
            headerStyle: {
              backgroundColor: "#1f2937",
            },
            headerTintColor: "#ffffff",
          }}
        />
        <Stack.Screen
          name="PackOpening"
          component={PackOpening}
          options={{
            headerShown: false,
            animation: "fade",
          }}
        />
      </Stack.Group>

      <Stack.Group>
        <Stack.Screen
          name={ScreenNames.GAME}
          component={GameScreen}
          options={{
            headerShown: true,
            title: "Partie en cours",
            headerStyle: {
              backgroundColor: "#1f2937",
            },
            headerTintColor: "#ffffff",
          }}
        />
        <Stack.Screen
          name="Decks"
          component={Decks}
          options={{ title: "Decks" }}
        />
        <Stack.Screen
          name="DeckBuilder"
          component={DeckBuilder}
          options={{ title: "Création de Deck" }}
        />
        <Stack.Screen
          name="Profile"
          component={Profile}
          options={{ title: "Profil" }}
        />
        <Stack.Screen
          name="Settings"
          component={Settings}
          options={{ title: "Paramètres" }}
        />
      </Stack.Group>
    </Stack.Navigator>
  );
};

// Navigateur principal avec stack
const AppNavigator = () => {
  const { user, loading, initialized } = useAuthStore();

  console.log("🔵 AppNavigator - État:", {
    user: !!user,
    loading,
    initialized,
  });

  // Affichage de chargement pendant l'initialisation
  if (!initialized || loading) {
    console.log("⏳ AppNavigator - Chargement...");
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  console.log("🔵 AppNavigator - Configuration du navigateur principal");
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      >
        {user ? (
          <Stack.Screen
            name="AuthenticatedStack"
            component={AuthenticatedNavigator}
          />
        ) : (
          <Stack.Screen name={ScreenNames.AUTH} component={AuthScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1f2937",
  },
});

export default AppNavigator;
