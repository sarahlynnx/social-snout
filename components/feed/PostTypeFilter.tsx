import { ScrollView, Pressable, Text } from "react-native";
import { POST_TYPE_LABELS } from "@/constants";
import type { PostType } from "@/types/database";

const FILTERS: { label: string; value: PostType | null }[] = [
  { label: "All", value: null },
  { label: "Lost Pets", value: "LOST_PET" },
  { label: "Events", value: "EVENT" },
  { label: "Photos", value: "PHOTO" },
  { label: "General", value: "GENERAL" },
];

interface PostTypeFilterProps {
  activeFilter: PostType | null;
  onFilterChange: (filter: PostType | null) => void;
}

export function PostTypeFilter({
  activeFilter,
  onFilterChange,
}: PostTypeFilterProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ flexGrow: 0 }}
      contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 8 }}
    >
      {FILTERS.map((filter) => {
        const isActive = activeFilter === filter.value;
        return (
          <Pressable
            key={filter.label}
            onPress={() => onFilterChange(filter.value)}
            className={`px-4 py-2 rounded-full ${
              isActive ? "bg-primary-500" : "bg-gray-100"
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                isActive ? "text-white" : "text-gray-600"
              }`}
            >
              {filter.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
