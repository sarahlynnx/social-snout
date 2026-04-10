import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PET_SIZE_LABELS, PET_GENDER_LABELS } from "@/constants";
import type { PetGender, PetSize } from "@/types/database";

interface InfoPillsProps {
  breed?: string | null;
  age: number;
  size: PetSize;
  gender?: PetGender | null;
}

function formatAge(age: number) {
  if (age === 0) return "<1 yr";
  if (age >= 10) return "10+ yrs";
  return `${age} yr${age === 1 ? "" : "s"}`;
}

function Pill({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View className="flex-row items-center bg-gray-100 rounded-full px-3 py-1.5 gap-1.5">
      <Ionicons name={icon} size={14} color="#5C584F" />
      <Text className="text-sm text-gray-700">{label}</Text>
    </View>
  );
}

export function InfoPills({ breed, age, size, gender }: InfoPillsProps) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {breed && <Pill icon="paw" label={breed} />}
      <Pill icon="calendar" label={formatAge(age)} />
      <Pill icon="resize" label={PET_SIZE_LABELS[size]} />
      {gender && <Pill icon="male-female" label={PET_GENDER_LABELS[gender]} />}
    </View>
  );
}
