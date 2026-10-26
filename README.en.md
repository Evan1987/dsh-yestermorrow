# YESTERMORROW · 昨日之明日

**English** · [简体中文](README.md)

> Yesterday's visions of tomorrow, in today's workspace.

A retrofuturist skin collection for **DeepSeek Harness Web GUI**. One plugin, three settings: a dusk train, neon rain and a sunset spaceport. Each keeps the materials and everyday life of an earlier era while imagining a future that never arrived.

Switching changes the visual materials, scenery and lettering without reloading the page or changing the conversation, draft or current quote.

## Three skins

### Aetherworks · 以太工造

A dusk train approaches a distant future city. Brass, industrial instruments and warm carriage windows. Light and dark modes share the train photograph; light mode adds a survey-paper treatment.

![Latest Aetherworks home](preview/live-dark.png)

<details>
<summary>Light mode</summary>

![Aetherworks light home](preview/live-light.png)

</details>

### Neon Drift · 霓虹夜行

Vintage hover taxis and elevated transit weave through a rainy neon street, with wet asphalt, pedestrians and a ramen shop still open. Cyan and magenta meet backlit glass. Dark only.

![Latest Neon Drift home](preview/neon-hero.png)

### Sunset Coast · 落日海岸

Palms, chrome and a coral sunset. A Space Age offshore port, monorail and vintage spacecraft add a 1960s vision of tomorrow while keeping the coast open and peaceful. Dark only.

![Latest Sunset Coast home](preview/sunset-hero.png)

All three share 22 sourced film and philosophy quotes. Switching skins preserves the current quote; the round button beside it or the `R` key selects another.

## Install

Requires DSH Web **0.2.1-rc.2** or a compatible version.

```bash
dsh plugin --profile web add 'github:Evan1987/dsh-yestermorrow#main'
```

Restart DSH once after installing. Later skin switches apply immediately.

Uninstall:

```bash
dsh plugin --profile web remove '@zcm/dsh-client-ui-skin-yestermorrow'
```

## Use

Open the skin switcher at the bottom of the sidebar, or use the keyboard:

| Shortcut | Action |
| --- | --- |
| `Alt+1` | Aetherworks |
| `Alt+2` | Neon Drift |
| `Alt+3` | Sunset Coast |
| `R` | Change quote; ignored inside input fields |

The selected skin is saved locally in the browser and survives a refresh. For testing, use `?skin=aetherworks`, `?skin=neon` or `?skin=sunset`.

Enable one skin plugin per DSH profile to avoid overlapping styles.

## Local development

```bash
git clone https://github.com/Evan1987/dsh-yestermorrow.git
cd dsh-yestermorrow
pnpm install
pnpm typecheck
pnpm test
pnpm build
dsh plugin --profile web add "$PWD"
```

- `src/client/index.ts`: lifecycle, switching, browser preferences and cleanup.
- `src/client/skins.ts`: skin definitions; `quotes.ts`: shared quote pool.
- `src/client/theme.css` and `src/client/skins/`: shared layout and skin materials.
- `src/client/assets/`: the WebP backgrounds used by the plugin.
- `build/build.mjs`: generates `lib/index.js` and `lib/client.js`. Built files are committed, so installing from GitHub needs no local build.
- `tests/apply.test.mjs`: lifecycle, switching, preference migration, quotes and module registration regressions.

CI runs type checks and tests on Node 22 + pnpm 11 and verifies that committed build output matches the source.

## Boundaries and license

This client-only plugin does not modify model requests or collect usage data. CSS, WebP and SVG are inlined, with no remote image or font requests at runtime. Uninstall removes the injected interface nodes and styles.

Code is covered by the [MIT License](LICENSE). Neon and coast images are AI-assisted edits of the existing backgrounds; the train background is retained. Quotes are text only, with their sources noted; no film stills or font files are included. Detailed design history: [Aetherworks notes](docs/aetherworks.md) (Chinese).
