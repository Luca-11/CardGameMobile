import { supabase } from '../lib/supabase';
import { UserCard, CollectionStats, CollectionFilters, CollectionResponse } from '../types/collection';

export const collectionService = {
  // Récupérer la collection d'un utilisateur
  async getUserCollection(userId: string, filters?: CollectionFilters): Promise<CollectionResponse> {
    try {
      console.log('🔍 Récupération de la collection pour l\'utilisateur:', userId);
      
      // Utiliser directement l'API REST au lieu de la fonction RPC
      const { data: userCards, error: userCardsError } = await supabase
        .from('user_cards')
        .select(`
          id,
          card_id,
          obtained_at,
          cards (
            id,
            name,
            description,
            image_url,
            rarity,
            cost,
            attack,
            defense,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', userId);

      if (userCardsError) {
        console.error('❌ Erreur lors de la récupération de la collection:', userCardsError);
        throw userCardsError;
      }

      console.log('✅ Collection récupérée:', userCards?.length || 0, 'entrées');

      // Transformer les données pour correspondre au format attendu
      const cards: UserCard[] = this.transformUserCards(userCards || []);

      // Filtrer les cartes si des filtres sont fournis
      let filteredCards = cards;
      if (filters) {
        filteredCards = this.filterCards(cards, filters);
      }

      // Calculer les statistiques
      const stats = this.calculateStats(cards);

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

  // Transformer les données de user_cards pour correspondre au format UserCard
  transformUserCards(userCards: any[]): UserCard[] {
    // Grouper les cartes par ID et compter les quantités
    const cardMap = new Map<string, UserCard>();
    
    userCards.forEach(uc => {
      if (!uc.cards) return; // Ignorer si pas de carte associée
      
      const cardId = uc.cards.id;
      if (cardMap.has(cardId)) {
        // Augmenter la quantité si la carte existe déjà
        const existingCard = cardMap.get(cardId)!;
        existingCard.quantity += 1;
      } else {
        // Créer une nouvelle entrée
        cardMap.set(cardId, {
          card_id: uc.cards.id,
          card_name: uc.cards.name,
          card_description: uc.cards.description || '',
          card_image_url: uc.cards.image_url,
          card_rarity: uc.cards.rarity,
          card_cost: uc.cards.cost || 0,
          card_attack: uc.cards.attack,
          card_defense: uc.cards.defense,
          quantity: 1,
          card_created_at: uc.cards.created_at,
          card_updated_at: uc.cards.updated_at
        });
      }
    });

    return Array.from(cardMap.values());
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
          case 'cost':
            aValue = a.card_cost;
            bValue = b.card_cost;
            break;
          case 'attack':
            aValue = a.card_attack || 0;
            bValue = b.card_attack || 0;
            break;
          case 'defense':
            aValue = a.card_defense || 0;
            bValue = b.card_defense || 0;
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
        rare: 0,
        epic: 0,
        legendary: 0
      },
      completion_percentage: 0
    };

    // Compter les cartes par rareté
    cards.forEach(card => {
      stats.total_cards += card.quantity;
      
      // Compter par rareté
      if (card.card_rarity in stats.by_rarity) {
        stats.by_rarity[card.card_rarity as keyof typeof stats.by_rarity] += card.quantity;
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
      rare: 2,
      epic: 3,
      legendary: 4
    };
    return weights[rarity as keyof typeof weights] || 0;
  }
}; 