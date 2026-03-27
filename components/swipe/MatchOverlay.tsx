import { View, Text, Image } from "react-native";
import { Button } from "@/components/ui/Button";
import type { SwipeablePet, Pet } from "@/types/database";

interface MatchOverlayProps {
  myPet: Pet;
  matchedPet: SwipeablePet;
  onSendMessage: () => void;
  onKeepSwiping: () => void;
}

export function MatchOverlay({
  myPet,
  matchedPet,
  onSendMessage,
  onKeepSwiping,
}: MatchOverlayProps) {
  const myPhoto = myPet.photos[0];
  const theirPhoto = matchedPet.photos[0];

  return (
    <View className="absolute inset-0 z-50 bg-black/70 items-center justify-center px-8">
      <View className="bg-white rounded-3xl p-8 items-center w-full max-w-sm">
        {/* Heading */}
        <Text className="text-4xl font-extrabold text-primary-500 mb-2">
          It's a Match!
        </Text>
        <Text className="text-base text-gray-500 text-center mb-6">
          {myPet.name} and {matchedPet.name} want to be friends!
        </Text>

        {/* Pet photos side by side */}
        <View className="flex-row items-center justify-center gap-4 mb-8">
          <View className="items-center">
            {myPhoto ? (
              <Image
                source={{ uri: myPhoto }}
                className="w-28 h-28 rounded-full border-4 border-primary-500"
              />
            ) : (
              <View className="w-28 h-28 rounded-full bg-gray-200 border-4 border-primary-500 items-center justify-center">
                <Text className="text-3xl">
                  {myPet.type === "DOG" ? "🐕" : "🐈"}
                </Text>
              </View>
            )}
            <Text className="text-sm font-semibold text-gray-700 mt-2">
              {myPet.name}
            </Text>
          </View>

          <Text className="text-3xl">🤝</Text>

          <View className="items-center">
            {theirPhoto ? (
              <Image
                source={{ uri: theirPhoto }}
                className="w-28 h-28 rounded-full border-4 border-primary-500"
              />
            ) : (
              <View className="w-28 h-28 rounded-full bg-gray-200 border-4 border-primary-500 items-center justify-center">
                <Text className="text-3xl">
                  {matchedPet.type === "DOG" ? "🐕" : "🐈"}
                </Text>
              </View>
            )}
            <Text className="text-sm font-semibold text-gray-700 mt-2">
              {matchedPet.name}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View className="w-full gap-3">
          <Button
            title="Send a Message"
            onPress={onSendMessage}
            variant="primary"
          />
          <Button
            title="Keep Swiping"
            onPress={onKeepSwiping}
            variant="outline"
          />
        </View>
      </View>
    </View>
  );
}
