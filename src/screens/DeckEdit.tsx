import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { DecksStackParamList } from "../types/navigation";
import { supabase } from "../lib/supabase";
import { Card, UserCard } from "../types/database";
import { CardItem } from "../components/CardItem";
import { Ionicons } from "@expo/vector-icons";

type DeckEditRouteProp = RouteProp<DecksStackParamList, "DeckEdit">;

interface DeckCard {
  card: Card;
  quantity: number;
}

export const DeckEdit = () => {
  const route = useRoute<DeckEditRouteProp>();
  const navigation = useNavigation();
  const [deckName, setDeckName] = useState("");
  const [deckCards, setDeckCards] = useState<DeckCard[]>([]);
  const [userCards, setUserCards] = useState<(UserCard & { card: Card })[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchDeckDetails();
    fetchUserCards();
  }, []);

  const fetchDeckDetails = async () => {
    if (!route.params.deckId) return;

    try {
      const { data: deck, error: deckError } = await supabase
        .from("decks")
        .select("name")
        .eq("id", route.params.deckId)
        .single();

      if (deckError) throw deckError;

      const { data: cards, error: cardsError } = await supabase
        .from("deck_cards")
        .select("quantity, card:cards(*)")
        .eq("deck_id", route.params.deckId);

      if (cardsError) throw cardsError;

      setDeckName(deck.name);
      setDeckCards(cards.map((c) => ({ card: c.card, quantity: c.quantity })));
    } catch (error) {
      console.error("Erreur lors du chargement du deck:", error);
      Alert.alert("Erreur", "Impossible de charger le deck");
    }
  };

  const fetchUserCards = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("user_cards")
        .select("*, card:cards(*)")
        .eq("user_id", user.id);

      if (error) throw error;
      setUserCards(data as (UserCard & { card: Card })[]);
    } catch (error) {
      console.error("Erreur lors du chargement des cartes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!deckName.trim()) {
      Alert.alert("Erreur", "Le deck doit avoir un nom");
      return;
    }

    if (deckCards.length < 20) {
      Alert.alert("Erreur", "Le deck doit contenir au moins 20 cartes");
      return;
    }

    try {
      setSaving(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Non connecté");

      let deckId = route.params.deckId;

      if (!deckId) {
        const { data: newDeck, error: deckError } = await supabase
          .from("decks")
          .insert([
            {
              name: deckName,
              user_id: user.id,
            },
          ])
          .select()
          .single();

        if (deckError) throw deckError;
        deckId = newDeck.id;
      } else {
        const { error: updateError } = await supabase
          .from("decks")
          .update({ name: deckName })
          .eq("id", deckId);

        if (updateError) throw updateError;
      }

      // Supprimer les cartes existantes
      await supabase.from("deck_cards").delete().eq("deck_id", deckId);

      // Ajouter les nouvelles cartes
      const { error: cardsError } = await supabase.from("deck_cards").insert(
        deckCards.map((dc) => ({
          deck_id: deckId,
          card_id: dc.card.id,
          quantity: dc.quantity,
        }))
      );

      if (cardsError) throw cardsError;

      navigation.goBack();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      Alert.alert("Erreur", "Impossible de sauvegarder le deck");
    } finally {
      setSaving(false);
    }
  };

  const addCard = (card: Card) => {
    const existingCard = deckCards.find((dc) => dc.card.id === card.id);
    const userCard = userCards.find((uc) => uc.card_id === card.id);

    if (!userCard) return;

    if (existingCard) {
      if (existingCard.quantity >= userCard.quantity) {
        Alert.alert(
          "Erreur",
          "Vous ne possédez pas plus de copies de cette carte"
        );
        return;
      }

      setDeckCards(
        deckCards.map((dc) =>
          dc.card.id === card.id ? { ...dc, quantity: dc.quantity + 1 } : dc
        )
      );
    } else {
      setDeckCards([...deckCards, { card, quantity: 1 }]);
    }
  };

  const removeCard = (cardId: string) => {
    setDeckCards(
      deckCards
        .map((dc) =>
          dc.card.id === cardId ? { ...dc, quantity: dc.quantity - 1 } : dc
        )
        .filter((dc) => dc.quantity > 0)
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  const totalCards = deckCards.reduce((sum, dc) => sum + dc.quantity, 0);
  const averageMana =
    deckCards.reduce((sum, dc) => sum + dc.card.mana_cost * dc.quantity, 0) /
      totalCards || 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TextInput
          style={styles.nameInput}
          placeholder="Nom du deck"
          value={deckName}
          onChangeText={setDeckName}
        />
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? "Sauvegarde..." : "Sauvegarder"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.stats}>
        <Text style={styles.statsText}>
          {totalCards} cartes • Mana moyen: {averageMana.toFixed(1)}
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.deckSection}>
          <Text style={styles.sectionTitle}>Deck</Text>
          <FlatList
            data={deckCards}
            renderItem={({ item }) => (
              <CardItem
                card={item.card}
                quantity={item.quantity}
                compact
                onPress={() => removeCard(item.card.id)}
              />
            )}
            keyExtractor={(item) => item.card.id}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Aucune carte dans le deck</Text>
            }
          />
        </View>

        <View style={styles.collectionSection}>
          <Text style={styles.sectionTitle}>Collection</Text>
          <FlatList
            data={userCards}
            renderItem={({ item }) => (
              <CardItem
                card={item.card}
                quantity={item.quantity}
                compact
                onPress={() => addCard(item.card)}
              />
            )}
            keyExtractor={(item) => item.id}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  nameInput: {
    flex: 1,
    fontSize: 18,
    marginRight: 16,
  },
  saveButton: {
    backgroundColor: "#2ecc71",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    backgroundColor: "#95a5a6",
  },
  saveButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  stats: {
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  statsText: {
    fontSize: 14,
    color: "#666",
  },
  content: {
    flex: 1,
    flexDirection: "row",
  },
  deckSection: {
    flex: 1,
    padding: 8,
    borderRightWidth: 1,
    borderRightColor: "#ddd",
  },
  collectionSection: {
    flex: 1,
    padding: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    marginTop: 16,
  },
});
