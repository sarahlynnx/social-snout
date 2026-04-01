import { useState, useRef, useEffect } from "react";
import { View, TextInput, Pressable, Image, Text, Keyboard } from "react-native";
import { Ionicons } from "@expo/vector-icons";
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
        <View className="flex-row items-center justify-between px-4 pt-2">
          <Text className="text-xs text-gray-400">
            Replying to {replyingTo.petName}
          </Text>
          <Pressable onPress={onCancelReply}>
            <Ionicons name="close" size={16} color="#9CA3AF" />
          </Pressable>
        </View>
      )}

      <View className="flex-row items-center px-4 pt-3 pb-8 gap-3">
        {petPhoto ? (
          <Image
            source={{ uri: petPhoto }}
            style={{ width: 32, height: 32, borderRadius: 16 }}
          />
        ) : (
          <View className="w-8 h-8 rounded-full bg-primary-100 items-center justify-center">
            <Ionicons name="paw" size={14} color="#F97316" />
          </View>
        )}

        <TextInput
          ref={inputRef}
          className="flex-1 bg-gray-100 rounded-full px-4 text-gray-900"
          style={{
            fontSize: 14,
            minHeight: 32,
            paddingTop: 8,
            paddingBottom: 8,
            textAlignVertical: "center",
          }}
          placeholder={
            replyingTo
              ? `Reply to ${replyingTo.petName}...`
              : "Add a comment..."
          }
          placeholderTextColor="#9CA3AF"
          value={text}
          onChangeText={setText}
          multiline
        />

        <Pressable onPress={handleSubmit} disabled={!text.trim() || submitting}>
          <Ionicons
            name="send"
            size={22}
            color={text.trim() && !submitting ? "#F97316" : "#D1D5DB"}
          />
        </Pressable>
      </View>
    </View>
  );
}
