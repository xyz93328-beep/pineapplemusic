# Project memory

## Product intent & audience

- Open-source Apple Music web clone using Spotify Web API + LRCLIB for synced lyrics.
- Audience: developers/users wanting Apple Music's aesthetic with Spotify's catalog/playback.
- Forkers must provide their own Spotify Client ID via onboarding (no shared credentials).

## Brand personality & voice

- Apple Music-inspired: clean, premium, content-first.
- Minimal chrome; emphasis on album art, typography, and motion.

## Visual design & UX direction

- Stack: Vite + React + TypeScript + Tailwind + Framer Motion.
- Icons via lucide-react. Path alias `@/` → `src/`.
- Routing via react-router-dom (BrowserRouter in `src/main.tsx`).
- Production-quality UI; avoid cookie-cutter templates.

## Decisions, constraints & rationale

- `.bolt/prompt` holds authoritative global instructions; not duplicated here.
- Template-provided packages (React, Tailwind, lucide-react, Framer Motion) are baseline; avoid adding UI/icon libraries unless necessary.
- `react-router-dom` is a required dependency; must be present in both `package.json` and the lockfile.
- Dev-server dependency resolution errors may stem from stale Vite cache; clearing the cache is the preferred fix when packages exist on disk and production build succeeds.
- Spotify Client ID is stored in browser (persisted store) so forks can self-onboard without env config.
- Client Secret intentionally NOT collected: sign-in flow is PKCE/public-client based; storing secrets in a browser app would expose them to anyone.
- `.env`-provided `VITE_SPOTIFY_CLIENT_ID` still works and skips the setup form for the original author; removing it (or clicking "Use a different Spotify app") reveals the onboarding screen.
- README updated to reflect new self-service setup flow.

## Open questions & assumptions

- Assumed Spotify auth uses PKCE (public-client) flow, so only Client ID is needed; full auth flow details not yet confirmed.
- Playback strategy (Spotify SDK vs. 30s preview) still undecided.
- LRCLIB integration specifics (endpoint usage, fallback behavior) not yet detailed.
- Full route map / page structure not yet defined.
- Typecheck and build pass, but browser sign-in flow was not manually tested.