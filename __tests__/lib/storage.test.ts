// Mock expo-image-manipulator
const mockSaveAsync = jest.fn().mockResolvedValue({
  uri: "file:///compressed.jpg",
  width: 1200,
  height: 900,
});
const mockRenderAsync = jest.fn().mockResolvedValue({
  saveAsync: (...args: any[]) => mockSaveAsync(...args),
});
const mockResize = jest.fn().mockReturnValue({
  renderAsync: () => mockRenderAsync(),
});
const mockManipulate = jest.fn().mockReturnValue({
  resize: (...args: any[]) => mockResize(...args),
});

jest.mock("expo-image-manipulator", () => ({
  ImageManipulator: {
    manipulate: (...args: any[]) => mockManipulate(...args),
  },
  SaveFormat: { JPEG: "jpeg", PNG: "png", WEBP: "webp" },
}));

// Mock supabase storage
const mockUpload = jest.fn().mockResolvedValue({ error: null });
const mockGetPublicUrl = jest.fn().mockReturnValue({
  data: { publicUrl: "https://storage.example.com/uploads/test.jpg" },
});

jest.mock("@/lib/supabase", () => ({
  supabase: {
    storage: {
      from: () => ({
        upload: (...args: any[]) => mockUpload(...args),
        getPublicUrl: (...args: any[]) => mockGetPublicUrl(...args),
      }),
    },
  },
}));

// Mock fetch for blob conversion
global.fetch = jest.fn().mockResolvedValue({
  blob: jest.fn().mockResolvedValue(new Blob(["test"], { type: "image/jpeg" })),
}) as any;

// Mock Response for arrayBuffer
global.Response = class MockResponse {
  private body: any;
  constructor(body: any) {
    this.body = body;
  }
  arrayBuffer() {
    return Promise.resolve(new ArrayBuffer(8));
  }
} as any;

import { uploadPetPhoto, uploadPostImage, uploadAvatar } from "@/lib/storage";

beforeEach(() => {
  mockManipulate.mockClear();
  mockResize.mockClear();
  mockRenderAsync.mockClear();
  mockSaveAsync.mockClear();
  mockSaveAsync.mockResolvedValue({
    uri: "file:///compressed.jpg",
    width: 1200,
    height: 900,
  });
  mockUpload.mockClear();
  mockUpload.mockResolvedValue({ error: null });
  mockGetPublicUrl.mockClear();
  mockGetPublicUrl.mockReturnValue({
    data: { publicUrl: "https://storage.example.com/uploads/test.jpg" },
  });
});

describe("storage", () => {
  describe("uploadPetPhoto", () => {
    it("compresses the image before uploading", async () => {
      const url = await uploadPetPhoto("file:///original.jpg");

      expect(mockManipulate).toHaveBeenCalledWith("file:///original.jpg");
      expect(mockResize).toHaveBeenCalledWith({ width: 1200 });
      expect(mockSaveAsync).toHaveBeenCalledWith({
        compress: 0.7,
        format: "jpeg",
      });
      expect(url).toBe("https://storage.example.com/uploads/test.jpg");
    });

    it("uploads to the pets/ path", async () => {
      await uploadPetPhoto("file:///photo.jpg");

      const uploadCall = mockUpload.mock.calls[0];
      expect(uploadCall[0]).toMatch(/^pets\//);
      expect(uploadCall[2].contentType).toBe("image/jpeg");
    });

    it("throws on upload error", async () => {
      mockUpload.mockResolvedValueOnce({
        error: { message: "Storage full" },
      });

      await expect(uploadPetPhoto("file:///photo.jpg")).rejects.toThrow(
        "Upload failed: Storage full"
      );
    });
  });

  describe("uploadPostImage", () => {
    it("compresses and uploads to posts/ path", async () => {
      const url = await uploadPostImage("file:///post.jpg");

      expect(mockManipulate).toHaveBeenCalled();
      const uploadCall = mockUpload.mock.calls[0];
      expect(uploadCall[0]).toMatch(/^posts\//);
      expect(url).toBe("https://storage.example.com/uploads/test.jpg");
    });
  });

  describe("uploadAvatar", () => {
    it("compresses and uploads to avatars/ path with userId", async () => {
      const url = await uploadAvatar("file:///avatar.jpg", "user-123");

      expect(mockManipulate).toHaveBeenCalled();
      const uploadCall = mockUpload.mock.calls[0];
      expect(uploadCall[0]).toBe("avatars/user-123.jpg");
      expect(uploadCall[2].upsert).toBe(true);
      expect(url).toBe("https://storage.example.com/uploads/test.jpg");
    });
  });
});
