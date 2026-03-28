import {
  View,
  Text,
  FlatList,
  Pressable,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Avatar } from "@/components/ui/Avatar";
import { useMatches } from "@/hooks/useMatches";
import type { MatchWithProfiles } from "@/types/database";

export default function MatchesScreen() {
  const { matches, loading, refresh } = useMatches();

  const renderMatch = ({ item }: { item: MatchWithProfiles }) => {
    const photo = item.pet.photos[0];
    const matchDate = new Date(item.created_at);
    const timeAgo = getTimeAgo(matchDate);

    return (
      <Pressable
        className="flex-row items-center px-6 py-4 bg-white active:bg-gray-50"
        onPress={() => {
          // Chat navigation — Phase 4
        }}
      >
        {/* Pet photo */}
        {photo ? (
          <Image
            source={{ uri: photo }}
            className="w-16 h-16 rounded-full"
          />
        ) : (
          <View className="w-16 h-16 rounded-full bg-gray-200 items-center justify-center">
            <Ionicons name="paw" size={24} color="#D1D5DB" />
          </View>
        )}

        {/* Info */}
        <View className="flex-1 ml-4">
          <Text className="text-base font-semibold text-gray-900">
            {item.pet.name}
          </Text>
          <View className="flex-row items-center gap-2 mt-1">
            <Avatar
              uri={item.owner.avatar_url}
              name={item.owner.name}
              size="sm"
              className="w-5 h-5"
            />
            <Text className="text-sm text-gray-500">{item.owner.name}</Text>
          </View>
        </View>

        {/* Time + chevron */}
        <View className="items-end">
          <Text className="text-xs text-gray-400">{timeAgo}</Text>
          <Ionicons
            name="chevron-forward"
            size={20}
            color="#D1D5DB"
            style={{ marginTop: 4 }}
          />
        </View>
      </Pressable>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {matches.length > 0 ? (
        <FlatList
          data={matches}
          keyExtractor={(item) => item.id}
          renderItem={renderMatch}
          ItemSeparatorComponent={() => (
            <View className="h-px bg-gray-100 ml-24" />
          )}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={refresh}
              tintColor="#F97316"
            />
          }
        />
      ) : (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="heart-outline" size={64} color="#D1D5DB" />
          <Text className="text-xl font-bold text-gray-900 mt-4">
            No Matches Yet
          </Text>
          <Text className="text-base text-gray-500 mt-2 text-center">
            Keep swiping to find playmates for your pet!
          </Text>
        </View>
      )}
    </View>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}
