import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import type { PetType, PetSize } from "@/types/database";

export interface MatchingPreferencesState {
  petTypes: PetType[];
  sizes: PetSize[];
  ageMin: number;
  ageMax: number;
  requiredTags: string[];
  radiusMiles: number;
}

const DEFAULTS: MatchingPreferencesState = {
  petTypes: ["DOG", "CAT"],
  sizes: ["SMALL", "MEDIUM", "LARGE"],
  ageMin: 0,
  ageMax: 10,
  requiredTags: [],
  radiusMiles: 10,
};

export function useMatchingPreferences() {
  const { session } = useAuth();
  const [preferences, setPreferences] =
    useState<MatchingPreferencesState>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchPreferences = useCallback(async () => {
    if (!session?.user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("matching_preferences")
      .select("*")
      .eq("user_id", session.user.id)
      .maybeSingle();

    if (error) {
      console.error("Failed to fetch preferences:", error.message);
    } else if (data) {
      setPreferences({
        petTypes: data.pet_types as PetType[],
        sizes: data.sizes as PetSize[],
        ageMin: data.age_min,
        ageMax: data.age_max,
        requiredTags: data.required_tags,
        radiusMiles: data.radius_miles ?? 10,
      });
    }

    setLoading(false);
  }, [session]);

  const savePreferences = useCallback(
    async (prefs: MatchingPreferencesState): Promise<boolean> => {
      if (!session?.user) return false;

      setSaving(true);
      const { error } = await supabase.from("matching_preferences").upsert(
        {
          user_id: session.user.id,
          pet_types: prefs.petTypes,
          sizes: prefs.sizes,
          age_min: prefs.ageMin,
          age_max: prefs.ageMax,
          required_tags: prefs.requiredTags,
          radius_miles: prefs.radiusMiles,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

      setSaving(false);

      if (error) {
        console.error("Failed to save preferences:", error.message);
        return false;
      }

      setPreferences(prefs);
      return true;
    },
    [session]
  );

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  return { preferences, loading, saving, setPreferences, savePreferences };
}
