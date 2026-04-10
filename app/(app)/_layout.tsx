import { useEffect } from "react";
import { View } from "react-native";
import { Stack } from "expo-router";
import { ActivePetProvider, useActivePet } from "@/contexts/ActivePetContext";
import { useAuth } from "@/hooks/useAuth";
import { saveUserLocation } from "@/lib/location";

const androidModalOptions = { presentation: "modal" as const };

function AppLayoutInner() {
  const { allPets, loading } = useActivePet();
  const { session } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (session?.user?.id) {
      saveUserLocation(session.user.id).catch(() => {});
    }
  }, [loading, session]);

  if (loading) {
    return <View className="flex-1 bg-gray-50" />;
  }

  if (allPets.length === 0) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding/index" options={{ gestureEnabled: false }} />
      </Stack>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="onboarding/index"
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen name="edit-pet/[id]" options={androidModalOptions} />
      <Stack.Screen name="pet-profile/[id]" options={androidModalOptions} />
      <Stack.Screen name="add-pet" options={androidModalOptions} />
      <Stack.Screen name="create-post" options={{ presentation: "modal" as const }} />
      <Stack.Screen name="post/[id]" options={androidModalOptions} />
      <Stack.Screen name="matching-preferences" options={androidModalOptions} />
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
