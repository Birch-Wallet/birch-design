/*
 * Birch design system page: state, generated token CSS, Focus and Compare
 * views, the tuning panel, comments with pins, and Markdown/JSON export.
 *
 * State lives in localStorage under STORAGE_KEY (this browser only). Export
 * is the hand-off: the Markdown and JSON it produces are what Claude Code
 * reads to implement changes.
 */
;(function () {
  'use strict'

  const TK = window.BirchTokens
  const SC = window.BirchScreens
  const SH = window.BirchShipped
  const IC = window.BirchIcons.icon
  const esc = SC.esc
  const $ = (sel, el = document) => el.querySelector(sel)
  const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel))
  const clone = (o) => JSON.parse(JSON.stringify(o))
  const STORAGE_KEY = 'birch-ds-v1'
  // The designs first: Today (the app as it ships) and Future (the next version, built on Today).
  // Then the color themes, which recolor Future's layout
  const BUILT_IN = ['T', 'F', 'A', 'B', 'C']

  const FONTS = {
    rounded: 'ui-rounded, "Birch SF Rounded", "SF Pro Rounded", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
    default: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif',
    text: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
    mono: 'ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, monospace',
  }

  const OPTION_NOTES = {
    A: [
      'Primary button text turns dark: 9.7:1 on gold in dark mode, up from 2.2:1 with white text today.',
      'Dark ground moves from brown (#1A1814) to a warm-neutral charcoal.',
      'Light ground moves from beige to birch-bark white, with white cards.',
      'Success, info and each network get their own hue. Today success, the secondary accent and the testnet badge share one olive.',
      'Secondary buttons keep today’s card fill with brand-colored text.',
    ],
    B: [
      'Brand moves from gold to the leaf green on the app icon.',
      'Dark mode is forest at night: near-black with a faint green cast.',
      'Success moves to jade so it never reads as just another brand-colored element.',
      'Secondary buttons are outlined. Titles use SF Pro instead of Rounded; amounts stay Rounded.',
      'The mainnet badge turns amber, so Bitcoin keeps a warm marker.',
    ],
    C: [
      'The primary button is monochrome: near-white on slate in dark mode, deep slate on white in light mode.',
      'Autumn amber is reserved for amounts, selection, progress and toggles.',
      'Corners tighten to 8/6 and cards get a hairline stroke.',
      'All type is SF Pro (not Rounded), with bold titles.',
      'Tertiary actions use amber text.',
    ],
    T: [
      'Exact Theme.swift colors, kept as the before picture.',
      'White text on gold fails contrast: 2.2:1 in dark mode, 3.3:1 in light.',
      'Gold text on light cards fails at 2.9:1.',
    ],
  }

  const SWIFT_FOR_BOARD = {
    buttons: 'Theme.swift (HBPrimaryButtonModifier, HBSecondaryButtonModifier, HBBarButtonStyle)',
    patterns: 'Theme.swift button modifiers; flow footers in Setup and Send views',
    cards: 'Theme.swift (BirchCard, BirchSelected)',
    rows: 'TransactionRowView.swift, SettingsView.swift',
    inputs: 'CosignerImportView.swift, ElectrumServerSetupSection.swift, Theme.swift (segmented appearance)',
    chips: 'Theme.swift (NetworkBadge), UTXOListView.swift',
    callouts: 'PSBTVerificationBadge.swift (VerificationChip), WalletVerifyView.swift',
    progress: 'PSBTDisplayView.swift (SignatureProgressView), SetupWizardView.swift, Theme.swift (SyncStatusDot)',
    states: 'TransactionListView.swift (ContentUnavailableView), ContentView.swift (AppLockView)',
    nav: 'MainTabView.swift, navigation bars',
    type: 'Theme.swift (Font.hb*)',
  }

  const ROLE_FALLBACK = {
    brandPressed: ['Primary button, pressed', 'new'],
    onAccent: ['Text on accent fill', 'new'],
    accentTint: ['Accent chip and selection fill', 'new'],
    selectTint: ['Selected row fill', 'birchSelected fill'],
    successTint: ['Success callout and chip fill', 'hbSuccess.opacity'],
    warningTint: ['Warning callout and chip fill', 'new'],
    dangerTint: ['Error callout fill', 'hbError.opacity(0.12)'],
    dangerFill: ['Destructive primary button fill', 'hbError (as fill)'],
    onDanger: ['Text on destructive fill', '.white'],
    infoTint: ['Info callout fill', 'hbSteelBlue.opacity(0.12)'],
  }

  const COLOR_GROUPS = [
    ['Surfaces', ['ground', 'card', 'nested', 'floating', 'line', 'lineStrong']],
    ['Text', ['ink', 'ink2', 'ink3']],
    ['Brand and accent', ['brand', 'onBrand', 'brandPressed', 'brandInk', 'brandTint', 'accent', 'onAccent', 'accentInk', 'accentTint', 'select', 'selectTint']],
    ['Semantic', ['success', 'successTint', 'warning', 'warningTint', 'danger', 'dangerTint', 'dangerFill', 'onDanger', 'info', 'infoTint']],
    ['Networks', ['net_mainnet', 'net_testnet4', 'net_testnet3', 'net_signet']],
  ]

  // Tuning panel schema: [path, label, kind, min|options, max, step, unit, flags]
  // Every control reaches the app screens unless flagged { only: 'components' }: those
  // elements (toggles, errors, destructive buttons...) appear only in the component boards.
  const COMP = { only: 'components' }
  const NEEDS_ACCENT = { needsAccent: true }
  const DIAL = [
    { id: 'brand', name: 'Brand', color: true, sw: ['brand'], rows: [
      ['brand.hue', 'Hue', 'hue', 0, 360, 1],
      ['brand.chroma', 'Chroma', 'chroma', 0, 0.22, 0.005],
      ['brand.darkL', 'Lightness, dark', 'light', 0.2, 0.98, 0.005],
      ['brand.lightL', 'Lightness, light', 'light', 0.15, 0.95, 0.005],
      ['brand.onBrand', 'Text on brand', 'seg', [['auto', 'Auto'], ['dark', 'Dark'], ['light', 'White']]],
    ] },
    { id: 'accent', name: 'Accent and roles', color: true, sw: ['accent'], rows: [
      ['accent.enabled', 'Second hue', 'seg', [[false, 'Off'], [true, 'On']]],
      ['accent.hue', 'Hue', 'hue', 0, 360, 1, '', { needsAccent: true }],
      ['accent.chroma', 'Chroma', 'chroma', 0, 0.22, 0.005, '', { needsAccent: true }],
      ['accent.darkL', 'Lightness, dark', 'light', 0.3, 0.98, 0.005, '', { needsAccent: true }],
      ['accent.lightL', 'Lightness, light', 'light', 0.3, 0.95, 0.005, '', { needsAccent: true }],
      ['roles.selection', 'Selection', 'seg', [['brand', 'Brand'], ['accent', 'Accent']], 0, 0, '', NEEDS_ACCENT],
      ['roles.progress', 'Progress', 'seg', [['brand', 'Brand'], ['accent', 'Accent']], 0, 0, '', NEEDS_ACCENT],
      ['roles.amountUnit', 'Amounts', 'seg', [['ink', 'Brand'], ['accent', 'Accent']], 0, 0, '', NEEDS_ACCENT],
      ['roles.tabTint', 'Active tab', 'seg', [['brand', 'Brand'], ['accent', 'Accent']], 0, 0, '', NEEDS_ACCENT],
      ['roles.toggles', 'Toggles', 'seg', [['brand', 'Brand'], ['accent', 'Accent']], 0, 0, '', { ...COMP, needsAccent: true }],
    ] },
    { id: 'dark', name: 'Dark surfaces', color: true, mode: 'dark', sw: ['ground', 'card', 'nested'], rows: [
      ['dark.hue', 'Tint hue', 'hue', 0, 360, 1],
      ['dark.chroma', 'Tint amount', 'chroma', 0, 0.04, 0.001],
      ['dark.groundL', 'Ground', 'light', 0.08, 0.34, 0.005],
      ['dark.step', 'Surface step', 'range', 0.01, 0.09, 0.002],
      ['dark.ink2L', 'Secondary text', 'light', 0.5, 0.9, 0.005, '', { floor: ['dark', 'ink2', 4.5] }],
      ['dark.ink3L', 'Tertiary text', 'light', 0.3, 0.8, 0.005, '', { ...COMP, floor: ['dark', 'ink3', 3] }],
    ] },
    { id: 'light', name: 'Light surfaces', color: true, mode: 'light', sw: ['ground', 'card', 'nested'], rows: [
      ['light.hue', 'Tint hue', 'hue', 0, 360, 1],
      ['light.chroma', 'Tint amount', 'chroma', 0, 0.04, 0.001],
      ['light.groundL', 'Ground', 'light', 0.86, 1, 0.002],
      ['light.cardL', 'Card', 'light', 0.9, 1, 0.002],
      ['light.nestedDelta', 'Nested depth', 'range', 0, 0.08, 0.002],
      ['light.ink2L', 'Secondary text', 'light', 0.3, 0.62, 0.005, '', { floor: ['light', 'ink2', 4.5] }],
      ['light.ink3L', 'Tertiary text', 'light', 0.45, 0.8, 0.005, '', { ...COMP, floor: ['light', 'ink3', 3] }],
    ] },
    { id: 'semantic', name: 'Semantic', color: true, sw: ['success', 'warning', 'danger', 'info'], rows: [
      ['semantic.successHue', 'Success', 'hue', 0, 360, 1],
      ['semantic.infoHue', 'Info', 'hue', 0, 360, 1],
      ['semantic.warningHue', 'Warning', 'hue', 0, 360, 1],
      ['semantic.dangerHue', 'Danger', 'hue', 0, 360, 1, '', COMP],
      ['semantic.chroma', 'Chroma', 'chroma', 0.04, 0.2, 0.005],
    ] },
    { id: 'networks', name: 'Networks', color: true, sw: ['net_mainnet', 'net_testnet4', 'net_testnet3', 'net_signet'], rows: [
      ['networks.testnet4', 'Testnet4', 'hue', 0, 360, 1],
      ['networks.signet', 'Signet', 'hue', 0, 360, 1],
      ['networks.testnet3', 'Testnet3', 'hue', 0, 360, 1],
      ['networks.mainnet', 'Mainnet', 'hue', 0, 360, 1, '', COMP],
      ['networkChroma', 'Chroma', 'chroma', 0.03, 0.16, 0.005],
    ] },
    { id: 'chrome', name: 'App chrome', rows: [
      ['chrome.header', 'Wallet header', 'seg', [['shipped', 'Shipped'], ['card', 'Card'], ['ground', 'Ground']]],
      ['chrome.tabbar', 'Tab bar', 'seg', [['glass', 'Glass'], ['solid', 'Solid']]],
      ['chrome.glass', 'Glass opacity', 'range', 0.3, 1, 0.01],
      ['chrome.dim', 'Sheet dimming', 'range', 0, 2, 0.05],
    ] },
    { id: 'shape', name: 'Shape', rows: [
      ['shape.card', 'Card radius', 'range', 0, 28, 1, 'pt'],
      ['shape.nested', 'Field radius', 'range', 0, 20, 1, 'pt'],
      ['shape.button', 'Button radius', 'range', 0, 28, 1, 'pt'],
      ['shape.chip', 'Pill radius', 'range', 0, 16, 1, 'pt'],
      ['shape.sheet', 'Sheet radius', 'range', 0, 40, 1, 'pt'],
      ['shape.ring', 'Selection ring', 'range', 0, 3, 0.5, 'pt'],
      ['shape.stroke', 'Card stroke', 'range', 0, 2, 0.5, 'pt'],
      ['shape.shadow', 'Light shadow', 'range', 0, 1.5, 0.05],
    ] },
    { id: 'type', name: 'Type', rows: [
      ['type.scale', 'Text size', 'range', 0.8, 1.3, 0.05, '×'],
      ['type.display', 'Titles', 'seg', [['rounded', 'Rounded'], ['default', 'Default']]],
      ['type.titleWeight', 'Title weight', 'seg', [[500, 'Medium'], [600, 'Semibold'], [700, 'Bold']]],
      ['type.amountFace', 'Amounts', 'seg', [['rounded', 'Rounded'], ['default', 'Default']]],
      ['type.numerals', 'Numbers', 'seg', [['mono', 'Mono'], ['proportional', 'Amount face']]],
    ] },
    { id: 'density', name: 'Spacing', rows: [
      ['density.gutter', 'Screen margin', 'range', 12, 32, 1, 'pt'],
      ['density.cardPad', 'Card padding', 'range', 10, 24, 1, 'pt'],
      ['density.field', 'Field padding', 'range', 6, 18, 1, 'pt'],
      ['density.space', 'Vertical spacing', 'range', 0.6, 1.6, 0.05, '×'],
      ['density.buttonH', 'Button height', 'range', 40, 60, 1, 'pt'],
      ['density.rowH', 'List row height', 'range', 52, 90, 1, 'pt'],
    ] },
    { id: 'buttons', name: 'Buttons and links', rows: [
      ['buttons.utility', 'Utility buttons', 'seg', [['tinted', 'Tinted'], ['fill', 'Fill'], ['outline', 'Outline']]],
      ['buttons.utilityColor', 'Utility color', 'seg', [['mixed', 'Mixed'], ['brand', 'Brand'], ['neutral', 'Neutral']]],
      ['buttons.tertiary', 'Text links', 'seg', [['brand', 'Brand'], ['accent', 'Accent'], ['ink', 'Ink']]],
      // Seen while a button is held down; the Buttons section shows it in its Pressed column
      ['buttons.press', 'Pressed', 'seg', [['dim', 'Dim'], ['scale', 'Scale']], 0, 0, '', { preview: 'components' }],
      ['buttons.secondary', 'Secondary', 'seg', [['fill', 'Fill'], ['outline', 'Outline'], ['tonal', 'Tonal']]],
      ['buttons.disabled', 'Disabled', 'seg', [['muted', 'Muted'], ['fade', 'Faded']]],
    ] },
    { id: 'layout', name: 'Layout', rows: [
      ['layout.footer', 'Setup footer', 'seg', [['split', 'Split'], ['stacked', 'Stacked']]],
      ['layout.signed', 'Signed amounts', 'seg', [[false, 'Off'], [true, 'On']]],
      ['layout.received', 'Received amounts', 'seg', [['color', 'Success'], ['ink', 'Ink']]],
    ] },
  ]

  /** The interview decisions, applied as Tune values (Layout group shortcut) */
  const INTERVIEW = { 'type.numerals': 'proportional', 'layout.signed': true, 'layout.received': 'ink', 'layout.footer': 'stacked' }

  const CHECKS = [
    ['Text on primary button', 'onBrand', 'brand', 4.5],
    ['Brand text on cards', 'brandInk', 'card', 4.5],
    ['Accent text on cards', 'accentInk', 'card', 4.5],
    ['Secondary text on ground', 'ink2', 'ground', 4.5],
    ['Secondary text in fields', 'ink2', 'nested', 4.5],
    ['Placeholder text in fields', 'ink3', 'nested', 3],
    ['Outlined button border', 'lineStrong', 'ground', 3],
    ['Destructive button text', 'onDanger', 'dangerFill', 4.5],
    ['Success text on its tint', 'success', 'successTint', 4.5],
    ['Warning text on its tint', 'warning', 'warningTint', 4.5],
    ['Danger text on its tint', 'danger', 'dangerTint', 4.5],
  ]

  const SECTIONS = [
    ['overview', 'Overview'],
    ['color', 'Color'],
    ['type', 'Type'],
    ['buttons', 'Buttons'],
    ['components', 'Components'],
    ['screens', 'Screens'],
  ]
  const SCREEN_GROUPS = ['Wallet', 'Send', 'Signing', 'UTXOs', 'Settings', 'Setup']

  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------

  function freshParams() {
    const out = {}
    for (const id of BUILT_IN) out[id] = clone(TK.PRESETS[id])
    return out
  }

  function defaults() {
    return {
      v: 3,
      current: 'T',
      params: freshParams(),
      custom: {},
      view: 'focus',
      modes: 'both',
      zoom: { focus: 0.62, compare: 0.5 },
      compareScreen: 'review',
      device: 'iphone',
      includeToday: true,
      pageTheme: 'system',
      dialOpen: typeof window === 'undefined' || window.innerWidth > 900,
      groups: { brand: true, shape: true },
      comments: [],
      notes: {},
      overall: '',
      nextN: 1,
    }
  }

  function load() {
    let s = null
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) s = JSON.parse(raw)
    } catch (e) {
      s = null
    }
    const d = defaults()
    if (!s || ![1, 2, 3].includes(s.v)) return d
    if (s.v === 1) migrateV1(s)
    if (s.v === 2) migrateV2(s)
    if (s.v !== 3) return d
    migrated = migrated || s.migrated
    delete s.migrated
    const merged = Object.assign(d, s)
    // Fill keys a newer preset definition added. A built-in preset's group and design aren't
    // tunable, so they always come from its definition, not from what was saved
    for (const id of BUILT_IN) {
      merged.params[id] = deepMerge(clone(TK.PRESETS[id]), merged.params[id] || {})
      merged.params[id].group = TK.PRESETS[id].group
      merged.params[id].design = TK.PRESETS[id].design
    }
    if (!merged.params[merged.current]) merged.current = 'T'
    return merged
  }

  /** v1 kept density and chip values that only fed the old mock screens; take the new defaults */
  function migrateV1(st) {
    const stale = (pp, base) => {
      if (!pp) return
      delete pp.density
      if (pp.type) delete pp.type.body
      if (pp.shape) delete pp.shape.chip
      if (base) pp.density = clone(base.density)
    }
    for (const id of Object.keys(st.params || {})) {
      const custom = st.custom && st.custom[id]
      const from = TK.PRESETS[id] || TK.PRESETS.A
      stale(st.params[id], custom ? from : null)
      if (custom && custom.base) stale(custom.base, from)
      // Custom presets carry their own copy; give them the new keys too
      if (custom) {
        for (const k of ['layout', 'chrome']) if (!st.params[id][k]) st.params[id][k] = clone(from[k])
        if (custom.base) for (const k of ['layout', 'chrome']) if (!custom.base[k]) custom.base[k] = clone(from[k])
        st.params[id] = deepMerge(clone(from), st.params[id])
        if (custom.base) custom.base = deepMerge(clone(from), custom.base)
      }
    }
    delete st.rules
    st.v = 2
    st.migrated = true
  }

  /** v3 made Today the default preset and Focus the default view; open there once, keeping everything else */
  function migrateV2(st) {
    st.current = 'T'
    st.view = 'focus'
    st.v = 3
    st.migrated = true
  }

  function deepMerge(base, over) {
    for (const k of Object.keys(over)) {
      if (over[k] && typeof over[k] === 'object' && !Array.isArray(over[k]) && base[k] && typeof base[k] === 'object') base[k] = deepMerge(base[k], over[k])
      else base[k] = over[k]
    }
    return base
  }

  let migrated = false
  let S = load()
  let saveTimer = 0
  function save() {
    clearTimeout(saveTimer)
    saveTimer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(S))
      } catch (e) {
        /* storage unavailable: the page still works for this session */
      }
    }, 300)
  }
  // Write a migrated state straight back so storage matches what the page shows
  if (migrated) save()

  const presetIds = () => [...BUILT_IN, ...Object.keys(S.custom)]
  const P = (id = S.current) => S.params[id]
  /** Toolbar group: a design (layout and theme) or a color theme over Future's layout */
  const groupOf = (id) => (P(id) && P(id).group) || 'theme'
  /** Which layout the screens are built with: 'today' or 'future' */
  const designOf = (id) => (P(id) && P(id).design) || 'today'
  function baseOf(id) {
    if (TK.PRESETS[id]) return TK.PRESETS[id]
    return S.custom[id] ? S.custom[id].base : P(id)
  }
  const getPath = (o, path) => path.split('.').reduce((a, k) => (a == null ? a : a[k]), o)
  function setPath(o, path, v) {
    const ks = path.split('.')
    let t = o
    for (let i = 0; i < ks.length - 1; i++) t = t[ks[i]] = t[ks[i]] || {}
    t[ks[ks.length - 1]] = v
  }

  const tokenCache = {}
  function tokens(id = S.current) {
    tokenCache[id] = TK.derive(P(id))
    return tokenCache[id]
  }

  /** Flattened list of parameter differences against the preset's base */
  function paramDiff(id) {
    const out = []
    const skip = new Set(['id', 'name', 'kind', 'thesis', 'overrides'])
    const walk = (a, b, pre) => {
      for (const k of new Set([...Object.keys(a || {}), ...Object.keys(b || {})])) {
        if (!pre && skip.has(k)) continue
        const pa = a ? a[k] : undefined
        const pb = b ? b[k] : undefined
        const path = pre ? pre + '.' + k : k
        if (pa && typeof pa === 'object') walk(pa, pb, path)
        else if (pa !== pb && !(typeof pa === 'number' && typeof pb === 'number' && Math.abs(pa - pb) < 1e-9)) out.push({ path, from: pa, to: pb })
      }
    }
    walk(baseOf(id), P(id), '')
    const hadOverrides = !!baseOf(id).overrides
    if (hadOverrides && !P(id).overrides) out.push({ path: 'overrides', from: 'Theme.swift colors', to: 'detached (parametric)' })
    return out
  }
  const isModified = (id) => paramDiff(id).length > 0

  // ---------------------------------------------------------------------------
  // Generated CSS
  // ---------------------------------------------------------------------------

  function cssFor(id) {
    const p = P(id)
    const d = tokens(id)
    const sel = `.opt-${id}`
    const vars = (t) =>
      Object.entries(t)
        .map(([k, v]) => `--${k}:${v};`)
        .join('')
    const tert = { brand: 'var(--brandInk)', accent: 'var(--accentInk)', ink: 'var(--ink)' }[p.buttons.tertiary] || 'var(--brandInk)'
    const util = {
      mixed: '--u-purple:var(--purple);--u-brand:var(--brandInk);--u-info:var(--info);',
      brand: '--u-purple:var(--brandInk);--u-brand:var(--brandInk);--u-info:var(--brandInk);',
      neutral: '--u-purple:var(--ink);--u-brand:var(--ink);--u-info:var(--ink2);',
    }[p.buttons.utilityColor || 'mixed']
    const common =
      `--r-card:${p.shape.card}px;--r-nested:${p.shape.nested}px;--r-btn:${p.shape.button}px;--r-chip:${p.shape.chip}px;--r-sheet:${p.shape.sheet}px;--ring:${p.shape.ring}px;--stroke:${p.shape.stroke}px;` +
      `--f-display:${FONTS[p.type.display]};--f-amount:${FONTS[p.type.amountFace]};--f-text:${FONTS.text};--f-mono:${FONTS.mono};--w-title:${p.type.titleWeight};--ts:${p.type.scale};--fs-body:calc(16px * ${p.type.scale});` +
      `--gutter:${p.density.gutter}px;--pad:${p.density.cardPad}px;--fpad:${p.density.field}px;--sp:${p.density.space};--btn-h:${p.density.buttonH}px;--row-h:${p.density.rowH}px;--tert:${tert};${util}`
    // App chrome values computed per mode from the tokens
    const chrome = (m) => {
      const t = d[m]
      const ch = p.chrome
      let out = ''
      if (ch.header === 'card') out += '--hero:var(--card);'
      if (ch.header === 'ground') out += '--hero:var(--ground);'
      const g = parseColor(t.glassBg)
      if (g) out += `--glassBg:${TK.rgba(g.hex, Math.min(1, g.alpha * ch.glass))};`
      const sc = parseColor(t.sheetScrim)
      if (sc) out += `--sheetScrim:${TK.rgba(sc.hex, Math.min(0.95, sc.alpha * ch.dim))};`
      return out
    }
    let css = `${sel} .m-light{${common}${vars(d.light)}${chrome('light')}color-scheme:light}\n${sel} .m-dark{${common}${vars(d.dark)}${chrome('dark')}color-scheme:dark}\n`

    // Utility buttons in the app screens
    const ub = {
      tinted: '',
      fill: `${sel} .ub{background:var(--nested);box-shadow:none}\n`,
      outline: `${sel} .ub{background:transparent;box-shadow:inset 0 0 0 1.5px color-mix(in srgb, var(--uc) 45%, transparent)}\n`,
    }[p.buttons.utility || 'tinted']
    css += ub

    // Layout rules
    if (p.type.numerals === 'proportional') css += `${sel} .amt{font-family:var(--f-amount)!important;font-variant-numeric:tabular-nums;letter-spacing:-0.2px}\n`
    if (p.layout.signed) css += `${sel} .sgn{display:inline}\n`
    if (p.layout.received === 'ink') css += `${sel} .amt.in{color:var(--ink)!important}\n`
    if (p.layout.footer === 'stacked') {
      css += `${sel} .wizfoot{flex-direction:column-reverse;align-items:stretch;gap:calc(8px * var(--sp))}\n`
      css += `${sel} .wizfoot .wiznext{width:100%;min-height:var(--btn-h)!important}\n${sel} .wizfoot .wizback{align-self:center}\n${sel} .wizfoot .sp{display:none}\n`
      css += `${sel} .wizfoot .wizback.sbtn{align-self:stretch;min-height:var(--btn-h)!important}\n`
    }
    if (p.chrome.tabbar === 'solid') {
      css += `${sel} .tabbar{background:var(--card);-webkit-backdrop-filter:none;backdrop-filter:none;box-shadow:0 0 0 .5px var(--line),0 6px 20px rgba(0,0,0,.14)}\n${sel} .tabpill{background:var(--nested)}\n`
    }

    // Secondary buttons: the component boards and the app screens' .sbtn
    const sec = {
      fill: `background:var(--card);color:var(--brandInk);box-shadow:var(--cardShadow)`,
      outline: `background:transparent;color:var(--ink);box-shadow:inset 0 0 0 1.5px var(--secBorder,var(--lineStrong))`,
      tonal: `background:var(--brandTint);color:var(--brandInk);box-shadow:none`,
    }[p.buttons.secondary]
    css += `${sel} .b-secondary,${sel} .sbtn{${sec}}\n`
    if (p.buttons.secondary === 'fill') css += `${sel} .b-card .b-secondary,${sel} .b-sheetbar .b-secondary{background:var(--nested);box-shadow:none}\n`
    css += `${sel} .b-secondary.b-danger-ink{color:var(--danger)}\n`

    if (p.buttons.disabled === 'muted') {
      css += `${sel} .b-btn.is-disabled{background:var(--disabledFill);color:var(--disabledInk);box-shadow:none;cursor:not-allowed}\n`
      css += `${sel} .b-btn.b-tertiary.is-disabled{background:transparent;color:var(--ink3)}\n`
    } else {
      css += `${sel} .b-btn.is-disabled{opacity:.38;cursor:not-allowed}\n`
      css += `${sel} .pbtn.is-disabled,${sel} .pbtn.is-disabled:active,${sel} .wiznext.is-disabled,${sel} .wiznext.is-disabled:active{background:var(--brand);color:var(--onBrand);opacity:.38}\n`
    }
    const pressOverlay = p.buttons.press === 'scale' ? 0.06 : 0.12
    css += `${sel} .b-btn.is-pressed::after,${sel} .b-btn:not(.is-disabled):active::after{opacity:${pressOverlay}}\n`
    css += `${sel} .b-primary.is-pressed::after,${sel} .b-primary:active::after,${sel} .b-tertiary.is-pressed::after,${sel} .b-tertiary:active::after{opacity:0}\n`
    css += `${sel} .b-tertiary.is-pressed,${sel} .b-tertiary:not(.is-disabled):active{opacity:.5;transform:none}\n`
    if (p.buttons.press === 'scale') css += `${sel} .b-btn.is-pressed,${sel} .b-btn:not(.is-disabled):active,${sel} .pbtn:not(.is-disabled):active,${sel} .wiznext:not(.is-disabled):active,${sel} .sbtn:active{transform:scale(.97)}\n`
    return css
  }

  let cssFrame = 0
  function applyTokens() {
    cancelAnimationFrame(cssFrame)
    cssFrame = requestAnimationFrame(() => {
      $('#tokens').textContent = presetIds().map(cssFor).join('\n')
    })
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  function toast(msg, ms = 1800) {
    const t = $('#toast')
    t.textContent = msg
    t.classList.add('show')
    clearTimeout(toast.t)
    toast.t = setTimeout(() => t.classList.remove('show'), ms)
  }

  function copyText(text, okMsg = 'Copied') {
    const fallback = () => {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.setAttribute('readonly', '')
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      let ok = false
      try {
        ok = document.execCommand('copy')
      } catch (e) {
        ok = false
      }
      ta.remove()
      toast(ok ? okMsg : 'Copy failed: select the text and press ⌘C')
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(() => toast(okMsg), fallback)
    else fallback()
  }

  function download(name, text, type) {
    const url = URL.createObjectURL(new Blob([text], { type }))
    const a = document.createElement('a')
    a.href = url
    a.download = name
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 2000)
  }

  /** rgba(...) or hex -> {hex, alpha} */
  function parseColor(v) {
    if (typeof v !== 'string') return null
    if (v.startsWith('#')) return { hex: v.toUpperCase(), alpha: 1 }
    const m = v.match(/rgba?\(([^)]+)\)/)
    if (!m) return null
    const [r, g, b, a = 1] = m[1].split(',').map((s) => parseFloat(s))
    return { hex: TK.toHex([r, g, b].map(Math.round)), alpha: +a }
  }
  const showColor = (v) => {
    const c = parseColor(v)
    if (!c) return v
    return c.alpha < 1 ? `${c.hex} @ ${Math.round(c.alpha * 100)}%` : c.hex
  }
  /** Solid hex of a token value composited over the mode's card */
  function solid(t, key) {
    const c = parseColor(t[key])
    if (!c) return '#000000'
    return c.alpha < 1 ? TK.over(c.hex, c.alpha, t.card) : c.hex
  }
  function rgbToHex(str) {
    const c = parseColor(str)
    if (!c || c.alpha === 0) return 'transparent'
    return c.alpha < 1 ? `${c.hex} @ ${Math.round(c.alpha * 100)}%` : c.hex
  }

  const presetName = (id) => (P(id) ? `${P(id).name}` : id)
  const presetLabel = (id) => (BUILT_IN.includes(id) && groupOf(id) === 'theme' ? `${id} · ${presetName(id)}` : presetName(id))
  /** Where a screen comment was made, when it wasn't the iPhone */
  const deviceNote = (c) => {
    const d = c.device && c.device !== 'iphone' && SH.DEVICES.find((x) => x.id === c.device)
    return d ? d.label : ''
  }
  const modeLabel = (m) => (m === 'light' ? 'Light' : m === 'dark' ? 'Dark' : 'Both modes')

  // ---------------------------------------------------------------------------
  // Toolbar
  // ---------------------------------------------------------------------------

  function renderTop() {
    const button = (id) => {
      const d = tokens(id)
      return `<button type="button" data-preset="${id}" aria-pressed="${id === S.current}"><i class="dot2" style="background:linear-gradient(90deg,${d.light.brand} 50%,${d.dark.brand} 50%)"></i>${esc(presetLabel(id))}${isModified(id) ? ' •' : ''}</button>`
    }
    const group = (g, label) =>
      `<span class="vlabel">${label}</span><div class="seg" role="group" aria-label="${label}">${presetIds()
        .filter((id) => groupOf(id) === g)
        .map(button)
        .join('')}</div>`
    $('#presetSeg').innerHTML = group('design', 'Design') + group('theme', 'Color themes')
    $$('#viewSeg button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.view === S.view)))
    $$('#modeSeg button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.modes === S.modes)))
    $('#refBtn').setAttribute('aria-checked', String(showRef))
    document.body.classList.toggle('show-ref', showRef)
    $('#zoom').value = S.zoom[S.view]
    document.documentElement.style.setProperty('--zoom', S.zoom[S.view])
    $('#commentBtn').setAttribute('aria-pressed', String(commenting))
    $('#commentCount').textContent = S.comments.filter((c) => c.status !== 'resolved').length
    $('#tuneBtn').setAttribute('aria-pressed', String(S.dialOpen))
    const th = { system: ['circle.lefthalf.filled', 'Page theme: system'], light: ['sun.max', 'Page theme: light'], dark: ['moon', 'Page theme: dark'] }[S.pageTheme]
    $('#themeBtn').innerHTML = IC(th[0], 16)
    $('#themeBtn').title = th[1]
    $('#themeBtn').setAttribute('aria-label', th[1])
    if (S.pageTheme === 'system') document.documentElement.removeAttribute('data-theme')
    else document.documentElement.setAttribute('data-theme', S.pageTheme)
    document.body.classList.toggle('only-light', S.modes === 'light')
    document.body.classList.toggle('only-dark', S.modes === 'dark')
    document.body.classList.toggle('view-compare', S.view === 'compare')
    document.body.classList.toggle('dial-open', S.dialOpen)
    $('#dial').hidden = !S.dialOpen
  }

  // ---------------------------------------------------------------------------
  // Focus view
  // ---------------------------------------------------------------------------

  const notesBlock = (id, label) => {
    const v = S.notes[id] || ''
    return `<details class="notes" ${v ? 'open' : ''}><summary>${IC('text.bubble', 15)} Notes on ${label}${v ? ' <span class="has">• saved</span>' : ''}</summary>
      <textarea data-note="${id}" aria-label="Notes on ${label}" placeholder="General feedback for this section. It is included in the export.">${esc(v)}</textarea></details>`
  }

  const pair = (fn, id, wide) => `<div class="pairs${wide ? ' wide' : ''}">${fn(id, 'light')}${fn(id, 'dark')}</div>`

  function renderRail() {
    $('#rail').innerHTML =
      SECTIONS.map(([id, l]) => `<a href="#${id}" data-sec="${id}">${l}</a>`).join('') +
      SCREEN_GROUPS.map((g) => `<a class="sub" href="#screens-${g.toLowerCase()}">${g}</a>`).join('') +
      `<hr><div class="hint"><kbd>C</kbd> comment &nbsp;<kbd>T</kbd> tune<br><kbd>E</kbd> export &nbsp;<kbd>O</kbd> overlay<br><kbd>1</kbd>–<kbd>5</kbd> presets &nbsp;<kbd>Esc</kbd> close</div>`
  }

  function ovDyn() {
    const id = S.current
    const p = P(id)
    const d = tokens(id)
    const lightText = TK.contrast(d.dark.onBrand, '#000000') > TK.contrast(d.dark.onBrand, '#FFFFFF')
    const facts = [
      `Radius ${p.shape.card} / ${p.shape.nested} · buttons ${p.shape.button}`,
      `Titles SF Pro ${p.type.display === 'rounded' ? 'Rounded' : ''} ${p.type.titleWeight === 700 ? 'Bold' : p.type.titleWeight === 600 ? 'Semibold' : 'Medium'}`.replace('  ', ' '),
      `Amounts ${p.type.amountFace === 'rounded' ? 'SF Pro Rounded' : 'SF Pro'}`,
      `Margin ${p.density.gutter} · padding ${p.density.cardPad}`,
      `Text links: ${p.buttons.tertiary}`,
      `Primary text: ${lightText ? 'white' : 'dark'}`,
      p.shape.stroke ? `Card stroke ${p.shape.stroke}pt` : 'No card stroke',
    ]
    const strip = (m) => {
      const t = d[m]
      const keys = ['ground', 'card', 'nested', 'ink', 'ink2', 'brand', t.accent !== t.brand ? 'accent' : null, 'success', 'warning', 'danger', 'info'].filter(Boolean)
      return `<div class="strip-mode" style="background:${t.ground};box-shadow:inset 0 0 0 1px ${t.line}"><span class="lab" style="color:${t.ink2}">${m === 'light' ? 'Light' : 'Dark'}</span>
        <div class="sw-row">${keys.map((k) => `<span class="sw" title="${k} ${showColor(t[k])}" style="background:${t[k]}"></span>`).join('')}</div></div>`
    }
    const rows = CHECKS.filter(([, a]) => !(a === 'accentInk' && !p.accent.enabled))
      .map(([label, fg, bg, min]) => {
        const cell = (m) => {
          const t = d[m]
          const r = TK.contrast(solid(t, fg), solid(t, bg))
          return `<td class="num"><span class="ratio${r < min ? ' bad' : ''}"><i></i>${r.toFixed(1)}</span></td>`
        }
        return `<tr><td>${label} <span style="color:var(--x-ink3)">≥ ${min}</span></td>${cell('light')}${cell('dark')}</tr>`
      })
      .join('')
    return `<div class="ov">
      <div class="ov-card"${cAttr('summary', 'Option summary')}>
        <div class="ov-name"><b>${esc(p.name)}</b><span class="tag">${esc(p.kind || 'Custom')}</span>${isModified(id) ? '<span class="tag mod">Tuned</span>' : ''}</div>
        <p class="ov-thesis">${esc(p.thesis || '')}</p>
        <div class="facts">${facts.map((f) => `<span>${esc(f)}</span>`).join('')}</div>
        <div class="strip">${strip('light')}${strip('dark')}</div>
        ${optionNotes(id) ? `<h3>What changes from today</h3><ul class="diffs">${optionNotes(id).map((n) => `<li>${esc(n)}</li>`).join('')}</ul>` : ''}
      </div>
      <div class="ov-card"${cAttr('checks', 'Contrast checks')}>
        <h3 style="margin-top:0">Contrast checks</h3>
        <p class="lede" style="font-size:12.5px;margin-bottom:10px">WCAG 2 ratios, recalculated as you tune. Text needs 4.5:1. Borders and large text need 3:1.</p>
        <table class="checks"><thead><tr><th>Pair</th><th style="text-align:right">Light</th><th style="text-align:right">Dark</th></tr></thead><tbody>${rows}</tbody></table>
      </div>
    </div>`
  }

  const cAttr = (key, label) => ` data-c="${esc(key)}" data-cl="${esc(label)}"`

  /** Future's notes are its change log in ds-shipped.js; the color themes have fixed notes, plus a
   *  pointer to that log, since they're drawn on Future's layout */
  function optionNotes(id) {
    if (id !== 'F') {
      const notes = OPTION_NOTES[id]
      if (!notes || designOf(id) !== 'future') return notes
      const n = futureChanges().length
      return [...notes, `Screens use the Future layout${n ? `, with its ${n} change${n === 1 ? '' : 's'} from today listed under Future` : ''}.`]
    }
    return futureChanges().length ? futureChanges().map((c) => `${c.where}: ${c.change}`) : ['Nothing yet. Future is an exact copy of Today.']
  }

  /** Future's changes from Today, with readable screen names */
  function futureChanges() {
    return (SH.FUTURE_CHANGES || []).map((c) => ({
      ...c,
      where: (c.screens || []).map((sid) => {
        const sc = SH.SCREENS.find((x) => x.id === sid)
        return sc ? `${sc.group} › ${sc.label}` : sid
      }).join(', ') || 'Every screen',
    }))
  }

  function colorDyn() {
    const d = tokens()
    const docs = Object.fromEntries(TK.TOKEN_DOCS.map(([k, r, s]) => [k, [r, s]]))
    const cell = (m, k) => {
      const v = d[m][k]
      const c = parseColor(v)
      const bg = c && c.alpha < 1 ? `linear-gradient(${v},${v}),${d[m].card}` : v
      return `<td><button type="button" class="chex" data-copy="${c ? c.hex : v}" title="Copy ${c ? c.hex : v}"><span class="sw" style="background:${bg}"></span>${esc(showColor(v))}</button></td>`
    }
    const body = COLOR_GROUPS.map(
      ([g, keys]) =>
        `<tr class="grp"><td colspan="5">${g}</td></tr>` +
        keys
          .map((k) => {
            const [role, swift] = docs[k] || ROLE_FALLBACK[k] || ['', '']
            return `<tr${cAttr('token-' + k, `Token ${k}`)}><td><code>${k}</code></td>${cell('light', k)}${cell('dark', k)}<td class="role">${esc(role)}</td><td class="swift">${esc(swift)}</td></tr>`
          })
          .join(''),
    ).join('')
    return `<div class="ctable-wrap"><table class="ctable"><thead><tr><th>Token</th><th>Light</th><th>Dark</th><th>Role</th><th>Replaces in Theme.swift</th></tr></thead><tbody>${body}</tbody></table></div>`
  }

  /** The device the screens are built for: iPhone 17 Pro, the iPhone Duo closed or open, or iPad portrait */
  const deviceSeg = () =>
    `<div class="dev-bar"><span class="vlabel">Device</span><div class="seg" role="group" aria-label="Device">${SH.DEVICES.map(
      (d) => `<button type="button" data-device="${d.id}" aria-pressed="${d.id === S.device}">${esc(d.label)}</button>`,
    ).join('')}</div></div>`

  function screensDyn(id = S.current) {
    return SCREEN_GROUPS.map((g) => {
      const list = SH.SCREENS.filter((s) => s.group === g)
      return `<h3 class="grp-title" id="screens-${g.toLowerCase()}">${g}</h3><div class="shots">${list
        .map(
          (s) =>
            `<div class="shot"><div class="shot-head"><b>${esc(s.label)}</b><code>${esc(s.swift)}</code>${!s.shot ? '<span class="shot-note">No simulator screenshot</span>' : s.shotNote && s.shotNote[S.device] ? `<span class="shot-note">${esc(s.shotNote[S.device])}</span>` : ''}</div><div class="shot-pair">${SH.phone(s, 'light', designOf(id), S.device)}${SH.phone(s, 'dark', designOf(id), S.device)}</div></div>`,
        )
        .join('')}</div>`
    }).join('')
  }

  function renderFocus() {
    const id = S.current
    const boards = ['cards', 'rows', 'inputs', 'chips', 'callouts', 'progress', 'states', 'nav']
    $('#main').innerHTML = `<div id="scope" class="opt-${id}" data-opt="${id}">
      <section class="sec" id="overview"><p class="eyebrow">Overview</p><div id="ov-dyn">${ovDyn()}</div>${notesBlock('overview', 'the overview')}</section>

      <section class="sec" id="color"><p class="eyebrow">Color</p><h2>Color tokens</h2>
        <p class="lede">Every color is generated from a few settings in the tuning panel: hue, chroma and lightness steps in OKLCH. Text tokens are lightened or darkened automatically until they pass contrast on every surface they can sit on. Click a value to copy it.</p>
        <div id="color-dyn">${colorDyn()}</div>${notesBlock('color', 'color')}</section>

      <section class="sec" id="type"><p class="eyebrow">Type</p><h2>Type</h2>
        <p class="lede">SF Pro only, so every style maps to an iOS text style and scales with Dynamic Type. <b>Amounts</b> use tabular figures in the amount face. <b>SF Mono is only for machine data</b>: addresses, txids, xpubs, fingerprints, derivation paths and PSBT fields. Human numbers never use mono.</p>
        <div class="pairs">${SC.typeBoard('light')}${SC.typeBoard('dark')}</div>${notesBlock('type', 'type')}</section>

      <section class="sec" id="buttons"><p class="eyebrow">Buttons</p><h2>Call-to-action hierarchy</h2>
        <p class="lede">Three tiers, plus a tonal button for utilities and a destructive variant of each. Each screen gets one primary.</p>
        <ul class="rules">
          <li><b>Primary.</b> The one action that moves the flow forward. Full width, at the bottom of flows, brand fill with on-brand text.</li>
          <li><b>Secondary.</b> A real alternative to the primary, such as Inspect PSBT or Cancel in a sheet toolbar. Never more than one beside a primary.</li>
          <li><b>Tertiary.</b> Text-only. Brand color for forward actions like View all. Neutral for Back, Cancel and Previous, and Back always sits directly under the primary.</li>
          <li><b>Tonal.</b> Utilities inside cards and callouts: Scan QR, Paste, Copy, Show descriptor QR. Brand tint for the most useful one, neutral for the rest.</li>
          <li><b>Destructive.</b> Danger fill only on the final confirmation. Everywhere else, use the destructive secondary or tertiary.</li>
          <li><b>Disabled.</b> Always say why: a disabled primary gets a one-line reason under it. <b>Loading</b> keeps the width and describes the work underneath.</li>
          <li>Touch targets are at least 44pt. Labels are verbs in sentence case: “Show QR for signing”, not “Show QR for Signing”.</li>
        </ul>
        <h3>Matrix</h3>${pair(SC.board, 'buttons', true)}
        <h3>Patterns</h3>${pair(SC.board, 'patterns', true)}
        ${notesBlock('buttons', 'buttons')}</section>

      <section class="sec" id="components"><p class="eyebrow">Components</p><h2>Components</h2>
        <p class="lede">Built from the same tokens. These include states the screenshots don’t show: unconfirmed rows, failed and partial verification, empty and locked states, disabled and loading buttons.</p>
        ${boards.map((b) => `<h3>${SC.BOARDS[b].label}</h3>${pair(SC.board, b)}`).join('')}
        ${notesBlock('components', 'components')}</section>

      <section class="sec" id="screens"><p class="eyebrow">Screens</p><h2>Screens</h2>
        <p class="lede">The real Birch layouts, rebuilt point for point from the SwiftUI views with real SF Symbols. Every Tune control reaches these screens: color, chrome, shape, type, spacing, buttons and layout. With the <b>Today</b> preset they match the simulator screenshots. <b>Future</b> builds on Today and is where layout changes are tried; the color themes recolor Future’s layout. <b>Overlay Screenshot</b> lays the simulator screenshot over each phone, and the Layout group in Tune has a one-click <b>Apply interview decisions</b>. Phones scroll, and Comment mode pins notes to any element.</p>
        ${deviceSeg()}<div id="screens-dyn">${screensDyn(id)}</div>${notesBlock('screens', 'screens')}</section>
    </div>`
    observeSections()
  }

  function updateDynamic() {
    if (S.view !== 'focus') return
    const ov = $('#ov-dyn')
    const col = $('#color-dyn')
    if (ov) ov.innerHTML = ovDyn()
    if (col) col.innerHTML = colorDyn()
    renderPins()
  }

  let observer = null
  function observeSections() {
    if (observer) observer.disconnect()
    if (!('IntersectionObserver' in window)) return
    observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue
          $$('#rail a').forEach((a) => a.classList.toggle('on', a.dataset.sec === e.target.id))
        }
      },
      { rootMargin: '-80px 0px -65% 0px' },
    )
    $$('#main section.sec').forEach((s) => observer.observe(s))
  }

  // ---------------------------------------------------------------------------
  // Compare view
  // ---------------------------------------------------------------------------

  function compareHead(id) {
    const d = tokens(id)
    return `<b><i class="dot2" style="background:linear-gradient(90deg,${d.light.brand} 50%,${d.dark.brand} 50%)"></i>${esc(presetLabel(id))}${isModified(id) ? ' <span class="tag mod">Tuned</span>' : ''}</b><p>${esc(P(id).kind || 'Custom')}${id === S.current ? ' · being tuned' : ''}</p>`
  }

  function renderCompare() {
    const ids = presetIds().filter((id) => id !== 'T' || S.includeToday)
    const screen = SH.SCREENS.find((s) => s.id === S.compareScreen) || SH.SCREENS[0]
    const head = ids.map((id) => `<div class="cmp-col-head" data-head="${id}">${compareHead(id)}</div>`).join('')
    const row = (m) => ids.map((id) => `<div class="cmp-cell opt-${id}" data-opt="${id}">${SH.phone(screen, m, designOf(id), S.device)}</div>`).join('')
    $('#main').innerHTML = `
      <div class="cmp-bar">
        <span class="eyebrow" style="margin:0">Screen</span>
        <div class="chips">${SH.SCREENS.map((s) => `<button type="button" class="chip-x" data-cmp="${s.id}" aria-pressed="${s.id === screen.id}">${esc(s.group)} · ${esc(s.label)}</button>`).join('')}</div>
        <label class="chk"><input type="checkbox" id="incToday" ${S.includeToday ? 'checked' : ''}> Include Today</label>
        ${deviceSeg()}
      </div>
      <div class="cmp-grid" style="grid-template-columns:repeat(${ids.length}, max-content)">
        ${head}${S.modes !== 'dark' ? row('light') : ''}${S.modes !== 'light' ? row('dark') : ''}
      </div>
      <section class="sec" id="compare-notes" style="border:0;padding-top:8px">${notesBlock('compare', 'the comparison')}</section>`
  }

  function renderMain() {
    if (S.view === 'compare') renderCompare()
    else renderFocus()
    SH.applyScrolls()
    renderPins()
  }

  // ---------------------------------------------------------------------------
  // Tuning panel
  // ---------------------------------------------------------------------------

  function trackFor(row, p) {
    const [path, , kind] = row
    const grp = path.split('.')[0]
    const ctx = { brand: p.brand, accent: p.accent }[grp]
    const hue = ctx ? ctx.hue : grp === 'dark' || grp === 'light' ? p[grp].hue : 140
    if (kind === 'hue') {
      const C = ctx ? Math.max(0.09, ctx.chroma) : 0.1
      const stops = Array.from({ length: 13 }, (_, i) => `oklch(0.72 ${C} ${i * 30})`).join(',')
      return `linear-gradient(to right, ${stops})`
    }
    if (kind === 'chroma') {
      const h = ctx ? ctx.hue : getPath(p, path.replace(/chroma$/i, 'hue')) ?? hue
      return `linear-gradient(to right, oklch(0.72 0 ${h}), oklch(0.72 ${row[4]} ${h}))`
    }
    if (kind === 'light') {
      const C = ctx ? ctx.chroma : 0.01
      return `linear-gradient(to right, oklch(${row[3]} ${C} ${hue}), oklch(${row[4]} ${C} ${hue}))`
    }
    return ''
  }

  const fmt = (v, step) => {
    if (typeof v !== 'number') return v
    const dec = step < 0.01 ? 3 : step < 1 ? 2 : 0
    return +v.toFixed(dec)
  }

  /** Path -> { group, row } for every Tune control */
  const ROWS = Object.fromEntries(DIAL.flatMap((g) => g.rows.map((r) => [r[0], { group: g, row: r }])))
  const rowFlags = (r) => (r[2] === 'seg' ? r[7] : r[7]) || {}
  /** Whether a text lightness slider sits below its contrast floor, so the token is held there */
  function floorHeld(p, d, [mode, key]) {
    if (p.overrides) return false
    const m = p[mode]
    const asked = TK.lch(m[key + 'L'], m.chroma * 1.2, m.hue).hex
    return asked !== d[mode][key]
  }

  /** Today shows Theme.swift's exact colors until a color control is edited */
  const isExactToday = (id) => !!(P(id) && P(id).overrides)

  function renderDial() {
    const id = S.current
    const p = P(id)
    const d = tokens(id)
    const base = baseOf(id)
    const exact = isExactToday(id)
    const detached = !exact && !!base.overrides
    const groups = DIAL.map((g) => {
      const open = !!S.groups[g.id]
      const dirtyCount = g.rows.filter((r) => !same(getPath(p, r[0]), getPath(base, r[0]))).length
      const sws = g.sw
        ? `<span class="sws">${g.sw
            .map((k) => {
              const t = g.mode ? d[g.mode] : null
              if (t) return `<i style="background:${t[k]}"></i>`
              return `<i style="background:linear-gradient(90deg,${d.light[k]} 50%,${d.dark[k]} 50%)"></i>`
            })
            .join('')}</span>`
        : ''
      let hasComp = false
      const rows = g.rows
        .map((r) => {
          const [path, label, kind] = r
          const flags = rowFlags(r)
          if (flags.needsAccent && !p.accent.enabled) return ''
          if (flags.only) hasComp = true
          const v = getPath(p, path)
          const dirty = !same(v, getPath(base, path))
          const dot = dirty ? `<button type="button" class="dirty" data-reset="${path}" title="Reset ${label} to ${fmt(getPath(base, path), r[5] || 1)}" aria-label="Reset ${label}"></button>` : ''
          const name = `<span>${label}${flags.only ? '<sup class="only" title="Shown in the component sections; the app screens here have no such element">*</sup>' : ''}</span>`
          if (kind === 'seg') {
            return `<div class="dr seg-row${dirty ? ' is-dirty' : ''}" data-row="${path}"${flags.preview ? ` data-preview="${flags.preview}"` : ''}><span class="dr-l">${dot}${name}</span><div class="dseg">${r[3]
              .filter(([ov]) => ov !== 'accent' || p.accent.enabled || same(v, ov))
              .map(([ov, ol]) => `<button type="button" data-path="${path}" data-val='${JSON.stringify(ov)}' aria-pressed="${same(v, ov)}">${ol}</button>`)
              .join('')}</div></div>`
          }
          const [, , , min, max, step, unit] = r
          const trk = trackFor(r, p)
          const held = flags.floor ? floorHeld(p, d, flags.floor) : false
          return `<div class="dr${dirty ? ' is-dirty' : ''}" data-row="${path}"><label class="dr-l" for="d-${path}">${dot}${name}</label>
            <input type="range" id="d-${path}" data-path="${path}" min="${min}" max="${max}" step="${step}" value="${v}" ${trk ? `style="--trk:${trk}"` : ''} aria-label="${label}${unit ? ' (' + unit + ')' : ''}">
            <input type="number" data-path="${path}" min="${min}" max="${max}" step="${step}" value="${fmt(v, step)}" aria-label="${label} value">
            ${flags.floor ? `<div class="dr-hint" ${held ? '' : 'hidden'}>Held at ${flags.floor[2]}:1, the minimum contrast. Drag right for more contrast.</div>` : ''}</div>`
        })
        .join('')
      const notes = []
      if (g.id === 'accent' && !p.accent.enabled) notes.push('Turn on Second hue to add an accent color, then assign it to selection, progress, amounts, the active tab or text links.')
      const foot = []
      if (hasComp) foot.push('<div class="dg-foot"><sup class="only">*</sup> Shown in the component sections. The app screens here have no such element.</div>')
      if (g.id === 'layout') foot.push(`<button type="button" class="mini wide" id="applyInterview">Apply interview decisions</button><div class="dg-foot">Numbers in the amount face, signed amounts, received amounts in ink, and a stacked setup footer.</div>`)
      return `<div class="dg" data-group="${g.id}" aria-expanded="${open}"><button type="button" class="dg-head" data-toggle="${g.id}">${IC('chevron.down', 14)}<span>${g.name}</span>${sws}<span class="sp"></span>${dirtyCount ? `<span class="chg">${dirtyCount} changed</span>` : ''}</button>
        <div class="dg-body">${notes.map((n) => `<div class="dg-note">${n}</div>`).join('')}${rows}${foot.join('')}</div></div>`
    }).join('')
    const custom = !BUILT_IN.includes(id)
    const scroll = $('.dial-body') ? $('.dial-body').scrollTop : 0
    const todayNote = exact
      ? `<div class="dg-note top">Showing Theme.swift’s exact colors. Editing any color switches ${esc(presetName(id))} to generated colors that match them closely. Reset preset restores the exact values.</div>`
      : detached
        ? '<div class="dg-note top">Generated colors. Reset preset restores Theme.swift’s exact values.</div>'
        : ''
    $('#dial').innerHTML = `
      <div class="dial-head">${IC('slider.horizontal.3', 16)}<b>Tune</b><span class="tag">${esc(presetLabel(id))}</span>${isModified(id) ? '<span class="tag mod">Tuned</span>' : ''}<span class="sp"></span>
        <button type="button" class="mini" id="dialClose" aria-label="Close tuning panel">${IC('xmark', 12)}</button></div>
      <div class="dial-sub">
        <button type="button" class="mini" id="dialReset" ${isModified(id) ? '' : 'disabled'}>${IC('arrow.counterclockwise', 12)} Reset preset</button>
        <button type="button" class="mini" id="dialCopy">${IC('doc.on.doc', 12)} Copy values</button>
        <button type="button" class="mini" id="dialExpand">${Object.values(S.groups).filter(Boolean).length >= DIAL.length ? 'Collapse all' : 'Expand all'}</button>
        ${custom ? `<button type="button" class="mini" id="dialDelete">${IC('trash', 12)} Delete</button>` : ''}
      </div>
      <div id="dialConfirm"></div>
      <div class="dial-body">${todayNote}${groups}</div>
      <div class="dial-foot"><input id="saveName" placeholder="Name a new preset" aria-label="New preset name" maxlength="24"><button type="button" class="mini" id="dialSave">Save as preset</button></div>`
    $('.dial-body').scrollTop = scroll
  }

  const same = (a, b) => (typeof a === 'number' && typeof b === 'number' ? Math.abs(a - b) < 1e-9 : JSON.stringify(a) === JSON.stringify(b))

  /** Light refresh while a slider moves: swatches, dirty marks, notes, no re-render */
  function refreshDialMarks() {
    const p = P()
    const base = baseOf(S.current)
    const d = tokens()
    const reset = $('#dialReset')
    if (reset) reset.disabled = !isModified(S.current)
    const head = $('#dial .dial-head')
    if (head && isModified(S.current) && !$('.tag.mod', head)) $('.tag', head).insertAdjacentHTML('afterend', '<span class="tag mod">Tuned</span>')
    const note = $('#dial .dg-note.top')
    if (note && !isExactToday(S.current) && baseOf(S.current).overrides) note.textContent = 'Generated colors. Reset preset restores Theme.swift\u2019s exact values.'
    for (const g of DIAL) {
      const el = $(`.dg[data-group="${g.id}"]`)
      if (!el) continue
      const n = g.rows.filter((r) => !same(getPath(p, r[0]), getPath(base, r[0]))).length
      const chg = $('.chg', el)
      if (n && !chg) $('.dg-head', el).insertAdjacentHTML('beforeend', `<span class="chg">${n} changed</span>`)
      else if (chg) n ? (chg.textContent = `${n} changed`) : chg.remove()
      if (g.sw) {
        $$('.sws i', el).forEach((i, k) => {
          const key = g.sw[k]
          i.style.background = g.mode ? d[g.mode][key] : `linear-gradient(90deg,${d.light[key]} 50%,${d.dark[key]} 50%)`
        })
      }
      for (const r of g.rows) {
        if (r[2] === 'seg') continue
        const input = $(`input[type=range][data-path="${r[0]}"]`, el)
        if (!input) continue
        const row = input.closest('.dr')
        const dirty = !same(getPath(p, r[0]), getPath(base, r[0]))
        row.classList.toggle('is-dirty', dirty)
        const lab = $('.dr-l', row)
        const dot = $('.dirty', lab)
        if (dirty && !dot) lab.insertAdjacentHTML('afterbegin', `<button type="button" class="dirty" data-reset="${r[0]}" aria-label="Reset ${r[1]}" title="Reset ${r[1]}"></button>`)
        else if (!dirty && dot) dot.remove()
        const trk = trackFor(r, p)
        if (trk) input.style.setProperty('--trk', trk)
        const fl = rowFlags(r).floor
        const hint = fl && $('.dr-hint', row)
        if (hint) hint.hidden = !floorHeld(p, d, fl)
      }
    }
  }

  let dynFrame = 0
  function paramsChanged(full) {
    applyTokens()
    save()
    cancelAnimationFrame(dynFrame)
    dynFrame = requestAnimationFrame(() => {
      if (full) renderDial()
      else refreshDialMarks()
      updateDynamic()
      renderTop()
      if (S.view === 'compare') updateCompareHeads()
    })
  }

  function updateCompareHeads() {
    $$('[data-head]').forEach((h) => (h.innerHTML = compareHead(h.dataset.head)))
  }

  /** Editing a color on Today (or Future) leaves Theme.swift's exact values for the generated palette */
  function detachIfNeeded(path) {
    const info = ROWS[path]
    if (!info || !info.group.color || !isExactToday(S.current)) return false
    P().overrides = null
    toast(`${presetName(S.current)} now uses generated colors. Reset preset restores Theme.swift’s exact values.`)
    return true
  }

  function onDialInput(e) {
    const t = e.target
    if (!t.dataset.path || (t.type !== 'range' && t.type !== 'number')) return
    const v = parseFloat(t.value)
    const min = parseFloat(t.min)
    const max = parseFloat(t.max)
    // While typing in a number box, apply only complete in-range values; Enter or blur clamps
    if (Number.isNaN(v) || (t.type === 'number' && e.type === 'input' && (v < min || v > max))) return
    const val = Math.min(max, Math.max(min, v))
    // Never rebuild the panel here: replacing the slider under the pointer ends the drag
    detachIfNeeded(t.dataset.path)
    setPath(P(), t.dataset.path, val)
    const row = t.closest('.dr')
    if (t.type === 'number' && e.type === 'change') t.value = fmt(val, parseFloat(t.step))
    const other = $$(`input[data-path="${t.dataset.path}"]`, row).find((i) => i !== t)
    if (other) other.value = other.type === 'number' ? fmt(val, parseFloat(t.step)) : val
    paramsChanged(false)
  }

  function onDialClick(e) {
    const b = e.target.closest('button')
    if (!b) return
    if (b.dataset.toggle) {
      S.groups[b.dataset.toggle] = !S.groups[b.dataset.toggle]
      b.closest('.dg').setAttribute('aria-expanded', String(S.groups[b.dataset.toggle]))
      save()
      return
    }
    if (b.dataset.path && b.dataset.val !== undefined) {
      detachIfNeeded(b.dataset.path)
      setPath(P(), b.dataset.path, JSON.parse(b.dataset.val))
      paramsChanged(true)
      return
    }
    if (b.dataset.reset) {
      setPath(P(), b.dataset.reset, clone(getPath(baseOf(S.current), b.dataset.reset)))
      paramsChanged(true)
      return
    }
    switch (b.id) {
      case 'dialClose':
        S.dialOpen = false
        save()
        renderTop()
        break
      case 'dialReset':
        S.params[S.current] = clone(baseOf(S.current))
        paramsChanged(true)
        toast(`${presetName(S.current)} reset`)
        break
      case 'dialCopy':
        copyText(JSON.stringify(stripMeta(P()), null, 2), 'Preset values copied')
        break
      case 'dialExpand': {
        const open = Object.values(S.groups).filter(Boolean).length < DIAL.length
        for (const g of DIAL) S.groups[g.id] = open
        save()
        renderDial()
        break
      }
      case 'applyInterview':
        for (const [path, v] of Object.entries(INTERVIEW)) setPath(P(), path, v)
        paramsChanged(true)
        toast('Interview decisions applied to ' + presetName(S.current))
        break
      case 'dialSave':
        savePreset()
        break
      case 'dialDelete':
        $('#dialConfirm').innerHTML = `<div class="confirm" style="margin:8px 12px">Delete “${esc(presetName(S.current))}”? Comments on it stay in the export.<div class="row" style="display:flex;gap:6px"><button type="button" class="mini" id="delYes">Delete preset</button><button type="button" class="mini" id="delNo">Keep</button></div></div>`
        break
      case 'delYes': {
        const id = S.current
        delete S.custom[id]
        delete S.params[id]
        S.current = 'T'
        save()
        rerenderAll()
        toast('Preset deleted')
        break
      }
      case 'delNo':
        $('#dialConfirm').innerHTML = ''
        break
    }
  }

  function stripMeta(p) {
    const o = clone(p)
    delete o.thesis
    return o
  }

  function savePreset() {
    const input = $('#saveName')
    const name = (input.value || '').trim()
    if (!name) {
      input.focus()
      toast('Name the preset first')
      return
    }
    let n = 1
    while (S.params['U' + n]) n++
    const id = 'U' + n
    const src = P()
    const p = clone(src)
    p.id = id
    p.name = name
    p.kind = 'Custom'
    p.thesis = `Saved from ${src.name}${isModified(S.current) ? ' after tuning' : ''}.`
    S.params[id] = p
    S.custom[id] = { base: clone(p) }
    S.current = id
    save()
    rerenderAll()
    toast(`Saved “${name}”`)
  }

  // ---------------------------------------------------------------------------
  // Overlay
  // ---------------------------------------------------------------------------

  /** Resolves to the first shot base whose screenshots load, or null when there are none */
  let shotsFound = null
  function findShots() {
    const loads = (url) =>
      new Promise((resolve) => {
        const img = new Image()
        img.onload = () => resolve(true)
        img.onerror = () => resolve(false)
        img.src = url
      })
    shotsFound =
      shotsFound ||
      (async () => {
        for (const base of SH.SHOT_BASES) if (await loads(base + SH.shotPath(SH.SCREENS[0], 'dark'))) return base
        return null
      })()
    return shotsFound
  }

  async function toggleRef() {
    if (!showRef) {
      const base = await findShots()
      if (!base) {
        $('#refBtn').classList.add('is-unavailable')
        $('#refBtn').title = 'No simulator screenshots found. Open this page from a birch-wallet checkout with the birch-screenshots submodule at fastlane/screenshots.'
        return toast('No simulator screenshots found. Check out the birch-screenshots submodule in birch-wallet.', 4000)
      }
      SH.setShotBase(base)
    }
    showRef = !showRef
    renderTop()
  }

  // ---------------------------------------------------------------------------
  // Comments
  // ---------------------------------------------------------------------------

  let commenting = false
  let showRef = false
  let draft = null

  function anchorOf(el) {
    const optEl = el.closest('[data-opt]')
    const opt = optEl ? optEl.dataset.opt : S.current
    const screenEl = el.closest('[data-screen]')
    const boardEl = el.closest('[data-board]')
    const secEl = el.closest('section[id]')
    const modeEl = el.closest('[data-mode]')
    let scope
    let scopeLabel
    let swift = ''
    if (screenEl) {
      const s = SH.SCREENS.find((x) => x.id === screenEl.dataset.screen)
      scope = 'screen:' + s.id
      scopeLabel = `${s.group} › ${s.label}`
      swift = s.swift
    } else if (boardEl) {
      const id = boardEl.dataset.board
      scope = 'board:' + id
      scopeLabel = `Components › ${id === 'type' ? 'Type' : SC.BOARDS[id].label}`
      swift = SWIFT_FOR_BOARD[id] || ''
    } else {
      scope = 'section:' + (secEl ? secEl.id : 'page')
      scopeLabel = (SECTIONS.find((s) => secEl && s[0] === secEl.id) || [0, 'Page'])[1]
      swift = secEl && secEl.id === 'color' ? 'Theme.swift (HBTheme)' : ''
    }
    const devEl = screenEl && screenEl.closest('[data-device]')
    const device = devEl ? devEl.dataset.device : undefined
    return { opt, mode: modeEl ? modeEl.dataset.mode : 'both', scope, scopeLabel, swift, key: el.dataset.c, label: el.dataset.cl || el.dataset.c, ...(device ? { device } : {}) }
  }

  function computedOf(el) {
    const cs = getComputedStyle(el)
    const r = el.getBoundingClientRect()
    const z = el.closest('.ph') ? parseFloat(S.zoom[S.view]) || 1 : 1
    return {
      background: rgbToHex(cs.backgroundColor),
      text: rgbToHex(cs.color),
      radius: cs.borderTopLeftRadius,
      font: `${cs.fontSize} / ${cs.fontWeight}`,
      size: `${Math.round(r.width / z)}×${Math.round(r.height / z)}`,
    }
  }

  function findAnchorEl(c) {
    const scopes = $$(`[data-opt="${CSS.escape(c.opt)}"]`)
    for (const sc of scopes) {
      let containers = []
      const [kind, id] = c.scope.split(':')
      // Comments from before devices were added were all made on the iPhone
      if (kind === 'screen') containers = $$(`[data-screen="${id}"][data-mode="${c.mode}"][data-device="${c.device || 'iphone'}"]`, sc)
      else if (kind === 'board') containers = $$(`[data-board="${id}"][data-mode="${c.mode}"]`, sc)
      else containers = $$(`section#${CSS.escape(id)}`, sc)
      for (const ct of containers) {
        const el = $$(`[data-c="${CSS.escape(c.key)}"]`, ct).find((x) => !x.closest('.b-behind'))
        if (el) return el
      }
    }
    return null
  }

  /** Rebuilds only the phones for another device, so the page keeps its place */
  function setDevice(d) {
    if (!SH.DEVICES.some((x) => x.id === d) || d === S.device) return
    S.device = d
    save()
    if (S.view === 'compare') renderCompare()
    else {
      $('#screens-dyn').innerHTML = screensDyn()
      $$('#main [data-device]').forEach((b) => b.tagName === 'BUTTON' && b.setAttribute('aria-pressed', String(b.dataset.device === S.device)))
    }
    SH.applyScrolls()
    renderPins()
  }

  function renderPins() {
    $$('.pin').forEach((p) => p.remove())
    $$('.pin-host').forEach((h) => h.classList.remove('pin-host'))
    for (const c of S.comments) {
      const el = findAnchorEl(c)
      if (!el) continue
      const host = el.tagName === 'TR' ? el.firstElementChild : el
      if (getComputedStyle(host).position === 'static') host.classList.add('pin-host')
      const pin = document.createElement('button')
      pin.type = 'button'
      pin.className = 'pin' + (c.status === 'resolved' ? ' resolved' : '')
      pin.dataset.pin = c.id
      pin.textContent = c.n
      pin.title = `${c.type}: ${c.text.slice(0, 80)}`
      pin.setAttribute('aria-label', `Comment ${c.n}: ${c.text.slice(0, 80)}`)
      pin.style.left = Math.min(96, Math.max(4, c.x)) + '%'
      pin.style.top = Math.min(92, Math.max(8, c.y)) + '%'
      host.appendChild(pin)
    }
    $('#commentCount').textContent = S.comments.filter((c) => c.status !== 'resolved').length
  }

  function setCommenting(on) {
    commenting = on
    document.body.classList.toggle('commenting', on)
    $('#commentBtn').setAttribute('aria-pressed', String(on))
    if (on) toast('Comment mode: click any element')
  }

  function openComposer(opts) {
    // opts: { comment } to edit, or { el, x, y, clientX, clientY } to create
    const pop = $('#pop')
    let c
    if (opts.comment) c = opts.comment
    else {
      const a = anchorOf(opts.el)
      c = { id: null, type: 'Change', text: '', allOptions: false, status: 'open', x: opts.x, y: opts.y, ...a, optName: presetName(a.opt), computed: computedOf(opts.el), modified: isModified(a.opt) }
    }
    draft = c
    const types = ['Change', 'Issue', 'Question', 'Keep']
    pop.innerHTML = `
      <div class="ctx"><b>${esc(c.optName)}</b> · ${modeLabel(c.mode)}${deviceNote(c) ? ` · ${esc(deviceNote(c))}` : ''} · ${esc(c.scopeLabel)}<br>${esc(c.label)}</div>
      <div class="seg" role="group" aria-label="Comment type">${types.map((t) => `<button type="button" data-type="${t}" aria-pressed="${c.type === t}">${t}</button>`).join('')}</div>
      <textarea id="popText" aria-label="Comment" placeholder="${c.type === 'Keep' ? 'What works here and should stay?' : 'What should change? For example: “make this 44pt” or “too much contrast in dark mode”.'}">${esc(c.text)}</textarea>
      <label class="chk"><input type="checkbox" id="popAll" ${c.allOptions ? 'checked' : ''}> Applies to every option</label>
      <div class="row">
        ${c.id ? `<button type="button" class="xbtn danger" data-act="delete">Delete</button><button type="button" class="xbtn" data-act="resolve">${c.status === 'resolved' ? 'Reopen' : 'Resolve'}</button>` : ''}
        <span class="sp"></span>
        <button type="button" class="xbtn" data-act="cancel">Cancel</button>
        <button type="button" class="xbtn primary" data-act="save">Save</button>
      </div>`
    pop.hidden = false
    const w = pop.offsetWidth
    const h = pop.offsetHeight
    let x = (opts.clientX ?? window.innerWidth / 2) + 12
    let y = (opts.clientY ?? window.innerHeight / 3) + 12
    if (x + w > window.innerWidth - 12) x = (opts.clientX ?? 0) - w - 12
    x = Math.max(12, Math.min(x, window.innerWidth - w - 12))
    if (y + h > window.innerHeight - 12) y = Math.max(12, window.innerHeight - h - 12)
    pop.style.left = x + 'px'
    pop.style.top = y + 'px'
    $('#popText').focus()
  }

  function closeComposer() {
    $('#pop').hidden = true
    draft = null
  }

  function saveDraft() {
    const text = $('#popText').value.trim()
    if (!text) {
      $('#popText').focus()
      toast('Write the comment first')
      return
    }
    draft.text = text
    draft.allOptions = $('#popAll').checked
    if (!draft.id) {
      draft.id = 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
      draft.n = S.nextN++
      draft.created = new Date().toISOString()
      S.comments.push(draft)
    } else {
      draft.updated = new Date().toISOString()
      const i = S.comments.findIndex((x) => x.id === draft.id)
      if (i >= 0) S.comments[i] = draft
    }
    save()
    closeComposer()
    renderPins()
    if (!$('#drawer').hidden) renderDrawer()
    toast('Comment saved')
  }

  function onPopClick(e) {
    const b = e.target.closest('button')
    if (!b) return
    if (b.dataset.type) {
      draft.type = b.dataset.type
      $$('#pop [data-type]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)))
      return
    }
    const act = b.dataset.act
    if (act === 'cancel') closeComposer()
    if (act === 'save') saveDraft()
    if (act === 'delete') {
      S.comments = S.comments.filter((x) => x.id !== draft.id)
      save()
      closeComposer()
      renderPins()
      if (!$('#drawer').hidden) renderDrawer()
      toast('Comment deleted')
    }
    if (act === 'resolve') {
      draft.status = draft.status === 'resolved' ? 'open' : 'resolved'
      save()
      closeComposer()
      renderPins()
      if (!$('#drawer').hidden) renderDrawer()
    }
  }

  /** Capture clicks in comment mode before the mock UI sees them */
  function onCaptureClick(e) {
    const pin = e.target.closest('.pin')
    if (pin) {
      e.preventDefault()
      e.stopPropagation()
      const c = S.comments.find((x) => x.id === pin.dataset.pin)
      const r = pin.getBoundingClientRect()
      if (c) openComposer({ comment: clone(c), clientX: r.right, clientY: r.top })
      return
    }
    if (!commenting) return
    if (e.target.closest('.top, .dial, .drawer, .pop, .notes, .cmp-bar, .rail')) return
    const el = e.target.closest('[data-c]')
    if (!el || el.closest('.b-behind')) return
    e.preventDefault()
    e.stopPropagation()
    const r = el.getBoundingClientRect()
    openComposer({ el, x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100, clientX: e.clientX, clientY: e.clientY })
  }

  // ---------------------------------------------------------------------------
  // Drawer: comments list and export
  // ---------------------------------------------------------------------------

  let drawerTab = 'comments'
  let exportFormat = 'md'

  function renderDrawer() {
    const open = S.comments.filter((c) => c.status !== 'resolved').length
    const list = [...S.comments].sort((a, b) => a.n - b.n)
    const commentsHtml = list.length
      ? list
          .map(
            (c) => `<div class="cm">
          <div class="cm-top"><span class="cm-n" style="${c.status === 'resolved' ? 'background:var(--x-ink3)' : ''}">${c.n}</span><span class="tag">${esc(c.type)}</span>${c.status === 'resolved' ? '<span class="tag">Resolved</span>' : ''}${c.allOptions ? '<span class="tag">All options</span>' : ''}</div>
          <div class="cm-ctx">${esc(c.optName)} · ${modeLabel(c.mode)}${deviceNote(c) ? ` · ${esc(deviceNote(c))}` : ''} · ${esc(c.scopeLabel)} › ${esc(c.label)}</div>
          <div class="cm-text">${esc(c.text)}</div>
          <div class="cm-actions"><button type="button" data-locate="${c.id}">Show</button><button type="button" data-edit="${c.id}">Edit</button><button type="button" data-resolve="${c.id}">${c.status === 'resolved' ? 'Reopen' : 'Resolve'}</button><button type="button" data-del="${c.id}">Delete</button></div>
        </div>`,
          )
          .join('')
      : `<div class="empty-note">No comments yet. Turn on <b>Comment</b> (or press <span class="kbd">C</span>) and click any element on a screen, board, token row or check. Each pin records the option, mode, screen and the element’s current styles.</div>`
    const text = exportFormat === 'md' ? buildMarkdown() : JSON.stringify(buildJSON(), null, 2)
    const exportHtml = `
      <label class="field-x"><span>Overall notes</span><textarea id="overall" placeholder="Context for Claude Code that isn’t pinned to an element: the goal of these changes, priorities, what to leave alone.">${esc(S.overall)}</textarea></label>
      <div class="row" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <div class="seg" role="group" aria-label="Format"><button type="button" data-fmt="md" aria-pressed="${exportFormat === 'md'}">Markdown</button><button type="button" data-fmt="json" aria-pressed="${exportFormat === 'json'}">JSON</button></div>
        <span style="flex:1"></span>
        <button type="button" class="xbtn" id="expCopy">${IC('doc.on.doc', 14)} Copy</button>
        <button type="button" class="xbtn primary" id="expDl">${IC('arrow.down.to.line', 14)} Download</button>
      </div>
      <p class="lede" style="font-size:12.5px;margin:0">A prompt for Claude Code to update the app’s SwiftUI code to match the selected preset (${esc(presetName(S.current))}), its tuned values and your comments. Copy it into Claude Code in birch-wallet, or download it to <code>design/reviews/</code> and point Claude Code at the file. The JSON holds the same changes as exact values and can be imported back here.</p>
      <pre class="export-pre" id="expPre">${esc(text)}</pre>
      <div class="row" style="display:flex;gap:8px;flex-wrap:wrap">
        <button type="button" class="xbtn" id="expImport">${IC('tray.and.arrow.down', 14)} Import JSON</button>
        <input type="file" id="importFile" accept="application/json,.json" hidden>
        <span style="flex:1"></span>
        <button type="button" class="xbtn danger" id="expClear" ${S.comments.length ? '' : 'disabled'}>Clear comments</button>
      </div>
      <div id="clearConfirm"></div>`
    $('#drawer').innerHTML = `
      <div class="drawer-head"><b>Changes</b>
        <div class="seg" role="group" aria-label="Drawer tab"><button type="button" data-tab="comments" aria-pressed="${drawerTab === 'comments'}">Comments ${open ? `(${open})` : ''}</button><button type="button" data-tab="export" aria-pressed="${drawerTab === 'export'}">Export</button></div>
        <button type="button" class="xbtn icon" id="drawerClose" aria-label="Close">${IC('xmark', 14)}</button></div>
      <div class="drawer-body">${drawerTab === 'comments' ? commentsHtml : exportHtml}</div>`
  }

  function openDrawer(tab) {
    drawerTab = tab || drawerTab
    renderDrawer()
    $('#drawer').hidden = false
  }

  function locate(c) {
    $('#drawer').hidden = true
    const go = () => {
      const el = findAnchorEl(c)
      if (!el) {
        toast('That element is not on this view')
        return
      }
      // Scroll inside the phone first (instantly), then bring the phone into view
      const inner = el.closest('.sx')
      if (inner) {
        const r = el.getBoundingClientRect()
        const c = inner.getBoundingClientRect()
        const scale = c.height / inner.clientHeight || 1
        inner.scrollTop += (r.top - c.top) / scale - inner.clientHeight / 3
      }
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      const pin = $(`.pin[data-pin="${c.id}"]`)
      if (pin) {
        pin.classList.remove('flash')
        void pin.offsetWidth
        pin.classList.add('flash')
      }
    }
    // Make the anchor reachable: right preset in Focus, right screen in Compare
    let rerender = false
    if (S.view === 'focus' && c.opt !== S.current && S.params[c.opt]) {
      S.current = c.opt
      rerender = true
    }
    if (S.view === 'compare' && c.scope.startsWith('screen:') && S.compareScreen !== c.scope.slice(7)) {
      S.compareScreen = c.scope.slice(7)
      rerender = true
    }
    if (S.view === 'compare' && !c.scope.startsWith('screen:')) {
      S.view = 'focus'
      if (S.params[c.opt]) S.current = c.opt
      rerender = true
    }
    if (c.mode !== 'both' && S.modes !== 'both' && S.modes !== c.mode) {
      S.modes = 'both'
      rerender = true
    }
    if (c.scope.startsWith('screen:') && (c.device || 'iphone') !== S.device) {
      S.device = c.device || 'iphone'
      rerender = true
    }
    if (rerender) rerenderAll()
    setTimeout(go, rerender ? 60 : 0)
  }

  function onDrawerClick(e) {
    const b = e.target.closest('button')
    if (!b) return
    if (b.dataset.tab) {
      drawerTab = b.dataset.tab
      renderDrawer()
      return
    }
    if (b.dataset.fmt) {
      exportFormat = b.dataset.fmt
      renderDrawer()
      return
    }
    const byId = (id) => S.comments.find((x) => x.id === id)
    if (b.dataset.locate) return locate(byId(b.dataset.locate))
    if (b.dataset.edit) {
      const c = byId(b.dataset.edit)
      const r = b.getBoundingClientRect()
      return openComposer({ comment: clone(c), clientX: r.left - 360, clientY: r.top })
    }
    if (b.dataset.resolve) {
      const c = byId(b.dataset.resolve)
      c.status = c.status === 'resolved' ? 'open' : 'resolved'
      save()
      renderPins()
      return renderDrawer()
    }
    if (b.dataset.del) {
      S.comments = S.comments.filter((x) => x.id !== b.dataset.del)
      save()
      renderPins()
      return renderDrawer()
    }
    switch (b.id) {
      case 'drawerClose':
        $('#drawer').hidden = true
        break
      case 'expCopy':
        copyText($('#expPre').textContent, exportFormat === 'md' ? 'Markdown copied' : 'JSON copied')
        break
      case 'expDl': {
        const day = new Date().toISOString().slice(0, 10)
        if (exportFormat === 'md') download(`birch-design-changes-${day}.md`, buildMarkdown(), 'text/markdown')
        else download(`birch-design-changes-${day}.json`, JSON.stringify(buildJSON(), null, 2), 'application/json')
        break
      }
      case 'expImport':
        $('#importFile').click()
        break
      case 'expClear':
        $('#clearConfirm').innerHTML = `<div class="confirm">Delete all ${S.comments.length} comments? Export first if you want to keep them.<div style="display:flex;gap:6px"><button type="button" class="xbtn danger" id="clearYes">Delete all comments</button><button type="button" class="xbtn" id="clearNo">Keep them</button></div></div>`
        break
      case 'clearYes':
        S.comments = []
        save()
        renderPins()
        renderDrawer()
        toast('Comments cleared')
        break
      case 'clearNo':
        $('#clearConfirm').innerHTML = ''
        break
    }
  }

  function importJSON(file) {
    const reader = new FileReader()
    reader.onload = () => {
      let data
      try {
        data = JSON.parse(reader.result)
      } catch (e) {
        toast('That file is not valid JSON')
        return
      }
      // birch-design-review/1 is the earlier name for the same export
      if (!data || !['birch-design-changes/1', 'birch-design-review/1'].includes(data.schema)) {
        toast('Not a Birch Design System export')
        return
      }
      const known = new Set(S.comments.map((c) => c.id))
      let added = 0
      for (const c of data.comments || []) {
        if (known.has(c.id)) continue
        S.comments.push(c)
        added++
      }
      S.nextN = Math.max(S.nextN, ...S.comments.map((c) => (c.n || 0) + 1))
      Object.assign(S.notes, data.sectionNotes || {})
      if (data.overallNotes && !S.overall) S.overall = data.overallNotes
      if (data.preset && data.params && S.params[data.preset.id]) S.params[data.preset.id] = deepMerge(clone(baseOf(data.preset.id)), data.params)
      save()
      rerenderAll()
      openDrawer('comments')
      toast(`Imported ${added} comment${added === 1 ? '' : 's'}`)
    }
    reader.readAsText(file)
  }

  // ---------------------------------------------------------------------------
  // Export builders
  // ---------------------------------------------------------------------------

  const fmtVal = (v) => (v === undefined ? '—' : typeof v === 'number' ? String(+v.toFixed(3)) : String(v))

  function resolvedTokens(id) {
    const d = tokens(id)
    const docs = Object.fromEntries(TK.TOKEN_DOCS.map(([k, r, s]) => [k, [r, s]]))
    const keys = COLOR_GROUPS.flatMap(([, ks]) => ks)
    return keys.map((k) => {
      const [role, swift] = docs[k] || ROLE_FALLBACK[k] || ['', '']
      return { token: k, light: showColor(d.light[k]), dark: showColor(d.dark[k]), role, swift }
    })
  }

  function layoutValues(p) {
    return {
      radius: { card: p.shape.card, field: p.shape.nested, button: p.shape.button, pill: p.shape.chip, sheet: p.shape.sheet },
      selectionRing: p.shape.ring,
      cardStroke: p.shape.stroke,
      lightShadow: p.shape.shadow,
      type: {
        textScale: p.type.scale,
        titles: p.type.display === 'rounded' ? 'SF Pro Rounded' : 'SF Pro',
        titleWeight: p.type.titleWeight,
        amounts: p.type.amountFace === 'rounded' ? 'SF Pro Rounded' : 'SF Pro',
        numbers: p.type.numerals === 'mono' ? 'SF Mono' : 'amount face, tabular figures',
        machineData: 'SF Mono',
      },
      spacing: { screenMargin: p.density.gutter, cardPadding: p.density.cardPad, fieldPadding: p.density.field, verticalScale: p.density.space, buttonHeight: p.density.buttonH, listRowHeight: p.density.rowH },
      buttons: { ...p.buttons },
      layout: { ...p.layout },
      chrome: { ...p.chrome },
      roles: { ...p.roles },
    }
  }

  /** Tune rows by path, with their group name, for readable setting names */
  const DIAL_ROWS = Object.fromEntries(DIAL.flatMap((g) => g.rows.map((r) => [r[0], { group: g, row: r }])))

  function settingLabel(path) {
    const d = DIAL_ROWS[path]
    return d ? `${d.group.name} › ${d.row[1]}` : path
  }

  function settingValue(path, v) {
    const d = DIAL_ROWS[path]
    if (!d) return fmtVal(v)
    const [, , kind, opts, , , unit] = d.row
    if (kind === 'seg') {
      const o = opts.find(([val]) => val === v)
      return o ? o[1] : fmtVal(v)
    }
    return fmtVal(v) + (unit && v !== undefined ? (unit === '×' ? '×' : ' ' + unit) : '')
  }

  /**
   * Shape, type, spacing, button, layout, chrome and color-role settings that differ from the
   * shipped app (the untouched Today preset), in Tune panel order
   */
  function settingChanges(id) {
    const shipped = TK.PRESETS.T
    const now = P(id)
    // The accent group's hue and lightness are colors; only its role choices count as settings
    return DIAL.filter((g) => !g.color || g.id === 'accent')
      .flatMap((g) => g.rows)
      .filter(([path]) => !path.startsWith('accent.'))
      .map(([path]) => ({ path, setting: settingLabel(path), shipped: getPath(shipped, path), now: getPath(now, path) }))
      .filter((c) => c.now !== c.shipped && !(typeof c.now === 'number' && typeof c.shipped === 'number' && Math.abs(c.now - c.shipped) < 1e-9))
      .map((c) => ({ ...c, shippedLabel: settingValue(c.path, c.shipped), nowLabel: settingValue(c.path, c.now) }))
  }
  /**
   * Color tokens that differ from the shipped Theme.swift values. Editing a color on Today swaps
   * the exact values for a generated palette that matches them only to about 0.01 ΔE, so Today is
   * compared with its untuned generated palette: only tokens the edits actually moved are listed.
   */
  function colorChanges(id) {
    const shipped = TK.derive(TK.PRESETS.T)
    const base = baseOf(id)
    let ref = shipped
    // Colors the preset itself sets apart from the shipped ones, before any tuning
    let own = shipped
    if (base.overrides && !P(id).overrides) {
      const untuned = clone(base)
      delete untuned.overrides
      ref = TK.derive(untuned)
      own = TK.derive(base)
    }
    const now = tokens(id)
    const moved = (m, k) => showColor(ref[m][k]) !== showColor(now[m][k]) || showColor(own[m][k]) !== showColor(shipped[m][k])
    return resolvedTokens(id)
      .map((t) => ({
        token: t.token,
        role: t.role,
        swift: t.swift,
        light: { shipped: showColor(shipped.light[t.token]), now: showColor(now.light[t.token]), changed: moved('light', t.token) },
        dark: { shipped: showColor(shipped.dark[t.token]), now: showColor(now.dark[t.token]), changed: moved('dark', t.token) },
      }))
      .filter((c) => c.light.changed || c.dark.changed)
  }

  /** What Claude Code should do with the export; shared by the Markdown and the JSON */
  const INSTRUCTIONS = [
    'Read `design/AGENTS.md` and Part 1 of `design/DESIGN-SYSTEM.md` first. They describe how the app’s design is built today and which Swift code owns each part.',
    'Change shared code first. Colors live in `birch/Views/Components/Theme.swift` (`HBTheme.birchDark`, `HBTheme.birchLight` and the `Color.hb*` accessors). Shape, type, spacing and buttons live in the shared components and modifiers (`BirchCard`, `BirchSelected`, `HBPrimaryButtonModifier`, `HBSecondaryButtonModifier`, `HBBarButtonStyle`, `Font.hb*`). Edit a single view only when a comment is about that screen or no shared code covers the change. Don’t add inline colors or fonts.',
    'Apply every comment under “Comments to apply”. Each names the screen, the element, the SwiftUI file and the appearance it was made in. Where a comment conflicts with a table, the comment wins.',
    'Change only what this lists. Everything else keeps its shipped value.',
    'Keep Birch Light and Birch Dark both correct, and keep text at 4.5:1 contrast or better.',
    'If a change is unclear, or would reach beyond the screens it names, ask before you guess.',
    'When you’re done, build and run the unit tests as `CLAUDE.md` describes. Then report, for each comment and each changed value, what you changed and where, plus anything you skipped and why.',
    'Finally, bring the design repo (the `design/` submodule) up to date so it still matches the app: Part 1 of `design/DESIGN-SYSTEM.md` and the Today preset in `design/assets/ds-tokens.js`. `design/AGENTS.md` explains how.',
  ]

  /** Comments split by what Claude Code should do with them */
  function commentGroups(id) {
    const all = [...S.comments].sort((a, b) => a.n - b.n)
    const open = all.filter((c) => c.status !== 'resolved')
    return {
      apply: open.filter((c) => c.opt === id || c.allOptions),
      other: open.filter((c) => c.opt !== id && !c.allOptions),
      resolved: all.filter((c) => c.status === 'resolved'),
    }
  }

  function buildJSON() {
    const id = S.current
    const others = presetIds().filter((x) => x !== id && isModified(x))
    return {
      schema: 'birch-design-changes/1',
      generatedAt: new Date().toISOString(),
      source: 'design/design-system.html',
      task: 'Update the SwiftUI code in birch-wallet so the app matches the selected preset, its tuned values and the open comments.',
      instructions: INSTRUCTIONS,
      preset: { id, name: P(id).name, kind: P(id).kind || 'Custom', design: designOf(id), shipped: id === 'T', modified: isModified(id) },
      changesFromShipped: { design: designOf(id) === 'future' ? futureChanges() : [], settings: settingChanges(id), colors: colorChanges(id) },
      params: stripMeta(P(id)),
      paramDiff: paramDiff(id),
      tokens: { light: tokens(id).light, dark: tokens(id).dark },
      tokenTable: resolvedTokens(id),
      layout: layoutValues(P(id)),
      otherTunedPresets: others.map((x) => ({ id: x, name: P(x).name, paramDiff: paramDiff(x) })),
      comments: [...S.comments].sort((a, b) => a.n - b.n),
      sectionNotes: Object.fromEntries(Object.entries(S.notes).filter(([, v]) => v && v.trim())),
      overallNotes: S.overall,
    }
  }

  function buildMarkdown() {
    const id = S.current
    const p = P(id)
    const today = id === 'T'
    const future = designOf(id) === 'future'
    const design = future ? futureChanges() : []
    const settings = settingChanges(id)
    const colors = colorChanges(id)
    const groups = commentGroups(id)
    const notes = Object.entries(S.notes).filter(([, v]) => v && v.trim())
    const L = []
    L.push('# Update the Birch app’s design', '')
    L.push(`Exported ${new Date().toLocaleString()} from the Birch Design System page (\`design/design-system.html\`).`, '')
    L.push('You’re working in the birch-wallet repository. Update the SwiftUI code under `birch/` so the app matches the design changes below: the preset selected on the page, the values tuned in its Tune panel, and the comments and notes pinned to its screens and components.', '')
    if (today) L.push('**Selected preset:** Today, the app as it ships. Apply only the changes listed below.', '')
    else if (id === 'F') L.push(`**Selected preset:** ${p.name}, the next version of the app’s design. It’s built on the app as it ships: apply its design changes and every setting and color listed below as changed from the shipped app.`, '')
    else if (future) L.push(`**Selected preset:** ${p.name}, a color theme on the Future design and a different direction from the app as it ships. Move the app to it: apply Future’s design changes and every setting and color listed below as changed from the shipped app.`, '')
    else L.push(`**Selected preset:** ${p.name}, a different direction from the app as it ships. Move the app to it: apply every setting and color listed below as changed from the shipped app.`, '')

    if (S.overall.trim()) L.push('## Overall notes', '', S.overall.trim(), '')

    L.push('## How to make the changes', '')
    INSTRUCTIONS.forEach((t, i) => L.push(`${i + 1}. ${t}`))
    L.push('')

    L.push('## Changes from the shipped app', '')
    if (future) {
      L.push('### Design', '')
      if (design.length) design.forEach((c, i) => L.push(`${i + 1}. **${c.where}**${c.swift ? ` (\`${c.swift}\`)` : ''}: ${c.change}`))
      else L.push('None yet. The layout and components match the shipped app.')
      L.push('')
    }
    L.push('### Settings', '')
    if (settings.length) {
      L.push('| Setting | Shipped | New |', '|---|---|---|')
      settings.forEach((c) => L.push(`| ${c.setting} (\`${c.path}\`) | ${c.shippedLabel} | ${c.nowLabel} |`))
    } else L.push('None. Shape, type, spacing, buttons, layout and app chrome stay as they ship.')
    L.push('', '### Colors', '')
    if (colors.length) {
      L.push('Hex values for Birch Light and Birch Dark. “Same” means that mode keeps its shipped value.', '')
      L.push('| Token | Role | Replaces in Swift | Light: shipped → new | Dark: shipped → new |', '|---|---|---|---|---|')
      const cell = (m) => (m.changed ? `${m.shipped} → ${m.now}` : 'Same')
      colors.forEach((c) => L.push(`| \`${c.token}\` | ${c.role} | ${c.swift || 'New'} | ${cell(c.light)} | ${cell(c.dark)} |`))
    } else L.push('None. Colors stay as they ship.')
    L.push('')
    const tuned = presetIds().filter((x) => x !== id && isModified(x))
    if (tuned.length) L.push(`Other presets were tuned on the page but aren’t part of this change: ${tuned.map((x) => P(x).name).join(', ')}.`, '')

    const commentBlock = (c) => {
      const out = []
      out.push(`### ${c.n}. ${c.type}: ${c.scopeLabel} › ${c.label}`)
      out.push(`- **Where:** ${c.scopeLabel}${c.swift ? ` (\`${c.swift}\`)` : ''}, ${modeLabel(c.mode).toLowerCase()}${deviceNote(c) ? `, on the ${deviceNote(c)}` : ''}, made on ${c.optName}${c.allOptions ? ', applies to every preset' : ''}`)
      out.push(`- **Element:** \`${c.key}\`${c.computed ? `: fill ${c.computed.background}, text ${c.computed.text}, radius ${c.computed.radius}, font ${c.computed.font}, ${c.computed.size}pt` : ''}`)
      out.push('', c.text.split('\n').map((l) => '> ' + l).join('\n'), '')
      return out.join('\n')
    }
    L.push(`## Comments to apply (${groups.apply.length})`, '')
    if (groups.apply.length) groups.apply.forEach((c) => L.push(commentBlock(c)))
    else L.push('None.', '')
    if (groups.other.length) {
      L.push(`## Comments made on other presets (${groups.other.length})`, '', `These were pinned while viewing a different preset. Apply one only if it’s about the app whatever the preset; otherwise leave it and mention it in your report.`, '')
      groups.other.forEach((c) => L.push(commentBlock(c)))
    }
    if (groups.resolved.length) {
      L.push(`## Resolved comments (${groups.resolved.length})`, '', 'Already handled. Context only; don’t apply these.', '')
      groups.resolved.forEach((c) => L.push(commentBlock(c)))
    }

    if (notes.length) {
      L.push('## Section notes', '')
      for (const [k, v] of notes) L.push(`### ${(SECTIONS.find((s) => s[0] === k) || [k, k[0].toUpperCase() + k.slice(1)])[1]}`, '', v.trim(), '')
    }

    const lv = layoutValues(p)
    L.push(`## Reference: ${p.name} in full`, '', 'Every value of the selected preset, for context. Use “Changes from the shipped app” to decide what to edit.', '')
    L.push(`- **Radius (pt):** card ${lv.radius.card}, field ${lv.radius.field}, button ${lv.radius.button}, pill ${lv.radius.pill}, sheet ${lv.radius.sheet}. Selection ring ${lv.selectionRing}pt. Card stroke ${lv.cardStroke}pt. Light-mode shadow strength ${lv.lightShadow}.`)
    L.push(`- **Type:** text size ×${lv.type.textScale}; titles ${lv.type.titles} weight ${lv.type.titleWeight}; amounts ${lv.type.amounts}; numbers ${lv.type.numbers}; machine data ${lv.type.machineData}.`)
    L.push(`- **Spacing (pt):** screen margin ${lv.spacing.screenMargin}, card padding ${lv.spacing.cardPadding}, field padding ${lv.spacing.fieldPadding}, vertical spacing ×${lv.spacing.verticalScale}, button height ${lv.spacing.buttonHeight}, list row height ${lv.spacing.listRowHeight}.`)
    L.push(`- **Buttons and links:** utility ${lv.buttons.utility} (${lv.buttons.utilityColor} colors), text links ${lv.buttons.tertiary}, pressed ${lv.buttons.press}, secondary ${lv.buttons.secondary}, disabled ${lv.buttons.disabled}.`)
    L.push(`- **Layout:** setup footer ${lv.layout.footer}, signed amounts ${lv.layout.signed ? 'on' : 'off'}, received amounts ${lv.layout.received === 'ink' ? 'ink' : 'success color'}.`)
    L.push(`- **App chrome:** wallet header ${lv.chrome.header}, tab bar ${lv.chrome.tabbar} (opacity ×${lv.chrome.glass}), sheet dimming ×${lv.chrome.dim}.`)
    L.push(`- **Color roles:** selection ${lv.roles.selection}, progress ${lv.roles.progress}, amounts ${lv.roles.amountUnit === 'accent' ? 'accent' : 'brand'}, active tab ${lv.roles.tabTint}, toggles ${lv.roles.toggles}.`, '')
    L.push('| Token | Light | Dark | Role | Replaces |', '|---|---|---|---|---|')
    resolvedTokens(id).forEach((t) => L.push(`| \`${t.token}\` | ${t.light} | ${t.dark} | ${t.role} | ${t.swift} |`))
    L.push('')
    return L.join('\n')
  }

  // ---------------------------------------------------------------------------
  // Wiring
  // ---------------------------------------------------------------------------

  function rerenderAll() {
    applyTokens()
    renderTop()
    renderMain()
    renderDial()
    if (!$('#drawer').hidden) renderDrawer()
  }

  function switchPreset(id) {
    if (!S.params[id] || id === S.current) return
    const relayout = designOf(id) !== designOf(S.current)
    S.current = id
    save()
    if (S.view === 'focus' && relayout) renderMain()
    else if (S.view === 'focus') {
      const scope = $('#scope')
      scope.className = `opt-${id}`
      scope.dataset.opt = id
      updateDynamic()
    } else {
      renderCompare()
      renderPins()
    }
    renderTop()
    renderDial()
    if (!$('#drawer').hidden) renderDrawer()
  }

  function bind() {
    document.addEventListener('click', onCaptureClick, true)

    $('#presetSeg').addEventListener('click', (e) => {
      const b = e.target.closest('[data-preset]')
      if (b) switchPreset(b.dataset.preset)
    })
    $('#viewSeg').addEventListener('click', (e) => {
      const b = e.target.closest('[data-view]')
      if (!b || b.dataset.view === S.view) return
      S.view = b.dataset.view
      save()
      renderTop()
      renderMain()
      window.scrollTo(0, 0)
    })
    $('#modeSeg').addEventListener('click', (e) => {
      const b = e.target.closest('[data-modes]')
      if (!b) return
      S.modes = b.dataset.modes
      save()
      renderTop()
      if (S.view === 'compare') renderMain()
    })
    $('#zoom').addEventListener('input', (e) => {
      S.zoom[S.view] = parseFloat(e.target.value)
      document.documentElement.style.setProperty('--zoom', S.zoom[S.view])
      save()
    })
    $('#commentBtn').addEventListener('click', () => setCommenting(!commenting))
    $('#refBtn').addEventListener('click', toggleRef)
    $('#exportBtn').addEventListener('click', () => openDrawer('export'))
    $('#tuneBtn').addEventListener('click', () => {
      S.dialOpen = !S.dialOpen
      save()
      renderTop()
    })
    $('#themeBtn').addEventListener('click', () => {
      S.pageTheme = { system: 'light', light: 'dark', dark: 'system' }[S.pageTheme]
      save()
      renderTop()
    })

    $('#dial').addEventListener('input', onDialInput)
    $('#dial').addEventListener('change', (e) => {
      if (e.target.type === 'number') onDialInput(e)
    })
    $('#dial').addEventListener('click', onDialClick)
    $('#dial').addEventListener('keydown', (e) => {
      if (e.target.id === 'saveName' && e.key === 'Enter') savePreset()
    })

    $('#pop').addEventListener('click', onPopClick)
    $('#pop').addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) saveDraft()
      if (e.key === 'Escape') closeComposer()
    })

    $('#drawer').addEventListener('click', onDrawerClick)
    $('#drawer').addEventListener('input', (e) => {
      if (e.target.id === 'overall') {
        S.overall = e.target.value
        save()
        clearTimeout(onDrawerClick.t)
        onDrawerClick.t = setTimeout(() => {
          const pre = $('#expPre')
          if (pre) pre.textContent = exportFormat === 'md' ? buildMarkdown() : JSON.stringify(buildJSON(), null, 2)
        }, 250)
      }
    })
    $('#drawer').addEventListener('change', (e) => {
      if (e.target.id === 'importFile' && e.target.files[0]) importJSON(e.target.files[0])
    })

    $('#main').addEventListener('input', (e) => {
      const n = e.target.dataset.note
      if (n !== undefined) {
        S.notes[n] = e.target.value
        save()
      }
    })
    $('#main').addEventListener('click', (e) => {
      const dev = e.target.closest('[data-device]')
      if (dev && dev.tagName === 'BUTTON') {
        setDevice(dev.dataset.device)
        return
      }
      const chip = e.target.closest('[data-cmp]')
      if (chip) {
        S.compareScreen = chip.dataset.cmp
        save()
        renderCompare()
        renderPins()
        return
      }
      if (commenting) return
      const copy = e.target.closest('[data-copy]')
      if (copy) copyText(copy.dataset.copy, `Copied ${copy.dataset.copy}`)
    })
    $('#main').addEventListener('change', (e) => {
      if (e.target.id === 'incToday') {
        S.includeToday = e.target.checked
        save()
        renderCompare()
        renderPins()
      }
    })

    document.addEventListener('keydown', (e) => {
      const tag = (e.target.tagName || '').toLowerCase()
      if (e.key === 'Escape') {
        if (!$('#pop').hidden) return closeComposer()
        if (!$('#drawer').hidden) return ($('#drawer').hidden = true)
        if (commenting) return setCommenting(false)
      }
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable || e.metaKey || e.ctrlKey || e.altKey) return
      const k = e.key.toLowerCase()
      if (k === 'c') setCommenting(!commenting)
      else if (k === 't') {
        S.dialOpen = !S.dialOpen
        save()
        renderTop()
      } else if (k === 'e') openDrawer('export')
      else if (k === 'o') toggleRef()
      else if (/^[1-9]$/.test(k) && BUILT_IN[+k - 1]) switchPreset(BUILT_IN[+k - 1])
    })
  }

  // Harness: one bare screen at the device's size for pixel comparison with the simulator
  // design-system.html?harness=<screen>&mode=dark|light&preset=T|F|A|B|C&device=iphone|duo-closed|duo-open|ipad&rules=system&scroll=<pt>
  // (rules=system applies the interview decisions from the Layout group)
  const HP = new URLSearchParams(location.search)
  if (HP.has('harness')) {
    S = defaults()
    const id = S.params[HP.get('preset')] ? HP.get('preset') : 'T'
    const mode = HP.get('mode') === 'light' ? 'light' : 'dark'
    const screen = SH.SCREENS.find((x) => x.id === HP.get('harness')) || SH.SCREENS[0]
    document.body.className = 'harness'
    if (HP.get('rules') === 'system') for (const [path, v] of Object.entries(INTERVIEW)) setPath(S.params[id], path, v)
    document.getElementById('tokens').textContent = cssFor(id)
    document.body.innerHTML = `<div id="scope" class="opt-${id}" data-opt="${id}">${SH.phone(screen, mode, designOf(id), HP.get('device') || 'iphone')}</div>`
    SH.applyScrolls()
    const y = parseFloat(HP.get('scroll') || '0')
    if (y) document.querySelectorAll('.ph-screen > .sx, .ssheet > .sx').forEach((el) => (el.scrollTop = y))
    return
  }

  // Boot
  applyTokens()
  renderTop()
  renderRail()
  renderMain()
  renderDial()
  bind()
  // Fonts settle after first paint; re-place pins once layout is final
  setTimeout(renderPins, 300)
})()
