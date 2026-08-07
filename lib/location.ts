import * as Location from "expo-location";
import { supabase } from "@/lib/supabase";

export async function requestLocationPermission(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === "granted";
}
export async function hasLocationPermission(): Promise<boolean> {
  const { status } = await Location.getForegroundPermissionsAsync();
  return status === "granted";
}

export async function getCurrentLocation(): Promise<{
  latitude: number;
  longitude: number;
} | null> {
  const hasPermission = await requestLocationPermission();
  if (!hasPermission) return null;

  try {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    // getCurrentPositionAsync rejects when a fix can't be obtained (e.g. GPS
    // unavailable, or the emulator's fused provider has no fix). Treat it as
    // "no location" rather than letting the rejection propagate.
    console.warn("getCurrentLocation failed:", error);
    return null;
  }
}

/**
 * Get current location and save it to the user's profile.
 * Returns true if saved, false if permission denied or error.
 */
export async function saveUserLocation(userId: string): Promise<boolean> {
  const coords = await getCurrentLocation();
  if (!coords) return false;

  const { error } = await supabase
    .from("users")
    .update({
      location: `SRID=4326;POINT(${coords.longitude} ${coords.latitude})`,
    })
    .eq("id", userId);

  if (error) {
    console.error("Failed to save location:", error.message);
    return false;
  }

  return true;
}
