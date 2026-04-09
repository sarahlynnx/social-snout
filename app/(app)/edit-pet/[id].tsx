import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";
import { uploadPetPhoto } from "@/lib/storage";
import { useUnsavedChangesWarning } from "@/hooks/useUnsavedChangesWarning";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  PET_TYPES,
  PET_SIZES,
  PET_SIZE_LABELS,
  PET_AGE_OPTIONS,
  DOG_BREEDS,
  CAT_BREEDS,
  TEMPERAMENT_TAGS,
  MAX_PET_PHOTOS,
  PET_PROMPTS,
  MAX_PET_PROMPTS,
} from "@/constants";
import type { PetType, PetSize, Pet, PetPrompt } from "@/types/database";

export default function EditPetScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();

  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const [name, setName] = useState("");
  const [type, setType] = useState<PetType>("DOG");
  const [breed, setBreed] = useState("");
  const [customBreed, setCustomBreed] = useState("");
  const [age, setAge] = useState("");
  const [size, setSize] = useState<PetSize>("MEDIUM");
  const [bio, setBio] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [prompts, setPrompts] = useState<PetPrompt[]>([]);

  const hasUnsavedChanges = useMemo(() => {
    if (!pet || justSaved || saving) return false;
    if (name !== pet.name) return true;
    if (type !== pet.type) return true;
    if (size !== pet.size) return true;
    if ((bio || "") !== (pet.bio || "")) return true;
    if (JSON.stringify(selectedTags) !== JSON.stringify(pet.tags)) return true;
    if (JSON.stringify(photos) !== JSON.stringify(pet.photos)) return true;
    const originalPrompts = Array.isArray(pet.prompts) ? pet.prompts : [];
    if (JSON.stringify(prompts) !== JSON.stringify(originalPrompts))
      return true;
    return false;
  }, [
    pet,
    justSaved,
    saving,
    name,
    type,
    size,
    bio,
    selectedTags,
    photos,
    prompts,
  ]);

  useUnsavedChangesWarning(hasUnsavedChanges);

  const breeds = type === "DOG" ? DOG_BREEDS : CAT_BREEDS;

  useEffect(() => {
    async function fetchPet() {
      const { data, error } = await supabase
        .from("pets")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        Alert.alert("Error", "Pet not found.");
        router.back();
        return;
      }

      setPet(data);
      setName(data.name);
      setType(data.type);
      setSize(data.size);
      setBio(data.bio || "");
      setSelectedTags(data.tags);
      setPhotos(data.photos);
      setPrompts(Array.isArray(data.prompts) ? data.prompts : []);

      if (data.age === 0) setAge("<1");
      else if (data.age >= 10) setAge("10+");
      else setAge(String(data.age));

      const breedList = data.type === "DOG" ? DOG_BREEDS : CAT_BREEDS;
      const savedBreed = data.breed || "";

      if (savedBreed.startsWith("Mixed — ")) {
        setBreed("Mixed");
        setCustomBreed(savedBreed.replace("Mixed — ", ""));
      } else if (savedBreed.startsWith("Other — ")) {
        setBreed("Other");
        setCustomBreed(savedBreed.replace("Other — ", ""));
      } else if (breedList.includes(savedBreed as any)) {
        setBreed(savedBreed);
      } else if (savedBreed) {
        setBreed("Other");
        setCustomBreed(savedBreed);
      }

      setLoading(false);
    }

    fetchPet();
  }, [id]);

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

  const handleSave = async () => {
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

    setSaving(true);
    try {
      const finalPhotos: string[] = [];
      for (const photo of photos) {
        if (photo.startsWith("http")) {
          finalPhotos.push(photo);
        } else {
          const url = await uploadPetPhoto(photo);
          finalPhotos.push(url);
        }
      }

      const { error } = await supabase
        .from("pets")
        .update({
          name: name.trim(),
          type,
          breed: getFinalBreed(),
          age: age === "<1" ? 0 : age === "10+" ? 10 : Number(age),
          size,
          bio: bio.trim() || null,
          photos: finalPhotos,
          tags: selectedTags,
          prompts: prompts.filter((p) => p.answer.trim()),
        })
        .eq("id", id);

      if (error) throw error;

      setJustSaved(true);
      router.back();
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to update pet profile."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#5A8A4F" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets
      >
        <View className="px-6 pt-16 pb-4">
          <Text className="text-3xl font-bold text-gray-900">Edit Pet</Text>
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
                  transition={150}
                  cachePolicy="memory-disk"
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
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Breed
            </Text>
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
              Pet Prompts
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

          {/* Save */}
          <Button
            title="Save Changes"
            onPress={handleSave}
            loading={saving}
            className="mt-4"
          />
        </View>
      </ScrollView>
    </View>
  );
}
