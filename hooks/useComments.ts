import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { CommentWithPet, ReactionType } from "@/types/database";

export function useComments(postId: string) {
  const [comments, setComments] = useState<CommentWithPet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    const { data, error } = await supabase
      .from("comments")
      .select(
        `
        *,
        pet:pets(*),
        author:users!comments_author_id_fkey(id, name, avatar_url),
        comment_reactions(*)
      `
      )
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setError(null);
    const allComments = (data ?? []) as CommentWithPet[];
    const byId = new Map<string, CommentWithPet>();
    const topLevel: CommentWithPet[] = [];

    for (const comment of allComments) {
      byId.set(comment.id, comment);
      if (!comment.parent_comment_id) {
        topLevel.push({ ...comment, replies: [] });
      }
    }

    function findRoot(commentId: string): string {
      const comment = byId.get(commentId);
      if (!comment || !comment.parent_comment_id) return commentId;
      return findRoot(comment.parent_comment_id);
    }

    for (const comment of allComments) {
      if (comment.parent_comment_id) {
        const rootId = findRoot(comment.id);
        const root = topLevel.find((c) => c.id === rootId);
        if (root) {
          root.replies!.push(comment);
        }
      }
    }

    setComments(topLevel);
    setLoading(false);
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const addComment = useCallback(
    async (
      content: string,
      authorId: string,
      petId: string,
      parentCommentId?: string
    ) => {
      const { error } = await supabase.from("comments").insert({
        post_id: postId,
        author_id: authorId,
        pet_id: petId,
        content,
        parent_comment_id: parentCommentId ?? null,
      });

      if (error) {
        console.error("Failed to add comment:", error.message);
        return false;
      }

      await fetchComments();
      return true;
    },
    [postId, fetchComments]
  );

  const toggleCommentReaction = useCallback(
    async (commentId: string, userId: string, type: ReactionType) => {
      const { data: existing } = await supabase
        .from("comment_reactions")
        .select("id, type")
        .eq("comment_id", commentId)
        .eq("user_id", userId)
        .maybeSingle();

      if (existing) {
        if (existing.type === type) {
          await supabase.from("comment_reactions").delete().eq("id", existing.id);
        } else {
          await supabase
            .from("comment_reactions")
            .update({ type })
            .eq("id", existing.id);
        }
      } else {
        await supabase.from("comment_reactions").insert({
          comment_id: commentId,
          user_id: userId,
          type,
        });
      }

      await fetchComments();
    },
    [fetchComments]
  );

  return { comments, loading, error, refresh: fetchComments, addComment, toggleCommentReaction };
}
