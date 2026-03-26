import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function FeedScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Ionicons name="newspaper" size={64} color="#F97316" />
      <Text className="text-2xl font-bold text-gray-900 mt-4">
        Neighborhood Feed
      </Text>
      <Text className="text-base text-gray-500 mt-2 text-center">
        See what's happening in your pet neighborhood. Coming in Phase 3!
      </Text>
    </View>
  );
}
