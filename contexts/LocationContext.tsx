import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { getCurrentLocation, hasLocationPermission } from "@/lib/location";

interface UserLocation {
  latitude: number;
  longitude: number;
}

export type LocationStatus = "loading" | "ready" | "unavailable";

interface LocationContextType {
  latitude: number | null;
  longitude: number | null;
  hasLocation: boolean;
  status: LocationStatus;
  loading: boolean;
  requesting: boolean;
  requestLocation: () => Promise<boolean>;
}

const LocationContext = createContext<LocationContextType>({
  latitude: null,
  longitude: null,
  hasLocation: false,
  status: "loading",
  loading: true,
  requesting: false,
  requestLocation: async () => false,
});

function parseLocation(raw: unknown): UserLocation | null {
  if (!raw) return null;

  if (typeof raw === "object" && raw !== null) {
    const geo = raw as Record<string, unknown>;
    if (
      geo.type === "Point" &&
      Array.isArray(geo.coordinates) &&
      geo.coordinates.length === 2
    ) {
      return {
        longitude: geo.coordinates[0] as number,
        latitude: geo.coordinates[1] as number,
      };
    }
  }

  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (parsed.type === "Point" && parsed.coordinates?.length === 2) {
        return {
          longitude: parsed.coordinates[0],
          latitude: parsed.coordinates[1],
        };
      }
    } catch {}
    const match = raw.match(/POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/);
    if (match) {
      return {
        longitude: parseFloat(match[1]),
        latitude: parseFloat(match[2]),
      };
    }
    if (/^[0-9a-fA-F]+$/.test(raw) && raw.length > 10) {
      const decoded = parseWkbHexPoint(raw);
      if (decoded) return decoded;
    }
  }

  return null;
}

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

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [status, setStatus] = useState<LocationStatus>("loading");
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);

  const readSavedLocation = useCallback(
    async (userId: string): Promise<UserLocation | null> => {
      const { data, error } = await supabase
        .from("users")
        .select("location")
        .eq("id", userId)
        .single();
      if (error || !data?.location) return null;
      const parsed = parseLocation(data.location);
      if (parsed && parsed.latitude === 0 && parsed.longitude === 0)
        return null;
      return parsed;
    },
    []
  );

  const saveFreshLocation = useCallback(
    async (userId: string): Promise<UserLocation | null> => {
      const coords = await getCurrentLocation();
      if (!coords) return null;
      const { error } = await supabase
        .from("users")
        .update({
          location: `SRID=4326;POINT(${coords.longitude} ${coords.latitude})`,
        })
        .eq("id", userId);
      if (error) {
        console.error("Failed to save location:", error.message);
        return coords;
      }
      return coords;
    },
    []
  );

  const fetchLocation = useCallback(async () => {
    const t0 = Date.now();
    setStatus("loading");
    setLoading(true);

    if (!session?.user) {
      setLocation(null);
      setStatus("unavailable");
      setLoading(false);
      return;
    }
    const userId = session.user.id;

    const permitted = await hasLocationPermission();

    let coords: UserLocation | null = null;
    if (permitted) {
      coords = await saveFreshLocation(userId);
    }
    if (!coords) {
      coords = await readSavedLocation(userId);
    }
    console.log(
      `[LocationContext] resolve location (permitted=${permitted}): ${
        Date.now() - t0
      }ms`
    );

    setLocation(coords);
    setStatus(coords ? "ready" : "unavailable");
    setLoading(false);
  }, [session, saveFreshLocation, readSavedLocation]);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  const requestLocation = useCallback(async () => {
    if (!session?.user) return false;
    setRequesting(true);
    try {
      const coords = await saveFreshLocation(session.user.id);
      if (!coords) return false;
      setLocation(coords);
      setStatus("ready");
      return true;
    } finally {
      setRequesting(false);
    }
  }, [session, saveFreshLocation]);

  return (
    <LocationContext.Provider
      value={{
        latitude: location?.latitude ?? null,
        longitude: location?.longitude ?? null,
        hasLocation: location !== null,
        status,
        loading,
        requesting,
        requestLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  return useContext(LocationContext);
}
