import { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  Share,
  ActivityIndicator,
  Dimensions,
  Keyboard,
} from "react-native";
import {
  KeyboardAvoidingView,
  useKeyboardState,
} from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/hooks/useAuth";
import { useActivePet } from "@/contexts/ActivePetContext";
import { usePost } from "@/hooks/usePost";
import { useComments } from "@/hooks/useComments";
import { useReactions } from "@/hooks/useReactions";
import { ReactionPicker } from "@/components/feed/ReactionPicker";
import { CommentThread } from "@/components/feed/CommentThread";
import { CommentInput } from "@/components/feed/CommentInput";
import {
  POST_TYPE_LABELS,
  POST_TYPE_COLORS,
  REACTION_EMOJIS,
} from "@/constants";
import type { ReactionType } from "@/types/database";

const screenWidth = Dimensions.get("window").width;

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

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session } = useAuth();
  const { activePet } = useActivePet();
  const { post, loading: postLoading, refresh: refreshPost } = usePost(id);
  const {
    comments,
    loading: commentsLoading,
    addComment,
    toggleCommentReaction,
  } = useComments(id);
  const { toggleReaction } = useReactions(refreshPost);

  const [replyingTo, setReplyingTo] = useState<{
    commentId: string;
    petName: string;
  } | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const scrollRef = useRef<any>(null);
  const commentRefs = useRef<Record<string, View | null>>({});

  const registerCommentRef = useCallback((id: string, ref: View | null) => {
    if (ref) commentRefs.current[id] = ref;
    else delete commentRefs.current[id];
  }, []);

  const keyboardVisible = useKeyboardState((s) => s.isVisible);

  const handleReply = useCallback((commentId: string, petName: string) => {
    setReplyingTo({ commentId, petName });
  }, []);

  // When a reply starts and the keyboard opens, scroll the replied-to comment
  // so it sits just above the input (otherwise a comment high in a long thread
  // stays hidden behind the keyboard/input).
  useEffect(() => {
    if (!keyboardVisible || !replyingTo) return;
    const commentView = commentRefs.current[replyingTo.commentId];
    const scrollNode = scrollRef.current;
    if (!commentView || !scrollNode) return;

    // measureLayout gives the comment's Y within the scroll content; scroll so
    // the comment's top sits a little below the top of the visible area.
    (commentView as any).measureLayout(
      scrollNode,
      (_x: number, y: number) => {
        scrollNode.scrollTo({ y: Math.max(0, y - 80), animated: true });
      },
      () => {}
    );
  }, [keyboardVisible, replyingTo]);

  if (postLoading || !post) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#5A8A4F" />
      </View>
    );
  }

  const petPhoto = post.pet?.photos?.[0];
  const petName = post.pet?.name ?? post.author.name;
  const petBreed = post.pet?.breed;
  const timeAgo = getTimeAgo(new Date(post.created_at));
  const typeColor = POST_TYPE_COLORS[post.type];
  const typeLabel = POST_TYPE_LABELS[post.type];
  const commentCount = post.comments?.[0]?.count ?? 0;
  const imageWidth = screenWidth - 48;

  const myReaction = post.reactions.find(
    (r) => r.user_id === session?.user?.id
  );
  const totalReactions = post.reactions.length;

  const reactionCounts: Partial<Record<ReactionType, number>> = {};
  for (const r of post.reactions) {
    reactionCounts[r.type] = (reactionCounts[r.type] ?? 0) + 1;
  }
  const reactionSummary = Object.entries(reactionCounts) as [
    ReactionType,
    number
  ][];

  const handleReact = (type: ReactionType) => {
    if (!session?.user) return;
    toggleReaction(post.id, session.user.id, type);
  };

  const handleAddComment = async (
    content: string,
    parentCommentId?: string
  ) => {
    if (!session?.user || !activePet) return false;
    return addComment(content, session.user.id, activePet.id, parentCommentId);
  };

  return (
    <View className="flex-1 bg-white">
      {/* Comments scroll + pinned input share one KeyboardAvoidingView so the
          input stays pinned above the keyboard. */}
      <KeyboardAvoidingView
        behavior="padding"
        keyboardVerticalOffset={0}
        className="flex-1"
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{ paddingBottom: 20 }}
          scrollEnabled={!pickerVisible}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
        {/* Post content */}
        <View className="px-6 pt-16">
          <View className="flex-row items-center">
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
              <View className="flex-row items-center gap-2">
                <Text className="text-base font-semibold text-gray-900">
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
          </View>

          <Text className="text-base text-gray-800 mt-4 leading-6">
            {post.content}
          </Text>

          {/* Images */}
          {post.images.length > 0 && (
            <View className="mt-4 gap-2">
              {post.images.map((uri, i) => (
                <Image
                  key={i}
                  source={{ uri }}
                  style={{
                    width: imageWidth,
                    height: imageWidth,
                    borderRadius: 12,
                  }}
                />
              ))}
            </View>
          )}

          {/* Action row: Like / Comment / Share */}
          <View
            className="mt-4 border-t border-b border-gray-100"
            style={{
              position: "relative",
              flexDirection: "row",
              justifyContent: "space-between",
              paddingVertical: 10,
            }}
          >
            <Pressable
              onPress={() => {
                if (myReaction) {
                  handleReact(myReaction.type);
                } else {
                  handleReact("HEART");
                }
              }}
              onLongPress={() => setPickerVisible(true)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
              }}
            >
              {myReaction ? (
                <Image
                  source={
                    REACTION_EMOJIS[myReaction.type]?.image ??
                    REACTION_EMOJIS.HEART.image
                  }
                  style={{ width: 20, height: 20 }}
                />
              ) : (
                <Ionicons name="heart-outline" size={20} color="#5C584F" />
              )}
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: myReaction
                    ? REACTION_EMOJIS[myReaction.type]?.color ?? "#EF4444"
                    : "#5C584F",
                }}
              >
                Like
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {}}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Ionicons name="chatbubble-outline" size={20} color="#5C584F" />
              <Text
                style={{ fontSize: 13, fontWeight: "600", color: "#5C584F" }}
              >
                Comment
              </Text>
            </Pressable>

            <Pressable
              onPress={async () => {
                try {
                  await Share.share({
                    message: "Check out this post on SocialSnout!",
                  });
                } catch {}
              }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Ionicons name="arrow-redo-outline" size={20} color="#5C584F" />
              <Text
                style={{ fontSize: 13, fontWeight: "600", color: "#5C584F" }}
              >
                Share
              </Text>
            </Pressable>

            <ReactionPicker
              visible={pickerVisible}
              currentReaction={myReaction?.type}
              onSelect={handleReact}
              onClose={() => setPickerVisible(false)}
            />
          </View>

          {/* Reaction summary */}
          {(totalReactions > 0 || commentCount > 0) && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: 12,
              }}
            >
              {totalReactions > 0 ? (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  {/* Overlapping reaction icons */}
                  <View style={{ flexDirection: "row", marginRight: 6 }}>
                    {reactionSummary.map(([type], index) => {
                      const reaction = REACTION_EMOJIS[type];
                      if (!reaction) return null;
                      return (
                        <View
                          key={type}
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: 11,
                            backgroundColor: "#fff",
                            borderWidth: 1.5,
                            borderColor: "#fff",
                            alignItems: "center",
                            justifyContent: "center",
                            marginLeft: index > 0 ? -6 : 0,
                            zIndex: reactionSummary.length - index,
                          }}
                        >
                          <Image
                            source={reaction.image}
                            style={{ width: 14, height: 14 }}
                          />
                        </View>
                      );
                    })}
                  </View>
                  <Text style={{ fontSize: 13, color: "#5C584F" }}>
                    {totalReactions}{" "}
                    {totalReactions === 1 ? "reaction" : "reactions"}
                  </Text>
                </View>
              ) : (
                <View />
              )}
              {commentCount > 0 && (
                <Text style={{ fontSize: 13, color: "#5C584F" }}>
                  {commentCount} {commentCount === 1 ? "comment" : "comments"}
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Comments */}
        <View className="px-6 mt-4">
          {commentsLoading ? (
            <ActivityIndicator
              size="small"
              color="#5A8A4F"
              style={{ marginTop: 16 }}
            />
          ) : comments.length > 0 ? (
            <CommentThread
              comments={comments}
              currentUserId={session?.user?.id}
              onReply={handleReply}
              onReact={(commentId, type) => {
                if (!session?.user) return;
                toggleCommentReaction(commentId, session.user.id, type);
              }}
              registerRef={registerCommentRef}
            />
          ) : (
            <Text className="text-sm text-gray-400 mt-3">
              No comments yet. Be the first!
            </Text>
          )}
        </View>
        </ScrollView>

        {/* Pinned comment input — always visible at the bottom, lifts with the
            keyboard via the KeyboardAvoidingView. */}
        <CommentInput
          activePet={activePet}
          replyingTo={replyingTo}
          onCancelReply={() => {
            setReplyingTo(null);
            Keyboard.dismiss();
          }}
          onSubmit={handleAddComment}
        />
      </KeyboardAvoidingView>
    </View>
  );
}
