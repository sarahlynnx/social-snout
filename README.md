# SocialSnout

A location-based social app for pets and their people. Swipe through nearby pets, match with ones you'd like to meet, chat with their owners, and discover what's happening in your neighborhood.

## Demo

**Test credentials:** `emma.johnson@test.com` / `password123`

See [docs/install-checklist.md](docs/install-checklist.md) for the full list of test accounts and smoke test cases.

## Features

- Location-based pet discovery with swipe-to-match
- Neighborhood feed with post types (playdate, lost pet, photo, events)
- Realtime chat between matched pets
- Multi-pet profiles with photos, prompts, and temperament tags
- Matching preferences with radius and species filters

## Tech Stack

- **Frontend**: React Native 0.81, Expo SDK 54, TypeScript, NativeWind v4
- **Backend**: Supabase (Auth, Postgres + PostGIS, Realtime, Storage)
- **Animations**: React Native Reanimated 3
- **Navigation**: Expo Router (file-based)

## Screenshots

_Coming soon, see [docs/install-checklist.md](docs/install-checklist.md) for the smoke test walkthrough._

## Architecture Highlights

### Location-Aware Queries

Pet discovery and feed posts use PostGIS `ST_DWithin` queries on `geography` columns for radius-bounded results. The swipe deck shows pets within the user's configured radius, sorted by distance.

### Atomic Match Detection

The `handle_swipe` SQL function ([supabase/migrations/002_swipe_match_functions.sql](supabase/migrations/002_swipe_match_functions.sql)) records a swipe, checks for mutual interest, and creates a match in a single transaction. The `matches` table uses a normalized constraint (`pet_a < pet_b`) so concurrent swipes can't create duplicate matches.

### Gesture-Driven Swipe Deck

Reanimated worklets run on the native UI thread for 60fps card animations. `runOnJS` bridges back to the JS thread for Supabase calls, so network requests never block the gesture. Only two cards render at a time, the "deck" is an illusion.

### Design System

Custom Tailwind palette — sage green, terracotta, golden honey, warm neutrals. The default `gray` scale is overridden in the NativeWind config so every `gray-*` class inherits warmth automatically.

## Running Locally

### Prerequisites

- Node.js 18+
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- Expo Go app (iOS/Android) or an emulator

### Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Fill in your Supabase URL and anon key

# Start Supabase locally
npx supabase start

# Apply migrations and seed data
npx supabase db reset

# Start the dev server
npx expo start
```

### Environment Variables

| Variable                        | Description                          |
| ------------------------------- | ------------------------------------ |
| `EXPO_PUBLIC_SUPABASE_URL`      | Your Supabase project URL            |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous (public) key |

## Project Structure

```
app/           # Expo Router screens (file-based routing)
components/    # Reusable UI components
hooks/         # Custom React hooks (auth, swipe, matches, messages)
lib/           # Supabase client, storage helpers, utilities
supabase/      # Migrations, seed data, config
```

## Testing

```bash
npx jest
```

6 test suites covering auth, swipe logic, matches, messaging, storage, and UI components.

## Status

Portfolio project — feature-complete, not in production. See [docs/PRODUCTION.md](docs/PRODUCTION.md) for what a real launch would require.
