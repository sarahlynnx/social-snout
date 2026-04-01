import { useEffect, useState } from "react";
import { View, ScrollView, ActivityIndicator, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { supabase } from "@/lib/supabase";
import { PetProfileView } from "@/components/profile/PetProfileView";
import type { Pet, User } from "@/types/database";

export default function PetProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [pet, setPet] = useState<Pet | null>(null);
  const [owner, setOwner] = useState<Pick<User, "id" | "name" | "avatar_url"> | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView>
        {pet && (
          <PetProfileView
            pet={pet}
            ownerName={owner?.name}
            ownerAvatar={owner?.avatar_url}
            showOwner={true}
          />
        )}
      </ScrollView>
    </View>
  );
}
