-- Enable PostGIS for location-based queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- Enums
CREATE TYPE pet_type AS ENUM ('DOG', 'CAT');
CREATE TYPE pet_size AS ENUM ('SMALL', 'MEDIUM', 'LARGE');
CREATE TYPE swipe_direction AS ENUM ('RIGHT', 'LEFT');
CREATE TYPE post_type AS ENUM ('GENERAL', 'LOST_PET', 'EVENT', 'PHOTO');
CREATE TYPE reaction_type AS ENUM ('LIKE', 'HEART', 'LAUGH', 'WOW');

-- Users table
-- The id references auth.users so Supabase Auth and our users table stay in sync
CREATE TABLE users (
  id         TEXT PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT UNIQUE NOT NULL,
  name       TEXT NOT NULL,
  avatar_url TEXT,
  location   GEOGRAPHY(Point, 4326),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Pets table
CREATE TABLE pets (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  owner_id   TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  type       pet_type NOT NULL,
  breed      TEXT,
  age        INTEGER NOT NULL CHECK (age >= 0),
  size       pet_size NOT NULL,
  bio        TEXT,
  photos     TEXT[] NOT NULL DEFAULT '{}',
  tags       TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pets_owner_id ON pets(owner_id);

-- Swipes table
CREATE TABLE swipes (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  swiper_id  TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pet_id     TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  direction  swipe_direction NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(swiper_id, pet_id)
);

CREATE INDEX idx_swipes_swiper_id ON swipes(swiper_id);
CREATE INDEX idx_swipes_pet_id ON swipes(pet_id);

-- Matches table
CREATE TABLE matches (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  pet_a_id   TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  pet_b_id   TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  user_a_id  TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_b_id  TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(pet_a_id, pet_b_id)
);

CREATE INDEX idx_matches_user_a_id ON matches(user_a_id);
CREATE INDEX idx_matches_user_b_id ON matches(user_b_id);

-- Messages table
CREATE TABLE messages (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  match_id   TEXT NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  sender_id  TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content    TEXT NOT NULL,
  read       BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_match_id ON messages(match_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);

-- Posts table
CREATE TABLE posts (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  author_id  TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pet_id     TEXT REFERENCES pets(id) ON DELETE SET NULL,
  content    TEXT NOT NULL,
  images     TEXT[] NOT NULL DEFAULT '{}',
  type       post_type NOT NULL DEFAULT 'GENERAL',
  location   GEOGRAPHY(Point, 4326),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_posts_location ON posts USING GIST(location);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);

-- Comments table
CREATE TABLE comments (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  post_id    TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id  TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_comments_post_id ON comments(post_id);

-- Reactions table
CREATE TABLE reactions (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  post_id    TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type       reaction_type NOT NULL,
  UNIQUE(post_id, user_id)
);

CREATE INDEX idx_reactions_post_id ON reactions(post_id);

-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users: can read all profiles, can only update own profile
CREATE POLICY "Users can read all profiles"
  ON users FOR SELECT USING (true);

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT WITH CHECK (auth.uid()::text = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE USING (auth.uid()::text = id);

-- Pets: can read all pets, can only manage own pets
CREATE POLICY "Pets are viewable by everyone"
  ON pets FOR SELECT USING (true);

CREATE POLICY "Users can create own pets"
  ON pets FOR INSERT WITH CHECK (auth.uid()::text = owner_id);

CREATE POLICY "Users can update own pets"
  ON pets FOR UPDATE USING (auth.uid()::text = owner_id);

CREATE POLICY "Users can delete own pets"
  ON pets FOR DELETE USING (auth.uid()::text = owner_id);

-- Swipes: users can read and create their own swipes
CREATE POLICY "Users can read own swipes"
  ON swipes FOR SELECT USING (auth.uid()::text = swiper_id);

CREATE POLICY "Users can create own swipes"
  ON swipes FOR INSERT WITH CHECK (auth.uid()::text = swiper_id);

-- Matches: users can read matches they are part of
CREATE POLICY "Users can read own matches"
  ON matches FOR SELECT
  USING (auth.uid()::text = user_a_id OR auth.uid()::text = user_b_id);

CREATE POLICY "Users can create matches"
  ON matches FOR INSERT WITH CHECK (
    auth.uid()::text = user_a_id OR auth.uid()::text = user_b_id
  );

-- Messages: users can read/send messages in their matches
CREATE POLICY "Users can read messages in their matches"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = messages.match_id
      AND (auth.uid()::text = matches.user_a_id OR auth.uid()::text = matches.user_b_id)
    )
  );

CREATE POLICY "Users can send messages in their matches"
  ON messages FOR INSERT WITH CHECK (
    auth.uid()::text = sender_id
    AND EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = match_id
      AND (auth.uid()::text = matches.user_a_id OR auth.uid()::text = matches.user_b_id)
    )
  );

CREATE POLICY "Users can mark messages as read"
  ON messages FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = messages.match_id
      AND (auth.uid()::text = matches.user_a_id OR auth.uid()::text = matches.user_b_id)
    )
  );

-- Posts: everyone can read, authors can manage
CREATE POLICY "Posts are viewable by everyone"
  ON posts FOR SELECT USING (true);

CREATE POLICY "Users can create posts"
  ON posts FOR INSERT WITH CHECK (auth.uid()::text = author_id);

CREATE POLICY "Users can update own posts"
  ON posts FOR UPDATE USING (auth.uid()::text = author_id);

CREATE POLICY "Users can delete own posts"
  ON posts FOR DELETE USING (auth.uid()::text = author_id);

-- Comments: everyone can read, users can manage their own
CREATE POLICY "Comments are viewable by everyone"
  ON comments FOR SELECT USING (true);

CREATE POLICY "Users can create comments"
  ON comments FOR INSERT WITH CHECK (auth.uid()::text = author_id);

CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE USING (auth.uid()::text = author_id);

-- Reactions: everyone can read, users can manage their own
CREATE POLICY "Reactions are viewable by everyone"
  ON reactions FOR SELECT USING (true);

CREATE POLICY "Users can create reactions"
  ON reactions FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own reactions"
  ON reactions FOR DELETE USING (auth.uid()::text = user_id);

-- Spatial index on users location for nearby queries
CREATE INDEX idx_users_location ON users USING GIST(location);

-- Helper function: find nearby users within a radius (in miles)
CREATE OR REPLACE FUNCTION nearby_users(lat DOUBLE PRECISION, lng DOUBLE PRECISION, radius_miles INTEGER DEFAULT 10)
RETURNS SETOF users AS $$
  SELECT *
  FROM users
  WHERE location IS NOT NULL
  AND ST_DWithin(
    location,
    ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
    radius_miles * 1609.34  -- Convert miles to meters
  );
$$ LANGUAGE sql STABLE;

-- Helper function: find nearby posts within a radius (in miles)
CREATE OR REPLACE FUNCTION nearby_posts(lat DOUBLE PRECISION, lng DOUBLE PRECISION, radius_miles INTEGER DEFAULT 10)
RETURNS SETOF posts AS $$
  SELECT *
  FROM posts
  WHERE location IS NOT NULL
  AND ST_DWithin(
    location,
    ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
    radius_miles * 1609.34
  )
  ORDER BY created_at DESC;
$$ LANGUAGE sql STABLE;
