import { useEffect, useRef } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

export default function AppLayout() {
  const { session } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const hasChecked = useRef(false);

  useEffect(() => {
    if (!session?.user || hasChecked.current) return;
    hasChecked.current = true;

    async function checkForPets() {
      const { count } = await supabase
        .from("pets")
        .select("*", { count: "exact", head: true })
        .eq("owner_id", session!.user.id);

      if ((count ?? 0) === 0) {
        router.replace("/(app)/onboarding");
      }
    }

    checkForPets();
  }, [session]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="onboarding/index"
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name="edit-pet/[id]"
        options={{ presentation: "modal" }}
      />
      <Stack.Screen
        name="pet-profile/[id]"
        options={{ presentation: "modal" }}
      />
    </Stack>
  );
}
