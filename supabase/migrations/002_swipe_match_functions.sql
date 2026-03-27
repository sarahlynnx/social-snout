-- ============================================================================
-- Migration 002: Swipe & Match Functions
-- Atomic swipe handling + server-side pet filtering for the swipe deck
-- ============================================================================

-- handle_swipe: Records a swipe and atomically creates a match if mutual
-- SECURITY DEFINER so it can insert into matches regardless of RLS
-- Returns JSON: { "matched": bool, "match_id": uuid|null }
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

  -- Record the swipe (swiper_id is the USER, pet_id is the pet being swiped on)
  INSERT INTO swipes (swiper_id, pet_id, direction)
  VALUES (auth.uid(), p_swiped_pet_id, p_direction)
  ON CONFLICT (swiper_id, pet_id) DO NOTHING;

  -- Check for mutual match only on RIGHT swipes
  IF p_direction = 'RIGHT' THEN
    -- Does the swiped pet's owner have a RIGHT swipe on our pet?
    SELECT EXISTS (
      SELECT 1 FROM swipes
      WHERE swiper_id = v_swiped_owner_id
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

      -- Create match (ignore if already exists)
      INSERT INTO matches (pet_a_id, pet_b_id, user_a_id, user_b_id)
      VALUES (v_pet_a, v_pet_b, v_user_a, v_user_b)
      ON CONFLICT (pet_a_id, pet_b_id) DO NOTHING
      RETURNING id INTO v_match_id;

      -- If we got a match_id, it's a new match
      IF v_match_id IS NOT NULL THEN
        RETURN json_build_object('matched', true, 'match_id', v_match_id);
      END IF;
    END IF;
  END IF;

  RETURN json_build_object('matched', false, 'match_id', null);
END;
$$;

-- get_swipeable_pets: Returns pets the user hasn't swiped on yet
-- Excludes the user's own pets and already-swiped pets
-- Joins with users to return owner info
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
BEGIN
  -- Get the owner of the requesting pet
  SELECT p.owner_id INTO v_owner_id
  FROM pets p WHERE p.id = p_pet_id;

  IF v_owner_id IS NULL OR v_owner_id != auth.uid() THEN
    RAISE EXCEPTION 'You do not own this pet';
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
  WHERE p.owner_id != v_owner_id                    -- not my own pets
    AND p.id NOT IN (                                -- not already swiped
      SELECT s.pet_id FROM swipes s
      WHERE s.swiper_id = v_owner_id
    )
  ORDER BY random()
  LIMIT p_limit;
END;
$$;
