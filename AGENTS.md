# AGENTS.md

## Cursor Cloud specific instructions

`hmkconf` is a SvelteKit (Svelte 5) + Vite web configurator for libhmk Hall-effect
keyboards. It has **no backend and no database**: the running app talks directly to a
physical keyboard over the browser WebHID API. Commands are documented in `README.md`
and `package.json` scripts; only the non-obvious notes below are captured here.

- **Package manager is `bun`, not npm.** Use `bun install`, `bun dev`, `bun lint`,
  `bun check`, `bun run build`. `bun` is installed at `~/.bun/bin/bun` (on PATH for
  interactive shells via `~/.bashrc`).
- **Dev server:** `bun dev` serves on `http://localhost:5173`. Startup takes a few
  seconds because Vite pre-bundles deps on first run.
- **Testing without hardware:** there is no cloud-accessible keyboard, so use the
  built-in demo mode at `http://localhost:5173/demo` (`src/lib/keyboard/demo-keyboard.svelte.ts`).
  It simulates firmware responses in-browser and exercises the full configurator
  (remap, performance/actuation, advanced keys, gamepad) end to end. The connect flow
  on `/` calls `navigator.hid.requestDevice`, which cannot work headless.
- **CI equivalents (`.github/workflows/test.yml`):** `bun lint` (prettier + eslint) and
  `bun check` (`svelte-kit sync` + `svelte-check`). `bun check` is slow (~40s) because it
  type-checks the whole Svelte project.
- **Build/deploy target is Cloudflare Workers** (`@sveltejs/adapter-cloudflare`).
  `bun run preview` and `bun run deploy` invoke `wrangler`; `deploy` needs `wrangler login`.
