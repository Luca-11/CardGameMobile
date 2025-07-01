import React, { useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  Pressable,
  Image,
} from "react-native";
import { Card } from "../types/database";

interface PackOpeningProps {
  cards: Card[];
  onComplete: () => void;
}

const PackOpeningAnimation: React.FC<PackOpeningProps> = ({
  cards,
  onComplete,
}) => {
  const { width: screenWidth } = Dimensions.get("window");
  const cardAnimations = useRef(cards.map(() => new Animated.Value(0))).current;
  const packAnimation = useRef(new Animated.Value(1)).current;
  const particleAnimations = useRef(
    Array(20)
      .fill(0)
      .map(() => ({
        scale: new Animated.Value(0),
        translateX: new Animated.Value(0),
        translateY: new Animated.Value(0),
      }))
  ).current;

  useEffect(() => {
    // Démarrer l'animation automatiquement après un court délai
    setTimeout(() => {
      handlePress();
    }, 500);
  }, []);

  const animateParticles = () => {
    const animations = particleAnimations.map((particle) => {
      const randomX = (Math.random() - 0.5) * 300;
      const randomY = (Math.random() - 0.5) * 300;

      return Animated.parallel([
        Animated.sequence([
          Animated.spring(particle.scale, {
            toValue: 1,
            useNativeDriver: true,
            tension: 10,
            friction: 3,
          }),
          Animated.timing(particle.scale, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(particle.translateX, {
          toValue: randomX,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(particle.translateY, {
          toValue: randomY,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]);
    });

    return Animated.stagger(50, animations);
  };

  const animateCards = () => {
    const animations = cardAnimations.map((anim, index) => {
      const delay = index * 300;
      return Animated.sequence([
        Animated.delay(delay),
        Animated.spring(anim, {
          toValue: 1,
          tension: 40,
          friction: 7,
          useNativeDriver: true,
        }),
      ]);
    });

    return Animated.stagger(100, animations);
  };

  const handlePress = () => {
    // Animation du pack qui disparaît
    Animated.timing(packAnimation, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      // Animation des particules
      animateParticles().start();
      // Animation des cartes
      animateCards().start(() => {
        setTimeout(onComplete, 1000);
      });
    });
  };

  return (
    <Pressable
      style={styles.container}
      onPress={handlePress}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel="Terminer l'ouverture du pack"
    >
      <View style={styles.container}>
        {particleAnimations.map((_, index) => (
          <Animated.View
            key={`particle-${index}`}
            style={[
              styles.particle,
              {
                transform: [
                  { scale: particleAnimations[index].scale },
                  { translateX: particleAnimations[index].translateX },
                  { translateY: particleAnimations[index].translateY },
                ],
              },
            ]}
          />
        ))}

        <Animated.View
          style={[
            styles.pack,
            {
              transform: [
                { scale: packAnimation },
                {
                  translateY: packAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-200, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.packImage} />
        </Animated.View>

        {cards.map((card, index) => {
          const rotateZ = cardAnimations[index].interpolate({
            inputRange: [0, 1],
            outputRange: ["0deg", `${(index - cards.length / 2) * 10}deg`],
          });

          const translateX = cardAnimations[index].interpolate({
            inputRange: [0, 1],
            outputRange: [0, (index - cards.length / 2) * 30],
          });

          return (
            <Animated.View
              key={`${card.id}-${index}`}
              style={[
                styles.cardContainer,
                {
                  opacity: cardAnimations[index],
                  transform: [
                    { scale: cardAnimations[index] },
                    { translateX },
                    { rotateZ },
                  ],
                },
              ]}
            >
              <View style={styles.card}>
                {card.image_url ? (
                  <Image
                    source={{ uri: card.image_url }}
                    style={styles.cardImage}
                  />
                ) : (
                  <View
                    style={[styles.cardImage, { backgroundColor: "#ddd" }]}
                  />
                )}
              </View>
            </Animated.View>
          );
        })}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.9)",
  },
  pack: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  packImage: {
    width: 200,
    height: 300,
    backgroundColor: "#3b82f6",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  cardContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    width: 150,
    height: 225,
    borderRadius: 10,
    backgroundColor: "white",
    overflow: "hidden",
  },
  cardImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  particle: {
    position: "absolute",
    width: 10,
    height: 10,
    backgroundColor: "#ffd700",
    borderRadius: 5,
  },
});

export default PackOpeningAnimation;
