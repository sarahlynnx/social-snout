import { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { useMessages } from "@/hooks/useMessages";
import type { Message } from "@/types/database";

type MatchInfo = {
  petId: string;
  petName: string;
  petPhoto: string | null;
  ownerName: string;
  breed: string | null;
};

export default function ChatScreen() {
  const router = useRouter();
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const { session } = useAuth();
  const { messages, loading, sendMessage } = useMessages(matchId);
  const insets = useSafeAreaInsets();

  const [matchInfo, setMatchInfo] = useState<MatchInfo | null>(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const userId = session?.user?.id;

  // Track keyboard visibility
  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardWillShow", () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener("keyboardWillHide", () => setKeyboardVisible(false));
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  // Fetch match info for the header
  useEffect(() => {
    async function fetchMatchInfo() {
      const { data: match } = await supabase
        .from("matches")
        .select(`
          *,
          pet_a:pets!matches_pet_a_id_fkey(name, photos, breed),
          pet_b:pets!matches_pet_b_id_fkey(name, photos, breed),
          owner_a:users!matches_user_a_id_fkey(name),
          owner_b:users!matches_user_b_id_fkey(name)
        `)
        .eq("id", matchId)
        .single();

      if (!match) return;

      const isUserA = match.user_a_id === userId;
      const otherPetId = isUserA ? match.pet_b_id : match.pet_a_id;
      const otherPet = isUserA ? match.pet_b : match.pet_a;
      const otherOwner = isUserA ? match.owner_b : match.owner_a;

      const rawBreed: string | null = (otherPet as any).breed;
      const breed = rawBreed?.replace(/^(Mixed|Other) — /, "") ?? null;

      setMatchInfo({
        petId: otherPetId,
        petName: (otherPet as any).name,
        petPhoto: (otherPet as any).photos?.[0] ?? null,
        ownerName: (otherOwner as any).name,
        breed,
      });
    }

    if (userId) fetchMatchInfo();
  }, [matchId, userId]);

  const handleSend = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    setSending(true);
    const success = await sendMessage(trimmed);
    if (success) {
      setText("");
      Keyboard.dismiss();
    }
    setSending(false);
  }, [text, sending, sendMessage]);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    }
  }, [messages.length]);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const renderMessage = useCallback(
    ({ item, index }: { item: Message; index: number }) => {
      const isMine = item.sender_id === userId;
      const time = new Date(item.created_at).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      });

      // Show date separator
      const reversedIndex = messages.length - 1 - index;
      const prevMessage = reversedIndex > 0 ? messages[reversedIndex - 1] : null;
      const currentDate = new Date(item.created_at).toDateString();
      const prevDate = prevMessage
        ? new Date(prevMessage.created_at).toDateString()
        : null;
      const showDate = !prevDate || currentDate !== prevDate;

      return (
        <View>
          {showDate && (
            <Text className="text-xs text-gray-400 text-center my-3">
              {formatDateSeparator(new Date(item.created_at))}
            </Text>
          )}
          <View
            className={`flex-row mb-2 px-4 ${
              isMine ? "justify-end" : "justify-start"
            }`}
          >
            <View
              className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                isMine
                  ? "bg-primary-500 rounded-br-sm"
                  : "bg-gray-100 rounded-bl-sm"
              }`}
            >
              <Text
                className={`text-[15px] ${
                  isMine ? "text-white" : "text-gray-900"
                }`}
              >
                {item.content}
              </Text>
              <Text
                className={`text-[11px] mt-1 ${
                  isMine ? "text-white/70" : "text-gray-400"
                }`}
              >
                {time}
              </Text>
            </View>
          </View>
        </View>
      );
    },
    [userId, messages]
  );

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      className="flex-1 bg-white"
    >
      {/* Header */}
      <View
        className="flex-row items-center px-4 pb-3 border-b border-gray-100 bg-white"
        style={{ paddingTop: insets.top + 8 }}
      >
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={28} color="#1F2937" />
        </Pressable>
        <Pressable
          className="flex-row items-center flex-1 ml-3"
          onPress={() => {
            if (matchInfo?.petId) {
              router.push(`/(app)/pet-profile/${matchInfo.petId}?matchId=${matchId}`);
            }
          }}
        >
          {matchInfo?.petPhoto ? (
            <Image
              source={{ uri: matchInfo.petPhoto }}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <View className="w-10 h-10 rounded-full bg-gray-200 items-center justify-center">
              <Ionicons name="paw" size={18} color="#D1D5DB" />
            </View>
          )}
          <View className="ml-3 flex-1">
            <Text className="text-base font-semibold text-gray-900">
              {matchInfo?.petName ?? "Chat"}
            </Text>
            {matchInfo?.ownerName && (
              <Text className="text-xs text-gray-400" numberOfLines={1}>
                {matchInfo.ownerName}'s {matchInfo.breed ?? "pet"}
              </Text>
            )}
          </View>
        </Pressable>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={[...messages].reverse()}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        inverted
        contentContainerStyle={{ paddingVertical: 12 }}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-20">
            <Ionicons name="chatbubble-outline" size={48} color="#D1D5DB" />
            <Text className="text-base text-gray-400 mt-3">
              Say hi to {matchInfo?.petName ?? "your match"}!
            </Text>
          </View>
        }
      />

      {/* Input */}
      <View
        className="border-t border-gray-100 bg-white"
        style={{ paddingBottom: keyboardVisible ? 4 : (insets.bottom || 8) }}
      >
        <View className="flex-row items-center px-4 pt-3 pb-2 gap-3">
          <TextInput
            className="flex-1 bg-gray-100 rounded-full px-4 text-gray-900"
            style={{
              fontSize: 15,
              minHeight: 36,
              maxHeight: 100,
              paddingTop: 8,
              paddingBottom: 8,
              textAlignVertical: "center",
            }}
            placeholder="Type a message..."
            placeholderTextColor="#9CA3AF"
            value={text}
            onChangeText={setText}
            multiline
          />
          <Pressable
            onPress={handleSend}
            disabled={!text.trim() || sending}
            hitSlop={8}
          >
            <Ionicons
              name="send"
              size={24}
              color={text.trim() && !sending ? "#F97316" : "#D1D5DB"}
            />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

function formatDateSeparator(date: Date): string {
  const now = new Date();
  const today = now.toDateString();
  const yesterday = new Date(now.getTime() - 86400000).toDateString();
  const dateStr = date.toDateString();

  if (dateStr === today) return "Today";
  if (dateStr === yesterday) return "Yesterday";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}
