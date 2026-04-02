import { useState } from "react";
import { View, Image, Pressable, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface PhotoCarouselProps {
  photos: string[];
  height?: number;
}

export function PhotoCarousel({ photos, height = SCREEN_WIDTH * 0.85 }: PhotoCarouselProps) {
  const [index, setIndex] = useState(0);

  const currentPhoto = photos[index];

  const goLeft = () => setIndex((prev) => (prev > 0 ? prev - 1 : prev));
  const goRight = () => setIndex((prev) => (prev < photos.length - 1 ? prev + 1 : prev));

  return (
    <View style={{ width: SCREEN_WIDTH, height }} className="bg-gray-200">
      {currentPhoto ? (
        <Image
          source={{ uri: currentPhoto }}
          className="w-full h-full"
          resizeMode="cover"
        />
      ) : (
        <View className="w-full h-full items-center justify-center">
          <Ionicons name="paw" size={64} color="#D4D1CA" />
        </View>
      )}

      {/* Tap zones */}
      {photos.length > 1 && (
        <View className="absolute inset-0 flex-row">
          <Pressable className="flex-1" onPress={goLeft} />
          <Pressable className="flex-1" onPress={goRight} />
        </View>
      )}

      {/* Dot indicators */}
      {photos.length > 1 && (
        <View className="absolute top-3 left-0 right-0 flex-row justify-center gap-1">
          {photos.map((_, i) => (
            <View
              key={i}
              className={`h-1 rounded-full ${
                i === index ? "bg-white w-6" : "bg-white/50 w-4"
              }`}
            />
          ))}
        </View>
      )}
    </View>
  );
}
