import { useState, useCallback, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import type { MatchWithMessages } from "@/types/database";

export function useMatches() {
  const { session } = useAuth();
  const [matches, setMatches] = useState<MatchWithMessages[]>([]);
  const [loading, setLoading] = useState(true);

  const userId = session?.user?.id;

  const fetchMatches = useCallback(async () => {
    if (!userId) {
      setMatches([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.rpc("get_matches_with_messages", {
      p_user_id: userId,
    });

    if (error) {
      console.error("Failed to fetch matches:", error.message);
      setLoading(false);
      return;
    }

    setMatches((data as MatchWithMessages[]) ?? []);
    setLoading(false);
  }, [userId]);

  // Fetch on mount and when user changes
  useEffect(() => {
    if (!userId) return;

    setLoading(true);
    fetchMatches();

    // Subscribe to message changes (INSERT = new messages, UPDATE = read status)
    const channel = supabase
      .channel("matches-messages")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
        },
        () => {
          fetchMatches();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchMatches]);

  const totalUnread = useMemo(
    () => matches.reduce((sum, m) => sum + m.unread_count, 0),
    [matches]
  );

  return {
    matches,
    loading,
    totalUnread,
    refresh: fetchMatches,
  };
}
