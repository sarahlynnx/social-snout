import { useCallback } from "react";
import { View, Text, Pressable, Dimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
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
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const currentPet = pets[currentIndex];
  const nextPet = pets[currentIndex + 1];

  const handleSwipeComplete = useCallback(
    (direction: "RIGHT" | "LEFT") => {
      if (currentPet) {
        onSwipe(currentPet.id, direction);
      }
      // Reset position for next card
      translateX.value = 0;
      translateY.value = 0;
    },
    [currentPet, onSwipe, translateX, translateY]
  );

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      if (event.translationX > SWIPE_THRESHOLD) {
        // Swipe right — animate off screen then callback
        translateX.value = withTiming(SCREEN_WIDTH * 1.5, { duration: 300 }, () => {
          runOnJS(handleSwipeComplete)("RIGHT");
        });
      } else if (event.translationX < -SWIPE_THRESHOLD) {
        // Swipe left
        translateX.value = withTiming(-SCREEN_WIDTH * 1.5, { duration: 300 }, () => {
          runOnJS(handleSwipeComplete)("LEFT");
        });
      } else {
        // Spring back
        translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
        translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
      }
    });

  const cardAnimatedStyle = useAnimatedStyle(() => {
    const rotation = interpolate(
      translateX.value,
      [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
      [-15, 0, 15],
      Extrapolation.CLAMP
    );
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotation}deg` },
      ],
    };
  });

  // Next card scales up as the top card is dragged away
  const nextCardAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      Math.abs(translateX.value),
      [0, SCREEN_WIDTH * 0.5],
      [0.95, 1],
      Extrapolation.CLAMP
    );
    return {
      transform: [{ scale }],
    };
  });

  // Like indicator (right side, green)
  const likeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP
    ),
  }));

  // Nope indicator (left side, red)
  const nopeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, -SWIPE_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP
    ),
  }));

  const handleButtonSwipe = useCallback(
    (direction: "RIGHT" | "LEFT") => {
      const target = direction === "RIGHT" ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5;
      translateX.value = withTiming(target, { duration: 400 }, () => {
        runOnJS(handleSwipeComplete)(direction);
      });
    },
    [handleSwipeComplete, translateX]
  );

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
            style={[{ width: "100%" }, nextCardAnimatedStyle]}
          >
            <PetCard pet={nextPet} />
          </Animated.View>
        )}

        {/* Current card (top, draggable) */}
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[{ width: "100%" }, cardAnimatedStyle]}>
            {/* Like stamp */}
            <Animated.View
              className="absolute top-8 left-6 z-10 border-4 border-green-500 rounded-xl px-3 py-1"
              style={[{ transform: [{ rotate: "-15deg" }] }, likeStyle]}
            >
              <Text className="text-green-500 text-3xl font-extrabold">
                LIKE
              </Text>
            </Animated.View>

            {/* Nope stamp */}
            <Animated.View
              className="absolute top-8 right-6 z-10 border-4 border-red-500 rounded-xl px-3 py-1"
              style={[{ transform: [{ rotate: "15deg" }] }, nopeStyle]}
            >
              <Text className="text-red-500 text-3xl font-extrabold">
                NOPE
              </Text>
            </Animated.View>

            <PetCard pet={currentPet} />
          </Animated.View>
        </GestureDetector>
      </View>

      {/* Action buttons */}
      <View className="flex-row items-center justify-center gap-8 mt-6">
        <Pressable
          onPress={() => handleButtonSwipe("LEFT")}
          className="w-16 h-16 rounded-full border-2 border-red-400 items-center justify-center bg-white active:bg-red-50"
        >
          <Ionicons name="close" size={32} color="#F87171" />
        </Pressable>
        <Pressable
          onPress={() => handleButtonSwipe("RIGHT")}
          className="w-16 h-16 rounded-full border-2 border-green-400 items-center justify-center bg-white active:bg-green-50"
        >
          <Ionicons name="heart" size={32} color="#4ADE80" />
        </Pressable>
      </View>
    </View>
  );
}
