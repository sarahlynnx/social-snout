import { useState } from "react";
import { View, Text, Pressable, Dimensions } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { Avatar } from "@/components/ui/Avatar";
import { PET_SIZE_LABELS } from "@/constants";
import type { SwipeablePet } from "@/types/database";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH - 32;
const PHOTO_HEIGHT = CARD_WIDTH * 0.85;

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

  const breedDisplay = pet.breed?.replace(/^(Mixed|Other) — /, "") ?? null;
  const genderSymbol = pet.gender === "MALE" ? "♂" : pet.gender === "FEMALE" ? "♀" : null;
  const bioText = pet.bio
    ? pet.bio.length > 120 ? pet.bio.slice(0, 120).trimEnd() + "…" : pet.bio
    : null;
  const firstPrompt = Array.isArray(pet.prompts) && pet.prompts.length > 0 ? pet.prompts[0] : null;

  return (
    <View
      className="rounded-3xl overflow-hidden bg-white border border-gray-200"
      style={{
        width: CARD_WIDTH,
      }}
    >
      {/* Photo section */}
      <View style={{ height: PHOTO_HEIGHT }} className="bg-gray-200">
        {currentPhoto ? (
          <Image
            source={{ uri: currentPhoto }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
            transition={150}
            cachePolicy="memory-disk"
          />
        ) : (
          <View className="w-full h-full items-center justify-center bg-gray-200">
            <Ionicons name="paw" size={64} color="#D4D1CA" />
          </View>
        )}

        {/* Tap zones */}
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
      </View>

      {/* Info section — tappable to open profile */}
      <Pressable onPress={onOpenProfile} className="px-5 py-4 active:opacity-70">
        {/* Name + Age */}
        <View className="flex-row items-baseline gap-2">
          <Text className="text-2xl font-bold text-gray-900">{pet.name}</Text>
          <Text className="text-base text-gray-400">
            {ageDisplay}{genderSymbol ? ` · ${genderSymbol}` : ""}
          </Text>
        </View>

        {/* Breed + Size */}
        <View className="flex-row items-center gap-1.5 mt-1">
          {breedDisplay && (
            <>
              <Text className="text-sm text-gray-500">{breedDisplay}</Text>
              <Text className="text-gray-300">·</Text>
            </>
          )}
          <Text className="text-sm text-gray-500">
            {PET_SIZE_LABELS[pet.size]}
          </Text>
        </View>

        {/* Tags */}
        {pet.tags.length > 0 && (
          <View className="flex-row flex-wrap gap-1.5 mt-3">
            {pet.tags.slice(0, 4).map((tag) => (
              <View
                key={tag}
                className="bg-primary-50 px-2.5 py-1 rounded-full"
              >
                <Text className="text-xs text-primary-600 font-medium">
                  {tag}
                </Text>
              </View>
            ))}
            {pet.tags.length > 4 && (
              <View className="bg-gray-100 px-2.5 py-1 rounded-full">
                <Text className="text-xs text-gray-500">
                  +{pet.tags.length - 4}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Bio */}
        {bioText && (
          <Text className="text-sm text-gray-600 mt-3 leading-5">{bioText}</Text>
        )}

        {/* First prompt */}
        {firstPrompt && (
          <View className="mt-3 bg-gray-50 rounded-2xl px-3 py-2.5">
            <Text className="text-xs text-gray-400 mb-1">{firstPrompt.question}</Text>
            <Text className="text-sm text-gray-700">{firstPrompt.answer}</Text>
          </View>
        )}

        {/* Owner info */}
        <View className="flex-row items-center gap-2 mt-3 pt-3 border-t border-gray-100">
          <Avatar
            uri={pet.owner_avatar_url}
            name={pet.owner_name}
            size="sm"
          />
          <Text className="text-sm text-gray-500">{pet.owner_name}</Text>
        </View>
      </Pressable>
    </View>
  );
}
