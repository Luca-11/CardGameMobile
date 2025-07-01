import { create } from "zustand";
import { GameStoreState, UserCard, Pack, UserPack, Deck, Card } from "../types";
import {
  getUserCards,
  getAvailablePacks,
  purchasePack,
  openPack,
  getUserBalance,
  buyPack as buyPackService,
} from "../services/supabase";
import { PostgrestError } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

interface BuyPackResponse {
  success: boolean;
  message: string;
  purchase_id: string;
  new_balance: number;
}

interface GameStore extends GameStoreState {
  // État
  userBalance: number | null;

  // Actions
  loadUserBalance: (userId: string) => Promise<void>;
  loadUserCards: (userId: string) => Promise<void>;
  loadAvailablePacks: () => Promise<void>;
  loadUserPacks: (userId: string) => Promise<void>;
  loadUserDecks: (userId: string) => Promise<void>;
  buyPack: (packId: string) => Promise<BuyPackResponse>;
  openUserPack: (userPackId: string) => Promise<Card[] | null>;
  createDeck: (
    userId: string,
    name: string,
    cards: string[]
  ) => Promise<boolean>;
  updateDeck: (
    deckId: string,
    name: string,
    cards: string[]
  ) => Promise<boolean>;
  deleteDeck: (deckId: string) => Promise<boolean>;
  setActiveDeck: (deckId: string) => Promise<boolean>;
  claimDailyReward: (userId: string) => Promise<boolean>;
  clearError: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  // État initial
  userBalance: null,
  loading: false,
  error: null,
  userCards: [],
  userPacks: [],
  availablePacks: [],
  decks: [],
  currentGame: null,
  activeDeck: null,

  // Actions
  loadUserBalance: async (userId: string) => {
    try {
      set({ loading: true, error: null });
      const result = await getUserBalance(userId);

      if (result.error) {
        throw new Error(
          result.error.message || "Erreur de chargement du solde"
        );
      }

      set({ userBalance: result.data ?? 0, loading: false });
    } catch (error) {
      console.error("Error loading user balance:", error);
      set({
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : "Erreur de chargement du solde",
      });
    }
  },

  // Charger les cartes de l'utilisateur
  loadUserCards: async (userId: string) => {
    try {
      console.log("🔵 Store - Début de loadUserCards", { userId });
      set({ loading: true, error: null });

      const { data, error } = await getUserCards(userId);

      console.log("🔵 Store - Réponse de getUserCards", {
        success: !!data,
        cardCount: data?.length || 0,
        error,
      });

      if (error) {
        console.log("🔴 Store - Erreur getUserCards:", error);
        set({ loading: false, error: error.message });
        return;
      }

      console.log("🟢 Store - Cartes chargées avec succès");
      set({
        userCards: data || [],
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error("🔴 Store - Exception loadUserCards:", error);
      set({
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : "Erreur de chargement des cartes",
      });
    }
  },

  // Charger les packs disponibles
  loadAvailablePacks: async () => {
    try {
      set({ loading: true, error: null });

      const { data, error } = await getAvailablePacks();

      if (error) {
        set({ loading: false, error: error.message });
        return;
      }

      set({
        availablePacks: (data as Pack[]) || [],
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error("Error loading available packs:", error);
      set({
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : "Erreur de chargement des packs",
      });
    }
  },

  // Charger les packs de l'utilisateur
  loadUserPacks: async (userId: string) => {
    try {
      console.log("🔵 Store - Début de loadUserPacks", { userId });
      set({ loading: true, error: null });

      const { data, error } = await supabase
        .from("user_packs")
        .select(
          `
          *,
          pack:packs(*)
        `
        )
        .eq("user_id", userId)
        .is("opened_at", null);

      console.log("🔵 Store - Réponse loadUserPacks:", { data, error });

      if (error) {
        console.error("🔴 Store - Erreur loadUserPacks:", error);
        set({ loading: false, error: error.message });
        return;
      }

      console.log(
        "🟢 Store - Packs utilisateur chargés:",
        data?.length || 0,
        "packs"
      );
      set({
        userPacks: data || [],
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error("🔴 Store - Exception loadUserPacks:", error);
      set({
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : "Erreur de chargement des packs",
      });
    }
  },

  // Charger les decks de l'utilisateur
  loadUserDecks: async (userId: string) => {
    try {
      set({ loading: true, error: null });

      const { data, error } = await supabase
        .from("decks")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        set({ loading: false, error: error.message });
        return;
      }

      set({
        decks: (data as Deck[]) || [],
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error("Error loading user decks:", error);
      set({
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : "Erreur de chargement des decks",
      });
    }
  },

  // Acheter un pack
  buyPack: async (packId: string): Promise<BuyPackResponse> => {
    try {
      console.log("🔵 Store - Début de buyPack", { packId });
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.error("🔴 Store - Utilisateur non connecté");
        throw new Error("Utilisateur non connecté");
      }

      console.log("🔵 Store - Utilisateur trouvé:", user.id);
      const { success, purchase_id, new_balance, message } =
        await buyPackService(user.id, packId);
      console.log("🔵 Store - Résultat de buyPack:", {
        success,
        purchase_id,
        new_balance,
        message,
      });

      if (!success) {
        console.error("🔴 Store - Échec de l'achat:", message);
        throw new Error(message || "Erreur lors de l'achat");
      }

      // Mettre à jour le solde
      await get().loadUserBalance(user.id);
      // Recharger les packs de l'utilisateur
      await get().loadUserPacks(user.id);

      return { success, purchase_id, new_balance, message: "Achat réussi" };
    } catch (error) {
      console.error("🔴 Store - Exception buyPack:", error);
      throw error;
    }
  },

  // Ouvrir un pack
  openUserPack: async (userPackId: string) => {
    try {
      set({ loading: true, error: null });

      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      if (!accessToken) {
        throw new Error("Non authentifié");
      }

      const { data, error } = await supabase.functions.invoke<{
        success: boolean;
        cards: Card[];
        error?: string;
      }>("open-pack", {
        body: { userPackId },
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (error) {
        set({ loading: false, error: error.message });
        return null;
      }

      if (!data?.success || !data?.cards) {
        throw new Error("Erreur lors de l'ouverture du pack");
      }

      // Recharger les cartes de l'utilisateur
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await get().loadUserCards(user.id);
        await get().loadUserPacks(user.id);
      }

      set({ loading: false });
      return data.cards;
    } catch (error) {
      console.error("Error opening pack:", error);
      set({
        loading: false,
        error:
          error instanceof Error ? error.message : "Erreur d'ouverture du pack",
      });
      return null;
    }
  },

  // Créer un deck
  createDeck: async (userId: string, name: string, cards: string[]) => {
    try {
      set({ loading: true, error: null });

      const { error } = await supabase.from("decks").insert([
        {
          user_id: userId,
          name,
          cards,
          is_active: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        set({ loading: false, error: error.message });
        return false;
      }

      // Recharger les decks
      await get().loadUserDecks(userId);

      set({ loading: false, error: null });
      return true;
    } catch (error) {
      console.error("Error creating deck:", error);
      set({
        loading: false,
        error:
          error instanceof Error ? error.message : "Erreur de création du deck",
      });
      return false;
    }
  },

  // Mettre à jour un deck
  updateDeck: async (deckId: string, name: string, cards: string[]) => {
    try {
      set({ loading: true, error: null });

      const { error } = await supabase
        .from("decks")
        .update({
          name,
          cards,
          updated_at: new Date().toISOString(),
        })
        .eq("id", deckId);

      if (error) {
        set({ loading: false, error: error.message });
        return false;
      }

      set({ loading: false });
      return true;
    } catch (error) {
      console.error("Error updating deck:", error);
      set({
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : "Erreur de mise à jour du deck",
      });
      return false;
    }
  },

  // Supprimer un deck
  deleteDeck: async (deckId: string) => {
    try {
      set({ loading: true, error: null });

      const { error } = await supabase.from("decks").delete().eq("id", deckId);

      if (error) {
        set({ loading: false, error: error.message });
        return false;
      }

      set({ loading: false });
      return true;
    } catch (error) {
      console.error("Error deleting deck:", error);
      set({
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : "Erreur de suppression du deck",
      });
      return false;
    }
  },

  // Définir le deck actif
  setActiveDeck: async (deckId: string) => {
    try {
      set({ loading: true, error: null });

      // Récupérer les informations du deck
      const { data: userDeck, error: fetchError } = await supabase
        .from("decks")
        .select("*")
        .eq("id", deckId)
        .single();

      if (fetchError || !userDeck) {
        set({ loading: false, error: fetchError?.message });
        return false;
      }

      // Désactiver tous les decks de l'utilisateur
      await supabase
        .from("decks")
        .update({ is_active: false })
        .eq("user_id", userDeck.user_id);

      // Activer le deck sélectionné
      const { error } = await supabase
        .from("decks")
        .update({ is_active: true })
        .eq("id", deckId);

      if (error) {
        set({ loading: false, error: error.message });
        return false;
      }

      set({ loading: false });
      return true;
    } catch (error) {
      console.error("Error setting active deck:", error);
      set({
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : "Erreur de définition du deck actif",
      });
      return false;
    }
  },

  // Réclamer la récompense journalière
  claimDailyReward: async (userId: string) => {
    try {
      set({ loading: true, error: null });

      const { data, error } = await supabase.functions.invoke(
        "claim-daily-reward",
        {
          body: { userId },
        }
      );

      if (error) {
        set({ loading: false, error: error.message });
        return false;
      }

      // Recharger les cartes de l'utilisateur pour voir les nouvelles cartes
      await get().loadUserCards(userId);

      set({ loading: false, error: null });
      return true;
    } catch (error) {
      console.error("Error claiming daily reward:", error);
      set({
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : "Erreur de réclamation de la récompense",
      });
      return false;
    }
  },

  // Effacer les erreurs
  clearError: () => {
    set({ error: null });
  },
}));
