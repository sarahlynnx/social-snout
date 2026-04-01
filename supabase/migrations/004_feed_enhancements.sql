-- Threaded comments: add parent_comment_id for reply threading (one level deep)
ALTER TABLE comments ADD COLUMN parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE;

-- Pet-authored comments: comments show pet identity like posts
ALTER TABLE comments ADD COLUMN pet_id UUID REFERENCES pets(id) ON DELETE SET NULL;

CREATE INDEX idx_comments_parent ON comments(parent_comment_id);

-- Paginated, filterable nearby post IDs
-- Returns only IDs so the client can use .select() with FK joins for rich data
CREATE OR REPLACE FUNCTION nearby_post_ids(
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  radius_miles INTEGER DEFAULT 10,
  cursor_created_at TIMESTAMPTZ DEFAULT NULL,
  page_size INTEGER DEFAULT 20,
  p_type post_type DEFAULT NULL
)
RETURNS TABLE (post_id UUID) AS $$
  SELECT p.id AS post_id
  FROM posts p
  WHERE p.location IS NOT NULL
    AND ST_DWithin(
      p.location,
      ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
      radius_miles * 1609.34
    )
    AND (cursor_created_at IS NULL OR p.created_at < cursor_created_at)
    AND (p_type IS NULL OR p.type = p_type)
  ORDER BY p.created_at DESC
  LIMIT page_size;
$$ LANGUAGE sql STABLE;
