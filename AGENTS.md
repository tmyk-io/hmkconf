# AGENTS.md

## Cursor Cloud specific instructions

`hmkconf` is a fully client-side SvelteKit 2 + Vite web app (no backend, database, or auth). It configures libhmk Hall-effect keyboards directly from the browser over WebHID. Package manager is `bun` (see `README.md` and `package.json` scripts).

- Dev server: `bun dev` serves on `http://localhost:5173` (Vite). First page load triggers dependency pre-bundling, so it can take a few seconds before the UI renders.
- Standard commands live in `package.json`: `bun lint` (Prettier check + ESLint), `bun check` (svelte-kit sync + `svelte-check` type check), `bun run build`. CI (`.github/workflows/test.yml`) runs `bun lint` and `bun check`.
- Hardware-free testing: use the `/demo` route (`http://localhost:5173/demo`, `src/routes/demo/+page.svelte`), which loads a mock keyboard (`src/lib/keyboard/demo-keyboard.svelte.ts`). The main `/` "Connect Keyboard" flow needs a physical keyboard via WebHID and only works in Chromium-based browsers (not Firefox/Safari), so prefer `/demo` for automated/GUI smoke tests.
