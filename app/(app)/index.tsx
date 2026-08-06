import { View } from "react-native";
import { Redirect } from "expo-router";
import { useActivePet } from "@/contexts/ActivePetContext";

export default function AppIndex() {
  const { allPets, loading } = useActivePet();

  if (loading) {
    return <View style={{ flex: 1, backgroundColor: "#5A8A4F" }} />;
  }

  if (allPets.length === 0) {
    return <Redirect href="/(app)/onboarding" />;
  }

  return <Redirect href="/(app)/(tabs)/swipe" />;
}
