import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "./src/stores/authStore";

// Types
import {
  RootTabParamList,
  ShopStackParamList,
  CollectionStackParamList,
  DecksStackParamList,
} from "./src/types/navigation";

// Screens
import { Shop } from "./src/screens/Shop";
import { PackDetails } from "./src/screens/PackDetails";
import { Collection } from "./src/screens/Collection";
import { Decks } from "./src/screens/Decks";
import { Profile } from "./src/screens/Profile";
import { CardDetails } from "./src/screens/CardDetails";
import { DeckEdit } from "./src/screens/DeckEdit";

const Tab = createBottomTabNavigator<RootTabParamList>();
const ShopStack = createNativeStackNavigator<ShopStackParamList>();
const CollectionStack = createNativeStackNavigator<CollectionStackParamList>();
const DecksStack = createNativeStackNavigator<DecksStackParamList>();

const ShopStackScreen = () => (
  <ShopStack.Navigator>
    <ShopStack.Screen
      name="ShopMain"
      component={Shop}
      options={{
        title: "Boutique",
        headerStyle: { backgroundColor: "#2ecc71" },
        headerTintColor: "#fff",
      }}
    />
    <ShopStack.Screen
      name="PackDetails"
      component={PackDetails}
      options={{
        title: "Détails du Pack",
        headerStyle: { backgroundColor: "#2ecc71" },
        headerTintColor: "#fff",
      }}
    />
  </ShopStack.Navigator>
);

const CollectionStackScreen = () => (
  <CollectionStack.Navigator>
    <CollectionStack.Screen
      name="CollectionMain"
      component={Collection}
      options={{
        title: "Ma Collection",
        headerStyle: { backgroundColor: "#2ecc71" },
        headerTintColor: "#fff",
      }}
    />
    <CollectionStack.Screen
      name="CardDetails"
      component={CardDetails}
      options={{
        title: "Détails de la Carte",
        headerStyle: { backgroundColor: "#2ecc71" },
        headerTintColor: "#fff",
      }}
    />
  </CollectionStack.Navigator>
);

const DecksStackScreen = () => (
  <DecksStack.Navigator>
    <DecksStack.Screen
      name="DecksList"
      component={Decks}
      options={{
        title: "Mes Decks",
        headerStyle: { backgroundColor: "#2ecc71" },
        headerTintColor: "#fff",
      }}
    />
    <DecksStack.Screen
      name="DeckEdit"
      component={DeckEdit}
      options={{
        title: "Éditer le Deck",
        headerStyle: { backgroundColor: "#2ecc71" },
        headerTintColor: "#fff",
      }}
    />
  </DecksStack.Navigator>
);

export default function App() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, []);

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            switch (route.name) {
              case "Shop":
                iconName = focused ? "cart" : "cart-outline";
                break;
              case "Collection":
                iconName = focused ? "albums" : "albums-outline";
                break;
              case "Decks":
                iconName = focused ? "layers" : "layers-outline";
                break;
              case "Profile":
                iconName = focused ? "person" : "person-outline";
                break;
              default:
                iconName = "help-outline";
            }

            return (
              <Ionicons name={iconName as any} size={size} color={color} />
            );
          },
          tabBarActiveTintColor: "#2ecc71",
          tabBarInactiveTintColor: "gray",
        })}
      >
        <Tab.Screen
          name="Shop"
          component={ShopStackScreen}
          options={{ headerShown: false, title: "Boutique" }}
        />
        <Tab.Screen
          name="Collection"
          component={CollectionStackScreen}
          options={{ headerShown: false, title: "Collection" }}
        />
        <Tab.Screen
          name="Decks"
          component={DecksStackScreen}
          options={{ headerShown: false, title: "Decks" }}
        />
        <Tab.Screen
          name="Profile"
          component={Profile}
          options={{
            title: "Profil",
            headerStyle: { backgroundColor: "#2ecc71" },
            headerTintColor: "#fff",
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
