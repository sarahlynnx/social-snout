import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { View, Text, ScrollView, Alert, Image, Pressable, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { useActivePet } from "@/contexts/ActivePetContext";
import { PetSwitcher } from "@/components/PetSwitcher";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { InfoPills } from "@/components/profile/InfoPills";
import { PromptCard } from "@/components/profile/PromptCard";
import type { User, PetPrompt } from "@/types/database";

export default function ProfileScreen() {
  const { session, signOut } = useAuth();
  const { activePet, refreshPets } = useActivePet();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!session?.user) return;

      async function fetchProfile() {
        const { data: userData } = await supabase
          .from("users")
          .select("*")
          .eq("id", session!.user.id)
          .single();

        if (userData) setUser(userData);

        // Refresh pets so active pet data is up to date after edits
        refreshPets();
      }

      fetchProfile();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session])
  );

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: signOut },
    ]);
  };

  const pet = activePet;
  const displayName = user?.name || session?.user?.user_metadata?.name || "User";
  const userEmail = session?.user?.email || "";
  const editPet = () => pet && router.push(`/(app)/edit-pet/${pet.id}`);
  const previewPet = () => pet && router.push(`/(app)/pet-profile/${pet.id}`);
  const prompts: PetPrompt[] = pet && Array.isArray(pet.prompts) ? pet.prompts : [];
  const photoSize = Math.floor((Dimensions.get("window").width - 48 - 16) / 3);

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Pet switcher header */}
      <View className="px-4 pt-2 pb-2">
        <PetSwitcher />
      </View>

      {pet ? (
        <View className="px-6">
          {/* Pet header with Edit + Preview buttons */}
          <View className="flex-row items-center justify-between pt-2 pb-4">
            <Text className="text-lg font-bold text-gray-900">{pet.name}</Text>
            <View className="flex-row gap-2">
              <Pressable
                onPress={editPet}
                className="flex-row items-center gap-1.5 bg-primary-50 border border-primary-200 rounded-full px-3 py-1.5"
              >
                <Ionicons name="pencil" size={14} color="#F97316" />
                <Text className="text-sm font-medium text-primary-600">Edit</Text>
              </Pressable>
              <Pressable
                onPress={previewPet}
                className="flex-row items-center gap-1.5 bg-gray-100 rounded-full px-3 py-1.5"
              >
                <Ionicons name="eye-outline" size={16} color="#6B7280" />
                <Text className="text-sm text-gray-600">Preview</Text>
              </Pressable>
            </View>
          </View>

          {/* Photos section */}
          <View className="py-4">
            <Text className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
              Photos
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {pet.photos.map((uri, i) => (
                <Image
                  key={i}
                  source={{ uri }}
                  className="rounded-xl"
                  style={{ width: photoSize, height: photoSize }}
                />
              ))}
            </View>
          </View>

          {/* Basics section */}
          <View className="py-4 border-t border-gray-100">
            <Text className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
              Basics
            </Text>
            <InfoPills breed={pet.breed} age={pet.age} size={pet.size} />
          </View>

          {/* Bio section */}
          {pet.bio ? (
            <View className="py-4 border-t border-gray-100">
              <Text className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
                Bio
              </Text>
              <Text className="text-base text-gray-700 leading-6">{pet.bio}</Text>
            </View>
          ) : null}

          {/* Prompts section */}
          {prompts.length > 0 ? (
            <View className="py-4 border-t border-gray-100">
              <Text className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
                Prompts
              </Text>
              <View className="gap-3">
                {prompts.map((prompt, i) => (
                  <PromptCard key={i} prompt={prompt} />
                ))}
              </View>
            </View>
          ) : null}

          {/* Tags section */}
          {pet.tags.length > 0 ? (
            <View className="py-4 border-t border-gray-100">
              <Text className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
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
          ) : null}
        </View>
      ) : (
        <View className="px-6 py-8">
          <Text className="text-base text-gray-500 text-center">
            Your pet profile will appear here.
          </Text>
        </View>
      )}

      {/* Settings */}
      <View className="px-6 py-4 border-t border-gray-100">
        <Text className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
          Settings
        </Text>
        <Pressable
          onPress={() => router.push("/(app)/matching-preferences")}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "#F9FAFB",
            borderRadius: 16,
            padding: 16,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "#FFF7ED",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="options-outline" size={20} color="#F97316" />
            </View>
            <View>
              <Text className="text-base font-semibold text-gray-900">
                Matching Preferences
              </Text>
              <Text className="text-sm text-gray-500">
                Filter which pets you see
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </Pressable>
      </View>

      {/* Pet Parent */}
      <View className="px-6 py-4 border-t border-gray-100">
        <Text className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
          Pet Parent
        </Text>
        <View className="flex-row items-center gap-3 bg-gray-50 rounded-2xl p-4">
          <Avatar uri={user?.avatar_url} name={displayName} size="md" />
          <View>
            <Text className="text-base font-semibold text-gray-900">
              {displayName}
            </Text>
            <Text className="text-sm text-gray-500">{userEmail}</Text>
          </View>
        </View>
      </View>

      {/* Sign Out */}
      <View className="px-6 pt-2">
        <Button title="Sign Out" onPress={handleSignOut} variant="outline" />
      </View>
    </ScrollView>
  );
}
