import { useState } from "react";
import { View, Text, Image, Pressable, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Avatar } from "@/components/ui/Avatar";
import { PET_SIZE_LABELS } from "@/constants";
import type { SwipeablePet } from "@/types/database";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH - 32;

interface PetCardProps {
  pet: SwipeablePet;
  onOpenProfile?: () => void;
}

export function PetCard({ pet, onOpenProfile }: PetCardProps) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const photos = pet.photos.length > 0 ? pet.photos : [];
  const currentPhoto = photos[photoIndex];

  const handleTapPhoto = (side: "left" | "right") => {
    if (photos.length <= 1) return;
    if (side === "left") {
      setPhotoIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else {
      setPhotoIndex((prev) => (prev < photos.length - 1 ? prev + 1 : prev));
    }
  };

  const ageDisplay =
    pet.age === 0
      ? "<1 yr"
      : pet.age >= 10
        ? "10+ yrs"
        : `${pet.age} yr${pet.age === 1 ? "" : "s"}`;

  return (
    <View
      className="rounded-3xl overflow-hidden bg-gray-200"
      style={{ width: CARD_WIDTH, height: CARD_WIDTH * 1.3 }}
    >
      {/* Photo */}
      {currentPhoto ? (
        <Image
          source={{ uri: currentPhoto }}
          className="absolute inset-0 w-full h-full"
          resizeMode="cover"
        />
      ) : (
        <View className="absolute inset-0 w-full h-full items-center justify-center bg-gray-200">
          <Ionicons name="paw" size={64} color="#D1D5DB" />
        </View>
      )}

      {/* Tap zones: left 20% = prev photo, center 60% = open profile, right 20% = next photo */}
      <View className="absolute inset-0 flex-row">
        <Pressable
          style={{ width: "20%" }}
          onPress={() => handleTapPhoto("left")}
        />
        <Pressable
          style={{ width: "60%" }}
          onPress={onOpenProfile}
        />
        <Pressable
          style={{ width: "20%" }}
          onPress={() => handleTapPhoto("right")}
        />
      </View>

      {/* Photo indicator dots */}
      {photos.length > 1 && (
        <View className="absolute top-3 left-0 right-0 flex-row justify-center gap-1">
          {photos.map((_, i) => (
            <View
              key={i}
              className={`h-1 rounded-full ${
                i === photoIndex ? "bg-white w-6" : "bg-white/50 w-4"
              }`}
            />
          ))}
        </View>
      )}

      {/* Gradient overlay at bottom */}
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.7)"]}
        className="absolute bottom-0 left-0 right-0 pt-20 pb-5 px-5"
      >
        {/* Name + Age */}
        <View className="flex-row items-baseline gap-2">
          <Text className="text-3xl font-bold text-white">{pet.name}</Text>
          <Text className="text-lg text-white/80">{ageDisplay}</Text>
        </View>

        {/* Breed + Size */}
        <View className="flex-row items-center gap-2 mt-1">
          {pet.breed && (
            <Text className="text-sm text-white/80">{pet.breed}</Text>
          )}
          {pet.breed && (
            <Text className="text-white/50">-</Text>
          )}
          <Text className="text-sm text-white/80">
            {PET_SIZE_LABELS[pet.size]}
          </Text>
        </View>

        {/* Tags */}
        {pet.tags.length > 0 && (
          <View className="flex-row flex-wrap gap-1 mt-2">
            {pet.tags.slice(0, 4).map((tag) => (
              <View
                key={tag}
                className="bg-white/20 px-2 py-1 rounded-full"
              >
                <Text className="text-xs text-white">{tag}</Text>
              </View>
            ))}
            {pet.tags.length > 4 && (
              <View className="bg-white/20 px-2 py-1 rounded-full">
                <Text className="text-xs text-white">
                  +{pet.tags.length - 4}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Owner info */}
        <View className="flex-row items-center gap-2 mt-3">
          <Avatar
            uri={pet.owner_avatar_url}
            name={pet.owner_name}
            size="sm"
          />
          <Text className="text-sm text-white/80">{pet.owner_name}</Text>
        </View>
      </LinearGradient>
    </View>
  );
}
