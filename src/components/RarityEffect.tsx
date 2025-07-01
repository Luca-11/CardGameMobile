import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { CardRarity } from "../types/cards";

interface RarityEffectProps {
  rarity: CardRarity;
  style?: any;
}

export const RarityEffect: React.FC<RarityEffectProps> = ({
  rarity,
  style,
}) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animation de brillance
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Animation de pulsation pour les cartes légendaires
    if (rarity === "legendary") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, []);

  const getEffectColors = () => {
    switch (rarity) {
      case "legendary":
        return ["#ffd700", "#ff8c00", "#ffd700"];
      case "epic":
        return ["#9400d3", "#800080", "#9400d3"];
      case "rare":
        return ["#0000ff", "#000080", "#0000ff"];
      case "uncommon":
        return ["#00ff00", "#008000", "#00ff00"];
      default:
        return ["transparent", "transparent"];
    }
  };

  if (rarity === "common") {
    return null;
  }

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 100],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        style,
        rarity === "legendary" && { transform: [{ scale: pulseAnim }] },
      ]}
    >
      <LinearGradient
        colors={getEffectColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Animated.View
          style={[
            styles.shimmer,
            {
              transform: [{ translateX }],
            },
          ]}
        />
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
    borderRadius: 10,
  },
  gradient: {
    flex: 1,
    opacity: 0.3,
  },
  shimmer: {
    width: 100,
    height: "100%",
    backgroundColor: "white",
    opacity: 0.2,
  },
});

export default RarityEffect;
