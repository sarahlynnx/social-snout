# Production Readiness

SocialSnout is a portfolio project - feature-complete, demo-ready, and not in production. This document captures what would be needed for a real launch, and why each item was intentionally deferred.

## Current State

- Preview APK installed via EAS Build (Android)
- Demo seed data with 10 users, 18 pets, pre-populated feed, matches, and chat
- Supabase backend with Auth, Postgres + PostGIS, Realtime, and Storage
- No live users, no app store listing

## What a Real Launch Would Require

### Auth Hardening

- **Email verification**: Implemented - users receive a confirmation email and must verify before logging in.
- **Password reset**: Implemented - forgot-password flow with reset screen and deep link handler is in place.
- **Rate limiting**: Not verified - Supabase Auth applies default rate limits at the platform level, but no custom limits have been configured and would need to be reviewed before launch.

### Push Notifications

- Integrate `expo-notifications` with FCM (Android) and APNs (iOS).
- Supabase Edge Function triggered on new messages, matches, and nearby events.
- Permission onboarding prompt after first match ("Turn on notifications so you don't miss messages from Buddy!").
- Estimated effort: ~1 day.

### App Store / Play Store

- Privacy policy URL (required by both stores).
- Content rating questionnaire.
- Store listing copy, feature graphic, and screenshots.
- Developer accounts: Google Play ($25 one-time) and Apple Developer ($99/year).

### Photo Hosting

Pet and post photos currently use Pexels URLs for demo convenience. Production would need:

- Upload pipeline: user picks photo → compress/resize client-side → upload to Supabase Storage (or Cloudflare R2).
- Signed URLs or public bucket with CDN for fast delivery.
- Image moderation (see below).

### Geography

Seed data is geographically fixed to Bellevue, WA. A real launch would need:

- The app already uses GPS coordinates directly from the device (`expo-location`).
- Radius expansion heuristics for sparse areas ("No pets within 5 miles - expand to 15?") - the matching radius preference exists but no fallback UX for zero results.
- Multi-region seed data or dynamic onboarding based on location.

### Moderation

- Report/block flows exist in the app. Production would need an admin dashboard for reviewing reports.
- Automated image scanning (AWS Rekognition or Google Cloud Vision) for uploaded photos.
- Human review queue for escalated cases.
- Community guidelines document linked from the app.

### Observability

- **Crash reporting**: Sentry or Bugsnag for runtime errors.
- **Analytics**: PostHog or Mixpanel for product metrics (DAU, match rate, messages sent).
- **Backend monitoring**: Supabase logs piped to Datadog or similar for query performance, auth failures, and storage usage.

### Device Testing

Currently tested on iOS/Android simulators and devices. Production coverage would need:

- iOS TestFlight beta distribution.
- Accessibility audit (screen reader, dynamic text sizes, color contrast).

## Why These Are Deferred

Each item above carries real cost: money, time, and ongoing maintenance. The goal of this project was to demonstrate full-stack mobile development ability - location-aware queries, realtime messaging, gesture-driven UI, and thoughtful design — not to ship a product to thousands of users. Every deferral was a deliberate scope decision, not an oversight.
