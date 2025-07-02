// Types pour le système de collection de cartes

export interface UserCard {
  card_id: string;
  card_name: string;
  card_description: string;
  card_image_url: string | null;
  card_rarity: string;
  card_cost: number;
  card_attack: number | null;
  card_defense: number | null;
  quantity: number;
  card_created_at: string;
  card_updated_at: string;
}

export interface CollectionStats {
  total_cards: number;
  unique_cards: number;
  by_rarity: {
    common: number;
    rare: number;
    epic: number;
    legendary: number;
  };
  completion_percentage: number;
}

export interface CollectionFilters {
  rarity?: string;
  search?: string;
  sort_by?: 'name' | 'rarity' | 'cost' | 'attack' | 'defense';
  sort_order?: 'asc' | 'desc';
}

export interface CollectionResponse {
  cards: UserCard[];
  stats: CollectionStats;
  total_count: number;
} 