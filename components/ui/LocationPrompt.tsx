import { View, Text, Linking, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/ui/Button";

interface LocationPromptProps {
  onRequestLocation: () => Promise<boolean>;
  description: string;
}

export function LocationPrompt({
  onRequestLocation,
  description,
}: LocationPromptProps) {
  const handleEnable = async () => {
    const granted = await onRequestLocation();
    if (!granted) {
      Alert.alert(
        "Location Needed",
        "Enable location access for SocialSnout in your device Settings to see pets in your neighborhood.",
        [
          { text: "Not Now", style: "cancel" },
          { text: "Open Settings", onPress: () => Linking.openSettings() },
        ]
      );
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
        {description}
      </Text>
      <View className="mt-6 w-full">
        <Button title="Enable Location" onPress={handleEnable} />
      </View>
    </View>
  );
}
