-- ============================================================================
-- SocialSnout Demo Seed Data
-- 10 users, 18 pets, posts, matches, messages, comments, reactions
-- All located in the Bellevue, WA area (~47.42, -122.20)
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. AUTH USERS
-- ============================================================================

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, confirmation_token, email_change, email_change_token_new, email_change_token_current, recovery_token, reauthentication_token, raw_app_meta_data, raw_user_meta_data)
VALUES
  ('a1111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'emma.johnson@test.com',   crypt('password123', gen_salt('bf')), now(), now(), now(), '', '', '', '', '', '', '{"provider":"email","providers":["email"]}', '{"name":"Emma Johnson"}'),
  ('a2222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'mike.chen@test.com',       crypt('password123', gen_salt('bf')), now(), now(), now(), '', '', '', '', '', '', '{"provider":"email","providers":["email"]}', '{"name":"Mike Chen"}'),
  ('a3333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'lisa.park@test.com',        crypt('password123', gen_salt('bf')), now(), now(), now(), '', '', '', '', '', '', '{"provider":"email","providers":["email"]}', '{"name":"Lisa Park"}'),
  ('a4444444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'james.wilson@test.com',     crypt('password123', gen_salt('bf')), now(), now(), now(), '', '', '', '', '', '', '{"provider":"email","providers":["email"]}', '{"name":"James Wilson"}'),
  ('a5555555-5555-5555-5555-555555555555', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'priya.patel@test.com',      crypt('password123', gen_salt('bf')), now(), now(), now(), '', '', '', '', '', '', '{"provider":"email","providers":["email"]}', '{"name":"Priya Patel"}'),
  ('a6666666-6666-6666-6666-666666666666', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'marcus.thompson@test.com',  crypt('password123', gen_salt('bf')), now(), now(), now(), '', '', '', '', '', '', '{"provider":"email","providers":["email"]}', '{"name":"Marcus Thompson"}'),
  ('a7777777-7777-7777-7777-777777777777', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sofia.rossi@test.com',      crypt('password123', gen_salt('bf')), now(), now(), now(), '', '', '', '', '', '', '{"provider":"email","providers":["email"]}', '{"name":"Sofia Rossi"}'),
  ('a8888888-8888-8888-8888-888888888888', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'kenji.tanaka@test.com',     crypt('password123', gen_salt('bf')), now(), now(), now(), '', '', '', '', '', '', '{"provider":"email","providers":["email"]}', '{"name":"Kenji Tanaka"}'),
  ('a9999999-9999-9999-9999-999999999999', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'hannah.becker@test.com',    crypt('password123', gen_salt('bf')), now(), now(), now(), '', '', '', '', '', '', '{"provider":"email","providers":["email"]}', '{"name":"Hannah Becker"}'),
  ('aa000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'diego.morales@test.com',    crypt('password123', gen_salt('bf')), now(), now(), now(), '', '', '', '', '', '', '{"provider":"email","providers":["email"]}', '{"name":"Diego Morales"}')
ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES
  ('a1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', '{"sub":"a1111111-1111-1111-1111-111111111111","email":"emma.johnson@test.com"}',   'email', now(), now(), now()),
  ('a2222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222', '{"sub":"a2222222-2222-2222-2222-222222222222","email":"mike.chen@test.com"}',       'email', now(), now(), now()),
  ('a3333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333', '{"sub":"a3333333-3333-3333-3333-333333333333","email":"lisa.park@test.com"}',        'email', now(), now(), now()),
  ('a4444444-4444-4444-4444-444444444444', 'a4444444-4444-4444-4444-444444444444', 'a4444444-4444-4444-4444-444444444444', '{"sub":"a4444444-4444-4444-4444-444444444444","email":"james.wilson@test.com"}',     'email', now(), now(), now()),
  ('a5555555-5555-5555-5555-555555555555', 'a5555555-5555-5555-5555-555555555555', 'a5555555-5555-5555-5555-555555555555', '{"sub":"a5555555-5555-5555-5555-555555555555","email":"priya.patel@test.com"}',      'email', now(), now(), now()),
  ('a6666666-6666-6666-6666-666666666666', 'a6666666-6666-6666-6666-666666666666', 'a6666666-6666-6666-6666-666666666666', '{"sub":"a6666666-6666-6666-6666-666666666666","email":"marcus.thompson@test.com"}',  'email', now(), now(), now()),
  ('a7777777-7777-7777-7777-777777777777', 'a7777777-7777-7777-7777-777777777777', 'a7777777-7777-7777-7777-777777777777', '{"sub":"a7777777-7777-7777-7777-777777777777","email":"sofia.rossi@test.com"}',      'email', now(), now(), now()),
  ('a8888888-8888-8888-8888-888888888888', 'a8888888-8888-8888-8888-888888888888', 'a8888888-8888-8888-8888-888888888888', '{"sub":"a8888888-8888-8888-8888-888888888888","email":"kenji.tanaka@test.com"}',     'email', now(), now(), now()),
  ('a9999999-9999-9999-9999-999999999999', 'a9999999-9999-9999-9999-999999999999', 'a9999999-9999-9999-9999-999999999999', '{"sub":"a9999999-9999-9999-9999-999999999999","email":"hannah.becker@test.com"}',    'email', now(), now(), now()),
  ('aa000000-0000-0000-0000-000000000000', 'aa000000-0000-0000-0000-000000000000', 'aa000000-0000-0000-0000-000000000000', '{"sub":"aa000000-0000-0000-0000-000000000000","email":"diego.morales@test.com"}',    'email', now(), now(), now())
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 2. APP USERS (Bellevue, WA area — all within ~2 miles)
-- ============================================================================

INSERT INTO users (id, email, name, avatar_url, location) VALUES
  ('a1111111-1111-1111-1111-111111111111', 'emma.johnson@test.com',   'Emma Johnson',     'https://api.dicebear.com/7.x/avataaars/png?seed=Emma&size=300',    ST_SetSRID(ST_MakePoint(-122.2020, 47.4260), 4326)::geography),
  ('a2222222-2222-2222-2222-222222222222', 'mike.chen@test.com',       'Mike Chen',        'https://api.dicebear.com/7.x/avataaars/png?seed=Mike&size=300',    ST_SetSRID(ST_MakePoint(-122.1990, 47.4270), 4326)::geography),
  ('a3333333-3333-3333-3333-333333333333', 'lisa.park@test.com',        'Lisa Park',        'https://api.dicebear.com/7.x/avataaars/png?seed=Lisa&size=300',    ST_SetSRID(ST_MakePoint(-122.2010, 47.4240), 4326)::geography),
  ('a4444444-4444-4444-4444-444444444444', 'james.wilson@test.com',     'James Wilson',     'https://api.dicebear.com/7.x/avataaars/png?seed=James&size=300',   ST_SetSRID(ST_MakePoint(-122.1980, 47.4250), 4326)::geography),
  ('a5555555-5555-5555-5555-555555555555', 'priya.patel@test.com',      'Priya Patel',      'https://api.dicebear.com/7.x/avataaars/png?seed=Priya&size=300',   ST_SetSRID(ST_MakePoint(-122.2035, 47.4275), 4326)::geography),
  ('a6666666-6666-6666-6666-666666666666', 'marcus.thompson@test.com',  'Marcus Thompson',  'https://api.dicebear.com/7.x/avataaars/png?seed=Marcus&size=300',  ST_SetSRID(ST_MakePoint(-122.1965, 47.4235), 4326)::geography),
  ('a7777777-7777-7777-7777-777777777777', 'sofia.rossi@test.com',      'Sofia Rossi',      'https://api.dicebear.com/7.x/avataaars/png?seed=Sofia&size=300',   ST_SetSRID(ST_MakePoint(-122.2045, 47.4248), 4326)::geography),
  ('a8888888-8888-8888-8888-888888888888', 'kenji.tanaka@test.com',     'Kenji Tanaka',     'https://api.dicebear.com/7.x/avataaars/png?seed=Kenji&size=300',   ST_SetSRID(ST_MakePoint(-122.1975, 47.4265), 4326)::geography),
  ('a9999999-9999-9999-9999-999999999999', 'hannah.becker@test.com',    'Hannah Becker',    'https://api.dicebear.com/7.x/avataaars/png?seed=Hannah&size=300',  ST_SetSRID(ST_MakePoint(-122.2005, 47.4280), 4326)::geography),
  ('aa000000-0000-0000-0000-000000000000', 'diego.morales@test.com',    'Diego Morales',    'https://api.dicebear.com/7.x/avataaars/png?seed=Diego&size=300',   ST_SetSRID(ST_MakePoint(-122.2025, 47.4230), 4326)::geography)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 3. PETS (18 pets: 14 dogs, 4 cats)
-- ============================================================================
-- Photo URLs from Pexels (free, stable, real pet images)

INSERT INTO pets (id, owner_id, name, type, breed, age, size, bio, photos, tags, prompts) VALUES

  -- ===== Emma's pets (2) =====
  ('b1111111-1111-1111-1111-111111111111',
   'a1111111-1111-1111-1111-111111111111',
   'Buddy', 'DOG', 'Golden Retriever', 3, 'LARGE',
   'Buddy is the friendliest pup in the park. Loves fetch, swimming, and making new friends. Never met a stranger!',
   ARRAY[
     'https://images.pexels.com/photos/2253275/pexels-photo-2253275.jpeg?auto=compress&cs=tinysrgb&w=600',
     'https://images.pexels.com/photos/1490908/pexels-photo-1490908.jpeg?auto=compress&cs=tinysrgb&w=600',
     'https://images.pexels.com/photos/4587998/pexels-photo-4587998.jpeg?auto=compress&cs=tinysrgb&w=600'
   ],
   ARRAY['Friendly', 'Playful', 'Good with kids', 'Good with dogs', 'Vaccinated'],
   '[{"question":"My favorite thing is...","answer":"Playing fetch at the lake and then rolling in the mud right after bath time"},{"question":"I get the zoomies when...","answer":"Someone says the word walk or picks up my leash"},{"question":"My hidden talent is...","answer":"I can catch a frisbee mid-air and do a little spin"}]'::jsonb),

  ('b2222222-2222-2222-2222-222222222222',
   'a1111111-1111-1111-1111-111111111111',
   'Luna', 'CAT', 'Siamese', 2, 'SMALL',
   'Luna is sassy but secretly a cuddle bug. Will judge you from across the room, then curl up in your lap.',
   ARRAY[
     'https://images.pexels.com/photos/991831/pexels-photo-991831.jpeg?auto=compress&cs=tinysrgb&w=600',
     'https://images.pexels.com/photos/2558605/pexels-photo-2558605.jpeg?auto=compress&cs=tinysrgb&w=600'
   ],
   ARRAY['Calm', 'Shy at first', 'Good with cats'],
   '[{"question":"My favorite thing is...","answer":"Sunbathing in the window and judging the dogs walking by"},{"question":"My favorite treat is...","answer":"Tuna flavored anything, I am a connoisseur"}]'::jsonb),

  -- ===== Mike's pets (2) =====
  ('b3333333-3333-3333-3333-333333333333',
   'a2222222-2222-2222-2222-222222222222',
   'Mochi', 'DOG', 'Corgi', 4, 'MEDIUM',
   'Short legs, big personality. Mochi thinks he rules the house (he does). Expert herder of children and other dogs.',
   ARRAY[
     'https://images.pexels.com/photos/3196887/pexels-photo-3196887.jpeg?auto=compress&cs=tinysrgb&w=600',
     'https://images.pexels.com/photos/6568501/pexels-photo-6568501.jpeg?auto=compress&cs=tinysrgb&w=600',
     'https://images.pexels.com/photos/4587979/pexels-photo-4587979.jpeg?auto=compress&cs=tinysrgb&w=600'
   ],
   ARRAY['Playful', 'High energy', 'Good with dogs', 'Trained', 'Vaccinated'],
   '[{"question":"My ideal playdate is...","answer":"A big open field where I can herd everyone into a circle"},{"question":"My best trick is...","answer":"Spin, shake, roll over, and then demand a treat for each one"},{"question":"I get the zoomies when...","answer":"Its 9pm sharp every single night, like clockwork"}]'::jsonb),

  ('b3333333-3333-3333-3333-222222222222',
   'a2222222-2222-2222-2222-222222222222',
   'Ziggy', 'DOG', 'French Bulldog', 2, 'SMALL',
   'All snort, no bite. Ziggy communicates exclusively through dramatic sighs and will steal your spot on the couch the second you stand up.',
   ARRAY[
     'https://images.pexels.com/photos/4587971/pexels-photo-4587971.jpeg?auto=compress&cs=tinysrgb&w=600',
     'https://images.pexels.com/photos/4588047/pexels-photo-4588047.jpeg?auto=compress&cs=tinysrgb&w=600'
   ],
   ARRAY['Friendly', 'Calm', 'Good with kids'],
   '[{"question":"My favorite thing is...","answer":"Snoring on the couch so loudly that guests think theres a bear in the house"},{"question":"You should know that I...","answer":"Will follow you to the bathroom every single time, its a package deal"}]'::jsonb),

  -- ===== Lisa's pets (2) =====
  ('b4444444-4444-4444-4444-444444444444',
   'a3333333-3333-3333-3333-333333333333',
   'Kiko', 'DOG', 'Shiba Inu', 1, 'MEDIUM',
   'Much wow. Very floof. Kiko is an independent thinker who loves hikes and will scream if you try to give her a bath.',
   ARRAY[
     'https://images.pexels.com/photos/3828097/pexels-photo-3828097.jpeg?auto=compress&cs=tinysrgb&w=600',
     'https://images.pexels.com/photos/4588065/pexels-photo-4588065.jpeg?auto=compress&cs=tinysrgb&w=600',
     'https://images.pexels.com/photos/1805164/pexels-photo-1805164.jpeg?auto=compress&cs=tinysrgb&w=600'
   ],
   ARRAY['High energy', 'Protective', 'Neutered/Spayed'],
   '[{"question":"You should know that I...","answer":"Will dramatically scream if you try to clip my nails"},{"question":"My favorite toy is...","answer":"A squeaky avocado that I carry everywhere like a baby"}]'::jsonb),

  ('b5555555-5555-5555-5555-555555555555',
   'a3333333-3333-3333-3333-333333333333',
   'Bear', 'CAT', 'Maine Coon', 5, 'LARGE',
   'Bear is basically a small dog in a cat body. Follows you around, plays fetch, and weighs 22 lbs of pure fluff.',
   ARRAY[
     'https://images.pexels.com/photos/1444321/pexels-photo-1444321.jpeg?auto=compress&cs=tinysrgb&w=600',
     'https://images.pexels.com/photos/2194261/pexels-photo-2194261.jpeg?auto=compress&cs=tinysrgb&w=600',
     'https://images.pexels.com/photos/416160/pexels-photo-416160.jpeg?auto=compress&cs=tinysrgb&w=600'
   ],
   ARRAY['Friendly', 'Calm', 'Good with cats', 'Good with dogs', 'Vaccinated'],
   '[{"question":"My favorite thing is...","answer":"Following my human from room to room like a very fluffy shadow"},{"question":"My hidden talent is...","answer":"I play fetch better than most dogs and Im not even bragging"}]'::jsonb),

  -- ===== James's pet (1) =====
  ('b6666666-6666-6666-6666-666666666666',
   'a4444444-4444-4444-4444-444444444444',
   'Rosie', 'DOG', 'Mixed — Lab/Pittie', 6, 'LARGE',
   'Rosie is a rescue who went from scared shelter pup to the happiest girl alive. Loves belly rubs and gentle walks.',
   ARRAY[
     'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=600',
     'https://images.pexels.com/photos/2607544/pexels-photo-2607544.jpeg?auto=compress&cs=tinysrgb&w=600',
     'https://images.pexels.com/photos/1938123/pexels-photo-1938123.jpeg?auto=compress&cs=tinysrgb&w=600'
   ],
   ARRAY['Friendly', 'Calm', 'Good with kids', 'Neutered/Spayed', 'Vaccinated'],
   '[{"question":"My favorite thing is...","answer":"Belly rubs that last at least 20 minutes, I will time you"},{"question":"I love to nap...","answer":"On the couch with my head on a pillow like a human, obviously"},{"question":"My hidden talent is...","answer":"I can sense when youre sad and will bring you my favorite toy"}]'::jsonb),

  -- ===== Priya's pets (2) =====
  ('b7777777-7777-7777-7777-777777777777',
   'a5555555-5555-5555-5555-555555555555',
   'Chai', 'DOG', 'Beagle', 3, 'MEDIUM',
   'Chai has a nose that could find a treat hidden in a vault. Howls at squirrels, sleeps like an angel, and lives for snack time.',
   ARRAY[
     'https://images.pexels.com/photos/6568941/pexels-photo-6568941.jpeg?auto=compress&cs=tinysrgb&w=600',
     'https://images.pexels.com/photos/6568482/pexels-photo-6568482.jpeg?auto=compress&cs=tinysrgb&w=600',
     'https://images.pexels.com/photos/5731866/pexels-photo-5731866.jpeg?auto=compress&cs=tinysrgb&w=600'
   ],
   ARRAY['Friendly', 'Playful', 'Good with dogs', 'Vaccinated'],
   '[{"question":"My favorite thing is...","answer":"Following a scent trail for 30 minutes and ending up at the pizza place"},{"question":"I get the zoomies when...","answer":"I hear the treat bag crinkle from literally anywhere in the house"},{"question":"My hidden talent is...","answer":"I can howl the entire chorus of any song playing on the speaker"}]'::jsonb),

  ('b7777777-7777-7777-7777-888888888888',
   'a5555555-5555-5555-5555-555555555555',
   'Nala', 'CAT', 'Ragdoll', 4, 'MEDIUM',
   'Nala is a living cloud who goes completely limp when you pick her up. Purrs like a motorboat and insists on being in every video call.',
   ARRAY[
     'https://images.pexels.com/photos/1543793/pexels-photo-1543793.jpeg?auto=compress&cs=tinysrgb&w=600',
     'https://images.pexels.com/photos/2361952/pexels-photo-2361952.jpeg?auto=compress&cs=tinysrgb&w=600'
   ],
   ARRAY['Calm', 'Friendly', 'Good with cats', 'Hypoallergenic'],
   '[{"question":"My favorite thing is...","answer":"Being held like a baby, Im 12 pounds of pure flop"},{"question":"You should know that I...","answer":"Will appear on camera during every single work call without fail"}]'::jsonb),

  -- ===== Marcus's pets (2) =====
  ('b8888888-8888-8888-8888-111111111111',
   'a6666666-6666-6666-6666-666666666666',
   'Rolo', 'DOG', 'Great Dane', 4, 'LARGE',
   'Rolo thinks he is a lap dog despite being 140lbs. Will lean on you until you accept your fate as his personal furniture.',
   ARRAY[
     'https://images.pexels.com/photos/1629781/pexels-photo-1629781.jpeg?auto=compress&cs=tinysrgb&w=600',
     'https://images.pexels.com/photos/3726314/pexels-photo-3726314.jpeg?auto=compress&cs=tinysrgb&w=600',
     'https://images.pexels.com/photos/2695820/pexels-photo-2695820.jpeg?auto=compress&cs=tinysrgb&w=600'
   ],
   ARRAY['Friendly', 'Calm', 'Good with kids', 'Good with dogs', 'Vaccinated'],
   '[{"question":"My favorite thing is...","answer":"Sitting on peoples laps even though I weigh more than most of them"},{"question":"My ideal playdate is...","answer":"A slow walk followed by an even slower walk and then a very long nap"},{"question":"You should know that I...","answer":"Drool. A lot. Like a LOT a lot. Bring a towel."}]'::jsonb),

  ('b8888888-8888-8888-8888-222222222222',
   'a6666666-6666-6666-6666-666666666666',
   'Pepper', 'DOG', 'Australian Shepherd', 2, 'MEDIUM',
   'Pepper has more energy than should be legal. Knows 30 tricks, herds the roomba, and will outsmart you at every turn.',
   ARRAY[
     'https://images.pexels.com/photos/5257588/pexels-photo-5257588.jpeg?auto=compress&cs=tinysrgb&w=600',
     'https://images.pexels.com/photos/3628100/pexels-photo-3628100.jpeg?auto=compress&cs=tinysrgb&w=600',
     'https://images.pexels.com/photos/6689099/pexels-photo-6689099.jpeg?auto=compress&cs=tinysrgb&w=600'
   ],
   ARRAY['High energy', 'Trained', 'Playful', 'Good with dogs', 'Vaccinated'],
   '[{"question":"My best trick is...","answer":"I can open doors, the fridge, and my treat jar. My human is not thrilled"},{"question":"I get the zoomies when...","answer":"Any time between 6am and 11pm basically"},{"question":"My hidden talent is...","answer":"I have successfully herded the roomba into a corner 47 times"}]'::jsonb),

  -- ===== Sofia's pet (1) =====
  ('b9999999-9999-9999-9999-111111111111',
   'a7777777-7777-7777-7777-777777777777',
   'Olive', 'DOG', 'Dachshund', 5, 'SMALL',
   'Olive is 15 inches of pure attitude. Burrows under every blanket, barks at dogs 10x her size, and is the queen of the house.',
   ARRAY[
     'https://images.pexels.com/photos/3397939/pexels-photo-3397939.jpeg?auto=compress&cs=tinysrgb&w=600',
     'https://images.pexels.com/photos/4587992/pexels-photo-4587992.jpeg?auto=compress&cs=tinysrgb&w=600',
     'https://images.pexels.com/photos/1139794/pexels-photo-1139794.jpeg?auto=compress&cs=tinysrgb&w=600'
   ],
   ARRAY['Playful', 'Protective', 'Good with kids', 'Vaccinated'],
   '[{"question":"My favorite thing is...","answer":"Burrowing under blankets until I am completely invisible"},{"question":"You should know that I...","answer":"Am not afraid of anything. Great Danes? Please. I run this park."},{"question":"My ideal playdate is...","answer":"Chasing a ball for 5 minutes then napping for 5 hours"}]'::jsonb),

  -- ===== Kenji's pets (3) =====
  ('ba000000-0000-0000-0000-111111111111',
   'a8888888-8888-8888-8888-888888888888',
   'Yuki', 'DOG', 'Husky', 3, 'LARGE',
   'Yuki has opinions and she WILL share them. Talks back, argues about walk routes, and melts hearts with those blue eyes.',
   ARRAY[
     'https://images.pexels.com/photos/3715587/pexels-photo-3715587.jpeg?auto=compress&cs=tinysrgb&w=600',
     'https://images.pexels.com/photos/2853130/pexels-photo-2853130.jpeg?auto=compress&cs=tinysrgb&w=600',
     'https://images.pexels.com/photos/3726310/pexels-photo-3726310.jpeg?auto=compress&cs=tinysrgb&w=600'
   ],
   ARRAY['High energy', 'Playful', 'Good with dogs', 'Vaccinated'],
   '[{"question":"My favorite thing is...","answer":"Arguing about which direction we walk. I always win."},{"question":"I get the zoomies when...","answer":"Its below 50 degrees. Cold weather is my time to SHINE"},{"question":"My hidden talent is...","answer":"Having a full conversation using only dramatic howls"}]'::jsonb),

  ('ba000000-0000-0000-0000-222222222222',
   'a8888888-8888-8888-8888-888888888888',
   'Tofu', 'DOG', 'Shiba Inu', 1, 'MEDIUM',
   'Tofu is peak Shiba: aloof, dramatic, and 100% on his own schedule. But when he decides to cuddle, your heart will explode.',
   ARRAY[
     'https://images.pexels.com/photos/4587997/pexels-photo-4587997.jpeg?auto=compress&cs=tinysrgb&w=600',
     'https://images.pexels.com/photos/4588052/pexels-photo-4588052.jpeg?auto=compress&cs=tinysrgb&w=600'
   ],
   ARRAY['Shy at first', 'Calm', 'Neutered/Spayed'],
   '[{"question":"My favorite thing is...","answer":"Ignoring you and then randomly deciding youre my favorite person"},{"question":"You should know that I...","answer":"Will not come when called. I heard you. I just chose not to."}]'::jsonb),

  ('ba000000-0000-0000-0000-333333333333',
   'a8888888-8888-8888-8888-888888888888',
   'Miso', 'CAT', 'Tabby', 7, 'MEDIUM',
   'Senior gentleman Miso has seen it all and is not impressed. Loves chin scratches, warm spots, and judging the dogs from the windowsill.',
   ARRAY[
     'https://images.pexels.com/photos/1170986/pexels-photo-1170986.jpeg?auto=compress&cs=tinysrgb&w=600',
     'https://images.pexels.com/photos/2071873/pexels-photo-2071873.jpeg?auto=compress&cs=tinysrgb&w=600'
   ],
   ARRAY['Calm', 'Senior', 'Good with cats', 'Vaccinated'],
   '[{"question":"My favorite thing is...","answer":"Finding the warmest spot in the house and sleeping there for 16 hours"},{"question":"My hidden talent is...","answer":"Making the dogs nervous just by staring at them from the window"}]'::jsonb),

  -- ===== Hannah's pets (2) =====
  ('bb000000-0000-0000-0000-111111111111',
   'a9999999-9999-9999-9999-999999999999',
   'Scout', 'DOG', 'Border Collie', 2, 'MEDIUM',
   'Scout is the smartest dog you will ever meet. Knows every trick in the book and invented a few of her own. Will herd your children.',
   ARRAY[
     'https://images.pexels.com/photos/2820134/pexels-photo-2820134.jpeg?auto=compress&cs=tinysrgb&w=600',
     'https://images.pexels.com/photos/5256709/pexels-photo-5256709.jpeg?auto=compress&cs=tinysrgb&w=600',
     'https://images.pexels.com/photos/3908806/pexels-photo-3908806.jpeg?auto=compress&cs=tinysrgb&w=600'
   ],
   ARRAY['High energy', 'Trained', 'Playful', 'Good with dogs', 'Vaccinated'],
   '[{"question":"My best trick is...","answer":"I can sort my toys by color. My human did not teach me this."},{"question":"My ideal playdate is...","answer":"An agility course or a frisbee session. Bonus if theres water to jump in."},{"question":"I get the zoomies when...","answer":"I havent exercised in more than 4 hours. Which is basically always."}]'::jsonb),

  ('bb000000-0000-0000-0000-222222222222',
   'a9999999-9999-9999-9999-999999999999',
   'Maple', 'DOG', 'Labradoodle', 1, 'MEDIUM',
   'Maple is a fluffy goofball who thinks everyone is her best friend. Still in her puppy brain era and proud of it.',
   ARRAY[
     'https://images.pexels.com/photos/4587999/pexels-photo-4587999.jpeg?auto=compress&cs=tinysrgb&w=600',
     'https://images.pexels.com/photos/5731874/pexels-photo-5731874.jpeg?auto=compress&cs=tinysrgb&w=600'
   ],
   ARRAY['Friendly', 'Playful', 'Good with kids', 'Good with dogs', 'Hypoallergenic'],
   '[{"question":"My favorite thing is...","answer":"Meeting literally anyone. Person? Friend. Dog? Friend. Squirrel? Friend."},{"question":"You should know that I...","answer":"Am still learning not to jump on people. Its a work in progress."}]'::jsonb),

  -- ===== Diego's pets (2) =====
  ('bc000000-0000-0000-0000-111111111111',
   'aa000000-0000-0000-0000-000000000000',
   'Bruno', 'DOG', 'Mixed — Pit Bull', 4, 'LARGE',
   'Bruno is a certified velvet hippo. 80lbs of wiggles, kisses, and love. Will lean on you and never let go.',
   ARRAY[
     'https://images.pexels.com/photos/2607541/pexels-photo-2607541.jpeg?auto=compress&cs=tinysrgb&w=600',
     'https://images.pexels.com/photos/3714310/pexels-photo-3714310.jpeg?auto=compress&cs=tinysrgb&w=600',
     'https://images.pexels.com/photos/1346086/pexels-photo-1346086.jpeg?auto=compress&cs=tinysrgb&w=600'
   ],
   ARRAY['Friendly', 'Good with kids', 'Good with dogs', 'Neutered/Spayed', 'Vaccinated'],
   '[{"question":"My favorite thing is...","answer":"Full body contact at all times. If youre sitting, Im on you."},{"question":"My ideal playdate is...","answer":"Wrestling with another big dog and then sharing a water bowl"},{"question":"My hidden talent is...","answer":"I can wiggle my entire body so hard that I fall over"}]'::jsonb),

  ('bc000000-0000-0000-0000-222222222222',
   'aa000000-0000-0000-0000-000000000000',
   'Churro', 'DOG', 'Chihuahua', 8, 'SMALL',
   'Churro is elderly, opinionated, and 4lbs of pure authority. Will nap in your hoodie pocket and growl at anyone who looks at him wrong.',
   ARRAY[
     'https://images.pexels.com/photos/4587995/pexels-photo-4587995.jpeg?auto=compress&cs=tinysrgb&w=600',
     'https://images.pexels.com/photos/4588048/pexels-photo-4588048.jpeg?auto=compress&cs=tinysrgb&w=600'
   ],
   ARRAY['Senior', 'Calm', 'Protective', 'Neutered/Spayed'],
   '[{"question":"My favorite thing is...","answer":"Being carried. My legs work fine, I just prefer not to use them."},{"question":"You should know that I...","answer":"Will choose one person and one person only. Everyone else is suspicious."}]'::jsonb)

ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 4. MATCHING PREFERENCES
-- ============================================================================

INSERT INTO matching_preferences (user_id, pet_types, sizes, age_min, age_max, required_tags) VALUES
  ('a1111111-1111-1111-1111-111111111111', '{DOG,CAT}', '{SMALL,MEDIUM,LARGE}', 0, 10, '{}'),
  ('a2222222-2222-2222-2222-222222222222', '{DOG}',     '{MEDIUM,LARGE}',        1, 8,  '{}'),
  ('a3333333-3333-3333-3333-333333333333', '{DOG,CAT}', '{SMALL,MEDIUM,LARGE}', 0, 10, '{}'),
  ('a4444444-4444-4444-4444-444444444444', '{DOG}',     '{MEDIUM,LARGE}',        0, 10, '{}'),
  ('a5555555-5555-5555-5555-555555555555', '{DOG,CAT}', '{SMALL,MEDIUM,LARGE}', 0, 10, '{}'),
  ('a6666666-6666-6666-6666-666666666666', '{DOG}',     '{MEDIUM,LARGE}',        0, 10, '{}'),
  ('a7777777-7777-7777-7777-777777777777', '{DOG,CAT}', '{SMALL,MEDIUM}',        0, 8,  '{}'),
  ('a8888888-8888-8888-8888-888888888888', '{DOG,CAT}', '{SMALL,MEDIUM,LARGE}', 0, 10, '{}'),
  ('a9999999-9999-9999-9999-999999999999', '{DOG}',     '{MEDIUM,LARGE}',        0, 5,  '{}'),
  ('aa000000-0000-0000-0000-000000000000', '{DOG}',     '{SMALL,MEDIUM,LARGE}', 0, 10, '{}')
ON CONFLICT (user_id) DO NOTHING;

-- ============================================================================
-- 5. SWIPES (mutual right-swipes to create matches)
-- ============================================================================

INSERT INTO swipes (swiper_id, pet_id, direction) VALUES
  -- Emma <-> Mike (Buddy <-> Mochi)
  ('a1111111-1111-1111-1111-111111111111', 'b3333333-3333-3333-3333-333333333333', 'RIGHT'),
  ('a2222222-2222-2222-2222-222222222222', 'b1111111-1111-1111-1111-111111111111', 'RIGHT'),
  -- Emma <-> Lisa (Buddy <-> Kiko)
  ('a1111111-1111-1111-1111-111111111111', 'b4444444-4444-4444-4444-444444444444', 'RIGHT'),
  ('a3333333-3333-3333-3333-333333333333', 'b1111111-1111-1111-1111-111111111111', 'RIGHT'),
  -- Emma <-> Lisa (Luna <-> Bear)
  ('a1111111-1111-1111-1111-111111111111', 'b5555555-5555-5555-5555-555555555555', 'RIGHT'),
  ('a3333333-3333-3333-3333-333333333333', 'b2222222-2222-2222-2222-222222222222', 'RIGHT'),
  -- Mike <-> James (Mochi <-> Rosie)
  ('a2222222-2222-2222-2222-222222222222', 'b6666666-6666-6666-6666-666666666666', 'RIGHT'),
  ('a4444444-4444-4444-4444-444444444444', 'b3333333-3333-3333-3333-333333333333', 'RIGHT'),
  -- Priya <-> Marcus (Chai <-> Pepper)
  ('a5555555-5555-5555-5555-555555555555', 'b8888888-8888-8888-8888-222222222222', 'RIGHT'),
  ('a6666666-6666-6666-6666-666666666666', 'b7777777-7777-7777-7777-777777777777', 'RIGHT'),
  -- Hannah <-> Kenji (Scout <-> Yuki)
  ('a9999999-9999-9999-9999-999999999999', 'ba000000-0000-0000-0000-111111111111', 'RIGHT'),
  ('a8888888-8888-8888-8888-888888888888', 'bb000000-0000-0000-0000-111111111111', 'RIGHT'),
  -- Some left swipes for realism
  ('a4444444-4444-4444-4444-444444444444', 'b4444444-4444-4444-4444-444444444444', 'LEFT'),
  ('a2222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222', 'LEFT'),
  ('a6666666-6666-6666-6666-666666666666', 'b9999999-9999-9999-9999-111111111111', 'LEFT'),
  ('a5555555-5555-5555-5555-555555555555', 'bc000000-0000-0000-0000-222222222222', 'LEFT')
ON CONFLICT (swiper_id, pet_id) DO NOTHING;

-- ============================================================================
-- 6. MATCHES (6 matches from the mutual swipes)
-- ============================================================================

INSERT INTO matches (id, pet_a_id, pet_b_id, user_a_id, user_b_id, created_at) VALUES
  ('c1111111-1111-1111-1111-111111111111',
   'b1111111-1111-1111-1111-111111111111', 'b3333333-3333-3333-3333-333333333333',
   'a1111111-1111-1111-1111-111111111111', 'a2222222-2222-2222-2222-222222222222',
   now() - interval '5 days'),
  ('c2222222-2222-2222-2222-222222222222',
   'b1111111-1111-1111-1111-111111111111', 'b4444444-4444-4444-4444-444444444444',
   'a1111111-1111-1111-1111-111111111111', 'a3333333-3333-3333-3333-333333333333',
   now() - interval '3 days'),
  ('c3333333-3333-3333-3333-333333333333',
   'b2222222-2222-2222-2222-222222222222', 'b5555555-5555-5555-5555-555555555555',
   'a1111111-1111-1111-1111-111111111111', 'a3333333-3333-3333-3333-333333333333',
   now() - interval '2 days'),
  ('c4444444-4444-4444-4444-444444444444',
   'b3333333-3333-3333-3333-333333333333', 'b6666666-6666-6666-6666-666666666666',
   'a2222222-2222-2222-2222-222222222222', 'a4444444-4444-4444-4444-444444444444',
   now() - interval '1 day'),
  ('c5555555-5555-5555-5555-555555555555',
   'b7777777-7777-7777-7777-777777777777', 'b8888888-8888-8888-8888-222222222222',
   'a5555555-5555-5555-5555-555555555555', 'a6666666-6666-6666-6666-666666666666',
   now() - interval '4 days'),
  ('c6666666-6666-6666-6666-666666666666',
   'ba000000-0000-0000-0000-111111111111', 'bb000000-0000-0000-0000-111111111111',
   'a8888888-8888-8888-8888-888888888888', 'a9999999-9999-9999-9999-999999999999',
   now() - interval '6 hours')
ON CONFLICT (pet_a_id, pet_b_id) DO NOTHING;

-- ============================================================================
-- 7. MESSAGES
-- ============================================================================

-- Match 1: Buddy <-> Mochi (Emma & Mike) — active conversation
INSERT INTO messages (match_id, sender_id, content, read, created_at) VALUES
  ('c1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111',
   'Hey! Buddy would love a playdate with Mochi', true, now() - interval '5 days' + interval '1 hour'),
  ('c1111111-1111-1111-1111-111111111111', 'a2222222-2222-2222-2222-222222222222',
   'Omg yes!! Mochi goes crazy for golden retrievers haha', true, now() - interval '5 days' + interval '2 hours'),
  ('c1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111',
   'Haha same! Buddy tries to herd every corgi he sees', true, now() - interval '5 days' + interval '3 hours'),
  ('c1111111-1111-1111-1111-111111111111', 'a2222222-2222-2222-2222-222222222222',
   'Well Mochi IS the herder so that should be fun. Are you free Saturday? Theres a great dog park on Riverside', true, now() - interval '4 days'),
  ('c1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111',
   'Saturday works! What time?', true, now() - interval '4 days' + interval '30 minutes'),
  ('c1111111-1111-1111-1111-111111111111', 'a2222222-2222-2222-2222-222222222222',
   'How about 10am? Before it gets too hot', true, now() - interval '4 days' + interval '1 hour'),
  ('c1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111',
   'Perfect see you then!', true, now() - interval '4 days' + interval '2 hours'),
  ('c1111111-1111-1111-1111-111111111111', 'a2222222-2222-2222-2222-222222222222',
   'That was so fun! Mochi is exhausted lol. Same time next week?', false, now() - interval '2 hours');

-- Match 2: Buddy <-> Kiko (Emma & Lisa) — short conversation
INSERT INTO messages (match_id, sender_id, content, read, created_at) VALUES
  ('c2222222-2222-2222-2222-222222222222', 'a3333333-3333-3333-3333-333333333333',
   'Hi!! Kiko saw Buddy at the park last week and has not stopped looking for him since', true, now() - interval '3 days' + interval '2 hours'),
  ('c2222222-2222-2222-2222-222222222222', 'a1111111-1111-1111-1111-111111111111',
   'Aww that is the cutest thing! Buddy is obsessed with Shibas', true, now() - interval '3 days' + interval '4 hours'),
  ('c2222222-2222-2222-2222-222222222222', 'a3333333-3333-3333-3333-333333333333',
   'Want to meet up at the trail this weekend? Kiko needs to burn energy or she destroys my shoes', false, now() - interval '1 day');

-- Match 5: Chai <-> Pepper (Priya & Marcus) — playdate planning
INSERT INTO messages (match_id, sender_id, content, read, created_at) VALUES
  ('c5555555-5555-5555-5555-555555555555', 'a5555555-5555-5555-5555-555555555555',
   'Hey Marcus! Chai and Pepper would make the ultimate adventure duo', true, now() - interval '4 days' + interval '3 hours'),
  ('c5555555-5555-5555-5555-555555555555', 'a6666666-6666-6666-6666-666666666666',
   'Oh 100%! Pepper needs friends who can keep up with her energy', true, now() - interval '4 days' + interval '5 hours'),
  ('c5555555-5555-5555-5555-555555555555', 'a5555555-5555-5555-5555-555555555555',
   'Chai will follow any scent trail so theyll have a blast. The off-leash area by Mercer Slough is great!', true, now() - interval '3 days'),
  ('c5555555-5555-5555-5555-555555555555', 'a6666666-6666-6666-6666-666666666666',
   'Lets do Sunday morning? Like 9am?', false, now() - interval '1 day');

-- Match 3, 4, 6: new matches, no messages yet

-- ============================================================================
-- 8. POSTS (12 posts across the neighborhood feed)
-- ============================================================================

INSERT INTO posts (id, author_id, pet_id, content, images, type, location, created_at) VALUES
  ('d1111111-1111-1111-1111-111111111111',
   'a1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111',
   'Buddy made a new best friend at the dog park today! They played for 2 hours straight and now hes passed out on the couch',
   ARRAY['https://images.pexels.com/photos/1564506/pexels-photo-1564506.jpeg?auto=compress&cs=tinysrgb&w=600'],
   'GENERAL',
   ST_SetSRID(ST_MakePoint(-122.2020, 47.4260), 4326)::geography,
   now() - interval '6 hours'),

  ('d2222222-2222-2222-2222-222222222222',
   'a2222222-2222-2222-2222-222222222222', 'b3333333-3333-3333-3333-333333333333',
   'Mochi discovered snow for the first time (ok it was shaved ice but still)',
   ARRAY['https://images.pexels.com/photos/1390361/pexels-photo-1390361.jpeg?auto=compress&cs=tinysrgb&w=600', 'https://images.pexels.com/photos/2951921/pexels-photo-2951921.jpeg?auto=compress&cs=tinysrgb&w=600'],
   'PHOTO',
   ST_SetSRID(ST_MakePoint(-122.1990, 47.4270), 4326)::geography,
   now() - interval '1 day'),

  ('d3333333-3333-3333-3333-333333333333',
   'a3333333-3333-3333-3333-333333333333', 'b4444444-4444-4444-4444-444444444444',
   'LOST CAT — My neighbors orange tabby "Cheeto" has been missing since yesterday morning near Main St. Hes 3 years old, neutered, and wearing a blue collar. Please message me if you see him!',
   ARRAY['https://images.pexels.com/photos/1170986/pexels-photo-1170986.jpeg?auto=compress&cs=tinysrgb&w=600'],
   'LOST_PET',
   ST_SetSRID(ST_MakePoint(-122.2010, 47.4240), 4326)::geography,
   now() - interval '3 hours'),

  ('d4444444-4444-4444-4444-444444444444',
   'a4444444-4444-4444-4444-444444444444', 'b6666666-6666-6666-6666-666666666666',
   'Free puppy yoga this Saturday at the park! 10am-12pm. Bring your pup and a mat. Rosie will be there doing absolutely zero yoga and all the socializing',
   ARRAY['https://images.pexels.com/photos/4056535/pexels-photo-4056535.jpeg?auto=compress&cs=tinysrgb&w=600'],
   'EVENT',
   ST_SetSRID(ST_MakePoint(-122.1980, 47.4250), 4326)::geography,
   now() - interval '2 days'),

  ('d5555555-5555-5555-5555-555555555555',
   'a3333333-3333-3333-3333-333333333333', 'b4444444-4444-4444-4444-444444444444',
   'PSA: The new pet store on Main St has a self-serve dog wash station and its only $10! Kiko screamed the entire time but she smells amazing now',
   ARRAY[]::TEXT[],
   'GENERAL',
   ST_SetSRID(ST_MakePoint(-122.2010, 47.4240), 4326)::geography,
   now() - interval '4 days'),

  ('d6666666-6666-6666-6666-666666666666',
   'a5555555-5555-5555-5555-555555555555', 'b7777777-7777-7777-7777-777777777777',
   'Chai found something suspicious at the park today. It was a pinecone. He carried it home like a trophy.',
   ARRAY['https://images.pexels.com/photos/5731866/pexels-photo-5731866.jpeg?auto=compress&cs=tinysrgb&w=600'],
   'PHOTO',
   ST_SetSRID(ST_MakePoint(-122.2035, 47.4275), 4326)::geography,
   now() - interval '8 hours'),

  ('d7777777-7777-7777-7777-777777777777',
   'a6666666-6666-6666-6666-666666666666', 'b8888888-8888-8888-8888-111111111111',
   'Rolo just tried to sit on a chihuahua at the park. The chihuahua was not amused. Rolo did not notice.',
   ARRAY['https://images.pexels.com/photos/1629781/pexels-photo-1629781.jpeg?auto=compress&cs=tinysrgb&w=600'],
   'GENERAL',
   ST_SetSRID(ST_MakePoint(-122.1965, 47.4235), 4326)::geography,
   now() - interval '12 hours'),

  ('d8888888-8888-8888-8888-888888888888',
   'a8888888-8888-8888-8888-888888888888', 'ba000000-0000-0000-0000-111111111111',
   'Any recommendations for good hiking trails nearby that are dog-friendly? Yuki needs at least 2 hours of exercise or she redecorates the apartment',
   ARRAY[]::TEXT[],
   'GENERAL',
   ST_SetSRID(ST_MakePoint(-122.1975, 47.4265), 4326)::geography,
   now() - interval '1 day' - interval '4 hours'),

  ('d9999999-9999-9999-9999-999999999999',
   'a9999999-9999-9999-9999-999999999999', 'bb000000-0000-0000-0000-111111111111',
   'Scout learned a new trick today: she can now open the treat cabinet. We are no longer safe.',
   ARRAY['https://images.pexels.com/photos/2820134/pexels-photo-2820134.jpeg?auto=compress&cs=tinysrgb&w=600'],
   'PHOTO',
   ST_SetSRID(ST_MakePoint(-122.2005, 47.4280), 4326)::geography,
   now() - interval '5 hours'),

  ('da000000-0000-0000-0000-111111111111',
   'aa000000-0000-0000-0000-000000000000', 'bc000000-0000-0000-0000-111111111111',
   'Bruno and Churro at the park. One is 80lbs, one is 4lbs. They are best friends and it makes zero sense.',
   ARRAY['https://images.pexels.com/photos/1346086/pexels-photo-1346086.jpeg?auto=compress&cs=tinysrgb&w=600'],
   'PHOTO',
   ST_SetSRID(ST_MakePoint(-122.2025, 47.4230), 4326)::geography,
   now() - interval '2 days' - interval '3 hours'),

  ('db000000-0000-0000-0000-111111111111',
   'a7777777-7777-7777-7777-777777777777', 'b9999999-9999-9999-9999-111111111111',
   'Event alert! Dog meetup at Bellevue Downtown Park this Sunday 2pm. All sizes welcome. Olive will be the smallest and the loudest.',
   ARRAY['https://images.pexels.com/photos/1619690/pexels-photo-1619690.jpeg?auto=compress&cs=tinysrgb&w=600'],
   'EVENT',
   ST_SetSRID(ST_MakePoint(-122.2045, 47.4248), 4326)::geography,
   now() - interval '10 hours'),

  ('dc000000-0000-0000-0000-111111111111',
   'a6666666-6666-6666-6666-666666666666', 'b8888888-8888-8888-8888-222222222222',
   'Does anyone else have an Aussie that herds the roomba? Asking for Pepper who has been doing this for 3 months straight.',
   ARRAY[]::TEXT[],
   'GENERAL',
   ST_SetSRID(ST_MakePoint(-122.1965, 47.4235), 4326)::geography,
   now() - interval '3 days')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 9. COMMENTS
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
   'Omg the sleepy face! Kiko does the exact same thing after the park', now() - interval '3 hours'),
  ('e3333333-3333-3333-3333-444444444444',
   'd1111111-1111-1111-1111-111111111111', 'a5555555-5555-5555-5555-555555555555', 'b7777777-7777-7777-7777-777777777777', NULL,
   'Chai just stares at me reproachfully after the park like I personally tired him out', now() - interval '2 hours'),

  -- Comments on Lisa's lost pet post (d3)
  ('e4444444-4444-4444-4444-444444444444',
   'd3333333-3333-3333-3333-333333333333', 'a1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', NULL,
   'Oh no! Sharing this with my neighbors. I walk Buddy around there every morning, will keep an eye out', now() - interval '2 hours'),
  ('e5555555-5555-5555-5555-555555555555',
   'd3333333-3333-3333-3333-333333333333', 'a4444444-4444-4444-4444-444444444444', 'b6666666-6666-6666-6666-666666666666', NULL,
   'I think I saw an orange cat near the store on 7th? Not sure if it was Cheeto but worth checking!', now() - interval '1 hour'),
  ('e6666666-6666-6666-6666-666666666666',
   'd3333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333', 'b4444444-4444-4444-4444-444444444444', 'e5555555-5555-5555-5555-555555555555',
   'Thank you!! Going to check right now', now() - interval '50 minutes'),
  ('e6666666-6666-6666-6666-777777777777',
   'd3333333-3333-3333-3333-333333333333', 'a9999999-9999-9999-9999-999999999999', 'bb000000-0000-0000-0000-111111111111', NULL,
   'Scout and I will keep an eye out on our evening walk. Hope Cheeto comes home safe!', now() - interval '45 minutes'),

  -- Comments on James's event post (d4)
  ('e7777777-7777-7777-7777-777777777777',
   'd4444444-4444-4444-4444-444444444444', 'a2222222-2222-2222-2222-222222222222', 'b3333333-3333-3333-3333-333333333333', NULL,
   'Mochi and I are SO there! He will definitely do more socializing than yoga too', now() - interval '1 day'),
  ('e8888888-8888-8888-8888-888888888888',
   'd4444444-4444-4444-4444-444444444444', 'a1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', NULL,
   'This sounds amazing! Buddy loves yoga mats (mostly chewing them)', now() - interval '1 day' + interval '2 hours'),
  ('e8888888-8888-8888-8888-999999999999',
   'd4444444-4444-4444-4444-444444444444', 'a6666666-6666-6666-6666-666666666666', 'b8888888-8888-8888-8888-111111111111', NULL,
   'Rolo will attend but only to lie in everyones way. Thats his yoga.', now() - interval '23 hours'),

  -- Comments on hiking question (d8)
  ('ea000000-0000-0000-0000-111111111111',
   'd8888888-8888-8888-8888-888888888888', 'a9999999-9999-9999-9999-999999999999', 'bb000000-0000-0000-0000-111111111111', NULL,
   'Coal Creek Trail is amazing! Scout and I go every weekend. 4 miles, mostly shaded.', now() - interval '1 day'),
  ('ea000000-0000-0000-0000-222222222222',
   'd8888888-8888-8888-8888-888888888888', 'a5555555-5555-5555-5555-555555555555', 'b7777777-7777-7777-7777-777777777777', NULL,
   'Mercer Slough has a great off-leash area too. Chai approves.', now() - interval '22 hours'),
  ('ea000000-0000-0000-0000-333333333333',
   'd8888888-8888-8888-8888-888888888888', 'a8888888-8888-8888-8888-888888888888', 'ba000000-0000-0000-0000-111111111111', 'ea000000-0000-0000-0000-111111111111',
   'Coal Creek it is! Thanks for the rec', now() - interval '20 hours'),

  -- Comments on roomba post (dc)
  ('eb000000-0000-0000-0000-111111111111',
   'dc000000-0000-0000-0000-111111111111', 'a8888888-8888-8888-8888-888888888888', 'ba000000-0000-0000-0000-222222222222', NULL,
   'Tofu just watches the roomba silently. I think hes plotting.', now() - interval '2 days' - interval '20 hours'),
  ('eb000000-0000-0000-0000-222222222222',
   'dc000000-0000-0000-0000-111111111111', 'a9999999-9999-9999-9999-999999999999', 'bb000000-0000-0000-0000-111111111111', NULL,
   'Scout tried to herd it once. Once. She now respects the roomba.', now() - interval '2 days' - interval '18 hours'),
  ('eb000000-0000-0000-0000-333333333333',
   'dc000000-0000-0000-0000-111111111111', 'a6666666-6666-6666-6666-666666666666', 'b8888888-8888-8888-8888-222222222222', 'eb000000-0000-0000-0000-222222222222',
   'Pepper has NO respect for the roomba. She has cornered it 47 times.', now() - interval '2 days' - interval '16 hours')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 10. REACTIONS
-- ============================================================================

INSERT INTO reactions (post_id, user_id, type) VALUES
  -- Reactions on Emma's post (d1)
  ('d1111111-1111-1111-1111-111111111111', 'a2222222-2222-2222-2222-222222222222', 'HEART'),
  ('d1111111-1111-1111-1111-111111111111', 'a3333333-3333-3333-3333-333333333333', 'HEART'),
  ('d1111111-1111-1111-1111-111111111111', 'a4444444-4444-4444-4444-444444444444', 'LAUGH'),
  ('d1111111-1111-1111-1111-111111111111', 'a5555555-5555-5555-5555-555555555555', 'HEART'),
  -- Reactions on Mike's photo post (d2)
  ('d2222222-2222-2222-2222-222222222222', 'a1111111-1111-1111-1111-111111111111', 'LAUGH'),
  ('d2222222-2222-2222-2222-222222222222', 'a3333333-3333-3333-3333-333333333333', 'HEART'),
  ('d2222222-2222-2222-2222-222222222222', 'a8888888-8888-8888-8888-888888888888', 'LAUGH'),
  -- Reactions on Lisa's lost pet post (d3)
  ('d3333333-3333-3333-3333-333333333333', 'a1111111-1111-1111-1111-111111111111', 'SAD'),
  ('d3333333-3333-3333-3333-333333333333', 'a4444444-4444-4444-4444-444444444444', 'SAD'),
  ('d3333333-3333-3333-3333-333333333333', 'a9999999-9999-9999-9999-999999999999', 'SAD'),
  -- Reactions on James's event post (d4)
  ('d4444444-4444-4444-4444-444444444444', 'a1111111-1111-1111-1111-111111111111', 'HEART'),
  ('d4444444-4444-4444-4444-444444444444', 'a2222222-2222-2222-2222-222222222222', 'WOW'),
  ('d4444444-4444-4444-4444-444444444444', 'a3333333-3333-3333-3333-333333333333', 'HEART'),
  ('d4444444-4444-4444-4444-444444444444', 'a6666666-6666-6666-6666-666666666666', 'HEART'),
  ('d4444444-4444-4444-4444-444444444444', 'a9999999-9999-9999-9999-999999999999', 'LIKE'),
  -- Reactions on Lisa's PSA post (d5)
  ('d5555555-5555-5555-5555-555555555555', 'a2222222-2222-2222-2222-222222222222', 'LAUGH'),
  ('d5555555-5555-5555-5555-555555555555', 'a4444444-4444-4444-4444-444444444444', 'IDEA'),
  -- Reactions on Chai's pinecone (d6)
  ('d6666666-6666-6666-6666-666666666666', 'a1111111-1111-1111-1111-111111111111', 'LAUGH'),
  ('d6666666-6666-6666-6666-666666666666', 'a6666666-6666-6666-6666-666666666666', 'HEART'),
  ('d6666666-6666-6666-6666-666666666666', 'a8888888-8888-8888-8888-888888888888', 'LAUGH'),
  -- Reactions on Rolo's post (d7)
  ('d7777777-7777-7777-7777-777777777777', 'a5555555-5555-5555-5555-555555555555', 'LAUGH'),
  ('d7777777-7777-7777-7777-777777777777', 'aa000000-0000-0000-0000-000000000000', 'LAUGH'),
  ('d7777777-7777-7777-7777-777777777777', 'a7777777-7777-7777-7777-777777777777', 'LAUGH'),
  -- Reactions on Scout's post (d9)
  ('d9999999-9999-9999-9999-999999999999', 'a8888888-8888-8888-8888-888888888888', 'WOW'),
  ('d9999999-9999-9999-9999-999999999999', 'a6666666-6666-6666-6666-666666666666', 'LAUGH'),
  -- Reactions on Bruno & Churro (da)
  ('da000000-0000-0000-0000-111111111111', 'a1111111-1111-1111-1111-111111111111', 'HEART'),
  ('da000000-0000-0000-0000-111111111111', 'a7777777-7777-7777-7777-777777777777', 'HEART'),
  ('da000000-0000-0000-0000-111111111111', 'a5555555-5555-5555-5555-555555555555', 'HEART'),
  -- Reactions on Olive's event (db)
  ('db000000-0000-0000-0000-111111111111', 'a4444444-4444-4444-4444-444444444444', 'HEART'),
  ('db000000-0000-0000-0000-111111111111', 'a6666666-6666-6666-6666-666666666666', 'LIKE'),
  -- Reactions on roomba post (dc)
  ('dc000000-0000-0000-0000-111111111111', 'a8888888-8888-8888-8888-888888888888', 'LAUGH'),
  ('dc000000-0000-0000-0000-111111111111', 'a9999999-9999-9999-9999-999999999999', 'LAUGH'),
  ('dc000000-0000-0000-0000-111111111111', 'a5555555-5555-5555-5555-555555555555', 'LAUGH')
ON CONFLICT (post_id, user_id) DO NOTHING;

COMMIT;
