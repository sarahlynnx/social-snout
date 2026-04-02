import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
}

export function ErrorState({
  title = "Something went wrong",
  message = "Please try again later.",
  onRetry,
  icon = "alert-circle-outline",
}: ErrorStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-6 py-20">
      <Ionicons name={icon} size={48} color="#D4D1CA" />
      <Text className="text-lg font-semibold text-gray-900 mt-4 text-center">
        {title}
      </Text>
      <Text className="text-sm text-gray-400 mt-1 text-center">{message}</Text>
      {onRetry && (
        <Pressable
          onPress={onRetry}
          className="mt-5 bg-primary-50 border border-primary-200 rounded-full px-5 py-2.5"
        >
          <Text className="text-sm font-medium text-primary-600">
            Try Again
          </Text>
        </Pressable>
      )}
    </View>
  );
}
