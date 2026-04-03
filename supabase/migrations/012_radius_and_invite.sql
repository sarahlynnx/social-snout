-- ============================================================================
-- Migration 012: Add radius preference + invite_user function
-- ============================================================================

-- 1. Add radius_miles column to matching_preferences
ALTER TABLE matching_preferences
  ADD COLUMN IF NOT EXISTS radius_miles INTEGER NOT NULL DEFAULT 10
  CHECK (radius_miles >= 1 AND radius_miles <= 100);

-- 2. Replace get_swipeable_pets to include distance filtering
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
  v_user_location geography;
  v_pet_types pet_type[];
  v_sizes pet_size[];
  v_age_min INT;
  v_age_max INT;
  v_required_tags TEXT[];
  v_radius_miles INT;
BEGIN
  -- Get the owner of the requesting pet
  SELECT p.owner_id INTO v_owner_id
  FROM pets p WHERE p.id = p_pet_id;

  IF v_owner_id IS NULL OR v_owner_id != auth.uid() THEN
    RAISE EXCEPTION 'You do not own this pet';
  END IF;

  -- Get the requesting user's location
  SELECT u.location INTO v_user_location
  FROM users u WHERE u.id = v_owner_id;

  -- If user has no location, return empty result set
  IF v_user_location IS NULL THEN
    RETURN;
  END IF;

  -- Load preferences (defaults if no row exists)
  SELECT
    COALESCE(mp.pet_types, ARRAY['DOG','CAT']::pet_type[]),
    COALESCE(mp.sizes, ARRAY['SMALL','MEDIUM','LARGE']::pet_size[]),
    COALESCE(mp.age_min, 0),
    COALESCE(mp.age_max, 10),
    COALESCE(mp.required_tags, '{}'),
    COALESCE(mp.radius_miles, 10)
  INTO v_pet_types, v_sizes, v_age_min, v_age_max, v_required_tags, v_radius_miles
  FROM matching_preferences mp
  WHERE mp.user_id = v_owner_id;

  -- If no preferences row found, use show-all defaults
  IF NOT FOUND THEN
    v_pet_types := ARRAY['DOG','CAT']::pet_type[];
    v_sizes := ARRAY['SMALL','MEDIUM','LARGE']::pet_size[];
    v_age_min := 0;
    v_age_max := 10;
    v_required_tags := '{}';
    v_radius_miles := 10;
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
    AND u.location IS NOT NULL
    AND ST_DWithin(v_user_location, u.location, v_radius_miles * 1609.34)
  ORDER BY random()
  LIMIT p_limit;
END;
$$;

-- 3. Invite user function (sends Supabase invite email)
-- Note: This function just tracks who invited whom.
CREATE TABLE IF NOT EXISTS invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  invited_email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(inviter_id, invited_email)
);

ALTER TABLE invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own invites"
  ON invites FOR SELECT USING (auth.uid() = inviter_id);

CREATE POLICY "Users can insert own invites"
  ON invites FOR INSERT WITH CHECK (auth.uid() = inviter_id);
