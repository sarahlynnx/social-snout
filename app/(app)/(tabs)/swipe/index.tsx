import { View, Text, ActivityIndicator, Pressable, Linking, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SwipeDeck } from "@/components/swipe/SwipeDeck";
import { MatchOverlay } from "@/components/swipe/MatchOverlay";
import { PetSwitcher } from "@/components/PetSwitcher";
import { ErrorState } from "@/components/ui/ErrorState";
import { useSwipe } from "@/hooks/useSwipe";
import { useUserLocation } from "@/hooks/useUserLocation";

export default function SwipeScreen() {
  const router = useRouter();
  const { hasLocation, loading: locationLoading, requestLocation } = useUserLocation();
  const {
    myPet,
    pets,
    currentIndex,
    loading,
    error,
    matchedPet,
    matchId,
    hasMore,
    recordSwipe,
    dismissMatch,
    resetDeck,
  } = useSwipe();

  if (loading || locationLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#5A8A4F" />
      </View>
    );
  }

  if (!hasLocation) {
    const handleEnableLocation = async () => {
      const granted = await requestLocation();
      if (!granted) {
        Alert.alert(
          "Location Required",
          "Please enable location access for SocialSnout in your device Settings to discover pets near you.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Open Settings", onPress: () => Linking.openSettings() },
          ]
        );
      }
    };

    return (
      <View className="flex-1 items-center justify-center bg-gray-50 px-6">
        <Ionicons name="location-outline" size={64} color="#D4D1CA" />
        <Text className="text-xl font-bold text-gray-900 mt-4">
          Location Required
        </Text>
        <Text className="text-base text-gray-500 mt-2 text-center">
          Discover needs your location to find pets nearby. Enable location access to start swiping!
        </Text>
        <Pressable
          onPress={handleEnableLocation}
          className="bg-primary-500 rounded-full px-6 py-3 mt-6"
        >
          <Text className="text-white font-semibold text-base">
            Enable Location
          </Text>
        </Pressable>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-gray-50">
        <ErrorState
          title="Couldn't load pets"
          message={error}
          onRetry={resetDeck}
        />
      </View>
    );
  }

  if (!myPet) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Ionicons name="paw" size={64} color="#5A8A4F" />
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
    <View className="flex-1 bg-gray-50">
      {/* Pet switcher header */}
      <View className="px-4 pt-2 pb-2">
        <PetSwitcher />
      </View>

      <View className="flex-1 pb-4">
        {hasMore ? (
          <SwipeDeck
            pets={pets}
            currentIndex={currentIndex}
            onSwipe={recordSwipe}
            onOpenProfile={(petId) =>
              router.push(`/(app)/pet-profile/${petId}`)
            }
          />
        ) : (
          <View className="flex-1 items-center justify-center px-6">
            <Ionicons name="search" size={64} color="#D4D1CA" />
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
            router.push("/(app)/(tabs)/matches");
          }}
          onKeepSwiping={dismissMatch}
        />
      )}
    </View>
  );
}
