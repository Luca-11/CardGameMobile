// Constantes de l'application CardGame

export const APP_CONFIG = {
  name: "CardGame",
  version: "1.0.0",
  description: "Jeu de cartes à collectionner",
};

export const GAME_CONFIG = {
  // Configuration du jeu
  MAX_DECK_SIZE: 40,
  MIN_DECK_SIZE: 20,
  MAX_HAND_SIZE: 7,
  STARTING_HEALTH: 30,
  STARTING_MANA: 1,
  MAX_MANA: 10,

  // Configuration des packs
  DEFAULT_PACK_SIZE: 5,
  PACK_PRICES: {
    BASIC: 100,
    PREMIUM: 250,
    LEGENDARY: 500,
  },

  // Configuration des récompenses
  DAILY_REWARD_COOLDOWN_HOURS: 24,
  DAILY_REWARD_CARDS: 3,

  // Configuration des raretés
  RARITY_WEIGHTS: {
    COMMON: 50,
    UNCOMMON: 30,
    RARE: 15,
    EPIC: 4,
    LEGENDARY: 1,
  },
};

export const UI_CONFIG = {
  // Configuration UI
  ANIMATION_DURATION: 300,
  TOAST_DURATION: 3000,

  // Couleurs des raretés
  RARITY_COLORS: {
    COMMON: "#9ca3af",
    UNCOMMON: "#22c55e",
    RARE: "#3b82f6",
    EPIC: "#a855f7",
    LEGENDARY: "#f59e0b",
  },

  // Couleurs du thème
  COLORS: {
    PRIMARY: "#3b82f6",
    SECONDARY: "#64748b",
    SUCCESS: "#10b981",
    WARNING: "#f59e0b",
    ERROR: "#ef4444",
    BACKGROUND: "#f3f4f6",
    WHITE: "#ffffff",
    BLACK: "#1f2937",
  },
};

export const API_CONFIG = {
  // Configuration des appels API
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  CACHE_DURATION: 300000, // 5 minutes
};

export const STORAGE_KEYS = {
  USER_PREFERENCES: "@cardgame:user_preferences",
  GAME_CACHE: "@cardgame:game_cache",
  OFFLINE_DATA: "@cardgame:offline_data",
};

export const ROUTES = {
  AUTH: "Auth",
  HOME: "Home",
  COLLECTION: "Collection",
  SHOP: "Shop",
  DECKBUILDER: "DeckBuilder",
  GAME: "Game",
  PROFILE: "Profile",
} as const;
