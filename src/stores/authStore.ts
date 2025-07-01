import { create } from "zustand";
import { AuthState, User } from "../types";
import { supabase } from "../lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthError, PostgrestError } from "@supabase/supabase-js";

interface AuthStore extends AuthState {
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    email: string,
    password: string,
    username: string
  ) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
  initialized: boolean;
}

let authSubscription: { unsubscribe: () => void } | null = null;

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  session: null,
  loading: true,
  error: null,
  initialized: false,

  initialize: async () => {
    if (get().initialized) {
      return;
    }

    try {
      set({ loading: true, error: null });

      if (authSubscription) {
        authSubscription.unsubscribe();
        authSubscription = null;
      }

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error(
          "Erreur lors de la récupération de la session:",
          sessionError
        );
        set({ loading: false, error: sessionError.message, initialized: true });
        return;
      }

      let userData = null;
      if (session?.user) {
        try {
          const { data, error: userError } = await supabase
            .from("users")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (userError) {
            console.error(
              "Erreur lors de la récupération des données utilisateur:",
              userError
            );
            set({
              session,
              user: null,
              loading: false,
              error: userError.message,
              initialized: true,
            });
            return;
          }

          userData = data;
        } catch (error) {
          console.error(
            "Erreur lors de la gestion des données utilisateur:",
            error
          );
          set({
            session,
            user: null,
            loading: false,
            error: error instanceof Error ? error.message : "Erreur inconnue",
            initialized: true,
          });
          return;
        }
      }

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log("Changement d'état d'authentification:", event);

        if (event === "SIGNED_IN" && session?.user) {
          try {
            const { data: userData, error: userError } = await supabase
              .from("users")
              .select("*")
              .eq("id", session.user.id)
              .single();

            if (userError) {
              console.error(
                "Erreur lors de la récupération des données utilisateur:",
                userError
              );
              set({
                session,
                user: null,
                loading: false,
                error: userError.message,
                initialized: true,
              });
              return;
            }

            set({
              session,
              user: userData as User,
              loading: false,
              error: null,
              initialized: true,
            });
          } catch (error) {
            console.error(
              "Erreur lors de la gestion de l'authentification:",
              error
            );
            set({
              session,
              user: null,
              loading: false,
              error: error instanceof Error ? error.message : "Erreur inconnue",
              initialized: true,
            });
          }
        } else if (event === "SIGNED_OUT") {
          set({
            session: null,
            user: null,
            loading: false,
            error: null,
            initialized: true,
          });
        }
      });

      authSubscription = subscription;

      set({
        session,
        user: userData as User | null,
        loading: false,
        error: null,
        initialized: true,
      });
    } catch (error) {
      console.error("Erreur lors de l'initialisation:", error);
      set({
        loading: false,
        error: error instanceof Error ? error.message : "Erreur inconnue",
        initialized: true,
      });
    }
  },

  login: async (email: string, password: string) => {
    try {
      set({ loading: true, error: null });

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        set({ loading: false, error: (error as AuthError).message });
        return false;
      }

      return true;
    } catch (error) {
      console.error("Login error:", error);
      set({
        loading: false,
        error: error instanceof Error ? error.message : "Erreur de connexion",
      });
      return false;
    }
  },

  register: async (email: string, password: string, username: string) => {
    try {
      set({ loading: true, error: null });

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      });

      if (error) {
        set({ loading: false, error: (error as AuthError).message });
        return false;
      }

      if (data?.user) {
        const { error: profileError } = await supabase.from("users").insert([
          {
            id: data.user.id,
            username,
            email,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]);

        if (profileError) {
          console.error("Error creating user profile:", profileError);
          set({ loading: false, error: profileError.message });
          return false;
        }
      }

      set({ loading: false, error: null });
      return true;
    } catch (error) {
      console.error("Register error:", error);
      set({
        loading: false,
        error: error instanceof Error ? error.message : "Erreur d'inscription",
      });
      return false;
    }
  },

  logout: async () => {
    try {
      set({ loading: true, error: null });

      const { error } = await supabase.auth.signOut();

      if (error) {
        set({ loading: false, error: (error as AuthError).message });
        return;
      }

      set({ user: null, session: null, loading: false, error: null });
      await AsyncStorage.clear();
    } catch (error) {
      console.error("Logout error:", error);
      set({
        loading: false,
        error: error instanceof Error ? error.message : "Erreur de déconnexion",
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
