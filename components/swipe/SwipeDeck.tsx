import { useCallback, useLayoutEffect, useRef } from "react";
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
  onOpenProfile?: (petId: string) => void;
}

export function SwipeDeck({
  pets,
  currentIndex,
  onSwipe,
  onOpenProfile,
}: SwipeDeckProps) {
  const position = useRef(new Animated.ValueXY()).current;

  const currentPet = pets[currentIndex];

  // The visible window: the top card + the one peeking behind it. Rendered as a
  // KEYED list (by pet id) so that when the deck advances, the card that was
  // "behind" keeps its exact same instance — and its already-loaded image — as
  // it becomes the "top" card. No frame reuse across pets => no image swap /
  // reload => no "loads twice" / "old-over-new" flash on slower connections.
  const visibleCards = pets.slice(currentIndex, currentIndex + 2);

  const currentPetRef = useRef(currentPet);
  currentPetRef.current = currentPet;
  const onSwipeRef = useRef(onSwipe);
  onSwipeRef.current = onSwipe;

  // Recenter the (new) top card whenever it changes. useLayoutEffect runs after
  // render commits but BEFORE paint, so the incoming card is never painted at
  // the off-screen position left over from the swipe animation.
  useLayoutEffect(() => {
    position.setValue({ x: 0, y: 0 });
  }, [currentPet?.id, position]);

  const handleSwipeComplete = useCallback(
    (direction: "RIGHT" | "LEFT") => {
      // Advance the deck. Position is recentered by the useLayoutEffect above
      // once the new top card commits — resetting it here (synchronously, before
      // the content updates) is what caused the old card to snap back to center.
      if (currentPetRef.current) {
        onSwipeRef.current(currentPetRef.current.id, direction);
      }
    },
    []
  );

  const animateOff = useCallback(
    (direction: "RIGHT" | "LEFT") => {
      const toX =
        direction === "RIGHT" ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5;
      // JS-driven (useNativeDriver:false) to stay consistent with the drag
      // (Animated.event below) and so the useLayoutEffect recenter applies
      // synchronously before paint.
      Animated.timing(position, {
        toValue: { x: toX, y: 0 },
        duration: 300,
        useNativeDriver: false,
      }).start(() => handleSwipeComplete(direction));
    },
    [position, handleSwipeComplete]
  );

  const animateOffRef = useRef(animateOff);
  animateOffRef.current = animateOff;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gesture) =>
        Math.abs(gesture.dx) > 10 || Math.abs(gesture.dy) > 10,
      onPanResponderMove: Animated.event(
        [null, { dx: position.x, dy: position.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          animateOffRef.current("RIGHT");
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          animateOffRef.current("LEFT");
        } else {
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            friction: 6,
            useNativeDriver: false,
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
      {/* Card stack — keyed by pet id so instances persist across advances */}
      <View className="relative" style={{ width: SCREEN_WIDTH - 32 }}>
        {visibleCards.map((pet, i) => {
          const isTop = i === 0;

          if (!isTop) {
            // Behind card: absolute, scales up as the top card is dragged.
            return (
              <Animated.View
                key={pet.id}
                style={{
                  position: "absolute",
                  width: "100%",
                  zIndex: 1,
                  transform: [{ scale: nextScale }],
                }}
              >
                {/* Stable key so this PetCard is preserved when this same view
                    later becomes the top card (and gains the stamps). */}
                <PetCard key="card" pet={pet} />
              </Animated.View>
            );
          }

          // Top card: draggable, shows LIKE/NOPE stamps.
          return (
            <Animated.View
              key={pet.id}
              style={[{ width: "100%", zIndex: 2 }, cardStyle]}
              {...panResponder.panHandlers}
            >
              {/* Like stamp */}
              <Animated.View
                key="like-stamp"
                className="absolute top-8 left-6 z-10 border-4 border-green-500 rounded-xl px-3 py-1"
                style={{ opacity: likeOpacity, transform: [{ rotate: "-15deg" }] }}
              >
                <Text className="text-green-500 text-3xl font-extrabold">
                  LIKE
                </Text>
              </Animated.View>

              {/* Nope stamp */}
              <Animated.View
                key="nope-stamp"
                className="absolute top-8 right-6 z-10 border-4 border-red-500 rounded-xl px-3 py-1"
                style={{ opacity: nopeOpacity, transform: [{ rotate: "15deg" }] }}
              >
                <Text className="text-red-500 text-3xl font-extrabold">
                  NOPE
                </Text>
              </Animated.View>

              <PetCard
                key="card"
                pet={pet}
                onOpenProfile={() => onOpenProfile?.(pet.id)}
              />
            </Animated.View>
          );
        })}
      </View>

      {/* Action buttons */}
      <View className="flex-row items-center justify-center gap-8 mt-6">
        <Pressable
          testID="swipe-pass"
          onPress={() => animateOff("LEFT")}
          className="w-16 h-16 rounded-full border-2 border-red-400 items-center justify-center bg-white active:bg-red-50"
        >
          <Ionicons name="close" size={32} color="#F87171" />
        </Pressable>
        <Pressable
          testID="swipe-like"
          onPress={() => animateOff("RIGHT")}
          className="w-16 h-16 rounded-full border-2 border-green-400 items-center justify-center bg-white active:bg-green-50"
        >
          <Ionicons name="heart" size={32} color="#4ADE80" />
        </Pressable>
      </View>
    </View>
  );
}
