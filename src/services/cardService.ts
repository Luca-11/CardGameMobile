import { supabase } from "./supabase";
import { Card, UserCard } from "../types/cards";

export const cardService = {
  // Récupérer toutes les cartes
  async getAllCards(): Promise<Card[]> {
    const { data, error } = await supabase
      .from("cards")
      .select("*")
      .order("name");

    if (error) {
      console.error("Error fetching cards:", error);
      throw error;
    }

    return data;
  },

  // Récupérer une carte par son ID
  async getCardById(id: string): Promise<Card | null> {
    const { data, error } = await supabase
      .from("cards")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching card:", error);
      throw error;
    }

    return data;
  },

  // Récupérer les cartes d'un utilisateur
  async getUserCards(userId: string): Promise<UserCard[]> {
    const { data, error } = await supabase
      .from("user_cards")
      .select(
        `
        *,
        card:cards(*)
      `
      )
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching user cards:", error);
      throw error;
    }

    return data;
  },

  // Ajouter une carte à la collection d'un utilisateur
  async addCardToUser(
    userId: string,
    cardId: string,
    quantity: number = 1
  ): Promise<void> {
    const { error: existingError, data: existingCard } = await supabase
      .from("user_cards")
      .select("*")
      .eq("user_id", userId)
      .eq("card_id", cardId)
      .single();

    if (existingCard) {
      // Mettre à jour la quantité si la carte existe déjà
      const { error } = await supabase
        .from("user_cards")
        .update({ quantity: existingCard.quantity + quantity })
        .eq("user_id", userId)
        .eq("card_id", cardId);

      if (error) {
        console.error("Error updating card quantity:", error);
        throw error;
      }
    } else {
      // Ajouter une nouvelle entrée si la carte n'existe pas
      const { error } = await supabase.from("user_cards").insert([
        {
          user_id: userId,
          card_id: cardId,
          quantity,
        },
      ]);

      if (error) {
        console.error("Error adding card to user:", error);
        throw error;
      }
    }
  },

  // Retirer une carte de la collection d'un utilisateur
  async removeCardFromUser(
    userId: string,
    cardId: string,
    quantity: number = 1
  ): Promise<void> {
    const { error: existingError, data: existingCard } = await supabase
      .from("user_cards")
      .select("*")
      .eq("user_id", userId)
      .eq("card_id", cardId)
      .single();

    if (!existingCard) {
      throw new Error("Card not found in user collection");
    }

    if (existingCard.quantity <= quantity) {
      // Supprimer l'entrée si la quantité devient 0 ou négative
      const { error } = await supabase
        .from("user_cards")
        .delete()
        .eq("user_id", userId)
        .eq("card_id", cardId);

      if (error) {
        console.error("Error removing card from user:", error);
        throw error;
      }
    } else {
      // Réduire la quantité
      const { error } = await supabase
        .from("user_cards")
        .update({ quantity: existingCard.quantity - quantity })
        .eq("user_id", userId)
        .eq("card_id", cardId);

      if (error) {
        console.error("Error updating card quantity:", error);
        throw error;
      }
    }
  },

  // Filtrer les cartes par type
  async getCardsByType(type: Card["card_type"]): Promise<Card[]> {
    const { data, error } = await supabase
      .from("cards")
      .select("*")
      .eq("card_type", type)
      .order("name");

    if (error) {
      console.error("Error fetching cards by type:", error);
      throw error;
    }

    return data;
  },

  // Filtrer les cartes par élément
  async getCardsByElement(element: Card["element"]): Promise<Card[]> {
    const { data, error } = await supabase
      .from("cards")
      .select("*")
      .eq("element", element)
      .order("name");

    if (error) {
      console.error("Error fetching cards by element:", error);
      throw error;
    }

    return data;
  },

  // Filtrer les cartes par rareté
  async getCardsByRarity(rarity: Card["rarity"]): Promise<Card[]> {
    const { data, error } = await supabase
      .from("cards")
      .select("*")
      .eq("rarity", rarity)
      .order("name");

    if (error) {
      console.error("Error fetching cards by rarity:", error);
      throw error;
    }

    return data;
  },

  // Rechercher des cartes par nom
  async searchCards(searchTerm: string): Promise<Card[]> {
    const { data, error } = await supabase
      .from("cards")
      .select("*")
      .ilike("name", `%${searchTerm}%`)
      .order("name");

    if (error) {
      console.error("Error searching cards:", error);
      throw error;
    }

    return data;
  },
};
