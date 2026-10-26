// @jsdom — the apply entry is a browser artifact, evaluated inside a real DOM.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test, { afterEach } from 'node:test'
import { JSDOM } from 'jsdom'

const CLIENT = readFileSync(new URL('../lib/client.js', import.meta.url), 'utf8')
const THEME = readFileSync(new URL('../src/client/theme.css', import.meta.url), 'utf8')
const PACKAGE = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
const SKIN = JSON.parse(readFileSync(new URL('../skin.json', import.meta.url), 'utf8'))
const PATCH = readFileSync(new URL('../cordis.patch.yml', import.meta.url), 'utf8')
const ID = '@zcm/dsh-client-ui-skin-sector-07'

const FIXTURE = `
<div id="root">
  <div class="fixture_frame">
    <div class="fixture_sidebarCol">
      <div class="fixture_root">
        <div class="fixture_logoRow">
          <button class="fixture_brand" aria-label="New Session"><svg></svg></button>
          <button class="fixture_iconButton fixture_toggle" aria-label="Collapse"></button>
        </div>
        <button class="fixture_newSession"><svg></svg><span class="fixture_newSessionLabel">New Session</span></button>
        <div class="fixture_regionArea">
          <div class="fixture_sectionHeader"><span class="fixture_sectionLabel">Sessions</span></div>
          <div role="tree">
            <div class="fixture_projectRow" role="treeitem" aria-expanded="true"><span class="fixture_title">AETHERWORKS</span></div>
            <div class="fixture_sessionRow" role="treeitem" aria-selected="true"><span class="fixture_title">Lower pump station</span><span class="fixture_time">now</span></div>
          </div>
        </div>
        <div class="fixture_footArea">
          <div class="fixture_footerActions"></div>
          <div class="fixture_settingsArea">
            <div data-slot="sidebar.settings"><button aria-label="Settings"></button></div>
          </div>
        </div>
      </div>
    </div>
    <div class="fixture_centerCol">
      <div data-phase="hero" class="fixture_root">
        <div class="fixture_scrollBody" data-conversation-scroll>
          <div class="fixture_composerStack">
            <div class="fixture_root"><div class="fixture_stack"><div class="fixture_headline"><span class="fixture_fishHitbox"></span><span class="fixture_headlineText">What can I help with?</span></div></div></div>
            <div class="fixture_heroWorkspaceRow"><button class="fixture_workspace">Choose workspace</button></div>
            <div class="fixture_root">
              <div data-composer-card class="fixture_card">
                <div data-input-scroll class="fixture_scroll"><div class="fixture_grow"><textarea class="fixture_input"></textarea><div data-input-mirror class="fixture_mirror"></div></div></div>
                <div class="fixture_row"><button class="fixture_add"></button><button class="fixture_primary"></button></div>
              </div>
            </div>
          </div>
          <div class="fixture_composerSeat" data-composer-seat></div>
        </div>
      </div>
    </div>
  </div>
</div>`

const cleanups = []
afterEach(() => {
  for (const cleanup of cleanups.splice(0)) cleanup()
})

function boot({ html = FIXTURE, dark = true, title = '', observeLimit = Infinity } = {}) {
  const dom = new JSDOM(
    `<!doctype html><html><head><meta name="theme-color" content="#ffffff"></head><body${dark ? ' data-ds-dark-theme' : ''} data-page="test">${html}</body></html>`,
    { pretendToBeVisual: true, runScripts: 'dangerously', url: 'http://localhost/' },
  )
  const { window } = dom
  window.document.title = title
  const observations = { calls: 0, capped: false }
  const NativeObserver = window.MutationObserver
  window.MutationObserver = class extends NativeObserver {
    constructor(callback) {
      let calls = 0
      super((records, observer) => {
        observations.calls += 1
        if (++calls > observeLimit) {
          observations.capped = true
          observer.disconnect()
          return
        }
        callback(records, observer)
      })
    }
  }
  let factory
  window.__ModuleLoader__ = {
    load({ id, factory: received }) {
      assert.equal(id, ID)
      factory = received
    },
  }
  window.eval(CLIENT)
  assert.equal(typeof factory, 'function', 'the client bundle must call __ModuleLoader__.load')
  const exports = factory((id) => {
    throw new Error(`unexpected external require: ${id}`)
  })
  const disposers = []
  const dispose = () => {
    for (const cleanup of disposers.splice(0).reverse()) cleanup()
  }
  const ctx = {
    effect(fn) {
      disposers.push(fn())
    },
    get dispose() {
      return dispose
    },
  }
  cleanups.push(() => {
    dispose()
    window.close()
  })
  return {
    dom,
    window,
    document: window.document,
    apply: exports.apply,
    ctx,
    observations,
    get dispose() {
      return dispose
    },
  }
}

function owned(document, chrome) {
  return document.querySelector(`[data-skin-chrome='${chrome}'][data-skin-owner='sector-07']`)
}

function flush() {
  return new Promise(resolve => setTimeout(resolve, 20))
}

test('session title synchronization settles instead of starving the event loop', async () => {
  const { apply, ctx, document, observations } = boot({
    title: 'Lower pump station — DeepSeek Harness', observeLimit: 20,
  })
  apply(ctx)
  document.title = 'Another session — DeepSeek Harness'
  await flush()
  assert.equal(document.title, 'Another session — 以太工造')
  assert.equal(observations.capped, false, 'title synchronization must not recurse indefinitely')
})

test('switcher synchronization settles after host changes and skin switches', async () => {
  const { apply, ctx, document, observations } = boot({ observeLimit: 20 })
  apply(ctx)
  document.querySelector('[data-phase]').setAttribute('data-phase', 'active')
  await new Promise(resolve => setTimeout(resolve, 80))
  const before = observations.calls
  await new Promise(resolve => setTimeout(resolve, 80))
  assert.equal(observations.calls, before, 'an idle skin must stop mutating the DOM')
  document.querySelector('[data-aw-skin="neon"]').click()
  await new Promise(resolve => setTimeout(resolve, 80))
  const after = observations.calls
  await new Promise(resolve => setTimeout(resolve, 80))
  assert.equal(observations.calls, after, 'a switched skin must also settle')
  assert.equal(observations.capped, false)
})

test('a skin switch keeps the slogan and only changes the material', async () => {
  const { apply, ctx, document } = boot({ observeLimit: 50 })
  apply(ctx)
  const readSlogan = () => [
    document.querySelector('.aw-lede').textContent,
    document.querySelector('.aw-hero-title .aw-cn:not(.aw-brass-word)').textContent,
    document.querySelector('.aw-brass-word').textContent,
    document.querySelector('.aw-source').textContent,
    document.querySelector('.aw-epigraph').textContent,
  ].join('\n')
  const slogan = readSlogan()
  const plates = []
  assert.equal(document.querySelector('.aw-quote-status').textContent, '')
  for (const id of ['neon', 'sunset', 'aetherworks']) {
    document.querySelector('[data-aw-switch-trigger]').click()
    document.querySelector(`[data-aw-skin="${id}"]`).click()
    await flush()
    assert.equal(readSlogan(), slogan, `the ${id} skin must not redraw the slogan`)
    assert.equal(document.querySelector('.aw-quote-status').textContent, '',
      `the ${id} skin must not reprint the quote`)
    plates.push(document.querySelector('.aw-plate').textContent)
  }
  assert.deepEqual(plates, [
    'PLATE IV · NIGHT DRIVE', 'SIDE A · COAST ROAD', 'PLATE VII · SURVEY 014',
  ])
  ctx.dispose()
})

for (const initialTitle of ['DeepSeek Harness', 'Lower pump station — DeepSeek Harness']) {
  test(`switches all skins and preserves the title context: ${initialTitle}`, async () => {
    const { apply, ctx, document, window, observations } = boot({
      title: initialTitle, dark: false, observeLimit: 50,
    })
    apply(ctx)
    for (const [id, name, color] of [
      ['neon', '霓虹夜行', '#070b18'],
      ['sunset', '落日海岸', '#12081c'],
      ['aetherworks', '以太工造', '#ded2b9'],
    ]) {
      document.querySelector('[data-aw-switch-trigger]').click()
      assert.equal(document.querySelector('[data-aw-switch-menu]').hidden, false)
      document.querySelector(`[data-aw-skin="${id}"]`).click()
      await flush()
      assert.equal(document.body.getAttribute('data-dsh-skin'), id)
      assert.equal(document.body.hasAttribute('data-skin-forced-dark'), id !== 'aetherworks')
      assert.equal(document.querySelector('.aw-switch-name').textContent, name)
      assert.equal(document.querySelector('[data-aw-skin][aria-selected="true"]').dataset.awSkin, id)
      assert.equal(document.querySelector('[data-aw-switch-menu]').hidden, true)
      assert.equal(document.querySelector('meta[name="theme-color"]').content, color)
      assert.equal(document.title, initialTitle === 'DeepSeek Harness'
        ? `${name} · DeepSeek Harness` : `Lower pump station — ${name}`)
      assert.equal(window.localStorage.getItem('sector-07:skin'), id)
      for (const chrome of ['scene', 'hero-copy', 'favicon', 'switcher']) {
        assert.equal(document.querySelectorAll(`[data-skin-chrome="${chrome}"]`).length, 1)
      }
    }
    assert.equal(observations.capped, false)
    ctx.dispose()
    assert.equal(document.title, initialTitle)
    assert.equal(document.body.hasAttribute('data-dsh-skin'), false)
    assert.equal(document.querySelector('[data-skin-owner="sector-07"]'), null)
    document.title = 'After disposal — DeepSeek Harness'
    window.document.dispatchEvent(new window.KeyboardEvent('keydown', { key: '2', altKey: true }))
    await flush()
    assert.equal(document.title, 'After disposal — DeepSeek Harness')
    assert.equal(document.body.hasAttribute('data-dsh-skin'), false)
  })
}

test('package, skin manifest and bundle patch agree', () => {
  assert.equal(PACKAGE.name, ID)
  assert.deepEqual(PACKAGE.dsh.client, { inject: [], platform: 'web' })
  assert.equal(PACKAGE.exports['./client'], './lib/client.js')
  assert.equal(SKIN.package, ID)
  assert.equal(SKIN.bodyAttr, 'data-dsh-sector-07')
  assert.equal(SKIN.wiring.id, 'ui-skin-sector-07')
  assert.equal(SKIN.id, 'aetherworks')
  assert.match(PATCH, /ui-skin-sector-07/)
  assert.match(PATCH, new RegExp(ID.replace(/[/@.]/g, '\\$&')))
})

test('applies the scope, styles and reversible chrome, then retracts all of it', () => {
  const { apply, ctx, document, window } = boot()
  const originalTitle = document.title

  apply(ctx)

  assert.equal(document.body.hasAttribute('data-dsh-sector-07'), true)
  const sheet = document.head.querySelector("style[data-plugin-css='sector-07/theme.css']")
  assert.ok(sheet)
  assert.equal(sheet.dataset.plugin, ID)
  assert.ok(owned(document, 'scene'))
  assert.ok(owned(document, 'favicon'))
  assert.ok(owned(document, 'hero-copy'))
  assert.equal(document.querySelector("[data-skin-chrome='hero-copy']")?.parentElement?.className.includes('composerStack'), true)
  assert.match(document.title, /以太工造/)
  assert.equal(document.querySelector("meta[name='theme-color']").content, '#0b0806')

  ctx.dispose()

  assert.equal(document.body.hasAttribute('data-dsh-sector-07'), false)
  assert.equal(document.head.querySelector("style[data-plugin-css='sector-07/theme.css']"), null)
  assert.equal(owned(document, 'scene'), null)
  assert.equal(owned(document, 'favicon'), null)
  assert.equal(owned(document, 'hero-copy'), null)
  assert.equal(document.title, originalTitle)
  assert.equal(document.querySelector("meta[name='theme-color']").content, '#ffffff')
})

test('restores the pre-existing body attribute instead of claiming ownership', () => {
  const { apply, ctx, document } = boot()
  document.body.setAttribute('data-dsh-sector-07', 'pre-existing')
  apply(ctx)
  ctx.dispose()
  assert.equal(document.body.getAttribute('data-dsh-sector-07'), 'pre-existing')
})

test('tracks the DSH dark attribute and keeps the system chrome color coherent', async () => {
  const { apply, ctx, document } = boot({ dark: false })
  apply(ctx)
  const meta = document.querySelector("meta[name='theme-color']")
  assert.equal(meta.content, '#ded2b9')

  document.body.setAttribute('data-ds-dark-theme', '')
  await flush()
  assert.equal(meta.content, '#0b0806')

  document.body.removeAttribute('data-ds-dark-theme')
  await flush()
  assert.equal(meta.content, '#ded2b9')

  ctx.dispose()
  assert.equal(meta.content, '#ffffff')
})

test('re-injects the hero plate after a React remount', async () => {
  const { apply, ctx, document } = boot()
  apply(ctx)
  assert.ok(owned(document, 'hero-copy'))

  const stack = document.querySelector("[class*='composerStack']")
  stack.innerHTML = '<div class="fixture_root"></div>'
  await flush()
  assert.ok(owned(document, 'hero-copy'))
  assert.equal(document.querySelector("[data-skin-chrome='hero-copy']").parentElement, stack)

  ctx.dispose()
  assert.equal(owned(document, 'hero-copy'), null)
})

test('redraws the plate from its own control and keeps the redrawn line across a remount', async () => {
  const { apply, ctx, document } = boot()
  apply(ctx)

  const plate = owned(document, 'hero-copy')
  assert.ok(plate)
  // the control must be reachable by assistive tech, so it cannot sit inside an
  // aria-hidden block
  const control = plate.querySelector('[data-aw-quote-refresh]')
  assert.ok(control instanceof document.defaultView.HTMLButtonElement)
  assert.equal(control.closest('[aria-hidden="true"]'), null)
  assert.equal(control.getAttribute('aria-label'), '换一句题词')

  const line = () => [
    plate.querySelector('.aw-lede').textContent,
    plate.querySelector('.aw-hero-title .aw-cn:not(.aw-brass-word)').textContent,
    plate.querySelector('.aw-hero-title .aw-brass-word').textContent,
    plate.querySelector('.aw-source').textContent,
  ].join('|')

  let previous = line()
  const seen = new Set([previous])
  for (let i = 0; i < 15; i += 1) {
    control.click()
    const next = line()
    assert.notEqual(next, previous, 'a redraw must always change the line')
    seen.add(next)
    previous = next
  }
  assert.ok(seen.size >= 8, `15 redraws should roam the pool, saw ${seen.size}`)
  assert.match(plate.querySelector('.aw-quote-status').textContent, /^换到下一句：/)
  assert.equal(plate.querySelector('.aw-quote-body').classList.contains('is-redrawing'), true)

  // the hero row unmounts constantly; the redrawn line has to be what comes back
  const stack = document.querySelector("[class*='composerStack']")
  stack.innerHTML = '<div class="fixture_root"></div>'
  await flush()
  const again = owned(document, 'hero-copy')
  assert.ok(again)
  assert.equal(
    [
      again.querySelector('.aw-lede').textContent,
      again.querySelector('.aw-hero-title .aw-cn:not(.aw-brass-word)').textContent,
      again.querySelector('.aw-hero-title .aw-brass-word').textContent,
      again.querySelector('.aw-source').textContent,
    ].join('|'),
    previous,
  )
})

test('hangs the terminal mark without dropping it from the line', () => {
  const { apply, ctx, document } = boot()
  apply(ctx)

  const plate = owned(document, 'hero-copy')
  assert.ok(plate)
  const marks = () => [...plate.querySelectorAll('.aw-punct')]
  assert.ok(marks().length >= 2, 'setup and turn always end on a terminal mark')

  for (const mark of marks()) {
    assert.match(mark.textContent, /^[，。！？；：、]$/u)
    assert.ok(mark.parentElement.matches('.aw-lede, .aw-cn'))
    assert.equal(mark.previousSibling?.nodeType, 3, 'the mark must follow its text')
  }

  // the stylesheet is what makes the mark hang; without it the shift returns
  assert.match(THEME, /\.aw-punct\s*\{[^}]*letter-spacing:\s*0;[^}]*margin-right:\s*-\.6em;/su)

  const control = plate.querySelector('[data-aw-quote-refresh]')
  for (let i = 0; i < 8; i += 1) {
    control.click()
    assert.ok(marks().length >= 2, `redraw ${i + 1} kept the terminal marks`)
    assert.ok(marks().every(mark => mark.parentElement.matches('.aw-lede, .aw-cn')))
  }
})

test('redraws on R, but never steals the letter from a field', async () => {
  const { apply, ctx, document, window } = boot()
  apply(ctx)

  const plate = owned(document, 'hero-copy')
  const line = () => plate.querySelector('.aw-lede').textContent
  const press = (target) => {
    const event = new window.KeyboardEvent('keydown', {
      key: 'r', bubbles: true, cancelable: true,
    })
    target.dispatchEvent(event)
    return event
  }

  const first = line()
  const handled = press(document.body)
  assert.equal(handled.defaultPrevented, true)
  assert.notEqual(line(), first)

  const input = document.querySelector('textarea')
  input.focus()
  const beforeField = line()
  const ignored = press(input)
  assert.equal(ignored.defaultPrevented, false)
  assert.equal(line(), beforeField)

  // modifier combos belong to the browser and the OS
  document.body.focus()
  const beforeMeta = line()
  const combo = new window.KeyboardEvent('keydown', {
    key: 'r', metaKey: true, bubbles: true, cancelable: true,
  })
  document.body.dispatchEvent(combo)
  assert.equal(line(), beforeMeta)

  ctx.dispose()
  const afterDispose = line()
  press(document.body)
  assert.equal(line(), afterDispose, 'a disposed skin must not keep listening')
})

test('registers the disposer before a later initialization failure', () => {
  const { apply, ctx, document } = boot()
  const head = document.head
  const append = head.append
  head.append = () => {
    throw new Error('fixture append failure')
  }
  assert.throws(() => apply(ctx), /fixture append failure/)
  head.append = append
  assert.equal(document.body.hasAttribute('data-dsh-sector-07'), true)
  ctx.dispose()
  assert.equal(document.body.hasAttribute('data-dsh-sector-07'), false)
})

test('projects the skin name into the product title without fighting session titles', async () => {
  const { apply, ctx, document } = boot()
  apply(ctx)
  assert.match(document.title, /以太工造/)

  document.title = 'DeepSeek Harness'
  await flush()
  assert.match(document.title, /以太工造/)

  document.title = 'Lower pump station — DeepSeek Harness'
  await flush()
  assert.equal(document.title, 'Lower pump station — 以太工造')

  ctx.dispose()
  assert.equal(document.title, '')
})

test('aligns the megastructure scene with the live sidebar width', async () => {
  const { apply, ctx, document, window } = boot()
  let callback
  window.ResizeObserver = class {
    constructor(received) {
      callback = received
    }

    observe() {}
    unobserve() {}
    disconnect() {}
  }
  const sidebar = document.querySelector("[class*='sidebarCol']")
  let width = 280
  sidebar.getBoundingClientRect = () => ({
    x: 0, y: 0, width, height: 900, top: 0, right: width, bottom: 900,
    toJSON: () => ({}),
  })

  apply(ctx)
  const scene = document.querySelector("[data-skin-chrome='scene']")
  assert.equal(scene.style.left, '280px')

  width = 56
  callback?.([], {})
  assert.equal(scene.style.left, '56px')

  ctx.dispose()
  assert.equal(document.querySelector("[data-skin-chrome='scene']"), null)
})

test('the stylesheet targets real DSH hooks and contains no remote assets', () => {
  for (const selector of [
    '[data-composer-card]',
    "[data-phase='hero']",
    "[data-phase='active']",
    '[data-conversation-scroll]',
    '[data-conversation-tabs]',
    '[data-open-target]',
    '[data-input-scroll]',
    '[data-input-mirror]',
    '[data-composer-input]',
    '[data-composer-placeholder]',
    '[data-testid=\'todo-panel\']',
    "[role='dialog']",
    "[role='menu']",
    '[data-chat-flow-kind=\'user\']',
    '[data-chat-flow-kind=\'assistant\']',
    '[data-tool]',
    '--dsw-alias-bg-base',
  ]) {
    assert.ok(THEME.includes(selector), `missing DSH selector/token: ${selector}`)
  }
  assert.match(THEME, /prefers-reduced-motion: reduce/)
  assert.match(THEME, /body\[data-dsh-skin\]/)
  assert.doesNotMatch(THEME, /https?:\/\/(?!www\.w3\.org\/2000\/svg)/)
  assert.doesNotMatch(THEME, /maid-atelier|maid_atelier/)
})

test('settings rows keep the UI face instead of the display face', () => {
  // The dialog-title rule is deliberately broad (`[class*='title']`) so skin
  // chrome such as confirmation sheets gets the display serif. Inside Settings
  // it also caught every hashed `*_title` row label while missing the camelCase
  // `settingTitle`, leaving one panel half Songti and half PingFang.
  assert.match(
    THEME,
    /body\[data-dsh-skin\] \[role='dialog'\]\[data-shortcut-modal='settings'\] :is\([^)]*\) \{[^}]*font-family:\s*var\(--aw-font-ui\)/u,
  )
})

test('the user-message plate cannot capture the tooltip rendered beside it', () => {
  // DSH renders the 复制 tooltip as a `*_bubble_*` span INSIDE the row that owns
  // the message plate. A bare descendant match pulled that span out of
  // `position: fixed` and into the action row, so the row grew under the
  // pointer, slid the button away, dropped the tooltip and snapped back — an
  // endless hover-rate oscillation. The plate must stay scoped to the stack's
  // own child and must exclude `[role='tooltip']`.
  assert.doesNotMatch(THEME, /\[data-chat-flow-kind='user'\] \[class\*='bubble'\]/u)
  const plateRules = THEME.match(/^[^\n{]*\[class\*='bubble'\][^\n{]*\{/gmu) ?? []
  assert.ok(plateRules.length > 0, 'expected the user-message plate rules to exist')
  for (const rule of plateRules) {
    assert.match(
      rule,
      /\[data-chat-flow-kind='user'\] \[class\*='userStack'\] > \[class\*='bubble'\]:not\(\[role='tooltip'\]\)/u,
      `bubble rule is not scoped to the message stack: ${rule.trim()}`,
    )
  }
  assert.doesNotMatch(THEME, /RECEIVED/u, 'the RECEIVED stamp must stay removed')
})

test('the user-message plate re-inks every material that repaints it', () => {
  // The plate is cream paper in the base anatomy, so its ink started literal:
  // `color: #241c13` plus `#6f2f1c` on links and reference chips. Both shelf
  // skins repaint the plate as backlit glass and kept inheriting that ink,
  // near-black on a dark pane (1.1:1, the 看不清 report). The ink, link and
  // chip colors now travel as `--aw-note-*` tokens, so a material can change
  // the paper without going unreadable. A material that repaints the plate
  // but forgets to re-ink it fails here instead of shipping.
  const PLATE = /body\[data-dsh-skin\][^{]*\[class\*='userStack'\][^{]*\[class\*='bubble'\][^{]*\{[^}]*\}/gu
  const plateRules = THEME.match(PLATE) ?? []
  assert.ok(plateRules.length > 0, 'expected a user-message plate rule')
  assert.match(plateRules[0], /color:\s*var\(--aw-note-ink\)/u, 'the plate must ink itself from the token')
  assert.doesNotMatch(plateRules[0], /#241c13/u, 'the plate ink must not be literal')

  assert.match(THEME, /--aw-note-ink:\s*#241c13;/u, 'the base anatomy still ships paper ink')
  assert.match(THEME, /--aw-note-link:\s*#6f2f1c;/u)
  const chip = THEME.match(/body\[data-dsh-skin\][^{]*\[class\*='refChip'\][^{]*\{[^}]*\}/u)?.[0] ?? ''
  assert.match(chip, /color:\s*var\(--aw-note-link\)/u, 'reference chips must ink from the token')
  assert.doesNotMatch(chip, /#6f2f1c|rgba\(142, 59, 34/u, 'chip ink and frame must not be literal')

  for (const id of ['neon', 'sunset']) {
    const css = readFileSync(new URL(`../src/client/skins/${id}.css`, import.meta.url), 'utf8')
    assert.match(css, /--aw-note-ink:\s*#/u, `${id} does not define its own plate ink`)
    assert.match(css, /--aw-note-link:\s*#/u, `${id} does not define its own link ink`)
    assert.match(css, /--aw-note-chip-line:\s*rgba\(/u, `${id} does not define its own chip frame`)
    const override = css.match(
      new RegExp(
        `body\\[data-dsh-skin='${id}'\\][^{]*\\[class\\*='userStack'\\][^{]*\\[class\\*='bubble'\\][^{]*\\{[^}]*\\}`,
        'gu',
      ),
    )?.[0] ?? ''
    assert.ok(override !== '', `${id} is expected to repaint the plate`)
    assert.doesNotMatch(override, /(?:^|[;\s{])color:\s*(?!var\()/u, `${id} repaints the plate with a literal ink`)
  }
})

test('the hero options stay grouped with the workspace chip and preset', () => {
  // DSH right-aligns `heroOptions` with `margin-left: auto`, and the skin's
  // `MESSAGE TUBE // CH 07` caption (::after) claims the same auto margin. Two
  // auto margins split the free space evenly, which floated the branch option
  // into the middle of the rail. The caption must own the remaining space.
  assert.match(
    THEME,
    /\[class\*='heroWorkspaceRow'\] \[class\*='heroOptions'\] \{\s*margin-left:\s*2px;\s*\}/u,
  )
  const captionRule = THEME.match(
    /body\[data-dsh-skin\] \[data-phase='hero'\] \[class\*='heroWorkspaceRow'\]::after \{[^}]*\}/u,
  )?.[0]
  assert.match(captionRule ?? '', /margin-left:\s*auto;/u)
})

test('the client bundle is a closure factory with no unresolved imports', () => {
  assert.ok(CLIENT.startsWith('window.__ModuleLoader__.load('))
  assert.match(CLIENT, /factory: \(require\) => \{/)
  assert.match(CLIENT, /return module\.exports; \} \}\);/)
  assert.doesNotMatch(CLIENT, /require\(["']@deepseek-ai/)
  assert.doesNotMatch(CLIENT, /https?:\/\/(?!www\.w3\.org)/)
})
