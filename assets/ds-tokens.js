/*
 * Birch design system: token engine and presets.
 *
 * Every color token is derived from a small set of parameters (OKLCH hue,
 * chroma, lightness steps), so a preset is a parameter set, not a hex list.
 * DialKit edits the parameters; derive() turns them into light and dark
 * token maps. Runs in the browser (window.BirchTokens) and in Node
 * (module.exports) so palettes can be contrast-checked from the terminal.
 */
;(function (root) {
  'use strict'

  // ---------------------------------------------------------------------------
  // Color math: OKLCH -> sRGB, gamut mapping, WCAG contrast
  // ---------------------------------------------------------------------------

  function oklchToLinear(L, C, H) {
    const h = (H * Math.PI) / 180
    const a = C * Math.cos(h)
    const b = C * Math.sin(h)
    const l_ = L + 0.3963377774 * a + 0.2158037573 * b
    const m_ = L - 0.1055613458 * a - 0.0638541728 * b
    const s_ = L - 0.0894841775 * a - 1.291485548 * b
    const l = l_ * l_ * l_
    const m = m_ * m_ * m_
    const s = s_ * s_ * s_
    return [
      4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
      -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
      -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
    ]
  }

  const inGamut = (rgb) => rgb.every((v) => v >= -0.0005 && v <= 1.0005)

  function gamma(v) {
    v = Math.min(1, Math.max(0, v))
    return v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055
  }

  /** OKLCH -> {hex, rgb[0-255], lin[0-1]} with chroma reduced until in sRGB gamut */
  function lch(L, C, H) {
    L = Math.min(1, Math.max(0, L))
    let lin = oklchToLinear(L, C, H)
    if (!inGamut(lin)) {
      let lo = 0
      let hi = C
      for (let i = 0; i < 24; i++) {
        const mid = (lo + hi) / 2
        if (inGamut(oklchToLinear(L, mid, H))) lo = mid
        else hi = mid
      }
      C = lo
      lin = oklchToLinear(L, C, H)
    }
    lin = lin.map((v) => Math.min(1, Math.max(0, v)))
    const rgb = lin.map((v) => Math.round(gamma(v) * 255))
    return { L, C, H, rgb, hex: toHex(rgb) }
  }

  function toHex(rgb) {
    return '#' + rgb.map((v) => v.toString(16).padStart(2, '0')).join('').toUpperCase()
  }

  function hexToRgb(hex) {
    const h = hex.replace('#', '')
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16))
  }

  function luminance(rgb) {
    const lin = rgb.map((v) => {
      v /= 255
      return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2]
  }

  /** WCAG 2 contrast ratio between two hex colors */
  function contrast(a, b) {
    const la = luminance(hexToRgb(a))
    const lb = luminance(hexToRgb(b))
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
  }

  /** Composite fg hex at alpha over bg hex -> hex */
  function over(fg, alpha, bg) {
    const f = hexToRgb(fg)
    const b = hexToRgb(bg)
    return toHex(f.map((v, i) => Math.round(v * alpha + b[i] * (1 - alpha))))
  }

  function rgba(hex, alpha) {
    const [r, g, b] = hexToRgb(hex)
    return `rgba(${r}, ${g}, ${b}, ${+alpha.toFixed(3)})`
  }

  /**
   * Walk lightness toward more contrast until `color` reaches `target`
   * against every background in `bgs`. Returns the adjusted color.
   */
  function ensureContrast(L, C, H, bgs, target, dir) {
    let c = lch(L, C, H)
    const ok = (col) => bgs.every((bg) => contrast(col.hex, bg) >= target)
    let guard = 0
    while (!ok(c) && guard++ < 100) {
      L += dir * 0.005
      if (L <= 0 || L >= 1) break
      c = lch(L, C, H)
    }
    return c
  }

  // ---------------------------------------------------------------------------
  // Derivation
  // ---------------------------------------------------------------------------

  /**
   * Turn a preset's parameters into token maps for both modes.
   * Returns { light: {token: value}, dark: {token: value}, meta }
   */
  function derive(p) {
    const out = { light: deriveMode(p, 'light'), dark: deriveMode(p, 'dark') }
    if (p.overrides) {
      for (const mode of ['light', 'dark']) {
        Object.assign(out[mode], p.overrides[mode] || {})
      }
    }
    finalize(out.light, p, 'light')
    finalize(out.dark, p, 'dark')
    return out
  }

  /** Tokens composed from other tokens, computed after overrides so every preset gets them */
  function finalize(t, p, mode) {
    const dark = mode === 'dark'
    // Segmented thumb: white card in light, a lifted step above the track in dark
    t.segOn = dark ? over(t.ink, 0.16, t.nested) : t.card
    t.toggleOff = over(t.ink, dark ? 0.22 : 0.13, t.card)
    // Disabled fill must read as a button on the ground, not as bare text
    const ov = (p.overrides && p.overrides[mode]) || {}
    if (!ov.disabledFill) t.disabledFill = over(t.ink, dark ? 0.1 : 0.075, t.ground)
    if (!ov.disabledInk) t.disabledInk = t.ink3
    // Flow diagram and other "this is the money" marks follow the amount role
    const accentAmounts = p.roles && p.roles.amountUnit === 'accent'
    t.unitFlow = accentAmounts ? t.accentInk : t.brandInk
    // Roles the shipped SwiftUI uses directly (Theme.swift raw colors and system colors).
    // Presets derive them from their palette; Today pins the shipped values.
    const ovr = (k, v) => { if (!(k in ov)) t[k] = v }
    ovr('hero', dark ? t.card : t.ground)
    const sm = p[mode]
    ovr('border', lch(dark ? sm.groundL + sm.step * 3.5 : sm.groundL - 0.2, sm.chroma, sm.hue).hex)
    ovr('purple', t.net_signet)
    ovr('sysGreen', t.success)
    ovr('orange', t.warning)
    ovr('teal', t.net_testnet3)
    ovr('sep', dark ? 'rgba(84, 84, 88, 0.5)' : 'rgba(60, 60, 67, 0.29)')
    ovr('chev', dark ? 'rgba(235, 235, 245, 0.3)' : 'rgba(60, 60, 67, 0.3)')
    ovr('sheetScrim', dark ? 'rgba(0, 0, 0, 0.47)' : 'rgba(0, 0, 0, 0.2)')
    ovr('grabber', dark ? 'rgba(127, 127, 127, 0.5)' : 'rgba(0, 0, 0, 0.18)')
    ovr('glassBg', rgba(dark ? over(t.ink, 0.16, t.card) : over('#FFFFFF', 0.32, t.card), 0.94))
    ovr('glassRim', dark ? 'rgba(255, 255, 255, 0.22)' : 'rgba(255, 255, 255, 0.95)')
    ovr('glassEdge', dark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)')
    ovr('glassPill', rgba(dark ? over(t.brand, 0.06, over(t.ink, 0.02, t.card)) : over(t.ink, 0.09, t.card), 0.97))
    // UISegmentedControl: the appearance background (nested) under iOS's translucent track fill,
    // rgb(118,118,128) at 24% dark / 12% light; the dark thumb is white at 27% over the track
    ovr('segTrack', over('#767680', dark ? 0.24 : 0.12, t.nested))
    ovr('segThumb', dark ? over('#FFFFFF', 0.27, t.segTrack || over('#767680', 0.24, t.nested)) : '#FFFFFF')
    ovr('segText', dark ? '#FFFFFF' : '#000000')
    ovr('segTextOn', dark ? '#FFFFFF' : '#000000')
    const stroke = p.shape.stroke
    const ring = stroke > 0 ? `inset 0 0 0 ${stroke}px ${t.line}` : ''
    const sh = t.shadow && t.shadow !== 'none' ? t.shadow : ''
    t.cardShadow = [ring, sh].filter(Boolean).join(', ') || 'none'
  }

  function deriveMode(p, mode) {
    const dark = mode === 'dark'
    const s = dark ? p.dark : p.light
    const t = {}
    const tintH = s.hue
    const tintC = s.chroma

    // Surfaces
    if (dark) {
      t.ground = lch(s.groundL, tintC, tintH).hex
      t.card = lch(s.groundL + s.step, tintC, tintH).hex
      t.nested = lch(s.groundL + s.step * 2, tintC * 1.05, tintH).hex
      t.floating = t.nested
      t.line = lch(s.groundL + s.step * 2.6, tintC, tintH).hex
      t.lineStrong = lch(s.groundL + 0.34, tintC, tintH).hex
    } else {
      t.ground = lch(s.groundL, tintC, tintH).hex
      t.card = lch(s.cardL, tintC * 0.25, tintH).hex
      t.nested = lch(s.cardL - s.nestedDelta, tintC * 0.9, tintH).hex
      t.floating = t.card
      t.line = lch(s.groundL - 0.075, tintC, tintH).hex
      t.lineStrong = lch(s.groundL - 0.4, tintC * 1.2, tintH).hex
    }

    // Text: checked against the darkest/lightest surface it may sit on
    const textBgs = [t.ground, t.card, t.nested]
    const dir = dark ? 1 : -1
    t.ink = ensureContrast(s.inkL, tintC * 0.6, tintH, textBgs, 12, dir).hex
    t.ink2 = ensureContrast(s.ink2L, tintC * 1.2, tintH, textBgs, 4.5, dir).hex
    t.ink3 = ensureContrast(s.ink3L, tintC * 1.2, tintH, textBgs, 3, dir).hex

    // Brand (primary CTA fill)
    const b = p.brand
    const brand = lch(dark ? b.darkL : b.lightL, b.chroma, b.hue)
    t.brand = brand.hex
    t.onBrand = onColor(brand.hex, b.onBrand, b.hue, tintC)
    t.brandPressed = lch((dark ? b.darkL : b.lightL) + (dark ? -0.06 : -0.06), b.chroma, b.hue).hex
    // Brand used as text/icon on surfaces: always passes 4.5:1
    t.brandInk = ensureContrast(
      dark ? Math.max(b.darkL, 0.7) : Math.min(b.lightL, 0.6),
      b.chroma,
      b.hue,
      textBgs,
      4.5,
      dir,
    ).hex
    t.brandTint = rgba(t.brandInk, dark ? 0.16 : 0.12)
    t.brandTintSolid = over(t.brandInk, dark ? 0.16 : 0.12, t.card)

    // Accent: a second hue (option C) or the brand itself
    const a = p.accent && p.accent.enabled ? p.accent : null
    if (a) {
      const acc = lch(dark ? a.darkL : a.lightL, a.chroma, a.hue)
      t.accent = acc.hex
      t.onAccent = onColor(acc.hex, 'auto', a.hue, tintC)
      t.accentInk = ensureContrast(dark ? a.darkL : Math.min(a.lightL, 0.58), a.chroma, a.hue, textBgs, 4.5, dir).hex
    } else {
      t.accent = t.brand
      t.onAccent = t.onBrand
      t.accentInk = t.brandInk
    }
    t.accentTint = rgba(t.accentInk, dark ? 0.16 : 0.12)

    // Roles that can point at brand or accent
    const role = (r) => (p.roles && p.roles[r] === 'accent' ? 'accent' : 'brand')
    t.select = role('selection') === 'accent' ? t.accentInk : t.brandInk
    t.selectTint = rgba(t.select, dark ? 0.12 : 0.09)
    t.progress = role('progress') === 'accent' ? t.accentInk : t.brandInk
    t.toggle = role('toggles') === 'accent' ? t.accent : t.brand
    t.unit = role('amountUnit') === 'accent' ? t.accentInk : t.ink2
    t.tabTint = role('tabTint') === 'accent' ? t.accentInk : t.brandInk

    // Semantic
    const sem = p.semantic
    // Red turns pink at high lightness, so danger sits lower in dark mode
    const semLDark = { success: 0.76, warning: 0.78, danger: 0.7, info: 0.76 }
    const semScale = { success: 0.95, warning: 1, danger: 1.2, info: 0.65 }
    for (const [name, hue] of [
      ['success', sem.successHue],
      ['warning', sem.warningHue],
      ['danger', sem.dangerHue],
      ['info', sem.infoHue],
    ]) {
      // Text on its own tint over the card must pass 4.5:1
      const semC = sem.chroma * semScale[name]
      const base = ensureContrast(dark ? semLDark[name] : 0.5, semC, hue, textBgs, 4.5, dir)
      const tintA = dark ? 0.15 : 0.11
      const tint = over(base.hex, tintA, t.card)
      const onTint = ensureContrast(base.L, semC, hue, [tint], 4.5, dir)
      t[name] = onTint.hex
      t[name + 'Tint'] = rgba(onTint.hex, tintA)
    }
    const dFill = lch(dark ? 0.56 : 0.52, 0.18, sem.dangerHue)
    t.dangerFill = dFill.hex
    t.onDanger = onColor(dFill.hex, 'auto', sem.dangerHue, tintC)

    // Networks: each its own hue
    const netL = dark ? 0.8 : 0.48
    for (const [name, hue] of Object.entries(p.networks)) {
      const c = ensureContrast(netL, p.networkChroma ?? 0.11, hue, textBgs, 4.5, dir)
      t['net_' + name] = c.hex
      t['net_' + name + 'Tint'] = rgba(c.hex, dark ? 0.18 : 0.13)
    }

    // States and chrome
    t.disabledFill = t.nested
    t.disabledInk = t.ink3
    t.focus = t.select
    t.scrim = dark ? 'rgba(0, 0, 0, 0.55)' : rgba(lch(0.25, tintC, tintH).hex, 0.32)
    t.glass = rgba(dark ? t.card : t.card, dark ? 0.78 : 0.8)
    const shadowHex = lch(dark ? 0.05 : 0.3, tintC * 2, tintH).hex
    const sh = p.shape.shadow
    t.shadow = dark
      ? 'none'
      : sh <= 0
        ? 'none'
        : `0 1px 2px ${rgba(shadowHex, 0.06 * sh * 1.6)}, 0 6px 18px ${rgba(shadowHex, 0.07 * sh * 1.6)}`
    t.shadowFloat = dark
      ? `0 12px 40px rgba(0,0,0,0.55)`
      : `0 2px 6px ${rgba(shadowHex, 0.1)}, 0 18px 48px ${rgba(shadowHex, 0.16)}`
    t.qrBg = '#FFFFFF'
    t.qrInk = '#000000'
    return t
  }

  function onColor(fillHex, pref, hue, tintC) {
    const darkInk = lch(0.2, Math.min(0.03, tintC * 2 + 0.01), hue).hex
    const white = '#FFFFFF'
    if (pref === 'dark') return darkInk
    if (pref === 'light') return white
    return contrast(fillHex, darkInk) >= contrast(fillHex, white) ? darkInk : white
  }

  // ---------------------------------------------------------------------------
  // Presets
  // ---------------------------------------------------------------------------

  const shared = {
    semantic: { successHue: 145, warningHue: 70, dangerHue: 25, infoHue: 238, chroma: 0.13 },
    networkChroma: 0.085,
  }

  const PRESETS = {
    A: {
      id: 'A',
      name: 'Catkin',
      kind: 'Evolution',
      thesis:
        'Today’s Birch, refined. Gold stays the brand, named for the birch catkin, but the primary button now carries dark text so it passes contrast in both modes. Dark mode moves from brown to a warm-neutral charcoal. Light mode leaves beige for birch-bark white.',
      dark: { hue: 80, chroma: 0.006, groundL: 0.195, step: 0.04, inkL: 0.94, ink2L: 0.74, ink3L: 0.55 },
      light: { hue: 100, chroma: 0.006, groundL: 0.957, cardL: 0.997, nestedDelta: 0.035, inkL: 0.23, ink2L: 0.48, ink3L: 0.66 },
      brand: { hue: 84, chroma: 0.135, darkL: 0.8, lightL: 0.76, onBrand: 'auto' },
      // Used only when Second hue is turned on in Tune: leaf green beside the catkin gold
      accent: { enabled: false, hue: 140, chroma: 0.12, darkL: 0.78, lightL: 0.55 },
      roles: { selection: 'brand', progress: 'brand', toggles: 'brand', amountUnit: 'ink', tabTint: 'brand' },
      semantic: { ...shared.semantic, warningHue: 62 },
      networks: { mainnet: 84, testnet4: 238, testnet3: 196, signet: 305 },
      networkChroma: shared.networkChroma,
      shape: { card: 12, nested: 8, button: 12, chip: 16, sheet: 16, ring: 1.5, stroke: 0, shadow: 0.7 },
      type: { display: 'rounded', titleWeight: 600, amountFace: 'rounded', numerals: 'mono', scale: 1 },
      density: { gutter: 24, cardPad: 16, field: 12, space: 1, buttonH: 52, rowH: 73.33 },
      buttons: { utility: 'tinted', utilityColor: 'mixed', tertiary: 'brand', secondary: 'fill', disabled: 'muted', press: 'dim' },
      layout: { footer: 'split', signed: false, received: 'color' },
      chrome: { header: 'shipped', tabbar: 'glass', glass: 1, dim: 1 },
    },
    B: {
      id: 'B',
      name: 'Leaf',
      kind: 'Bolder',
      thesis:
        'The green of the leaf on the app icon becomes the brand. Dark mode is forest at night: near-black with a faint green cast. Success moves to a bluer jade so it never reads as just another brand-colored element. Secondary buttons are outlined.',
      dark: { hue: 152, chroma: 0.012, groundL: 0.188, step: 0.042, inkL: 0.94, ink2L: 0.74, ink3L: 0.55 },
      light: { hue: 140, chroma: 0.009, groundL: 0.957, cardL: 0.997, nestedDelta: 0.035, inkL: 0.23, ink2L: 0.48, ink3L: 0.66 },
      brand: { hue: 136, chroma: 0.12, darkL: 0.78, lightL: 0.5, onBrand: 'auto' },
      // Used only when Second hue is turned on in Tune: autumn amber beside the leaf green
      accent: { enabled: false, hue: 68, chroma: 0.15, darkL: 0.8, lightL: 0.74 },
      roles: { selection: 'brand', progress: 'brand', toggles: 'brand', amountUnit: 'ink', tabTint: 'brand' },
      semantic: { ...shared.semantic, successHue: 172, warningHue: 72 },
      networks: { mainnet: 72, testnet4: 238, testnet3: 200, signet: 305 },
      networkChroma: shared.networkChroma,
      shape: { card: 12, nested: 8, button: 12, chip: 16, sheet: 16, ring: 1.5, stroke: 0, shadow: 0.6 },
      type: { display: 'default', titleWeight: 700, amountFace: 'rounded', numerals: 'mono', scale: 1 },
      density: { gutter: 24, cardPad: 16, field: 12, space: 1, buttonH: 52, rowH: 73.33 },
      buttons: { utility: 'tinted', utilityColor: 'mixed', tertiary: 'brand', secondary: 'outline', disabled: 'muted', press: 'dim' },
      layout: { footer: 'split', signed: false, received: 'color' },
      chrome: { header: 'shipped', tabbar: 'glass', glass: 1, dim: 1 },
    },
    C: {
      id: 'C',
      name: 'Bark',
      kind: 'Bolder',
      thesis:
        'Birch bark at dusk: cool slate grounds and near-monochrome controls. The primary button is the highest-contrast thing on screen, light on dark and dark on light. Autumn amber is the one warm color, kept for Bitcoin amounts, selection and anything that needs attention. Corners are tighter for a more precise, instrument-like feel.',
      dark: { hue: 248, chroma: 0.013, groundL: 0.19, step: 0.042, inkL: 0.95, ink2L: 0.75, ink3L: 0.56 },
      light: { hue: 235, chroma: 0.008, groundL: 0.955, cardL: 0.997, nestedDelta: 0.035, inkL: 0.23, ink2L: 0.48, ink3L: 0.66 },
      brand: { hue: 248, chroma: 0.014, darkL: 0.93, lightL: 0.28, onBrand: 'auto' },
      accent: { enabled: true, hue: 68, chroma: 0.15, darkL: 0.8, lightL: 0.74 },
      roles: { selection: 'accent', progress: 'accent', toggles: 'accent', amountUnit: 'accent', tabTint: 'accent' },
      semantic: { ...shared.semantic, successHue: 140, warningHue: 68 },
      networks: { mainnet: 68, testnet4: 240, testnet3: 198, signet: 305 },
      networkChroma: shared.networkChroma,
      shape: { card: 8, nested: 6, button: 8, chip: 6, sheet: 12, ring: 1.5, stroke: 1, shadow: 0.35 },
      type: { display: 'default', titleWeight: 700, amountFace: 'default', numerals: 'mono', scale: 1 },
      density: { gutter: 24, cardPad: 16, field: 12, space: 1, buttonH: 50, rowH: 73.33 },
      buttons: { utility: 'tinted', utilityColor: 'mixed', tertiary: 'accent', secondary: 'outline', disabled: 'muted', press: 'dim' },
      layout: { footer: 'split', signed: false, received: 'color' },
      chrome: { header: 'shipped', tabbar: 'glass', glass: 1, dim: 1 },
    },
    T: {
      id: 'T',
      name: 'Today',
      kind: 'Reference',
      thesis:
        'Shipping Birch Light and Birch Dark from Theme.swift, mapped onto the new component structure for before and after comparison. White text on gold, the shared olive for success and secondary accent, and beige grounds are kept as they are.',
      // Fitted so the generated palette lands within ~0.01 dE of Theme.swift; the exact
      // values live in overrides until a color control is edited
      dark: { hue: 78, chroma: 0.015, groundL: 0.207, step: 0.036, inkL: 0.803, ink2L: 0.703, ink3L: 0.317 },
      light: { hue: 72.6, chroma: 0.017, groundL: 0.901, cardL: 0.95, nestedDelta: 0.05, inkL: 0.242, ink2L: 0.407, ink3L: 0.598 },
      brand: { hue: 86.667, chroma: 0.136, darkL: 0.751, lightL: 0.642, onBrand: 'light' },
      // Used only when Second hue is turned on in Tune: the olive Theme.swift calls secondaryAccent
      accent: { enabled: false, hue: 125, chroma: 0.06, darkL: 0.6, lightL: 0.47 },
      roles: { selection: 'brand', progress: 'brand', toggles: 'brand', amountUnit: 'ink', tabTint: 'brand' },
      semantic: { ...shared.semantic },
      networks: { mainnet: 84, testnet4: 130, testnet3: 130, signet: 305 },
      networkChroma: shared.networkChroma,
      shape: { card: 12, nested: 8, button: 12, chip: 16, sheet: 12, ring: 1.5, stroke: 0, shadow: 0.6 },
      type: { display: 'rounded', titleWeight: 500, amountFace: 'rounded', numerals: 'mono', scale: 1 },
      density: { gutter: 24, cardPad: 16, field: 12, space: 1, buttonH: 52.29, rowH: 73.33 },
      buttons: { utility: 'tinted', utilityColor: 'mixed', tertiary: 'brand', secondary: 'fill', disabled: 'muted', press: 'dim' },
      layout: { footer: 'split', signed: false, received: 'color' },
      chrome: { header: 'shipped', tabbar: 'glass', glass: 1, dim: 1 },
      // Exact Theme.swift values (birchDark / birchLight + the ground/card/nested role swap)
      overrides: {
        dark: {
          ground: '#1A1814', card: '#242018', nested: '#2E2820', floating: '#2E2820',
          line: '#2E2820', lineStrong: '#3D3530', ink: '#EDE8DF', ink2: '#A89E92', ink3: '#6F675E',
          brand: '#D4A835', onBrand: '#FFFFFF', brandPressed: '#B8912B', brandInk: '#D4A835',
          brandTint: 'rgba(212, 168, 53, 0.12)', accent: '#D4A835', onAccent: '#FFFFFF', accentInk: '#D4A835',
          accentTint: 'rgba(212, 168, 53, 0.12)', select: '#D4A835', selectTint: 'rgba(212, 168, 53, 0.12)',
          progress: '#D4A835', toggle: '#D4A835', tabTint: '#D4A835', unit: '#A89E92',
          success: '#6A7A52', successTint: 'rgba(106, 122, 82, 0.12)', info: '#6A7A52', infoTint: 'rgba(106, 122, 82, 0.12)',
          danger: '#B03C28', dangerTint: 'rgba(176, 60, 40, 0.12)', dangerFill: '#B03C28', onDanger: '#FFFFFF',
          warning: '#D4A835', warningTint: 'rgba(212, 168, 53, 0.12)',
          net_mainnet: '#D4A835', net_testnet4: '#6A7A52', net_testnet3: '#8B9875', net_signet: '#AF52DE',
          net_mainnetTint: 'rgba(212, 168, 53, 0.15)', net_testnet4Tint: 'rgba(106, 122, 82, 0.15)',
          net_testnet3Tint: 'rgba(106, 122, 82, 0.1)', net_signetTint: 'rgba(175, 82, 222, 0.15)',
          disabledFill: '#3D3530', disabledInk: '#EDE8DF', shadow: 'none',
          hero: '#242018', border: '#3D3530', purple: '#BF5AF2', sysGreen: '#30D158', orange: '#E6804D', teal: '#4DB3B3',
        },
        light: {
          ground: '#E3DDD3', card: '#F2EEE6', nested: '#E3DDD3', floating: '#F2EEE6',
          line: '#E3DDD3', lineStrong: '#B0A99D', ink: '#231F1B', ink2: '#4F4840', ink3: '#8A8278',
          brand: '#B28622', onBrand: '#FFFFFF', brandPressed: '#9A741C', brandInk: '#B28622',
          brandTint: 'rgba(178, 134, 34, 0.12)', accent: '#B28622', onAccent: '#FFFFFF', accentInk: '#B28622',
          accentTint: 'rgba(178, 134, 34, 0.12)', select: '#B28622', selectTint: 'rgba(178, 134, 34, 0.12)',
          progress: '#B28622', toggle: '#B28622', tabTint: '#B28622', unit: '#4F4840',
          success: '#475F39', successTint: 'rgba(71, 95, 57, 0.12)', info: '#475F39', infoTint: 'rgba(71, 95, 57, 0.12)',
          danger: '#992E1F', dangerTint: 'rgba(153, 46, 31, 0.12)', dangerFill: '#992E1F', onDanger: '#FFFFFF',
          warning: '#B28622', warningTint: 'rgba(178, 134, 34, 0.12)',
          net_mainnet: '#B28622', net_testnet4: '#475F39', net_testnet3: '#6B7D60', net_signet: '#AF52DE',
          net_mainnetTint: 'rgba(178, 134, 34, 0.15)', net_testnet4Tint: 'rgba(71, 95, 57, 0.15)',
          net_testnet3Tint: 'rgba(71, 95, 57, 0.1)', net_signetTint: 'rgba(175, 82, 222, 0.15)',
          disabledFill: '#B0A99D', disabledInk: '#FFFFFF',
          hero: '#E3DDD3', border: '#B0A99D', purple: '#AF52DE', sysGreen: '#34C759', orange: '#E6804D', teal: '#4DB3B3',
        },
      },
    },
  }

  // Token reference: name -> role, plus the Theme.swift name it replaces
  const TOKEN_DOCS = [
    ['ground', 'Screen and sheet background', 'hbBackground, hbSheet'],
    ['card', 'Card fill, grouped rows, secondary button fill', 'hbSurface'],
    ['nested', 'Fields, segmented track and rows inside a card', 'hbSurfaceElevated'],
    ['floating', 'Menus and popovers above content', 'hbFloating'],
    ['line', 'Hairline dividers between rows', 'hbDivider'],
    ['lineStrong', 'Outlined button and control borders (3:1 or more)', 'hbBorder'],
    ['ink', 'Primary text and icons', 'hbTextPrimary'],
    ['ink2', 'Secondary text: labels, metadata (4.5:1 or more)', 'hbTextSecondary'],
    ['ink3', 'Placeholder and disabled text', 'new: hbTextTertiary'],
    ['brand', 'Primary button fill, toggles on', 'hbBitcoinOrange (as fill)'],
    ['onBrand', 'Text and icons on brand fill', 'new: hbOnBrand (replaces .white)'],
    ['brandInk', 'Brand as text or icon on surfaces (4.5:1 or more)', 'hbBitcoinOrange (as text)'],
    ['brandTint', 'Tonal button and chip fill', 'hbBitcoinOrange.opacity(0.12)'],
    ['accent', 'Second hue: Bitcoin amounts, selection, attention (C only)', 'new: hbAccent'],
    ['accentInk', 'Accent as text or icon (4.5:1 or more)', 'new: hbAccentInk'],
    ['select', 'Selection ring and selected radio', 'birchSelected ring'],
    ['success', 'Confirmed, verified, signed', 'hbSuccess'],
    ['warning', 'Needs a closer look, unconfirmed', 'new: hbWarning (was hbBitcoinOrange)'],
    ['danger', 'Errors and destructive actions', 'hbError'],
    ['info', 'Neutral information callouts', 'hbSteelBlue (retired)'],
    ['net_mainnet', 'Mainnet badge', 'NetworkBadge .mainnet'],
    ['net_testnet4', 'Testnet4 badge', 'NetworkBadge .testnet4'],
    ['net_testnet3', 'Testnet3 badge', 'NetworkBadge .testnet3'],
    ['net_signet', 'Signet badge', 'NetworkBadge .signet (was .purple)'],
  ]

  const api = { lch, contrast, over, rgba, derive, PRESETS, TOKEN_DOCS, hexToRgb, toHex }
  if (typeof module !== 'undefined' && module.exports) module.exports = api
  else root.BirchTokens = api
})(typeof window !== 'undefined' ? window : globalThis)
