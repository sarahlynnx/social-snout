import { useState } from "react";
import { View, Text, Pressable, Share, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { REACTION_EMOJIS } from "@/constants";
import { ReactionPicker } from "@/components/feed/ReactionPicker";
import type { Reaction, ReactionType } from "@/types/database";

interface ReactionBarProps {
  reactions: Reaction[];
  currentUserId: string | undefined;
  commentCount: number;
  onReact: (type: ReactionType) => void;
  onCommentPress: () => void;
  onSharePress?: () => void;
}

export function ReactionBar({
  reactions,
  currentUserId,
  commentCount,
  onReact,
  onCommentPress,
  onSharePress,
}: ReactionBarProps) {
  const [pickerVisible, setPickerVisible] = useState(false);

  const myReaction = reactions.find((r) => r.user_id === currentUserId);
  const totalReactions = reactions.length;

  const handleTap = () => {
    if (myReaction) {
      onReact(myReaction.type);
    } else {
      onReact("HEART");
    }
  };

  const handleShare = async () => {
    if (onSharePress) {
      onSharePress();
      return;
    }
    try {
      await Share.share({ message: "Check out this post on SocialSnout!" });
    } catch {}
  };

  const hasReacted = !!myReaction;
  const likeImage = hasReacted
    ? REACTION_EMOJIS[myReaction.type]?.image ?? REACTION_EMOJIS.HEART.image
    : REACTION_EMOJIS.HEART.image;
  const likeColor = hasReacted
    ? REACTION_EMOJIS[myReaction.type]?.color ?? "#EF4444"
    : "#6B7280";

  return (
    <View
      style={{ position: "relative" }}
      className="flex-row items-center pt-3 border-t border-gray-100"
    >
      {/* Like pill */}
      <Pressable
        onPress={handleTap}
        onLongPress={() => setPickerVisible(true)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 4,
          paddingHorizontal: 12,
          paddingVertical: 4,
          borderRadius: 999,
          backgroundColor: hasReacted ? "#FFF7ED" : "#F3F4F6",
          borderWidth: hasReacted ? 1 : 0,
          borderColor: hasReacted ? "#FDBA74" : "transparent",
        }}
      >
        {hasReacted ? (
          <Image source={likeImage} style={{ width: 18, height: 18 }} />
        ) : (
          <Ionicons name="heart-outline" size={18} color="#9CA3AF" />
        )}
        {totalReactions > 0 && (
          <Text style={{ color: likeColor, fontSize: 12, fontWeight: "600" }}>
            {totalReactions}
          </Text>
        )}
      </Pressable>

      {/* Comment pill */}
      <Pressable
        onPress={onCommentPress}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 4,
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 999,
          backgroundColor: "#F3F4F6",
          marginLeft: 8,
        }}
      >
        <Ionicons name="chatbubble-outline" size={16} color="#6B7280" />
        {commentCount > 0 && (
          <Text style={{ color: "#6B7280", fontSize: 12, fontWeight: "600" }}>
            {commentCount}
          </Text>
        )}
      </Pressable>

      {/* Share pill */}
      <Pressable
        onPress={handleShare}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 4,
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 999,
          backgroundColor: "#F3F4F6",
          marginLeft: "auto",
        }}
      >
        <Ionicons name="arrow-redo-outline" size={16} color="#6B7280" />
      </Pressable>

      <ReactionPicker
        visible={pickerVisible}
        currentReaction={myReaction?.type}
        onSelect={onReact}
        onClose={() => setPickerVisible(false)}
      />
    </View>
  );
}
