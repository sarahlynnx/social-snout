import { useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { ReactionType } from "@/types/database";

export function useReactions(onUpdate: () => void) {
  const toggleReaction = useCallback(
    async (postId: string, userId: string, type: ReactionType) => {
      const { data: existing } = await supabase
        .from("reactions")
        .select("id, type")
        .eq("post_id", postId)
        .eq("user_id", userId)
        .maybeSingle();

      if (existing) {
        if (existing.type === type) {
          await supabase.from("reactions").delete().eq("id", existing.id);
        } else {
          await supabase
            .from("reactions")
            .update({ type })
            .eq("id", existing.id);
        }
      } else {
        await supabase
          .from("reactions")
          .insert({ post_id: postId, user_id: userId, type });
      }

      onUpdate();
    },
    [onUpdate]
  );

  return { toggleReaction };
}
