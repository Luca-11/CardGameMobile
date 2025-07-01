import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { supabase } from "../lib/supabase";
import { DeckItem } from "../components/DeckItem";
import { DecksNavigationProp } from "../types/navigation";
import { Ionicons } from "@expo/vector-icons";

interface Deck {
  id: string;
  name: string;
  cards: {
    quantity: number;
    card: {
      mana_cost: number;
    };
  }[];
}

export const Decks = () => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<DecksNavigationProp>();
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      fetchDecks();
    }
  }, [isFocused]);

  const fetchDecks = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("decks")
        .select(
          `
          id,
          name,
          cards:deck_cards(
            quantity,
            card:cards(
              mana_cost
            )
          )
        `
        )
        .eq("user_id", user.id);

      if (error) throw error;
      setDecks(data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des decks:", error);
      Alert.alert("Erreur", "Impossible de charger les decks");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (deckId: string) => {
    Alert.alert(
      "Supprimer le deck",
      "Êtes-vous sûr de vouloir supprimer ce deck ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from("decks")
                .delete()
                .eq("id", deckId);

              if (error) throw error;
              fetchDecks();
            } catch (error) {
              console.error("Erreur lors de la suppression:", error);
              Alert.alert("Erreur", "Impossible de supprimer le deck");
            }
          },
        },
      ]
    );
  };

  const calculateDeckStats = (deck: Deck) => {
    const totalCards = deck.cards.reduce((sum, c) => sum + c.quantity, 0);
    const totalMana = deck.cards.reduce(
      (sum, c) => sum + c.card.mana_cost * c.quantity,
      0
    );
    return {
      cardCount: totalCards,
      averageMana: totalMana / totalCards || 0,
    };
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Chargement des decks...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate("DeckEdit", { deckId: null })}
      >
        <Ionicons name="add" size={24} color="white" />
        <Text style={styles.createButtonText}>Nouveau Deck</Text>
      </TouchableOpacity>

      <FlatList
        data={decks}
        renderItem={({ item: deck }) => {
          const stats = calculateDeckStats(deck);
          return (
            <TouchableOpacity
              style={styles.deckItemContainer}
              onPress={() =>
                navigation.navigate("DeckEdit", { deckId: deck.id })
              }
              onLongPress={() => handleDelete(deck.id)}
            >
              <DeckItem
                name={deck.name}
                cardCount={stats.cardCount}
                averageMana={stats.averageMana}
                onPress={() =>
                  navigation.navigate("DeckEdit", { deckId: deck.id })
                }
              />
            </TouchableOpacity>
          );
        }}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Vous n'avez pas encore de deck.{"\n"}
              Créez-en un pour commencer !
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2ecc71",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  createButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
  list: {
    padding: 16,
  },
  deckItemContainer: {
    marginBottom: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
  },
});
