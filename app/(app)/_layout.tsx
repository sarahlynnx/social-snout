import { Stack } from "expo-router";
import { ActivePetProvider } from "@/contexts/ActivePetContext";
import { LocationProvider } from "@/contexts/LocationContext";

const androidModalOptions = { presentation: "modal" as const };

function AppLayoutInner() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="onboarding/index"
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen name="edit-pet/[id]" options={androidModalOptions} />
      <Stack.Screen name="pet-profile/[id]" options={androidModalOptions} />
      <Stack.Screen name="add-pet" options={androidModalOptions} />
      <Stack.Screen
        name="create-post"
        options={{ presentation: "modal" as const }}
      />
      <Stack.Screen name="post/[id]" options={androidModalOptions} />
      <Stack.Screen name="matching-preferences" options={androidModalOptions} />
      <Stack.Screen name="chat/[matchId]" />
    </Stack>
  );
}

export default function AppLayout() {
  return (
    <ActivePetProvider>
      <LocationProvider>
        <AppLayoutInner />
      </LocationProvider>
    </ActivePetProvider>
  );
}
