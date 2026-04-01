import { useState, useCallback, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useUserLocation } from "@/hooks/useUserLocation";
import { DEFAULT_RADIUS_MILES, FEED_PAGE_SIZE } from "@/constants";
import type { PostWithDetails, PostType } from "@/types/database";

export function useFeed() {
  const { latitude, longitude, hasLocation, loading: locationLoading, requestLocation } =
    useUserLocation();
  const [posts, setPosts] = useState<PostWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [activeFilter, setActiveFilter] = useState<PostType | null>(null);
  const cursorRef = useRef<string | null>(null);

  const fetchPosts = useCallback(
    async (cursor: string | null, reset: boolean) => {
      if (!latitude || !longitude) return;

      const { data: idRows, error: rpcError } = await supabase.rpc(
        "nearby_post_ids",
        {
          lat: latitude,
          lng: longitude,
          radius_miles: DEFAULT_RADIUS_MILES,
          cursor_created_at: cursor,
          page_size: FEED_PAGE_SIZE,
          p_type: activeFilter,
        }
      );

      if (rpcError) {
        console.error("Failed to fetch nearby post IDs:", rpcError.message);
        return;
      }

      const postIds = (idRows ?? []).map(
        (r: { post_id: string }) => r.post_id
      );

      if (postIds.length === 0) {
        setHasMore(false);
        if (reset) setPosts([]);
        return;
      }

      const { data, error } = await supabase
        .from("posts")
        .select(
          `
          *,
          pet:pets(*),
          author:users!posts_author_id_fkey(id, name, avatar_url),
          reactions(*),
          comments(count)
        `
        )
        .in("id", postIds)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to fetch posts:", error.message);
        return;
      }

      const newPosts = (data ?? []) as PostWithDetails[];

      if (reset) {
        setPosts(newPosts);
      } else {
        setPosts((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const unique = newPosts.filter((p) => !existingIds.has(p.id));
          return [...prev, ...unique];
        });
      }

      if (newPosts.length > 0) {
        cursorRef.current = newPosts[newPosts.length - 1].created_at;
      }
      setHasMore(newPosts.length >= FEED_PAGE_SIZE);
    },
    [latitude, longitude, activeFilter]
  );

  useEffect(() => {
    if (locationLoading || !hasLocation) {
      setLoading(false);
      return;
    }

    async function init() {
      setLoading(true);
      cursorRef.current = null;
      await fetchPosts(null, true);
      setLoading(false);
    }
    init();
  }, [hasLocation, locationLoading, fetchPosts]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    cursorRef.current = null;
    setHasMore(true);
    await fetchPosts(null, true);
    setRefreshing(false);
  }, [fetchPosts]);

  const fetchMore = useCallback(async () => {
    if (!hasMore) return;
    await fetchPosts(cursorRef.current, false);
  }, [hasMore, fetchPosts]);

  const setFilter = useCallback((filter: PostType | null) => {
    setActiveFilter(filter);
    setPosts([]);
    setHasMore(true);
    cursorRef.current = null;
  }, []);

  return {
    posts,
    loading,
    refreshing,
    hasMore,
    hasLocation,
    locationLoading,
    requestLocation,
    activeFilter,
    setFilter,
    fetchMore,
    refresh,
  };
}
