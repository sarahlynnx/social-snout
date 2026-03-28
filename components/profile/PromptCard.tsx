import { View, Text } from "react-native";
import type { PetPrompt } from "@/types/database";

interface PromptCardProps {
  prompt: PetPrompt;
}

export function PromptCard({ prompt }: PromptCardProps) {
  return (
    <View className="bg-gray-50 rounded-2xl p-4">
      <Text className="text-xs font-medium text-gray-400 uppercase tracking-wide">
        {prompt.question}
      </Text>
      <Text className="text-base text-gray-900 mt-1.5">{prompt.answer}</Text>
    </View>
  );
}
