import { renderHook, act, waitFor } from "@testing-library/react-native";
import { useAuth } from "@/hooks/useAuth";
import {
  mockSignUp,
  mockSignIn,
  mockSignOut,
  mockGetSession,
  mockOnAuthStateChange,
  mockRpc,
  mockResend,
  mockResetPasswordForEmail,
  mockFrom,
  resetSupabaseMocks,
} from "../../__mocks__/supabase";

jest.mock("@/lib/supabase", () => require("../../__mocks__/supabase"));

beforeEach(() => {
  resetSupabaseMocks();
});

describe("useAuth", () => {
  it("initializes with loading true and fetches session", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: null },
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.session).toBeNull();
  });

  it("signUp creates user and profile when session is returned", async () => {
    const mockUser = { id: "user-1" };
    const mockSession = { user: mockUser };

    mockSignUp.mockResolvedValue({
      data: { user: mockUser, session: mockSession },
      error: null,
    });
    mockFrom.mockReturnValue({
      insert: jest.fn().mockResolvedValue({ error: null }),
    });
    mockGetSession.mockResolvedValue({
      data: { session: null },
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let signUpResult: any;
    await act(async () => {
      signUpResult = await result.current.signUp(
        "test@test.com",
        "password123",
        "Test User"
      );
    });

    expect(mockSignUp).toHaveBeenCalledWith({
      email: "test@test.com",
      password: "password123",
      options: { data: { name: "Test User" } },
    });
    expect(signUpResult.needsEmailConfirmation).toBe(false);
  });

  it("signUp returns needsEmailConfirmation when no session", async () => {
    const mockUser = { id: "user-1" };

    mockSignUp.mockResolvedValue({
      data: { user: mockUser, session: null },
      error: null,
    });
    mockGetSession.mockResolvedValue({
      data: { session: null },
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let signUpResult: any;
    await act(async () => {
      signUpResult = await result.current.signUp(
        "test@test.com",
        "password123",
        "Test User"
      );
    });

    expect(signUpResult.needsEmailConfirmation).toBe(true);
  });

  it("signUp throws on error", async () => {
    mockSignUp.mockResolvedValue({
      data: { user: null, session: null },
      error: new Error("Email already registered"),
    });
    mockGetSession.mockResolvedValue({
      data: { session: null },
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await expect(
      result.current.signUp("test@test.com", "password123", "Test User")
    ).rejects.toThrow("Email already registered");
  });

  it("signIn calls signInWithPassword", async () => {
    const mockSession = { user: { id: "user-1" } };

    mockSignIn.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });
    mockGetSession.mockResolvedValue({
      data: { session: null },
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.signIn("test@test.com", "password123");
    });

    expect(mockSignIn).toHaveBeenCalledWith({
      email: "test@test.com",
      password: "password123",
    });
  });

  it("signOut calls supabase signOut", async () => {
    mockSignOut.mockResolvedValue({ error: null });
    mockGetSession.mockResolvedValue({
      data: { session: null },
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.signOut();
    });

    expect(mockSignOut).toHaveBeenCalled();
  });

  it("resendVerification calls supabase resend", async () => {
    mockResend.mockResolvedValue({ error: null });
    mockGetSession.mockResolvedValue({
      data: { session: null },
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.resendVerification("test@test.com");
    });

    expect(mockResend).toHaveBeenCalledWith({
      type: "signup",
      email: "test@test.com",
    });
  });

  it("resetPassword calls resetPasswordForEmail", async () => {
    mockResetPasswordForEmail.mockResolvedValue({ error: null });
    mockGetSession.mockResolvedValue({
      data: { session: null },
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.resetPassword("test@test.com");
    });

    expect(mockResetPasswordForEmail).toHaveBeenCalledWith("test@test.com");
  });

  it("deleteAccount calls RPC and signs out", async () => {
    const mockSession = { user: { id: "user-1" } };
    mockGetSession.mockResolvedValue({
      data: { session: mockSession },
    });
    mockRpc.mockResolvedValue({ error: null });
    mockSignOut.mockResolvedValue({ error: null });

    // Simulate auth state change to set session
    let authCallback: any;
    mockOnAuthStateChange.mockImplementation((cb: any) => {
      authCallback = cb;
      return { data: { subscription: { unsubscribe: jest.fn() } } };
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      authCallback("SIGNED_IN", mockSession);
    });

    await act(async () => {
      await result.current.deleteAccount();
    });

    expect(mockRpc).toHaveBeenCalledWith("delete_user_account", {
      p_user_id: "user-1",
    });
    expect(mockSignOut).toHaveBeenCalled();
  });
});
