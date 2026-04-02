-- ============================================================================
-- Migration 010: Seed data for testing
-- Creates sample users, pets, posts, matches, messages, comments, reactions
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. AUTH USERS (inserted into auth.users so our FK constraint is satisfied)
-- ============================================================================
-- Using fixed UUIDs so we can reference them below

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, confirmation_token, raw_app_meta_data, raw_user_meta_data)
VALUES
  ('a1111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'emma.johnson@test.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '', '{"provider":"email","providers":["email"]}', '{"name":"Emma Johnson"}'),
  ('a2222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'mike.chen@test.com',    crypt('password123', gen_salt('bf')), now(), now(), now(), '', '{"provider":"email","providers":["email"]}', '{"name":"Mike Chen"}'),
  ('a3333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'lisa.park@test.com',     crypt('password123', gen_salt('bf')), now(), now(), now(), '', '{"provider":"email","providers":["email"]}', '{"name":"Lisa Park"}'),
  ('a4444444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'james.wilson@test.com',  crypt('password123', gen_salt('bf')), now(), now(), now(), '', '{"provider":"email","providers":["email"]}', '{"name":"James Wilson"}')
ON CONFLICT (id) DO NOTHING;

-- Also insert identities so email/password login works
INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES
  ('a1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', '{"sub":"a1111111-1111-1111-1111-111111111111","email":"emma.johnson@test.com"}', 'email', now(), now(), now()),
  ('a2222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222', '{"sub":"a2222222-2222-2222-2222-222222222222","email":"mike.chen@test.com"}',    'email', now(), now(), now()),
  ('a3333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333', '{"sub":"a3333333-3333-3333-3333-333333333333","email":"lisa.park@test.com"}',     'email', now(), now(), now()),
  ('a4444444-4444-4444-4444-444444444444', 'a4444444-4444-4444-4444-444444444444', 'a4444444-4444-4444-4444-444444444444', '{"sub":"a4444444-4444-4444-4444-444444444444","email":"james.wilson@test.com"}',  'email', now(), now(), now())
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 2. APP USERS
-- ============================================================================
-- Location: Bellevue/Seattle area (~47.4256, -122.2006) with slight offsets
-- Within ~1-2 miles of each other so they appear in the same radius

INSERT INTO users (id, email, name, avatar_url, location) VALUES
  ('a1111111-1111-1111-1111-111111111111', 'emma.johnson@test.com', 'Emma Johnson', 'https://i.pravatar.cc/300?u=emma',  ST_SetSRID(ST_MakePoint(-122.2020, 47.4260), 4326)::geography),
  ('a2222222-2222-2222-2222-222222222222', 'mike.chen@test.com',    'Mike Chen',    'https://i.pravatar.cc/300?u=mike',  ST_SetSRID(ST_MakePoint(-122.1990, 47.4270), 4326)::geography),
  ('a3333333-3333-3333-3333-333333333333', 'lisa.park@test.com',    'Lisa Park',    'https://i.pravatar.cc/300?u=lisa',  ST_SetSRID(ST_MakePoint(-122.2010, 47.4240), 4326)::geography),
  ('a4444444-4444-4444-4444-444444444444', 'james.wilson@test.com', 'James Wilson', 'https://i.pravatar.cc/300?u=james', ST_SetSRID(ST_MakePoint(-122.1980, 47.4250), 4326)::geography)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 3. PETS (6 pets across 4 owners)
-- ============================================================================
-- Using picsum.photos for pet images (stable URLs with seed)

INSERT INTO pets (id, owner_id, name, type, breed, age, size, bio, photos, tags, prompts) VALUES
  -- Emma's Golden Retriever
  ('b1111111-1111-1111-1111-111111111111',
   'a1111111-1111-1111-1111-111111111111',
   'Buddy', 'DOG', 'Golden Retriever', 3, 'LARGE',
   'Buddy is the friendliest pup in the park. Loves fetch, swimming, and making new friends. Never met a stranger!',
   ARRAY['https://picsum.photos/seed/buddy1/600/600', 'https://picsum.photos/seed/buddy2/600/600', 'https://picsum.photos/seed/buddy3/600/600'],
   ARRAY['Friendly', 'Playful', 'Good with kids', 'Good with dogs', 'Vaccinated'],
   '[{"question":"My favorite thing is...","answer":"Playing fetch at the lake and then rolling in the mud right after bath time"},{"question":"I get the zoomies when...","answer":"Someone says the word walk or picks up my leash"},{"question":"My hidden talent is...","answer":"I can catch a frisbee mid-air and do a little spin"}]'::jsonb),

  -- Emma's cat
  ('b2222222-2222-2222-2222-222222222222',
   'a1111111-1111-1111-1111-111111111111',
   'Luna', 'CAT', 'Siamese', 2, 'SMALL',
   'Luna is sassy but secretly a cuddle bug. Will judge you from across the room, then curl up in your lap.',
   ARRAY['https://picsum.photos/seed/luna1/600/600', 'https://picsum.photos/seed/luna2/600/600'],
   ARRAY['Calm', 'Shy', 'Good with cats'],
   '[{"question":"My favorite thing is...","answer":"Sunbathing in the window and judging the dogs walking by"},{"question":"My favorite treat is...","answer":"Tuna flavored anything, I am a connoisseur"}]'::jsonb),

  -- Mike's Corgi
  ('b3333333-3333-3333-3333-333333333333',
   'a2222222-2222-2222-2222-222222222222',
   'Mochi', 'DOG', 'Corgi', 4, 'MEDIUM',
   'Short legs, big personality. Mochi thinks he rules the house (he does). Expert herder of children and other dogs.',
   ARRAY['https://picsum.photos/seed/mochi1/600/600', 'https://picsum.photos/seed/mochi2/600/600', 'https://picsum.photos/seed/mochi3/600/600', 'https://picsum.photos/seed/mochi4/600/600'],
   ARRAY['Playful', 'Energetic', 'Good with dogs', 'Trained', 'Vaccinated'],
   '[{"question":"My ideal playdate is...","answer":"A big open field where I can herd everyone into a circle"},{"question":"My best trick is...","answer":"Spin, shake, roll over, and then demand a treat for each one"},{"question":"I get the zoomies when...","answer":"Its 9pm sharp every single night, like clockwork"}]'::jsonb),

  -- Lisa's Shiba Inu
  ('b4444444-4444-4444-4444-444444444444',
   'a3333333-3333-3333-3333-333333333333',
   'Kiko', 'DOG', 'Shiba Inu', 1, 'MEDIUM',
   'Much wow. Very floof. Kiko is an independent thinker who loves hikes and will scream if you try to give her a bath.',
   ARRAY['https://picsum.photos/seed/kiko1/600/600', 'https://picsum.photos/seed/kiko2/600/600'],
   ARRAY['Energetic', 'Protective', 'Neutered/Spayed'],
   '[{"question":"You should know that I...","answer":"Will dramatically scream if you try to clip my nails"},{"question":"My favorite toy is...","answer":"A squeaky avocado that I carry everywhere like a baby"}]'::jsonb),

  -- Lisa's Maine Coon
  ('b5555555-5555-5555-5555-555555555555',
   'a3333333-3333-3333-3333-333333333333',
   'Bear', 'CAT', 'Maine Coon', 5, 'LARGE',
   'Bear is basically a small dog in a cat body. Follows you around, plays fetch, and weighs 22 lbs of pure fluff.',
   ARRAY['https://picsum.photos/seed/bear1/600/600', 'https://picsum.photos/seed/bear2/600/600', 'https://picsum.photos/seed/bear3/600/600'],
   ARRAY['Friendly', 'Calm', 'Good with cats', 'Good with dogs', 'Vaccinated'],
   '[{"question":"My favorite thing is...","answer":"Following my human from room to room like a very fluffy shadow"},{"question":"My hidden talent is...","answer":"I play fetch better than most dogs and Im not even bragging"}]'::jsonb),

  -- James's mixed dog
  ('b6666666-6666-6666-6666-666666666666',
   'a4444444-4444-4444-4444-444444444444',
   'Rosie', 'DOG', 'Mixed — Lab/Pittie', 6, 'LARGE',
   'Rosie is a rescue who went from scared shelter pup to the happiest girl alive. Loves belly rubs and gentle walks.',
   ARRAY['https://picsum.photos/seed/rosie1/600/600', 'https://picsum.photos/seed/rosie2/600/600'],
   ARRAY['Friendly', 'Calm', 'Good with kids', 'Neutered/Spayed', 'Vaccinated'],
   '[{"question":"My favorite thing is...","answer":"Belly rubs that last at least 20 minutes, I will time you"},{"question":"I love to nap...","answer":"On the couch with my head on a pillow like a human, obviously"}]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 4. MATCHING PREFERENCES
-- ============================================================================

INSERT INTO matching_preferences (user_id, pet_types, sizes, age_min, age_max, required_tags) VALUES
  ('a1111111-1111-1111-1111-111111111111', '{DOG,CAT}', '{SMALL,MEDIUM,LARGE}', 0, 10, '{}'),
  ('a2222222-2222-2222-2222-222222222222', '{DOG}',     '{MEDIUM,LARGE}',        1, 8,  '{}'),
  ('a3333333-3333-3333-3333-333333333333', '{DOG,CAT}', '{SMALL,MEDIUM,LARGE}', 0, 10, '{}'),
  ('a4444444-4444-4444-4444-444444444444', '{DOG}',     '{MEDIUM,LARGE}',        0, 10, '{}')
ON CONFLICT (user_id) DO NOTHING;

-- ============================================================================
-- 5. SWIPES (create mutual right-swipes to generate matches)
-- ============================================================================
-- Emma(Buddy) <-> Mike(Mochi): mutual right swipe = match
-- Emma(Buddy) <-> Lisa(Kiko): mutual right swipe = match
-- Emma(Luna) <-> Lisa(Bear): mutual right swipe = match
-- Mike(Mochi) <-> James(Rosie): mutual right swipe = match
-- Some left swipes for realism
-- Note: swiper_id is the USER, pet_id is the PET being swiped on

INSERT INTO swipes (swiper_id, pet_id, direction) VALUES
  -- Emma swipes right on Mochi, Mike swipes right on Buddy → match
  ('a1111111-1111-1111-1111-111111111111', 'b3333333-3333-3333-3333-333333333333', 'RIGHT'),
  ('a2222222-2222-2222-2222-222222222222', 'b1111111-1111-1111-1111-111111111111', 'RIGHT'),
  -- Emma swipes right on Kiko, Lisa swipes right on Buddy → match
  ('a1111111-1111-1111-1111-111111111111', 'b4444444-4444-4444-4444-444444444444', 'RIGHT'),
  ('a3333333-3333-3333-3333-333333333333', 'b1111111-1111-1111-1111-111111111111', 'RIGHT'),
  -- Emma swipes right on Bear (for Luna), Lisa swipes right on Luna → match
  ('a1111111-1111-1111-1111-111111111111', 'b5555555-5555-5555-5555-555555555555', 'RIGHT'),
  ('a3333333-3333-3333-3333-333333333333', 'b2222222-2222-2222-2222-222222222222', 'RIGHT'),
  -- Mike swipes right on Rosie, James swipes right on Mochi → match
  ('a2222222-2222-2222-2222-222222222222', 'b6666666-6666-6666-6666-666666666666', 'RIGHT'),
  ('a4444444-4444-4444-4444-444444444444', 'b3333333-3333-3333-3333-333333333333', 'RIGHT'),
  -- Some left swipes
  ('a4444444-4444-4444-4444-444444444444', 'b4444444-4444-4444-4444-444444444444', 'LEFT'),
  ('a2222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222', 'LEFT')
ON CONFLICT (swiper_id, pet_id) DO NOTHING;

-- ============================================================================
-- 6. MATCHES (4 matches corresponding to the mutual swipes above)
-- ============================================================================

INSERT INTO matches (id, pet_a_id, pet_b_id, user_a_id, user_b_id, created_at) VALUES
  -- Buddy (Emma) <-> Mochi (Mike) — matched 5 days ago
  ('c1111111-1111-1111-1111-111111111111',
   'b1111111-1111-1111-1111-111111111111', 'b3333333-3333-3333-3333-333333333333',
   'a1111111-1111-1111-1111-111111111111', 'a2222222-2222-2222-2222-222222222222',
   now() - interval '5 days'),
  -- Buddy (Emma) <-> Kiko (Lisa) — matched 3 days ago
  ('c2222222-2222-2222-2222-222222222222',
   'b1111111-1111-1111-1111-111111111111', 'b4444444-4444-4444-4444-444444444444',
   'a1111111-1111-1111-1111-111111111111', 'a3333333-3333-3333-3333-333333333333',
   now() - interval '3 days'),
  -- Luna (Emma) <-> Bear (Lisa) — matched 2 days ago
  ('c3333333-3333-3333-3333-333333333333',
   'b2222222-2222-2222-2222-222222222222', 'b5555555-5555-5555-5555-555555555555',
   'a1111111-1111-1111-1111-111111111111', 'a3333333-3333-3333-3333-333333333333',
   now() - interval '2 days'),
  -- Mochi (Mike) <-> Rosie (James) — matched 1 day ago (new, no messages)
  ('c4444444-4444-4444-4444-444444444444',
   'b3333333-3333-3333-3333-333333333333', 'b6666666-6666-6666-6666-666666666666',
   'a2222222-2222-2222-2222-222222222222', 'a4444444-4444-4444-4444-444444444444',
   now() - interval '1 day')
ON CONFLICT (pet_a_id, pet_b_id) DO NOTHING;

-- ============================================================================
-- 7. MESSAGES (conversations in 2 of the matches)
-- ============================================================================

-- Match 1: Buddy <-> Mochi (Emma & Mike) — active conversation
INSERT INTO messages (match_id, sender_id, content, read, created_at) VALUES
  ('c1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111',
   'Hey! Buddy would love a playdate with Mochi 🐾', true, now() - interval '5 days' + interval '1 hour'),
  ('c1111111-1111-1111-1111-111111111111', 'a2222222-2222-2222-2222-222222222222',
   'Omg yes!! Mochi goes crazy for golden retrievers haha', true, now() - interval '5 days' + interval '2 hours'),
  ('c1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111',
   'Haha same! Buddy tries to herd every corgi he sees 😂', true, now() - interval '5 days' + interval '3 hours'),
  ('c1111111-1111-1111-1111-111111111111', 'a2222222-2222-2222-2222-222222222222',
   'Well Mochi IS the herder so that should be fun. Are you free Saturday? Theres a great dog park on Riverside', true, now() - interval '4 days'),
  ('c1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111',
   'Saturday works! What time?', true, now() - interval '4 days' + interval '30 minutes'),
  ('c1111111-1111-1111-1111-111111111111', 'a2222222-2222-2222-2222-222222222222',
   'How about 10am? Before it gets too hot', true, now() - interval '4 days' + interval '1 hour'),
  ('c1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111',
   'Perfect see you then! 🎉', true, now() - interval '4 days' + interval '2 hours'),
  -- Recent unread message from Mike
  ('c1111111-1111-1111-1111-111111111111', 'a2222222-2222-2222-2222-222222222222',
   'That was so fun! Mochi is exhausted lol. Same time next week?', false, now() - interval '2 hours');

-- Match 2: Buddy <-> Kiko (Emma & Lisa) — short conversation
INSERT INTO messages (match_id, sender_id, content, read, created_at) VALUES
  ('c2222222-2222-2222-2222-222222222222', 'a3333333-3333-3333-3333-333333333333',
   'Hi!! Kiko saw Buddy at Zilker last week and has not stopped looking for him since 😭', true, now() - interval '3 days' + interval '2 hours'),
  ('c2222222-2222-2222-2222-222222222222', 'a1111111-1111-1111-1111-111111111111',
   'Aww that is the cutest thing! Buddy is obsessed with Shibas', true, now() - interval '3 days' + interval '4 hours'),
  -- Unread from Lisa
  ('c2222222-2222-2222-2222-222222222222', 'a3333333-3333-3333-3333-333333333333',
   'Want to meet up at the trail this weekend? Kiko needs to burn energy or she destroys my shoes 😅', false, now() - interval '1 day');

-- Match 3: Luna <-> Bear — new match, no messages yet (testing "New match" state)
-- Match 4: Mochi <-> Rosie — new match, no messages yet

-- ============================================================================
-- 8. POSTS (5 posts in the neighborhood feed)
-- ============================================================================

INSERT INTO posts (id, author_id, pet_id, content, images, type, location, created_at) VALUES
  -- General post from Emma
  ('d1111111-1111-1111-1111-111111111111',
   'a1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111',
   'Buddy made a new best friend at the dog park today! They played for 2 hours straight and now hes passed out on the couch 😴',
   ARRAY['https://picsum.photos/seed/post1/800/800'],
   'GENERAL',
   ST_SetSRID(ST_MakePoint(-122.2020, 47.4260), 4326)::geography,
   now() - interval '6 hours'),

  -- Photo post from Mike
  ('d2222222-2222-2222-2222-222222222222',
   'a2222222-2222-2222-2222-222222222222', 'b3333333-3333-3333-3333-333333333333',
   'Mochi discovered snow for the first time (ok it was shaved ice but still)',
   ARRAY['https://picsum.photos/seed/post2a/800/800', 'https://picsum.photos/seed/post2b/800/800'],
   'PHOTO',
   ST_SetSRID(ST_MakePoint(-122.1990, 47.4270), 4326)::geography,
   now() - interval '1 day'),

  -- Lost pet post from Lisa (posted as Kiko)
  ('d3333333-3333-3333-3333-333333333333',
   'a3333333-3333-3333-3333-333333333333', 'b4444444-4444-4444-4444-444444444444',
   'LOST CAT — My neighbors orange tabby "Cheeto" has been missing since yesterday morning near Main St. Hes 3 years old, neutered, and wearing a blue collar. Please message me if you see him! 🙏',
   ARRAY['https://picsum.photos/seed/post3/800/800'],
   'LOST_PET',
   ST_SetSRID(ST_MakePoint(-122.2010, 47.4240), 4326)::geography,
   now() - interval '3 hours'),

  -- Event post from James
  ('d4444444-4444-4444-4444-444444444444',
   'a4444444-4444-4444-4444-444444444444', 'b6666666-6666-6666-6666-666666666666',
   'Free puppy yoga this Saturday at the park! 10am-12pm. Bring your pup and a mat. Rosie will be there doing absolutely zero yoga and all the socializing 🧘‍♀️🐕',
   ARRAY['https://picsum.photos/seed/post4/800/800'],
   'EVENT',
   ST_SetSRID(ST_MakePoint(-122.1980, 47.4250), 4326)::geography,
   now() - interval '2 days'),

  -- General post from Lisa
  ('d5555555-5555-5555-5555-555555555555',
   'a3333333-3333-3333-3333-333333333333', 'b4444444-4444-4444-4444-444444444444',
   'PSA: The new pet store on Main St has a self-serve dog wash station and its only $10! Kiko screamed the entire time but she smells amazing now ✨',
   ARRAY[]::TEXT[],
   'GENERAL',
   ST_SetSRID(ST_MakePoint(-122.2010, 47.4240), 4326)::geography,
   now() - interval '4 days')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 9. COMMENTS (with replies)
-- ============================================================================

INSERT INTO comments (id, post_id, author_id, pet_id, parent_comment_id, content, created_at) VALUES
  -- Comments on Emma's post (d1)
  ('e1111111-1111-1111-1111-111111111111',
   'd1111111-1111-1111-1111-111111111111', 'a2222222-2222-2222-2222-222222222222', 'b3333333-3333-3333-3333-333333333333', NULL,
   'Mochi needs this kind of energy in his life!! When can we set up a playdate?', now() - interval '5 hours'),

  ('e2222222-2222-2222-2222-222222222222',
   'd1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'e1111111-1111-1111-1111-111111111111',
   'Yes!! We should totally do this weekend!', now() - interval '4 hours'),

  ('e3333333-3333-3333-3333-333333333333',
   'd1111111-1111-1111-1111-111111111111', 'a3333333-3333-3333-3333-333333333333', 'b4444444-4444-4444-4444-444444444444', NULL,
   'Omg the sleepy face 😭 Kiko does the exact same thing after the park', now() - interval '3 hours'),

  -- Comments on Lisa's lost pet post (d3) — all posted as pets
  ('e4444444-4444-4444-4444-444444444444',
   'd3333333-3333-3333-3333-333333333333', 'a1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', NULL,
   'Oh no! Sharing this with my neighbors. I walk Buddy around there every morning, will keep an eye out 🧡', now() - interval '2 hours'),

  ('e5555555-5555-5555-5555-555555555555',
   'd3333333-3333-3333-3333-333333333333', 'a4444444-4444-4444-4444-444444444444', 'b6666666-6666-6666-6666-666666666666', NULL,
   'I think I saw an orange cat near the store on 7th? Not sure if it was Cheeto but worth checking!', now() - interval '1 hour'),

  ('e6666666-6666-6666-6666-666666666666',
   'd3333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333', 'b4444444-4444-4444-4444-444444444444', 'e5555555-5555-5555-5555-555555555555',
   'Thank you!! Going to check right now 🏃‍♀️', now() - interval '50 minutes'),

  -- Comments on James's event post (d4)
  ('e7777777-7777-7777-7777-777777777777',
   'd4444444-4444-4444-4444-444444444444', 'a2222222-2222-2222-2222-222222222222', 'b3333333-3333-3333-3333-333333333333', NULL,
   'Mochi and I are SO there! He will definitely do more socializing than yoga too 😂', now() - interval '1 day'),

  ('e8888888-8888-8888-8888-888888888888',
   'd4444444-4444-4444-4444-444444444444', 'a1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', NULL,
   'This sounds amazing! Buddy loves yoga mats (mostly chewing them)', now() - interval '1 day' + interval '2 hours')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 10. REACTIONS
-- ============================================================================

INSERT INTO reactions (post_id, user_id, type) VALUES
  -- Reactions on Emma's post
  ('d1111111-1111-1111-1111-111111111111', 'a2222222-2222-2222-2222-222222222222', 'HEART'),
  ('d1111111-1111-1111-1111-111111111111', 'a3333333-3333-3333-3333-333333333333', 'HEART'),
  ('d1111111-1111-1111-1111-111111111111', 'a4444444-4444-4444-4444-444444444444', 'LAUGH'),
  -- Reactions on Mike's photo post
  ('d2222222-2222-2222-2222-222222222222', 'a1111111-1111-1111-1111-111111111111', 'LAUGH'),
  ('d2222222-2222-2222-2222-222222222222', 'a3333333-3333-3333-3333-333333333333', 'HEART'),
  -- Reactions on Lisa's lost pet post
  ('d3333333-3333-3333-3333-333333333333', 'a1111111-1111-1111-1111-111111111111', 'SAD'),
  ('d3333333-3333-3333-3333-333333333333', 'a4444444-4444-4444-4444-444444444444', 'SAD'),
  -- Reactions on James's event post
  ('d4444444-4444-4444-4444-444444444444', 'a1111111-1111-1111-1111-111111111111', 'HEART'),
  ('d4444444-4444-4444-4444-444444444444', 'a2222222-2222-2222-2222-222222222222', 'WOW'),
  ('d4444444-4444-4444-4444-444444444444', 'a3333333-3333-3333-3333-333333333333', 'HEART'),
  -- Reactions on Lisa's PSA post
  ('d5555555-5555-5555-5555-555555555555', 'a2222222-2222-2222-2222-222222222222', 'LAUGH'),
  ('d5555555-5555-5555-5555-555555555555', 'a4444444-4444-4444-4444-444444444444', 'IDEA')
ON CONFLICT (post_id, user_id) DO NOTHING;

COMMIT;
