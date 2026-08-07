import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  TextInput,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/hooks/useAuth";
import { useActivePet } from "@/contexts/ActivePetContext";
import { supabase } from "@/lib/supabase";
import { uploadPetPhoto, uploadAvatar } from "@/lib/storage";
import { useLocation } from "@/contexts/LocationContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  PET_TYPES,
  PET_SIZES,
  PET_SIZE_LABELS,
  PET_AGE_OPTIONS,
  PET_GENDERS,
  PET_GENDER_LABELS,
  DOG_BREEDS,
  CAT_BREEDS,
  TEMPERAMENT_TAGS,
  MAX_PET_PHOTOS,
  PET_PROMPTS,
  MAX_PET_PROMPTS,
} from "@/constants";
import type { PetType, PetSize, PetGender, PetPrompt } from "@/types/database";

export default function OnboardingScreen() {
  const { session } = useAuth();
  const { refreshPets } = useActivePet();
  const { requestLocation } = useLocation();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState("");
  const [type, setType] = useState<PetType>("DOG");
  const [breed, setBreed] = useState("");
  const [customBreed, setCustomBreed] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<PetGender>("UNKNOWN");
  const [size, setSize] = useState<PetSize>("MEDIUM");
  const [bio, setBio] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [prompts, setPrompts] = useState<PetPrompt[]>([]);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const breeds = type === "DOG" ? DOG_BREEDS : CAT_BREEDS;

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleTypeChange = (newType: PetType) => {
    setType(newType);
    setBreed("");
    setCustomBreed("");
  };

  const pickImage = async () => {
    if (photos.length >= MAX_PET_PHOTOS) {
      Alert.alert(
        "Limit Reached",
        `You can add up to ${MAX_PET_PHOTOS} photos.`
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotos((prev) => [...prev, result.assets[0].uri]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const togglePrompt = (question: string) => {
    setPrompts((prev) => {
      const existing = prev.find((p) => p.question === question);
      if (existing) {
        return prev.filter((p) => p.question !== question);
      }
      if (prev.length >= MAX_PET_PROMPTS) {
        Alert.alert(
          "Limit Reached",
          `You can answer up to ${MAX_PET_PROMPTS} prompts.`
        );
        return prev;
      }
      return [...prev, { question, answer: "" }];
    });
  };

  const updatePromptAnswer = (question: string, answer: string) => {
    setPrompts((prev) =>
      prev.map((p) => (p.question === question ? { ...p, answer } : p))
    );
  };

  const getFinalBreed = () => {
    if (breed === "Other" || breed === "Mixed") {
      return customBreed.trim() ? `${breed} — ${customBreed.trim()}` : breed;
    }
    return breed;
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter your pet's name.");
      return;
    }

    if (!breed) {
      Alert.alert("Error", "Please select your pet's breed.");
      return;
    }

    if (breed === "Other" && !customBreed.trim()) {
      Alert.alert("Error", "Please enter your pet's breed.");
      return;
    }

    if (breed === "Mixed" && !customBreed.trim()) {
      Alert.alert("Error", "Please describe your pet's mix (e.g. Lab/Poodle).");
      return;
    }

    if (!age) {
      Alert.alert("Error", "Please select your pet's age.");
      return;
    }

    if (photos.length === 0) {
      Alert.alert("Error", "Please add at least one photo of your pet.");
      return;
    }

    if (!avatarUri) {
      Alert.alert("Error", "Please add a profile photo of yourself.");
      return;
    }

    setLoading(true);
    try {
      const avatarUrl = await uploadAvatar(avatarUri, session!.user.id);
      const { error: profileError } = await supabase.from("users").upsert(
        {
          id: session!.user.id,
          email: session!.user.email!,
          name:
            (session!.user.user_metadata?.name as string | undefined) ??
            session!.user.email!.split("@")[0],
          avatar_url: avatarUrl,
        },
        { onConflict: "id" }
      );
      if (profileError) throw profileError;

      const uploadedUrls: string[] = [];
      for (const photoUri of photos) {
        const url = await uploadPetPhoto(photoUri);
        uploadedUrls.push(url);
      }

      const { error } = await supabase.from("pets").insert({
        owner_id: session!.user.id,
        name: name.trim(),
        type,
        breed: getFinalBreed(),
        age: age === "<1" ? 0 : age === "10+" ? 10 : Number(age),
        size,
        gender,
        bio: bio.trim() || null,
        photos: uploadedUrls,
        tags: selectedTags,
        prompts: prompts.filter((p) => p.answer.trim()),
      });

      if (error) throw error;

      await refreshPets();
      requestLocation().catch(() => {});

      router.replace("/(app)/(tabs)/swipe");
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to create pet profile."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1, backgroundColor: "white" }}
      contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      bottomOffset={24}
    >
      <View className="px-6 pt-16 pb-4">
        <Text className="text-3xl font-bold text-gray-900">Add Your Pet</Text>
        <Text className="text-base text-gray-500 mt-2">
          Tell us about your furry friend to start finding playmates!
        </Text>
      </View>

      {/* Photos */}
      <View className="px-6 py-4">
        <Text className="text-sm font-medium text-gray-700 mb-3">Photos</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 12, paddingTop: 8, paddingRight: 8 }}
          style={{ overflow: "visible" }}
        >
          {photos.map((uri, index) => (
            <View
              key={index}
              className="relative"
              style={{ overflow: "visible" }}
            >
              <Image
                source={{ uri }}
                style={{ width: 96, height: 96, borderRadius: 12 }}
                contentFit="cover"
                cachePolicy="none"
              />
              <Pressable
                onPress={() => removePhoto(index)}
                className="absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 items-center justify-center"
              >
                <Ionicons name="close" size={14} color="white" />
              </Pressable>
            </View>
          ))}
          {photos.length < MAX_PET_PHOTOS && (
            <Pressable
              onPress={pickImage}
              className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 items-center justify-center bg-gray-50"
            >
              <Ionicons name="camera" size={28} color="#A8A49C" />
              <Text className="text-xs text-gray-400 mt-1">Add</Text>
            </Pressable>
          )}
        </ScrollView>
      </View>

      <View className="px-6 gap-5">
        {/* Name */}
        <Input
          label="Pet Name"
          placeholder="What's their name?"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />

        {/* Type */}
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Pet Type
          </Text>
          <View className="flex-row gap-3">
            {PET_TYPES.map((petType) => (
              <Pressable
                key={petType}
                onPress={() => handleTypeChange(petType)}
                className={`flex-1 py-3 rounded-xl items-center border-2 ${
                  type === petType
                    ? "border-primary-500 bg-primary-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <Text className="text-2xl">
                  {petType === "DOG" ? "🐕" : "🐈"}
                </Text>
                <Text
                  className={`text-sm font-medium mt-1 ${
                    type === petType ? "text-primary-600" : "text-gray-600"
                  }`}
                >
                  {petType === "DOG" ? "Dog" : "Cat"}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Breed */}
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-2">Breed</Text>
          <View className="flex-row flex-wrap gap-2">
            {breeds.map((b) => (
              <Pressable
                key={b}
                onPress={() => setBreed(b)}
                className={`py-2 px-3 rounded-full border ${
                  breed === b
                    ? "border-primary-500 bg-primary-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <Text
                  className={`text-sm ${
                    breed === b
                      ? "text-primary-600 font-medium"
                      : "text-gray-600"
                  }`}
                >
                  {b}
                </Text>
              </Pressable>
            ))}
          </View>
          {(breed === "Other" || breed === "Mixed") && (
            <TextInput
              className="mt-3 border border-gray-200 rounded-xl px-4 text-gray-900"
              style={{ fontSize: 16, minHeight: 48 }}
              placeholder={
                breed === "Mixed" ? "e.g. Lab/Poodle" : "Enter breed"
              }
              value={customBreed}
              onChangeText={setCustomBreed}
              autoCapitalize="words"
              returnKeyType="done"
              submitBehavior="blurAndSubmit"
            />
          )}
        </View>

        {/* Age */}
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-2">Age</Text>
          <View className="flex-row flex-wrap gap-2">
            {PET_AGE_OPTIONS.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => setAge(option.value)}
                className={`py-2 px-3 rounded-full border ${
                  age === option.value
                    ? "border-primary-500 bg-primary-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <Text
                  className={`text-sm ${
                    age === option.value
                      ? "text-primary-600 font-medium"
                      : "text-gray-600"
                  }`}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Gender */}
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-2">Gender</Text>
          <View className="flex-row flex-wrap gap-2">
            {PET_GENDERS.map((g) => (
              <Pressable
                key={g}
                onPress={() => setGender(g)}
                className={`py-2 px-3 rounded-full border ${
                  gender === g
                    ? "border-primary-500 bg-primary-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <Text
                  className={`text-sm ${
                    gender === g
                      ? "text-primary-600 font-medium"
                      : "text-gray-600"
                  }`}
                >
                  {PET_GENDER_LABELS[g]}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Size */}
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-2">Size</Text>
          <View className="gap-2">
            {PET_SIZES.map((petSize) => (
              <Pressable
                key={petSize}
                onPress={() => setSize(petSize)}
                className={`py-3 px-4 rounded-xl border-2 ${
                  size === petSize
                    ? "border-primary-500 bg-primary-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    size === petSize ? "text-primary-600" : "text-gray-600"
                  }`}
                >
                  {PET_SIZE_LABELS[petSize]}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Bio */}
        <Input
          label="Bio (optional)"
          placeholder={`Tell us about ${
            name.trim() ? `${name.trim()}'s` : "your pet's"
          } personality...`}
          value={bio}
          onChangeText={setBio}
          multiline
          numberOfLines={3}
          className="min-h-[80px] text-top"
        />

        {/* Temperament Tags */}
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Temperament Tags
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {TEMPERAMENT_TAGS.map((tag) => (
              <Pressable
                key={tag}
                onPress={() => toggleTag(tag)}
                className={`py-2 px-3 rounded-full border ${
                  selectedTags.includes(tag)
                    ? "border-primary-500 bg-primary-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <Text
                  className={`text-sm ${
                    selectedTags.includes(tag)
                      ? "text-primary-600 font-medium"
                      : "text-gray-600"
                  }`}
                >
                  {tag}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Pet Prompts */}
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1">
            Pet Prompts (optional)
          </Text>
          <Text className="text-xs text-gray-400 mb-3">
            Pick up to {MAX_PET_PROMPTS} to show off your pet's personality
          </Text>
          <View className="gap-3">
            {PET_PROMPTS.map((question) => {
              const selected = prompts.find((p) => p.question === question);
              return (
                <View key={question}>
                  <Pressable
                    onPress={() => togglePrompt(question)}
                    className={`py-3 px-4 rounded-xl border-2 ${
                      selected
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        selected ? "text-primary-600" : "text-gray-600"
                      }`}
                    >
                      {question}
                    </Text>
                  </Pressable>
                  {selected && (
                    <TextInput
                      className="mt-2 border border-gray-200 rounded-xl px-4 text-gray-900"
                      style={{ fontSize: 16, minHeight: 48 }}
                      placeholder="Write your answer..."
                      value={selected.answer}
                      onChangeText={(text) =>
                        updatePromptAnswer(question, text)
                      }
                      autoCapitalize="sentences"
                      returnKeyType="done"
                      submitBehavior="blurAndSubmit"
                    />
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Owner Profile Photo */}
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Your Profile Photo
          </Text>
          <Text className="text-xs text-gray-400 mb-3">
            Required for safety - helps other owners verify who they're meeting.
          </Text>
          <Pressable onPress={pickAvatar} className="items-center">
            {avatarUri ? (
              <View className="relative">
                <Image
                  source={{ uri: avatarUri }}
                  style={{ width: 112, height: 112, borderRadius: 56 }}
                  contentFit="cover"
                  cachePolicy="none"
                />
                <View className="absolute bottom-0 right-0 bg-primary-500 rounded-full w-8 h-8 items-center justify-center">
                  <Ionicons name="camera" size={16} color="white" />
                </View>
              </View>
            ) : (
              <View className="w-28 h-28 rounded-full border-2 border-dashed border-gray-300 items-center justify-center bg-gray-50">
                <Ionicons name="person" size={32} color="#A8A49C" />
                <Text className="text-xs text-gray-400 mt-1">Add photo</Text>
              </View>
            )}
          </Pressable>
        </View>

        {/* Submit */}
        <Button
          title="Create Pet Profile"
          onPress={handleSubmit}
          loading={loading}
          className="mt-4"
        />
      </View>
    </KeyboardAwareScrollView>
  );
}
