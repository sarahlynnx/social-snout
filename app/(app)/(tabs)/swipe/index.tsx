import { View, Text, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SwipeDeck } from "@/components/swipe/SwipeDeck";
import { MatchOverlay } from "@/components/swipe/MatchOverlay";
import { useSwipe } from "@/hooks/useSwipe";

export default function SwipeScreen() {
  const router = useRouter();
  const {
    myPet,
    pets,
    currentIndex,
    loading,
    matchedPet,
    matchId,
    hasMore,
    recordSwipe,
    dismissMatch,
  } = useSwipe();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  if (!myPet) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Ionicons name="paw" size={64} color="#F97316" />
        <Text className="text-xl font-bold text-gray-900 mt-4">
          No Pet Profile
        </Text>
        <Text className="text-base text-gray-500 mt-2 text-center">
          Create a pet profile to start discovering playmates!
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <View className="flex-1 pb-4">
        {hasMore ? (
          <SwipeDeck
            pets={pets}
            currentIndex={currentIndex}
            onSwipe={recordSwipe}
          />
        ) : (
          /* Empty state */
          <View className="flex-1 items-center justify-center px-6">
            <Ionicons name="search" size={64} color="#D1D5DB" />
            <Text className="text-xl font-bold text-gray-900 mt-4">
              No More Pets Nearby
            </Text>
            <Text className="text-base text-gray-500 mt-2 text-center">
              Check back later for new furry friends in your area!
            </Text>
          </View>
        )}
      </View>

      {/* Match overlay */}
      {matchedPet && myPet && (
        <MatchOverlay
          myPet={myPet}
          matchedPet={matchedPet}
          onSendMessage={() => {
            dismissMatch();
            // Navigate to matches tab (chat coming in Phase 4)
            router.push("/(app)/(tabs)/matches");
          }}
          onKeepSwiping={dismissMatch}
        />
      )}
    </View>
  );
}
