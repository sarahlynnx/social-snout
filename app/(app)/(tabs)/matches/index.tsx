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
import { useRouter } from "expo-router";
import { useMatches } from "@/hooks/useMatches";
import type { MatchWithMessages } from "@/types/database";

export default function MatchesScreen() {
  const router = useRouter();
  const { matches, loading, refresh } = useMatches();

  const renderMatch = ({ item }: { item: MatchWithMessages }) => {
    const timeAgo = item.last_message_at
      ? getTimeAgo(new Date(item.last_message_at))
      : getTimeAgo(new Date(item.created_at));
    const hasUnread = item.unread_count > 0;

    return (
      <Pressable
        className="flex-row items-center px-6 py-4 bg-white active:bg-gray-50"
        onPress={() => router.push(`/(app)/chat/${item.id}`)}
      >
        {/* Pet photo */}
        {item.pet_photo ? (
          <Image
            source={{ uri: item.pet_photo }}
            className="w-14 h-14 rounded-full"
          />
        ) : (
          <View className="w-14 h-14 rounded-full bg-gray-200 items-center justify-center">
            <Ionicons name="paw" size={22} color="#D1D5DB" />
          </View>
        )}

        {/* Info */}
        <View className="flex-1 ml-4">
          <Text
            className={`text-base font-semibold ${
              hasUnread ? "text-gray-900" : "text-gray-900"
            }`}
          >
            {item.pet_name}
          </Text>
          <Text
            className={`text-sm mt-0.5 ${
              hasUnread ? "text-gray-900 font-medium" : "text-gray-500"
            }`}
            numberOfLines={1}
          >
            {item.last_message_content ?? "New match! Say hi 👋"}
          </Text>
        </View>

        {/* Time + unread badge */}
        <View className="items-end gap-1.5">
          <Text className="text-xs text-gray-400">{timeAgo}</Text>
          {hasUnread && (
            <View className="bg-primary-500 rounded-full min-w-[20px] h-5 items-center justify-center px-1.5">
              <Text className="text-xs font-bold text-white">
                {item.unread_count}
              </Text>
            </View>
          )}
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
      {/* Header */}
      <View className="px-6 pt-4 pb-2">
        <Text className="text-2xl font-bold text-gray-900">Matches</Text>
      </View>

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
          <Ionicons name="chatbubble-outline" size={64} color="#D1D5DB" />
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
