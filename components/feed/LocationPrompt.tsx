import { View, Text, Linking, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/ui/Button";

interface LocationPromptProps {
  onRequestLocation: () => Promise<boolean>;
}

export function LocationPrompt({ onRequestLocation }: LocationPromptProps) {
  const handleEnable = async () => {
    const saved = await onRequestLocation();
    if (!saved && Platform.OS === "ios") {
      Linking.openSettings();
    }
  };

  return (
    <View className="flex-1 items-center justify-center px-8">
      <View className="w-20 h-20 rounded-full bg-primary-50 items-center justify-center mb-4">
        <Ionicons name="location-outline" size={40} color="#5A8A4F" />
      </View>
      <Text className="text-xl font-bold text-gray-900 text-center">
        Enable Location
      </Text>
      <Text className="text-base text-gray-500 mt-2 text-center leading-6">
        We need your location to show posts from pets in your neighborhood.
      </Text>
      <View className="mt-6 w-full">
        <Button title="Enable Location" onPress={handleEnable} />
      </View>
    </View>
  );
}
