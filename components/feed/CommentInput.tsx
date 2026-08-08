import { useState, useRef, useEffect } from "react";
import { View, TextInput, Pressable, Text, Keyboard } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useKeyboardState } from "react-native-keyboard-controller";
import type { Pet } from "@/types/database";

interface CommentInputProps {
  activePet: Pet | null;
  replyingTo: { commentId: string; petName: string } | null;
  onCancelReply: () => void;
  onSubmit: (content: string, parentCommentId?: string) => Promise<boolean>;
}

export function CommentInput({
  activePet,
  replyingTo,
  onCancelReply,
  onSubmit,
}: CommentInputProps) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const insets = useSafeAreaInsets();
  const keyboardVisible = useKeyboardState((s) => s.isVisible);

  useEffect(() => {
    if (replyingTo) {
      inputRef.current?.focus();
    }
  }, [replyingTo]);

  const petPhoto = activePet?.photos?.[0];

  const handleSubmit = async () => {
    const trimmed = text.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    const success = await onSubmit(trimmed, replyingTo?.commentId);
    if (success) {
      setText("");
      onCancelReply();
      Keyboard.dismiss();
    }
    setSubmitting(false);
  };

  return (
    <View className="border-t border-gray-100 bg-white">
      {/* Reply indicator */}
      {replyingTo && (
        <View
          testID="reply-indicator"
          className="flex-row items-center justify-between px-4 pt-2"
        >
          <Text className="text-xs text-gray-400">
            Replying to {replyingTo.petName}
          </Text>
          <Pressable testID="reply-cancel" onPress={onCancelReply}>
            <Ionicons name="close" size={16} color="#A8A49C" />
          </Pressable>
        </View>
      )}

      <View
        className="flex-row items-center px-4 pt-3 gap-3"
        style={{ paddingBottom: keyboardVisible ? 8 : insets.bottom + 8 }}
      >
        {petPhoto ? (
          <Image
            source={{ uri: petPhoto }}
            style={{ width: 32, height: 32, borderRadius: 16 }}
            contentFit="cover"
            transition={150}
            cachePolicy="memory-disk"
          />
        ) : (
          <View className="w-8 h-8 rounded-full bg-primary-100 items-center justify-center">
            <Ionicons name="paw" size={14} color="#5A8A4F" />
          </View>
        )}

        <TextInput
          ref={inputRef}
          testID="comment-input"
          className="flex-1 px-4 text-gray-900"
          style={{
            fontSize: 14,
            minHeight: 40,
            maxHeight: 120,
            paddingTop: 10,
            paddingBottom: 10,
            borderWidth: 1,
            borderColor: "#E5E5E5",
            borderRadius: 5,
            textAlignVertical: "center",
          }}
          placeholder={
            replyingTo
              ? `Reply to ${replyingTo.petName}...`
              : "Add a comment..."
          }
          placeholderTextColor="#A8A49C"
          value={text}
          onChangeText={setText}
          multiline
        />

        <Pressable testID="comment-submit" onPress={handleSubmit} disabled={!text.trim() || submitting}>
          <Ionicons
            name="send"
            size={22}
            color={text.trim() && !submitting ? "#5A8A4F" : "#D4D1CA"}
          />
        </Pressable>
      </View>
    </View>
  );
}
