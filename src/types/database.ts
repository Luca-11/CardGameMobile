// Types générés automatiquement par Supabase CLI
// Ces types correspondent au schéma de base de données défini

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          username: string;
          email: string;
          avatar_url: string | null;
          daily_reward_claimed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          username: string;
          email: string;
          avatar_url?: string | null;
          daily_reward_claimed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          email?: string;
          avatar_url?: string | null;
          daily_reward_claimed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      cards: {
        Row: {
          id: string;
          name: string;
          type: string;
          rarity: string;
          image_url: string | null;
          description: string | null;
          attack: number;
          defense: number;
          cost: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: string;
          rarity: string;
          image_url?: string | null;
          description?: string | null;
          attack: number;
          defense: number;
          cost: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          type?: string;
          rarity?: string;
          image_url?: string | null;
          description?: string | null;
          attack?: number;
          defense?: number;
          cost?: number;
          created_at?: string;
        };
      };
      user_cards: {
        Row: {
          id: string;
          user_id: string;
          card_id: string;
          obtained_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          card_id: string;
          obtained_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          card_id?: string;
          obtained_at?: string;
        };
      };
      matches: {
        Row: {
          id: string;
          player1_id: string;
          player2_id: string;
          winner_id: string | null;
          match_data: Json;
          played_at: string;
        };
        Insert: {
          id?: string;
          player1_id: string;
          player2_id: string;
          winner_id?: string | null;
          match_data?: Json;
          played_at?: string;
        };
        Update: {
          id?: string;
          player1_id?: string;
          player2_id?: string;
          winner_id?: string | null;
          match_data?: Json;
          played_at?: string;
        };
      };
      packs: {
        Row: {
          id: string;
          name: string;
          price: number;
          card_pool: string[];
          card_count: number;
          image_url: string | null;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          price: number;
          card_pool: string[];
          card_count?: number;
          image_url?: string | null;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          price?: number;
          card_pool?: string[];
          card_count?: number;
          image_url?: string | null;
          description?: string | null;
          created_at?: string;
        };
      };
      user_packs: {
        Row: {
          id: string;
          user_id: string;
          pack_id: string;
          opened_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          pack_id: string;
          opened_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          pack_id?: string;
          opened_at?: string | null;
          created_at?: string;
        };
      };
      decks: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          cards: string[];
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          cards?: string[];
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          cards?: string[];
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      games: {
        Row: {
          id: string;
          created_at: string;
          player_id: string;
          opponent_id: string | null;
          winner_id: string | null;
          status: "waiting" | "in_progress" | "completed";
          score_player: number;
          score_opponent: number | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          player_id: string;
          opponent_id?: string | null;
          winner_id?: string | null;
          status?: "waiting" | "in_progress" | "completed";
          score_player?: number;
          score_opponent?: number | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          player_id?: string;
          opponent_id?: string | null;
          winner_id?: string | null;
          status?: "waiting" | "in_progress" | "completed";
          score_player?: number;
          score_opponent?: number | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type CardRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";
export type CardType = "creature" | "spell" | "equipment";
export type CardElement =
  | "fire"
  | "water"
  | "earth"
  | "air"
  | "light"
  | "dark"
  | "neutral";

export interface Card {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
  card_type: CardType;
  element: CardElement;
  rarity: CardRarity;
  mana_cost: number;
  attack: number | null;
  defense: number | null;
  created_at: string;
  updated_at: string;
}

export interface CardPack {
  id: string;
  name: string;
  description: string;
  price: number;
  cards_per_pack: number;
  image_url: string | null;
  rarity_weights: {
    common: number;
    uncommon: number;
    rare: number;
    epic: number;
    legendary: number;
  };
  guaranteed_rarity: CardRarity;
  created_at: string;
  updated_at: string;
}

export interface UserCard {
  id: string;
  user_id: string;
  card_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  card?: Card;
}

export interface PackPurchase {
  id: string;
  user_id: string;
  pack_id: string;
  quantity: number;
  total_price: number;
  created_at: string;
  opened_at: string | null;
}

export interface UserCurrency {
  user_id: string;
  coins: number;
  created_at: string;
  updated_at: string;
}

export interface BuyPackResponse {
  success: boolean;
  message: string;
  purchase_id: string | null;
  new_balance: number | null;
}
