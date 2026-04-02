import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SectionHeaderProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
}

export function SectionHeader({ icon, title }: SectionHeaderProps) {
  return (
    <View className="flex-row items-center gap-1.5 mb-3">
      <Ionicons name={icon} size={14} color="#A8A49C" />
      <Text className="text-xs font-medium text-gray-400 uppercase tracking-wide">
        {title}
      </Text>
    </View>
  );
}
