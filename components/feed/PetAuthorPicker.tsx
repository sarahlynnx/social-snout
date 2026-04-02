import { View, Text, Pressable, Image, Modal, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Pet } from "@/types/database";

interface PetAuthorPickerProps {
  visible: boolean;
  pets: Pet[];
  selectedPetId: string;
  onSelect: (pet: Pet) => void;
  onClose: () => void;
}

export function PetAuthorPicker({
  visible,
  pets,
  selectedPetId,
  onSelect,
  onClose,
}: PetAuthorPickerProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 bg-black/40 justify-end"
        onPress={onClose}
      >
        <Pressable className="bg-white rounded-t-3xl pb-10" onPress={() => {}}>
          <View className="items-center pt-3 pb-4">
            <View className="w-10 h-1 bg-gray-300 rounded-full" />
          </View>

          <Text className="text-base font-bold text-gray-900 px-6 pb-3">
            Post As
          </Text>

          <FlatList
            data={pets}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const isSelected = item.id === selectedPetId;
              const photo = item.photos?.[0];

              return (
                <Pressable
                  onPress={() => {
                    onSelect(item);
                    onClose();
                  }}
                  className={`flex-row items-center px-6 py-3 ${
                    isSelected ? "bg-primary-50" : "active:bg-gray-50"
                  }`}
                >
                  {photo ? (
                    <Image
                      source={{ uri: photo }}
                      style={{ width: 44, height: 44, borderRadius: 22 }}
                    />
                  ) : (
                    <View className="w-11 h-11 rounded-full bg-primary-100 items-center justify-center">
                      <Ionicons name="paw" size={20} color="#5A8A4F" />
                    </View>
                  )}
                  <View className="flex-1 ml-3">
                    <Text className="text-base font-semibold text-gray-900">
                      {item.name}
                    </Text>
                    <Text className="text-sm text-gray-500">{item.breed}</Text>
                  </View>
                  {isSelected && (
                    <Ionicons
                      name="checkmark-circle"
                      size={22}
                      color="#5A8A4F"
                    />
                  )}
                </Pressable>
              );
            }}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}
