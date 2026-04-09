# SocialSnout — Portfolio Writeup

## The Idea

A location-based social app for pets and their people. Swipe through nearby pets, match with ones you'd like to meet, chat with their owners, and discover what's happening in your neighborhood: playdates, lost pets, local events. Think of it as the app you'd open before heading to the dog park.

## Why This Project

I wanted to build something with real complexity: geospatial queries, realtime messaging, physics-based gestures, multi-image profiles, and a polished design system. The goal was a portfolio piece that demonstrates full-stack ability, from database schema design to pixel-level UI work, not just a tutorial project with a twist.

The tech stack (React Native, Expo SDK 54, TypeScript, NativeWind, Supabase) reflects what production apps actually ship with. Every architectural decision maps to a real-world pattern I'd use on a team.

## The Hardest Problem: The Swipe Deck

The swipe interaction has to feel right or the entire app feels broken. Cards need to follow your finger at 60fps, rotate naturally, reveal the next card underneath, and snap to a decision (like or pass) with satisfying momentum.

The implementation uses React Native Reanimated worklets, functions that run on the native UI thread, completely bypassing the JavaScript bridge. Gesture position drives card translation and rotation via shared values. When a swipe crosses the decision threshold, `runOnJS` bridges back to the JS thread to fire the Supabase API call asynchronously, so the network request never blocks the animation.

A deliberate rendering optimization: only two cards exist in the tree at any time (current + next). The "deck" is an illusion. When you swipe away the top card, the next one is already positioned underneath, and a fresh card is mounted behind it. Pre-rendering more cards would mean more layout passes, more GPU work, and heavier memory usage with no user-visible benefit. The background data fetch happens independently, so API call frequency stays the same regardless of how many cards are rendered.

## The Second Hardest Problem: Atomic Match Detection

Two users swiping right on each other's pets simultaneously is a real race condition. If both "right swipe" writes land at the same time, you could end up with duplicate matches or missed ones.

The solution is a single PostgreSQL function (`handle_swipe`) that does everything in one transaction: records the swipe, checks if the other pet already swiped right on this one, and if so, creates the match. The `matches` table uses a normalized constraint (`pet_a < pet_b`) so only one row can ever represent a pair, and `ON CONFLICT DO NOTHING` makes concurrent calls idempotent. The function runs as `SECURITY DEFINER` so it can read the other user's swipes without exposing that table through RLS.

## The Design

The app uses sage green, terracotta, golden honey, and warm neutrals, a palette that feels like a sophisticated dog park, not a tech demo.

One area that required real platform-specific work was modal navigation. On iOS, modals slide up from the bottom and can be dismissed by swiping down or tapping back, which is native behavior users expect. Android has no equivalent gesture and the system back button behaves differently depending on the navigation stack. The solution was a `Platform.OS` check in the root layout that conditionally injects a close button (`X`) into the modal header on Android only, with `headerShown: true` and matching background color so it integrates cleanly with the rest of the screen. iOS gets the standard sheet dismissal with no extra chrome. The same `androidModalOptions` object is reused across every modal screen (pet profiles, edit screens, create post, matching preferences) so the behavior is consistent throughout the app.

## What I Learned

- **NativeWind + expo-image on Android**: `className` doesn't reliably drive image dimensions on Android. Use `style` for width/height and let `className` handle non-layout properties like `rounded-xl`.
- **PostGIS geography vs. geometry**: For "pets within X miles," you want `geography` (spherical Earth math) and `ST_DWithin`, not `geometry` (flat plane). The difference matters at real-world distances.
- **Expo adaptive icons**: Android's adaptive icon system splits foreground and background layers. The visible area is roughly 66% of the canvas, anything outside that circle gets clipped by the device's mask shape.
- **Supabase Realtime for chat**: Subscribing to a Postgres channel with row-level filters gives chat messages that arrive in under 200ms. Combined with optimistic local inserts, it feels instant.

## What I'd Do Differently

- **Push notifications from day 1**: I deferred them as "not needed for portfolio," but the match and chat experience would be noticeably better with them. They're also straightforward with Expo's notification service, I should have just built it in.
- **Self-hosted photos**: Pet and post images currently use Pexels URLs. Fine for a demo, but the URLs aren't under my control. I'd use Supabase Storage from the start in a production context.

## Links

- **GitHub**: [github.com/sarahlynnx/social-snout](https://github.com/sarahlynnx/social-snout)
- **Tech stack**: React Native 0.81, Expo SDK 54, TypeScript, NativeWind v4, Supabase, Reanimated 3, Expo Router
