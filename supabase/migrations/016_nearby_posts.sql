-- Migration 016: Single-round-trip feed fetch.
--
-- Previously the feed took TWO calls: nearby_post_ids (IDs only), then a
-- PostgREST hydrate query that embedded reactions(*) and comments(count).
-- On a real device the double network round-trip, plus pulling every reaction
-- ROW per post just to compute a count and "did I react" which made the feed slow.
--
-- nearby_posts mirrors the swipe path: one SECURITY DEFINER RPC that does the
-- spatial filter AND returns fully hydrated rows, with reactions/comments
-- pre-aggregated server-side. reaction_count + my_reaction replace reactions(*);
-- comment_count replaces comments(count). Radius still follows the user's
-- matching preference (migration 014), defaulting to 10 miles.
--
-- nearby_post_ids is left in place for backward compatibility but is no longer
-- called by the client.

CREATE OR REPLACE FUNCTION nearby_posts(
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  cursor_created_at TIMESTAMPTZ DEFAULT NULL,
  page_size INTEGER DEFAULT 20,
  p_type post_type DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  author_id UUID,
  pet_id UUID,
  content TEXT,
  images TEXT[],
  type post_type,
  created_at TIMESTAMPTZ,
  pet JSONB,
  author JSONB,
  reaction_count INTEGER,
  my_reaction reaction_type,
  comment_count INTEGER
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_radius_miles INT;
  v_uid UUID := auth.uid();
BEGIN
  SELECT COALESCE(mp.radius_miles, 10)
  INTO v_radius_miles
  FROM matching_preferences mp
  WHERE mp.user_id = v_uid;

  IF NOT FOUND OR v_radius_miles IS NULL THEN
    v_radius_miles := 10;
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    p.author_id,
    p.pet_id,
    p.content,
    p.images,
    p.type,
    p.created_at,
    CASE WHEN pet.id IS NULL THEN NULL ELSE to_jsonb(pet) END AS pet,
    jsonb_build_object(
      'id', u.id,
      'name', u.name,
      'avatar_url', u.avatar_url
    ) AS author,
    COALESCE(rc.cnt, 0)::INTEGER AS reaction_count,
    mr.type AS my_reaction,
    COALESCE(cc.cnt, 0)::INTEGER AS comment_count
  FROM posts p
  JOIN users u ON u.id = p.author_id
  LEFT JOIN pets pet ON pet.id = p.pet_id
  LEFT JOIN LATERAL (
    SELECT COUNT(*) AS cnt FROM reactions r WHERE r.post_id = p.id
  ) rc ON TRUE
  LEFT JOIN LATERAL (
    SELECT COUNT(*) AS cnt FROM comments c WHERE c.post_id = p.id
  ) cc ON TRUE
  LEFT JOIN reactions mr ON mr.post_id = p.id AND mr.user_id = v_uid
  WHERE p.location IS NOT NULL
    AND ST_DWithin(
      p.location,
      ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
      v_radius_miles * 1609.34
    )
    AND (cursor_created_at IS NULL OR p.created_at < cursor_created_at)
    AND (p_type IS NULL OR p.type = p_type)
  ORDER BY p.created_at DESC
  LIMIT page_size;
END;
$$;
