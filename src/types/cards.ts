export type Suit = "hearts" | "diamonds" | "clubs" | "spades";

export type Rank =
  | "A"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "J"
  | "Q"
  | "K";

export interface Card {
  suit: Suit;
  rank: Rank;
  value: number;
  isFlipped: boolean;
}

export interface Deck {
  cards: Card[];
  shuffle: () => void;
  draw: () => Card | undefined;
}

export interface GameState {
  deck: Deck;
  playerHand: Card[];
  computerHand: Card[];
  currentTurn: "player" | "computer";
  score: {
    player: number;
    computer: number;
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

export interface UserCard {
  id: string;
  user_id: string;
  card_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  // Relations
  card?: Card;
}

// Helpers
export const RARITY_COLORS = {
  common: "#B0B0B0", // Gris
  uncommon: "#00FF00", // Vert
  rare: "#0000FF", // Bleu
  epic: "#800080", // Violet
  legendary: "#FFA500", // Orange
} as const;

export const ELEMENT_COLORS = {
  fire: "#FF4444", // Rouge
  water: "#4444FF", // Bleu
  earth: "#8B4513", // Marron
  air: "#87CEEB", // Bleu ciel
  light: "#FFD700", // Or
  dark: "#483D8B", // Bleu foncé
  neutral: "#808080", // Gris
} as const;

export const ELEMENT_ICONS = {
  fire: "🔥",
  water: "💧",
  earth: "🌍",
  air: "💨",
  light: "✨",
  dark: "🌑",
  neutral: "⚪",
} as const;
