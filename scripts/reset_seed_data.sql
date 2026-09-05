-- ============================================================================
-- Reset SocialSnout data to the initial seed state.
-- ============================================================================
-- Run this in the Supabase SQL Editor, THEN re-run the full `supabase/seed.sql`.
--
-- What it does: clears everything that accumulates during testing —
--   swipes, matches, messages, posts, comments (incl. reactions on both) —
-- and resets matching preferences. The 10 seed users and 18 pets are KEPT
-- (auth.users / public.users / pets are untouched), so re-running seed.sql
-- restores the pristine initial content while the accounts stay valid.
--
-- This is destructive for the mutable content (removes ALL posts/comments/
-- matches/messages/swipes/reactions, including the seed's own — seed.sql puts
-- the seed ones back). Order/cascade is handled by TRUNCATE ... CASCADE.
-- ============================================================================

BEGIN;

-- Clears posts, comments, reactions, swipes, matches, messages.
-- CASCADE also clears anything FK-referencing them (e.g. comment_reactions,
-- comment replies). users / pets are PARENTS of these tables, so they are NOT
-- affected.
TRUNCATE posts, comments, reactions, swipes, matches, messages CASCADE;

-- Reset matching preferences to seed defaults (seed.sql re-inserts them).
DELETE FROM matching_preferences;

COMMIT;

-- Next step: re-run supabase/seed.sql to restore the initial seed content.
