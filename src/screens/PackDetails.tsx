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
import { useRoute, useNavigation } from "@react-navigation/native";
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

      let userResponse;
      try {
        console.log("🔵 Récupération de l'utilisateur...");
        userResponse = await supabase.auth.getUser();
        console.log("🔵 Réponse auth:", userResponse);
      } catch (authError) {
        console.error("🔴 Erreur d'authentification:", authError);
        Alert.alert(
          "Erreur",
          "Erreur lors de la vérification de l'authentification"
        );
        setPurchasing(false);
        return;
      }

      const {
        data: { user },
      } = userResponse;
      console.log("🔵 Utilisateur récupéré:", user?.id);

      if (!user) {
        console.log("🔴 Erreur: Utilisateur non connecté");
        Alert.alert(
          "Erreur",
          "Vous devez être connecté pour acheter des packs"
        );
        setPurchasing(false);
        return;
      }

      console.log(
        "🔵 Appel de buyPack avec userId:",
        user.id,
        "packId:",
        pack.id
      );
      const result = await buyPack(user.id, pack.id);
      console.log("🔵 Résultat de buyPack:", result);

      if (!result) {
        console.log("🔴 Erreur: Résultat null de buyPack");
        Alert.alert("Erreur", "Une erreur est survenue lors de l'achat");
        setPurchasing(false);
        return;
      }

      if (!result.success) {
        console.log("🔴 Erreur: Achat échoué avec message:", result.message);
        Alert.alert("Erreur", result.message);
        setPurchasing(false);
        return;
      }

      console.log("🟢 Achat réussi! Nouveau solde:", result.new_balance);
      console.log(
        "🔵 Tentative de navigation vers PackOpening avec purchaseId:",
        result.purchase_id
      );

      try {
        // Navigation simple et directe
        navigation.navigate("PackOpening", {
          purchaseId: result.purchase_id,
        });
        console.log("✅ Navigation vers PackOpening");
      } catch (navError) {
        console.error("🔴 Erreur de navigation:", navError);
        Alert.alert(
          "Erreur de Navigation",
          "Impossible d'accéder à l'écran d'ouverture du pack. Veuillez réessayer."
        );
      }
    } catch (error) {
      console.error("🔴 Erreur lors de l'achat:", error);
      Alert.alert("Erreur", "Une erreur est survenue lors de l'achat");
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
