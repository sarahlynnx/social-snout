import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import type { MatchWithProfiles } from "@/types/database";

export function useMatches() {
  const { session } = useAuth();
  const [matches, setMatches] = useState<MatchWithProfiles[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMatches = useCallback(async () => {
    if (!session?.user) return;

    const userId = session.user.id;

    // Fetch all matches where this user is involved
    const { data, error } = await supabase
      .from("matches")
      .select(`
        *,
        pet_a:pets!matches_pet_a_id_fkey(*),
        pet_b:pets!matches_pet_b_id_fkey(*),
        owner_a:users!matches_user_a_id_fkey(id, name, avatar_url),
        owner_b:users!matches_user_b_id_fkey(id, name, avatar_url)
      `)
      .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch matches:", error.message);
      setLoading(false);
      return;
    }

    // Transform: always show the "other" pet/owner from the current user's perspective
    const transformed: MatchWithProfiles[] = (data ?? []).map((match: any) => {
      const isUserA = match.user_a_id === userId;
      return {
        id: match.id,
        pet_a_id: match.pet_a_id,
        pet_b_id: match.pet_b_id,
        user_a_id: match.user_a_id,
        user_b_id: match.user_b_id,
        created_at: match.created_at,
        // "pet" and "owner" = the OTHER side of the match
        pet: isUserA ? match.pet_b : match.pet_a,
        owner: isUserA ? match.owner_b : match.owner_a,
      };
    });

    setMatches(transformed);
    setLoading(false);
  }, [session]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  return {
    matches,
    loading,
    refresh: fetchMatches,
  };
}
