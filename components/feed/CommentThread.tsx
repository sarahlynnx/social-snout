import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { REACTION_EMOJIS } from "@/constants";
import { ReactionPicker } from "@/components/feed/ReactionPicker";
import type { CommentWithPet, ReactionType } from "@/types/database";

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

interface CommentItemProps {
  comment: CommentWithPet;
  isReply?: boolean;
  replyToName?: string;
  currentUserId?: string;
  onReply: (commentId: string, petName: string) => void;
  onReact: (commentId: string, type: ReactionType) => void;
  registerRef?: (commentId: string, ref: View | null) => void;
}

function CommentItem({
  comment,
  isReply,
  replyToName,
  currentUserId,
  onReply,
  onReact,
  registerRef,
}: CommentItemProps) {
  const [pickerVisible, setPickerVisible] = useState(false);

  const petPhoto = comment.pet?.photos?.[0];
  const petName = comment.pet?.name ?? comment.author.name;
  const timeAgo = getTimeAgo(new Date(comment.created_at));

  const reactions = comment.comment_reactions ?? [];
  const myReaction = reactions.find((r) => r.user_id === currentUserId);
  const totalReactions = reactions.length;

  const handleTap = () => {
    if (myReaction) {
      onReact(comment.id, myReaction.type);
    } else {
      onReact(comment.id, "HEART");
    }
  };

  return (
    <View
      className={isReply ? "ml-10 mt-3" : ""}
      ref={(ref) => registerRef?.(comment.id, ref)}
    >
      {/* Avatar + name + time on one line */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        {petPhoto ? (
          <Image
            source={{ uri: petPhoto }}
            style={{
              width: isReply ? 24 : 28,
              height: isReply ? 24 : 28,
              borderRadius: isReply ? 12 : 14,
            }}
            contentFit="cover"
            transition={150}
            cachePolicy="memory-disk"
          />
        ) : (
          <View
            className="bg-primary-100 items-center justify-center rounded-full"
            style={{
              width: isReply ? 24 : 28,
              height: isReply ? 24 : 28,
            }}
          >
            <Ionicons name="paw" size={isReply ? 10 : 12} color="#5A8A4F" />
          </View>
        )}
        <Text className="text-sm font-semibold text-gray-900">{petName}</Text>
        <Text className="text-xs text-gray-400">{timeAgo}</Text>
      </View>

      {/* Comment text — indented under the name */}
      <View style={{ marginLeft: isReply ? 32 : 36 }}>
        <Text className="text-sm text-gray-700 mt-1 leading-5">
          {replyToName && (
            <Text className="text-sm font-semibold text-primary-500">
              @{replyToName}{" "}
            </Text>
          )}
          {comment.content}
        </Text>

        {/* Actions: reaction + reply */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 16,
            marginTop: 4,
            position: "relative",
          }}
        >
          <Pressable
            onPress={handleTap}
            onLongPress={() => setPickerVisible(true)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 2,
              paddingVertical: 6,
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
              <Ionicons name="heart-outline" size={20} color="#A8A49C" />
            )}
            {totalReactions > 0 ? (
              <Text
                style={{
                  fontSize: 13,
                  color: myReaction ? "#EF4444" : "#A8A49C",
                  fontWeight: "500",
                }}
              >
                {totalReactions}
              </Text>
            ) : (
              <Text
                style={{ fontSize: 13, color: "#A8A49C", fontWeight: "500" }}
              >
                Like
              </Text>
            )}
          </Pressable>

          <Pressable
            testID="comment-reply"
            onPress={() => onReply(comment.id, petName)}
            hitSlop={{ top: 14, bottom: 14, left: 16, right: 16 }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 2,
              paddingVertical: 8,
              paddingRight: 8,
            }}
          >
            <Ionicons name="chatbubble-outline" size={16} color="#A8A49C" />
            <Text style={{ fontSize: 13, color: "#A8A49C", fontWeight: "500" }}>
              Reply
            </Text>
          </Pressable>

          <ReactionPicker
            visible={pickerVisible}
            currentReaction={myReaction?.type}
            onSelect={(type) => {
              onReact(comment.id, type);
            }}
            onClose={() => setPickerVisible(false)}
          />
        </View>
      </View>
    </View>
  );
}

function CommentWithReplies({
  comment,
  onReply,
  onReact,
  currentUserId,
  isLast,
  registerRef,
}: {
  comment: CommentWithPet;
  onReply: (commentId: string, petName: string) => void;
  onReact: (commentId: string, type: ReactionType) => void;
  currentUserId?: string;
  isLast: boolean;
  registerRef?: (commentId: string, ref: View | null) => void;
}) {
  const [showAll, setShowAll] = useState(false);
  const replies = comment.replies ?? [];
  const visibleReplies = showAll ? replies : replies.slice(0, 1);
  const hiddenCount = replies.length - (showAll ? 0 : 1);

  const nameById = new Map<string, string>();
  nameById.set(comment.id, comment.pet?.name ?? comment.author.name);
  for (const reply of replies) {
    nameById.set(reply.id, reply.pet?.name ?? reply.author.name);
  }

  return (
    <View
      style={{
        paddingVertical: 12,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: "#F5F4F0",
      }}
    >
      <CommentItem
        comment={comment}
        onReply={onReply}
        onReact={onReact}
        currentUserId={currentUserId}
        registerRef={registerRef}
      />

      {visibleReplies.map((reply) => {
        const replyToName =
          reply.parent_comment_id && reply.parent_comment_id !== comment.id
            ? nameById.get(reply.parent_comment_id)
            : undefined;

        return (
          <CommentItem
            key={reply.id}
            comment={reply}
            isReply
            replyToName={replyToName}
            onReply={onReply}
            onReact={onReact}
            currentUserId={currentUserId}
            registerRef={registerRef}
          />
        );
      })}

      {!showAll && hiddenCount > 0 && (
        <Pressable
          onPress={() => setShowAll(true)}
          style={{ marginLeft: 42, marginTop: 8 }}
        >
          <Text className="text-xs font-medium text-primary-500">
            See {hiddenCount} more {hiddenCount === 1 ? "reply" : "replies"}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

interface CommentThreadProps {
  comments: CommentWithPet[];
  currentUserId?: string;
  onReply: (commentId: string, petName: string) => void;
  onReact: (commentId: string, type: ReactionType) => void;
  registerRef?: (commentId: string, ref: View | null) => void;
}

export function CommentThread({
  comments,
  currentUserId,
  onReply,
  onReact,
  registerRef,
}: CommentThreadProps) {
  return (
    <View>
      {comments.map((comment, index) => (
        <CommentWithReplies
          key={comment.id}
          comment={comment}
          onReply={onReply}
          onReact={onReact}
          currentUserId={currentUserId}
          isLast={index === comments.length - 1}
          registerRef={registerRef}
        />
      ))}
    </View>
  );
}
