import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { View, Text, ScrollView, Alert, Image, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { PET_SIZE_LABELS } from "@/constants";
import type { Pet, User } from "@/types/database";

export default function ProfileScreen() {
  const { session, signOut } = useAuth();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);

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

        const { data: petsData } = await supabase
          .from("pets")
          .select("*")
          .eq("owner_id", session!.user.id);

        if (petsData) setPets(petsData);
      }

      fetchProfile();
    }, [session])
  );

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: signOut },
    ]);
  };

  const displayName = user?.name || session?.user?.user_metadata?.name || "User";
  const userEmail = session?.user?.email || "";

  const formatAge = (age: number) => {
    if (age === 0) return "<1 yr";
    if (age >= 10) return "10+ yrs";
    return `${age} yr${age === 1 ? "" : "s"}`;
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="items-center pt-8 pb-6 px-6">
        <Avatar uri={user?.avatar_url} name={displayName} size="lg" />
        <Text className="text-xl font-bold text-gray-900 mt-4">
          {displayName}
        </Text>
        <Text className="text-sm text-gray-500 mt-1">{userEmail}</Text>
      </View>

      <View className="px-6 py-4 border-t border-gray-100">
        <Text className="text-lg font-bold text-gray-900 mb-4">My Pets</Text>

        {pets.length > 0 ? (
          <View className="gap-4">
            {pets.map((pet) => (
              <Pressable
                key={pet.id}
                onPress={() => router.push(`/(app)/edit-pet/${pet.id}`)}
                className="flex-row bg-gray-50 rounded-2xl overflow-hidden active:bg-gray-100"
              >
                {pet.photos[0] ? (
                  <Image
                    source={{ uri: pet.photos[0] }}
                    className="w-24 h-24"
                  />
                ) : (
                  <View className="w-24 h-24 bg-gray-200 items-center justify-center">
                    <Ionicons name="paw" size={28} color="#D1D5DB" />
                  </View>
                )}
                <View className="flex-1 p-3 justify-center">
                  <Text className="text-base font-semibold text-gray-900">
                    {pet.name}
                  </Text>
                  <Text className="text-sm text-gray-500 mt-0.5">
                    {pet.breed ? `${pet.breed} · ` : ""}
                    {formatAge(pet.age)}
                  </Text>
                  <Text className="text-xs text-gray-400 mt-0.5">
                    {PET_SIZE_LABELS[pet.size]}
                  </Text>
                </View>
                <View className="justify-center pr-3">
                  <Ionicons name="pencil" size={18} color="#9CA3AF" />
                </View>
              </Pressable>
            ))}
          </View>
        ) : (
          <Text className="text-base text-gray-500 text-center py-8">
            Your pets will appear here.
          </Text>
        )}
      </View>

      <View className="px-6 py-4">
        <Button title="Sign Out" onPress={handleSignOut} variant="outline" />
      </View>
    </ScrollView>
  );
}
