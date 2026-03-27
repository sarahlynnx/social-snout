import { useCallback, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  Dimensions,
  Animated,
  PanResponder,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PetCard } from "@/components/swipe/PetCard";
import type { SwipeablePet } from "@/types/database";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

interface SwipeDeckProps {
  pets: SwipeablePet[];
  currentIndex: number;
  onSwipe: (petId: string, direction: "RIGHT" | "LEFT") => void;
}

export function SwipeDeck({ pets, currentIndex, onSwipe }: SwipeDeckProps) {
  const position = useRef(new Animated.ValueXY()).current;

  const currentPet = pets[currentIndex];
  const nextPet = pets[currentIndex + 1];

  const handleSwipeComplete = useCallback(
    (direction: "RIGHT" | "LEFT") => {
      if (currentPet) {
        onSwipe(currentPet.id, direction);
      }
      position.setValue({ x: 0, y: 0 });
    },
    [currentPet, onSwipe, position]
  );

  const animateOff = useCallback(
    (direction: "RIGHT" | "LEFT") => {
      const toX = direction === "RIGHT" ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5;
      Animated.timing(position, {
        toValue: { x: toX, y: 0 },
        duration: 300,
        useNativeDriver: true,
      }).start(() => handleSwipeComplete(direction));
    },
    [position, handleSwipeComplete]
  );

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gesture) =>
        Math.abs(gesture.dx) > 5 || Math.abs(gesture.dy) > 5,
      onPanResponderMove: Animated.event(
        [null, { dx: position.x, dy: position.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          animateOff("RIGHT");
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          animateOff("LEFT");
        } else {
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            friction: 6,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  // Card rotation based on drag
  const rotation = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: ["-15deg", "0deg", "15deg"],
    extrapolate: "clamp",
  });

  // Next card scale — grows as top card is dragged
  const nextScale = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH * 0.5, 0, SCREEN_WIDTH * 0.5],
    outputRange: [1, 0.95, 1],
    extrapolate: "clamp",
  });

  // LIKE stamp opacity
  const likeOpacity = position.x.interpolate({
    inputRange: [0, SWIPE_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  // NOPE stamp opacity
  const nopeOpacity = position.x.interpolate({
    inputRange: [-SWIPE_THRESHOLD, 0],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const cardStyle = {
    transform: [
      { translateX: position.x },
      { translateY: position.y },
      { rotate: rotation },
    ],
  };

  if (!currentPet) {
    return null;
  }

  return (
    <View className="flex-1 items-center justify-center">
      {/* Card stack */}
      <View className="relative" style={{ width: SCREEN_WIDTH - 32 }}>
        {/* Next card (behind) */}
        {nextPet && (
          <Animated.View
            className="absolute"
            style={[{ width: "100%", transform: [{ scale: nextScale }] }]}
          >
            <PetCard pet={nextPet} />
          </Animated.View>
        )}

        {/* Current card (top, draggable) */}
        <Animated.View
          style={[{ width: "100%" }, cardStyle]}
          {...panResponder.panHandlers}
        >
          {/* Like stamp */}
          <Animated.View
            className="absolute top-8 left-6 z-10 border-4 border-green-500 rounded-xl px-3 py-1"
            style={{ opacity: likeOpacity, transform: [{ rotate: "-15deg" }] }}
          >
            <Text className="text-green-500 text-3xl font-extrabold">
              LIKE
            </Text>
          </Animated.View>

          {/* Nope stamp */}
          <Animated.View
            className="absolute top-8 right-6 z-10 border-4 border-red-500 rounded-xl px-3 py-1"
            style={{ opacity: nopeOpacity, transform: [{ rotate: "15deg" }] }}
          >
            <Text className="text-red-500 text-3xl font-extrabold">
              NOPE
            </Text>
          </Animated.View>

          <PetCard pet={currentPet} />
        </Animated.View>
      </View>

      {/* Action buttons */}
      <View className="flex-row items-center justify-center gap-8 mt-6">
        <Pressable
          onPress={() => animateOff("LEFT")}
          className="w-16 h-16 rounded-full border-2 border-red-400 items-center justify-center bg-white active:bg-red-50"
        >
          <Ionicons name="close" size={32} color="#F87171" />
        </Pressable>
        <Pressable
          onPress={() => animateOff("RIGHT")}
          className="w-16 h-16 rounded-full border-2 border-green-400 items-center justify-center bg-white active:bg-green-50"
        >
          <Ionicons name="heart" size={32} color="#4ADE80" />
        </Pressable>
      </View>
    </View>
  );
}
