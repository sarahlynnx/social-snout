import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { getCurrentLocation } from "@/lib/location";

interface UserLocation {
  latitude: number;
  longitude: number;
}

/**
 * Attempt to parse the geography column from Supabase.
 * PostgREST returns geography in varying formats depending on config.
 */
function parseLocation(raw: unknown): UserLocation | null {
  if (!raw) return null;

  // GeoJSON object: { type: "Point", coordinates: [lng, lat] }
  if (typeof raw === "object" && raw !== null) {
    const geo = raw as Record<string, unknown>;
    if (geo.type === "Point" && Array.isArray(geo.coordinates) && geo.coordinates.length === 2) {
      return { longitude: geo.coordinates[0] as number, latitude: geo.coordinates[1] as number };
    }
  }

  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (parsed.type === "Point" && parsed.coordinates?.length === 2) {
        return { longitude: parsed.coordinates[0], latitude: parsed.coordinates[1] };
      }
    } catch {
    }
    const match = raw.match(/POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/);
    if (match) {
      return { longitude: parseFloat(match[1]), latitude: parseFloat(match[2]) };
    }
    if (/^[0-9a-fA-F]+$/.test(raw) && raw.length > 10) {

      return { latitude: 0, longitude: 0 };
    }
  }

  return null;
}

export function useUserLocation() {
  const { session } = useAuth();
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLocation = useCallback(async () => {
    if (!session?.user) {
      setLocation(null);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("users")
      .select("location")
      .eq("id", session.user.id)
      .single();

    if (error || !data?.location) {
      setLocation(null);
      setLoading(false);
      return;
    }

    const parsed = parseLocation(data.location);
    if (parsed && parsed.latitude === 0 && parsed.longitude === 0) {
      const coords = await getCurrentLocation();
      if (coords) {
        setLocation(coords);
      } else {
        setLocation(null);
      }
    } else {
      setLocation(parsed);
    }

    setLoading(false);
  }, [session]);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  const requestLocation = useCallback(async () => {
    if (!session?.user) return false;

    const coords = await getCurrentLocation();
    if (!coords) return false;

    const { error } = await supabase
      .from("users")
      .update({
        location: `SRID=4326;POINT(${coords.longitude} ${coords.latitude})`,
      })
      .eq("id", session.user.id);

    if (error) {
      console.error("Failed to save location:", error.message);
      return false;
    }

    setLocation(coords);
    return true;
  }, [session]);

  return {
    latitude: location?.latitude ?? null,
    longitude: location?.longitude ?? null,
    hasLocation: location !== null,
    loading,
    requestLocation,
  };
}
