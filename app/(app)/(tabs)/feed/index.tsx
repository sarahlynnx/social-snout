import { View, Text, FlatList, ActivityIndicator, RefreshControl, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/hooks/useAuth";
import { useFeed } from "@/hooks/useFeed";
import { useReactions } from "@/hooks/useReactions";
import { PostCard } from "@/components/feed/PostCard";
import { PostTypeFilter } from "@/components/feed/PostTypeFilter";
import { LocationPrompt } from "@/components/ui/LocationPrompt";
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
    locationRequesting,
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

  if (locationLoading || locationRequesting) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#5A8A4F" />
        {locationRequesting && (
          <Text className="text-sm text-gray-500 mt-3">
            Finding posts in your area...
          </Text>
        )}
      </View>
    );
  }

  if (!hasLocation) {
    return (
      <View className="flex-1 bg-gray-50">
        <LocationPrompt
          onRequestLocation={requestLocation}
          description="We need your location to show posts from pets in your neighborhood."
        />
      </View>
    );
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#5A8A4F" />
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
        contentContainerStyle={{ paddingTop: 12, paddingBottom: 100, gap: 12 }}
        onEndReached={fetchMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor="#5A8A4F"
          />
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center px-6 pt-20">
            <Ionicons name="newspaper-outline" size={64} color="#D4D1CA" />
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
        className="w-14 h-14 rounded-full bg-primary-500 items-center justify-center"
        style={{
          position: "absolute",
          right: 24,
          bottom: 24,
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
