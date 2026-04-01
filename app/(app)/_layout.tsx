import { useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import { ActivePetProvider, useActivePet } from "@/contexts/ActivePetContext";

function AppLayoutInner() {
  const router = useRouter();
  const { allPets, loading } = useActivePet();

  useEffect(() => {
    if (loading) return;

    if (allPets.length === 0) {
      router.replace("/(app)/onboarding");
    }
  }, [loading, allPets]);

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
      <Stack.Screen
        name="add-pet"
        options={{ presentation: "modal" }}
      />
      <Stack.Screen
        name="create-post"
        options={{ presentation: "modal" }}
      />
      <Stack.Screen
        name="post/[id]"
        options={{ presentation: "modal" }}
      />
      <Stack.Screen
        name="matching-preferences"
        options={{ presentation: "modal" }}
      />
      <Stack.Screen name="chat/[matchId]" />
    </Stack>
  );
}

export default function AppLayout() {
  return (
    <ActivePetProvider>
      <AppLayoutInner />
    </ActivePetProvider>
  );
}
