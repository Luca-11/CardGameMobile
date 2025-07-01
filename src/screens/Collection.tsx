import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { collectionService } from "../services/collection";
import {
  UserCard,
  CollectionStats,
  CollectionFilters,
} from "../types/collection";
import { useAuthStore } from "../stores/authStore";
import { CollectionCard } from "../components/CollectionCard";

export const Collection = () => {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState<UserCard[]>([]);
  const [stats, setStats] = useState<CollectionStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<CollectionFilters>({});
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    if (user) {
      loadCollection();
    }
  }, [user, filters]);

  const loadCollection = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const currentFilters = { ...filters };
      if (searchText) {
        currentFilters.search = searchText;
      }

      const response = await collectionService.getUserCollection(
        user.id,
        currentFilters
      );
      setCards(response.cards);
      setStats(response.stats);
    } catch (err) {
      console.error("❌ Erreur lors du chargement de la collection:", err);
      setError("Erreur lors du chargement de la collection");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text: string) => {
    setSearchText(text);
    setFilters((prev) => ({ ...prev, search: text }));
  };

  const handleFilterChange = (
    key: keyof CollectionFilters,
    value: string | undefined
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSort = (sortBy: CollectionFilters["sort_by"]) => {
    setFilters((prev) => ({
      ...prev,
      sort_by: sortBy,
      sort_order:
        prev.sort_by === sortBy && prev.sort_order === "asc" ? "desc" : "asc",
    }));
  };

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: { color: "#95a5a6" },
      uncommon: { color: "#27ae60" },
      rare: { color: "#3498db" },
      epic: { color: "#9b59b6" },
      legendary: { color: "#f39c12" },
    };
    return colors[rarity as keyof typeof colors] || { color: "#95a5a6" };
  };

  const renderCard = ({ item }: { item: UserCard }) => (
    <View style={styles.cardContainer}>
      <CollectionCard card={item} />
    </View>
  );

  const renderStats = () => {
    if (!stats) return null;

    return (
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>📊 Statistiques de la collection</Text>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.total_cards}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.unique_cards}</Text>
            <Text style={styles.statLabel}>Uniques</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {stats.completion_percentage}%
            </Text>
            <Text style={styles.statLabel}>Complétion</Text>
          </View>
        </View>

        <Text style={styles.statsSubtitle}>Par rareté:</Text>
        <View style={styles.rarityStats}>
          {Object.entries(stats.by_rarity).map(([rarity, count]) => (
            <View key={rarity} style={styles.rarityItem}>
              <Text style={[styles.rarityText, getRarityColor(rarity)]}>
                {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
              </Text>
              <Text style={styles.rarityCount}>{count}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <TextInput
        style={styles.searchInput}
        placeholder="🔍 Rechercher une carte..."
        value={searchText}
        onChangeText={handleSearch}
        placeholderTextColor="#666"
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterRow}
      >
        <TouchableOpacity
          style={[
            styles.filterButton,
            filters.rarity === "common" && styles.filterButtonActive,
          ]}
          onPress={() =>
            handleFilterChange(
              "rarity",
              filters.rarity === "common" ? undefined : "common"
            )
          }
        >
          <Text style={styles.filterButtonText}>Common</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filters.rarity === "uncommon" && styles.filterButtonActive,
          ]}
          onPress={() =>
            handleFilterChange(
              "rarity",
              filters.rarity === "uncommon" ? undefined : "uncommon"
            )
          }
        >
          <Text style={styles.filterButtonText}>Uncommon</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filters.rarity === "rare" && styles.filterButtonActive,
          ]}
          onPress={() =>
            handleFilterChange(
              "rarity",
              filters.rarity === "rare" ? undefined : "rare"
            )
          }
        >
          <Text style={styles.filterButtonText}>Rare</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filters.rarity === "epic" && styles.filterButtonActive,
          ]}
          onPress={() =>
            handleFilterChange(
              "rarity",
              filters.rarity === "epic" ? undefined : "epic"
            )
          }
        >
          <Text style={styles.filterButtonText}>Epic</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filters.rarity === "legendary" && styles.filterButtonActive,
          ]}
          onPress={() =>
            handleFilterChange(
              "rarity",
              filters.rarity === "legendary" ? undefined : "legendary"
            )
          }
        >
          <Text style={styles.filterButtonText}>Legendary</Text>
        </TouchableOpacity>
      </ScrollView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterRow}
      >
        <TouchableOpacity
          style={[
            styles.filterButton,
            filters.element === "fire" && styles.filterButtonActive,
          ]}
          onPress={() =>
            handleFilterChange(
              "element",
              filters.element === "fire" ? undefined : "fire"
            )
          }
        >
          <Text style={styles.filterButtonText}>🔥 Feu</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filters.element === "water" && styles.filterButtonActive,
          ]}
          onPress={() =>
            handleFilterChange(
              "element",
              filters.element === "water" ? undefined : "water"
            )
          }
        >
          <Text style={styles.filterButtonText}>💧 Eau</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filters.element === "earth" && styles.filterButtonActive,
          ]}
          onPress={() =>
            handleFilterChange(
              "element",
              filters.element === "earth" ? undefined : "earth"
            )
          }
        >
          <Text style={styles.filterButtonText}>🌍 Terre</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filters.element === "air" && styles.filterButtonActive,
          ]}
          onPress={() =>
            handleFilterChange(
              "element",
              filters.element === "air" ? undefined : "air"
            )
          }
        >
          <Text style={styles.filterButtonText}>💨 Air</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filters.element === "neutral" && styles.filterButtonActive,
          ]}
          onPress={() =>
            handleFilterChange(
              "element",
              filters.element === "neutral" ? undefined : "neutral"
            )
          }
        >
          <Text style={styles.filterButtonText}>⚪ Neutre</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2ecc71" />
        <Text style={styles.loadingText}>Chargement de la collection...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Erreur lors du chargement</Text>
        <Text style={styles.errorDetails}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadCollection}>
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📚 Ma Collection</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={loadCollection}>
          <Text style={styles.refreshButtonText}>🔄</Text>
        </TouchableOpacity>
      </View>

      {renderStats()}
      {renderFilters()}

      <FlatList
        data={cards}
        renderItem={renderCard}
        keyExtractor={(item) => item.card_id}
        numColumns={2}
        contentContainerStyle={styles.cardsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucune carte trouvée</Text>
            <Text style={styles.emptySubtext}>
              Ouvrez des packs pour commencer votre collection !
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
    backgroundColor: "#1a1a1a",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#2a2a2a",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  refreshButton: {
    padding: 8,
  },
  refreshButtonText: {
    fontSize: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
  },
  loadingText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    padding: 20,
  },
  errorText: {
    color: "#e74c3c",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 8,
  },
  errorDetails: {
    color: "#e74c3c",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#2ecc71",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  statsContainer: {
    backgroundColor: "#2a2a2a",
    padding: 16,
    marginBottom: 8,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2ecc71",
  },
  statLabel: {
    fontSize: 12,
    color: "#ccc",
    marginTop: 4,
  },
  statsSubtitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  rarityStats: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  rarityItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    marginBottom: 4,
  },
  rarityText: {
    fontSize: 12,
    fontWeight: "bold",
    marginRight: 4,
  },
  rarityCount: {
    fontSize: 12,
    color: "#ccc",
  },

  filtersContainer: {
    backgroundColor: "#2a2a2a",
    padding: 16,
    marginBottom: 8,
  },
  searchInput: {
    backgroundColor: "#3a3a3a",
    color: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 16,
  },
  filterRow: {
    marginBottom: 8,
  },
  filterButton: {
    backgroundColor: "#3a3a3a",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: "#2ecc71",
  },
  filterButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  cardsList: {
    padding: 8,
  },
  cardContainer: {
    flex: 1,
    margin: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#ccc",
    textAlign: "center",
  },
});
