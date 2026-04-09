import { useEffect } from "react";
import { Platform, Pressable, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ActivePetProvider, useActivePet } from "@/contexts/ActivePetContext";
import { useAuth } from "@/hooks/useAuth";
import { saveUserLocation } from "@/lib/location";

const androidModalOptions =
  Platform.OS === "android"
    ? {
        presentation: "modal" as const,
        headerShown: true,
        headerTitle: "",
        headerShadowVisible: false,
        headerStyle: { backgroundColor: "#FAFAF7" },
        headerLeft: () => <ModalCloseButton />,
      }
    : { presentation: "modal" as const };

function ModalCloseButton() {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.back()}
      hitSlop={12}
      style={{ marginLeft: 4 }}
    >
      <Ionicons name="close" size={28} color="#272520" />
    </Pressable>
  );
}

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
      <Stack.Screen name="create-post" options={androidModalOptions} />
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
