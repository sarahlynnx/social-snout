-- Migration 018: Per-pet matching preferences (including distance).
--
-- matching_preferences was keyed by user_id (UNIQUE(user_id)) — one row per
-- user — so setting prefs on one pet changed them for all of that user's pets.
-- This makes preferences per-PET: add a pet_id column, move uniqueness to
-- (pet_id), and have both the swipe filter (get_swipeable_pets) and the feed
-- radius (nearby_posts) read the ACTIVE pet's row. A cat and a dog owned by the
-- same person now have independent type/size/gender/age filters AND distance.
--
-- App changes ship alongside this: useMatchingPreferences reads/writes by the
-- active pet, and useFeed passes the active pet to nearby_posts.
--
-- NOTE: run reset_seed_data.sql (deletes matching_preferences) then the updated
-- seed.sql after this, so prefs are repopulated per-pet.

-- 1. Schema: add pet_id, move uniqueness from user_id to pet_id. Nullable so the
--    migration applies over existing per-user rows (which get deleted + reseeded).
ALTER TABLE matching_preferences
  ADD COLUMN IF NOT EXISTS pet_id UUID REFERENCES pets(id) ON DELETE CASCADE;

ALTER TABLE matching_preferences DROP CONSTRAINT IF EXISTS matching_preferences_user_id_key;
ALTER TABLE matching_preferences DROP CONSTRAINT IF EXISTS matching_preferences_pet_id_key;
ALTER TABLE matching_preferences ADD CONSTRAINT matching_preferences_pet_id_key
  UNIQUE (pet_id);

CREATE INDEX IF NOT EXISTS idx_matching_preferences_pet_id ON matching_preferences(pet_id);

-- 2. get_swipeable_pets: load preferences for the ACTIVE pet (was: the user).
--    Same shape/return as migration 017 — only the preference lookup changes.
CREATE OR REPLACE FUNCTION get_swipeable_pets(
  p_pet_id UUID,
  p_limit INT DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  owner_id UUID,
  name TEXT,
  type pet_type,
  breed TEXT,
  age INT,
  size pet_size,
  gender pet_gender,
  bio TEXT,
  photos TEXT[],
  tags TEXT[],
  created_at TIMESTAMPTZ,
  owner_name TEXT,
  owner_avatar_url TEXT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner_id UUID;
  v_pet_types pet_type[];
  v_sizes pet_size[];
  v_genders pet_gender[];
  v_age_min INT;
  v_age_max INT;
  v_required_tags TEXT[];
BEGIN
  SELECT p.owner_id INTO v_owner_id
  FROM pets p WHERE p.id = p_pet_id;

  IF v_owner_id IS NULL OR v_owner_id != auth.uid() THEN
    RAISE EXCEPTION 'You do not own this pet';
  END IF;

  -- Preferences for THIS pet (defaults if none saved yet).
  SELECT
    COALESCE(mp.pet_types, ARRAY['DOG','CAT']::pet_type[]),
    COALESCE(mp.sizes, ARRAY['SMALL','MEDIUM','LARGE']::pet_size[]),
    COALESCE(mp.genders, ARRAY['MALE','FEMALE','UNKNOWN']::pet_gender[]),
    COALESCE(mp.age_min, 0),
    COALESCE(mp.age_max, 10),
    COALESCE(mp.required_tags, '{}')
  INTO v_pet_types, v_sizes, v_genders, v_age_min, v_age_max, v_required_tags
  FROM matching_preferences mp
  WHERE mp.pet_id = p_pet_id;

  IF NOT FOUND THEN
    v_pet_types := ARRAY['DOG','CAT']::pet_type[];
    v_sizes := ARRAY['SMALL','MEDIUM','LARGE']::pet_size[];
    v_genders := ARRAY['MALE','FEMALE','UNKNOWN']::pet_gender[];
    v_age_min := 0;
    v_age_max := 10;
    v_required_tags := '{}';
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    p.owner_id,
    p.name,
    p.type,
    p.breed,
    p.age,
    p.size,
    p.gender,
    p.bio,
    p.photos,
    p.tags,
    p.created_at,
    u.name AS owner_name,
    u.avatar_url AS owner_avatar_url
  FROM pets p
  JOIN users u ON u.id = p.owner_id
  WHERE p.owner_id != v_owner_id
    AND p.id NOT IN (
      SELECT s.pet_id FROM swipes s
      WHERE s.swiper_pet_id = p_pet_id
    )
    AND p.type = ANY(v_pet_types)
    AND p.size = ANY(v_sizes)
    AND p.gender = ANY(v_genders)
    AND p.age >= v_age_min
    AND p.age <= v_age_max
    AND p.tags @> v_required_tags
  ORDER BY random()
  LIMIT p_limit;
END;
$$;

-- 3. nearby_posts: take the active pet and read ITS radius (was: the user's).
--    Adds p_pet_id; drop the old 5-arg signature first (changing the arg list
--    can't be done with a plain CREATE OR REPLACE).
DROP FUNCTION IF EXISTS nearby_posts(double precision, double precision, timestamptz, integer, post_type);
CREATE OR REPLACE FUNCTION nearby_posts(
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  cursor_created_at TIMESTAMPTZ DEFAULT NULL,
  page_size INTEGER DEFAULT 20,
  p_type post_type DEFAULT NULL,
  p_pet_id UUID DEFAULT NULL
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
  -- Radius follows the ACTIVE pet's matching preference (default 10 miles).
  SELECT COALESCE(mp.radius_miles, 10)
  INTO v_radius_miles
  FROM matching_preferences mp
  WHERE mp.pet_id = p_pet_id;

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
    CASE WHEN pt.id IS NULL THEN NULL ELSE to_jsonb(pt) END AS pet,
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
  LEFT JOIN pets pt ON pt.id = p.pet_id
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
