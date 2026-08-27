-- Seed 20 top-level comments on Buddy's most recent post, authored by the OTHER
-- test accounts (round-robin). Run in the Supabase SQL Editor. Safe to re-run
-- (it just adds another 20). Requires: a pet named "Buddy" that has at least one
-- post, and at least one other user who owns a pet.

WITH buddy_post AS (
  SELECT p.id AS post_id, pt.owner_id AS buddy_owner
  FROM posts p
  JOIN pets pt ON pt.id = p.pet_id
  WHERE pt.name ILIKE 'buddy'
  ORDER BY p.created_at DESC
  LIMIT 1
),
one_pet_per_user AS (
  SELECT DISTINCT ON (u.id) u.id AS user_id, pt.id AS pet_id, u.created_at
  FROM users u
  JOIN pets pt ON pt.owner_id = u.id
  WHERE u.id <> (SELECT buddy_owner FROM buddy_post)
  ORDER BY u.id, pt.created_at
),
commenters AS (
  SELECT user_id, pet_id, row_number() OVER (ORDER BY created_at) AS rn
  FROM one_pet_per_user
),
cc AS (SELECT count(*)::int AS n FROM commenters)
INSERT INTO comments (post_id, author_id, pet_id, content, parent_comment_id, created_at)
SELECT
  bp.post_id,
  c.user_id,
  c.pet_id,
  'Test comment #' || g.n || ' — such a good boy, Buddy!',
  NULL,
  now() - ((20 - g.n) * interval '1 minute')
FROM buddy_post bp
CROSS JOIN generate_series(1, 20) AS g(n)
JOIN cc ON true
JOIN commenters c ON c.rn = (((g.n - 1) % cc.n) + 1);

-- Verify how many comments Buddy's latest post now has:
-- SELECT count(*) FROM comments c
-- JOIN posts p ON p.id = c.post_id
-- JOIN pets pt ON pt.id = p.pet_id
-- WHERE pt.name ILIKE 'buddy';

-- Undo the seed (removes ALL comments whose text starts with "Test comment #"):
-- DELETE FROM comments WHERE content LIKE 'Test comment #%';
