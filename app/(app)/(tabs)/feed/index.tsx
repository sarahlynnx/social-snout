import { View, Text, FlatList, ActivityIndicator, RefreshControl, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/hooks/useAuth";
import { useFeed } from "@/hooks/useFeed";
import { useReactions } from "@/hooks/useReactions";
import { PostCard } from "@/components/feed/PostCard";
import { PostTypeFilter } from "@/components/feed/PostTypeFilter";
import { LocationPrompt } from "@/components/feed/LocationPrompt";
import { ErrorState } from "@/components/ui/ErrorState";
import type { PostWithDetails, ReactionType } from "@/types/database";

export default function FeedScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const {
    posts,
    loading,
    error,
    refreshing,
    hasMore,
    hasLocation,
    locationLoading,
    requestLocation,
    activeFilter,
    setFilter,
    fetchMore,
    refresh,
  } = useFeed();

  const { toggleReaction } = useReactions(refresh);

  const handleReact = (postId: string, type: ReactionType) => {
    if (!session?.user) return;
    toggleReaction(postId, session.user.id, type);
  };

  if (locationLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  if (!hasLocation) {
    return (
      <View className="flex-1 bg-white">
        <LocationPrompt onRequestLocation={requestLocation} />
      </View>
    );
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-white">
        <ErrorState
          title="Couldn't load feed"
          message={error}
          onRetry={refresh}
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <PostTypeFilter activeFilter={activeFilter} onFilterChange={setFilter} />

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }: { item: PostWithDetails }) => (
          <PostCard
            post={item}
            onPress={() => router.push(`/(app)/post/${item.id}`)}
            onReact={(type) => handleReact(item.id, type)}
            currentUserId={session?.user?.id}
          />
        )}
        contentContainerStyle={{ paddingVertical: 12, gap: 12 }}
        onEndReached={fetchMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor="#F97316"
          />
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center px-6 pt-20">
            <Ionicons name="newspaper-outline" size={64} color="#D1D5DB" />
            <Text className="text-xl font-bold text-gray-900 mt-4">
              No Posts Yet
            </Text>
            <Text className="text-base text-gray-500 mt-2 text-center">
              {activeFilter
                ? "No posts matching this filter in your area."
                : "Be the first to post in your neighborhood!"}
            </Text>
          </View>
        }
      />

      {/* Floating Action Button */}
      <Pressable
        onPress={() => router.push("/(app)/create-post")}
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-primary-500 items-center justify-center"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
          elevation: 5,
        }}
      >
        <Ionicons name="add" size={28} color="white" />
      </Pressable>
    </View>
  );
}
