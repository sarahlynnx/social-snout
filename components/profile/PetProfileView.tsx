import { View, Text } from "react-native";
import { PhotoCarousel } from "@/components/profile/PhotoCarousel";
import { InfoPills } from "@/components/profile/InfoPills";
import { PromptCard } from "@/components/profile/PromptCard";
import { Avatar } from "@/components/ui/Avatar";
import type { Pet, PetPrompt } from "@/types/database";

interface PetProfileViewProps {
  pet: Pet;
  ownerName?: string;
  ownerAvatar?: string | null;
  showOwner?: boolean;
}

export function PetProfileView({
  pet,
  ownerName,
  ownerAvatar,
  showOwner = true,
}: PetProfileViewProps) {
  const ageDisplay =
    pet.age === 0
      ? "<1 yr"
      : pet.age >= 10
        ? "10+ yrs"
        : `${pet.age} yr${pet.age === 1 ? "" : "s"}`;

  const prompts: PetPrompt[] = Array.isArray(pet.prompts) ? pet.prompts : [];

  return (
    <View>
      {/* Photo carousel */}
      <PhotoCarousel photos={pet.photos} />

      <View className="px-6 pt-5 pb-8 gap-5">
        {/* Name + age */}
        <View className="flex-row items-baseline gap-2">
          <Text className="text-2xl font-bold text-gray-900">{pet.name}</Text>
          <Text className="text-lg text-gray-500">{ageDisplay}</Text>
        </View>

        {/* Info pills */}
        <InfoPills breed={pet.breed} age={pet.age} size={pet.size} />

        {/* Bio */}
        {pet.bio ? (
          <View>
            <Text className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">
              About
            </Text>
            <Text className="text-base text-gray-700 leading-6">{pet.bio}</Text>
          </View>
        ) : null}

        {/* Prompts */}
        {prompts.length > 0 && (
          <View className="gap-3">
            {prompts.map((prompt, i) => (
              <PromptCard key={i} prompt={prompt} />
            ))}
          </View>
        )}

        {/* Temperament tags */}
        {pet.tags.length > 0 && (
          <View>
            <Text className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
              Temperament
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {pet.tags.map((tag) => (
                <View
                  key={tag}
                  className="bg-primary-50 border border-primary-200 px-3 py-1.5 rounded-full"
                >
                  <Text className="text-sm text-primary-600">{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Owner info */}
        {showOwner && ownerName && (
          <View className="flex-row items-center gap-3 bg-gray-50 rounded-2xl p-4">
            <Avatar uri={ownerAvatar} name={ownerName} size="md" />
            <View>
              <Text className="text-xs text-gray-400 uppercase tracking-wide">
                Pet Parent
              </Text>
              <Text className="text-base font-semibold text-gray-900">
                {ownerName}
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}
