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
      const decoded = parseWkbHexPoint(raw);
      if (decoded) return decoded;
    }
  }

  return null;
}

/**
 * Decode a PostGIS (E)WKB hex string for a POINT into lng/lat.
 * PostgREST returns geography columns as WKB hex by default, e.g.
 * "0101000020E6100000...". Handles both little- and big-endian and the
 * optional SRID flag (EWKB).
 */
function parseWkbHexPoint(hex: string): UserLocation | null {
  try {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
    }
    const view = new DataView(bytes.buffer);
    let offset = 0;

    const littleEndian = view.getUint8(offset) === 1;
    offset += 1;

    const geomType = view.getUint32(offset, littleEndian);
    offset += 4;

    // Point type is 1; low bits identify the type, high bit 0x20000000 = SRID present.
    if ((geomType & 0xff) !== 1) return null;
    if (geomType & 0x20000000) {
      offset += 4;
    }

    const lng = view.getFloat64(offset, littleEndian);
    const lat = view.getFloat64(offset + 8, littleEndian);
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null;
    if (lng === 0 && lat === 0) return null;
    return { longitude: lng, latitude: lat };
  } catch {
    return null;
  }
}

export function useUserLocation() {
  const { session } = useAuth();
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);

  const fetchLocation = useCallback(async () => {
    const t0 = Date.now();
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
    console.log(`[useUserLocation] fetch users.location: ${Date.now() - t0}ms`);

    if (error || !data?.location) {
      setLocation(null);
      setLoading(false);
      return;
    }

    const parsed = parseLocation(data.location);
    if (parsed && parsed.latitude === 0 && parsed.longitude === 0) {
      const coords = await getCurrentLocation();
      console.log(
        `[useUserLocation] fallback getCurrentLocation: ${Date.now() - t0}ms`
      );
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
    const t0 = Date.now();
    setRequesting(true);

    try {
      const coords = await getCurrentLocation();
      console.log(
        `[useUserLocation] requestLocation getCurrentLocation: ${Date.now() - t0}ms`
      );
      if (!coords) return false;

      const { error } = await supabase
        .from("users")
        .update({
          location: `SRID=4326;POINT(${coords.longitude} ${coords.latitude})`,
        })
        .eq("id", session.user.id);
      console.log(
        `[useUserLocation] requestLocation save to supabase: ${Date.now() - t0}ms`
      );

      if (error) {
        console.error("Failed to save location:", error.message);
        return false;
      }

      setLocation(coords);
      return true;
    } finally {
      setRequesting(false);
    }
  }, [session]);

  return {
    latitude: location?.latitude ?? null,
    longitude: location?.longitude ?? null,
    hasLocation: location !== null,
    loading,
    requesting,
    requestLocation,
  };
}
