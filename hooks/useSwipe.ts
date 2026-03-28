import { useState, useCallback, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useActivePet } from "@/contexts/ActivePetContext";
import type { SwipeablePet, SwipeDirection } from "@/types/database";

const FETCH_THRESHOLD = 5;
const BATCH_SIZE = 20;

export function useSwipe() {
  const { activePet } = useActivePet();
  const [pets, setPets] = useState<SwipeablePet[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [matchedPet, setMatchedPet] = useState<SwipeablePet | null>(null);
  const [matchId, setMatchId] = useState<string | null>(null);
  const [swiping, setSwiping] = useState(false);
  const lastPetId = useRef<string | null>(null);

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
        setPets((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const newPets = (data as SwipeablePet[]).filter(
            (p) => !existingIds.has(p.id)
          );
          return newPets.length > 0 ? [...prev, ...newPets] : prev;
        });
      }
    },
    []
  );

  // Load when active pet changes
  useEffect(() => {
    if (!activePet) {
      setLoading(false);
      return;
    }

    // Reset deck when switching pets
    if (lastPetId.current !== activePet.id) {
      setPets([]);
      setCurrentIndex(0);
      setMatchedPet(null);
      setMatchId(null);
      lastPetId.current = activePet.id;
    }

    async function init() {
      setLoading(true);
      await fetchPets(activePet!.id);
      setLoading(false);
    }
    init();
  }, [activePet, fetchPets]);

  // Auto-fetch more when running low (but not while a swipe is in-flight)
  useEffect(() => {
    const remaining = pets.length - currentIndex;
    if (remaining <= FETCH_THRESHOLD && remaining > 0 && activePet && !swiping) {
      fetchPets(activePet.id);
    }
  }, [currentIndex, pets.length, activePet, fetchPets, swiping]);

  // Record a swipe and check for match
  const recordSwipe = useCallback(
    async (petId: string, direction: SwipeDirection) => {
      if (!activePet) return;

      // Advance to next card immediately for snappy feel
      setCurrentIndex((prev) => prev + 1);
      setSwiping(true);

      try {
        const { data, error } = await supabase.rpc("handle_swipe", {
          p_swiper_pet_id: activePet.id,
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
      } finally {
        setSwiping(false);
      }
    },
    [activePet, pets]
  );

  const dismissMatch = useCallback(() => {
    setMatchedPet(null);
    setMatchId(null);
  }, []);

  const hasMore = currentIndex < pets.length;

  return {
    myPet: activePet,
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
