-- Migration 014: Feed radius follows the user's matching-preference radius.
--
-- Previously nearby_post_ids took a client-supplied radius_miles (the client
-- hardcoded 10). The Distance slider in Matching Preferences (matching_preferences.radius_miles)
-- already drives swipe distance via get_swipeable_pets, but the feed ignored it.
-- This makes the feed read the same preference server-side, so "Distance" means
-- one thing across swipe and feed. The radius_miles parameter is kept for backward
-- compatibility but is now ignored.

CREATE OR REPLACE FUNCTION nearby_post_ids(
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  radius_miles INTEGER DEFAULT 10,          
  cursor_created_at TIMESTAMPTZ DEFAULT NULL,
  page_size INTEGER DEFAULT 20,
  p_type post_type DEFAULT NULL
)
RETURNS TABLE (post_id UUID)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_radius_miles INT;
BEGIN
  SELECT COALESCE(mp.radius_miles, 10)
  INTO v_radius_miles
  FROM matching_preferences mp
  WHERE mp.user_id = auth.uid();

  IF NOT FOUND OR v_radius_miles IS NULL THEN
    v_radius_miles := 10;
  END IF;

  RETURN QUERY
  SELECT p.id AS post_id
  FROM posts p
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
