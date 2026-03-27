import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import type { SwipeablePet, Pet, SwipeDirection } from "@/types/database";

const FETCH_THRESHOLD = 5;
const BATCH_SIZE = 20;

export function useSwipe() {
  const { session } = useAuth();
  const [myPet, setMyPet] = useState<Pet | null>(null);
  const [pets, setPets] = useState<SwipeablePet[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [matchedPet, setMatchedPet] = useState<SwipeablePet | null>(null);
  const [matchId, setMatchId] = useState<string | null>(null);

  // Fetch the user's first pet
  const fetchMyPet = useCallback(async () => {
    if (!session?.user) return null;

    const { data, error } = await supabase
      .from("pets")
      .select("*")
      .eq("owner_id", session.user.id)
      .limit(1)
      .single();

    if (error || !data) return null;
    setMyPet(data);
    return data;
  }, [session]);

  // Fetch swipeable pets via RPC
  const fetchPets = useCallback(
    async (petId: string) => {
      const { data, error } = await supabase.rpc("get_swipeable_pets", {
        p_pet_id: petId,
        p_limit: BATCH_SIZE,
      });

      if (error) {
        console.error("Failed to fetch swipeable pets:", error.message);
        return;
      }

      if (data && data.length > 0) {
        setPets((prev) => [...prev, ...(data as SwipeablePet[])]);
      }
    },
    []
  );

  // Initial load
  useEffect(() => {
    async function init() {
      setLoading(true);
      const pet = await fetchMyPet();
      if (pet) {
        await fetchPets(pet.id);
      }
      setLoading(false);
    }
    init();
  }, [fetchMyPet, fetchPets]);

  // Auto-fetch more when running low
  useEffect(() => {
    const remaining = pets.length - currentIndex;
    if (remaining <= FETCH_THRESHOLD && remaining > 0 && myPet) {
      fetchPets(myPet.id);
    }
  }, [currentIndex, pets.length, myPet, fetchPets]);

  // Record a swipe and check for match
  const recordSwipe = useCallback(
    async (petId: string, direction: SwipeDirection) => {
      if (!myPet) return;

      // Advance to next card immediately for snappy feel
      setCurrentIndex((prev) => prev + 1);

      const { data, error } = await supabase.rpc("handle_swipe", {
        p_swiper_pet_id: myPet.id,
        p_swiped_pet_id: petId,
        p_direction: direction,
      });

      if (error) {
        console.error("Swipe failed:", error.message);
        return;
      }

      // Check if we got a match
      if (data && data.matched) {
        const matched = pets.find((p) => p.id === petId);
        if (matched) {
          setMatchedPet(matched);
          setMatchId(data.match_id);
        }
      }
    },
    [myPet, pets]
  );

  const dismissMatch = useCallback(() => {
    setMatchedPet(null);
    setMatchId(null);
  }, []);

  const hasMore = currentIndex < pets.length;

  return {
    myPet,
    pets,
    currentIndex,
    loading,
    matchedPet,
    matchId,
    hasMore,
    recordSwipe,
    dismissMatch,
  };
}
