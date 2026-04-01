import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import type { Message } from "@/types/database";

export function useMessages(matchId: string) {
  const { session } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const userId = session?.user?.id;

  const fetchMessages = useCallback(async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("match_id", matchId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Failed to fetch messages:", error.message);
      setLoading(false);
      return;
    }

    setMessages(data ?? []);
    setLoading(false);
  }, [matchId]);

  const markAsRead = useCallback(async () => {
    if (!userId) return;

    await supabase
      .from("messages")
      .update({ read: true })
      .eq("match_id", matchId)
      .neq("sender_id", userId)
      .eq("read", false);
  }, [matchId, userId]);

  // Fetch messages and subscribe to Realtime
  useEffect(() => {
    fetchMessages();

    const channel = supabase
      .channel(`messages:${matchId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prev) => [...prev, newMessage]);

          // Mark as read if from the other user
          if (newMessage.sender_id !== userId) {
            markAsRead();
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, fetchMessages, userId, markAsRead]);

  // Mark messages as read on mount
  useEffect(() => {
    if (!loading && messages.length > 0) {
      markAsRead();
    }
  }, [loading]); // eslint-disable-line react-hooks/exhaustive-deps

  const sendMessage = useCallback(
    async (content: string) => {
      if (!userId) return false;

      const { error } = await supabase.from("messages").insert({
        match_id: matchId,
        sender_id: userId,
        content,
      });

      if (error) {
        console.error("Failed to send message:", error.message);
        return false;
      }

      return true;
    },
    [matchId, userId]
  );

  return { messages, loading, sendMessage, markAsRead };
}
