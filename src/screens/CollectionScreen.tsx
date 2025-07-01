import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

// Components
import Card from "../components/Card";

// Services
import { cardService } from "../services/cardService";

// Types
import {
  Card as CardType,
  CardType as CardTypeEnum,
  CardElement,
  CardRarity,
} from "../types/cards";
import { useAuthStore } from "../stores/authStore";

// Filtres disponibles
const CARD_TYPES: CardTypeEnum[] = ["creature", "spell", "equipment"];
const ELEMENTS: CardElement[] = [
  "fire",
  "water",
  "earth",
  "air",
  "light",
  "dark",
  "neutral",
];
const RARITIES: CardRarity[] = [
  "common",
  "uncommon",
  "rare",
  "epic",
  "legendary",
];

export const CollectionScreen = () => {
  const { user } = useAuthStore();
  const [userCards, setUserCards] = useState<
    Array<{ card: CardType; quantity: number }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");

  // Filtres
  const [selectedType, setSelectedType] = useState<CardTypeEnum | null>(null);
  const [selectedElement, setSelectedElement] = useState<CardElement | null>(
    null
  );
  const [selectedRarity, setSelectedRarity] = useState<CardRarity | null>(null);

  // Chargement des cartes
  const loadUserCards = useCallback(async () => {
    if (!user) return;
    try {
      const cards = await cardService.getUserCards(user.id);
      setUserCards(
        cards.map((uc) => ({ card: uc.card!, quantity: uc.quantity }))
      );
    } catch (error) {
      console.error("Error loading user cards:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Rafraîchissement
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadUserCards();
    setRefreshing(false);
  }, [loadUserCards]);

  useEffect(() => {
    loadUserCards();
  }, [loadUserCards]);

  // Filtrage des cartes
  const filteredCards = userCards.filter(({ card }) => {
    const matchesSearch =
      searchText === "" ||
      card.name.toLowerCase().includes(searchText.toLowerCase()) ||
      card.description.toLowerCase().includes(searchText.toLowerCase());

    const matchesType = !selectedType || card.card_type === selectedType;
    const matchesElement = !selectedElement || card.element === selectedElement;
    const matchesRarity = !selectedRarity || card.rarity === selectedRarity;

    return matchesSearch && matchesType && matchesElement && matchesRarity;
  });

  // Rendu des filtres
  const renderFilterSection = (
    title: string,
    options: string[],
    selectedValue: string | null,
    onSelect: (value: any) => void
  ) => (
    <View style={styles.filterSection}>
      <Text style={styles.filterTitle}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <TouchableOpacity
          style={[
            styles.filterChip,
            !selectedValue && styles.filterChipSelected,
          ]}
          onPress={() => onSelect(null)}
        >
          <Text
            style={[
              styles.filterChipText,
              !selectedValue && styles.filterChipTextSelected,
            ]}
          >
            Tous
          </Text>
        </TouchableOpacity>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.filterChip,
              selectedValue === option && styles.filterChipSelected,
            ]}
            onPress={() => onSelect(option)}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedValue === option && styles.filterChipTextSelected,
              ]}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* En-tête avec statistiques */}
      <LinearGradient colors={["#3b82f6", "#1e40af"]} style={styles.header}>
        <Text style={styles.title}>Ma Collection</Text>
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userCards.length}</Text>
            <Text style={styles.statLabel}>Cartes uniques</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {userCards.reduce((sum, { quantity }) => sum + quantity, 0)}
            </Text>
            <Text style={styles.statLabel}>Total des cartes</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#6b7280" />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher une carte..."
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText !== "" && (
          <TouchableOpacity onPress={() => setSearchText("")}>
            <Ionicons name="close-circle" size={20} color="#6b7280" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filtres */}
      <View style={styles.filtersContainer}>
        {renderFilterSection("Type", CARD_TYPES, selectedType, setSelectedType)}
        {renderFilterSection(
          "Élément",
          ELEMENTS,
          selectedElement,
          setSelectedElement
        )}
        {renderFilterSection(
          "Rareté",
          RARITIES,
          selectedRarity,
          setSelectedRarity
        )}
      </View>

      {/* Liste des cartes */}
      <FlatList
        data={filteredCards}
        numColumns={2}
        renderItem={({ item }) => (
          <Card
            card={item.card}
            quantity={item.quantity}
            size="normal"
            onPress={() => {
              // TODO: Afficher les détails de la carte
            }}
          />
        )}
        keyExtractor={(item) => item.card.id}
        contentContainerStyle={styles.cardList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="sad-outline" size={48} color="#6b7280" />
            <Text style={styles.emptyText}>
              Aucune carte ne correspond à vos critères
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
    backgroundColor: "#f3f4f6",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 15,
  },
  stats: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    margin: 10,
    padding: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  filtersContainer: {
    paddingHorizontal: 10,
  },
  filterSection: {
    marginBottom: 10,
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 5,
    marginLeft: 5,
  },
  filterChip: {
    backgroundColor: "white",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  filterChipSelected: {
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6",
  },
  filterChipText: {
    color: "#4b5563",
    fontSize: 14,
  },
  filterChipTextSelected: {
    color: "white",
  },
  cardList: {
    padding: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 10,
  },
});

export default CollectionScreen;
