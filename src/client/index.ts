/**
 * SECTOR 07 / 七号扇区 — client entry for the three-skin shelf.
 *
 * The surface is still client-only: one body attribute scopes the token and
 * component layers, one owned <style> carries every stylesheet (each skin scoped
 * by its own id, so two thirds of the file are inert at any moment), and a small
 * number of reversible chrome nodes add the survey scene, the hero plate, the
 * skin switcher and the sidebar ledger. Every write is retracted by the Cordis
 * effect disposer.
 *
 * Switching skins is a pure client operation: change `data-dsh-skin`, rebuild
 * the few chrome nodes that carry the palette, persist the id in localStorage.
 * No reload, no host round-trip, no second plugin.
 */
import themeCss from './theme.css'
import neonCss from './skins/neon.css'
import sunsetCss from './skins/sunset.css'
import sceneHtml from './scene.html'
import hallImage from './assets/hall.webp'
import duskImage from './assets/dusk.webp'
import neonPlotImage from './assets/neon.webp'
import sunsetPlateImage from './assets/sunset.webp'
import {
  DEFAULT_SKIN_ID,
  SKINS,
  skinById,
  type SkinSpec,
} from './skins'
import { drawQuote, type SkinQuote } from './quotes'

const ATTR = 'data-dsh-sector-07'
const SKIN_ATTR = 'data-dsh-skin'
/** Set while a dark-only skin is mounted: the base sheet's light rules stand down. */
const FORCED_DARK_ATTR = 'data-skin-forced-dark'
const OWNER = 'sector-07'
const STORAGE_KEY = 'sector-07:skin'
const STYLE_KEY = 'sector-07/theme.css'

/** The three sheets, in cascade order: anatomy, then each skin's materials. */
const STYLESHEET = [themeCss, neonCss, sunsetCss].join('\n')

/** Structural Cordis surface used by this browser-only entry. */
interface ClientContext {
  effect(factory: () => () => void, label?: string): void
}

const REFRESH_GLYPH = `<svg viewBox="0 0 16 16" width="9" height="9" aria-hidden="true" focusable="false"><path d="M13.1 6.4A5.3 5.3 0 1 0 13.3 9.4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M13.4 2.7v3.9H9.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`

const CHEVRON_GLYPH = `<svg viewBox="0 0 16 16" width="9" height="9" aria-hidden="true" focusable="false"><path d="M3.5 6 8 10.5 12.5 6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`

const CHECK_GLYPH = `<svg viewBox="0 0 16 16" width="11" height="11" aria-hidden="true" focusable="false"><path d="m3 8.4 3.2 3.2L13 4.8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`

/*
 * A full-width Chinese terminal mark sits on the left half of its em box. Left
 * in the line flow, it adds a phantom quarter-to-half em on the right and makes
 * a centred line read as shifted left. Split it off and let the stylesheet hang
 * it past the line box, so the line is centred by its ink instead of its advance.
 */
const TRAILING_PUNCT = /[，。！？；：、]$/u

const splitTrailingPunct = (text: string): readonly [string, string] => {
  const line = text.trimEnd()
  const match = TRAILING_PUNCT.exec(line)
  if (match === null) return [line, '']
  return [line.slice(0, match.index), match[0]]
}

const quoteLineHtml = (text: string): string => {
  const [line, punct] = splitTrailingPunct(text)
  return punct === '' ? line : `${line}<span class="aw-punct">${punct}</span>`
}

/*
 * Only the control is exposed to assistive tech. The plate itself is decorative
 * — the shell already names the page — so the quote block stays hidden, and the
 * redraw announces its result through the status line below it.
 */
const heroMarkup = (spec: SkinSpec, quote: SkinQuote): string => `
<div class="aw-hero-copy" data-skin-chrome="hero-copy" data-skin-owner="${OWNER}">
  <div class="aw-plate-row">
    <span class="aw-plate" aria-hidden="true">${spec.plateLabel}</span>
    <button type="button" class="aw-quote-refresh" data-aw-quote-refresh aria-label="换一句题词" title="换一句题词（快捷键 R）">${REFRESH_GLYPH}</button>
  </div>
  <div class="aw-quote-body" aria-hidden="true">
    <p class="aw-lede">${quoteLineHtml(quote.setup)}</p>
    <h1 class="aw-hero-title"><span class="aw-cn">${quoteLineHtml(quote.punch)}</span><br><span class="aw-cn aw-brass-word">${quoteLineHtml(quote.turn)}</span></h1>
    <p class="aw-source">—— ${quote.cite}</p>
    <p class="aw-epigraph">${quote.en} <span>· ${quote.from}</span></p>
  </div>
  <div class="aw-stats" aria-hidden="true">
    ${spec.stats.map(stat => `<div class="aw-stat"><span>${stat.label}</span><b>${stat.value} <em>${stat.unit}</em></b></div>`).join('')}
  </div>
  <p class="aw-quote-status" role="status"></p>
</div>`

const writeLine = (host: ParentNode, selector: string, value: string): void => {
  const node = host.querySelector<HTMLElement>(selector)
  if (node !== null) node.textContent = value
}

/** Write a quote line, keeping the hanging trailing mark as its own span. */
const writeQuoteLine = (host: ParentNode, selector: string, value: string): void => {
  const node = host.querySelector<HTMLElement>(selector)
  if (node === null) return
  const [line, punct] = splitTrailingPunct(value)
  if (punct === '') {
    node.textContent = line
    return
  }
  const mark = document.createElement('span')
  mark.className = 'aw-punct'
  mark.textContent = punct
  node.replaceChildren(document.createTextNode(line), mark)
}

/** Reprint `quote` into an existing plate, in place, so focus is never lost. */
function writeQuote(host: HTMLElement, quote: SkinQuote): void {
  writeQuoteLine(host, '.aw-lede', quote.setup)
  writeQuoteLine(host, '.aw-hero-title .aw-cn:not(.aw-brass-word)', quote.punch)
  writeQuoteLine(host, '.aw-hero-title .aw-brass-word', quote.turn)
  writeLine(host, '.aw-source', `—— ${quote.cite}`)

  const epigraph = host.querySelector<HTMLElement>('.aw-epigraph')
  if (epigraph !== null) {
    const from = document.createElement('span')
    from.textContent = `· ${quote.from}`
    epigraph.replaceChildren(document.createTextNode(`${quote.en} `), from)
  }

  const line = `${quote.punch}${quote.turn}`.replace(/[，。！？；：、]$/u, '')
  writeLine(host, '.aw-quote-status', `换到下一句：${line}。出自${quote.cite}。`)

  // Restart the reveal: the line should arrive, not snap.
  const body = host.querySelector<HTMLElement>('.aw-quote-body')
  if (body !== null) {
    body.classList.remove('is-redrawing')
    void body.offsetWidth
    body.classList.add('is-redrawing')
  }
}

const switcherMarkup = (active: SkinSpec): string => `
<button type="button" class="aw-switch-trigger" data-aw-switch-trigger
        aria-haspopup="listbox" aria-expanded="false" aria-label="切换皮肤：当前 ${active.name}"
        title="切换皮肤（⌥1 / ⌥2 / ⌥3）">
  <span class="aw-switch-dot" aria-hidden="true" style="--aw-dot:${active.accent}"></span>
  <span class="aw-switch-name">${active.name}</span>
  ${CHEVRON_GLYPH}
</button>
<div class="aw-switch-menu" data-aw-switch-menu hidden>
  <p class="aw-switch-title" aria-hidden="true">SKIN SHELF <span>· ${SKINS.length}</span></p>
  <div class="aw-switch-list" role="listbox" aria-label="皮肤">
    ${SKINS.map(skin => `
    <button type="button" role="option" class="aw-switch-item" data-aw-skin="${skin.id}"
            aria-selected="${skin.id === active.id}">
      <span class="aw-switch-swatch" aria-hidden="true" style="background:${skin.swatch}"></span>
      <span class="aw-switch-meta">
        <b>${skin.name}</b><em>${skin.en}</em><small>${skin.tagline}</small>
      </span>
      <span class="aw-switch-check" aria-hidden="true">${CHECK_GLYPH}</span>
    </button>`).join('')}
  </div>
  <p class="aw-switch-hint" aria-hidden="true">⌥1 — ⌥${SKINS.length} 直接切换</p>
</div>`

const FAVICON_ATTR = 'favicon'

function createOwnerNode<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  chrome: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag)
  node.dataset.skinChrome = chrome
  node.dataset.skinOwner = OWNER
  return node
}

function isOwned(node: Node): boolean {
  return node instanceof Element && node.getAttribute('data-skin-owner') === OWNER
}

function readStoredSkin(): SkinSpec {
  /* `?skin=neon` is the shareable/testable handle: one URL paints one shelf. */
  try {
    const asked = new URLSearchParams(window.location.search).get('skin')
    if (asked !== null) {
      const skin = skinById(asked)
      if (skin.id === asked) return skin
    }
  } catch {
    /* a malformed location is not worth more than the stored choice */
  }
  try {
    return skinById(window.localStorage.getItem(STORAGE_KEY))
  } catch {
    return skinById(DEFAULT_SKIN_ID)
  }
}

function storeSkin(id: string): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, id)
  } catch {
    /* private mode: the choice simply does not outlive the tab */
  }
}

/**
 * Apply the skin shelf.
 * @param ctx - owning Cordis context; its effect retracts every DOM/CSS write.
 */
export function apply(ctx: ClientContext): void {
  const body = document.body
  const hadAttr = body.hasAttribute(ATTR)
  const previousAttr = body.getAttribute(ATTR)
  const hadSkinAttr = body.hasAttribute(SKIN_ATTR)
  const previousSkinAttr = body.getAttribute(SKIN_ATTR)
  const previousTitle = document.title
  const ownedNodes = new Set<Element>()
  let previousThemeColor: string | null = null
  let themeColorMeta: HTMLMetaElement | null = null
  let createdThemeColor = false
  let styleElement: HTMLStyleElement | null = null
  let styleCreated = false
  let favicon: HTMLLinkElement | null = null
  let scene: HTMLDivElement | null = null
  let switcher: HTMLDivElement | null = null
  let switchedTo: SkinSpec = readStoredSkin()
  let currentQuote = drawQuote()
  let observer: MutationObserver | undefined
  let themeColorObserver: MutationObserver | undefined
  let titleObserver: MutationObserver | undefined
  let sidebarObserver: ResizeObserver | undefined
  let observedSidebar: HTMLElement | undefined
  let scheduled: ReturnType<typeof setTimeout> | undefined
  let disposed = false

  const currentThemeColor = (): string => (
    switchedTo.darkOnly || body.hasAttribute('data-ds-dark-theme')
      ? switchedTo.themeColor.dark
      : switchedTo.themeColor.light
  )

  // Register the disposer before any DOM/CSS write: a later initialization
  // failure must still retract the body attribute and every owned node.
  ctx.effect(() => () => {
    disposed = true
    if (scheduled !== undefined) clearTimeout(scheduled)
    observer?.disconnect()
    themeColorObserver?.disconnect()
    titleObserver?.disconnect()
    sidebarObserver?.disconnect()
    document.removeEventListener('keydown', onQuoteKey)
    ownedNodes.forEach((node) => node.remove())
    for (const selector of [
      "[data-skin-chrome='hero-copy']",
      "[data-skin-chrome='scene']",
      "[data-skin-chrome='switcher']",
      "[data-skin-chrome='favicon']",
    ]) {
      document.querySelectorAll(selector).forEach((node) => {
        if (isOwned(node)) node.remove()
      })
    }
    if (styleCreated) styleElement?.remove()
    if (themeColorMeta !== null && themeColorMeta.isConnected) {
      const wanted = currentThemeColor()
      if (createdThemeColor) themeColorMeta.remove()
      else if (themeColorMeta.content === wanted) {
        themeColorMeta.content = previousThemeColor ?? ''
      }
    }
    if (document.title.includes(switchedTo.title)) document.title = previousTitle
    if (hadAttr) body.setAttribute(ATTR, previousAttr ?? '')
    else body.removeAttribute(ATTR)
    if (hadSkinAttr) body.setAttribute(SKIN_ATTR, previousSkinAttr ?? '')
    else body.removeAttribute(SKIN_ATTR)
    body.removeAttribute(FORCED_DARK_ATTR)
  }, 'ui-skin-sector-07: scope, styles and chrome')

  body.setAttribute(ATTR, '')
  body.setAttribute(SKIN_ATTR, switchedTo.id)

  const existingStyle = document.head.querySelector<HTMLStyleElement>(
    `style[data-plugin-css="${STYLE_KEY}"]`,
  )
  if (existingStyle !== null) {
    existingStyle.textContent = STYLESHEET
    styleElement = existingStyle
  } else {
    const element = document.createElement('style')
    element.dataset.pluginCss = STYLE_KEY
    element.dataset.plugin = '@zcm/dsh-client-ui-skin-sector-07'
    element.dataset.skinOwner = OWNER
    element.textContent = STYLESHEET
    document.head.append(element)
    styleElement = element
    styleCreated = true
    ownedNodes.add(element)
  }

  const mountFavicon = (): void => {
    document.querySelectorAll(`[data-skin-chrome='${FAVICON_ATTR}']`).forEach((node) => node.remove())
    if (favicon !== null) ownedNodes.delete(favicon)
    favicon = document.createElement('link')
    favicon.rel = 'icon'
    favicon.type = 'image/svg+xml'
    favicon.href = `data:image/svg+xml,${encodeURIComponent(switchedTo.favicon)}`
    favicon.dataset.skinChrome = FAVICON_ATTR
    favicon.dataset.skinOwner = OWNER
    ownedNodes.add(favicon)
    document.head.append(favicon)
  }

  const mountScene = (): void => {
    document.querySelectorAll("[data-skin-chrome='scene']").forEach((node) => {
      if (isOwned(node)) node.remove()
    })
    if (scene !== null) ownedNodes.delete(scene)
    scene = createOwnerNode('div', 'scene')
    scene.className = 'aw-scene-host'
    scene.setAttribute('aria-hidden', 'true')
    scene.innerHTML = sceneHtml
    const plates: ReadonlyArray<readonly [string, string]> =
      switchedTo.id === 'neon'
        ? [['night', neonPlotImage], ['dusk', neonPlotImage]]
        : switchedTo.id === 'sunset'
          ? [['night', sunsetPlateImage], ['dusk', sunsetPlateImage]]
          : [['night', hallImage], ['dusk', duskImage]]
    for (const [plate, image] of plates) {
      const node = scene.querySelector<HTMLElement>(`[data-aw-plate='${plate}']`)
      if (node !== null) node.style.backgroundImage = `url("${image}")`
    }
    ownedNodes.add(scene)
    body.prepend(scene)
  }

  const mountThemeColor = (): void => {
    let meta = themeColorMeta
    if (meta === null || !meta.isConnected) {
      meta = document.head.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
      if (meta === null) {
        meta = document.createElement('meta')
        meta.name = 'theme-color'
        meta.dataset.skinChrome = 'theme-color'
        meta.dataset.skinOwner = OWNER
        document.head.append(meta)
        ownedNodes.add(meta)
        createdThemeColor = true
        previousThemeColor = null
      } else if (meta.dataset.skinOwner !== OWNER) {
        previousThemeColor = meta.content
        createdThemeColor = false
      }
      themeColorMeta = meta
    }
    const wanted = currentThemeColor()
    if (meta.content !== wanted) meta.content = wanted
  }

  const syncThemeColor = (): void => {
    const meta = themeColorMeta
    if (meta === null || !meta.isConnected) {
      mountThemeColor()
      return
    }
    const wanted = currentThemeColor()
    if (meta.content !== wanted) meta.content = wanted
  }

  /** Lettering that differs per skin but belongs to the shared anatomy. */
  const applyChromeLettering = (): void => {
    const quoted = (value: string): string => JSON.stringify(value)
    const vars: Record<string, string> = {
      '--aw-brand-name': switchedTo.brand.name,
      '--aw-brand-sub': switchedTo.brand.sub,
      '--aw-session-label': switchedTo.sessionLabel,
      '--aw-rail-scope': switchedTo.rail.scope,
      '--aw-rail-card': switchedTo.rail.card,
      '--aw-rail-card-active': switchedTo.rail.cardActive,
      '--aw-rail-channel': switchedTo.rail.channel,
    }
    for (const [name, value] of Object.entries(vars)) {
      body.style.setProperty(name, quoted(value))
    }
  }

  const applySkinAttrs = (): void => {
    applyChromeLettering()
    if (body.getAttribute(SKIN_ATTR) !== switchedTo.id) {
      body.setAttribute(SKIN_ATTR, switchedTo.id)
    }
    if (switchedTo.darkOnly) body.setAttribute(FORCED_DARK_ATTR, '')
    else body.removeAttribute(FORCED_DARK_ATTR)
  }

  const mountSwitcher = (): void => {
    const host = document.querySelector<HTMLElement>('[data-slot="sidebar.footer.action"]')
    const parent = host ?? body
    if (switcher === null || !switcher.isConnected || switcher.parentElement !== parent) {
      if (switcher !== null) {
        ownedNodes.delete(switcher)
        switcher.remove()
      }
      switcher = createOwnerNode('div', 'switcher')
      switcher.className = host === null ? 'aw-switch aw-switch--floating' : 'aw-switch'
      switcher.innerHTML = switcherMarkup(switchedTo)
      const trigger = switcher.querySelector<HTMLButtonElement>('[data-aw-switch-trigger]')
      trigger?.addEventListener('click', (event) => {
        event.stopPropagation()
        if (switcher !== null) toggleMenu(switcher)
      })
      switcher.querySelectorAll<HTMLButtonElement>('[data-aw-skin]').forEach((item) => {
        item.addEventListener('click', () => {
          const id = item.dataset.awSkin
          if (id !== undefined) switchSkin(id)
        })
      })
      ownedNodes.add(switcher)
      parent.append(switcher)
      return
    }
    // Same host, same skin: only the selected row and the trigger label can be
    // out of date after a switch or a re-mount.
    switcher.querySelectorAll<HTMLButtonElement>('[data-aw-skin]').forEach((item) => {
      item.setAttribute('aria-selected', String(item.dataset.awSkin === switchedTo.id))
    })
    const name = switcher.querySelector<HTMLElement>('.aw-switch-name')
    if (name !== null && name.textContent !== switchedTo.name) name.textContent = switchedTo.name
    const dot = switcher.querySelector<HTMLElement>('.aw-switch-dot')
    if (dot !== null) dot.style.setProperty('--aw-dot', switchedTo.accent)
    const trigger = switcher.querySelector<HTMLButtonElement>('[data-aw-switch-trigger]')
    trigger?.setAttribute('aria-label', `切换皮肤：当前 ${switchedTo.name}`)
  }

  const closeMenu = (): void => {
    if (switcher === null) return
    const menu = switcher.querySelector<HTMLElement>('[data-aw-switch-menu]')
    const trigger = switcher.querySelector<HTMLButtonElement>('[data-aw-switch-trigger]')
    if (menu !== null) menu.hidden = true
    trigger?.setAttribute('aria-expanded', 'false')
  }

  const toggleMenu = (host: HTMLElement): void => {
    const menu = host.querySelector<HTMLElement>('[data-aw-switch-menu]')
    const trigger = host.querySelector<HTMLButtonElement>('[data-aw-switch-trigger]')
    if (menu === null) return
    const open = menu.hidden
    menu.hidden = !open
    trigger?.setAttribute('aria-expanded', String(open))
    if (open) {
      menu.querySelector<HTMLButtonElement>('[aria-selected="true"]')?.focus({ preventScroll: true })
    }
  }

  const syncTitle = (): void => {
    const current = document.title
    let wanted = current
    if (current === '' || current === 'DeepSeek Harness'
      || SKINS.some(skin => current === `${skin.title} · DeepSeek Harness`)) {
      wanted = `${switchedTo.title} · DeepSeek Harness`
    } else {
      for (const title of ['DeepSeek Harness', ...SKINS.map(skin => skin.title)]) {
        const suffix = ` — ${title}`
        if (current.endsWith(suffix)) {
          wanted = `${current.slice(0, -suffix.length)} — ${switchedTo.title}`
          break
        }
      }
    }
    // Even assigning the same title fires the observer again.
    if (current !== wanted) document.title = wanted
  }

  /**
   * Rebuild every node that carries the palette, then persist the choice.
   */
  function switchSkin(id: string): void {
    if (disposed) return
    const next = skinById(id)
    if (next.id === switchedTo.id) {
      closeMenu()
      return
    }
    switchedTo = next
    storeSkin(next.id)
    applySkinAttrs()
    mountFavicon()
    mountScene()
    mountThemeColor()
    syncHero(true)
    mountSwitcher()
    syncTitle()
    closeMenu()
    announce(`已切换到${next.name}。`)
  }

  let announceNode: HTMLParagraphElement | null = null
  const announce = (message: string): void => {
    if (announceNode === null) {
      announceNode = document.createElement('p')
      announceNode.className = 'aw-sr-only'
      announceNode.setAttribute('role', 'status')
      announceNode.dataset.skinChrome = 'status'
      announceNode.dataset.skinOwner = OWNER
      document.body.append(announceNode)
      ownedNodes.add(announceNode)
    }
    announceNode.textContent = message
  }

  const removeDuplicates = (selector: string, keep: Element): void => {
    document.querySelectorAll(selector).forEach((node) => {
      if (node !== keep && isOwned(node)) node.remove()
    })
  }

  const syncHero = (force = false): void => {
    const stack = document.querySelector<HTMLElement>(
      "[data-phase='hero'] [class*='composerStack']",
    )
    if (stack === null) {
      document.querySelectorAll("[data-skin-chrome='hero-copy']").forEach((node) => {
        if (isOwned(node)) node.remove()
      })
      return
    }
    let copy = stack.querySelector<HTMLElement>("[data-skin-chrome='hero-copy']")
    if (force && copy !== null) {
      ownedNodes.delete(copy)
      copy.remove()
      copy = null
    }
    if (copy === null) {
      const template = document.createElement('div')
      template.innerHTML = heroMarkup(switchedTo, currentQuote).trim()
      const created = template.firstElementChild as HTMLElement
      created
        .querySelector<HTMLButtonElement>('[data-aw-quote-refresh]')
        ?.addEventListener('click', () => redrawQuote(created))
      ownedNodes.add(created)
      stack.prepend(created)
      copy = created
    }
    // A redraw survives the hero row unmounting: reprint the line the plate is
    // supposed to carry, but only when it is actually out of date — otherwise a
    // remount would restart the reveal for no reason.
    if (copy.querySelector<HTMLElement>('.aw-lede')?.textContent !== currentQuote.setup) {
      writeQuote(copy, currentQuote)
    }
    removeDuplicates("[data-skin-chrome='hero-copy']", copy)
  }

  const syncSceneBounds = (): void => {
    if (scene === null) return
    const rect = observedSidebar?.getBoundingClientRect()
    const offCanvas = rect !== undefined && (rect.right <= 1 || rect.left < -1)
    const width = offCanvas ? 0 : (rect?.width ?? 0)
    scene.style.left = `${Math.round(width)}px`
  }

  const ensureSidebarObserved = (): void => {
    if (typeof ResizeObserver === 'undefined') return
    const sidebar = document.querySelector<HTMLElement>(
      ":is([data-pane='sidebar'], [class*='sidebarCol'])",
    )
    if (sidebar === observedSidebar) return
    if (sidebarObserver === undefined) {
      sidebarObserver = new ResizeObserver(syncSceneBounds)
    }
    if (observedSidebar !== undefined) sidebarObserver.unobserve(observedSidebar)
    observedSidebar = sidebar ?? undefined
    if (observedSidebar !== undefined) sidebarObserver.observe(observedSidebar)
    syncSceneBounds()
  }

  const syncChrome = (): void => {
    if (disposed) return
    syncHero()
    ensureSidebarObserved()
    syncSceneBounds()
    syncThemeColor()
    mountSwitcher()
  }

  const scheduleSync = (): void => {
    if (scheduled !== undefined || disposed) return
    scheduled = setTimeout(() => {
      scheduled = undefined
      syncChrome()
    }, 0)
  }

  /** Redraw the quote on the plate that is on screen, if there is one. */
  function redrawQuote(host?: HTMLElement): void {
    const plate = host ?? document.querySelector<HTMLElement>("[data-skin-chrome='hero-copy']")
    if (plate === null) return
    currentQuote = drawQuote(currentQuote)
    writeQuote(plate, currentQuote)
  }

  applySkinAttrs()
  mountFavicon()
  mountScene()
  mountThemeColor()
  syncChrome()
  syncTitle()
  syncThemeColor()

  /*
   * The plate answered to nothing before, so a bare letter is affordable. It is
   * only taken when the keystroke is not meant for a field: typing "r" into the
   * composer must never cost the user their line.
   */
  function onQuoteKey(event: KeyboardEvent): void {
    if (disposed || event.defaultPrevented) return
    if (event.metaKey || event.ctrlKey) return
    if (event.altKey) {
      const index = Number(event.key) - 1
      const skin = SKINS[index]
      if (skin !== undefined) {
        event.preventDefault()
        switchSkin(skin.id)
      }
      return
    }
    if (event.key.toLowerCase() !== 'r') return
    if (event.repeat) return
    const plate = document.querySelector<HTMLElement>("[data-skin-chrome='hero-copy']")
    if (plate === null) return
    const active = document.activeElement
    if (
      active instanceof HTMLElement
      && (active.isContentEditable || /^(?:INPUT|TEXTAREA|SELECT)$/.test(active.tagName))
    ) return
    event.preventDefault()
    redrawQuote(plate)
  }

  document.addEventListener('keydown', onQuoteKey)

  const onDocumentPointerDown = (event: Event): void => {
    if (switcher === null) return
    const target = event.target
    if (target instanceof Node && switcher.contains(target)) return
    closeMenu()
  }

  document.addEventListener('pointerdown', onDocumentPointerDown, true)

  observer = new MutationObserver((records) => {
    for (const record of records) {
      if (record.type === 'childList') {
        const nodes = [...record.addedNodes, ...record.removedNodes]
        if (nodes.length > 0 && nodes.every(node => isOwned(node))) continue
      }
      scheduleSync()
      return
    }
  })
  observer.observe(body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: [
      'data-ds-dark-theme',
      'data-phase',
      'data-sidebar-collapsed',
    ],
  })

  themeColorObserver = new MutationObserver(syncThemeColor)
  themeColorObserver.observe(document.head, {
    childList: true,
    attributes: true,
    attributeFilter: ['content'],
  })

  const titleNode = document.querySelector('title')
  if (titleNode !== null) {
    titleObserver = new MutationObserver(syncTitle)
    titleObserver.observe(titleNode, { childList: true, characterData: true, subtree: true })
  }

  ctx.effect(() => () => {
    document.removeEventListener('pointerdown', onDocumentPointerDown, true)
    announceNode?.remove()
  }, 'ui-skin-sector-07: switcher listeners')
}
