import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  Image,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useActivePet } from "@/contexts/ActivePetContext";
import type { Pet } from "@/types/database";

export function PetSwitcher() {
  const { activePet, allPets, switchPet } = useActivePet();
  const [visible, setVisible] = useState(false);
  const router = useRouter();

  if (!activePet) return null;

  const photo = activePet.photos?.[0];

  const handleSelect = (pet: Pet) => {
    switchPet(pet.id);
    setVisible(false);
  };

  const handleAddPet = () => {
    setVisible(false);
    router.push("/(app)/add-pet");
  };

  return (
    <>
      {/* Trigger button */}
      <Pressable
        onPress={() => setVisible(true)}
        className="flex-row items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 active:bg-gray-100"
      >
        {photo ? (
          <Image
            source={{ uri: photo }}
            style={{ width: 28, height: 28, borderRadius: 14 }}
          />
        ) : (
          <View className="w-7 h-7 rounded-full bg-primary-100 items-center justify-center">
            <Ionicons name="paw" size={14} color="#5A8A4F" />
          </View>
        )}
        <Text className="text-sm font-semibold text-gray-900">
          {activePet.name}
        </Text>
        <Ionicons name="chevron-down" size={14} color="#A8A49C" />
      </Pressable>

      {/* Switcher modal */}
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable
          className="flex-1 bg-black/40 justify-end"
          onPress={() => setVisible(false)}
        >
          <Pressable
            className="bg-white rounded-t-3xl pb-10"
            onPress={() => {}}
          >
            {/* Handle bar */}
            <View className="items-center pt-3 pb-4">
              <View className="w-10 h-1 bg-gray-300 rounded-full" />
            </View>

            <Text className="text-base font-bold text-gray-900 px-6 pb-3">
              Switch Pet
            </Text>

            {/* Pet list */}
            <FlatList
              data={allPets}
              keyExtractor={(item) => item.id}
              scrollEnabled={allPets.length > 5}
              style={{ maxHeight: 300 }}
              renderItem={({ item }) => {
                const isActive = item.id === activePet.id;
                const petPhoto = item.photos?.[0];

                return (
                  <Pressable
                    onPress={() => handleSelect(item)}
                    className={`flex-row items-center px-6 py-3 ${
                      isActive ? "bg-primary-50" : "active:bg-gray-50"
                    }`}
                  >
                    {petPhoto ? (
                      <Image
                        source={{ uri: petPhoto }}
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
                      <Text className="text-sm text-gray-500">
                        {item.breed}
                      </Text>
                    </View>
                    {isActive && (
                      <Ionicons name="checkmark-circle" size={22} color="#5A8A4F" />
                    )}
                  </Pressable>
                );
              }}
            />

            {/* Add New Pet */}
            <Pressable
              onPress={handleAddPet}
              className="flex-row items-center px-6 py-3 border-t border-gray-100 active:bg-gray-50"
            >
              <View className="w-11 h-11 rounded-full bg-gray-100 items-center justify-center">
                <Ionicons name="add" size={24} color="#5C584F" />
              </View>
              <Text className="text-base font-medium text-gray-700 ml-3">
                Add New Pet
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
