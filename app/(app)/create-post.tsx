import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/hooks/useAuth";
import { useActivePet } from "@/contexts/ActivePetContext";
import { useUserLocation } from "@/hooks/useUserLocation";
import { useUnsavedChangesWarning } from "@/hooks/useUnsavedChangesWarning";
import { supabase } from "@/lib/supabase";
import { uploadPostImage } from "@/lib/storage";
import { PetAuthorPicker } from "@/components/feed/PetAuthorPicker";
import {
  POST_TYPE_LABELS,
  POST_TYPE_COLORS,
  MAX_POST_IMAGES,
} from "@/constants";
import type { PostType, Pet } from "@/types/database";

const POST_TYPE_OPTIONS: { label: string; value: PostType }[] = [
  { label: "General", value: "GENERAL" },
  { label: "Lost Pet", value: "LOST_PET" },
  { label: "Event", value: "EVENT" },
  { label: "Photo", value: "PHOTO" },
];

const PLACEHOLDERS: Record<PostType, string> = {
  GENERAL: "What's happening in the neighborhood?",
  LOST_PET: "Describe the lost pet, last seen location, contact info...",
  EVENT: "What's the event? When and where?",
  PHOTO: "Say something about this photo...",
};

export default function CreatePostScreen() {
  const { session } = useAuth();
  const { activePet, allPets } = useActivePet();
  const { latitude, longitude } = useUserLocation();
  const router = useRouter();

  const [selectedPet, setSelectedPet] = useState<Pet | null>(activePet);
  const [petPickerVisible, setPetPickerVisible] = useState(false);
  const [postType, setPostType] = useState<PostType>("GENERAL");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const hasUnsavedChanges =
    !justSaved && !loading && (content.trim().length > 0 || images.length > 0);

  useUnsavedChangesWarning(hasUnsavedChanges);

  const petPhoto = selectedPet?.photos?.[0];

  const pickImage = async () => {
    if (images.length >= MAX_POST_IMAGES) {
      Alert.alert("Limit Reached", `You can add up to ${MAX_POST_IMAGES} photos.`);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImages((prev) => [...prev, result.assets[0].uri]);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      Alert.alert("Error", "Please write something for your post.");
      return;
    }

    if (!session?.user || !selectedPet) return;

    setLoading(true);
    try {
      // Upload images
      const uploadedUrls: string[] = [];
      for (const uri of images) {
        const url = await uploadPostImage(uri);
        uploadedUrls.push(url);
      }

      const { error } = await supabase.from("posts").insert({
        author_id: session.user.id,
        pet_id: selectedPet.id,
        content: content.trim(),
        images: uploadedUrls,
        type: postType,
        location:
          latitude && longitude
            ? `SRID=4326;POINT(${longitude} ${latitude})`
            : null,
      });

      if (error) throw error;

      setJustSaved(true);
      router.back();
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to create post."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-white"
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-16 pb-3 border-b border-gray-100">
        <Pressable onPress={() => router.back()} className="py-1">
          <Text className="text-base text-gray-500">Cancel</Text>
        </Pressable>
        <Text className="text-base font-bold text-gray-900">New Post</Text>
        <Pressable
          onPress={handleSubmit}
          disabled={loading || !content.trim()}
          className={`py-1.5 px-4 rounded-full ${
            loading || !content.trim() ? "bg-primary-200" : "bg-primary-500"
          }`}
        >
          <Text className="text-sm font-semibold text-white">
            {loading ? "Posting..." : "Post"}
          </Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Posting as */}
        <Pressable
          onPress={() => allPets.length > 1 && setPetPickerVisible(true)}
          className="flex-row items-center px-4 py-3 border-b border-gray-100"
        >
          {petPhoto ? (
            <Image
              source={{ uri: petPhoto }}
              style={{ width: 36, height: 36, borderRadius: 18 }}
              contentFit="cover"
              transition={150}
              cachePolicy="memory-disk"
            />
          ) : (
            <View className="w-9 h-9 rounded-full bg-primary-100 items-center justify-center">
              <Ionicons name="paw" size={16} color="#5A8A4F" />
            </View>
          )}
          <View className="ml-3 flex-1">
            <Text className="text-sm text-gray-400">Posting as</Text>
            <Text className="text-base font-semibold text-gray-900">
              {selectedPet?.name ?? "Select pet"}
            </Text>
          </View>
          {allPets.length > 1 && (
            <Ionicons name="chevron-down" size={18} color="#A8A49C" />
          )}
        </Pressable>

        {/* Post type pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 8 }}
        >
          {POST_TYPE_OPTIONS.map((option) => {
            const isActive = postType === option.value;
            const color = POST_TYPE_COLORS[option.value];
            return (
              <Pressable
                key={option.value}
                onPress={() => setPostType(option.value)}
                className={`px-4 py-2 rounded-full border ${
                  isActive
                    ? "border-primary-500 bg-primary-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    isActive ? "text-primary-600" : "text-gray-600"
                  }`}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Content input */}
        <View className="px-4">
          <TextInput
            className="text-base text-gray-900 leading-6"
            style={{ fontSize: 16, minHeight: 120 }}
            placeholder={PLACEHOLDERS[postType]}
            placeholderTextColor="#A8A49C"
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
            autoFocus
          />
        </View>

        {/* Image preview */}
        {images.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 12, paddingTop: 12 }}
            style={{ overflow: "visible" }}
          >
            {images.map((uri, index) => (
              <View key={index} className="relative" style={{ overflow: "visible" }}>
                <Image
                  source={{ uri }}
                  style={{ width: 96, height: 96, borderRadius: 12 }}
                  contentFit="cover"
                  transition={150}
                  cachePolicy="memory-disk"
                />
                <Pressable
                  onPress={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 items-center justify-center"
                >
                  <Ionicons name="close" size={14} color="white" />
                </Pressable>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Add photo button */}
        {images.length < MAX_POST_IMAGES && (
          <Pressable
            onPress={pickImage}
            className="flex-row items-center gap-2 px-4 py-3 mt-4 mx-4 rounded-xl border border-gray-200 active:bg-gray-50"
          >
            <Ionicons name="camera-outline" size={20} color="#A8A49C" />
            <Text className="text-sm text-gray-500">Add Photo</Text>
          </Pressable>
        )}
      </ScrollView>

      {/* Pet author picker */}
      <PetAuthorPicker
        visible={petPickerVisible}
        pets={allPets}
        selectedPetId={selectedPet?.id ?? ""}
        onSelect={setSelectedPet}
        onClose={() => setPetPickerVisible(false)}
      />
    </KeyboardAvoidingView>
  );
}
