-- Migration 013: Add gender to pets and matching preferences

CREATE TYPE pet_gender AS ENUM ('MALE', 'FEMALE', 'UNKNOWN');

ALTER TABLE pets ADD COLUMN gender pet_gender NOT NULL DEFAULT 'UNKNOWN';

ALTER TABLE matching_preferences ADD COLUMN genders pet_gender[] NOT NULL DEFAULT '{MALE,FEMALE,UNKNOWN}';

-- Replace get_swipeable_pets to include gender filtering
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
  SELECT p.owner_id INTO v_owner_id
  FROM pets p WHERE p.id = p_pet_id;

  IF v_owner_id IS NULL OR v_owner_id != auth.uid() THEN
    RAISE EXCEPTION 'You do not own this pet';
  END IF;

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
      WHERE s.swiper_id = v_owner_id
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
