// Types de base pour le jeu de cartes à collectionner
import { CardPack } from "./database";
import { ScreenNames } from "./enums";

export interface User {
  id: string;
  email: string;
  username: string;
  avatar_url?: string;
  role: "user" | "admin";
  coins: number;
  created_at: string;
  updated_at: string;
}

export interface Card {
  id: string;
  name: string;
  type: CardType;
  rarity: CardRarity;
  image_url: string;
  description: string;
  attack?: number;
  defense?: number;
  cost?: number;
  created_at: string;
}

export interface UserCard {
  id: string;
  user_id: string;
  card_id: string;
  obtained_at: string;
  card?: Card;
}

export interface Match {
  id: string;
  player1_id: string;
  player2_id: string;
  winner_id?: string;
  played_at: string;
  match_data?: any;
}

export interface Pack {
  id: string;
  name: string;
  price: number;
  card_pool: string[];
  card_count: number;
  image_url?: string;
  description?: string;
}

export interface UserPack {
  id: string;
  user_id: string;
  pack_id: string;
  opened_at?: string;
  pack?: Pack;
}

export interface Deck {
  id: string;
  user_id: string;
  name: string;
  cards: string[]; // Array of card IDs
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Enums
export enum CardType {
  CREATURE = "creature",
  SPELL = "spell",
  ARTIFACT = "artifact",
  ENCHANTMENT = "enchantment",
}

export enum CardRarity {
  COMMON = "common",
  UNCOMMON = "uncommon",
  RARE = "rare",
  EPIC = "epic",
  LEGENDARY = "legendary",
}

// Navigation types
export type RootStackParamList = {
  AuthenticatedStack: undefined;
  Auth: undefined;
  Main: undefined;
  PackDetails: { pack: CardPack };
  PackOpening: { purchaseId: string };
  Game: { matchId?: string };
  Decks: undefined;
  DeckBuilder: { deckId?: string };
  Profile: undefined;
  Settings: undefined;
};

export type MainTabParamList = {
  [ScreenNames.HOME]: undefined;
  [ScreenNames.COLLECTION]: undefined;
  [ScreenNames.SHOP]: undefined;
  [ScreenNames.DECKBUILDER]: { deckId?: string };
  [ScreenNames.PROFILE]: undefined;
};

// Game state types
export interface GameState {
  player1: GamePlayer;
  player2: GamePlayer;
  currentTurn: string; // player ID
  phase: GamePhase;
  winner?: string;
}

export interface GamePlayer {
  id: string;
  username: string;
  health: number;
  mana: number;
  deck: Card[];
  hand: Card[];
  board: Card[];
  graveyard: Card[];
}

export enum GamePhase {
  WAITING = "waiting",
  DRAW = "draw",
  MAIN = "main",
  COMBAT = "combat",
  END = "end",
}

// Store types
export interface AuthState {
  user: User | null;
  session: any;
  loading: boolean;
  error: string | null;
}

export interface GameStoreState {
  userCards: UserCard[];
  userPacks: UserPack[];
  availablePacks: Pack[];
  decks: Deck[];
  currentGame: GameState | null;
  loading: boolean;
  error: string | null;
}

export interface BuyPackResponse {
  success: boolean;
  message: string;
  purchase_id: string | null;
  new_balance: number;
}
