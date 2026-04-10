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

  const safeReactions = reactions ?? [];
  const myReaction = safeReactions.find((r) => r.user_id === currentUserId);
  const totalReactions = safeReactions.length;

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
    : "#5C584F";

  return (
    <View className="flex-row items-center pt-3 border-t border-gray-100">
      {/* Like pill — tap to toggle reaction, long-press to open picker */}
      <View style={{ position: "relative", zIndex: 10, overflow: "visible" }}>
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
            backgroundColor: hasReacted ? "#F4F7F4" : "#F5F4F0",
            borderWidth: hasReacted ? 1 : 0,
            borderColor: hasReacted ? "#C5D7C0" : "transparent",
          }}
        >
          {hasReacted ? (
            <Image source={likeImage} style={{ width: 18, height: 18 }} />
          ) : (
            <Ionicons name="heart-outline" size={18} color="#A8A49C" />
          )}
          {totalReactions > 0 && (
            <Text style={{ color: likeColor, fontSize: 12, fontWeight: "600" }}>
              {totalReactions}
            </Text>
          )}
        </Pressable>

        <ReactionPicker
          visible={pickerVisible}
          currentReaction={myReaction?.type}
          onSelect={onReact}
          onClose={() => setPickerVisible(false)}
        />
      </View>

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
          backgroundColor: "#F5F4F0",
          marginLeft: 8,
        }}
      >
        <Ionicons name="chatbubble-outline" size={16} color="#5C584F" />
        {commentCount > 0 && (
          <Text style={{ color: "#5C584F", fontSize: 12, fontWeight: "600" }}>
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
          backgroundColor: "#F5F4F0",
          marginLeft: "auto",
        }}
      >
        <Ionicons name="arrow-redo-outline" size={16} color="#5C584F" />
      </Pressable>
    </View>
  );
}
