// Types pour le système de collection de cartes

export interface UserCard {
  card_id: string;
  card_name: string;
  card_description: string;
  card_image_url: string | null;
  card_type: string;
  card_element: string;
  card_rarity: string;
  card_mana_cost: number;
  card_attack: number;
  card_defense: number;
  quantity: number;
  card_created_at: string;
  card_updated_at: string;
}

export interface CollectionStats {
  total_cards: number;
  unique_cards: number;
  by_rarity: {
    common: number;
    uncommon: number;
    rare: number;
    epic: number;
    legendary: number;
  };
  by_element: {
    fire: number;
    water: number;
    earth: number;
    air: number;
    neutral: number;
  };
  completion_percentage: number;
}

export interface CollectionFilters {
  rarity?: string;
  element?: string;
  card_type?: string;
  search?: string;
  sort_by?: 'name' | 'rarity' | 'mana_cost' | 'attack' | 'defense';
  sort_order?: 'asc' | 'desc';
}

export interface CollectionResponse {
  cards: UserCard[];
  stats: CollectionStats;
  total_count: number;
} 