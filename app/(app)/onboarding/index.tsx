import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { uploadPetPhoto } from "@/lib/s3";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  PET_TYPES,
  PET_SIZES,
  PET_SIZE_LABELS,
  TEMPERAMENT_TAGS,
  MAX_PET_PHOTOS,
} from "@/constants";
import type { PetType, PetSize } from "@/types/database";

export default function OnboardingScreen() {
  const { session } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [type, setType] = useState<PetType>("DOG");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState("");
  const [size, setSize] = useState<PetSize>("MEDIUM");
  const [bio, setBio] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const pickImage = async () => {
    if (photos.length >= MAX_PET_PHOTOS) {
      Alert.alert("Limit Reached", `You can add up to ${MAX_PET_PHOTOS} photos.`);
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

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter your pet's name.");
      return;
    }

    if (!age || isNaN(Number(age)) || Number(age) < 0) {
      Alert.alert("Error", "Please enter a valid age in months.");
      return;
    }

    if (photos.length === 0) {
      Alert.alert("Error", "Please add at least one photo of your pet.");
      return;
    }

    setLoading(true);
    try {
      const uploadedUrls: string[] = [];
      for (const photoUri of photos) {
        const url = await uploadPetPhoto(photoUri);
        uploadedUrls.push(url);
      }

      const { error } = await supabase.from("pets").insert({
        owner_id: session!.user.id,
        name: name.trim(),
        type,
        breed: breed.trim() || null,
        age: Number(age),
        size,
        bio: bio.trim() || null,
        photos: uploadedUrls,
        tags: selectedTags,
      });

      if (error) throw error;

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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="px-6 pt-16 pb-4">
          <Text className="text-3xl font-bold text-gray-900">
            Add Your Pet
          </Text>
          <Text className="text-base text-gray-500 mt-2">
            Tell us about your furry friend to start finding playmates!
          </Text>
        </View>

        {/* Photos */}
        <View className="px-6 py-4">
          <Text className="text-sm font-medium text-gray-700 mb-3">
            Photos
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12 }}
          >
            {photos.map((uri, index) => (
              <View key={index} className="relative">
                <Image
                  source={{ uri }}
                  className="w-24 h-24 rounded-xl"
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
                <Ionicons name="camera" size={28} color="#9CA3AF" />
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
                  onPress={() => setType(petType)}
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
          <Input
            label="Breed (optional)"
            placeholder="e.g. Golden Retriever"
            value={breed}
            onChangeText={setBreed}
            autoCapitalize="words"
          />

          {/* Age */}
          <Input
            label="Age (months)"
            placeholder="e.g. 24"
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
          />

          {/* Size */}
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Size
            </Text>
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
            placeholder="Tell us about your pet's personality..."
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

          {/* Submit */}
          <Button
            title="Create Pet Profile"
            onPress={handleSubmit}
            loading={loading}
            className="mt-4"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
