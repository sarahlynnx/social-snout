import { renderHook, waitFor } from "@testing-library/react-native";
import { useMatches } from "@/hooks/useMatches";
import {
  mockRpc,
  mockChannel,
  mockRemoveChannel,
  resetSupabaseMocks,
} from "../../__mocks__/supabase";

jest.mock("@/lib/supabase", () => require("../../__mocks__/supabase"));

const mockUserId = "user-1";
jest.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    session: { user: { id: mockUserId } },
  }),
}));

beforeEach(() => {
  resetSupabaseMocks();
});

const sampleMatches = [
  {
    id: "match-1",
    pet_a_id: "pet-1",
    pet_b_id: "pet-2",
    user_a_id: "user-1",
    user_b_id: "user-2",
    created_at: "2026-03-28T00:00:00Z",
    pet_name: "Buddy",
    pet_photo: "https://example.com/buddy.jpg",
    owner_name: "Mike",
    owner_avatar: null,
    last_message_content: "Hey!",
    last_message_at: "2026-03-30T10:00:00Z",
    unread_count: 2,
  },
  {
    id: "match-2",
    pet_a_id: "pet-1",
    pet_b_id: "pet-3",
    user_a_id: "user-1",
    user_b_id: "user-3",
    created_at: "2026-03-29T00:00:00Z",
    pet_name: "Luna",
    pet_photo: null,
    owner_name: "Lisa",
    owner_avatar: null,
    last_message_content: null,
    last_message_at: null,
    unread_count: 0,
  },
];

describe("useMatches", () => {
  it("fetches matches via RPC", async () => {
    mockRpc.mockResolvedValue({ data: sampleMatches, error: null });

    const { result } = renderHook(() => useMatches());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockRpc).toHaveBeenCalledWith("get_matches_with_messages", {
      p_user_id: "user-1",
    });
    expect(result.current.matches).toHaveLength(2);
    expect(result.current.error).toBeNull();
  });

  it("calculates totalUnread correctly", async () => {
    mockRpc.mockResolvedValue({ data: sampleMatches, error: null });

    const { result } = renderHook(() => useMatches());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.totalUnread).toBe(2);
  });

  it("sets error on RPC failure", async () => {
    mockRpc.mockResolvedValue({
      data: null,
      error: { message: "RPC failed" },
    });

    const { result } = renderHook(() => useMatches());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("RPC failed");
    expect(result.current.matches).toHaveLength(0);
  });

  it("subscribes to realtime messages channel", () => {
    mockRpc.mockResolvedValue({ data: [], error: null });

    renderHook(() => useMatches());

    expect(mockChannel).toHaveBeenCalledWith("matches-messages");
  });

  it("cleans up subscription on unmount", async () => {
    mockRpc.mockResolvedValue({ data: [], error: null });

    const channelInstance = {
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn().mockReturnThis(),
    };
    mockChannel.mockReturnValue(channelInstance);

    const { unmount } = renderHook(() => useMatches());

    unmount();

    expect(mockRemoveChannel).toHaveBeenCalledWith(channelInstance);
  });

  it("returns zero total unread when no unread messages", async () => {
    const readMatches = sampleMatches.map((m) => ({
      ...m,
      unread_count: 0,
    }));
    mockRpc.mockResolvedValue({ data: readMatches, error: null });

    const { result } = renderHook(() => useMatches());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.totalUnread).toBe(0);
  });
});
