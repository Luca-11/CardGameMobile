import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  useRoute,
  useNavigation,
  CommonActions,
} from "@react-navigation/native";
import {
  PackDetailsRouteProp,
  PackDetailsNavigationProp,
} from "../types/navigation";
import { supabase } from "../lib/supabase";
import { useGameStore } from "../stores/gameStore";

export const PackDetails = () => {
  const route = useRoute<PackDetailsRouteProp>();
  const navigation = useNavigation<PackDetailsNavigationProp>();
  const { pack } = route.params;
  const [purchasing, setPurchasing] = useState(false);
  const { userBalance, buyPack, loadUserBalance } = useGameStore();

  useEffect(() => {
    const loadBalance = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        loadUserBalance(user.id);
      }
    };
    loadBalance();
  }, []);

  const handlePurchase = async () => {
    try {
      console.log("🔵 Début de l'achat");
      setPurchasing(true);

      console.log("🔵 Récupération de l'utilisateur...");
      const { data: authData, error: authError } =
        await supabase.auth.getUser();
      console.log("🔵 Réponse auth:", { data: authData, error: authError });

      if (authError) {
        throw new Error("Erreur d'authentification");
      }

      if (!authData.user) {
        throw new Error("Utilisateur non connecté");
      }

      console.log("🔵 Utilisateur récupéré:", authData.user.id);

      if (typeof userBalance !== "number" || userBalance < pack.price) {
        Alert.alert(
          "Solde insuffisant",
          "Vous n'avez pas assez d'argent pour acheter ce pack."
        );
        return;
      }

      console.log(
        "🔵 Appel de buyPack avec userId:",
        authData.user.id,
        "packId:",
        pack.id
      );
      const result = await buyPack(pack.id);

      if (result.success) {
        navigation.navigate("PackOpening", {
          purchaseId: result.purchase_id,
        });
      }
    } catch (error) {
      console.error("🔴 Erreur lors de l'achat:", error);
      Alert.alert(
        "Erreur",
        error instanceof Error ? error.message : "Une erreur est survenue"
      );
    } finally {
      console.log("🔵 Fin de l'achat - Réinitialisation du state purchasing");
      setPurchasing(false);
    }
  };

  const canAfford = userBalance !== null && userBalance >= pack.price;

  return (
    <View style={styles.container}>
      {pack.image_url ? (
        <Image source={{ uri: pack.image_url }} style={styles.packImage} />
      ) : (
        <View style={[styles.packImage, { backgroundColor: "#ddd" }]} />
      )}

      <Text style={styles.packName}>{pack.name}</Text>
      <Text style={styles.packDescription}>{pack.description}</Text>

      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Votre solde:</Text>
          <Text style={styles.value}>
            {userBalance !== null ? `${userBalance} 💰` : "Chargement..."}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Prix:</Text>
          <Text style={[styles.value, !canAfford && styles.insufficientFunds]}>
            {pack.price} 💰
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Cartes par pack:</Text>
          <Text style={styles.value}>{pack.cards_per_pack}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Rareté garantie:</Text>
          <Text style={[styles.value, styles.rarity]}>
            {pack.guaranteed_rarity}
          </Text>
        </View>
      </View>

      <View style={styles.probabilityContainer}>
        <Text style={styles.probabilityTitle}>Probabilités par rareté:</Text>
        {Object.entries(pack.rarity_weights).map(([rarity, weight]) => (
          <View key={rarity} style={styles.probabilityRow}>
            <Text style={styles.rarityLabel}>{rarity}</Text>
            <Text style={styles.probabilityValue}>
              {(weight * 100).toFixed(1)}%
            </Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={[
          styles.purchaseButton,
          (!canAfford || purchasing) && styles.purchaseButtonDisabled,
        ]}
        onPress={handlePurchase}
        disabled={!canAfford || purchasing}
      >
        {purchasing ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.purchaseButtonText}>
            {canAfford ? "Acheter le pack" : "Solde insuffisant"}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  packImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  packName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  packDescription: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
  },
  infoContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    color: "#666",
  },
  value: {
    fontSize: 16,
    fontWeight: "bold",
  },
  insufficientFunds: {
    color: "#e74c3c",
  },
  rarity: {
    textTransform: "capitalize",
  },
  probabilityContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  probabilityTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  probabilityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  rarityLabel: {
    fontSize: 16,
    textTransform: "capitalize",
  },
  probabilityValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  purchaseButton: {
    backgroundColor: "#2ecc71",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  purchaseButtonDisabled: {
    backgroundColor: "#95a5a6",
  },
  purchaseButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
