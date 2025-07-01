import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { Database } from "../types/database";
import { Platform } from "react-native";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key are required");
}

// Créer un adaptateur de stockage selon la plateforme
const createStorageAdapter = () => {
  if (Platform.OS === "web") {
    return {
      getItem: (key: string) => {
        return Promise.resolve(localStorage.getItem(key));
      },
      setItem: (key: string, value: string) => {
        localStorage.setItem(key, value);
        return Promise.resolve();
      },
      removeItem: (key: string) => {
        localStorage.removeItem(key);
        return Promise.resolve();
      },
    };
  }
  return AsyncStorage;
};

// Créer une seule instance de Supabase
let supabaseInstance: ReturnType<
  typeof createClient<Database, "public">
> | null = null;

export const getSupabase = () => {
  if (!supabaseInstance) {
    supabaseInstance = createClient<Database, "public">(
      supabaseUrl,
      supabaseAnonKey,
      {
        auth: {
          storage: createStorageAdapter(),
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: Platform.OS === "web",
        },
      }
    );
  }
  return supabaseInstance;
};

export const supabase = getSupabase();
