# AGENTS.md

## Cursor Cloud specific instructions

`hmkconf` is a SvelteKit (Svelte 5) web configurator for libhmk Hall-effect keyboards, built with Vite and deployed to Cloudflare Workers via `@sveltejs/adapter-cloudflare`. It talks to keyboards over WebHID.

- Package manager is `bun` (see `bun.lock`). Dependencies are installed by the Cloud startup update script; you normally do not need to run `bun install` yourself.
- Standard commands live in `package.json` scripts: `bun dev` (Vite dev server on http://localhost:5173), `bun lint` (Prettier check + ESLint), `bun check` (svelte-kit sync + svelte-check type check), `bun run build`.
- No unit test suite exists; CI (`.github/workflows/test.yml`) only runs `bun lint` and `bun check`.
- Hardware-free testing: the app has a `/demo` route (`src/routes/demo/+page.svelte`) that loads a `DemoKeyboard`, so the full configurator (key remapping, actuation, etc.) can be exercised in a normal browser with no keyboard attached. Real hardware requires WebHID, which needs a Chromium-based browser and a physical libhmk keyboard.
- `bun run preview`/`bun run deploy` invoke `wrangler` (Cloudflare Workers) and require Cloudflare auth; not needed for local development.
