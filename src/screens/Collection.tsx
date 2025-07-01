import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../lib/supabase";
import { Card, UserCard } from "../types/database";
import { CardItem } from "../components/CardItem";
import { CollectionNavigationProp } from "../types/navigation";
import { Ionicons } from "@expo/vector-icons";

export const Collection = () => {
  const [userCards, setUserCards] = useState<(UserCard & { card: Card })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [selectedRarity, setSelectedRarity] = useState<string | null>(null);
  const navigation = useNavigation<CollectionNavigationProp>();

  useEffect(() => {
    fetchUserCards();
  }, []);

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

  const filteredCards = userCards.filter((userCard) => {
    const card = userCard.card;
    const matchesSearch =
      card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesElement = !selectedElement || card.element === selectedElement;
    const matchesRarity = !selectedRarity || card.rarity === selectedRarity;
    return matchesSearch && matchesElement && matchesRarity;
  });

  const elements = [
    "fire",
    "water",
    "earth",
    "air",
    "light",
    "dark",
    "neutral",
  ];
  const rarities = ["common", "uncommon", "rare", "epic", "legendary"];

  const elementColors = {
    fire: "#ff4d4d",
    water: "#4d4dff",
    earth: "#8b4513",
    air: "#87ceeb",
    light: "#ffff00",
    dark: "#800080",
    neutral: "#808080",
  };

  const renderFilterChip = (
    label: string,
    isSelected: boolean,
    onPress: () => void,
    color?: string
  ) => (
    <TouchableOpacity
      style={[
        styles.filterChip,
        isSelected && { backgroundColor: color || "#2ecc71" },
      ]}
      onPress={onPress}
    >
      <Text style={[styles.filterChipText, isSelected && { color: "white" }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Chargement de la collection...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#666"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher une carte..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.filtersContainer}>
        <Text style={styles.filtersTitle}>Éléments</Text>
        <FlatList
          horizontal
          data={elements}
          renderItem={({ item }) =>
            renderFilterChip(
              item,
              selectedElement === item,
              () => setSelectedElement(selectedElement === item ? null : item),
              elementColors[item as keyof typeof elementColors]
            )
          }
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          style={styles.filtersList}
        />

        <Text style={styles.filtersTitle}>Raretés</Text>
        <FlatList
          horizontal
          data={rarities}
          renderItem={({ item }) =>
            renderFilterChip(item, selectedRarity === item, () =>
              setSelectedRarity(selectedRarity === item ? null : item)
            )
          }
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          style={styles.filtersList}
        />
      </View>

      <FlatList
        data={filteredCards}
        renderItem={({ item }) => (
          <CardItem
            card={item.card}
            quantity={item.quantity}
            onPress={() =>
              navigation.navigate("CardDetails", { cardId: item.card_id })
            }
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.cardsList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery || selectedElement || selectedRarity
                ? "Aucune carte ne correspond à vos critères"
                : "Votre collection est vide"}
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  filtersContainer: {
    paddingHorizontal: 16,
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  filtersList: {
    marginBottom: 16,
  },
  filterChip: {
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  filterChipText: {
    fontSize: 14,
    textTransform: "capitalize",
  },
  cardsList: {
    padding: 16,
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
  },
});
