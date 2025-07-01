import { create } from "zustand";
import {
  GameStoreState,
  UserCard,
  Pack,
  UserPack,
  Deck,
  Card,
  BuyPackResponse,
} from "../types";
import {
  getSupabase,
  getUserCards,
  getAvailablePacks,
  purchasePack,
  openPack,
  getUserBalance,
  buyPack as buyPackService,
} from "../services/supabase";
import { PostgrestError } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

interface GameStore extends GameStoreState {
  // État
  userBalance: number | null;

  // Actions
  loadUserBalance: (userId: string) => Promise<void>;
  loadUserCards: (userId: string) => Promise<void>;
  loadAvailablePacks: () => Promise<void>;
  loadUserPacks: (userId: string) => Promise<void>;
  loadUserDecks: (userId: string) => Promise<void>;
  buyPack: (
    userId: string,
    packId: string,
    quantity?: number
  ) => Promise<BuyPackResponse | null>;
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

      const { data, error } = await getSupabase()
        .from("user_cards")
        .select("*, card:cards(*)")
        .eq("user_id", userId);

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
        .from("pack_purchases")
        .select(
          `
          *,
          pack:card_packs(*)
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

      const { data, error } = await getSupabase()
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
  buyPack: async (userId: string, packId: string, quantity = 1) => {
    try {
      console.log("🔵 Store - Début de buyPack", { userId, packId, quantity });
      set({ loading: true, error: null });

      const { data, error } = await buyPackService(userId, packId, quantity);
      console.log("🔵 Store - Réponse de buyPack", { data, error });

      if (error) {
        console.error("🔴 Store - Erreur buyPack:", error);
        set({
          loading: false,
          error: error.message || "Erreur d'achat du pack",
        });
        return null;
      }

      if (!data) {
        console.error("🔴 Store - Pas de données reçues de buyPack");
        set({
          loading: false,
          error: "Aucune donnée reçue lors de l'achat",
        });
        return null;
      }

      const response = data as BuyPackResponse;

      if (response.success) {
        console.log(
          "🟢 Store - Achat réussi, mise à jour du solde:",
          response.new_balance
        );
        // Mettre à jour le solde
        set({ userBalance: response.new_balance });

        // Recharger les packs de l'utilisateur
        console.log("🔵 Store - Rechargement des packs utilisateur");
        await get().loadUserPacks(userId);
      } else {
        console.log("🔴 Store - Achat échoué:", response.message);
      }

      set({ loading: false });
      return response;
    } catch (error) {
      console.error("🔴 Store - Exception buyPack:", error);
      set({
        loading: false,
        error:
          error instanceof Error ? error.message : "Erreur d'achat du pack",
      });
      return null;
    }
  },

  // Ouvrir un pack
  openUserPack: async (userPackId: string) => {
    try {
      set({ loading: true, error: null });

      const { data, error } = await getSupabase().functions.invoke(
        "open-pack",
        {
          body: { userPackId },
        }
      );

      if (error) {
        set({ loading: false, error: error.message });
        return null;
      }

      if (!data.success || !data.cards) {
        throw new Error("Error opening pack");
      }

      // Recharger les cartes de l'utilisateur
      const {
        data: { user },
      } = await getSupabase().auth.getUser();
      if (user) {
        await get().loadUserCards(user.id);
        await get().loadUserPacks(user.id);
      }

      set({ loading: false });
      return data.cards as Card[];
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

      const { error } = await getSupabase()
        .from("decks")
        .insert([
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

      const { error } = await getSupabase()
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

      // Mettre à jour le deck dans le state local
      const currentDecks = get().decks;
      const updatedDecks = currentDecks.map((deck) =>
        deck.id === deckId
          ? { ...deck, name, cards, updated_at: new Date().toISOString() }
          : deck
      );

      set({ decks: updatedDecks, loading: false, error: null });
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

      const { error } = await getSupabase()
        .from("decks")
        .delete()
        .eq("id", deckId);

      if (error) {
        set({ loading: false, error: error.message });
        return false;
      }

      // Supprimer le deck du state local
      const currentDecks = get().decks;
      const updatedDecks = currentDecks.filter((deck) => deck.id !== deckId);

      set({ decks: updatedDecks, loading: false, error: null });
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

  // Définir un deck comme actif
  setActiveDeck: async (deckId: string) => {
    try {
      set({ loading: true, error: null });

      const currentDecks = get().decks;
      const userDeck = currentDecks.find((deck) => deck.id === deckId);

      if (!userDeck) {
        set({ loading: false, error: "Deck non trouvé" });
        return false;
      }

      // Désactiver tous les decks de l'utilisateur
      await getSupabase()
        .from("decks")
        .update({ is_active: false })
        .eq("user_id", userDeck.user_id);

      // Activer le deck sélectionné
      const { error } = await getSupabase()
        .from("decks")
        .update({ is_active: true })
        .eq("id", deckId);

      if (error) {
        set({ loading: false, error: error.message });
        return false;
      }

      // Mettre à jour le state local
      const updatedDecks = currentDecks.map((deck) => ({
        ...deck,
        is_active: deck.id === deckId,
      }));

      set({ decks: updatedDecks, loading: false, error: null });
      return true;
    } catch (error) {
      console.error("Error setting active deck:", error);
      set({
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : "Erreur d'activation du deck",
      });
      return false;
    }
  },

  // Réclamer la récompense journalière
  claimDailyReward: async (userId: string) => {
    try {
      set({ loading: true, error: null });

      const { data, error } = await getSupabase().functions.invoke(
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
