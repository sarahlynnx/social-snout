import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import { PetProfileView } from "@/components/profile/PetProfileView";
import type { Pet, User } from "@/types/database";

export default function PetProfileScreen() {
  const router = useRouter();
  const { id, matchId } = useLocalSearchParams<{
    id: string;
    matchId?: string;
  }>();

  const [pet, setPet] = useState<Pet | null>(null);
  const [owner, setOwner] = useState<Pick<
    User,
    "id" | "name" | "avatar_url"
  > | null>(null);
  const [loading, setLoading] = useState(true);
  const [unmatching, setUnmatching] = useState(false);

  useEffect(() => {
    async function fetchPetProfile() {
      const { data: petData, error } = await supabase
        .from("pets")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !petData) {
        Alert.alert("Error", "Pet not found.");
        router.back();
        return;
      }

      setPet(petData);

      const { data: ownerData } = await supabase
        .from("users")
        .select("id, name, avatar_url")
        .eq("id", petData.owner_id)
        .single();

      if (ownerData) setOwner(ownerData);
      setLoading(false);
    }

    fetchPetProfile();
  }, [id]);

  const handleUnmatch = () => {
    Alert.alert(
      "Unmatch",
      `Are you sure you want to unmatch with ${
        pet?.name ?? "this pet"
      }? This will delete your conversation.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Unmatch",
          style: "destructive",
          onPress: async () => {
            setUnmatching(true);
            const { error } = await supabase
              .from("matches")
              .delete()
              .eq("id", matchId!);

            if (error) {
              Alert.alert("Error", "Failed to unmatch. Please try again.");
              setUnmatching(false);
              return;
            }

            router.dismissAll();
            router.replace("/(app)/(tabs)/matches");
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {pet && (
          <PetProfileView
            pet={pet}
            ownerName={owner?.name}
            ownerAvatar={owner?.avatar_url}
            showOwner={true}
          />
        )}

        {matchId && (
          <View className="px-6 mt-6">
            <Pressable
              className="flex-row items-center justify-center py-3.5 rounded-xl border border-red-200 bg-red-50"
              onPress={handleUnmatch}
              disabled={unmatching}
            >
              <Ionicons
                name="heart-dislike-outline"
                size={18}
                color="#EF4444"
              />
              <Text className="text-red-500 font-semibold ml-2">
                {unmatching ? "Unmatching..." : "Unmatch"}
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
