# AGENTS.md

## Cursor Cloud specific instructions

`hmkconf` is a SvelteKit 2 / Svelte 5 web configurator for libhmk Hall-effect keyboards. It is a fully client-side, prerendered SPA that talks to a physical keyboard over WebHID; there is no backend or database.

Package manager is **bun** (see `bun.lock`). Standard commands live in `package.json`:

- Dev server: `bun dev` (serves on http://localhost:5173).
- Lint: `bun lint` (Prettier check + ESLint). Type check: `bun check` (svelte-check). These are what CI runs (`.github/workflows/test.yml`).
- Build: `bun run build`.

Non-obvious notes:

- The `/demo` route uses an in-memory demo keyboard, so the full UI (remap, performance, advanced keys, gamepad, calibration, profiles, settings) can be exercised end-to-end **without any hardware**. Use `/demo` for manual UI testing.
- Real-device use requires WebHID, which only works in Chromium-based browsers (Chrome/Edge) plus a physical libhmk keyboard — not available in this environment. Test via `/demo` instead.
- `bun run preview` and `bun run deploy` build and invoke Wrangler for Cloudflare Workers; they require Cloudflare auth and are **not** needed for local development.
