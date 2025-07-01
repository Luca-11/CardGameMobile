import { supabase } from '../lib/supabase';
import { UserCard, CollectionStats, CollectionFilters, CollectionResponse } from '../types/collection';

export const collectionService = {
  // Récupérer la collection d'un utilisateur
  async getUserCollection(userId: string, filters?: CollectionFilters): Promise<CollectionResponse> {
    try {
      console.log('🔍 Récupération de la collection pour l\'utilisateur:', userId);
      
      // Appeler la fonction RPC pour récupérer la collection
      const { data: cards, error } = await supabase.rpc('get_user_collection', {
        p_user_id: userId
      });

      if (error) {
        console.error('❌ Erreur lors de la récupération de la collection:', error);
        throw error;
      }

      console.log('✅ Collection récupérée:', cards?.length || 0, 'cartes');

      // Filtrer les cartes si des filtres sont fournis
      let filteredCards = cards || [];
      if (filters) {
        filteredCards = this.filterCards(cards || [], filters);
      }

      // Calculer les statistiques
      const stats = this.calculateStats(cards || []);

      return {
        cards: filteredCards,
        stats,
        total_count: filteredCards.length
      };
    } catch (error) {
      console.error('❌ Erreur dans getUserCollection:', error);
      throw error;
    }
  },

  // Ajouter une carte à la collection
  async addCardToCollection(userId: string, cardId: string, quantity: number = 1): Promise<boolean> {
    try {
      console.log('🔍 Ajout de carte à la collection:', { userId, cardId, quantity });
      
      const { data, error } = await supabase.rpc('add_card_to_collection', {
        p_user_id: userId,
        p_card_id: cardId,
        p_quantity: quantity
      });

      if (error) {
        console.error('❌ Erreur lors de l\'ajout de la carte:', error);
        throw error;
      }

      console.log('✅ Carte ajoutée à la collection:', data);
      return data;
    } catch (error) {
      console.error('❌ Erreur dans addCardToCollection:', error);
      throw error;
    }
  },

  // Récupérer les statistiques de la collection
  async getCollectionStats(userId: string): Promise<CollectionStats> {
    try {
      const { data: cards, error } = await supabase.rpc('get_user_collection', {
        p_user_id: userId
      });

      if (error) {
        console.error('❌ Erreur lors de la récupération des stats:', error);
        throw error;
      }

      return this.calculateStats(cards || []);
    } catch (error) {
      console.error('❌ Erreur dans getCollectionStats:', error);
      throw error;
    }
  },

  // Filtrer les cartes selon les critères
  filterCards(cards: UserCard[], filters: CollectionFilters): UserCard[] {
    let filtered = [...cards];

    // Filtre par rareté
    if (filters.rarity) {
      filtered = filtered.filter(card => card.card_rarity === filters.rarity);
    }

    // Filtre par élément
    if (filters.element) {
      filtered = filtered.filter(card => card.card_element === filters.element);
    }

    // Filtre par type de carte
    if (filters.card_type) {
      filtered = filtered.filter(card => card.card_type === filters.card_type);
    }

    // Filtre par recherche textuelle
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(card => 
        card.card_name.toLowerCase().includes(searchLower) ||
        card.card_description.toLowerCase().includes(searchLower)
      );
    }

    // Tri
    if (filters.sort_by) {
      filtered.sort((a, b) => {
        let aValue: any, bValue: any;
        
        switch (filters.sort_by) {
          case 'name':
            aValue = a.card_name;
            bValue = b.card_name;
            break;
          case 'rarity':
            aValue = this.getRarityWeight(a.card_rarity);
            bValue = this.getRarityWeight(b.card_rarity);
            break;
          case 'mana_cost':
            aValue = a.card_mana_cost;
            bValue = b.card_mana_cost;
            break;
          case 'attack':
            aValue = a.card_attack;
            bValue = b.card_attack;
            break;
          case 'defense':
            aValue = a.card_defense;
            bValue = b.card_defense;
            break;
          default:
            aValue = a.card_name;
            bValue = b.card_name;
        }

        if (filters.sort_order === 'desc') {
          return bValue > aValue ? 1 : -1;
        } else {
          return aValue > bValue ? 1 : -1;
        }
      });
    }

    return filtered;
  },

  // Calculer les statistiques de la collection
  calculateStats(cards: UserCard[]): CollectionStats {
    const stats: CollectionStats = {
      total_cards: 0,
      unique_cards: cards.length,
      by_rarity: {
        common: 0,
        uncommon: 0,
        rare: 0,
        epic: 0,
        legendary: 0
      },
      by_element: {
        fire: 0,
        water: 0,
        earth: 0,
        air: 0,
        neutral: 0
      },
      completion_percentage: 0
    };

    // Compter les cartes par rareté et élément
    cards.forEach(card => {
      stats.total_cards += card.quantity;
      
      // Compter par rareté
      if (card.card_rarity in stats.by_rarity) {
        stats.by_rarity[card.card_rarity as keyof typeof stats.by_rarity] += card.quantity;
      }
      
      // Compter par élément
      if (card.card_element in stats.by_element) {
        stats.by_element[card.card_element as keyof typeof stats.by_element] += card.quantity;
      }
    });

    // Calculer le pourcentage de completion (à implémenter plus tard)
    stats.completion_percentage = 0;

    return stats;
  },

  // Obtenir le poids d'une rareté pour le tri
  getRarityWeight(rarity: string): number {
    const weights = {
      common: 1,
      uncommon: 2,
      rare: 3,
      epic: 4,
      legendary: 5
    };
    return weights[rarity as keyof typeof weights] || 0;
  }
}; 