import { useState, useCallback, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useActivePet } from "@/contexts/ActivePetContext";
import type { MatchWithProfiles } from "@/types/database";

export function useMatches() {
  const { activePet } = useActivePet();
  const [matches, setMatches] = useState<MatchWithProfiles[]>([]);
  const [loading, setLoading] = useState(true);
  const lastPetId = useRef<string | null>(null);

  const fetchMatches = useCallback(async () => {
    if (!activePet) {
      setMatches([]);
      setLoading(false);
      return;
    }

    const petId = activePet.id;

    // Fetch matches where this pet is involved
    const { data, error } = await supabase
      .from("matches")
      .select(`
        *,
        pet_a:pets!matches_pet_a_id_fkey(*),
        pet_b:pets!matches_pet_b_id_fkey(*),
        owner_a:users!matches_user_a_id_fkey(id, name, avatar_url),
        owner_b:users!matches_user_b_id_fkey(id, name, avatar_url)
      `)
      .or(`pet_a_id.eq.${petId},pet_b_id.eq.${petId}`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch matches:", error.message);
      setLoading(false);
      return;
    }

    // Transform: always show the "other" pet/owner from the active pet's perspective
    const transformed: MatchWithProfiles[] = (data ?? []).map((match: any) => {
      const isMyPetA = match.pet_a_id === petId;
      return {
        id: match.id,
        pet_a_id: match.pet_a_id,
        pet_b_id: match.pet_b_id,
        user_a_id: match.user_a_id,
        user_b_id: match.user_b_id,
        created_at: match.created_at,
        // "pet" and "owner" = the OTHER side of the match
        pet: isMyPetA ? match.pet_b : match.pet_a,
        owner: isMyPetA ? match.owner_b : match.owner_a,
      };
    });

    setMatches(transformed);
    setLoading(false);
  }, [activePet]);

  // Reset and refetch when active pet changes
  useEffect(() => {
    if (!activePet) return;

    if (lastPetId.current !== activePet.id) {
      setMatches([]);
      lastPetId.current = activePet.id;
    }

    setLoading(true);
    fetchMatches();
  }, [activePet, fetchMatches]);

  return {
    matches,
    loading,
    refresh: fetchMatches,
  };
}
