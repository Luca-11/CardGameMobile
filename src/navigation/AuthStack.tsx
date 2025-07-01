import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Screens
import AuthScreen from "../screens/AuthScreen";

type AuthStackParamList = {
  Login: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthStack = () => {
  console.log("🔵 AuthStack - Configuration du navigateur d'authentification");

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="Login" component={AuthScreen} />
    </Stack.Navigator>
  );
};

export default AuthStack;
