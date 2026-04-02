import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { supabase } from "@/lib/supabase";

async function compressImage(uri: string): Promise<string> {
  const ref = await ImageManipulator.manipulate(uri)
    .resize({ width: 1200 })
    .renderAsync();
  const result = await ref.saveAsync({ compress: 0.7, format: SaveFormat.JPEG });
  return result.uri;
}

export async function uploadPetPhoto(imageUri: string): Promise<string> {
  const compressedUri = await compressImage(imageUri);
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
  const filePath = `pets/${fileName}`;

  const response = await fetch(compressedUri);
  const blob = await response.blob();

  // Convert blob to ArrayBuffer for Supabase upload
  const arrayBuffer = await new Response(blob).arrayBuffer();

  const { error } = await supabase.storage
    .from("uploads")
    .upload(filePath, arrayBuffer, {
      contentType: "image/jpeg",
      upsert: false,
    });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data } = supabase.storage
    .from("uploads")
    .getPublicUrl(filePath);

  return data.publicUrl;
}

export async function uploadPostImage(imageUri: string): Promise<string> {
  const compressedUri = await compressImage(imageUri);
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
  const filePath = `posts/${fileName}`;

  const response = await fetch(compressedUri);
  const blob = await response.blob();
  const arrayBuffer = await new Response(blob).arrayBuffer();

  const { error } = await supabase.storage
    .from("uploads")
    .upload(filePath, arrayBuffer, {
      contentType: "image/jpeg",
      upsert: false,
    });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data } = supabase.storage
    .from("uploads")
    .getPublicUrl(filePath);

  return data.publicUrl;
}

export async function uploadAvatar(imageUri: string, userId: string): Promise<string> {
  const compressedUri = await compressImage(imageUri);
  const filePath = `avatars/${userId}.jpg`;

  const response = await fetch(compressedUri);
  const blob = await response.blob();
  const arrayBuffer = await new Response(blob).arrayBuffer();

  const { error } = await supabase.storage
    .from("uploads")
    .upload(filePath, arrayBuffer, {
      contentType: "image/jpeg",
      upsert: true,
    });

  if (error) throw new Error(`Avatar upload failed: ${error.message}`);

  const { data } = supabase.storage
    .from("uploads")
    .getPublicUrl(filePath);

  return data.publicUrl;
}
