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
            console.warn(
              "Table users non accessible, création d'un utilisateur temporaire:",
              userError
            );
            // Créer un utilisateur temporaire basé sur auth.users
            const tempUser = {
              id: session.user.id,
              username: session.user.email?.split('@')[0] || 'user',
              email: session.user.email || '',
              avatar_url: undefined,
              coins: 1000,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            
            set({
              session,
              user: tempUser as User,
              loading: false,
              error: null,
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
            // Essayer de récupérer les données utilisateur de la table users
            const { data: userData, error: userError } = await supabase
              .from("users")
              .select("*")
              .eq("id", session.user.id)
              .single();

            if (userError) {
              console.warn(
                "Table users non accessible, création d'un utilisateur temporaire:",
                userError
              );
              // Créer un utilisateur temporaire basé sur auth.users
              const tempUser = {
                id: session.user.id,
                username: session.user.email?.split('@')[0] || 'user',
                email: session.user.email || '',
                avatar_url: undefined,
                coins: 1000,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              };
              
              set({
                session,
                user: tempUser as User,
                loading: false,
                error: null,
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
            // Fallback vers un utilisateur temporaire
            const tempUser = {
              id: session.user.id,
              username: session.user.email?.split('@')[0] || 'user',
              email: session.user.email || '',
              avatar_url: undefined,
              coins: 1000,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            
            set({
              session,
              user: tempUser as User,
              loading: false,
              error: null,
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

      console.log("🔵 AuthStore - Tentative d'inscription:", { email, username });

      // Étape 1: Inscription Supabase sans métadonnées pour éviter le trigger défaillant
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error("❌ Erreur Supabase signup:", error);
        set({ loading: false, error: error.message });
        return false;
      }

      console.log("✅ Inscription Supabase réussie:", data);

      // Étape 2: Créer manuellement l'utilisateur dans la table users
      if (data?.user) {
        try {
          console.log("🔵 Création manuelle du profil utilisateur...");
          
          const { error: profileError } = await supabase.from("users").insert([
            {
              id: data.user.id,
              email: email,
              username: username,
              coins: 1000,
            },
          ]);

          if (profileError) {
            console.error("❌ Erreur création profil:", profileError);
            
            // Analyser l'erreur
            let errorMessage = "Erreur lors de la création du profil.";
            if (profileError.message.includes('duplicate key value')) {
              if (profileError.message.includes('users_email_key')) {
                errorMessage = "Cette adresse email est déjà utilisée.";
              } else if (profileError.message.includes('users_username_key')) {
                errorMessage = "Ce nom d'utilisateur est déjà pris. Essayez: " + username + Math.floor(Math.random() * 1000);
              }
            }
            
            set({ loading: false, error: errorMessage });
            return false;
          }

          console.log("✅ Profil utilisateur créé avec succès");
        } catch (profileError) {
          console.error("❌ Erreur lors de la création du profil:", profileError);
          set({ loading: false, error: "Erreur lors de la création du profil utilisateur." });
          return false;
        }
      }

      set({ loading: false, error: null });
      return true;
    } catch (error) {
      console.error("❌ Register error:", error);
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
