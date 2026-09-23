-- Migration 017: Per-pet swipe decks.
--
-- Previously swipes were tracked per USER: the `swipes` table keyed uniqueness on
-- (swiper_id, pet_id) and get_swipeable_pets/handle_swipe filtered by swiper_id
-- (auth.uid()). So all of a user's pets shared one swipe history — swiping through
-- one pet's deck also drained the other's, and matches were effectively user-level.
--
-- This makes swiping per-PET: which of MY pets did the swiping is recorded in a new
-- `swiper_pet_id` column, uniqueness moves to (swiper_pet_id, pet_id), and both
-- functions filter/check reciprocity by the ACTIVE pet. A cat and a dog owned by
-- the same person now have fully independent decks and matches. The app already
-- passes the active pet id to both RPCs, so no client change is needed.
--
-- NOTE: run reset_seed_data.sql (truncates swipes/matches) then the updated seed.sql
-- after this migration so swipe/match data is repopulated with swiper_pet_id.

-- 1. Schema: add swiper_pet_id, move the uniqueness to (swiper_pet_id, pet_id).
--    Nullable so the migration succeeds over any pre-existing rows (which get
--    truncated + reseeded); every new swipe (app + seed) sets it.
ALTER TABLE swipes
  ADD COLUMN IF NOT EXISTS swiper_pet_id UUID REFERENCES pets(id) ON DELETE CASCADE;

ALTER TABLE swipes DROP CONSTRAINT IF EXISTS swipes_swiper_id_pet_id_key;
ALTER TABLE swipes DROP CONSTRAINT IF EXISTS swipes_swiper_pet_id_pet_id_key;
ALTER TABLE swipes ADD CONSTRAINT swipes_swiper_pet_id_pet_id_key
  UNIQUE (swiper_pet_id, pet_id);

CREATE INDEX IF NOT EXISTS idx_swipes_swiper_pet_id ON swipes(swiper_pet_id);

-- 2. handle_swipe: record swiper_pet_id and check reciprocity pet-to-pet.
CREATE OR REPLACE FUNCTION handle_swipe(
  p_swiper_pet_id UUID,
  p_swiped_pet_id UUID,
  p_direction swipe_direction
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_swiper_owner_id UUID;
  v_swiped_owner_id UUID;
  v_match_id UUID;
  v_reciprocal BOOLEAN;
  v_pet_a UUID;
  v_pet_b UUID;
  v_user_a UUID;
  v_user_b UUID;
BEGIN
  -- Validate: the calling user owns the swiper pet
  SELECT owner_id INTO v_swiper_owner_id
  FROM pets WHERE id = p_swiper_pet_id;

  IF v_swiper_owner_id IS NULL OR v_swiper_owner_id != auth.uid() THEN
    RAISE EXCEPTION 'You do not own this pet';
  END IF;

  -- Get the swiped pet's owner
  SELECT owner_id INTO v_swiped_owner_id
  FROM pets WHERE id = p_swiped_pet_id;

  IF v_swiped_owner_id IS NULL THEN
    RAISE EXCEPTION 'Swiped pet not found';
  END IF;

  -- Prevent swiping on your own pet
  IF v_swiper_owner_id = v_swiped_owner_id THEN
    RAISE EXCEPTION 'Cannot swipe on your own pet';
  END IF;

  -- Record the swipe by the ACTIVE pet (swiper_pet_id), not just the user.
  INSERT INTO swipes (swiper_id, swiper_pet_id, pet_id, direction)
  VALUES (auth.uid(), p_swiper_pet_id, p_swiped_pet_id, p_direction)
  ON CONFLICT (swiper_pet_id, pet_id) DO NOTHING;

  -- Check for a mutual match only on RIGHT swipes
  IF p_direction = 'RIGHT' THEN
    -- Did the swiped pet already RIGHT-swipe our active pet?
    SELECT EXISTS (
      SELECT 1 FROM swipes
      WHERE swiper_pet_id = p_swiped_pet_id
        AND pet_id = p_swiper_pet_id
        AND direction = 'RIGHT'
    ) INTO v_reciprocal;

    IF v_reciprocal THEN
      -- Order pet IDs consistently (smaller UUID first) to prevent duplicates
      IF p_swiper_pet_id < p_swiped_pet_id THEN
        v_pet_a := p_swiper_pet_id;
        v_pet_b := p_swiped_pet_id;
        v_user_a := v_swiper_owner_id;
        v_user_b := v_swiped_owner_id;
      ELSE
        v_pet_a := p_swiped_pet_id;
        v_pet_b := p_swiper_pet_id;
        v_user_a := v_swiped_owner_id;
        v_user_b := v_swiper_owner_id;
      END IF;

      INSERT INTO matches (pet_a_id, pet_b_id, user_a_id, user_b_id)
      VALUES (v_pet_a, v_pet_b, v_user_a, v_user_b)
      ON CONFLICT (pet_a_id, pet_b_id) DO NOTHING
      RETURNING id INTO v_match_id;

      IF v_match_id IS NOT NULL THEN
        RETURN json_build_object('matched', true, 'match_id', v_match_id);
      END IF;
    END IF;
  END IF;

  RETURN json_build_object('matched', false, 'match_id', null);
END;
$$;

-- 3. get_swipeable_pets: exclude pets the ACTIVE pet has already swiped
--    (was: pets the user has swiped with any pet). Everything else matches the
--    current live definition (migration 013 — includes gender in the return and
--    gender filtering). DROP FIRST: the live function's return type differs from
--    a plain CREATE OR REPLACE, which can't change a function's return type.
DROP FUNCTION IF EXISTS get_swipeable_pets(uuid, integer);
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
    COALESCE(mp.genders, ARRAY['MALE','FEMALE','UNKNOWN']::pet_gender[]),
    COALESCE(mp.age_min, 0),
    COALESCE(mp.age_max, 10),
    COALESCE(mp.required_tags, '{}')
  INTO v_pet_types, v_sizes, v_genders, v_age_min, v_age_max, v_required_tags
  FROM matching_preferences mp
  WHERE mp.user_id = v_owner_id;

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
