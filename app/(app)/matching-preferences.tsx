import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Slider from "@react-native-community/slider";
import { Button } from "@/components/ui/Button";
import {
  useMatchingPreferences,
  type MatchingPreferencesState,
} from "@/hooks/useMatchingPreferences";
import { useUnsavedChangesWarning } from "@/hooks/useUnsavedChangesWarning";
import { PET_SIZES, PET_SIZE_LABELS, PET_GENDERS, PET_GENDER_LABELS, TEMPERAMENT_TAGS } from "@/constants";
import type { PetType, PetSize, PetGender } from "@/types/database";

const AGE_OPTIONS = [
  { label: "<1", value: 0 },
  { label: "1", value: 1 },
  { label: "2", value: 2 },
  { label: "3", value: 3 },
  { label: "4", value: 4 },
  { label: "5", value: 5 },
  { label: "6", value: 6 },
  { label: "7", value: 7 },
  { label: "8", value: 8 },
  { label: "9", value: 9 },
  { label: "10+", value: 10 },
];

export default function MatchingPreferencesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { preferences, loading, saving, savePreferences } =
    useMatchingPreferences();

  const [petTypes, setPetTypes] = useState<PetType[]>(preferences.petTypes);
  const [sizes, setSizes] = useState<PetSize[]>(preferences.sizes);
  const [genders, setGenders] = useState<PetGender[]>(preferences.genders);
  const [ageMin, setAgeMin] = useState(preferences.ageMin);
  const [ageMax, setAgeMax] = useState(preferences.ageMax);
  const [requiredTags, setRequiredTags] = useState<string[]>(
    preferences.requiredTags
  );
  const [radiusMiles, setRadiusMiles] = useState(preferences.radiusMiles);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    if (!loading) {
      setPetTypes(preferences.petTypes);
      setSizes(preferences.sizes);
      setGenders(preferences.genders);
      setAgeMin(preferences.ageMin);
      setAgeMax(preferences.ageMax);
      setRequiredTags(preferences.requiredTags);
      setRadiusMiles(preferences.radiusMiles);
    }
  }, [loading, preferences]);

  const hasUnsavedChanges =
    !justSaved &&
    !loading &&
    ([...petTypes].sort().join() !== [...preferences.petTypes].sort().join() ||
      [...sizes].sort().join() !== [...preferences.sizes].sort().join() ||
      [...genders].sort().join() !== [...preferences.genders].sort().join() ||
      ageMin !== preferences.ageMin ||
      ageMax !== preferences.ageMax ||
      [...requiredTags].sort().join() !== [...preferences.requiredTags].sort().join() ||
      radiusMiles !== preferences.radiusMiles);

  useUnsavedChangesWarning(hasUnsavedChanges);

  const selectPetType = (type: PetType) => setPetTypes([type]);
  const setBoth = () => setPetTypes(["DOG", "CAT"]);

  const toggleSize = (size: PetSize) => {
    setSizes((prev) => {
      if (prev.includes(size)) {
        if (prev.length === 1) return prev;
        return prev.filter((s) => s !== size);
      }
      return [...prev, size];
    });
  };

  const toggleGender = (gender: PetGender) => {
    setGenders((prev) => {
      if (prev.includes(gender)) {
        if (prev.length === 1) return prev;
        return prev.filter((g) => g !== gender);
      }
      return [...prev, gender];
    });
  };

  const toggleTag = (tag: string) => {
    setRequiredTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSave = async () => {
    const prefs: MatchingPreferencesState = {
      petTypes,
      sizes,
      genders,
      ageMin,
      ageMax,
      requiredTags,
      radiusMiles,
    };

    const success = await savePreferences(prefs);
    if (success) {
      setJustSaved(true);
      router.back();
    } else {
      Alert.alert("Error", "Failed to save preferences. Please try again.");
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#5A8A4F" />
      </View>
    );
  }

  const isBoth = petTypes.includes("DOG") && petTypes.includes("CAT");

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
    >
      {/* Header */}
      <View className="px-6 pt-16 pb-4">
        <Text className="text-3xl font-bold text-gray-900">Preferences</Text>
        <Text className="text-sm text-gray-500 mt-1">
          Filter which pets appear in your swipe deck
        </Text>
      </View>

      {/* Distance Radius */}
      <View className="px-6 py-4">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-xs font-medium text-gray-400 uppercase tracking-wide">
            Distance
          </Text>
          <Text className="text-sm font-semibold text-primary-600">
            {radiusMiles} {radiusMiles === 1 ? "mile" : "miles"}
          </Text>
        </View>
        <Slider
          minimumValue={1}
          maximumValue={100}
          step={1}
          value={radiusMiles}
          onValueChange={setRadiusMiles}
          minimumTrackTintColor="#5A8A4F"
          maximumTrackTintColor="#E8E6E1"
          thumbTintColor="#5A8A4F"
        />
        <View className="flex-row justify-between mt-1">
          <Text className="text-xs text-gray-400">1 mi</Text>
          <Text className="text-xs text-gray-400">100 mi</Text>
        </View>
      </View>

      {/* Pet Type */}
      <View className="px-6 py-4">
        <Text className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
          Pet Type
        </Text>
        <View className="flex-row gap-2">
          {(["DOG", "CAT"] as PetType[]).map((type) => {
            const isSelected = petTypes.includes(type) && !isBoth;
            return (
              <Pressable
                key={type}
                onPress={() => selectPetType(type)}
                className="flex-1"
                style={{
                  paddingVertical: 12,
                  borderRadius: 16,
                  borderWidth: 2,
                  borderColor: isSelected ? "#5A8A4F" : "#E8E6E1",
                  backgroundColor: isSelected ? "#F4F7F4" : "#fff",
                  alignItems: "center",
                }}
              >
                <Ionicons
                  name={type === "DOG" ? "paw" : "paw-outline"}
                  size={24}
                  color={isSelected ? "#5A8A4F" : "#A8A49C"}
                />
                <Text
                  style={{
                    marginTop: 4,
                    fontSize: 14,
                    fontWeight: "600",
                    color: isSelected ? "#5A8A4F" : "#5C584F",
                  }}
                >
                  {type === "DOG" ? "Dogs" : "Cats"}
                </Text>
              </Pressable>
            );
          })}
          <Pressable
            onPress={setBoth}
            className="flex-1"
            style={{
              paddingVertical: 12,
              borderRadius: 16,
              borderWidth: 2,
              borderColor: isBoth ? "#5A8A4F" : "#E8E6E1",
              backgroundColor: isBoth ? "#F4F7F4" : "#fff",
              alignItems: "center",
            }}
          >
            <Ionicons
              name="heart"
              size={24}
              color={isBoth ? "#5A8A4F" : "#A8A49C"}
            />
            <Text
              style={{
                marginTop: 4,
                fontSize: 14,
                fontWeight: "600",
                color: isBoth ? "#5A8A4F" : "#5C584F",
              }}
            >
              Both
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Gender */}
      <View className="px-6 py-4">
        <Text className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
          Gender
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {PET_GENDERS.map((g) => {
            const isSelected = genders.includes(g);
            return (
              <Pressable
                key={g}
                onPress={() => toggleGender(g)}
                className={`py-2.5 px-4 rounded-full border-2 ${
                  isSelected
                    ? "border-primary-500 bg-primary-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <Text
                  className={`text-sm ${
                    isSelected ? "text-primary-600 font-semibold" : "text-gray-600"
                  }`}
                >
                  {PET_GENDER_LABELS[g]}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Size */}
      <View className="px-6 py-4">
        <Text className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
          Size
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {PET_SIZES.map((size) => {
            const isSelected = sizes.includes(size);
            return (
              <Pressable
                key={size}
                onPress={() => toggleSize(size)}
                className={`py-2.5 px-4 rounded-full border-2 ${
                  isSelected
                    ? "border-primary-500 bg-primary-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <Text
                  className={`text-sm ${
                    isSelected
                      ? "text-primary-600 font-semibold"
                      : "text-gray-600"
                  }`}
                >
                  {PET_SIZE_LABELS[size]}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Age Range */}
      <View className="px-6 py-4">
        <Text className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
          Age Range
        </Text>

        <Text className="text-sm font-medium text-gray-700 mb-2">Youngest</Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {AGE_OPTIONS.map((opt) => {
            const isSelected = ageMin === opt.value;
            return (
              <Pressable
                key={`min-${opt.value}`}
                onPress={() => {
                  setAgeMin(opt.value);
                  if (opt.value > ageMax) setAgeMax(opt.value);
                }}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 14,
                  borderRadius: 999,
                  borderWidth: 2,
                  borderColor: isSelected ? "#5A8A4F" : "#E8E6E1",
                  backgroundColor: isSelected ? "#F4F7F4" : "#fff",
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: isSelected ? "600" : "400",
                    color: isSelected ? "#5A8A4F" : "#5C584F",
                  }}
                >
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text className="text-sm font-medium text-gray-700 mb-2">Oldest</Text>
        <View className="flex-row flex-wrap gap-2">
          {AGE_OPTIONS.map((opt) => {
            const isSelected = ageMax === opt.value;
            return (
              <Pressable
                key={`max-${opt.value}`}
                onPress={() => {
                  setAgeMax(opt.value);
                  if (opt.value < ageMin) setAgeMin(opt.value);
                }}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 14,
                  borderRadius: 999,
                  borderWidth: 2,
                  borderColor: isSelected ? "#5A8A4F" : "#E8E6E1",
                  backgroundColor: isSelected ? "#F4F7F4" : "#fff",
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: isSelected ? "600" : "400",
                    color: isSelected ? "#5A8A4F" : "#5C584F",
                  }}
                >
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Required Tags */}
      <View className="px-6 py-4">
        <Text className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
          Required Tags
        </Text>
        <Text className="text-xs text-gray-400 mb-3">
          Pets must have all selected tags
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {TEMPERAMENT_TAGS.map((tag) => {
            const isSelected = requiredTags.includes(tag);
            return (
              <Pressable
                key={tag}
                onPress={() => toggleTag(tag)}
                className={`py-2 px-3 rounded-full border ${
                  isSelected
                    ? "border-primary-500 bg-primary-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <Text
                  className={`text-sm ${
                    isSelected
                      ? "text-primary-600 font-medium"
                      : "text-gray-600"
                  }`}
                >
                  {tag}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Save Button */}
      <View className="px-6 pt-4">
        <Button
          title="Save Preferences"
          onPress={handleSave}
          loading={saving}
          variant="primary"
        />
      </View>
    </ScrollView>
  );
}
