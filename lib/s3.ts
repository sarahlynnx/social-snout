import { supabase } from "@/lib/supabase";

interface PresignedUrlResponse {
  presignedUrl: string;
  publicUrl: string;
}

export async function getPresignedUrl(
  filename: string,
  contentType: string
): Promise<PresignedUrlResponse> {
  const { data, error } = await supabase.functions.invoke("presigned-url", {
    body: { filename, contentType },
  });

  if (error) throw new Error(`Failed to get presigned URL: ${error.message}`);
  return data as PresignedUrlResponse;
}

export async function uploadToS3(
  fileUri: string,
  presignedUrl: string,
  contentType: string
): Promise<void> {
  const response = await fetch(fileUri);
  const blob = await response.blob();

  const uploadResponse = await fetch(presignedUrl, {
    method: "PUT",
    body: blob,
    headers: {
      "Content-Type": contentType,
    },
  });

  if (!uploadResponse.ok) {
    throw new Error(`S3 upload failed: ${uploadResponse.status}`);
  }
}

export async function uploadPetPhoto(imageUri: string): Promise<string> {
  const extension = imageUri.split(".").pop() || "jpg";
  const filename = `pets/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
  const contentType = `image/${extension === "jpg" ? "jpeg" : extension}`;

  const { presignedUrl, publicUrl } = await getPresignedUrl(
    filename,
    contentType
  );
  await uploadToS3(imageUri, presignedUrl, contentType);

  return publicUrl;
}
