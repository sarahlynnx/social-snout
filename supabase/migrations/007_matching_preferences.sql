-- ============================================================================
-- Migration 007: Matching Preferences
-- Per-user preferences to filter the swipe deck (private, not on public profile)
-- ============================================================================

-- Table: one row per user
CREATE TABLE matching_preferences (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pet_types     pet_type[] NOT NULL DEFAULT '{DOG,CAT}',
  sizes         pet_size[] NOT NULL DEFAULT '{SMALL,MEDIUM,LARGE}',
  age_min       INTEGER NOT NULL DEFAULT 0 CHECK (age_min >= 0 AND age_min <= 10),
  age_max       INTEGER NOT NULL DEFAULT 10 CHECK (age_max >= 0 AND age_max <= 10),
  required_tags TEXT[] NOT NULL DEFAULT '{}',
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id),
  CHECK (age_min <= age_max)
);

-- RLS: strictly private — only the owning user can access their own row
ALTER TABLE matching_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own preferences"
  ON matching_preferences FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON matching_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON matching_preferences FOR UPDATE USING (auth.uid() = user_id);

-- GIN index for efficient tags containment queries
CREATE INDEX IF NOT EXISTS idx_pets_tags ON pets USING GIN(tags);

-- Replace get_swipeable_pets to apply preference filters
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
  v_age_min INT;
  v_age_max INT;
  v_required_tags TEXT[];
BEGIN
  -- Get the owner of the requesting pet
  SELECT p.owner_id INTO v_owner_id
  FROM pets p WHERE p.id = p_pet_id;

  IF v_owner_id IS NULL OR v_owner_id != auth.uid() THEN
    RAISE EXCEPTION 'You do not own this pet';
  END IF;

  -- Load preferences (defaults if no row exists)
  SELECT
    COALESCE(mp.pet_types, ARRAY['DOG','CAT']::pet_type[]),
    COALESCE(mp.sizes, ARRAY['SMALL','MEDIUM','LARGE']::pet_size[]),
    COALESCE(mp.age_min, 0),
    COALESCE(mp.age_max, 10),
    COALESCE(mp.required_tags, '{}')
  INTO v_pet_types, v_sizes, v_age_min, v_age_max, v_required_tags
  FROM matching_preferences mp
  WHERE mp.user_id = v_owner_id;

  -- If no preferences row found, use show-all defaults
  IF NOT FOUND THEN
    v_pet_types := ARRAY['DOG','CAT']::pet_type[];
    v_sizes := ARRAY['SMALL','MEDIUM','LARGE']::pet_size[];
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
      WHERE s.swiper_id = v_owner_id
    )
    AND p.type = ANY(v_pet_types)
    AND p.size = ANY(v_sizes)
    AND p.age >= v_age_min
    AND p.age <= v_age_max
    AND p.tags @> v_required_tags
  ORDER BY random()
  LIMIT p_limit;
END;
$$;
