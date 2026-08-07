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

| Path                     | Role                                                          |
| ------------------------ | ------------------------------------------------------------- |
| `src/routes/`            | Pages (`/` connect, `/demo` hardware-free)                    |
| `src/lib/configurator/`  | Configurator UI (remap, actuation, advanced keys, gamepad, …) |
| `src/lib/keyboard/`      | `HMKKeyboard`, `DemoKeyboard`, HID commander                  |
| `src/lib/libhmk/`        | Protocol types and commands                                   |
| `src/lib/components/ui/` | shadcn-svelte primitives                                      |
| `wrangler.jsonc`         | Cloudflare Workers config                                     |

## Notes

- Prefer `/demo` for end-to-end configurator testing in headless/cloud environments.
- `preview` / `deploy` invoke Wrangler; not required for local UI work.
- Keep changes focused; match existing Prettier/ESLint/Svelte 5 (runes) style. Do not restate tool-enforced formatting rules here.

## Docs

- [README.md](README.md) — prerequisites, getting started, deploy
- Firmware companion: [libhmk](https://github.com/tmyk-io/libhmk)

## カスタム Cursor Skills（tmyk-io/cursor-skills）

個人用スキル集 `tmyk-io/cursor-skills` を利用します。Cloud Agent の Build 時に `.cursor/install-skills.sh` が同リポジトリを clone し、スキルを `~/.cursor/skills` へ配置します。**Environment では `hmkconf` と `libhmk` の2つだけ選べばよく、`cursor-skills` を付ける必要はありません。**

- 起動: `.cursor/environment.json` の `install` + `repositoryDependencies`（`github.com/tmyk-io/cursor-skills` をトークンに含める）→ `.cursor/install-skills.sh` が private でも clone → `scripts/cloud-install.sh`（`~/.cursor/skills` へ rsync）。Cursor GitHub App に `cursor-skills` へのアクセスが付いていること
- 収録スキル: `agents-md-creator` / `doc-updater` / `commit-push` / `dig` / `writing-plans`（各 `~/.cursor/skills/<name>/SKILL.md`）
- **反映タイミング**: skills は Build 時点のスナップショットです。`cursor-skills` を更新したら、この Environment を **Rebuild** してください。一覧は次セッションから反映されます（同一セッション内では該当 `SKILL.md` を直接読めます）
- スキルの追加・更新は `cursor-skills` 側で行い、そちらの `scripts/sync-from-local.sh` で同期します（このリポジトリにはスキル本体を置きません）
