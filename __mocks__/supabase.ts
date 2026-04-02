function createQueryBuilder(resolvedValue: any = { data: [], error: null }) {
  const builder: any = {};
  const methods = [
    "select",
    "insert",
    "update",
    "delete",
    "eq",
    "neq",
    "in",
    "order",
    "single",
    "maybeSingle",
    "limit",
  ];

  for (const method of methods) {
    builder[method] = jest.fn().mockReturnValue(builder);
  }

  builder.single = jest.fn().mockResolvedValue(resolvedValue);
  builder.maybeSingle = jest.fn().mockResolvedValue(resolvedValue);
  builder.then = jest.fn((resolve: any) => resolve(resolvedValue));

  builder[Symbol.for("jest.asymmetricMatch")] = undefined;
  Object.defineProperty(builder, "then", {
    value: (resolve: any) => Promise.resolve(resolvedValue).then(resolve),
    writable: true,
  });

  return builder;
}

export const mockFrom = jest.fn().mockReturnValue(createQueryBuilder());
export const mockRpc = jest.fn().mockResolvedValue({ data: null, error: null });
export const mockChannel = jest.fn().mockReturnValue({
  on: jest.fn().mockReturnThis(),
  subscribe: jest.fn().mockReturnThis(),
});
export const mockRemoveChannel = jest.fn();

export const mockSignUp = jest.fn();
export const mockSignIn = jest.fn();
export const mockSignOut = jest.fn();
export const mockGetSession = jest.fn();
export const mockOnAuthStateChange = jest.fn().mockReturnValue({
  data: { subscription: { unsubscribe: jest.fn() } },
});
export const mockResend = jest.fn();
export const mockResetPasswordForEmail = jest.fn();

export const supabase = {
  from: mockFrom,
  rpc: mockRpc,
  channel: mockChannel,
  removeChannel: mockRemoveChannel,
  auth: {
    signUp: mockSignUp,
    signInWithPassword: mockSignIn,
    signOut: mockSignOut,
    getSession: mockGetSession,
    onAuthStateChange: mockOnAuthStateChange,
    resend: mockResend,
    resetPasswordForEmail: mockResetPasswordForEmail,
  },
  storage: {
    from: jest.fn().mockReturnValue({
      upload: jest.fn().mockResolvedValue({ error: null }),
      getPublicUrl: jest.fn().mockReturnValue({
        data: { publicUrl: "https://example.com/image.jpg" },
      }),
    }),
  },
};

export function resetSupabaseMocks() {
  jest.clearAllMocks();
  mockFrom.mockReturnValue(createQueryBuilder());
  mockRpc.mockResolvedValue({ data: null, error: null });
  mockGetSession.mockResolvedValue({ data: { session: null } });
  mockOnAuthStateChange.mockReturnValue({
    data: { subscription: { unsubscribe: jest.fn() } },
  });
}

export { createQueryBuilder };
