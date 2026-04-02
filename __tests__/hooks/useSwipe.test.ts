import { renderHook, act, waitFor } from "@testing-library/react-native";
import { useSwipe } from "@/hooks/useSwipe";
import { mockRpc, resetSupabaseMocks } from "../../__mocks__/supabase";

jest.mock("@/lib/supabase", () => require("../../__mocks__/supabase"));

const mockActivePet = {
  id: "pet-1",
  name: "Buddy",
  owner_id: "user-1",
  type: "DOG" as const,
  breed: "Golden Retriever",
  age: 3,
  size: "LARGE" as const,
  bio: "Good boy",
  photos: [],
  tags: ["Friendly"],
  prompts: [],
  created_at: "2026-01-01T00:00:00Z",
};

jest.mock("@/contexts/ActivePetContext", () => ({
  useActivePet: () => ({
    activePet: mockActivePet,
    refreshPets: jest.fn(),
  }),
}));

beforeEach(() => {
  resetSupabaseMocks();
});

const samplePets = [
  {
    id: "pet-2",
    name: "Mochi",
    owner_id: "user-2",
    type: "DOG",
    breed: "Corgi",
    age: 4,
    size: "MEDIUM",
    bio: "Short legs, big personality",
    photos: ["https://example.com/mochi.jpg"],
    tags: ["Playful"],
    prompts: [],
    created_at: "2026-01-01T00:00:00Z",
    owner_name: "Mike",
    owner_avatar_url: null,
  },
  {
    id: "pet-3",
    name: "Kiko",
    owner_id: "user-3",
    type: "DOG",
    breed: "Shiba Inu",
    age: 1,
    size: "MEDIUM",
    bio: "Much wow",
    photos: [],
    tags: ["Energetic"],
    prompts: [],
    created_at: "2026-01-01T00:00:00Z",
    owner_name: "Lisa",
    owner_avatar_url: null,
  },
];

describe("useSwipe", () => {
  it("fetches swipeable pets on mount", async () => {
    mockRpc.mockResolvedValue({ data: samplePets, error: null });

    const { result } = renderHook(() => useSwipe());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockRpc).toHaveBeenCalledWith("get_swipeable_pets", {
      p_pet_id: "pet-1",
      p_limit: 20,
    });
    expect(result.current.pets).toHaveLength(2);
    expect(result.current.hasMore).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it("sets error on fetch failure", async () => {
    mockRpc.mockResolvedValue({
      data: null,
      error: { message: "Failed to load" },
    });

    const { result } = renderHook(() => useSwipe());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("Failed to load");
  });

  it("records a swipe and advances index", async () => {
    // First call: get_swipeable_pets, second: handle_swipe
    let callCount = 0;
    mockRpc.mockImplementation((fn: string) => {
      callCount++;
      if (fn === "get_swipeable_pets") {
        return Promise.resolve({ data: samplePets, error: null });
      }
      if (fn === "handle_swipe") {
        return Promise.resolve({
          data: { matched: false, match_id: null },
          error: null,
        });
      }
      return Promise.resolve({ data: null, error: null });
    });

    const { result } = renderHook(() => useSwipe());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.currentIndex).toBe(0);

    await act(async () => {
      await result.current.recordSwipe("pet-2", "RIGHT");
    });

    expect(result.current.currentIndex).toBe(1);
  });

  it("detects a match on right swipe", async () => {
    mockRpc.mockImplementation((fn: string) => {
      if (fn === "get_swipeable_pets") {
        return Promise.resolve({ data: samplePets, error: null });
      }
      if (fn === "handle_swipe") {
        return Promise.resolve({
          data: { matched: true, match_id: "match-1" },
          error: null,
        });
      }
      return Promise.resolve({ data: null, error: null });
    });

    const { result } = renderHook(() => useSwipe());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.recordSwipe("pet-2", "RIGHT");
    });

    expect(result.current.matchedPet?.id).toBe("pet-2");
    expect(result.current.matchId).toBe("match-1");
  });

  it("dismissMatch clears the match state", async () => {
    mockRpc.mockImplementation((fn: string) => {
      if (fn === "get_swipeable_pets") {
        return Promise.resolve({ data: samplePets, error: null });
      }
      if (fn === "handle_swipe") {
        return Promise.resolve({
          data: { matched: true, match_id: "match-1" },
          error: null,
        });
      }
      return Promise.resolve({ data: null, error: null });
    });

    const { result } = renderHook(() => useSwipe());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.recordSwipe("pet-2", "RIGHT");
    });

    expect(result.current.matchedPet).not.toBeNull();

    act(() => {
      result.current.dismissMatch();
    });

    expect(result.current.matchedPet).toBeNull();
    expect(result.current.matchId).toBeNull();
  });
});
