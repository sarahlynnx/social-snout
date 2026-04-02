import { renderHook, act, waitFor } from "@testing-library/react-native";
import { useMessages } from "@/hooks/useMessages";
import {
  mockFrom,
  mockChannel,
  mockRemoveChannel,
  resetSupabaseMocks,
  createQueryBuilder,
} from "../../__mocks__/supabase";

jest.mock("@/lib/supabase", () => require("../../__mocks__/supabase"));

// Mock useAuth
const mockUserId = "user-1";
jest.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    session: { user: { id: mockUserId } },
  }),
}));

beforeEach(() => {
  resetSupabaseMocks();
});

const sampleMessages = [
  {
    id: "msg-1",
    match_id: "match-1",
    sender_id: "user-1",
    content: "Hello!",
    read: true,
    created_at: "2026-03-30T10:00:00Z",
  },
  {
    id: "msg-2",
    match_id: "match-1",
    sender_id: "user-2",
    content: "Hi there!",
    read: false,
    created_at: "2026-03-30T10:01:00Z",
  },
];

describe("useMessages", () => {
  it("fetches messages on mount", async () => {
    const builder = createQueryBuilder({
      data: sampleMessages,
      error: null,
    });
    mockFrom.mockReturnValue(builder);

    const { result } = renderHook(() => useMessages("match-1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.messages).toHaveLength(2);
    expect(result.current.error).toBeNull();
  });

  it("sets error state on fetch failure", async () => {
    const builder = createQueryBuilder({
      data: null,
      error: { message: "Network error" },
    });
    mockFrom.mockReturnValue(builder);

    const { result } = renderHook(() => useMessages("match-1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("Network error");
    expect(result.current.messages).toHaveLength(0);
  });

  it("sends a message successfully", async () => {
    const selectBuilder = createQueryBuilder({
      data: [],
      error: null,
    });
    const insertBuilder = { insert: jest.fn().mockResolvedValue({ error: null }) };

    let callCount = 0;
    mockFrom.mockImplementation(() => {
      callCount++;
      if (callCount <= 2) return selectBuilder;
      return insertBuilder;
    });

    const { result } = renderHook(() => useMessages("match-1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.sendMessage("Test message");
    });

    expect(success).toBe(true);
  });

  it("subscribes to realtime channel", async () => {
    const builder = createQueryBuilder({
      data: [],
      error: null,
    });
    mockFrom.mockReturnValue(builder);

    renderHook(() => useMessages("match-1"));

    expect(mockChannel).toHaveBeenCalledWith("messages:match-1");
  });

  it("cleans up realtime subscription on unmount", async () => {
    const builder = createQueryBuilder({
      data: [],
      error: null,
    });
    mockFrom.mockReturnValue(builder);

    const channelInstance = {
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn().mockReturnThis(),
    };
    mockChannel.mockReturnValue(channelInstance);

    const { unmount } = renderHook(() => useMessages("match-1"));

    unmount();

    expect(mockRemoveChannel).toHaveBeenCalledWith(channelInstance);
  });
});
