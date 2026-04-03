import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import {
  View,
  Text,
  ScrollView,
  Alert,
  Image,
  Pressable,
  Dimensions,
  Share,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { useActivePet } from "@/contexts/ActivePetContext";
import { PetSwitcher } from "@/components/PetSwitcher";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { InfoPills } from "@/components/profile/InfoPills";
import { PromptCard } from "@/components/profile/PromptCard";
import type { User, PetPrompt } from "@/types/database";

function getAgeSubtitle(age: number): string {
  if (age < 1) return "Still a puppy!";
  if (age === 1) return "1 year of tail wags";
  return `${age} years of tail wags`;
}

export default function ProfileScreen() {
  const { session, signOut, deleteAccount } = useAuth();
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

  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This will permanently delete your account, pets, posts, matches, and messages. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Account",
          style: "destructive",
          onPress: async () => {
            setDeleting(true);
            try {
              await deleteAccount();
            } catch (error) {
              Alert.alert(
                "Error",
                error instanceof Error
                  ? error.message
                  : "Failed to delete account."
              );
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  const handleInvite = async () => {
    try {
      await Share.share({
        message:
          "Join me on SocialSnout! It's a social app for pets to find friends, playdates, and more. 🐾",
      });
    } catch {
      // user cancelled share
    }
  };

  const pet = activePet;
  const displayName =
    user?.name || session?.user?.user_metadata?.name || "User";
  const userEmail = session?.user?.email || "";
  const editPet = () => pet && router.push(`/(app)/edit-pet/${pet.id}`);
  const previewPet = () => pet && router.push(`/(app)/pet-profile/${pet.id}`);
  const prompts: PetPrompt[] =
    pet && Array.isArray(pet.prompts) ? pet.prompts : [];
  const photoSize = Math.floor((Dimensions.get("window").width - 48 - 16) / 3);

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* Pet switcher header */}
      <View className="px-4 pt-2 pb-2">
        <PetSwitcher />
      </View>

      {pet ? (
        <View className="px-4 gap-3">
          {/* Pet header with Edit + Preview buttons */}
          <View className="bg-white rounded-2xl px-4 py-4">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-lg font-bold text-gray-900">{pet.name}</Text>
                <Text className="text-sm text-gray-400 mt-0.5">
                  {getAgeSubtitle(pet.age)}
                </Text>
              </View>
              <View className="flex-row gap-2">
                <Pressable
                  onPress={editPet}
                  className="flex-row items-center gap-1.5 bg-primary-50 border border-primary-200 rounded-full px-3 py-1.5"
                >
                  <Ionicons name="pencil" size={14} color="#5A8A4F" />
                  <Text className="text-sm font-medium text-primary-600">
                    Edit
                  </Text>
                </Pressable>
                <Pressable
                  onPress={previewPet}
                  className="flex-row items-center gap-1.5 bg-gray-100 rounded-full px-3 py-1.5"
                >
                  <Ionicons name="eye-outline" size={16} color="#A8A49C" />
                  <Text className="text-sm text-gray-600">Preview</Text>
                </Pressable>
              </View>
            </View>
          </View>

          {/* Photos section */}
          <View className="bg-white rounded-2xl p-4">
            <SectionHeader icon="camera-outline" title="Photos" />
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
          <View className="bg-white rounded-2xl p-4">
            <SectionHeader icon="paw" title="Basics" />
            <InfoPills breed={pet.breed} age={pet.age} size={pet.size} />
          </View>

          {/* Bio section */}
          {pet.bio ? (
            <View className="bg-white rounded-2xl p-4">
              <SectionHeader icon="book-outline" title="Bio" />
              <Text className="text-base text-gray-700 leading-6">
                {pet.bio}
              </Text>
            </View>
          ) : null}

          {/* Prompts section */}
          {prompts.length > 0 ? (
            <View className="bg-white rounded-2xl p-4">
              <SectionHeader icon="chatbubble-ellipses-outline" title="Prompts" />
              <View className="gap-3">
                {prompts.map((prompt, i) => (
                  <PromptCard key={i} prompt={prompt} />
                ))}
              </View>
            </View>
          ) : null}

          {/* Tags section */}
          {pet.tags.length > 0 ? (
            <View className="bg-white rounded-2xl p-4">
              <SectionHeader icon="heart-outline" title="Temperament" />
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

          {/* Settings */}
          <View className="bg-white rounded-2xl p-4">
            <SectionHeader icon="settings-outline" title="Settings" />
            <Pressable
              onPress={() => router.push("/(app)/matching-preferences")}
              className="flex-row items-center justify-between bg-gray-50 rounded-2xl p-4"
            >
              <View className="flex-row items-center gap-3">
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: "#F4F7F4",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="options-outline" size={20} color="#5A8A4F" />
                </View>
                <View>
                  <Text className="text-base font-semibold text-gray-900">
                    Matching Preferences
                  </Text>
                  <Text className="text-sm text-gray-500">
                    Find your park pals
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#A8A49C" />
            </Pressable>

            <Pressable
              onPress={handleInvite}
              className="flex-row items-center justify-between bg-gray-50 rounded-2xl p-4 mt-2"
            >
              <View className="flex-row items-center gap-3">
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: "#FDF6F2",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="mail-outline" size={20} color="#C4754A" />
                </View>
                <View>
                  <Text className="text-base font-semibold text-gray-900">
                    Invite a Friend
                  </Text>
                  <Text className="text-sm text-gray-500">
                    Bring more pals to the park
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#A8A49C" />
            </Pressable>
          </View>

          {/* Pet Parent */}
          <View className="bg-white rounded-2xl p-4">
            <SectionHeader icon="person-outline" title="Pet Parent" />
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

          {/* Account */}
          <View className="gap-3 mt-1">
            <Button title="Sign Out" onPress={handleSignOut} variant="outline" />
            <Pressable
              onPress={handleDeleteAccount}
              disabled={deleting}
              className="items-center py-3"
            >
              <Text className="text-sm text-red-400">
                {deleting ? "Deleting..." : "Delete Account"}
              </Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <View className="px-6 py-16 items-center">
          <Ionicons name="paw" size={64} color="#C5D7C0" />
          <Text className="text-lg font-semibold text-gray-700 mt-4">
            No pup on the leash yet
          </Text>
          <Text className="text-sm text-gray-400 mt-1 text-center">
            Add your first pet to get started at the park!
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
