-- ============================================================================
-- Migration 011: Account deletion RPC
-- Deletes all user data and their auth.users entry
-- Must be SECURITY DEFINER to access auth schema
-- ============================================================================

CREATE OR REPLACE FUNCTION delete_user_account(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify the caller is deleting their own account
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'You can only delete your own account';
  END IF;

  -- Delete user's reactions
  DELETE FROM reactions WHERE user_id = p_user_id;

  -- Delete user's comment reactions
  DELETE FROM comment_reactions WHERE user_id = p_user_id;

  -- Delete user's comments
  DELETE FROM comments WHERE author_id = p_user_id;

  -- Delete user's posts (cascades to comments/reactions on those posts)
  DELETE FROM posts WHERE author_id = p_user_id;

  -- Delete messages in user's matches
  DELETE FROM messages WHERE sender_id = p_user_id;

  -- Delete user's matches (cascades to remaining messages)
  DELETE FROM matches WHERE user_a_id = p_user_id OR user_b_id = p_user_id;

  -- Delete user's swipes
  DELETE FROM swipes WHERE swiper_id = p_user_id;

  -- Delete user's matching preferences
  DELETE FROM matching_preferences WHERE user_id = p_user_id;

  -- Delete user's pets
  DELETE FROM pets WHERE owner_id = p_user_id;

  -- Delete user profile (will cascade from auth.users, but explicit for clarity)
  DELETE FROM users WHERE id = p_user_id;

  -- Delete from auth.users (requires SECURITY DEFINER)
  DELETE FROM auth.users WHERE id = p_user_id;
END;
$$;
