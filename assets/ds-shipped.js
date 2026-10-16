/*
 * Birch screens as shipped. Each builder mirrors one SwiftUI view in
 * birch/Views (same stacks, paddings, spacing and fonts) on the 402x874pt
 * iPhone 17 Pro canvas. Content matches the fastlane screenshots one-to-one.
 *
 * Every design value goes through a Tune variable, so each preset and every
 * Tune control reaches the real app layout. With the Today preset the
 * variables equal the shipped values:
 *
 *   --ts       text size scale (Dynamic Type)      1
 *   --w-title  hbDisplay title weight              500
 *   --gutter   screen margin                       24px  (list and header insets are 8pt less)
 *   --pad      card padding                        16px
 *   --fpad     field padding                       12px
 *   --sp       vertical spacing scale              1
 *   --btn-h    primary button height               52.29px
 *   --row-h    transaction row height              73.33px
 *   --ring     selection ring width                1.5px
 *   --r-card, --r-nested, --r-btn, --r-chip, --r-sheet   radii
 *   --tert     tertiary text-link color; --u-purple / --u-brand / --u-info utility colors
 *
 * Symbols are real SF Symbols rendered by design/tools/build-assets.py into
 * ds-assets.js; Y('name:size:weight') places one. Keys are grepped from this
 * file, so add new symbols with that exact call shape.
 */
;(function (root) {
  'use strict'

  const A = () => root.BirchAssets || { sym: () => '', cls: () => '', size: () => ({ w: 0, h: 0 }), status: '', battDark: '', battLight: '', qr: {} }
  const Y = (k) => A().sym(k)
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  const c = (key, label) => ` data-c="${esc(key)}" data-cl="${esc(label)}"`

  /** Vertical spacing that follows the spacing scale */
  const S = (n) => `calc(${n}px * var(--sp))`
  /** The 16pt insets UIKit lists and the Send header use, tied to the screen margin */
  const M16 = 'calc(var(--gutter) - 8px)'

  const FACE = { r: 'var(--f-display)', a: 'var(--f-amount)', d: 'var(--f-text)', m: 'var(--f-mono)' }
  const COLOR = {
    ink: 'var(--ink)', ink2: 'var(--ink2)', brand: 'var(--brandInk)', info: 'var(--info)', success: 'var(--success)',
    danger: 'var(--danger)', on: 'var(--onBrand)', border: 'var(--border)', purple: 'var(--purple)', green: 'var(--sysGreen)',
    // Gold amounts and selection in the app follow the preset's amount and selection roles
    amt: 'var(--unitFlow)', select: 'var(--select)',
    // Text links: forward actions take the tertiary color, copy and paste the utility info color
    tert: 'var(--tert)', link2: 'var(--u-info)',
  }
  /** Weight 'W' is the hbDisplay title weight from Tune */
  const F = (face, size, weight = 400) => `font:${weight === 'W' ? 'var(--w-title)' : weight} calc(${size}px * var(--ts)) ${FACE[face]}`
  /** One SwiftUI Text: face r(ounded) a(mount) d(efault) m(ono), size, weight, color */
  const T = (text, face, size, weight, color, extra = '', cls = '') =>
    `<span class="t ${cls}" style="${F(face, size, weight)};color:${COLOR[color] || color};${/line-height/.test(extra) ? '' : /\btw\b/.test(cls) ? 'line-height:1.1934;' : D.chrome === 'ipad' ? IPAD_LH : ''}${extra}">${text}</span>`
  /** A wrapped paragraph ('tw') is one view, so its lines keep the font's exact height. A single line rounds up
   *  to the device pixel: on the 2x iPad to a half point; the 3x screens match WebKit's 'normal' */
  const IPAD_LH = 'line-height:round(up, 1.1934em, 0.5px);'
  /** The system's grouped lists keep WebKit's line height on every device (their spacing is matched around it) */
  const NLH = 'line-height:normal'

  /** String.chunkedAddressText: groups of four, alternating primary/secondary */
  function addr(s) {
    const g = s.match(/.{1,4}/g) || []
    // Spaces are bare Text(" ") in the app, so they take the default 17pt SF Pro, not the mono face
    return g.map((x, i) => `<span style="color:${i % 2 ? 'var(--ink2)' : 'var(--ink)'}">${x}</span>`).join('<span class="t-sp"> </span>')
  }

  // ---------------------------------------------------------------------------
  // System chrome
  // ---------------------------------------------------------------------------

  // ---------------------------------------------------------------------------
  // Devices
  // ---------------------------------------------------------------------------

  /**
   * The devices the screens are built for, in points, each matching its own simulator screenshots.
   * top, end and bottom are the safe-area insets the app lays out inside: the iPhone's status bar and
   * home indicator; the Duo's trailing column, which holds the clock and a vertical tab bar (the Duo
   * has no top inset, open or closed); the iPad's status bar and floating tab bar. `layout` is the
   * setup wizard's SetupLayout there: compact (one full-width column), column (a centered 600pt
   * column) or twoColumn (split at the fold). tabClear is the space a tab's scroll view keeps clear at
   * the bottom for the tab bar, fixBottom the space a screen that doesn't scroll keeps clear there, and
   * navTop where a pushed screen's navigation bar starts. fold is the open Duo's fold: [center, width].
   * sendFiat is the amount being sent in fiat at that price.
   * page is a page sheet that doesn't span the screen: its width, centered, and its top and bottom insets.
   * wizTop is the full-screen setup wizard's top inset where it differs from top (the iPad has no tab bar there).
   * form is the iPad's form sheet, centered on the screen. version is the build its screenshots show. fiat and age are
   * the balance's fiat value and the refresh age each device's screenshots show. Builders read
   * the device being built from D.
   */
  const DEVICES = [
    { id: 'iphone', label: 'iPhone 17 Pro', w: 402, h: 874, scale: 3, radius: 51, shot: 'iPhone 17 Pro', top: 62, end: 0, bottom: 34, tabClear: 83, fixBottom: 83, navTop: 62, scanSide: 279.4, biometry: 'Face ID', medium: 469.7, chrome: 'iphone', layout: 'compact' },
    { id: 'duo-closed', label: 'iPhone Duo, closed', w: 466, h: 678, scale: 3, radius: 36, shot: 'iPhone Duo (Closed)', top: 0, end: 84, bottom: 34.67, tabClear: 0, fixBottom: 34.67, navTop: 28, scanSide: 190, biometry: 'Touch ID', medium: 390, chrome: 'duo', layout: 'compact', status: [396.667, 85.667], tabs: 392 },
    { id: 'duo-open', label: 'iPhone Duo, open', w: 951, h: 669, scale: 3, radius: 36, shot: 'iPhone Duo (Open)', top: 0, end: 84, bottom: 34.67, tabClear: 0, fixBottom: 34.67, navTop: 28, scanSide: 181, biometry: 'Touch ID', medium: 385, fiat: '$ 167.90', sendFiat: '$ 61.69', age: '2s', chrome: 'duo', layout: 'twoColumn', fold: [475.67, 40], homeIndicator: true, page: { w: 653, top: 8, bottom: 0 }, status: [881.667, 33], tabs: 383 },
    { id: 'ipad', label: 'iPad Pro 13-inch, portrait', w: 1032, h: 1376, scale: 2, radius: 18, shot: 'iPad Pro 13-inch (M5)', top: 86, end: 0, bottom: 20, tabClear: 20, fixBottom: 20, navTop: 86, scanSide: 500, biometry: 'Face ID', medium: 741.5, fiat: '$ 167.90', sendFiat: '$ 61.69', age: '2s', page: { w: 928, top: 32, bottom: 32 }, form: { w: 580, h: 660 }, wizTop: 32, version: '0.23 (29)', chrome: 'ipad', layout: 'column' },
  ]
  /** How far a floating sheet's content keeps in from its trailing edge beyond the margin: on the Duo the
   *  sheet spans the side column but its content stops at the safe area */
  const sheetEnd = () => (D.chrome === 'duo' && !D.page ? D.end - 8 : 0)
  const deviceOf = (id) => DEVICES.find((d) => d.id === id) || DEVICES[0]
  let D = DEVICES[0]

  function statusBar(mode) {
    const a = A()
    const mask = (url) => `-webkit-mask-image:url(${url});mask-image:url(${url})`
    // The Duo's status sits in its side column: the clock, Wi-Fi and signal in the label color, the
    // battery ring in system green and the charging bolt in the label color at 50%
    if (D.chrome === 'duo') {
      const d = a.duo || {}
      return `<div class="sb-duo" style="left:${D.status[0]}px;top:${D.status[1]}px"><i style="${mask(d.ring)};background:#34C759"></i><i style="${mask(d.bolt)};background:var(--sysInk);opacity:.5"></i><i style="${mask(d.ink)};background:var(--sysInk)"></i></div>`
    }
    if (D.chrome === 'ipad') {
      const p = a.ipad || {}
      return `<div class="sb sb-ipad"><i class="sb-glyphs" style="${mask(p.mask)}"></i><i class="sb-batt" style="background-image:url(${p[mode]})"></i></div><i class="ipad-grip" style="${mask(p.grip)}"></i>`
    }
    return `<div class="sb"><i class="sb-glyphs" style="${mask(a.status)}"></i><i class="sb-batt" style="background-image:url(${mode === 'dark' ? a.battDark : a.battLight})"></i></div>`
  }

  // Tab centers and selected-pill widths measured from the simulator (pt, bar-relative)
  const TABS = [
    ['Transactions', 'list.bullet.rectangle.fill:24:regular', 56.5, 107],
    ['Send', 'arrow.up.right:24:regular', 130.8, 80],
    ['Receive', 'arrow.down.left:24:regular', 191.6, 80],
    ['UTXOs', 'bitcoinsign.circle.fill:24:regular', 253, 80],
    ['Settings', 'gearshape.fill:24:regular', 314.8, 80],
  ]
  function tabbar(active) {
    if (D.chrome === 'duo') return sideTabbar(active)
    if (D.chrome === 'ipad') return topTabbar(active)
    const on = TABS.find((t) => t[0] === active)
    const pill = on ? `<i class="tabpill" style="left:${on[2] - on[3] / 2}px;width:${on[3]}px"></i>` : ''
    const items = TABS.map(([label, sym, cx]) => {
      const s = A().size(sym)
      return `<span class="tab${label === active ? ' on' : ''}" style="left:${cx}px">
        <i class="sy ${A().cls(sym)}" style="left:${-s.w / 2}px;top:${24 - s.h / 2}px"></i><span style="transform:translateX(-50%)">${label}</span></span>`
    }).join('')
    return `<nav class="tabbar"${c('tabbar', 'Tab bar')}>${pill}${items}</nav>`
  }

  /** The Duo's tab bar: a vertical Liquid Glass capsule in the side column, icons only, 50pt apart, the
   *  selected tab in a recessed capsule */
  function sideTabbar(active) {
    const on = TABS.findIndex((t) => t[0] === active)
    const items = TABS.map(([label, sym], i) => {
      const s = A().size(sym)
      return `<span class="vtab${i === on ? ' on' : ''}" style="top:${30.83 + 50 * i}px"><i class="sy ${A().cls(sym)}" style="left:${-s.w / 2}px;top:${-s.h / 2}px"></i></span>`
    }).join('')
    const pill = on >= 0 ? `<i class="vtabpill" style="top:${30.83 + 50 * on - 29.5}px"></i>` : ''
    return `<nav class="vtabbar" style="left:${D.w - D.end + 11.67}px;top:${D.tabs}px"${c('tabbar', 'Tab bar')}>${pill}${items}</nav>`
  }

  /** The iPad's tab bar: a floating Liquid Glass capsule centered under the status bar, labels only, the
   *  selected tab in an inner capsule */
  function topTabbar(active) {
    return `<nav class="htabbar"${c('tabbar', 'Tab bar')}>${TABS.map(([label]) => `<span class="htab${label === active ? ' on' : ''}">${label}</span>`).join('')}</nav>`
  }

  /** WalletIdenticon: 4x4 cells, palette slot + opacity, sampled from the shipped wallet */
  const IDENT = [
    ['o', 0.6], ['p', 0.85], ['o', 0.65], ['i', 0.8],
    ['g', 0.65], ['g', 0.8], ['p', 0.95], ['o', 0.75],
    ['g', 0.55], ['g', 0.9], ['g', 0.7], ['s', 1],
    ['t', 0.85], ['t', 0.95], ['p', 0.7], ['s', 0.95],
  ]
  const IDENT_COLOR = { g: 'var(--brand)', i: 'var(--info)', s: 'var(--success)', p: 'var(--purple)', o: 'var(--orange)', t: 'var(--teal)' }
  function identicon(size) {
    const cells = IDENT.map(([k, o], i) => `<rect x="${i % 4}" y="${Math.floor(i / 4)}" width="1" height="1" style="fill:${IDENT_COLOR[k]};fill-opacity:${o}"/>`).join('')
    return `<span style="width:${size}px;height:${size}px;border-radius:6px;overflow:hidden;display:block;flex:none"><svg viewBox="0 0 4 4" width="${size}" height="${size}" shape-rendering="crispEdges" style="display:block">${cells}</svg></span>`
  }

  function qrSVG(bits) {
    if (!bits) return ''
    const n = bits.length
    let d = ''
    bits.forEach((row, y) => {
      for (let x = 0; x < n; x++) if (row[x] === '1') d += `M${x} ${y}h1v1h-1z`
    })
    return `<svg viewBox="-1 -1 ${n + 2} ${n + 2}" shape-rendering="crispEdges"><rect x="-1" y="-1" width="${n + 2}" height="${n + 2}" fill="#fff"/><path d="${d}" fill="#000"/></svg>`
  }

  // ---------------------------------------------------------------------------
  // Shared pieces
  // ---------------------------------------------------------------------------

  /** Send tab header: "Send" in hbAmountLarge, ellipsis only on the recipients step */
  function sendHeader(withMenu) {
    return `<div class="row" style="padding:8px ${M16} 4px;height:${withMenu ? 56 : 54.95}px;align-items:center">
      ${T('Send', 'a', 36, 700, 'ink', '', '')}<span class="sp"></span>
      ${withMenu ? `<span style="width:44px;height:44px;display:grid;place-items:center;color:var(--ink2)"${c('send-menu', 'Send menu')}>${Y('ellipsis:20:regular')}</span>` : ''}
    </div>`
  }

  /** SendFlowView: the header stays put and each step scrolls beneath it, down to the tab bar */
  function sendScreen(withMenu, body, after = '') {
    const top = D.top + (withMenu ? 56 : 54.95)
    return `<div class="sx-head" style="position:absolute;top:${D.top}px;left:0;right:${D.end}px;z-index:5;background:var(--ground)">${sendHeader(withMenu)}</div>
      <div class="sx" style="top:${top}px;right:${D.end}px">${body}<div style="height:${D.tabClear}px"></div></div>${tabbar('Send')}${after}`
  }

  /** SendStepIndicator: four 3pt bars with 9pt labels */
  function steps(current) {
    const names = ['Recipients', 'Review', 'Sign', 'Broadcast']
    return `<div class="row" style="gap:4px;align-items:flex-start"${c('send-steps', 'Send step indicator')}>${names
      .map(
        (n, i) => `<div class="col cx" style="flex:1 1 0;gap:4px">
          <i style="display:block;width:100%;height:3px;border-radius:2px;background:${i <= current ? 'var(--progress)' : 'var(--border)'}"></i>
          ${T(n, 'd', 9, 500, i <= current ? 'var(--progress)' : 'ink2')}</div>`,
      )
      .join('')}</div>`
  }

  function reviewItem(label, content, key) {
    return `<div class="col" style="gap:${S(6)};align-items:flex-start"${key ? c(key, label) : ''}>${T(label, 'd', 13, 400, 'ink2')}${content}</div>`
  }

  /** PSBTVerificationBadge / ChangeVerificationBadge (VerificationChip) */
  function chip(title, detail, key) {
    return `<div class="row" style="gap:10px;align-items:flex-start;padding:calc(var(--fpad) - 2px);border-radius:var(--r-nested);background:color-mix(in srgb, var(--success) 8%, transparent);width:100%"${c(key, title)}>
      <span style="color:var(--success);display:flex">${Y('checkmark.shield.fill:14:regular')}</span>
      <div class="col" style="gap:4px;flex:1">${T(title, 'd', 13, 400, 'ink')}${T(detail, 'd', 11, 400, 'ink2', '', 'tw')}</div></div>`
  }

  function sigSlots(collected, required) {
    let h = ''
    for (let i = 0; i < required; i++) {
      h += `<span style="width:48px;height:48px;border-radius:max(0px, calc(var(--r-nested) - 2px));display:grid;place-items:center;background:var(--card);box-shadow:inset 0 0 0 1px var(--border)">${T(String(i + 1), 'm', 14, 400, 'ink2', '', 'amt')}</span>`
    }
    return `<div class="col cx" style="gap:${S(8)}"${c('sig-slots', 'Signature progress')}><div class="row" style="gap:8px">${h}</div>${T(`${collected} of ${required} required signatures`, 'd', 13, 400, 'ink2')}</div>`
  }

  /** Setup wizard ProgressBarView: 4pt segments, one per step of creating a wallet, gold up to the current step */
  function wizardProgress(done, total = 3, end = 0) {
    return `<div class="row" style="gap:4px;padding:8px calc(var(--gutter) + ${end}px) 0 var(--gutter)"${c('wizard-progress', 'Setup progress bar')}>${Array.from(
      { length: total },
      (_, i) => `<i style="flex:1;height:4px;border-radius:2px;background:${i < done ? 'var(--progress)' : 'var(--border)'}"></i>`,
    ).join('')}</div>`
  }

  /** Icon + label text link (SwiftUI Label in a plain Button) */
  const link = (icon, label, color, key) => `<span class="row" style="gap:7px;color:${COLOR[color]}"${c(key, label)}>${Y(icon)}${T(label, 'd', 14, 400, color)}</span>`

  /** Compact button height: hbHeadline with 14pt vertical padding, 4pt under the full-width primary */
  const COMPACT_H = 'calc(var(--btn-h) - 3.96px)'

  /** Setup-wizard footer: Back on the left, a compact primary on the right (or stacked, from Tune).
   *  Back is hbCompactSecondaryButton, the height of the primary. The primary is hbCompactPrimaryButton:
   *  'enabled'; 'disabled', hbBorder with white text like hbPrimaryButton(isEnabled: false); or
   *  'outline', brand border and text with no fill, for a step that isn't finished but can still be tapped.
   *  true and false stand for 'disabled' and 'enabled'. */
  const wizFooter = (back, next, state = 'enabled') => {
    const st = state === true ? 'disabled' : state === false ? 'enabled' : state
    const filled = st === 'enabled'
    return `<div class="row wizfoot" style="gap:16px;padding:0 var(--gutter) ${S(32)}">
      <span class="row wizback sbtn" style="min-height:${COMPACT_H};padding:0 32px"${c('back', back + ' button')}>${T(back, 'r', 17, 600, 'currentColor')}</span><span class="sp"></span>
      <span class="row wiznext${filled ? '' : ' is-' + st}" style="min-height:${COMPACT_H};padding:0 ${st === 'outline' ? 30.5 : 32}px;border-radius:var(--r-btn)${filled ? ';background:var(--brand)' : ''}"${c('primary-cta', next + (filled ? ' button' : ` button, ${st === 'outline' ? 'outlined' : st}`))}>${T(next, 'r', 17, 600, filled ? 'on' : 'currentColor')}</span>
    </div>`
  }

  // ---------------------------------------------------------------------------
  // Screens
  // ---------------------------------------------------------------------------

  const TXS = [
    ['out', 'Sent', 'March 29, 2026 at 1:02 AM', '8,717'],
    ['in', 'Received', 'March 29, 2026 at 1:02 AM', '8,754'],
    ['self', 'Self Transfer', 'March 22, 2026 at 2:34 PM', '67,279'],
    ['self', 'Self Transfer', 'March 22, 2026 at 2:34 PM', '5,173'],
    ['out', 'Sent', 'March 20, 2026 at 12:23 AM', '5,455'],
    ['out', 'Sent', 'March 20, 2026 at 12:23 AM', '5,971'],
    ['in', 'Received', 'March 20, 2026 at 12:23 AM', '5,436'],
    ['out', 'Sent', 'March 20, 2026 at 12:23 AM', '2,613'],
    // The rest show on the taller screens
    ['out', 'Sent', 'March 20, 2026 at 12:23 AM', '5,702'],
    ['out', 'Sent', 'March 19, 2026 at 3:44 PM', '6,863'],
    ['out', 'Sent', 'March 19, 2026 at 2:19 PM', '5,456'],
    ['out', 'Sent', 'March 15, 2026 at 10:18 PM', '35,923'],
    ['out', 'Sent', 'March 15, 2026 at 8:21 AM', '25,819'],
    ['in', 'Received', 'March 12, 2026 at 4:07 PM', '141,265'],
    ['out', 'Sent', 'March 11, 2026 at 6:52 PM', '3,217'],
  ]

  function txRow([dir, title, date, amt], i) {
    const icon = { in: 'arrow.down.left:16:semibold', out: 'arrow.up.right:16:semibold', self: 'arrow.triangle.2.circlepath:16:semibold' }[dir]
    const isIn = dir === 'in'
    const amtColor = isIn ? 'var(--success)' : 'var(--ink)'
    const sign = dir === 'in' ? '+' : dir === 'out' ? '−' : ''
    return `<div class="txrow"${c('tx-' + i, `Transaction row: ${title}`)}>
      <span class="txdir" style="color:${amtColor};background:color-mix(in srgb, ${isIn ? 'var(--success)' : 'var(--ink2)'} 10%, transparent)">${Y(icon)}</span>
      <div class="col" style="gap:4px;margin-left:12px">${T(title, 'd', 15, 400, 'ink')}${T(date, 'd', 11, 400, 'ink2')}</div>
      <span class="sp"></span>
      <div class="col" style="gap:4px;align-items:flex-end">
        ${T(`<span class="sgn">${sign}</span>${amt} sats`, 'm', 14, 400, amtColor, '', `amt${isIn ? ' in' : ''}`)}
        <span class="row" style="gap:4px"><span style="color:var(--success);display:flex">${Y('checkmark.circle.fill:10:regular')}</span>${T('6+ conf', 'd', 10, 400, 'ink2')}</span>
      </div>
      <span class="txchev">${Y(D.chrome !== 'iphone' ? 'chevron.right:13.5:semibold' : 'chevron.right:15:semibold')}</span>
    </div>`
  }

  /** The wallet picker as TransactionListView opens it: a 35% black scrim over the screen (the tab bar
   *  stays clear) and a floating panel 60pt below the safe area, 35pt in from each side, its list capped
   *  at 310pt. The active wallet's row takes a 12% brand tint */
  function walletPickerPanel() {
    return `<div style="position:absolute;inset:0;background:rgba(0, 0, 0, 0.35);z-index:30"></div>
      <div class="col" style="position:absolute;left:35px;right:${35 + D.end}px;top:${D.top + 60}px;z-index:35;border-radius:var(--r-card);background:var(--floating);box-shadow:0 4px 24px rgba(0, 0, 0, 0.25);overflow:hidden;align-items:stretch"${c('wallet-picker-panel', 'Wallet picker')}>
        <div class="row" style="padding:12px 14px">${T('Edit', 'd', 15, 400, 'ink2')}<span class="sp"></span>${T('Wallets', 'r', 17, 600, 'ink', LH)}<span class="sp"></span>${T('Add', 'd', 15, 400, 'brand')}</div>
        <div class="divider"></div>
        <div style="height:310px">
          <div class="row" style="gap:12px;padding:15px 14px;background:color-mix(in srgb, var(--brand) 12%, transparent)"${c('wallet-row', 'Wallet row: Birch, active')}>
            ${identicon(32)}
            <div class="col cx" style="gap:4px;flex:none"><span class="nbadge" style="--nb:var(--net_testnet4)">Testnet4</span>${T('1-of-2', 'd', 13, 400, 'ink2')}</div>
            ${T('Birch', 'd', 16, 400, 'ink')}
          </div>
        </div>
      </div>`
  }

  /** SeedlingLoadingView: the eight frames of a birch seed growing into a tree, 120pt square and stacked
   *  (.seedling in ds-shipped.css animates them) */
  function seedling() {
    const frames = [1, 2, 3, 4, 5, 6, 7, 8].map((i) => `<img src="assets/seedling/${i}.webp" alt="" decoding="async">`).join('')
    return `<div class="seedling"${c('seedling', 'Loading: a birch seed growing into a tree')}>${frames}</div>`
  }

  /** SwiftUI's ContentUnavailableView in the system label colors: a 40pt symbol, then the title (20pt bold)
   *  and the description (20pt), which wraps inside the view's own margins */
  function unavailable(icon, title, description, key) {
    return `<div class="col cx" style="align-items:center"${c(key, title)}>
      <span style="color:var(--sysInk2);display:flex">${Y(icon)}</span>
      ${T(title, 'd', 20, 700, 'var(--sysInk)', 'line-height:calc(25px * var(--ts));margin-top:17.67px')}
      ${T(description, 'd', 20, 400, 'var(--sysInk2)', `line-height:calc(25px * var(--ts));max-width:${D.layout === 'compact' ? 'calc(258px * var(--ts))' : 'none'};margin-top:2px`, 'tw')}
    </div>`
  }

  /** SyncStatusDot: an 8pt dot on a 10% tint; syncing adds a 16pt halo at 30% in the brand color, which pulses
   *  (.sync-halo in ds-shipped.css) */
  function syncDot(syncing) {
    const col = syncing ? 'var(--brand)' : 'var(--success)'
    return `<span style="position:relative;width:28px;height:28px;border-radius:50%;display:grid;place-items:center;background:color-mix(in srgb, ${col} 10%, transparent)"${c('sync-dot', syncing ? 'Sync status: syncing' : 'Sync status')}><i style="width:8px;height:8px;border-radius:50%;background:${col}"></i>${
      syncing ? `<i class="sync-halo" style="position:absolute;left:6px;top:6px;width:16px;height:16px;border-radius:50%;background:color-mix(in srgb, ${col} 30%, transparent)"></i>` : ''
    }</span>`
  }

  /** TransactionListView. `state` is 'list' (the shipped screenshot), 'loading' (a new wallet's first sync:
   *  no transactions yet, so the seedling 100pt down) or 'empty' (synced with nothing in it: the No
   *  Transactions view 100pt down, its symbol a further 15.67pt inside it). Both are measured from the
   *  view built in the simulator */
  function home(mode, design, picker = false, state = 'list', age = null) {
    const list = state === 'list'
    const syncing = state === 'loading'
    const status = syncing ? 'Scanning addresses…' : `Last refreshed ${age || D.age || (mode === 'light' && list ? '2s' : '1s')} ago`
    const content = list
      ? `<div class="txlist"${c('tx-list', 'Transaction list')}>${TXS.map(txRow).join('')}</div>`
      : syncing
        ? `<div class="row" style="justify-content:center;padding-top:100.67px">${seedling()}</div>`
        : `<div style="padding-top:115.67px">${unavailable('bitcoinsign.circle:41:regular', 'No Transactions', 'Time to acquire the world’s best money', 'no-transactions')}</div>`
    return `<div class="sx">
      <div style="background:var(--hero);padding:${D.top + 16}px calc(${M16} + ${D.end}px) ${S(16)} ${M16};display:flex;flex-direction:column;gap:${S(12)}"${c('wallet-header', 'Wallet header')}>
        <div class="row" style="height:44px">
          <span style="width:44px;height:44px;display:grid;place-items:center;color:var(--ink2)"${c('wallet-menu', 'Wallet menu')}>${Y('ellipsis:20:regular')}</span>
          <span class="sp"></span>
          <span class="row" style="gap:8px;padding:8px 12px;border-radius:calc(var(--r-chip) * 1.375);background:color-mix(in srgb, var(--ink) 8%, transparent)"${c('wallet-picker', 'Wallet picker')}>
            ${identicon(24)}${T('Birch', 'r', 17, 600, 'ink')}<span style="color:var(--ink2);display:flex">${Y(picker ? 'chevron.up:12:semibold' : 'chevron.down:12:semibold')}</span></span>
          <span class="sp"></span>
          ${syncDot(syncing)}
        </div>
        <div class="col cx" style="gap:2px"${c('balance', 'Balance')}>${T(list ? '193,885 sats' : '0 sats', 'a', 36, 700, 'ink')}${T(list ? D.fiat || '$ 167.85' : '$ 0.00', 'd', 14, 400, 'ink2')}</div>
        <div class="row">
          <span class="nbadge" style="--nb:var(--net_testnet4)"${c('network-badge', 'Network badge')}>Testnet4</span><span class="sp"></span>
          ${T(status, 'd', 11, 400, 'ink2', '', '')}
        </div>
      </div>
      <div style="padding:${S(12)} calc(${M16} + ${D.end}px) ${S(4)} ${M16}">${T('Transactions', 'r', 17, 600, 'ink')}</div>
      <div style="margin-right:${D.end}px">${content}</div>
    </div>${picker ? walletPickerPanel() : ''}${tabbar('Transactions')}`
  }

  const homeLoading = (mode, design) => home(mode, design, false, 'loading')
  const homeEmpty = (mode, design) => home(mode, design, false, 'empty')

  /** A sheet's toolbar as the app draws it: HBBarButtonStyle buttons 21pt down and 16pt in (the
   *  prominent one in the brand fill) around the inline title in the system label color. The sheet's
   *  content starts 70pt down */
  function sheetNav(title, leading, trailing) {
    const btn = (b, side) => (b ? `<span class="barbtn${b.prominent ? ' on' : ''}" style="${side}:${D.form ? 10 : 16}px"${c(b.key, `Bar button: ${b.label}`)}>${b.label}</span>` : '')
    // The Duo sets the title beside the leading button, 2pt lower, and the trailing button against the safe area
    if (D.chrome === 'duo' && !D.page)
      return `<div class="snav lead" style="right:${sheetEnd()}px">${btn(leading, 'left')}<span class="t snavtitle"${c('nav-title', 'Navigation title')}>${title}</span>${trailing ? btn(trailing, 'right').replace('right:16px', 'margin-left:auto') : ''}</div>`
    // A Duo page sheet centers the title, with the Duo's offsets
    return `<div class="snav${D.chrome === 'duo' ? ' low' : ''}">${btn(leading, 'left')}<span class="t snavtitle"${c('nav-title', 'Navigation title')}>${title}</span>${btn(trailing, 'right')}</div>`
  }

  /** A full-height sheet's frame: under the iPhone's status bar; 8pt in from the Duo's top and sides; or a
   *  page sheet centered on the screen */
  const sheetFrame = () =>
    D.page
      ? ` style="top:${D.page.top}px;bottom:${D.page.bottom}px;left:${(D.w - D.page.w) / 2}px;right:auto;width:${D.page.w}px${D.page.bottom ? ';border-radius:var(--r-sheet)' : ''}"`
      : D.chrome === 'duo' ? ' style="top:8px;left:8px;right:8px"' : ''

  /** The full-screen wizard's top inset, and the 40pt the steps add on top in the iPad's readable column */
  const wizTop = () => D.wizTop ?? D.top
  const colTop = () => (D.layout === 'column' ? 40 : 0)

  /** Where a sheet's content starts under its toolbar */
  const sheetTop = () => (D.chrome === 'duo' ? 74 : D.form ? 64 : 70)

  /** BumpFeeView on its first step, a full-height sheet over the transaction: the original fee, the new
   *  rate card (open, as it starts, with Custom prefilled at the minimum) and Create Replacement */
  function bumpFee() {
    const detail = (k, v, color) => `<div class="row">${T(k, 'd', 13, 400, 'ink2')}<span class="sp"></span>${T(v, 'm', 14, 400, color, '', 'amt')}</div>`
    const radio = (on) => `<span style="color:${on ? 'var(--brandInk)' : 'var(--border)'};display:flex">${Y(on ? 'checkmark.circle.fill:18:regular' : 'circle:18:regular')}</span>`
    const preset = (name, rate) =>
      `<div class="row" style="gap:10px;min-height:44px"${c('preset-' + name.toLowerCase(), `Fee preset: ${name}`)}>${radio(false)}${T(name, 'd', 14, 400, 'ink')}<span class="sp"></span>${T(rate, 'm', 13, 400, 'ink', '', 'amt')}</div>`
    // Behind a page sheet, the transaction's screen and the tab bar show dimmed
    const under = D.page ? `<div class="under-dim"><div class="sx"></div>${tabbar('Transactions')}</div><div class="scrim"></div>` : '<div class="sx setup-under" style="background:var(--ground)"></div>'
    // The iPad shows it as a form sheet in the middle of the screen
    const frame = D.form ? ` style="top:${(D.h - D.form.h) / 2}px;bottom:auto;height:${D.form.h}px;left:${(D.w - D.form.w) / 2}px;right:auto;width:${D.form.w}px;border-radius:var(--r-sheet)"` : sheetFrame()
    return `${under}<div class="ssheet${D.form ? ' form' : ''}"${frame}${D.page ? ' data-z="page"' : ''}>${sheetNav('Bump Fee', { label: 'Cancel', key: 'cancel' })}
      <div class="sx" style="top:${sheetTop()}px"><div class="col" style="gap:${S(20)};padding:${S(16)} calc(${M16} + ${sheetEnd()}px) ${S(16)} ${M16};align-items:stretch">
        <div class="hcard col" style="gap:${S(12)};align-items:stretch"${c('original-fee', 'Original fee card')}>
          ${detail('Original Fee', '159 sats', 'ink')}${detail('Original Fee Rate', '0.5 sat/vB', 'ink')}${detail('Minimum to Bump', '1.51 sat/vB', 'brand')}
        </div>
        <div class="hcard col" style="gap:${S(12)};align-items:stretch"${c('new-rate', 'New fee rate card')}>
          <div class="row" style="gap:8px">${T('New Fee Rate', 'd', 13, 400, 'ink2')}<span class="sp"></span>${T('1.51 sat/vB', 'm', 14, 400, 'ink', '', 'amt')}
            <span class="row" style="gap:4px;color:var(--brandInk)"${c('rate-menu', 'Fee preset menu')}>${T('Custom', 'd', 14, 400, 'brand')}${Y('chevron.down:10:semibold')}</span></div>
          <div class="divider"></div>
          <div class="col" style="gap:${S(10)};align-items:stretch">
            ${preset('Fast', '0.1 sat/vB')}${preset('Medium', '0.1 sat/vB')}${preset('Slow', '0.1 sat/vB')}
            <div class="row" style="gap:10px;min-height:44px"${c('preset-custom', 'Fee preset: Custom, selected')}>${radio(true)}${T('Custom', 'd', 14, 400, 'ink')}<span class="sp"></span>
              <span class="nest" style="width:76px;padding:7px 8px;display:flex;justify-content:flex-end"${c('custom-rate', 'Custom rate field')}>${T('1.51', 'm', 14, 400, 'ink', 'line-height:1.1934', 'amt')}</span>${T('sat/vB', 'd', 13, 400, 'ink2')}</div>
          </div>
        </div>
        <div style="padding:0 24px"><span class="pbtn"${c('primary-cta', 'Primary button: Create Replacement')}>Create Replacement</span></div>
      </div></div></div>`
  }

  /** RecipientCard, filled: the label as the card's title, the network chip and the elided address */
  function recipientFilled() {
    return `<div class="card col" style="padding:var(--pad);gap:${S(12)};align-items:stretch"${c('recipient-card', 'Recipient card')}>
        <div class="row" style="gap:9px">
          <div class="col" style="gap:4px;align-items:flex-start">${T('Label · optional', 'd', 11, 400, 'ink2', LH)}
            <span style="position:relative;display:block">${T('Test Transaction', 'd', 16, 600, 'ink', LH)}<i style="position:absolute;left:0;right:0;bottom:-4px;height:1px;background:var(--border)"></i></span></div>
          <span class="sp" style="min-width:8px"></span>
          <span class="t" style="${F('d', 11, 600)};color:var(--net_testnet4);padding:5px 9px;border-radius:var(--r-chip);background:color-mix(in srgb, var(--net_testnet4) 15%, transparent)"${c('network-chip', 'Network chip')}>Testnet4</span>
        </div>
        <div class="row" style="gap:12px">
          <div class="col" style="gap:5px;flex:1;align-items:flex-start"${c('address', 'Recipient address')}>${T('tb1qkmp8 … ystkkazg', 'm', 17, 400, 'ink', 'max-width:100%;overflow:hidden;text-overflow:ellipsis')}${T('Tap to show full address', 'd', 11, 400, 'ink2')}</div>
          <div class="row" style="gap:8px">
            <span class="nest" style="width:40px;height:40px;display:grid;place-items:center;color:var(--ink2)"${c('clear-address', 'Clear address')}>${Y('xmark:14:semibold')}</span>
            <span class="ub" style="--uc:var(--u-brand);--ua:15%;width:40px;height:40px;border-radius:var(--r-nested);display:grid;place-items:center"${c('scan-address', 'Scan address')}>${Y('qrcode.viewfinder:17:semibold')}</span>
          </div>
        </div>
      </div>`
  }

  /** RecipientCard, empty: "Send to" with the Add label link, Scan QR and Paste, and the
   *  "or type an address" button that opens the address field */
  function recipientEmpty() {
    return `<div class="card col" style="padding:var(--pad);gap:${S(12)};align-items:stretch"${c('recipient-card', 'Recipient card')}>
        <div class="row" style="gap:9px">${T('Send to', 'd', 13, 400, 'ink2', LH)}<span class="sp" style="min-width:8px"></span>
          <span style="position:relative;display:block"${c('add-label', 'Add label')}>${T('Add label', 'd', 13, 400, 'ink2', LH)}<i style="position:absolute;left:0;right:0;bottom:-4px;height:1px;background:var(--border)"></i></span></div>
        <div class="col" style="gap:${S(12)};align-items:stretch">
          <div class="row" style="gap:10px">
            <span class="row" style="flex:1 1 0;gap:10px;justify-content:center;min-height:56px;border-radius:var(--r-nested);background:var(--brand);color:var(--onBrand)"${c('scan-qr', 'Scan QR button')}>${Y('qrcode.viewfinder:18:semibold')}${T('Scan QR', 'd', 16, 700, 'on')}</span>
            <span class="row nest" style="flex:1 1 0;justify-content:center;min-height:56px"${c('paste-address', 'Paste button')}>${T('Paste', 'd', 16, 700, 'link2')}</span>
          </div>
          <div class="row" style="justify-content:center;min-height:28px"${c('type-address', 'Type an address')}>${T('or type an address', 'd', 13, 400, 'ink2')}</div>
        </div>
      </div>`
  }

  /** AmountHeroCard. Empty, the TextField shows its "0" placeholder and there is no conversion line.
   *  Holding text, the field measures 1.33pt taller than with only its placeholder (from the screenshots) */
  function amountCard(amount, conversion, spendable) {
    return `<div class="card col" style="padding:calc(var(--pad) + 4px);gap:${S(14)};align-items:stretch"${c('amount-card', 'Amount card')}>
        <div class="row">${T('Amount', 'd', 13, 400, 'ink2')}<span class="sp"></span>
          <div class="row" style="gap:8px">
            <span class="t ub" style="--uc:var(--u-brand);--ua:15%;${F('m', 12, 700)};padding:9px 14px;border-radius:var(--r-chip)"${c('max', 'MAX pill')}>MAX</span>
            <span class="row nest" style="gap:4px;padding:8px 12px;border-radius:var(--r-chip);color:var(--ink)"${c('unit', 'Unit pill')}>${T('sats', 'd', 12, 600, 'ink')}${Y('chevron.up.chevron.down:9:bold')}</span>
          </div></div>
        <div class="row" style="gap:10px;align-items:baseline${amount ? ';padding-bottom:1.33px' : ''}"${c('amount-field', 'Amount field')}>${amount ? T(amount, 'm', 40, 400, 'ink', '', 'amt') : T('0', 'm', 40, 400, 'var(--sysInk3)', '', 'amt')}<span class="sp"></span>${T('sats', 'm', 18, 400, 'ink2', '', 'amt')}</div>
        ${conversion ? `<div class="row" style="gap:10px">${T(conversion[0], 'm', 13, 400, 'ink2', '', 'amt')}<i style="width:3px;height:3px;border-radius:50%;background:var(--border)"></i>${T(conversion[1], 'm', 13, 400, 'ink2', '', 'amt')}</div>` : ''}
        <div class="divider"></div>
        <div class="row">${T('Spendable', 'd', 13, 400, 'ink2')}<span class="sp"></span>${T(spendable, 'm', 13, 400, 'ink', '', 'amt')}</div>
      </div>`
  }

  /** DecisionStack: the Fee row (with the fee preset's badge unless it's custom) and the Coins row */
  function decisionsCard(feeSubtitle, feeBadge) {
    const badge = feeBadge
      ? `<span class="t ub" style="--uc:var(--u-brand);--ua:15%;${F('d', 13, 600)};padding:8px 12px;border-radius:var(--r-chip)"${c('fee-badge', 'Fee preset badge')}>${feeBadge}</span>`
      : ''
    return `<div class="card col" style="align-items:stretch"${c('decisions', 'Fee and coins card')}>
        <div class="row" style="gap:12px;padding:var(--pad) calc(var(--pad) + 2px);min-height:calc(var(--pad) * 4)"${c('fee-row', 'Fee row')}>
          <div class="col" style="gap:4px;flex:1;align-items:flex-start">${T('Fee', 'd', 15, 600, 'ink', LH)}${T(feeSubtitle, 'm', 12, 400, 'ink2', LH, 'amt')}</div>
          ${badge}<span style="color:var(--ink2);display:flex">${Y('chevron.right:13:semibold')}</span></div>
        <div class="divider"></div>
        <div class="row" style="gap:12px;padding:var(--pad) calc(var(--pad) + 2px);min-height:calc(var(--pad) * 4)"${c('coins-row', 'Coins row')}>
          <div class="col" style="gap:4px;flex:1;align-items:flex-start">${T('Coins', 'd', 15, 600, 'ink', LH)}${T('Automatic — optimal UTXOs', 'm', 12, 400, 'ink2', LH, 'amt')}</div>
          <span style="color:var(--ink2);display:flex">${Y('chevron.right:13:semibold')}</span></div>
      </div>`
  }

  /** SendFooter: the total (once there is an amount), Review, and what comes next or what is missing.
   *  Reset appears once anything has been entered. */
  function sendFooter(total, reason) {
    return `<div class="col" style="gap:${S(10)};padding-top:4px;align-items:stretch">
        ${total ? `<div class="row" style="padding:0 4px"${c('total', 'Total with fee')}>${T('Total with fee', 'd', 13, 400, 'ink2')}<span class="sp"></span>${T(total, 'm', 15, 700, 'ink', '', 'amt')}</div>` : ''}
        <span class="pbtn${total ? '' : ' is-disabled'}"${c('primary-cta', total ? 'Primary button: Review' : 'Primary button: Review, disabled')}>Review</span>
        <div class="row" style="justify-content:center">${T(reason, 'd', 12, 400, 'ink2')}</div>
      </div>
      ${total ? `<div class="row" style="justify-content:center;padding-top:4px">${T('Reset', 'd', 14, 400, 'ink2')}</div>` : ''}
      <div style="height:8px"></div>`
  }

  const walletPicker = (mode, design) => home(mode, design, true)

  function sendBody() {
    return `
      <div style="padding-bottom:4px">${steps(0)}</div>
      ${recipientFilled()}
      ${amountCard('71234', ['0.00071234 BTC', '≈ $ 61.67'], '115,823 sats')}
      ${decisionsCard('0.51 sat/vB · 252 sats')}
      ${sendFooter('71,486 sats', 'Next: Review Transaction')}`
  }

  /** The Send tab before anything is entered (SendAmountView with an empty recipient) */
  function sendEmptyBody() {
    return `
      <div style="padding-bottom:4px">${steps(0)}</div>
      ${recipientEmpty()}
      ${amountCard(null, null, '193,885 sats')}
      ${decisionsCard('0.1 sat/vB', 'Medium')}
      ${sendFooter(null, 'Enter an address and amount to continue')}`
  }

  const sendStack = (body) => `<div class="col" style="gap:${S(14)};padding:${S(12)} var(--gutter) 0;align-items:stretch">${body}</div>`

  function send() {
    return sendScreen(true, sendStack(sendBody()))
  }

  function sendEmpty() {
    return sendScreen(true, sendStack(sendEmptyBody()))
  }

  function feeOption(name, rate) {
    return `<div class="card row" style="gap:12px;padding:calc(var(--pad) - 2px) var(--pad);min-height:calc(var(--pad) * 3.5)"${c('fee-' + name.toLowerCase(), `Fee option: ${name}`)}>
      <i style="width:22px;height:22px;border-radius:50%;box-shadow:inset 0 0 0 2px var(--border);flex:none"></i>
      ${T(name, 'r', 17, 600, 'ink')}<span class="sp" style="min-width:8px"></span>${T(rate, 'm', 15, 400, 'ink', '', 'amt')}</div>`
  }

  function fee() {
    return sendScreen(true, sendStack(sendBody().replace(/ data-c="[^"]*" data-cl="[^"]*"/g, '')), `
    <div class="scrim"></div>
    <div class="fsheet fee"${c('fee-sheet', 'Fee sheet')}>
      <i class="grabber"></i>
      <div class="col" style="gap:${S(16)};padding:${S(24)} calc(var(--gutter) + ${sheetEnd()}px) ${S(24)} var(--gutter);align-items:stretch">
        <div class="row" style="align-items:baseline"${c('sheet-title', 'Sheet title')}>${T('Network Fee', 'r', 22, 'W', 'ink')}<span class="sp"></span>${T('~496 vB tx', 'm', 12, 400, 'ink2', '', 'amt')}</div>
        <div class="col" style="gap:${S(10)};align-items:stretch">
          ${feeOption('Fast', '0.1 sat/vB')}${feeOption('Medium', '0.1 sat/vB')}${feeOption('Slow', '0.1 sat/vB')}
          <div class="row sel" style="gap:12px;padding:calc(var(--pad) - 2px) var(--pad);min-height:calc(var(--pad) * 3.875)"${c('fee-custom', 'Fee option: Custom (selected)')}>
            <span style="width:22px;height:22px;border-radius:50%;background:var(--select);color:var(--onAccent);display:grid;place-items:center;flex:none">${Y('checkmark:11:bold')}</span>
            ${T('Custom', 'r', 17, 600, 'ink')}<span class="sp" style="min-width:8px"></span>
            <span class="row" style="gap:8px"><span class="nest" style="width:96px;height:44px;display:grid;place-items:center"${c('custom-rate', 'Custom rate field')}>${T('0.51', 'm', 18, 400, 'ink', '', 'amt')}</span>${T('sat/vB', 'm', 13, 400, 'ink2', '', 'amt')}</span>
          </div>
        </div>
        <div class="row" style="align-items:flex-end;padding-top:4px;position:relative"${c('fee-total', 'Total fee')}>
          <i style="position:absolute;left:0;right:0;top:-10px;height:0.33px;background:var(--border)"></i>
          <div class="col" style="gap:${S(5)};align-items:flex-start">${T('Total fee', 'd', 13, 400, 'ink2')}${T('252 sats', 'm', 17, 700, 'ink', '', 'amt')}</div>
          <span class="sp"></span>${T('≈ $ 0.22', 'm', 12, 400, 'ink2', '', 'amt')}
        </div>
        <span class="pbtn"${c('primary-cta', 'Primary button: Use Custom')}>Use Custom · 0.51 sat/vB</span>
      </div>
    </div>`)
  }

  const TO = 'tb1qkmp8r90rcqpzdm6uqy2034j30csd902ynk35pezwg3sag6604xystkkazg'
  const CHANGE = 'tb1qg56jgtvmc2lx9lzu0xapmq0drnd80udyqmht7d2qjcaxa48q46vst5s6sp'

  function flowDiagram() {
    // TransactionFlowDiagram: 2 inputs, 3 outputs, rowH 28, 1.5pt strokes at 35%. Drawn on the
    // 322pt shipped card width and stretched to the card, so margin and padding changes reflow it
    const w = 322
    const totalH = 3 * 28
    const cx = w / 2
    const mergeY = totalH / 2
    const yAt = (i, n) => (n > 1 ? (totalH - 28 * (n - 1)) / 2 + i * 28 : totalH / 2)
    const stroke = (col) => `style="fill:none;stroke:${col};stroke-opacity:.35;stroke-width:1.5" vector-effect="non-scaling-stroke"`
    let paths = ''
    for (let i = 0; i < 2; i++) {
      const y = yAt(i, 2)
      paths += `<path d="M${cx * 0.45} ${y} C${cx * 0.75} ${y} ${cx * 0.85} ${mergeY} ${cx} ${mergeY}" ${stroke('var(--brand)')}/>`
    }
    const outs = [['Recipient', 'var(--brandInk)'], ['Change', 'var(--info)'], ['Fee', 'var(--ink2)']]
    outs.forEach(([, col], i) => {
      const y = yAt(i, 3)
      paths += `<path d="M${cx} ${mergeY} C${cx * 1.15} ${mergeY} ${cx * 1.25} ${y} ${w - cx * 0.45} ${y}" ${stroke(col)}/>`
    })
    const label = (t, x, y, col) => `<span class="t amt" style="position:absolute;left:${((x / w) * 100).toFixed(3)}%;top:${y}px;transform:translate(-50%,-50%);${F('m', 10)};color:${col}">${t}</span>`
    const labels = [label('Input 1', cx * 0.2, yAt(0, 2), 'var(--ink)'), label('Input 2', cx * 0.2, yAt(1, 2), 'var(--ink)')]
      .concat(outs.map(([t, col], i) => label(t, w - cx * 0.2, yAt(i, 3), col)))
      .join('')
    return `<div class="hcard col" style="gap:${S(8)};align-items:stretch"${c('flow', 'Transaction flow')}>${T('Transaction Flow', 'd', 13, 400, 'ink2')}
      <div style="position:relative;height:${totalH}px"><svg viewBox="0 0 ${w} ${totalH}" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%;overflow:visible">${paths}</svg>${labels}</div></div>`
  }

  const gutterBox = (inner) => `<div style="padding:0 var(--gutter)">${inner}</div>`

  function review() {
    return sendScreen(false, `
      <div class="col" style="gap:${S(24)};padding-top:${S(16)};align-items:stretch">
        ${gutterBox(steps(1))}
        <div class="row" style="justify-content:center"${c('title', 'Screen title')}>${T('Review Transaction', 'r', 22, 'W', 'ink')}</div>
        ${gutterBox(`<div class="hcard col" style="gap:${S(16)};align-items:stretch"${c('review-card', 'Review card')}>
          ${reviewItem('To', `<span class="t tw" style="${F('m', 12)};line-height:normal">${addr(TO)}</span>`, 'to')}
          ${reviewItem('Label', `<span class="row" style="gap:4px"><span style="color:var(--info);display:flex">${Y('tag.fill:10:regular')}</span>${T('Test Transaction', 'd', 16, 400, 'ink')}</span>`, 'label')}
          ${reviewItem('Amount', `<span class="row" style="gap:6px">${T('71,234 sats', 'm', 16, 700, 'amt', '', 'amt')}${T(D.sendFiat || '$ 61.67', 'd', 13, 400, 'ink2')}</span>`, 'amount')}
          ${reviewItem('Change', T('4,443 sats', 'm', 14, 400, 'ink', '', 'amt'), 'change')}
          ${reviewItem('Change Address', `<span class="t tw" style="${F('m', 12)}">${addr(CHANGE)}</span>`, 'change-address')}
          ${reviewItem('Change Derivation Path', T("m/48'/1'/0'/2'/1/2", 'm', 12, 400, 'ink'), 'change-path')}
          ${chip('Change returns to this wallet', 'This wallet derived the address above from its own change keychain, at the path shown.', 'change-verified')}
          ${reviewItem('Fee Rate', T('0.51 sat/vB', 'm', 14, 400, 'ink', '', 'amt'), 'fee-rate')}
          ${reviewItem('Total Fee', `<span class="row" style="gap:6px">${T('159 sats', 'm', 14, 400, 'ink', '', 'amt')}${T('$ 0.14', 'd', 13, 400, 'ink2')}</span>`, 'total-fee')}
          ${reviewItem('Inputs', T('2 UTXOs', 'm', 14, 400, 'ink', '', 'amt'), 'inputs')}
          ${reviewItem('Inputs Amount', T('75,836 sats', 'm', 16, 700, 'ink', '', 'amt'), 'inputs-amount')}
          ${chip('Inputs verified against wallet', '2 inputs match the amounts this wallet has recorded.', 'inputs-verified')}
        </div>`)}
        ${gutterBox(flowDiagram())}
        <div class="row" style="justify-content:center"${c('inspect', 'Inspect PSBT')}>${T('Inspect PSBT', 'd', 14, 400, 'tert')}</div>
        <div style="height:${S(16)}"></div>
        ${gutterBox(`<span class="pbtn"${c('primary-cta', 'Primary button: Show QR for Signing')}>Show QR for Signing</span>`)}
        <div class="row" style="justify-content:center;padding-bottom:${S(32)}"${c('back', 'Back')}>${T('Back', 'd', 16, 400, 'ink2')}</div>
      </div>`)
  }

  function sign(mode) {
    const bits = A().qr && A().qr['psbt_' + mode]
    // PSBTDisplayView: the QR square fills the width, capped at 700pt and at the visible height under the
    // 71.5pt signature progress (less 40pt); beside the Duo's side column it keeps 16pt from each edge
    const qrInset = D.end > 0 ? 16 : 0
    const viewport = D.h - D.top - 54.95 - D.fixBottom
    const side = Math.min(D.w - D.end - 2 * qrInset, 700, Math.max(200, viewport - 71.5 - 40))
    return sendScreen(false, `
      <div class="col" style="gap:${S(16)};padding-top:${S(8)};align-items:stretch">
        ${sigSlots(0, 2)}
        <div class="row" style="justify-content:center;padding:0 ${qrInset}px"><div class="qrbox" style="width:${side}px;height:${side}px;padding:5px"${c('psbt-qr', 'Animated PSBT QR')}><div class="qr" style="width:${side - 10}px;height:${side - 10}px">${qrSVG(bits)}</div></div></div>
        <div class="row" style="justify-content:center">${T('Scan this QR code with your signing device', 'd', 14, 400, 'ink2')}</div>
        <div class="row" style="padding:0 var(--gutter);min-height:24.33px"${c('advanced', 'Advanced disclosure')}>${T('Advanced', 'd', 14, 400, 'ink2')}<span class="sp"></span><span style="color:var(--ink);display:flex">${Y('chevron.right:17:semibold')}</span></div>
        ${gutterBox(`<span class="pbtn"${c('primary-cta', 'Primary button: Scan Signed PSBT')}>Scan Signed PSBT</span>`)}
        <div class="row" style="gap:24px;justify-content:center">
          ${link('square.and.arrow.up:14:regular', 'Export PSBT File', 'tert', 'export')}
          ${link('tray.and.arrow.down.fill:14:regular', 'Save PSBT', 'tert', 'save')}
        </div>
        <div class="row" style="justify-content:center">${link('doc.on.doc:14:regular', 'Copy Base64', 'link2', 'copy-b64')}</div>
        ${gutterBox(`<div class="hcard col" style="gap:${S(16)};align-items:stretch"${c('psbt-summary', 'Transaction summary')}>
          ${reviewItem('To', `<span class="t tw" style="${F('m', 12)}">${addr(TO)}</span>`)}
          ${reviewItem('Label', `<span class="row" style="gap:4px"><span style="color:var(--info);display:flex">${Y('tag.fill:10:regular')}</span>${T('Test Transaction', 'd', 16, 400, 'ink')}</span>`)}
          ${reviewItem('Amount', `<span class="row" style="gap:6px">${T('71,234 sats', 'm', 16, 700, 'amt', '', 'amt')}${T(D.sendFiat || '$ 61.67', 'd', 13, 400, 'ink2')}</span>`)}
          ${reviewItem('Fee Rate', T('0.51 sat/vB', 'm', 14, 400, 'ink', '', 'amt'))}
          ${reviewItem('Total Fee', `<span class="row" style="gap:6px">${T('159 sats', 'm', 14, 400, 'ink', '', 'amt')}${T('$ 0.14', 'd', 13, 400, 'ink2')}</span>`)}
          ${reviewItem('Inputs', T('2 UTXOs', 'm', 14, 400, 'ink', '', 'amt'))}
          ${reviewItem('Inputs Amount', T('75,836 sats', 'm', 16, 700, 'ink', '', 'amt'))}
          ${reviewItem('Change', T('4,443 sats', 'm', 14, 400, 'ink', '', 'amt'))}
          ${reviewItem('Signatures Required', T('2', 'm', 14, 400, 'ink', '', 'amt'))}
        </div>`)}
      </div>`)
  }

  function scan() {
    // URScannerSheet: corners at 70% of its side, 24pt arms, 3pt gold strokes. The scanner is
    // flexible and shares the leftover height with the spacer under it; its side is measured per device
    const side = D.scanSide
    const s = side * 0.7
    const o = (side - s) / 2
    const L = 24
    const d = `M${o} ${o + L}V${o}H${o + L}M${o + s - L} ${o}H${o + s}V${o + L}M${o + s} ${o + s - L}V${o + s}H${o + s - L}M${o + L} ${o + s}H${o}V${o + s - L}`
    return `<div class="sx-head" style="position:absolute;top:${D.top}px;left:0;right:${D.end}px;z-index:5;background:var(--ground)">${sendHeader(false)}</div>
    <div class="sx" style="top:${D.top + 54.95}px;right:${D.end}px;display:flex;flex-direction:column">
      <div class="col" style="gap:${S(24)};padding-top:${S(16)};align-items:stretch;flex:1">
        ${gutterBox(steps(2))}
        <div class="row" style="justify-content:center"${c('title', 'Screen title')}>${T('Scan Signed PSBT', 'r', 22, 'W', 'ink')}</div>
        ${sigSlots(0, 2)}
        <div class="row" style="padding:0 var(--gutter);justify-content:center"${c('camera', 'Camera viewfinder')}><div style="width:${side}px;height:${side}px;border-radius:var(--r-card);overflow:hidden;background:var(--ground)">
          <svg width="${side}" height="${side}"><path d="${d}" style="fill:none;stroke:var(--brand);stroke-width:3"/></svg></div></div>
        <div class="row" style="justify-content:center">${link('doc.badge.arrow.up:14:regular', 'Import PSBT File', 'tert', 'import-file')}</div>
        <div class="row" style="justify-content:center">${link('doc.on.clipboard:14:regular', 'Paste Base64 PSBT', 'link2', 'paste')}</div>
        <span class="sp"></span>
        <div class="row" style="justify-content:center;padding-bottom:${S(32)}"${c('back', 'Back to QR Display')}>${T('Back to QR Display', 'd', 16, 400, 'ink2')}</div>
      </div>
      <div style="height:${D.fixBottom}px;flex:none"></div>
    </div>${tabbar('Send')}`
  }

  /** Setup screens sit in a sheet over the dimmed wallet. SetupWizardView pins the progress bar above the
   *  step's ScrollView, so only the step content scrolls. `step` is [done, total], or null for a step
   *  without the bar. On the iPhone the sheet starts under the status bar; the Duo floats it 8pt in from
   *  the top and sides, under the side column, with its content stopping at the safe area. `full` fills
   *  the screen instead, as the wizard does on first launch. */
  function setupSheet(step, inner, full = false) {
    const end = full ? D.end : D.page ? 0 : D.chrome === 'duo' ? D.end - 8 : 0
    const frame = full ? ` style="top:${wizTop()}px;border-radius:0"` : sheetFrame()
    // ScrollView content keeps the home-indicator inset at the bottom
    const under = full ? '' : D.page ? `<div class="under-dim">${home('dark', 'today', false, 'list', '1m').replace(/ data-c="[^"]*" data-cl="[^"]*"/g, '')}</div><div class="scrim"></div>` : '<div class="sx setup-under"></div>'
    // The iPad keeps the step, its progress bar included, to one centered 600pt readable column
    const col = D.layout === 'column' ? 'max-width:600px;margin-left:auto;' : ''
    return `${under}<div class="ssheet"${frame}${D.page && !full ? ' data-z="page"' : ''}>${step ? `<div style="${col}margin-right:${col ? 'auto' : '0'}">${wizardProgress(...step, end)}</div>` : ''}<div class="sx" style="position:absolute;top:${step ? 12 : 0}px;left:0;right:0;bottom:0;background:var(--ground)"><div style="${col}margin-right:${col ? 'auto' : end + 'px'}">${inner}</div><div style="height:${full || !D.page ? D.bottom : 0}px"></div></div></div>`
  }

  /** The line an empty TextField sizes to whatever its font: the default 17pt body line */
  const EMPTY_LH = 'line-height:calc(20px * var(--ts))'

  /** Where a new-wallet step sits in the progress bar, the only flow that shows one: Multisig
   *  configuration, Import cosigners and Verify are steps 1-3. */
  const NEW_WALLET_STEP = { multisig: [1, 3], cosigner: [2, 3], verify: [3, 3] }

  function disclosureCard(label, key) {
    return `<div class="hcard row" style="gap:8px"${c(key, label)}><span style="color:var(--ink2);display:flex">${Y('chevron.right:12:semibold')}</span>${T(label, 'd', 13, 400, 'ink2', LH)}<span class="sp"></span></div>`
  }

  /** WalletNameNetworkCard: the optional wallet name and the network picker share one card, both labels
   *  leading like form fields. Empty, the name shows the "My Wallet" placeholder the wallet is saved with,
   *  in the system placeholder color. UISegmentedControl takes a 31pt frame and draws its 32pt track 1pt
   *  past it */
  const walletNameNetworkCard = () => `<div class="hcard col" style="gap:${S(16)};align-items:stretch"${c('name-network', 'Wallet name and network card')}>
      <div class="col" style="gap:${S(6)};align-items:stretch"${c('wallet-name', 'Wallet name field')}>
        ${T('Wallet Name', 'd', 13, 400, 'ink2')}
        <div class="nest" style="padding:calc(var(--fpad) + 1px) var(--fpad)">${T('My Wallet', 'd', 16, 400, 'var(--sysInk3)', EMPTY_LH)}</div>
      </div>
      <div class="col" style="gap:${S(8)};align-items:stretch"${c('network', 'Network picker')}>
        ${T('Bitcoin Network', 'd', 13, 400, 'ink2', LH)}
        <div style="height:31px"><div class="seg"${c('network-seg', 'Segmented control')}><span>Mainnet</span><span class="on">Testnet4</span><span>Testnet3</span><span>Signet</span></div></div>
      </div>
    </div>`

  function multisig() {
    return setupSheet(NEW_WALLET_STEP.multisig, `
      <div class="col" style="gap:${S(28)};padding-top:${colTop()}px;align-items:stretch">
        <div class="row" style="justify-content:center;padding-top:${S(16)}"${c('title', 'Setup title')}>${T('Multisig Configuration', 'r', 28, 'W', 'ink', LH)}</div>
        <div class="col cx" style="gap:${S(16)}">
          ${T('How many signatures are required?', 'd', 15, 400, 'ink2')}
          <div class="row" style="gap:12px"${c('quorum', 'M-of-N picker')}>
            <span class="row" style="gap:4px"><span style="color:color-mix(in srgb, var(--brandInk) 70%, transparent);display:flex">${Y('chevron.up.chevron.down:14:bold')}</span>${T('2', 'r', 48, 'W', 'brand', LH)}</span>
            ${T('of', 'd', 20, 400, 'ink2')}
            <span class="row" style="gap:4px">${T('3', 'r', 48, 'W', 'ink', LH)}<span style="color:var(--ink2);display:flex">${Y('chevron.up.chevron.down:14:bold')}</span></span>
          </div>
        </div>
        <div class="col" style="gap:${S(24)};padding:0 var(--gutter);align-items:stretch">
          ${walletNameNetworkCard()}
          ${disclosureCard('Electrum Server', 'electrum')}
          ${disclosureCard('Advanced', 'advanced')}
        </div>
        ${wizFooter('Back', 'Next')}
      </div>`)
  }

  const DESCRIPTOR =
    "wsh(sortedmulti(1,[7a13a7b1/48'/1'/0'/2']tpubDETciRzaZyqww2dSAyT2j6tWgzREyiZEY2iZDPKDtqNpSEqqFS31DZUFFTFnayx7wLUVYx3V1R2AWhhWbFrnCukKZ1kmnn83Fn2xSf7hEaH/<0;1>/*,[30a36b52/48'/1'/0'/2']tpubDF6MPv2vWsbCo8c7rk4X32BPa5yuj4niem5Pr6isrd9cSdCkYETcGUmBSFY4ekTR1CRFmjn4eoYGrwPU19FffwEpX7Tda6BBmg91aiHKpmE/<0;1>/*))"

  /** How many 11pt mono characters (6.6pt each) a line of the descriptor field holds: what the field leaves
   *  after its padding and the 5pt line-fragment insets, 42 on the iPhone. `card` is the card's width */
  function descriptorMax(card = D.w - D.end - 48) {
    // The iPad's editor fits one character fewer than the advance predicts
    return Math.floor((card - 32 - 34 - 10) / 6.6) - (D.chrome === 'ipad' ? 1 : 0)
  }

  /** Keys and descriptors wrap at the character: each line fills to the edge and the next character
   *  starts a new line, whatever it is (CharWrappingTextEditor's .byCharWrapping, or String.charWrapped
   *  in a Text). `chars` caps a line at what the app's text area holds when it is narrower than the box
   *  around it */
  const charWrap = (chars) => `word-break:break-all;line-break:anywhere${chars ? `;max-width:min(100%, calc(${chars}ch + 0.5px))` : ''}`

  /** HBTonalButton, the in-card utilities: equal tonal buttons under a field, brand tint for the
   *  most useful action and neutral for the rest */
  const tonal = (icon, label, neutral, key) =>
    `<span class="tbtn${neutral ? ' neutral' : ''}"${c(key, `Tonal${neutral ? ', neutral' : ''}: ${label}`)}>${Y(icon)}${T(label, 'd', 15, 600, 'currentColor')}</span>`

  /** Import descriptor. Scan QR and Paste sit in the card under the field. Empty, the field keeps its 120pt
   *  minimum and shows the format as its placeholder, and Import is disabled until there is text.
   *  On the open Duo the step splits in two: the step and the settings on the left with Back at the
   *  bottom; the descriptor filling the height on the right, with Import under it */
  function descriptorImport(mode, design, empty = false) {
    const two = D.layout === 'twoColumn'
    const cardW = two ? twoCols()[1][1] - twoCols()[1][0] : Math.min(D.w - D.end, D.layout === 'column' ? 600 : Infinity) - 48
    const text = empty
      ? T('wsh(sortedmulti(M,[fp/path]xpub/0/*,...))', 'm', 11, 400, 'var(--sysInk3)', `${charWrap()};line-height:1.1945`, 'tw')
      : T(esc(DESCRIPTOR), 'm', 11, 400, 'ink', `${charWrap(descriptorMax(cardW))};line-height:1.1945`, 'tw')
    const card = `<div class="hcard col" style="gap:${S(8)};align-items:stretch${two ? ';flex:1 0 auto' : ''}"${c('descriptor', 'Output descriptor')}>
          ${T('Output Descriptor', 'd', 13, 400, 'ink2')}
          <div class="nest" style="padding:calc(var(--fpad) + 8px) calc(var(--fpad) + 5px);min-height:144px${two ? ';flex:1 0 auto' : ''}"${c('descriptor-text', 'Descriptor text editor')}>${text}</div>
          <div class="row" style="gap:8px;margin-top:${S(4)}"${c('descriptor-utilities', 'In-card utilities')}>${tonal('qrcode.viewfinder:15:semibold', 'Scan QR', false, 'scan')}${tonal('doc.on.clipboard:15:semibold', 'Paste', true, 'paste')}</div>
        </div>`
    const settings = [walletNameNetworkCard(), disclosureCard('Electrum Server', 'electrum'), disclosureCard('Advanced', 'advanced')]
    if (two) {
      return twoColumn(
        `<div class="col" style="min-height:100%;gap:${S(16)};padding:${S(16)} 0;align-items:stretch">
          <div${c('title', 'Setup title')}>${T('Import Descriptor', 'r', 28, 'W', 'ink', LH)}</div>
          ${T('Paste or scan a multisig output descriptor', 'd', 15, 400, 'ink2', '', 'tw')}
          ${settings.join('')}${SP16}
          ${wizFooter('Back', 'Import').replace(/<span class="sp"><\/span>[\s\S]*$/, '</div>').replace('padding:0 var(--gutter) ' + S(32), 'padding:0')}
        </div>`,
        `<div class="col" style="min-height:100%;gap:${S(12)};padding:${S(16)} 0;align-items:stretch">${card}
          <span class="pbtn${empty ? ' is-disabled' : ''}"${c('primary-cta', `Primary button: Import${empty ? ', disabled' : ''}`)}>Import</span></div>`,
        D.top,
      )
    }
    // Only the iPhone's screenshot tour reaches Import descriptor in a sheet; elsewhere it's the first-launch wizard
    return setupSheet(null, `
      <div class="col" style="gap:${S(24)};padding-top:calc(${S(16)} + ${colTop()}px);align-items:stretch">
        <div class="row" style="justify-content:center"${c('title', 'Setup title')}>${T('Import Descriptor', 'r', 28, 'W', 'ink', LH)}</div>
        <div class="row" style="justify-content:center">${T('Paste or scan a multisig output descriptor', 'd', 15, 400, 'ink2', 'text-align:center', 'tw')}</div>
        ${gutterBox(card)}
        ${settings.map(gutterBox).join('')}
        ${wizFooter('Back', 'Import', empty)}
      </div>`, D.chrome !== 'iphone')
  }

  const descriptorImportEmpty = (mode, design) => descriptorImport(mode, design, true)

  /** hbFieldError: a field that failed validation gets a 1.5pt error border on its nested fill and the
   *  reason 6pt under it */
  const fieldError = (msg) => (msg ? `<div class="t-ferr" style="margin-top:${S(6)}">${T(msg, 'd', 13, 400, 'danger', 'line-height:1.1934', 'tw')}</div>` : '')

  /** A labeled field. UITextField-backed fields sit 2pt taller than a Text with the same padding, with the
   *  font's unrounded line height. Empty, a TextField shows its placeholder in the system placeholder
   *  color and sizes to the default 17pt body line instead of its own font (EMPTY_LH), until it has held
   *  text: then it keeps its font's line ('held'). `error` flags it */
  function field(label, value, face, size, key, textField = true, placeholder = false, error = null) {
    const lh = placeholder === true ? EMPTY_LH : placeholder === 'held' ? 'line-height:calc(16.67px * var(--ts))' : textField ? 'line-height:1.1934' : ''
    return `<div class="col" style="gap:${S(6)};align-items:stretch"${c(key, label + ' field')}>${T(label, 'd', 13, 400, 'ink2')}
      <div class="col" style="align-items:stretch"><div class="nest${error ? ' ferr' : ''}" style="padding:${textField ? 'calc(var(--fpad) + 1px)' : 'var(--fpad)'} var(--fpad)">${T(value, face, size, 400, placeholder ? 'var(--sysInk3)' : 'ink', lh)}</div>${fieldError(error)}</div></div>`
  }

  const KEY_1 = 'tpubDE2gU1F6b1GXDg2bFjeq6RUnBmAe2moTNG7x47Cga3VnVnm7EJWLdJE73ZL2MEwKTc2dLNeSudXUjexm2xJ5qboosbnEb1SEiGyJtJcqqZK'

  /** Import cosigners: a folder tab per cosigner on top of the open cosigner's form, which runs Label,
   *  Extended Public Key (with Scan QR and Paste under it), Master Fingerprint and Derivation Path. A tab
   *  shows a check once its cosigner's fields all validate. Next is outlined until every cosigner is
   *  complete and is never disabled. `state`: 'empty' (cosigner 1 as the step opens: the label and path
   *  prefilled, the fingerprint showing its placeholder, the key at its 80pt minimum), 'filled' (cosigner 1
   *  complete) or 'errors' (cosigner 1 complete, then Next on cosigner 2 left empty: Next flags its key and
   *  fingerprint) */
  function cosigner(state) {
    const errors = state === 'errors'
    const open = errors ? 2 : 1
    const filled = state === 'filled'
    // The open tab joins the card; a check marks a finished cosigner
    const tab = (i, cur, done) =>
      `<div class="ctab${cur ? ' on' : ''}"${c('tab-' + i, `Cosigner ${i} tab${done ? ', complete' : ''}`)}>
        <span style="display:flex;flex:none;color:${done ? 'var(--success)' : cur ? 'var(--ink)' : 'var(--ink2)'}">${Y(done ? 'checkmark.circle.fill:16:regular' : 'circle:16:regular')}</span>
        ${T(String(i), 'd', 17, cur ? 600 : 400, cur ? 'ink' : 'ink2', 'font-variant-numeric:tabular-nums')}</div>`
    const label = field('Label', `Cosigner ${open}`, 'd', 16, 'label')
    const fingerprint = filled
      ? field('Master Fingerprint (8 hex chars)', '07d25f0c', 'm', 14, 'fingerprint')
      : // On the flagged screen the field held cosigner 1's fingerprint a moment before, so it keeps the mono line
        field('Master Fingerprint (8 hex chars)', 'e.g. 73c5da0a', 'm', 14, 'fingerprint', true, errors ? 'held' : true, errors ? 'Fingerprint is required' : null)
    const path = field('Derivation Path', "m/48'/1'/0'/2'", 'm', 14, 'path', false)
    const toggle = `<span style="color:var(--sysGreen);display:flex"${c('xpub-format', 'Xpub format toggle')}>${Y('arrow.left.arrow.right:14:bold')}</span>`
    const xpub = `<div class="col" style="gap:${S(6)};align-items:stretch"${c('xpub', 'Extended public key')}>
            <div class="row">${T('Extended Public Key', 'd', 13, 400, 'ink2')}<span class="sp"></span>${toggle}</div>
            <div class="col" style="align-items:stretch"><div class="nest${errors ? ' ferr' : ''}" style="padding:calc(var(--fpad) + 8px) calc(var(--fpad) + 5px) var(--fpad);min-height:104px"${c('xpub-text', 'Xpub text editor')}>${filled ? T(KEY_1, 'm', 12, 400, 'ink', `${charWrap()};line-height:1.1934`, 'tw') : ''}</div>${fieldError(errors ? 'Xpub is required' : null)}</div>
            <div class="row" style="gap:8px;margin-top:${S(6)}"${c('xpub-utilities', 'In-card utilities')}>${tonal('qrcode.viewfinder:15:semibold', 'Scan QR', false, 'scan')}${tonal('doc.on.clipboard:15:semibold', 'Paste', true, 'paste')}</div>
          </div>`
    return setupSheet(NEW_WALLET_STEP.cosigner, `
      <div class="col" style="gap:${S(24)};padding-top:calc(${S(16)} + ${colTop()}px);align-items:stretch">
        <div class="row" style="justify-content:center"${c('title', 'Setup title')}>${T('Import Cosigners', 'r', 28, 'W', 'ink', LH)}</div>
        ${gutterBox(`<div class="ctabs"${c('tabs', 'Cosigner tabs')}>${tab(1, open === 1, !(state === 'empty'))}${tab(2, open === 2, false)}${tab(3, false, false)}</div><div class="hcard col ctab-card" style="gap:${S(16)};align-items:stretch"${c('form', 'Cosigner form')}>
          ${[label, xpub, fingerprint, path].join('')}
        </div>`)}
        ${wizFooter('Back', 'Next', 'outline')}
      </div>`)
  }

  const cosignerEmpty = () => cosigner('empty')
  const cosignerFilled = () => cosigner('filled')
  const cosignerErrors = () => cosigner('errors')

  /** Verify wallet: each cosigner's whole key, wrapped at the character on up to three lines. The warning
   *  symbol takes the 22pt frame SwiftUI gives it, a point under the AppKit render's */
  function verify() {
    const rowKV = (k, v) => `<div class="row">${T(k, 'd', 13, 400, 'ink2')}<span class="sp"></span>${T(v, 'd', 15, 400, 'ink')}</div>`
    const cos = [
      ['Cosigner 1', '07d25f0c', KEY_1],
      ['Cosigner 2', 'd73869a4', 'tpubDET5GnMK8Zr7UH63ni72etKd7ZYxVq8NvtSneNBfEDJ7YtnSHUmiPCaBYXzCdR6ZBKWvBMXT3urCVp7sLmG6z8VTpdFRJuW4VL7xjHdLFpY'],
      ['Cosigner 3', 'e3870581', 'tpubDF3GwUrMb5WkigsDUpUWUADH55G3Ez771QujmFqeyrNEPD7onkqTwCsCEjNRbSrbD9VYKDfMHfg7bajem5aEX7CyMp2q5fvQzacy75bUesQ'],
    ]
    // Full-width tinted utility buttons: 14pt vertical padding at the shipped button height
    const utility = (icon, label, color, key) =>
      `<div class="row ub" style="--uc:${color};gap:8px;justify-content:center;padding:calc((var(--btn-h) - 24.33px) / 2) 0;border-radius:max(0px, calc(var(--r-btn) - 2px))"${c(key, label)}>${Y(icon)}${T(label, 'd', 15, 400, 'currentColor')}</div>`
    return setupSheet(NEW_WALLET_STEP.verify, `
      <div class="col" style="gap:${S(24)};padding-top:calc(${S(16)} + ${colTop()}px);align-items:stretch">
        <div class="row" style="justify-content:center"${c('title', 'Setup title')}>${T('Verify Wallet', 'r', 28, 'W', 'ink', LH)}</div>
        ${gutterBox(`<div class="hcard col" style="gap:${S(16)};align-items:stretch"${c('summary', 'Wallet summary')}>
          ${rowKV('Name', 'My New Wallet')}${rowKV('Type', '2-of-3 Multisig')}${rowKV('Network', 'Testnet4')}${rowKV('Script', 'P2WSH (Native Segwit)')}
        </div>`)}
        ${gutterBox(`<div class="hcard col" style="gap:${S(12)};align-items:stretch"${c('cosigners', 'Cosigners card')}>
          ${T('Cosigners', 'r', 17, 600, 'ink')}
          ${cos
            .map(
              ([n, fp, key], i) => `<div class="nest col" style="padding:var(--fpad);gap:${S(6)};align-items:flex-start;overflow:hidden"${c('cosigner-' + i, n)}>
              ${T(n, 'd', 15, 400, 'ink')}
              <span class="row" style="gap:8px">${T('FP:', 'd', 13, 400, 'ink2')}${T(fp, 'm', 12, 400, 'brand')}</span>
              ${T(key, 'm', 10, 400, 'ink2', `${charWrap()};align-self:stretch;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:3;overflow:hidden`, 'tw')}</div>`,
            )
            .join('')}
        </div>`)}
        ${gutterBox(`<div class="hcard col" style="gap:${S(12)};align-items:stretch"${c('backup', 'Back up your descriptor')}>
          <div class="row" style="gap:8px"><span style="color:var(--brandInk);display:flex;align-items:center;height:calc(22.33px * var(--ts))">${Y('exclamationmark.triangle.fill:20:regular')}</span>${T('Back Up Your Descriptor', 'r', 17, 600, 'ink')}</div>
          ${T('The output descriptor is your <b style="font-weight:700">only</b> recovery path. If you lose Birch (phone dies, app deleted, data corrupted), the descriptor is the only thing needed to rebuild the wallet in any compatible coordinator (Sparrow, Nunchuk, etc.). Without it, you’d need to re-gather all cosigner xpubs and reconstruct the exact same configuration — which may not be possible.', 'd', 13, 400, 'ink2', '', 'tw')}
          <div class="col" style="gap:${S(6)};align-items:flex-start">
            ${['Print to PDF', 'Import into Sparrow Wallet on another computer', 'Save to an encrypted drive'].map((b) => `<div class="row" style="gap:8px;align-items:flex-start">${T('•', 'd', 13, 400, 'brand')}${T(b, 'd', 13, 400, 'ink2')}</div>`).join('')}
          </div>
          ${utility('doc.richtext:15:regular', 'PDF/Print Output Descriptor', 'var(--u-purple)', 'pdf')}
          ${utility('qrcode.viewfinder:15:regular', 'Show Descriptor QR', 'var(--u-brand)', 'show-qr')}
          ${utility('doc.on.doc:15:regular', 'Copy Descriptor', 'var(--u-info)', 'copy')}
        </div>`)}
        ${gutterBox(`<div class="hcard col" style="gap:${S(12)};align-items:stretch"${c('verify-address', 'Verify receive address')}>
          <div class="row" style="gap:8px;color:var(--ink)">${Y('checkmark.shield:17:semibold')}${T('Verify Receive Address', 'r', 17, 600, 'ink')}</div>
          ${T('Verifying your first receive address confirms that Birch built the correct output descriptor and will generate the same addresses as your cosigner devices. If the addresses don’t match, funds sent to this wallet could be unspendable.', 'd', 13, 400, 'ink2', '', 'tw')}
          <div class="row" style="justify-content:center"><div style="padding:12px;background:#fff;border-radius:var(--r-nested)"${c('receive-qr', 'Receive address QR')}><div class="qr" style="width:200px;height:200px">${qrSVG(A().qr && A().qr.receive)}</div></div></div>
          <span class="t tw" style="${F('m', 12)};text-align:center">${addr('tb1q3g9a5jwdg0pzhwlh4ugfsewmase639aclasmw44st7vyg9dj6k9qwulz1d')}</span>
          <div class="row" style="justify-content:center">${T('Index 0', 'd', 13, 400, 'ink2')}</div>
          ${T('Load the output descriptor into your hardware signer (SeedSigner, Krux, etc.) and verify this address matches the first receive address shown on the device.', 'd', 13, 400, 'ink2', '', 'tw')}
        </div>`)}
        ${gutterBox(`<span class="pbtn"${c('primary-cta', 'Primary button: Create Wallet')}>Create Wallet</span>`)}
        <div class="row" style="justify-content:center;padding-bottom:${S(32)}"${c('back', 'Back')}>${T('Back', 'd', 16, 400, 'ink2')}</div>
      </div>`)
  }

  // ---------------------------------------------------------------------------
  // UTXOs
  // ---------------------------------------------------------------------------

  /** Wrapping text at the iOS line height (T()'s font shorthand leaves WebKit's whole-pixel 'normal') */
  // Rounded to the device's pixel: set per device in phone()
  let LH = 'line-height:1.1934;line-height:round(up, 1.1934em, 0.33333px)'

  /** A tinted capsule, as in UTXOListView.statusCapsule and the UTXO detail header */
  const capsule = (text, color, size, key) =>
    `<span class="t" style="${F('d', size)};color:${color};padding:3px 8px;border-radius:var(--r-chip);background:color-mix(in srgb, ${color} 15%, transparent)"${key ? c(key, text + ' status') : ''}>${text}</span>`

  /** A tab's title row: hbAmountLarge with the screen's own padding, above a plain List */
  function tabTitle(title, after = '') {
    return `<div class="sx-head" style="position:absolute;top:${D.top}px;left:0;right:${D.end}px;z-index:5;background:var(--ground)">
      <div class="row" style="padding:8px ${M16} 4px;height:${after ? 56 : 54.95}px;align-items:center"${c('title', 'Screen title')}>${T(title, 'a', 36, 700, 'ink')}<span class="sp"></span>${after}</div></div>`
  }

  const UTXOS = [
    ['8,754', 'tb1qjankyz...kqd9x7qf', 'March 29, 2026 at 1:02 AM', 'Receive'],
    ['48,908', 'tb1q54vgck...gsrpef26', 'March 29, 2026 at 1:02 AM', 'Change'],
    ['9,654', 'tb1qexdwml...hs97eu9j', 'March 22, 2026 at 2:34 PM', 'Receive'],
    ['5,173', 'tb1qq08cae...hsgw2cfq', 'March 22, 2026 at 2:34 PM', 'Receive'],
    ['41,904', 'tb1qwhf7ft...jss8mf2d', 'March 20, 2026 at 12:23 AM', 'Change'],
    ['79,492', 'tb1q8pdyf4...kqnk63yx', 'March 20, 2026 at 12:23 AM', 'Change'],
  ]

  function utxoRow([amt, address, date, kind], i) {
    return `<div class="urow"${c('utxo-' + i, `UTXO row: ${amt} sats`)}>
      <div class="col" style="gap:${S(6)};flex:1;align-items:stretch">
        <div class="row">${T(amt + ' sats', 'm', 14, 400, 'ink', '', 'amt')}<span class="sp"></span>${capsule('Confirmed', 'var(--success)', 10)}</div>
        <div class="row">${T(address, 'm', 11, 400, 'ink2')}<span class="sp"></span>${T(date, 'd', 11, 400, 'ink2')}</div>
        <div class="row">${T(kind, 'd', 10, 400, 'ink2')}</div>
      </div>
      <span class="txchev">${Y(D.chrome !== 'iphone' ? 'chevron.right:13.5:semibold' : 'chevron.right:15:semibold')}</span>
    </div>`
  }

  function utxos() {
    const filter = `<span style="width:44px;height:44px;display:grid;place-items:center;color:var(--ink)"${c('filter', 'Filter button')}>${Y('line.3.horizontal.decrease:20:semibold')}</span>`
    return `${tabTitle('UTXOs', filter)}
      <div class="sx" style="top:${D.top + 56}px;right:${D.end}px"><div${c('utxo-list', 'UTXO list')}>${UTXOS.map(utxoRow).join('')}</div><div style="height:${D.tabClear}px"></div></div>${tabbar('UTXOs')}`
  }

  /** UTXOFilterSheet at its medium detent over the UTXO list: Show and Type switches with captions, then
   *  Sort By (a checked row per key and the direction picker), which scrolls into view */
  function utxoFilter() {
    const toggle = (title, caption, on, key) =>
      `<div class="row" style="gap:8px"${c(key, `${title} switch`)}><div class="col" style="gap:2px;flex:1;align-items:flex-start">${T(title, 'd', 16, 400, 'ink', LH)}${T(caption, 'd', 12, 400, 'ink2', LH, 'tw')}</div><span class="iswitch${on ? ' on' : ''}"><i></i></span></div>`
    const section = (title, rows, key) =>
      `<div class="col" style="gap:${S(8)};align-items:stretch"><div style="padding:0 4px">${T(title, 'd', 13, 400, 'ink2', 'line-height:1.1934')}</div><div class="hcard col" style="gap:${S(12)};align-items:stretch"${c(key, `${title} section`)}>${rows}</div></div>`
    const sortRow = (k, on) =>
      `<div class="row"${c('sort-' + k.toLowerCase(), `Sort by ${k}${on ? ', selected' : ''}`)}>${T(k, 'd', 16, 400, 'ink', LH)}<span class="sp"></span>${on ? `<span style="color:var(--brandInk);display:flex">${Y('checkmark:14:semibold')}</span>` : ''}</div><div class="divider"></div>`
    // The medium detent: on the iPhone the sheet is drawn at 386/402 scale from the bottom, so 469.7pt of
    // layout fills its 451pt; the Duo's sheet isn't scaled
    return `${utxos().replace(/ data-c="[^"]*" data-cl="[^"]*"/g, '')}<div class="scrim"></div>
    <div class="fsheet" style="height:${D.medium}px;padding-bottom:0;box-sizing:border-box"${c('filter-sheet', 'Filter sheet')}>
      <i class="grabber"></i>${sheetNav('Filter', { label: 'Reset', key: 'reset' }, { label: 'Done', key: 'done', prominent: true })}
      <div class="sx" style="top:${sheetTop() + (D.form ? 2.67 : 0)}px"><div class="col" style="gap:${S(20)};padding:${S(16)} calc(${M16} + ${sheetEnd()}px) ${S(16)} ${M16};align-items:stretch">
        ${section(
          'Show',
          [
            toggle('Spendable', 'Unspent outputs available to send', true, 'show-spendable'),
            toggle('Frozen', 'Unspent outputs excluded from coin selection', true, 'show-frozen'),
            toggle('Spent', 'Outputs this wallet has already spent', false, 'show-spent'),
          ].join('<div class="divider"></div>'),
          'show',
        )}
        ${section('Type', toggle('Change Outputs', 'Hide to see only receive outputs', true, 'show-change'), 'type')}
        ${section(
          'Sort By',
          `${sortRow('Age', true)}${sortRow('Amount', false)}${sortRow('Label', false)}
          <div style="height:31px;margin-top:4px"><div class="seg"${c('sort-order', 'Sort order')}><span class="on">Newest First</span><span>Oldest First</span></div></div>`,
          'sort',
        )}
      </div></div>
    </div>`
  }

  /** iOS 26 navigation bar: a Liquid Glass back button and the inline title */
  function navBar(title) {
    // The Duo leads with the title at the top and moves the back button into the side column, under the clock
    if (D.chrome === 'duo')
      return `<div class="navbar" style="top:0;right:${D.end}px"><span class="t navtitle lead"${c('nav-title', 'Navigation title')}>${title}</span></div>
      <span class="navback duo" style="left:${D.w - D.end + 12}px;top:${D.status[1] + 84.33}px"${c('nav-back', 'Back button')}>${Y('chevron.left:20:medium')}</span>`
    return `<div class="navbar" style="top:${D.top}px;right:${D.end}px"><span class="navback"${c('nav-back', 'Back button')}>${Y('chevron.left:22:semibold')}</span>
      <span class="t navtitle"${c('nav-title', 'Navigation title')}>${title}</span></div>`
  }

  const UTXO_ADDR = 'tb1qjankyz9puexjzd4uqsegux2fs8mqlnl5g845jqtwhsskjcy7z8kqd9x7qf'
  const OUTPOINT = '7d9809350287013654fbd9a008ae3884941bd136db2b4829770901f51de22825:0'

  function utxoDetail() {
    const actions = (key) =>
      `<span class="row" style="flex:none;gap:8px;align-items:flex-start;color:var(--u-info)"${c(key, 'Copy and open in explorer')}><span class="row" style="width:calc(17px * var(--ts));justify-content:center">${Y('doc.on.doc:14:regular')}</span><span class="row" style="width:calc(15px * var(--ts));justify-content:center">${Y('arrow.up.right.square:14:regular')}</span></span>`
    const detail = (k, v, amt) => `<div class="row">${T(k, 'd', 13, 400, 'ink2')}<span class="sp"></span>${T(v, 'm', 14, 400, 'ink', '', amt ? 'amt' : '')}</div>`
    return `${navBar('UTXO Detail')}
      <div class="sx" style="padding-top:${D.navTop + 54}px;right:${D.end}px">
        <div class="col" style="gap:${S(16)};padding:${S(16)} ${M16};align-items:stretch">
          <div class="col cx" style="gap:${S(8)};padding-top:${S(8)}"${c('utxo-amount', 'UTXO amount')}>
            <span style="color:var(--brandInk);display:flex">${Y('bitcoinsign.circle.fill:44:regular')}</span>
            ${T('8,754 sats', 'a', 24, 600, 'ink', '', 'amt')}
            ${T('$ 7.58', 'd', 14, 400, 'ink2')}
            ${capsule('Confirmed', 'var(--success)', 11, 'utxo-status')}
          </div>
          <div class="hcard col" style="gap:${S(12)};align-items:stretch"${c('output', 'Output details')}>
            <div class="col" style="gap:${S(6)};align-items:stretch"${c('address', 'Address')}>
              ${T('Address', 'd', 13, 400, 'ink2')}
              <div class="row" style="gap:8px;align-items:flex-start"><span class="t tw addr2">${addr(UTXO_ADDR)}</span><span class="sp" style="min-width:8px"></span>${actions('address-actions')}</div>
            </div>
            <div class="divider"></div>
            ${detail('Amount', '8,754 sats', true)}
            ${detail('Receive Address Index', '18')}
            ${detail('Output Index', '0')}
            ${detail('Type', 'Receive')}
            ${detail('Block Height', '127747')}
            ${detail('Timestamp', 'March 29, 2026 at 1:02 AM')}
            ${detail('Confirmations', '27644')}
          </div>
          <div class="hcard col" style="gap:${S(6)};align-items:stretch"${c('label', 'Label')}>
            <div class="row">${T('Label', 'd', 13, 400, 'ink2')}<span class="sp"></span><span class="row" style="height:calc(16.9px * var(--ts));color:var(--u-info)"${c('add-label', 'Add label')}>${Y('plus.circle:14:regular')}</span></div>
            ${T('No label', 'd', 16, 400, 'ink2', 'font-style:italic')}
          </div>
          <div class="hcard col" style="gap:${S(6)};align-items:stretch"${c('outpoint', 'Outpoint')}>
            ${T('Outpoint', 'd', 13, 400, 'ink2')}
            <div class="row" style="gap:8px;align-items:flex-start">${T(OUTPOINT, 'm', 11, 400, 'ink', `word-break:break-all;flex:0 1 auto;${LH}`, 'tw')}<span class="sp" style="min-width:8px"></span>${actions('outpoint-actions')}</div>
          </div>
          <div class="hcard"${c('freeze', 'Freeze UTXO')}>
            <div class="row ub" style="--uc:var(--u-info);gap:8px;justify-content:center;padding:calc((var(--btn-h) - 24.29px) / 2) 0;border-radius:max(0px, calc(var(--r-btn) - 2px))">${Y('snowflake:17:regular')}${T('Freeze UTXO', 'd', 15, 400, 'currentColor')}</div>
          </div>
        </div>
        <div style="height:${D.tabClear}px"></div>
      </div>${tabbar('UTXOs')}`
  }

  // ---------------------------------------------------------------------------
  // Settings (an inset grouped List: iOS draws the sections, the app colors the rows)
  // ---------------------------------------------------------------------------

  function settings() {
    const toggle = (on, key, label) => `<span class="iswitch${on ? ' on' : ''}"${c(key, label)}><i></i></span>`
    const titled = (title, sub) => `<div class="col" style="gap:2px;align-items:flex-start;flex:0 1 auto">${T(title, 'd', 17, 400, 'ink', LH)}${T(sub, 'd', 12, 400, 'ink2', LH, 'tw')}</div>`
    const picker = (label, value, key, extra = '') =>
      `<div class="row" style="flex:1;${extra}"${c(key, label + ' picker')}>${T(label, 'd', 17, 400, 'ink', LH)}<span class="sp"></span>
        <span class="row" style="gap:4px;color:var(--brandInk)">${T(value, 'd', 17, 400, 'brand', LH)}${Y('chevron.up.chevron.down:13:medium')}</span></div>`
    const section = (title, rows, key, first) =>
      `<div class="igh${first ? ' first' : ''}">${T(title, 'd', 17, 600, 'var(--sysInk2)', NLH)}</div><div class="igroup"${c(key, title + ' section')}>${rows}</div>`
    const row = (inner) => `<div class="irow">${inner}</div>`
    const tile = (m, on) => `<div class="col cx" style="flex:1 1 0;gap:8px;padding:8px 0"${c('icon-' + m, (m === 'light' ? 'Light' : 'Dark') + ' app icon')}>
        <span style="position:relative;display:block">${appIcon(m, 72, 16)}${on ? '<i class="iconring"></i>' : ''}</span>
        <span class="row" style="gap:4px">${on ? `<span style="color:var(--select);display:flex">${Y('checkmark.circle.fill:12:regular')}</span>` : ''}${T(m === 'light' ? 'Light' : 'Dark', 'd', 13, 400, 'ink', NLH)}</span></div>`
    return `${tabTitle('Settings')}
      <div class="sx" style="top:${D.top + 54.95}px;right:${D.end}px">
        ${section('Security', row(`${titled('App Lock', `Require ${D.biometry} to open app`)}<span class="sp"></span>${toggle(false, 'app-lock', 'App Lock switch')}`), 'security', true)}
        ${section('Fee Estimation', row(picker('Fee Source', 'Electrum Server', 'fee-source')), 'fees')}
        ${section('Currency Display', row(picker('Bitcoin Unit', 'sats', 'unit')) + `<i class="isep"></i>` + row(`<div class="col" style="flex:1;align-items:stretch">
            <div class="row" style="gap:${D.chrome === 'duo' ? 20 : 24}px">${titled('Show Fiat Price', 'Display estimated fiat value alongside bitcoin amounts')}<span class="sp"></span>${toggle(true, 'fiat', 'Show Fiat Price switch')}</div>
            ${picker('Price Source', 'Zeus', 'price-source', 'padding-top:12px')}
            ${picker('Currency', 'USD', 'currency', 'padding-top:12px')}</div>`), 'currency')}
        ${section('Appearance', row(picker('Theme', 'System', 'theme')), 'appearance')}
        ${section('App Icon', row(`<div class="row" style="gap:12px;flex:1;align-items:flex-start">${tile('light', true)}${tile('dark', false)}</div>`), 'app-icon')}
        ${section('About', row(`${T('Version', 'd', 17, 400, 'ink', NLH)}<span class="sp"></span>${T(D.version || '0.23 (31)', 'd', 17, 400, 'ink2', NLH)}<span style="color:var(--ink2);display:flex;margin-left:8px">${Y('doc.text.magnifyingglass:14:regular')}</span>`), 'about')}
        <div style="height:${D.tabClear + 35}px"></div>
      </div>${tabbar('Settings')}`
  }

  // ---------------------------------------------------------------------------
  // Welcome and wallet setup: the wizard full screen, as on first launch
  // ---------------------------------------------------------------------------

  /** ThemedAppIcon: the app icon artwork for the appearance, clipped to a rounded square */
  function appIcon(mode, size, radius, inner = '') {
    const src = (A().icon || {})[mode]
    return `<span class="appicon" style="width:${size}px;height:${size}px;border-radius:${radius}px${src ? `;background-image:url(${src})` : ''}">${inner}</span>`
  }

  /** SetupTwoColumn: two independently scrolling columns, split on the fold by a gap the fold's width plus
   *  24pt (48pt at least), from 32pt in on the leading side to 24pt in on the trailing side. Each column is
   *  at least the step's height, so its spacers can center the content or push the last item down.
   *  `top` is where the step starts under the progress bar. */
  function twoCols() {
    const width = D.w - D.end
    const [center, foldW] = D.fold || [width / 2, 0]
    const gap = Math.max(48, foldW + 24)
    return [[32, Math.max(32, center - gap / 2)], [Math.min(width - 24, center + gap / 2), width - 24]]
  }
  function twoColumn(lead, trail, top = 0) {
    const cols = twoCols()
    const col = ([a, b], inner) => `<div class="sx" style="left:${a}px;right:auto;width:${b - a}px;top:${top}px;bottom:${D.bottom}px;background:none">${inner}</div>`
    return col(cols[0], lead) + col(cols[1], trail)
  }

  /** Spacer(minLength: 16) in a column that fills its height */
  const SP16 = '<span class="sp" style="min-height:16px"></span>'

  /** The Welcome feature list: each icon sits in a 28pt-wide frame; the heights are the symbol frames SwiftUI lays out at 18pt */
  function featureList(extra = '') {
    const feature = (icon, h, text) =>
      `<div class="row" style="gap:14px"><span class="row" style="width:28px;height:calc(${h}px * var(--ts));justify-content:center;color:var(--brandInk)">${Y(icon)}</span>${T(text, 'd', 15, 400, 'ink')}</div>`
    return `<div class="col" style="gap:${S(16)};align-items:flex-start;${extra}"${c('features', 'Feature list')}>
        ${feature('eye.fill:18:regular', 18.33, 'Watch-only — no private keys stored')}
        ${feature('person.3.fill:18:regular', 20.33, 'Multi-signature security (M-of-N)')}
        ${feature('qrcode.viewfinder:18:regular', 20.33, 'Airgapped QR signing device support')}
        ${feature('server.rack:18:regular', 20.33, 'Connect to your own Electrum server')}
        ${feature('wallet.bifold.fill:18:regular', 20.33, 'Coordinate multiple wallets')}
      </div>`
  }

  function welcome(mode) {
    // The ground-colored stroke, blurred and clipped, fades the icon's edges into the screen
    const icon = `<div class="row" style="justify-content:center"${c('app-icon', 'App icon')}>${appIcon(mode, 120, 28, '<i class="appicon-fade"></i>')}</div>`
    const title = `<div class="col cx" style="gap:${S(12)}"${c('title', 'Welcome title')}>${T('Birch Wallet', 'r', 34, 'W', 'ink')}${T('A Bitcoin Multisig Coordinator', 'd', 17, 400, 'ink2')}</div>`
    const start = `<span class="pbtn"${c('primary-cta', 'Primary button: Get Started')}>Get Started</span>`
    // Open Duo: the brand on the left, what the app does and the way in on the right
    if (D.layout === 'twoColumn')
      return twoColumn(
        `<div class="col" style="min-height:100%;gap:${S(32)};align-items:center">${SP16}${icon}${title}${SP16}</div>`,
        `<div class="col" style="min-height:100%;gap:${S(40)};align-items:stretch">${SP16}${featureList('align-self:flex-start')}${start}${SP16}</div>`,
      ) + (D.homeIndicator ? '<i class="homebar"></i>' : '')
    // iPad: one readable column, and the button stays with the content so the group centers together
    const column = D.layout === 'column'
    return `<div class="sx col" style="padding:${wizTop()}px ${D.end}px ${D.bottom}px 0;gap:${S(32)};align-items:stretch">
      <span class="sp"></span>
      ${icon}
      ${title}
      ${featureList('align-self:center;padding:0 var(--gutter)')}
      ${column ? '<div style="height:24px"></div>' : '<span class="sp"></span>'}
      <div style="padding:0 var(--gutter) ${S(32)}${column ? ';width:100%;max-width:600px;align-self:center' : ''}">${start}</div>
      ${column ? '<span class="sp"></span>' : ''}
    </div>`
  }

  function walletSetup() {
    const choice = (icon, title, sub, key) => `<div class="card row" style="gap:16px;padding:calc(var(--pad) + 4px)"${c(key, title)}>
        <span style="color:var(--brandInk);display:flex">${Y(icon)}</span>
        <div class="col" style="gap:4px;align-items:flex-start;flex:0 1 auto">${T(title, 'r', 17, 600, 'ink')}${T(sub, 'd', 13, 400, 'ink2', LH, 'tw')}</div>
        <span class="sp" style="min-width:0"></span>
        <span style="color:var(--ink2);display:flex">${Y('chevron.right:14:semibold')}</span></div>`
    const cards = `${choice('plus.circle.fill:28:regular', 'Create New Wallet', 'Setup M-of-N multisig by importing cosigner xpubs from one or more air-gapped signing devices', 'create')}
          ${choice('square.and.arrow.down.fill:28:regular', 'Import Descriptor', 'Import an existing wallet via output descriptor from a printed backup or another coordinator', 'import')}`
    // Open Duo: what this step is on the left with Back at the bottom, the two choices on the right
    if (D.layout === 'twoColumn')
      return twoColumn(
        `<div class="col" style="min-height:100%;gap:${S(16)};align-items:center"><div class="col" style="flex:1 0 auto;gap:${S(16)};align-items:flex-start">${SP16}
          <div${c('title', 'Setup title')}>${T('Wallet Setup', 'r', 28, 'W', 'ink')}</div>
          ${T('Choose how to configure your multisig wallet', 'd', 15, 400, 'ink2', '', 'tw')}
          <div class="row" style="gap:6px;color:var(--ink2)"${c('script-note', 'Script type note')}>${Y('info.circle:12:regular')}${T('Only BIP-67 P2WSH script type is supported', 'd', 12, 400, 'ink2')}</div>
          ${SP16}
          <div style="padding-bottom:16px"${c('back', 'Back')}>${T('Back', 'd', 16, 400, 'ink2')}</div></div></div>`,
        `<div class="col" style="min-height:100%;gap:8px;align-items:stretch">${SP16}<div class="col" style="gap:${S(16)};align-items:stretch">${cards}</div>${SP16}</div>`,
        D.top,
      )
    // iPad: one readable column, with Back staying under the content so the group centers together
    const column = D.layout === 'column'
    return `<div class="sx col" style="padding:${wizTop()}px ${D.end}px ${D.bottom}px 0;align-items:${column ? 'center' : 'stretch'}">
      <div class="col" style="flex:1 0 auto;gap:${S(24)};align-items:stretch${column ? ';width:100%;max-width:600px' : ''}">
        <span class="sp"></span>
        <div class="row" style="justify-content:center"${c('title', 'Setup title')}>${T('Wallet Setup', 'r', 28, 'W', 'ink')}</div>
        <div class="row" style="justify-content:center;padding:0 calc(var(--gutter) + 8px)">${T('Choose how to configure your multisig wallet', 'd', 15, 400, 'ink2', 'text-align:center', 'tw')}</div>
        <div class="row" style="gap:6px;justify-content:center;padding:0 calc(var(--gutter) + 8px);color:var(--ink2)"${c('script-note', 'Script type note')}>${Y('info.circle:12:regular')}${T('Only BIP-67 P2WSH script type is supported', 'd', 12, 400, 'ink2')}</div>
        <div class="col" style="gap:${S(16)};padding:0 var(--gutter);align-items:stretch">
          ${cards}
        </div>
        ${column ? '<div style="height:24px"></div>' : '<span class="sp"></span>'}
        <div class="row" style="justify-content:center;padding-bottom:${S(32)}"${c('back', 'Back')}>${T('Back', 'd', 16, 400, 'ink2')}</div>
        ${column ? '<span class="sp"></span>' : ''}
      </div>
    </div>`
  }

  const SCREENS = [
    { id: 'home', group: 'Wallet', label: 'Transactions', build: home, shot: '04-Transactions', swift: 'TransactionListView.swift, TransactionRowView.swift' },
    { id: 'wallet-picker', group: 'Wallet', label: 'Wallet picker', build: walletPicker, shot: '05-WalletPicker', swift: 'TransactionListView.swift (walletPickerOverlay)' },
    // No simulator screenshots show the next three: they are rebuilt from the SwiftUI views
    { id: 'home-loading', group: 'Wallet', label: 'Transactions, loading', build: homeLoading, shot: null, swift: 'TransactionListView.swift (transactionContent), SeedlingLoadingView.swift, Theme.swift (SyncStatusDot)' },
    { id: 'home-empty', group: 'Wallet', label: 'No transactions', build: homeEmpty, shot: null, swift: 'TransactionListView.swift (transactionContent)' },
    { id: 'bump', group: 'Wallet', label: 'Bump fee', build: bumpFee, shot: null, swift: 'BumpFeeView.swift (BumpFeeInputView, BumpFeeRateCard), Theme.swift (HBBarButtonStyle)' },
    { id: 'send-empty', group: 'Send', label: 'Send, empty', build: sendEmpty, shot: '11-Send', swift: 'SendFlowView.swift, SendAmountView.swift' },
    { id: 'send', group: 'Send', label: 'Recipients and amount', build: send, shot: '27-SendRecipientsFilled', swift: 'SendFlowView.swift, SendAmountView.swift' },
    { id: 'fee', group: 'Send', label: 'Network fee sheet', build: fee, shot: '26-NetworkFee-Custom', swift: 'SendFeeSheetView.swift' },
    { id: 'review', group: 'Send', label: 'Review transaction', build: review, shot: '28-ReviewTransaction-Top', swift: 'SendReviewView.swift, PSBTVerificationBadge.swift' },
    { id: 'sign', group: 'Signing', label: 'PSBT QR', build: sign, shot: '31-PSBTQRDisplay', swift: 'PSBTDisplayView.swift' },
    { id: 'scan', group: 'Signing', label: 'Scan signed PSBT', build: scan, shot: '33-ScanSignedPSBT', swift: 'PSBTScanView.swift, URScannerSheet.swift' },
    { id: 'utxos', group: 'UTXOs', label: 'UTXO list', build: utxos, shot: '12-UTXOs', swift: 'UTXOListView.swift' },
    { id: 'utxo', group: 'UTXOs', label: 'UTXO detail', build: utxoDetail, shot: '13-UTXODetail', swift: 'UTXODetailView.swift' },
    { id: 'utxo-filter', group: 'UTXOs', label: 'UTXO filter sheet', build: utxoFilter, shot: null, swift: 'UTXOFilterSheet.swift, UTXOFilter.swift' },
    { id: 'settings', group: 'Settings', label: 'Settings', build: settings, shot: '14-Settings', swift: 'SettingsView.swift' },
    { id: 'welcome', group: 'Setup', label: 'Welcome', build: welcome, shot: '01-Welcome', swift: 'WelcomeStepView.swift, SetupWizardView.swift' },
    { id: 'setup', group: 'Setup', label: 'Wallet setup', build: walletSetup, shot: '02-Wallet-Setup', swift: 'WalletCreationChoiceView.swift' },
    { id: 'descriptor', group: 'Setup', label: 'Import descriptor', build: descriptorImport, shot: '03-DescriptorImport', swift: 'DescriptorImportView.swift, ElectrumServerSetupSection.swift (WalletNameNetworkCard), CharWrapText.swift (CharWrappingTextEditor)' },
    // No simulator screenshot shows this state: it is the Import descriptor rebuild with the field empty
    { id: 'descriptor-empty', group: 'Setup', label: 'Import descriptor, empty', build: descriptorImportEmpty, shot: null, swift: 'DescriptorImportView.swift, CharWrapText.swift (CharWrappingTextEditor)' },
    { id: 'multisig', group: 'Setup', label: 'Multisig configuration', build: multisig, shot: '15-MultisigConfig-Testnet4', swift: 'MultisigConfigView.swift, ElectrumServerSetupSection.swift (WalletNameNetworkCard)' },
    { id: 'cosigner-empty', group: 'Setup', label: 'Import cosigners, empty', build: cosignerEmpty, shot: '17-CosignerImport-Empty', swift: 'CosignerImportView.swift' },
    { id: 'cosigner', group: 'Setup', label: 'Import cosigners', build: cosignerFilled, shot: '18-CosignerImport-Cosigner1', swift: 'CosignerImportView.swift, CharWrapText.swift (CharWrappingTextEditor)' },
    // Next scrolls the flagged key into view, which moves the form on the Duo's shorter screens
    { id: 'cosigner-errors', group: 'Setup', label: 'Import cosigners, flagged', build: cosignerErrors, shot: '20-CosignerImport-Errors', swift: 'CosignerImportView.swift, Theme.swift (hbFieldError)', scroll: { 'duo-closed': 10.33, 'duo-open': 15 } },
    { id: 'verify', group: 'Setup', label: 'Verify wallet', build: verify, shot: '21-VerifyWallet-Top', swift: 'WalletVerifyView.swift' },
  ]

  /**
   * Where the simulator screenshots for the overlay can live: the birch-screenshots submodule in a
   * birch-wallet checkout, or a screenshots/ folder next to this page (the GitHub Pages build copies
   * them there). ds-app.js picks the first that loads. A served copy tries its own folder first,
   * so the hosted site doesn't request a path outside it.
   */
  const SHOT_BASES = root.location && root.location.protocol === 'file:' ? ['../fastlane/screenshots/', 'screenshots/'] : ['screenshots/', '../fastlane/screenshots/']
  let shotBase = null
  /** Path of the screenshot a screen was rebuilt from, relative to a shot base */
  const shotPath = (screen, mode, device = 'iphone') => `${mode}/en-US/${encodeURIComponent(`${deviceOf(device).shot}-${screen.shot}.png`)}`

  /**
   * Every change the Future design makes to Today, one entry each, for the page's overview and the
   * export: { screens: [screen ids, or none for every screen], change: 'what changes', swift: 'files' }.
   * Builders receive the design ('today' or 'future') as their second argument, and each phone
   * carries a d-today or d-future class, so a Future change can branch in a builder or in CSS.
   */
  const FUTURE_CHANGES = []

  function phone(screen, mode, design = 'today', device = 'iphone') {
    D = deviceOf(device)
    LH = `line-height:1.1934;line-height:round(up, 1.1934em, ${D.scale === 2 ? '0.5px' : '0.33333px'})`
    // The wrapper reserves the scaled size; the phone itself is scaled with a transform, because
    // CSS zoom lets Safari bump 10pt text up to its minimum font size and break the layout
    const rel = screen.shot ? shotPath(screen, mode, D.id) : null
    return `<div class="ph-wrap" style="--dw:${D.w}px;--dh:${D.h}px;--dr:${D.radius}px"><figure class="ph m-${mode} d-${design} dev-${D.id}" data-screen="${screen.id}" data-mode="${mode}" data-design="${design}" data-device="${D.id}"${(screen.scroll || {})[D.id] ? ` data-scroll="${screen.scroll[D.id]}"` : ''}>
      <div class="ph-screen">${screen.build(mode, design)}${statusBar(mode)}${D.chrome === 'iphone' ? '<i class="ph-island"></i>' : ''}
        ${rel ? `<img class="ph-ref"${shotBase ? ` src="${shotBase + rel}"` : ''} data-shot="${rel}" alt="" loading="lazy" decoding="async">` : ''}</div>
    </figure></div>`
  }

  root.BirchShipped = {
    SCREENS,
    DEVICES,
    FUTURE_CHANGES,
    phone,
    SHOT_BASES,
    shotPath,
    /** Scrolls each phone whose screenshot was taken scrolled (data-scroll: points, or max) to match it */
    applyScrolls(rootEl = document) {
      rootEl.querySelectorAll('.ph[data-scroll]').forEach((ph) => {
        const v = ph.dataset.scroll
        ph.querySelectorAll('.ph-screen > .sx, .ssheet > .sx').forEach((el) => (el.scrollTop = v === 'max' ? el.scrollHeight : parseFloat(v) || 0))
      })
    },
    /** Points every overlay image, current and future, at the screenshots under `base` */
    setShotBase(base) {
      shotBase = base
      document.querySelectorAll('img.ph-ref[data-shot]').forEach((img) => (img.src = base + img.dataset.shot))
    },
  }
})(typeof window !== 'undefined' ? window : globalThis)
