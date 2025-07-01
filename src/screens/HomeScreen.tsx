import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

// Stores
import { useAuthStore } from "../stores/authStore";
import { useGameStore } from "../stores/gameStore";

// Types
import { CardRarity } from "../types";

const HomeScreen = () => {
  const { user } = useAuthStore();
  const {
    userCards,
    userPacks,
    claimDailyReward,
    loadUserCards,
    loadUserPacks,
    loading,
  } = useGameStore();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;

    await Promise.all([loadUserCards(user.id), loadUserPacks(user.id)]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
  };

  const handleClaimDailyReward = async () => {
    if (!user) return;

    const success = await claimDailyReward(user.id);
    if (success) {
      Alert.alert(
        "🎉 Récompense réclamée !",
        "Vous avez reçu votre récompense journalière !",
        [{ text: "Super !", style: "default" }]
      );
    } else {
      Alert.alert(
        "Déjà réclamée",
        "Vous avez déjà réclamé votre récompense aujourd'hui. Revenez demain !",
        [{ text: "OK", style: "default" }]
      );
    }
  };

  const canClaimDailyReward = () => {
    if (!user?.daily_reward_claimed_at) return true;

    const lastClaim = new Date(user.daily_reward_claimed_at);
    const now = new Date();
    const diffInHours = (now.getTime() - lastClaim.getTime()) / (1000 * 3600);

    return diffInHours >= 24;
  };

  const getCardsByRarity = () => {
    const counts = {
      [CardRarity.COMMON]: 0,
      [CardRarity.UNCOMMON]: 0,
      [CardRarity.RARE]: 0,
      [CardRarity.EPIC]: 0,
      [CardRarity.LEGENDARY]: 0,
    };

    userCards.forEach((userCard) => {
      if (userCard.card) {
        counts[userCard.card.rarity as CardRarity]++;
      }
    });

    return counts;
  };

  const rarityColors = {
    [CardRarity.COMMON]: "#9ca3af",
    [CardRarity.UNCOMMON]: "#22c55e",
    [CardRarity.RARE]: "#3b82f6",
    [CardRarity.EPIC]: "#a855f7",
    [CardRarity.LEGENDARY]: "#f59e0b",
  };

  const rarityNames = {
    [CardRarity.COMMON]: "Communes",
    [CardRarity.UNCOMMON]: "Peu communes",
    [CardRarity.RARE]: "Rares",
    [CardRarity.EPIC]: "Épiques",
    [CardRarity.LEGENDARY]: "Légendaires",
  };

  const cardCounts = getCardsByRarity();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#f3f4f6" }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header avec salutation */}
      <LinearGradient
        colors={["#3b82f6", "#1e40af"]}
        style={{
          padding: 20,
          paddingTop: 60,
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View>
            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                color: "white",
                marginBottom: 5,
              }}
            >
              Salut, {user?.username} ! 👋
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: "rgba(255, 255, 255, 0.8)",
              }}
            >
              Prêt pour de nouveaux défis ?
            </Text>
          </View>
          <View
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              borderRadius: 50,
              padding: 15,
            }}
          >
            <Ionicons name="game-controller" size={30} color="white" />
          </View>
        </View>
      </LinearGradient>

      <View style={{ padding: 20 }}>
        {/* Récompense journalière */}
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 15,
            padding: 20,
            marginBottom: 20,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color: "#1f2937",
                  marginBottom: 5,
                }}
              >
                🎁 Récompense journalière
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: "#6b7280",
                  marginBottom: 15,
                }}
              >
                {canClaimDailyReward()
                  ? "Votre récompense vous attend !"
                  : "Revenez demain pour une nouvelle récompense !"}
              </Text>
              <TouchableOpacity
                style={{
                  backgroundColor: canClaimDailyReward()
                    ? "#10b981"
                    : "#9ca3af",
                  borderRadius: 10,
                  paddingVertical: 12,
                  paddingHorizontal: 20,
                  alignItems: "center",
                }}
                onPress={handleClaimDailyReward}
                disabled={!canClaimDailyReward() || loading}
              >
                <Text
                  style={{
                    color: "white",
                    fontWeight: "bold",
                    fontSize: 16,
                  }}
                >
                  {canClaimDailyReward() ? "Réclamer" : "Déjà réclamée"}
                </Text>
              </TouchableOpacity>
            </View>
            <View
              style={{
                backgroundColor: "#fef3c7",
                borderRadius: 50,
                padding: 15,
                marginLeft: 15,
              }}
            >
              <Ionicons name="gift" size={30} color="#f59e0b" />
            </View>
          </View>
        </View>

        {/* Statistiques de collection */}
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 15,
            padding: 20,
            marginBottom: 20,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "bold",
              color: "#1f2937",
              marginBottom: 15,
            }}
          >
            📊 Ma Collection
          </Text>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 20,
            }}
          >
            <View style={{ alignItems: "center" }}>
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "bold",
                  color: "#3b82f6",
                }}
              >
                {userCards.length}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: "#6b7280",
                  marginTop: 2,
                }}
              >
                Cartes totales
              </Text>
            </View>
            <View style={{ alignItems: "center" }}>
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "bold",
                  color: "#10b981",
                }}
              >
                {userPacks.length}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: "#6b7280",
                  marginTop: 2,
                }}
              >
                Packs à ouvrir
              </Text>
            </View>
          </View>

          {/* Répartition par rareté */}
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: "#374151",
              marginBottom: 10,
            }}
          >
            Répartition par rareté
          </Text>

          {Object.entries(cardCounts).map(([rarity, count]) => (
            <View
              key={rarity}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingVertical: 8,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: rarityColors[rarity as CardRarity],
                    marginRight: 10,
                  }}
                />
                <Text
                  style={{
                    fontSize: 14,
                    color: "#6b7280",
                  }}
                >
                  {rarityNames[rarity as CardRarity]}
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: "#1f2937",
                }}
              >
                {count}
              </Text>
            </View>
          ))}
        </View>

        {/* Actions rapides */}
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 15,
            padding: 20,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "bold",
              color: "#1f2937",
              marginBottom: 15,
            }}
          >
            ⚡ Actions rapides
          </Text>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: "#f3f4f6",
                borderRadius: 10,
                padding: 15,
                alignItems: "center",
                marginRight: 10,
              }}
            >
              <Ionicons name="library" size={24} color="#3b82f6" />
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: "#374151",
                  marginTop: 5,
                  textAlign: "center",
                }}
              >
                Voir ma{"\n"}collection
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: "#f3f4f6",
                borderRadius: 10,
                padding: 15,
                alignItems: "center",
                marginHorizontal: 5,
              }}
            >
              <Ionicons name="storefront" size={24} color="#10b981" />
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: "#374151",
                  marginTop: 5,
                  textAlign: "center",
                }}
              >
                Acheter des{"\n"}packs
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: "#f3f4f6",
                borderRadius: 10,
                padding: 15,
                alignItems: "center",
                marginLeft: 10,
              }}
            >
              <Ionicons name="build" size={24} color="#f59e0b" />
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: "#374151",
                  marginTop: 5,
                  textAlign: "center",
                }}
              >
                Créer un{"\n"}deck
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default HomeScreen;
