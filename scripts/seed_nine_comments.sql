-- ============================================================================
-- Give one post a full comment thread: 9 real comments (one per user) on
-- Scout's "treat cabinet" post (d9999999). Run in the Supabase SQL Editor.
-- Idempotent: clears d9's comments first, then inserts exactly 9.
-- ============================================================================

BEGIN;

-- Start clean so re-running always yields exactly 9 comments on this post.
DELETE FROM comments WHERE post_id = 'd9999999-9999-9999-9999-999999999999';

-- 9 top-level comments, one from each of the other 9 seed accounts, each posting
-- as one of their pets. Content is real/varied and on-topic (Scout learned to
-- open the treat cabinet). IDs auto-generate (gen_random_uuid default).
INSERT INTO comments (post_id, author_id, pet_id, parent_comment_id, content, created_at) VALUES
  ('d9999999-9999-9999-9999-999999999999', 'a1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', NULL,
   'Buddy is taking notes. Please do NOT teach him this, I am begging you', now() - interval '4 hours'),
  ('d9999999-9999-9999-9999-999999999999', 'a2222222-2222-2222-2222-222222222222', 'b3333333-3333-3333-3333-333333333333', NULL,
   'Mochi has short legs and STILL reaches the counter somehow. Nowhere is safe.', now() - interval '3 hours' - interval '40 minutes'),
  ('d9999999-9999-9999-9999-999999999999', 'a3333333-3333-3333-3333-333333333333', 'b4444444-4444-4444-4444-444444444444', NULL,
   'Kiko just screams at the cabinet until I open it. Different tactics, same goal.', now() - interval '3 hours' - interval '10 minutes'),
  ('d9999999-9999-9999-9999-999999999999', 'a4444444-4444-4444-4444-444444444444', 'b6666666-6666-6666-6666-666666666666', NULL,
   'Rosie is too polite to break in but she will stare at the treat jar until you feel guilty.', now() - interval '2 hours' - interval '30 minutes'),
  ('d9999999-9999-9999-9999-999999999999', 'a5555555-5555-5555-5555-555555555555', 'b7777777-7777-7777-7777-777777777777', NULL,
   'Chais nose would have found those treats weeks ago. The cabinet was never a real barrier.', now() - interval '2 hours'),
  ('d9999999-9999-9999-9999-999999999999', 'a6666666-6666-6666-6666-666666666666', 'b8888888-8888-8888-8888-222222222222', NULL,
   'Pepper opens the fridge. We childproofed the whole kitchen. Solidarity, Scout.', now() - interval '1 hour' - interval '30 minutes'),
  ('d9999999-9999-9999-9999-999999999999', 'a7777777-7777-7777-7777-777777777777', 'b9999999-9999-9999-9999-111111111111', NULL,
   'Olive cant reach anything but she supervises every treat retrieval like a tiny manager.', now() - interval '1 hour'),
  ('d9999999-9999-9999-9999-999999999999', 'a8888888-8888-8888-8888-888888888888', 'ba000000-0000-0000-0000-111111111111', NULL,
   'Yuki would just tell me she deserves the treats. Loudly. For a full hour.', now() - interval '40 minutes'),
  ('d9999999-9999-9999-9999-999999999999', 'aa000000-0000-0000-0000-000000000000', 'bc000000-0000-0000-0000-111111111111', NULL,
   'Bruno leans on the cabinet until it opens from body weight alone. Works every time.', now() - interval '20 minutes');

COMMIT;

-- Verify (should return 9):
-- SELECT count(*) FROM comments WHERE post_id = 'd9999999-9999-9999-9999-999999999999';
