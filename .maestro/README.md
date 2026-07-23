# Maestro flows

UI test flows for SocialSnout, run against an Android emulator. See
[../docs/android-e2e-setup.md](../docs/android-e2e-setup.md) for setup and how to run.

Run all: `npm run e2e:android` · Run one: `maestro test .maestro/02_login.yaml`

Flows are numbered; `npm run e2e:android` runs the whole `.maestro/` folder in order.
Login is factored into `subflows/login.yaml` and reused via `runFlow`.

## Flows

Each flow maps to a section of [../docs/install-checklist.md](../docs/install-checklist.md).

| File                   | Checklist section | Covers                                                |
| ---------------------- | ----------------- | ----------------------------------------------------- |
| `01_smoke_launch.yaml` | —                 | App launches to login / onboarding                    |
| `02_login.yaml`        | Auth              | Login with seed account `emma.johnson@test.com`       |
| `03_swipe.yaml`        | Swipe / Discover  | Discover tab → pass + like on the swipe deck          |
| `04_feed.yaml`         | Feed              | Refresh, filter chips, react, open post, add comment  |
| `05_create_post.yaml`  | Create Post       | FAB → pick type → write → submit → appears in feed    |
| `06_matches_chat.yaml` | Matches & Chat    | Open a match, send a message, see it appear           |
| `07_profile.yaml`      | Profile           | Sections render, open Edit, save Matching Preferences |
| `08_register.yaml`     | Auth              | Create account → stops at email-verification prompt   |
| `09_logout.yaml`       | Auth              | Sign Out from Profile returns to login                |
| `subflows/login.yaml`  | —                 | Reusable login, called via `runFlow`                  |

**Not automated** (need external state / two devices — do these manually per the checklist):
location permission prompts, image uploads, realtime two-device messaging, and full
onboarding after signup (blocked by email verification).

## testIDs in the app

| testID                                                                       | Element                      | File                               |
| ---------------------------------------------------------------------------- | ---------------------------- | ---------------------------------- |
| `login-email` / `login-password` / `login-submit`                            | Login form                   | `app/(auth)/login.tsx`             |
| `register-name` / `register-email` / `register-password` / `register-submit` | Register form                | `app/(auth)/register.tsx`          |
| `swipe-pass` / `swipe-like`                                                  | Swipe deck X / heart buttons | `components/swipe/SwipeDeck.tsx`   |
| `feed-create-post-fab`                                                       | Feed "+" FAB                 | `app/(app)/(tabs)/feed/index.tsx`  |
| `reaction-like`                                                              | Post like pill               | `components/feed/ReactionBar.tsx`  |
| `comment-input` / `comment-submit`                                           | Post-detail comment box      | `components/feed/CommentInput.tsx` |
| `create-post-content` / `create-post-submit`                                 | Create-post form             | `app/(app)/create-post.tsx`        |
| `chat-input` / `chat-send`                                                   | Chat message box             | `app/(app)/chat/[matchId].tsx`     |

Tab bar buttons (Discover/Feed/Matches/Profile) are matched by their title text.

## Writing new flows

Flows are YAML. Common commands:

```yaml
appId: com.socialsnout.app
---
- launchApp: { clearState: true }
- tapOn: "Sign In"
- tapOn: { id: "login-button" }
- inputText: "hello"
- assertVisible: "Feed"
- swipe: { direction: LEFT }
- takeScreenshot: match-overlay
```

The seed test accounts and full manual smoke checklist live in
[../docs/install-checklist.md](../docs/install-checklist.md).
