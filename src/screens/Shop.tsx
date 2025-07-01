import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import { supabase } from "../lib/supabase";
import { CardPack } from "../types/database";
import { useNavigation } from "@react-navigation/native";
import { ShopNavigationProp } from "../types/navigation";

export const Shop = () => {
  const [packs, setPacks] = useState<CardPack[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<ShopNavigationProp>();

  useEffect(() => {
    fetchPacks();
  }, []);

  const fetchPacks = async () => {
    try {
      const { data, error } = await supabase
        .from("packs")
        .select("*")
        .order("price");

      if (error) throw error;
      setPacks(data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des packs:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderPackCard = ({ item }: { item: CardPack }) => {
    const rarityColor = {
      common: "#808080",
      uncommon: "#00FF00",
      rare: "#0000FF",
      epic: "#800080",
      legendary: "#FFD700",
    }[item.guaranteed_rarity];

    return (
      <TouchableOpacity
        style={[styles.packCard, { borderColor: rarityColor }]}
        onPress={() => navigation.navigate("PackDetails", { pack: item })}
      >
        <View style={styles.packContent}>
          {item.image_url ? (
            <Image source={{ uri: item.image_url }} style={styles.packImage} />
          ) : (
            <View style={[styles.packImage, { backgroundColor: "#ddd" }]} />
          )}
          <View style={styles.packInfo}>
            <Text style={styles.packName}>{item.name}</Text>
            <Text style={styles.packDescription} numberOfLines={2}>
              {item.description}
            </Text>
            <Text style={styles.packPrice}>{item.price} 💰</Text>
          </View>
        </View>
        <Text style={[styles.guaranteedRarity, { color: rarityColor }]}>
          Garantie: {item.guaranteed_rarity}
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Chargement des packs...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Boutique de Packs</Text>
      <FlatList
        data={packs}
        renderItem={renderPackCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  list: {
    padding: 8,
  },
  packCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    boxShadow: "0px 2px 3.84px rgba(0, 0, 0, 0.25)",
  },
  packContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  packImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  packInfo: {
    flex: 1,
  },
  packName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  packDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  packPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2ecc71",
  },
  guaranteedRarity: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "right",
    marginTop: 8,
    textTransform: "capitalize",
  },
});
