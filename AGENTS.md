# AGENTS.md

SvelteKit (Svelte 5) web configurator for libhmk Hall-effect keyboards. The browser talks to hardware over WebHID; there is no app backend or database. Package manager is **bun** (`bun.lock`).

## Commands

```bash
bun install          # install deps
bun dev              # Vite dev server → http://localhost:5173
bun lint             # Prettier check + ESLint
bun format           # Prettier write
bun check            # svelte-kit sync + svelte-check
bun run build        # production build
bun run preview      # build + wrangler dev (needs Cloudflare auth)
bun run deploy       # build + wrangler deploy (needs `bunx wrangler login`)
```

## Verification

CI (`.github/workflows/test.yml`) runs only `bun lint` and `bun check` on `main`/`dev`. There is no unit-test suite or `test` script.

For UI work without a physical keyboard, use the demo route:

- URL: http://localhost:5173/demo
- Entry: `src/routes/demo/+page.svelte` → `DemoKeyboard` in `src/lib/keyboard/demo-keyboard.svelte.ts`

Real connect on `/` needs WebHID (`navigator.hid`) and a Chromium-based browser with a libhmk keyboard.

## Important paths

| Path | Role |
|------|------|
| `src/routes/` | Pages (`/` connect, `/demo` hardware-free) |
| `src/lib/configurator/` | Configurator UI (remap, actuation, advanced keys, gamepad, …) |
| `src/lib/keyboard/` | `HMKKeyboard`, `DemoKeyboard`, HID commander |
| `src/lib/libhmk/` | Protocol types and commands |
| `src/lib/components/ui/` | shadcn-svelte primitives |
| `wrangler.jsonc` | Cloudflare Workers config |

## Notes

- Prefer `/demo` for end-to-end configurator testing in headless/cloud environments.
- `preview` / `deploy` invoke Wrangler; not required for local UI work.
- Keep changes focused; match existing Prettier/ESLint/Svelte 5 (runes) style. Do not restate tool-enforced formatting rules here.

## Docs

- [README.md](README.md) — prerequisites, getting started, deploy
- Firmware companion: [libhmk](https://github.com/tmyk-io/libhmk)
