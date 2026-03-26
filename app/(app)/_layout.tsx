import { useEffect, useState } from "react";
import { Stack, useRouter } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

export default function AppLayout() {
  const { session } = useAuth();
  const router = useRouter();
  const [checkingPets, setCheckingPets] = useState(true);
  const [hasPets, setHasPets] = useState(false);

  useEffect(() => {
    if (!session?.user) return;

    async function checkForPets() {
      const { count } = await supabase
        .from("pets")
        .select("*", { count: "exact", head: true })
        .eq("owner_id", session!.user.id);

      const userHasPets = (count ?? 0) > 0;
      setHasPets(userHasPets);
      setCheckingPets(false);

      if (!userHasPets) {
        router.replace("/(app)/onboarding");
      }
    }

    checkForPets();
  }, [session]);

  if (checkingPets) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="onboarding/index"
        options={{ gestureEnabled: false }}
      />
    </Stack>
  );
}
