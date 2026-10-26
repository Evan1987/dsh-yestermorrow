# SECTOR 07

**English** · [简体中文](README.md)

> Three night-shift skins for the DeepSeek Harness web GUI: **Aetherworks**, **Neon Drift** and **Sunset Coast**.

One package, three skins, one layout. Switching changes materials and lettering only: no layout changes, no page reload, no second plugin.

| Skin | id | Mood | Palette |
| --- | --- | --- | --- |
| **Aetherworks** | `aetherworks` | An unfinished steam megastructure, still running for the people who left | bone / brass / smoked black |
| **Neon Drift** | `neon` | Rain, signs, a taxi waiting, and one ramen stall still open | cyan / magenta / deep blue |
| **Sunset Coast** | `sunset` | A coastal road with no end, a six-o'clock sun, a pink past | coral / chrome / violet |

![Aetherworks](preview/live-dark.png)

More: [Aetherworks light](preview/live-light.png) · [Neon Drift](preview/neon-hero.png) · [Sunset Coast](preview/sunset-hero.png).

## Why SECTOR 07

`SECTOR 07` already exists inside the first two skins: Aetherworks labels its sidebar `SURVEY // SECTOR 07`, and Neon Drift calls its street `NIGHT LINE // SECTOR 07`. Sunset Coast's `MILE 27` is the coastal stretch of the same night route. The three skins are three locations in one night shift, not three unrelated themes.

Package: `@zcm/dsh-client-ui-skin-sector-07`.

## Install

Requires DSH Web **0.2.1-rc.2** or a compatible version. Currently verified on the web GUI only.

> **Keep only one skin bundle per profile.** This package already contains all three skins. Running it alongside `maid-atelier` or another skin bundle will stack two skins on the same DOM. Remove the old one first:

```bash
dsh plugin --profile web remove @smalltailqwq/dsh-client-ui-skin-maid-atelier
```

Install from GitHub `main`:

```bash
dsh plugin --profile web add 'github:Evan1987/dsh-sector-07#main'
```

Restart DSH once after installing. Later skin switches apply immediately; no restart needed.

Local development:

```bash
git clone https://github.com/Evan1987/dsh-sector-07.git
cd dsh-sector-07
pnpm install
pnpm build
dsh plugin --profile web add "$PWD"
```

Uninstall:

```bash
dsh plugin --profile web remove '@zcm/dsh-client-ui-skin-sector-07'
```

## Switch

Use the skin switcher at the bottom of the sidebar, or the keyboard:

| Shortcut | Skin |
| --- | --- |
| `Alt+1` | Aetherworks |
| `Alt+2` | Neon Drift |
| `Alt+3` | Sunset Coast |

The choice is stored in `localStorage` as `sector-07:skin` and survives a refresh. Switching repaints the scene, lettering and favicon in place; the current page, conversation and draft stay untouched. For testing, you can also append `?skin=neon` or `?skin=sunset`.

On the landing page, the round button next to the quote plate picks another line; bare `R` does the same. `R` inside an input or with `⌘/Ctrl/Alt` is ignored.

## The three skins

- **Aetherworks** — retrofuturism / steampunk / megastructure. Riveted steel, brass gauges, exposed trusses, a clock stopped at `03:17`, and a night plate of the central spire. Dark is the rainy spire; light is a survey-paper archive copy. The only skin with a light mode.
- **Neon Drift** — a rain-soaked street at night. Cyan carries the structure; magenta marks only what is happening now. Dark only.
- **Sunset Coast** — 19:42 on a coastal road: coral sun, chrome reflections, no end. Dark only.

All three share the same pool of 22 quotes, each with its source noted. Switching skins keeps the current quote. Design notes for the default skin: [docs/aetherworks.md](docs/aetherworks.md) (Chinese).

## Develop

```bash
pnpm install
pnpm typecheck
pnpm test        # builds, then runs 22 jsdom contract tests
pnpm build       # emits lib/index.js + lib/client.js
```

- `src/client/index.ts` — scope, style injection, chrome, switcher, cleanup.
- `src/client/skins.ts` — names, lettering, palettes, favicons for all three skins.
- `src/client/theme.css` + `src/client/skins/*.css` — shared anatomy + per-skin materials.
- `build/build.mjs` — esbuild host ESM and browser closure factory; CSS/HTML/WebP are inlined.
- `lib/` is committed, so installing from GitHub does not build on the user's machine.

CI runs `typecheck` and `test` on Node 22 + pnpm 11, and checks that a fresh build produces no `lib/` diff.

## Boundaries

- **Client-only**: the host half is a no-op; no services, no Cordis events, no model-request changes.
- **No remote assets**: CSS, HTML, WebP and SVG are inlined into `lib/client.js`; no runtime image or font requests.
- **Reversible**: uninstall removes its style, scene, hero, favicon, theme-color and title changes, and restores the body attribute.
- **Mutually exclusive**: `skin.json` declares `wiring.id = ui-skin-sector-07`; do not enable another skin bundle in the same profile.
- **No tracking**: no usage data, no network access.

## License

Code is MIT. Text, palettes, UI structure, SVG light effects and HUD overlays are original. The 22 quoted lines are text only, with sources noted; no stills, character art or font files are included. The city photograph is from Pexels ([photo 34945401](https://www.pexels.com/photo/34945401/), Pexels License). Full credits and boundaries: [docs/aetherworks.md §12](docs/aetherworks.md#12-许可与边界) (Chinese).