import * as Location from "expo-location";

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
