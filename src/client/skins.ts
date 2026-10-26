/**
 * The skin shelf.
 *
 * One plugin hosts three surfaces. Everything that differs between them lives
 * here — name, palette accent, the plate legend, the two gauge readings, the
 * tab title, the favicon — while `theme.css` keeps the shared anatomy and
 * `skins/<id>.css` re-materials it. The slogan is content, not material: every
 * skin draws from the same `quotes.ts` pool and keeps the line it already
 * shows. Switching is one attribute on <body>: the inactive sheets are scoped
 * by id, so they cost nothing until their skin is asked for.
 */

export interface SkinStat {
  readonly label: string
  readonly value: string
  /** Rendered small and dimmed after the value: `/ UNRECORDED`, `BPM`. */
  readonly unit: string
}

export interface SkinSpec {
  readonly id: string
  readonly name: string
  readonly en: string
  readonly tagline: string
  /** Accent used by the switcher dot and the active row. */
  readonly accent: string
  /** CSS gradient painted into the switcher thumbnail. */
  readonly swatch: string
  /** Hero plate legend above the quote, e.g. `PLATE VII · SURVEY 014`. */
  readonly plateLabel: string
  /** The sidebar logotype: two lines, set as CSS `content` strings. */
  readonly brand: { readonly name: string; readonly sub: string }
  /** Lettering on the composer rails, which the anatomy slots in by name. */
  readonly rail: {
    readonly scope: string
    readonly card: string
    readonly cardActive: string
    readonly channel: string
  }
  /** Label of the sidebar's primary action. */
  readonly sessionLabel: string
  /** Document title suffix: `以太工造`, `霓虹夜行`. */
  readonly title: string
  readonly themeColor: { readonly dark: string; readonly light: string }
  /**
   * A skin designed for the dark surface. It pins its own palette regardless of
   * the DSH light/dark preference: the base sheet's light rules step aside for
   * `data-skin-forced-dark`, so a half-designed light variant is never shown.
   */
  readonly darkOnly: boolean
  readonly stats: readonly SkinStat[]
  readonly favicon: string
}

const AETHER_FAVICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32"><rect width="32" height="32" fill="#0b0806"/><g fill="none" stroke="#c79a4b" stroke-width="1.2"><path d="M4 27V14Q4 5 16 5t12 9v13"/><path d="M7 27V15q0-7 9-7t9 7v12"/><circle cx="16" cy="17" r="4.2"/><path d="M16 9v3.4M16 21.6V25M8 17h3.4M20.6 17H24"/></g></svg>`

const NEON_FAVICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32"><rect width="32" height="32" fill="#070b18"/><g fill="none" stroke="#41f0ff" stroke-width="1.3"><circle cx="16" cy="16" r="10.5" opacity=".55"/><circle cx="16" cy="16" r="6.4"/></g><g fill="none" stroke="#ff3d8b" stroke-width="1.3"><path d="M16 2.5v5M16 24.5v5M2.5 16h5M24.5 16h5"/></g><circle cx="16" cy="16" r="2" fill="#ff9ecb"/></svg>`

const SUNSET_FAVICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32"><defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff8f6b"/><stop offset="1" stop-color="#c0347a"/></linearGradient></defs><rect width="32" height="32" fill="#1a0c22"/><circle cx="16" cy="14" r="7.5" fill="url(#s)"/><g stroke="#ffb070" stroke-width="1" opacity=".7"><path d="M4 24h24M4 27h24M4 30h24"/></g><path d="M0 20h32" stroke="#1a0c22" stroke-width="1.6"/></svg>`

/** 以太工造 — the survey terminal that came first. */
const AETHERWORKS: SkinSpec = {
  id: 'aetherworks',
  name: '以太工造',
  en: 'AETHERWORKS',
  tagline: '一座未完工的蒸汽巨构，仍在替不在的人运转',
  accent: '#c79a4b',
  swatch: 'linear-gradient(150deg, #0b0806 12%, #2a1e12 46%, #c79a4b 92%)',
  plateLabel: 'PLATE VII · SURVEY 014',
  brand: { name: 'AETHERWORKS', sub: 'SURVEY // SECTOR 07' },
  rail: {
    scope: '◉ SURVEY SCOPE',
    card: '◉ MESSAGE TUBE     //     CHANNEL 07',
    cardActive: '◉ CONTINUE THE LOG     //     CHANNEL 07',
    channel: 'MESSAGE TUBE // CH 07',
  },
  sessionLabel: 'NEW SURVEY',
  title: '以太工造',
  themeColor: { dark: '#0b0806', light: '#ded2b9' },
  darkOnly: false,
  stats: [
    { label: 'LAST INSPECTION', value: '41', unit: 'Y' },
    { label: 'CREW', value: '00', unit: '/ UNRECORDED' },
  ],
  favicon: AETHER_FAVICON,
}

/** 霓虹夜行 — the living night: wet asphalt, taxis, a ramen stall still open. */
const NEON: SkinSpec = {
  id: 'neon',
  name: '霓虹夜行',
  en: 'NEON DRIFT',
  tagline: '雨里的招牌、等车的出租车，和一间还开着的拉面摊',
  accent: '#41f0ff',
  swatch: 'linear-gradient(150deg, #070b18 8%, #13406b 40%, #41f0ff 64%, #ff3d8b 92%)',
  plateLabel: 'PLATE IV · NIGHT DRIVE',
  brand: { name: 'NEON DRIFT', sub: 'NIGHT LINE // SECTOR 07' },
  rail: {
    scope: '◉ NIGHT SCOPE',
    card: '◉ OPEN LINE     //     CHANNEL 07',
    cardActive: '◉ CONTINUE THE LINE     //     CHANNEL 07',
    channel: 'OPEN LINE // CH 07',
  },
  sessionLabel: 'NEW LINE',
  title: '霓虹夜行',
  themeColor: { dark: '#070b18', light: '#070b18' },
  darkOnly: true,
  stats: [
    { label: 'LOCAL TIME', value: '23:48', unit: 'JST' },
    { label: 'CITY', value: 'AWAKE', unit: '/ OPEN UNTIL DAWN' },
  ],
  favicon: NEON_FAVICON,
}

/** 落日海岸 — the long coast at 19:42: coral, chrome, an endless horizon. */
const SUNSET: SkinSpec = {
  id: 'sunset',
  name: '落日海岸',
  en: 'SUNSET COAST',
  tagline: '一条没有尽头的海岸公路，六点钟的太阳，粉色的过去',
  accent: '#ff8f6b',
  swatch: 'linear-gradient(150deg, #1a0c22 6%, #7a2a63 34%, #ff6b8a 62%, #ffc07a 92%)',
  plateLabel: 'SIDE A · COAST ROAD',
  brand: { name: 'SUNSET COAST', sub: 'COAST ROAD // MILE 27' },
  rail: {
    scope: '◉ COAST SCOPE',
    card: '◉ SIDE A     //     MILE 27',
    cardActive: '◉ CONTINUE THE DRIVE     //     MILE 27',
    channel: 'SIDE A // CH 03',
  },
  sessionLabel: 'NEW DRIVE',
  title: '落日海岸',
  themeColor: { dark: '#12081c', light: '#12081c' },
  darkOnly: true,
  stats: [
    { label: 'SUNSET', value: '19:42', unit: 'LOCAL' },
    { label: 'MILE', value: '27', unit: '/ PACIFIC' },
  ],
  favicon: SUNSET_FAVICON,
}

export const SKINS: readonly SkinSpec[] = [AETHERWORKS, NEON, SUNSET]

export const DEFAULT_SKIN_ID = AETHERWORKS.id

export const skinById = (id: string | null | undefined): SkinSpec =>
  SKINS.find(skin => skin.id === id) ?? AETHERWORKS