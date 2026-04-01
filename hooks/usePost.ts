import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { PostWithDetails } from "@/types/database";

export function usePost(postId: string) {
  const [post, setPost] = useState<PostWithDetails | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPost = useCallback(async () => {
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
      .eq("id", postId)
      .single();

    if (error) {
      console.error("Failed to fetch post:", error.message);
      setLoading(false);
      return;
    }

    setPost(data as PostWithDetails);
    setLoading(false);
  }, [postId]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  return { post, loading, refresh: fetchPost };
}
