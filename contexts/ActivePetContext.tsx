import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import type { Pet } from "@/types/database";

const ACTIVE_PET_KEY = "active_pet_id";

interface ActivePetContextType {
  activePet: Pet | null;
  allPets: Pet[];
  loading: boolean;
  switchPet: (petId: string) => void;
  refreshPets: () => Promise<void>;
}

const ActivePetContext = createContext<ActivePetContextType>({
  activePet: null,
  allPets: [],
  loading: true,
  switchPet: () => {},
  refreshPets: async () => {},
});

export function ActivePetProvider({ children }: { children: React.ReactNode }) {
  const { session, loading: authLoading } = useAuth();
  const [allPets, setAllPets] = useState<Pet[]>([]);
  const [activePet, setActivePet] = useState<Pet | null>(null);
  const [petsLoading, setPetsLoading] = useState(true);

  // Stay in loading state until auth is resolved AND pets are fetched
  const loading = authLoading || petsLoading;

  const userId = session?.user?.id ?? null;

  const fetchPets = useCallback(async () => {
    if (!userId) {
      setAllPets([]);
      setActivePet(null);
      setPetsLoading(false);
      return;
    }

    const { data } = await supabase
      .from("pets")
      .select("*")
      .eq("owner_id", userId)
      .order("created_at", { ascending: true });

    const pets = data ?? [];
    setAllPets(pets);

    if (pets.length === 0) {
      setActivePet(null);
      setPetsLoading(false);
      return;
    }

    // Try to restore saved active pet
    const savedId = await AsyncStorage.getItem(ACTIVE_PET_KEY);
    const saved = savedId ? pets.find((p) => p.id === savedId) : null;
    setActivePet(saved ?? pets[0]);
    setPetsLoading(false);
  }, [userId]);

  useEffect(() => {
    if (authLoading) return;
    setPetsLoading(true);
    fetchPets();
  }, [authLoading, fetchPets]);

  const switchPet = useCallback(
    (petId: string) => {
      const pet = allPets.find((p) => p.id === petId);
      if (pet) {
        setActivePet(pet);
        AsyncStorage.setItem(ACTIVE_PET_KEY, petId);
      }
    },
    [allPets]
  );

  const refreshPets = useCallback(async () => {
    if (!userId) return;

    const { data } = await supabase
      .from("pets")
      .select("*")
      .eq("owner_id", userId)
      .order("created_at", { ascending: true });

    const pets = data ?? [];
    setAllPets(pets);

    // Update active pet with fresh data, or pick newest if current was deleted
    setActivePet((current) => {
      const refreshed = current ? pets.find((p) => p.id === current.id) : null;
      if (refreshed) return refreshed;
      if (pets.length > 0) {
        const newActive = pets[pets.length - 1];
        AsyncStorage.setItem(ACTIVE_PET_KEY, newActive.id);
        return newActive;
      }
      return null;
    });
  }, [userId]);

  return (
    <ActivePetContext.Provider
      value={{ activePet, allPets, loading, switchPet, refreshPets }}
    >
      {children}
    </ActivePetContext.Provider>
  );
}

export function useActivePet() {
  return useContext(ActivePetContext);
}
