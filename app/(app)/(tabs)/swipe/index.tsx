import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function SwipeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Ionicons name="paw" size={64} color="#F97316" />
      <Text className="text-2xl font-bold text-gray-900 mt-4">Discover</Text>
      <Text className="text-base text-gray-500 mt-2 text-center">
        Swipe through nearby pets to find playdate matches. Coming in Phase 2!
      </Text>
    </View>
  );
}
