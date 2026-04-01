import { supabase } from "@/lib/supabase";

export async function uploadPetPhoto(imageUri: string): Promise<string> {
  const extension = imageUri.split(".").pop() || "jpg";
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
  const contentType = `image/${extension === "jpg" ? "jpeg" : extension}`;
  const filePath = `pets/${fileName}`;

  // Fetch the local file as a blob
  const response = await fetch(imageUri);
  const blob = await response.blob();

  // Convert blob to ArrayBuffer for Supabase upload
  const arrayBuffer = await new Response(blob).arrayBuffer();

  const { error } = await supabase.storage
    .from("uploads")
    .upload(filePath, arrayBuffer, {
      contentType,
      upsert: false,
    });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data } = supabase.storage
    .from("uploads")
    .getPublicUrl(filePath);

  return data.publicUrl;
}

export async function uploadPostImage(imageUri: string): Promise<string> {
  const extension = imageUri.split(".").pop() || "jpg";
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
  const contentType = `image/${extension === "jpg" ? "jpeg" : extension}`;
  const filePath = `posts/${fileName}`;

  const response = await fetch(imageUri);
  const blob = await response.blob();
  const arrayBuffer = await new Response(blob).arrayBuffer();

  const { error } = await supabase.storage
    .from("uploads")
    .upload(filePath, arrayBuffer, {
      contentType,
      upsert: false,
    });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data } = supabase.storage
    .from("uploads")
    .getPublicUrl(filePath);

  return data.publicUrl;
}

export async function uploadAvatar(imageUri: string, userId: string): Promise<string> {
  const extension = imageUri.split(".").pop() || "jpg";
  const contentType = `image/${extension === "jpg" ? "jpeg" : extension}`;
  const filePath = `avatars/${userId}.${extension}`;

  const response = await fetch(imageUri);
  const blob = await response.blob();
  const arrayBuffer = await new Response(blob).arrayBuffer();

  const { error } = await supabase.storage
    .from("uploads")
    .upload(filePath, arrayBuffer, {
      contentType,
      upsert: true,
    });

  if (error) throw new Error(`Avatar upload failed: ${error.message}`);

  const { data } = supabase.storage
    .from("uploads")
    .getPublicUrl(filePath);

  return data.publicUrl;
}
