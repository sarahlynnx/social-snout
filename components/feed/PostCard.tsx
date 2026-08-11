import { View, Text, Pressable, Dimensions } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { POST_TYPE_LABELS, POST_TYPE_COLORS } from "@/constants";
import { ReactionBar } from "@/components/feed/ReactionBar";
import type { FeedPost, ReactionType } from "@/types/database";

const screenWidth = Dimensions.get("window").width;

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString();
}

interface PostCardProps {
  post: FeedPost;
  onPress: () => void;
  onReact: (type: ReactionType) => void;
}

export function PostCard({ post, onPress, onReact }: PostCardProps) {
  const petPhoto = post.pet?.photos?.[0];
  const petName = post.pet?.name ?? post.author.name;
  const petBreed = post.pet?.breed;
  const timeAgo = getTimeAgo(new Date(post.created_at));
  const typeColor = POST_TYPE_COLORS[post.type];
  const typeLabel = POST_TYPE_LABELS[post.type];
  const commentCount = post.comment_count;

  const imageCount = post.images.length;
  const imageWidth = screenWidth - 72;

  return (
    <View className="bg-white mx-4 rounded-2xl px-5 py-4">
      {/* Header */}
      <Pressable
        onPress={onPress}
        className="flex-row items-center active:opacity-70"
      >
        {petPhoto ? (
          <Image
            source={{ uri: petPhoto }}
            style={{ width: 40, height: 40, borderRadius: 20 }}
            contentFit="cover"
            transition={150}
            cachePolicy="memory-disk"
          />
        ) : (
          <View className="w-10 h-10 rounded-full bg-primary-100 items-center justify-center">
            <Ionicons name="paw" size={18} color="#5A8A4F" />
          </View>
        )}
        <View className="flex-1 ml-3">
          <View className="flex-row items-center gap-2">
            <Text className="text-sm font-semibold text-gray-900">
              {petName}
            </Text>
            {typeColor && (
              <View
                style={{ backgroundColor: typeColor + "15" }}
                className="px-2 py-0.5 rounded-full"
              >
                <Text
                  style={{ color: typeColor }}
                  className="text-xs font-medium"
                >
                  {typeLabel}
                </Text>
              </View>
            )}
          </View>
          {petBreed && (
            <Text className="text-xs text-gray-400">{petBreed}</Text>
          )}
        </View>
        <Text className="text-xs text-gray-400">{timeAgo}</Text>
      </Pressable>

      {/* Content: tappable to open post */}
      <Pressable onPress={onPress} className="active:opacity-70">
        <Text
          className="text-base text-gray-800 mt-3 leading-6"
          numberOfLines={5}
        >
          {post.content}
        </Text>

        {/* Images */}
        {imageCount > 0 && (
          <View className="mt-3 flex-row flex-wrap gap-2">
            {imageCount === 1 ? (
              <Image
                source={{ uri: post.images[0] }}
                style={{
                  width: imageWidth,
                  height: imageWidth,
                  borderRadius: 12,
                }}
                contentFit="cover"
                transition={150}
                cachePolicy="memory-disk"
              />
            ) : (
              post.images.slice(0, 4).map((uri, i) => (
                <Image
                  key={i}
                  source={{ uri }}
                  style={{
                    width: (imageWidth - 8) / 2,
                    height: (imageWidth - 8) / 2,
                    borderRadius: 12,
                  }}
                  contentFit="cover"
                  transition={150}
                  cachePolicy="memory-disk"
                />
              ))
            )}
          </View>
        )}
      </Pressable>

      {/* Reaction bar + comment count */}
      <View className="mt-3">
        <ReactionBar
          reactionCount={post.reaction_count}
          myReaction={post.my_reaction}
          commentCount={commentCount}
          onReact={onReact}
          onCommentPress={onPress}
        />
      </View>
    </View>
  );
}
