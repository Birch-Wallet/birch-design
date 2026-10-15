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
    `<span class="t ${cls}" style="${F(face, size, weight)};color:${COLOR[color] || color};${extra}">${text}</span>`

  /** String.chunkedAddressText: groups of four, alternating primary/secondary */
  function addr(s) {
    const g = s.match(/.{1,4}/g) || []
    // Spaces are bare Text(" ") in the app, so they take the default 17pt SF Pro, not the mono face
    return g.map((x, i) => `<span style="color:${i % 2 ? 'var(--ink2)' : 'var(--ink)'}">${x}</span>`).join('<span class="t-sp"> </span>')
  }

  // ---------------------------------------------------------------------------
  // System chrome
  // ---------------------------------------------------------------------------

  function statusBar(mode) {
    const a = A()
    return `<div class="sb"><i class="sb-glyphs" style="-webkit-mask-image:url(${a.status});mask-image:url(${a.status})"></i><i class="sb-batt" style="background-image:url(${mode === 'dark' ? a.battDark : a.battLight})"></i></div>`
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
    const on = TABS.find((t) => t[0] === active)
    const pill = on ? `<i class="tabpill" style="left:${on[2] - on[3] / 2}px;width:${on[3]}px"></i>` : ''
    const items = TABS.map(([label, sym, cx]) => {
      const s = A().size(sym)
      return `<span class="tab${label === active ? ' on' : ''}" style="left:${cx}px">
        <i class="sy ${A().cls(sym)}" style="left:${-s.w / 2}px;top:${24 - s.h / 2}px"></i><span style="transform:translateX(-50%)">${label}</span></span>`
    }).join('')
    return `<nav class="tabbar"${c('tabbar', 'Tab bar')}>${pill}${items}</nav>`
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
    const top = 62 + (withMenu ? 56 : 54.95)
    return `<div class="sx-head" style="position:absolute;top:62px;left:0;right:0;z-index:5;background:var(--ground)">${sendHeader(withMenu)}</div>
      <div class="sx" style="top:${top}px">${body}<div style="height:83px"></div></div>${tabbar('Send')}${after}`
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

  /** Setup wizard ProgressBarView: six 4pt segments, gold up to the current step */
  function wizardProgress(done) {
    return `<div class="row" style="gap:4px;padding:8px var(--gutter) 0"${c('wizard-progress', 'Setup progress bar')}>${Array.from(
      { length: 6 },
      (_, i) => `<i style="flex:1;height:4px;border-radius:2px;background:${i < done ? 'var(--progress)' : 'var(--border)'}"></i>`,
    ).join('')}</div>`
  }

  /** Icon + label text link (SwiftUI Label in a plain Button) */
  const link = (icon, label, color, key) => `<span class="row" style="gap:7px;color:${COLOR[color]}"${c(key, label)}>${Y(icon)}${T(label, 'd', 14, 400, color)}</span>`

  /** Setup-wizard footer: Back on the left, a compact primary on the right (or stacked, from Tune) */
  const wizFooter = (back, next, padX = 32) => `<div class="row wizfoot" style="gap:16px;padding:0 var(--gutter) ${S(32)}">
      <span class="wizback"${c('back', back)}>${T(back, 'd', 16, 400, 'ink2')}</span><span class="sp"></span>
      <span class="row wiznext" style="min-height:calc(var(--btn-h) - 3.96px);padding:0 ${padX}px;border-radius:var(--r-btn);background:var(--brand)"${c('primary-cta', next + ' button')}>${T(next, 'r', 17, 600, 'on')}</span>
    </div>`

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
    ['in', 'Received', 'March 18, 2026 at 9:10 AM', '6,613'],
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
      <span class="txchev">${Y('chevron.right:15:semibold')}</span>
    </div>`
  }

  function home(mode) {
    return `<div class="sx">
      <div style="background:var(--hero);padding:78px ${M16} ${S(16)};display:flex;flex-direction:column;gap:${S(12)}"${c('wallet-header', 'Wallet header')}>
        <div class="row" style="height:44px">
          <span style="width:44px;height:44px;display:grid;place-items:center;color:var(--ink2)"${c('wallet-menu', 'Wallet menu')}>${Y('ellipsis:20:regular')}</span>
          <span class="sp"></span>
          <span class="row" style="gap:8px;padding:8px 12px;border-radius:calc(var(--r-chip) * 1.375);background:color-mix(in srgb, var(--ink) 8%, transparent)"${c('wallet-picker', 'Wallet picker')}>
            ${identicon(24)}${T('Birch', 'r', 17, 600, 'ink')}<span style="color:var(--ink2);display:flex">${Y('chevron.down:12:semibold')}</span></span>
          <span class="sp"></span>
          <span style="width:28px;height:28px;border-radius:50%;display:grid;place-items:center;background:color-mix(in srgb, var(--success) 10%, transparent)"${c('sync-dot', 'Sync status')}><i style="width:8px;height:8px;border-radius:50%;background:var(--success)"></i></span>
        </div>
        <div class="col cx" style="gap:2px"${c('balance', 'Balance')}>${T('193,885 sats', 'a', 36, 700, 'ink')}${T('$ 167.85', 'd', 14, 400, 'ink2')}</div>
        <div class="row">
          <span class="nbadge" style="--nb:var(--net_testnet4)"${c('network-badge', 'Network badge')}>Testnet4</span><span class="sp"></span>
          ${T(`Last refreshed ${mode === 'light' ? '2s' : '1s'} ago`, 'd', 11, 400, 'ink2')}
        </div>
      </div>
      <div style="padding:${S(12)} ${M16} ${S(4)}">${T('Transactions', 'r', 17, 600, 'ink')}</div>
      <div class="txlist"${c('tx-list', 'Transaction list')}>${TXS.map(txRow).join('')}</div>
    </div>${tabbar('Transactions')}`
  }

  function sendBody() {
    return `
      <div style="padding-bottom:4px">${steps(0)}</div>
      <div class="card col" style="padding:var(--pad);gap:${S(12)};align-items:stretch"${c('recipient-card', 'Recipient card')}>
        <div class="row" style="gap:9px">
          <div class="col" style="gap:4px;align-items:flex-start">${T('Label · optional', 'd', 11, 400, 'ink2')}
            <span style="position:relative;display:block">${T('Test Transaction', 'd', 16, 600, 'ink')}<i style="position:absolute;left:0;right:0;bottom:-4px;height:1px;background:var(--border)"></i></span></div>
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
      </div>
      <div class="card col" style="padding:calc(var(--pad) + 4px);gap:${S(14)};align-items:stretch"${c('amount-card', 'Amount card')}>
        <div class="row">${T('Amount', 'd', 13, 400, 'ink2')}<span class="sp"></span>
          <div class="row" style="gap:8px">
            <span class="t ub" style="--uc:var(--u-brand);--ua:15%;${F('m', 12, 700)};padding:9px 14px;border-radius:var(--r-chip)"${c('max', 'MAX pill')}>MAX</span>
            <span class="row nest" style="gap:4px;padding:8px 12px;border-radius:var(--r-chip);color:var(--ink)"${c('unit', 'Unit pill')}>${T('sats', 'd', 12, 600, 'ink')}${Y('chevron.up.chevron.down:9:bold')}</span>
          </div></div>
        <div class="row" style="gap:10px;align-items:baseline"${c('amount-field', 'Amount field')}>${T('71234', 'm', 40, 400, 'ink', '', 'amt')}<span class="sp"></span>${T('sats', 'm', 18, 400, 'ink2', '', 'amt')}</div>
        <div class="row" style="gap:10px">${T('0.00071234 BTC', 'm', 13, 400, 'ink2', '', 'amt')}<i style="width:3px;height:3px;border-radius:50%;background:var(--border)"></i>${T('≈ $ 61.67', 'm', 13, 400, 'ink2', '', 'amt')}</div>
        <div class="divider"></div>
        <div class="row">${T('Spendable', 'd', 13, 400, 'ink2')}<span class="sp"></span>${T('115,823 sats', 'm', 13, 400, 'ink', '', 'amt')}</div>
      </div>
      <div class="card col" style="align-items:stretch"${c('decisions', 'Fee and coins card')}>
        <div class="row" style="gap:12px;padding:var(--pad) calc(var(--pad) + 2px);min-height:calc(var(--pad) * 4)"${c('fee-row', 'Fee row')}>
          <div class="col" style="gap:4px;flex:1;align-items:flex-start">${T('Fee', 'd', 15, 600, 'ink')}${T('0.51 sat/vB · 252 sats', 'm', 12, 400, 'ink2', '', 'amt')}</div>
          <span style="color:var(--ink2);display:flex">${Y('chevron.right:13:semibold')}</span></div>
        <div class="divider"></div>
        <div class="row" style="gap:12px;padding:var(--pad) calc(var(--pad) + 2px);min-height:calc(var(--pad) * 4)"${c('coins-row', 'Coins row')}>
          <div class="col" style="gap:4px;flex:1;align-items:flex-start">${T('Coins', 'd', 15, 600, 'ink')}${T('Automatic — optimal UTXOs', 'm', 12, 400, 'ink2', '', 'amt')}</div>
          <span style="color:var(--ink2);display:flex">${Y('chevron.right:13:semibold')}</span></div>
      </div>
      <div class="col" style="gap:${S(10)};padding-top:4px;align-items:stretch">
        <div class="row" style="padding:0 4px"${c('total', 'Total with fee')}>${T('Total with fee', 'd', 13, 400, 'ink2')}<span class="sp"></span>${T('71,486 sats', 'm', 15, 700, 'ink', '', 'amt')}</div>
        <span class="pbtn"${c('primary-cta', 'Primary button: Review')}>Review</span>
        <div class="row" style="justify-content:center">${T('Next: Review Transaction', 'd', 12, 400, 'ink2')}</div>
      </div>
      <div class="row" style="justify-content:center;padding-top:4px">${T('Reset', 'd', 14, 400, 'ink2')}</div>
      <div style="height:8px"></div>`
  }

  const sendStack = (body) => `<div class="col" style="gap:${S(14)};padding:${S(12)} var(--gutter) 0;align-items:stretch">${body}</div>`

  function send() {
    return sendScreen(true, sendStack(sendBody()))
  }

  function feeOption(name, rate) {
    return `<div class="card row" style="gap:12px;padding:calc(var(--pad) - 2px) var(--pad);min-height:calc(var(--pad) * 3.5)"${c('fee-' + name.toLowerCase(), `Fee option: ${name}`)}>
      <i style="width:22px;height:22px;border-radius:50%;box-shadow:inset 0 0 0 2px var(--border);flex:none"></i>
      ${T(name, 'r', 17, 600, 'ink')}<span class="sp" style="min-width:8px"></span>${T(rate, 'm', 15, 400, 'ink', '', 'amt')}</div>`
  }

  function fee() {
    return sendScreen(true, sendStack(sendBody().replace(/ data-c="[^"]*" data-cl="[^"]*"/g, '')), `
    <div class="scrim"></div>
    <div class="fsheet"${c('fee-sheet', 'Fee sheet')}>
      <i class="grabber"></i>
      <div class="col" style="gap:${S(16)};padding:${S(24)} var(--gutter);align-items:stretch">
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
          ${reviewItem('Amount', `<span class="row" style="gap:6px">${T('71,234 sats', 'm', 16, 700, 'amt', '', 'amt')}${T('$ 61.67', 'd', 13, 400, 'ink2')}</span>`, 'amount')}
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
    return sendScreen(false, `
      <div class="col" style="gap:${S(16)};padding-top:${S(8)};align-items:stretch">
        ${sigSlots(0, 2)}
        <div class="qrbox" style="width:402px;height:402px;padding:5px"${c('psbt-qr', 'Animated PSBT QR')}><div class="qr" style="width:392px;height:392px">${qrSVG(bits)}</div></div>
        <div class="row" style="justify-content:center">${T('Scan this QR code with your signing device', 'd', 14, 400, 'ink2')}</div>
        <div class="row" style="padding:0 var(--gutter);min-height:24.33px"${c('advanced', 'Advanced disclosure')}>${T('Advanced', 'd', 14, 400, 'ink2')}<span class="sp"></span><span style="color:var(--ink);display:flex">${Y('chevron.right:17:semibold')}</span></div>
        ${gutterBox(`<span class="pbtn"${c('primary-cta', 'Primary button: Scan Signed PSBT')}>Scan Signed PSBT</span>`)}
        <div class="row" style="gap:24px;justify-content:center">
          ${link('square.and.arrow.up:14:regular', 'Export PSBT File', 'tert', 'export')}
          ${link('tray.and.arrow.down.fill:14:regular', 'Save PSBT', 'tert', 'save')}
        </div>
        <div class="row" style="justify-content:center">${link('doc.on.doc:14:regular', 'Copy Base64', 'link2', 'copy-b64')}</div>
        ${gutterBox(`<div class="hcard col" style="gap:${S(16)};align-items:stretch">
          ${reviewItem('To', `<span class="t tw" style="${F('m', 12)}">${addr(TO)}</span>`)}
          ${reviewItem('Amount', T('71,234 sats', 'm', 16, 700, 'amt', '', 'amt'))}
        </div>`)}
      </div>`)
  }

  function scan() {
    // URScannerSheet: corners at 70% of its side, 24pt arms, 3pt gold strokes. The scanner is
    // flexible; on this screen height it settles at 279.4pt rather than the 354pt width
    const side = 279.4
    const s = side * 0.7
    const o = (side - s) / 2
    const L = 24
    const d = `M${o} ${o + L}V${o}H${o + L}M${o + s - L} ${o}H${o + s}V${o + L}M${o + s} ${o + s - L}V${o + s}H${o + s - L}M${o + L} ${o + s}H${o}V${o + s - L}`
    return `<div class="sx-head" style="position:absolute;top:62px;left:0;right:0;z-index:5;background:var(--ground)">${sendHeader(false)}</div>
    <div class="sx" style="top:116.95px;display:flex;flex-direction:column">
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
      <div style="height:83px;flex:none"></div>
    </div>${tabbar('Send')}`
  }

  /** Setup screens sit in a sheet over the dimmed welcome screen. SetupWizardView pins the
   *  progress bar above the step's ScrollView, so only the step content scrolls. */
  function setupSheet(done, inner) {
    // ScrollView content keeps the 34pt home-indicator inset at the bottom
    return `<div class="sx setup-under"></div><div class="ssheet">${wizardProgress(done)}<div class="sx" style="position:absolute;top:12px;left:0;right:0;bottom:0;background:var(--ground)">${inner}<div style="height:34px"></div></div></div>`
  }

  function disclosureCard(label, key) {
    return `<div class="hcard row" style="gap:8px"${c(key, label)}><span style="color:var(--ink2);display:flex">${Y('chevron.right:12:semibold')}</span>${T(label, 'd', 13, 400, 'ink2')}<span class="sp"></span></div>`
  }

  function multisig() {
    return setupSheet(3, `
      <div class="col" style="gap:${S(28)};align-items:stretch">
        <div class="row" style="justify-content:center;padding-top:${S(16)}"${c('title', 'Setup title')}>${T('Multisig Configuration', 'r', 28, 'W', 'ink')}</div>
        <div class="col cx" style="gap:${S(16)}">
          ${T('How many signatures are required?', 'd', 15, 400, 'ink2')}
          <div class="row" style="gap:12px"${c('quorum', 'M-of-N picker')}>
            <span class="row" style="gap:4px"><span style="color:color-mix(in srgb, var(--brandInk) 70%, transparent);display:flex">${Y('chevron.up.chevron.down:14:bold')}</span>${T('2', 'r', 48, 'W', 'brand')}</span>
            ${T('of', 'd', 20, 400, 'ink2')}
            <span class="row" style="gap:4px">${T('3', 'r', 48, 'W', 'ink')}<span style="color:var(--ink2);display:flex">${Y('chevron.up.chevron.down:14:bold')}</span></span>
          </div>
        </div>
        <div class="col" style="gap:${S(24)};padding:0 var(--gutter);align-items:stretch">
          <div class="hcard col cx" style="gap:${S(8)};align-items:stretch"${c('network', 'Network picker')}>
            <div class="row" style="justify-content:center">${T('Bitcoin Network', 'd', 13, 400, 'ink2')}</div>
            <div class="seg"${c('network-seg', 'Segmented control')}><span>Mainnet</span><span class="on">Testnet4</span><span>Testnet3</span><span>Signet</span></div>
          </div>
          ${disclosureCard('Electrum Server', 'electrum')}
          ${disclosureCard('Advanced', 'advanced')}
        </div>
        ${wizFooter('Back', 'Next', 32)}
      </div>`)
  }

  /** A labeled field. UITextField-backed fields sit 2pt taller than a Text with the same padding */
  function field(label, value, face, size, key, textField = true) {
    return `<div class="col" style="gap:${S(6)};align-items:stretch"${c(key, label + ' field')}>${T(label, 'd', 13, 400, 'ink2')}
      <div class="nest" style="padding:${textField ? 'calc(var(--fpad) + 1px)' : 'var(--fpad)'} var(--fpad)">${T(value, face, size, 400, 'ink')}</div></div>`
  }

  function cosigner() {
    const slot = (i, cur, done) =>
      `<div class="col cx" style="gap:4px;flex:1">
        <div class="${cur || done ? 'sel' + (cur ? '' : ' noring') : 'card'}" style="height:44px;width:100%;display:grid;place-items:center;color:${done ? 'var(--select)' : 'var(--ink2)'}">${Y(done ? 'lock.fill:16:regular' : 'lock.open:16:regular')}</div>
        ${T(String(i), 'd', 11, 400, cur ? 'select' : 'ink2')}</div>`
    return setupSheet(4, `
      <div class="col" style="gap:${S(24)};padding-top:${S(16)};align-items:stretch">
        <div class="row" style="justify-content:center"${c('title', 'Setup title')}>${T('Import Cosigners', 'r', 28, 'W', 'ink')}</div>
        <div class="row" style="justify-content:center">${T('Cosigner 1 of 3', 'd', 15, 400, 'ink2')}</div>
        <div class="row" style="gap:8px;padding:0 var(--gutter)"${c('slots', 'Cosigner slots')}>${slot(1, true, true)}${slot(2, false, false)}${slot(3, false, false)}</div>
        ${gutterBox(`<div class="hcard col" style="gap:${S(16)};align-items:stretch"${c('form', 'Cosigner form')}>
          ${field('Label', 'Cosigner 1', 'd', 16, 'label')}
          ${field('Master Fingerprint (8 hex chars)', '07d25f0c', 'm', 14, 'fingerprint')}
          ${field('Derivation Path', "m/48'/1'/0'/2'", 'm', 14, 'path', false)}
          <div class="col" style="gap:${S(6)};align-items:stretch"${c('xpub', 'Extended public key')}>
            <div class="row">${T('Extended Public Key', 'd', 13, 400, 'ink2')}<span class="sp"></span>
              <span style="color:var(--sysGreen);display:flex;margin-right:20px"${c('xpub-format', 'Xpub format toggle')}>${Y('arrow.left.arrow.right:14:bold')}</span>
              <span class="row" style="gap:6px;color:var(--u-info)"${c('paste', 'Paste')}>${Y('doc.on.clipboard:13:regular')}${T('Paste', 'd', 13, 400, 'link2')}</span></div>
            <div class="nest" style="padding:calc(var(--fpad) + 8px) calc(var(--fpad) + 5px) var(--fpad);min-height:104px">${T('tpubDE2gU1F6b1GXDg2bFjeq6RUnBmAe2moTNG7x47Cga3VnVnm7EJWLdJE73ZL2MEwKTc2dLNeSudXUjexm2xJ5qboosbnEb1SEiGyJtJcqqZK', 'm', 12, 400, 'ink', 'word-break:break-all', 'tw')}</div>
            <span class="row" style="gap:8px;color:var(--tert)"${c('scan', 'Scan QR Code')}>${Y('qrcode.viewfinder:15:regular')}${T('Scan QR Code', 'd', 15, 400, 'tert')}</span>
          </div>
        </div>`)}
        ${wizFooter('Back', 'Next Cosigner', 24)}
      </div>`)
  }

  function verify() {
    const rowKV = (k, v) => `<div class="row">${T(k, 'd', 13, 400, 'ink2')}<span class="sp"></span>${T(v, 'd', 15, 400, 'ink')}</div>`
    const cos = [
      ['Cosigner 1', '07d25f0c', 'tpubDE2gU1F6b1GXDg2bFjeq6RUnBmAe2moTNG7x47Cga3Vn', 'Vnm7EJWLdJE73ZL2MEwKTc2…5qboosbnEb1SEiGyJtJcqqZK'],
      ['Cosigner 2', 'd73869a4', 'tpubDET5GnMK8Zr7UH63ni72etKd7ZYxVq8NvtSneNBfEDJ7', 'YtnSHUmiPCaBYXzCdR6ZBKW…6z8VTpdFRJuW4VL7xjHdLFpY'],
      ['Cosigner 3', 'e3870581', 'tpubDF3GwUrMb5WkigsDUpUWUADH55G3Ez771QujmFqeyrNE', 'PD7onkqTwCsCEjNRbSrbD9V…EX7CyMp2q5fvQzacy75bUesQ'],
    ]
    // Full-width tinted utility buttons: 14pt vertical padding at the shipped button height
    const utility = (icon, label, color, key) =>
      `<div class="row ub" style="--uc:${color};gap:8px;justify-content:center;padding:calc((var(--btn-h) - 24.33px) / 2) 0;border-radius:max(0px, calc(var(--r-btn) - 2px))"${c(key, label)}>${Y(icon)}${T(label, 'd', 15, 400, 'currentColor')}</div>`
    return setupSheet(6, `
      <div class="col" style="gap:${S(24)};padding-top:${S(16)};align-items:stretch">
        <div class="row" style="justify-content:center"${c('title', 'Setup title')}>${T('Verify Wallet', 'r', 28, 'W', 'ink')}</div>
        ${gutterBox(`<div class="hcard col" style="gap:${S(16)};align-items:stretch"${c('summary', 'Wallet summary')}>
          ${rowKV('Name', 'My New Wallet')}${rowKV('Type', '2-of-3 Multisig')}${rowKV('Network', 'Testnet4')}${rowKV('Script', 'P2WSH (Native Segwit)')}
        </div>`)}
        ${gutterBox(`<div class="hcard col" style="gap:${S(12)};align-items:stretch"${c('cosigners', 'Cosigners card')}>
          ${T('Cosigners', 'r', 17, 600, 'ink')}
          ${cos
            .map(
              ([n, fp, x1, x2], i) => `<div class="nest col" style="padding:var(--fpad);gap:${S(6)};align-items:flex-start;overflow:hidden"${c('cosigner-' + i, n)}>
              ${T(n, 'd', 15, 400, 'ink')}
              <span class="row" style="gap:8px">${T('FP:', 'd', 13, 400, 'ink2')}${T(fp, 'm', 12, 400, 'brand')}</span>
              ${T(x1 + '<br>' + x2, 'm', 10, 400, 'ink2')}</div>`,
            )
            .join('')}
        </div>`)}
        ${gutterBox(`<div class="hcard col" style="gap:${S(12)};align-items:stretch"${c('backup', 'Back up your descriptor')}>
          <div class="row" style="gap:8px"><span style="color:var(--brandInk);display:flex">${Y('exclamationmark.triangle.fill:20:regular')}</span>${T('Back Up Your Descriptor', 'r', 17, 600, 'ink')}</div>
          ${T('The output descriptor is your <b style="font-weight:700">only</b> recovery path. If you lose Birch (phone dies, app deleted, data corrupted), the descriptor is the only thing needed to rebuild the wallet in any compatible coordinator (Sparrow, Nunchuk, etc.). Without it, you’d need to re-gather all cosigner xpubs and reconstruct the exact same configuration — which may not be possible.', 'd', 13, 400, 'ink2', '', 'tw')}
          <div class="col" style="gap:${S(6)};align-items:flex-start">
            ${['Print to PDF', 'Import into Sparrow Wallet on another computer', 'Save to an encrypted drive'].map((b) => `<div class="row" style="gap:8px">${T('•', 'd', 12, 400, 'ink2')}${T(b, 'd', 12, 400, 'ink2')}</div>`).join('')}
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
  const LH = 'line-height:1.1934;line-height:round(up, 1.1934em, 0.33333px)'

  /** A tinted capsule, as in UTXOListView.statusCapsule and the UTXO detail header */
  const capsule = (text, color, size, key) =>
    `<span class="t" style="${F('d', size)};color:${color};padding:3px 8px;border-radius:var(--r-chip);background:color-mix(in srgb, ${color} 15%, transparent)"${key ? c(key, text + ' status') : ''}>${text}</span>`

  /** A tab's title row: hbAmountLarge with the screen's own padding, above a plain List */
  function tabTitle(title, after = '') {
    return `<div class="sx-head" style="position:absolute;top:62px;left:0;right:0;z-index:5;background:var(--ground)">
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
      <span class="txchev">${Y('chevron.right:15:semibold')}</span>
    </div>`
  }

  function utxos() {
    const filter = `<span style="width:44px;height:44px;display:grid;place-items:center;color:var(--ink)"${c('filter', 'Filter button')}>${Y('line.3.horizontal.decrease:20:semibold')}</span>`
    return `${tabTitle('UTXOs', filter)}
      <div class="sx" style="top:118px"><div${c('utxo-list', 'UTXO list')}>${UTXOS.map(utxoRow).join('')}</div><div style="height:83px"></div></div>${tabbar('UTXOs')}`
  }

  /** iOS 26 navigation bar: a Liquid Glass back button and the inline title */
  function navBar(title) {
    return `<div class="navbar"><span class="navback"${c('nav-back', 'Back button')}>${Y('chevron.left:22:semibold')}</span>
      <span class="t navtitle"${c('nav-title', 'Navigation title')}>${title}</span></div>`
  }

  const UTXO_ADDR = 'tb1qjankyz9puexjzd4uqsegux2fs8mqlnl5g845jqtwhsskjcy7z8kqd9x7qf'
  const OUTPOINT = '7d9809350287013654fbd9a008ae3884941bd136db2b4829770901f51de22825:0'

  function utxoDetail() {
    const actions = (key) =>
      `<span class="row" style="flex:none;gap:8px;align-items:flex-start;color:var(--u-info)"${c(key, 'Copy and open in explorer')}><span class="row" style="width:calc(17px * var(--ts));justify-content:center">${Y('doc.on.doc:14:regular')}</span><span class="row" style="width:calc(15px * var(--ts));justify-content:center">${Y('arrow.up.right.square:14:regular')}</span></span>`
    const detail = (k, v, amt) => `<div class="row">${T(k, 'd', 13, 400, 'ink2')}<span class="sp"></span>${T(v, 'm', 14, 400, 'ink', '', amt ? 'amt' : '')}</div>`
    return `${navBar('UTXO Detail')}
      <div class="sx" style="padding-top:116px">
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
        <div style="height:83px"></div>
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
      `<div class="igh${first ? ' first' : ''}">${T(title, 'd', 17, 600, 'var(--sysInk2)')}</div><div class="igroup"${c(key, title + ' section')}>${rows}</div>`
    const row = (inner) => `<div class="irow">${inner}</div>`
    const tile = (m, on) => `<div class="col cx" style="flex:1 1 0;gap:8px;padding:8px 0"${c('icon-' + m, (m === 'light' ? 'Light' : 'Dark') + ' app icon')}>
        <span style="position:relative;display:block">${appIcon(m, 72, 16)}${on ? '<i class="iconring"></i>' : ''}</span>
        <span class="row" style="gap:4px">${on ? `<span style="color:var(--select);display:flex">${Y('checkmark.circle.fill:12:regular')}</span>` : ''}${T(m === 'light' ? 'Light' : 'Dark', 'd', 13, 400, 'ink')}</span></div>`
    return `${tabTitle('Settings')}
      <div class="sx" style="top:116.95px">
        ${section('Security', row(`${titled('App Lock', 'Require Face ID to open app')}<span class="sp"></span>${toggle(false, 'app-lock', 'App Lock switch')}`), 'security', true)}
        ${section('Fee Estimation', row(picker('Fee Source', 'Electrum Server', 'fee-source')), 'fees')}
        ${section('Currency Display', row(picker('Bitcoin Unit', 'sats', 'unit')) + `<i class="isep"></i>` + row(`<div class="col" style="flex:1;align-items:stretch">
            <div class="row" style="gap:24px">${titled('Show Fiat Price', 'Display estimated fiat value alongside bitcoin amounts')}<span class="sp"></span>${toggle(true, 'fiat', 'Show Fiat Price switch')}</div>
            ${picker('Price Source', 'Zeus', 'price-source', 'padding-top:12px')}
            ${picker('Currency', 'USD', 'currency', 'padding-top:12px')}</div>`), 'currency')}
        ${section('Appearance', row(picker('Theme', 'System', 'theme')), 'appearance')}
        ${section('App Icon', row(`<div class="row" style="gap:12px;flex:1;align-items:flex-start">${tile('light', true)}${tile('dark', false)}</div>`), 'app-icon')}
        ${section('About', row(`${T('Version', 'd', 17, 400, 'ink')}<span class="sp"></span>${T('0.23 (31)', 'd', 17, 400, 'ink2')}<span style="color:var(--ink2);display:flex;margin-left:8px">${Y('doc.text.magnifyingglass:14:regular')}</span>`), 'about')}
        <div style="height:118px"></div>
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

  function welcome(mode) {
    // Each icon sits in a 28pt-wide frame; the heights are the symbol frames SwiftUI lays out at 18pt
    const feature = (icon, h, text) =>
      `<div class="row" style="gap:14px"><span class="row" style="width:28px;height:calc(${h}px * var(--ts));justify-content:center;color:var(--brandInk)">${Y(icon)}</span>${T(text, 'd', 15, 400, 'ink')}</div>`
    // The ground-colored stroke, blurred and clipped, fades the icon's edges into the screen
    return `<div class="sx col" style="padding:62px 0 34px;gap:${S(32)};align-items:stretch">
      <span class="sp"></span>
      <div class="row" style="justify-content:center"${c('app-icon', 'App icon')}>${appIcon(mode, 120, 28, '<i class="appicon-fade"></i>')}</div>
      <div class="col cx" style="gap:${S(12)}"${c('title', 'Welcome title')}>${T('Birch Wallet', 'r', 34, 'W', 'ink')}${T('A Bitcoin Multisig Coordinator', 'd', 17, 400, 'ink2')}</div>
      <div class="col" style="gap:${S(16)};align-self:center;align-items:flex-start;padding:0 var(--gutter)"${c('features', 'Feature list')}>
        ${feature('eye.fill:18:regular', 18.33, 'Watch-only — no private keys stored')}
        ${feature('person.3.fill:18:regular', 20.33, 'Multi-signature security (M-of-N)')}
        ${feature('qrcode.viewfinder:18:regular', 20.33, 'Airgapped QR signing device support')}
        ${feature('server.rack:18:regular', 20.33, 'Connect to your own Electrum server')}
        ${feature('wallet.bifold.fill:18:regular', 20.33, 'Coordinate multiple wallets')}
      </div>
      <span class="sp"></span>
      <div style="padding:0 var(--gutter) ${S(32)}"><span class="pbtn"${c('primary-cta', 'Primary button: Get Started')}>Get Started</span></div>
    </div>`
  }

  function walletSetup() {
    const choice = (icon, title, sub, key) => `<div class="card row" style="gap:16px;padding:calc(var(--pad) + 4px)"${c(key, title)}>
        <span style="color:var(--brandInk);display:flex">${Y(icon)}</span>
        <div class="col" style="gap:4px;align-items:flex-start;flex:0 1 auto">${T(title, 'r', 17, 600, 'ink')}${T(sub, 'd', 13, 400, 'ink2', LH, 'tw')}</div>
        <span class="sp" style="min-width:0"></span>
        <span style="color:var(--ink2);display:flex">${Y('chevron.right:14:semibold')}</span></div>`
    return `<div class="sx col" style="padding:62px 0 34px;align-items:stretch">${wizardProgress(2)}
      <div class="col" style="flex:1 0 auto;gap:${S(24)};align-items:stretch">
        <span class="sp"></span>
        <div class="row" style="justify-content:center"${c('title', 'Setup title')}>${T('Wallet Setup', 'r', 28, 'W', 'ink')}</div>
        <div class="row" style="justify-content:center;padding:0 calc(var(--gutter) + 8px)">${T('Choose how to configure your multisig wallet', 'd', 15, 400, 'ink2', 'text-align:center', 'tw')}</div>
        <div class="row" style="gap:6px;justify-content:center;padding:0 calc(var(--gutter) + 8px);color:var(--ink2)"${c('script-note', 'Script type note')}>${Y('info.circle:12:regular')}${T('Only BIP-67 P2WSH script type is supported', 'd', 12, 400, 'ink2')}</div>
        <div class="col" style="gap:${S(16)};padding:0 var(--gutter);align-items:stretch">
          ${choice('plus.circle.fill:28:regular', 'Create New Wallet', 'Setup M-of-N multisig by importing cosigner xpubs from one or more air-gapped signing devices', 'create')}
          ${choice('square.and.arrow.down.fill:28:regular', 'Import Descriptor', 'Import an existing wallet via output descriptor from a printed backup or another coordinator', 'import')}
        </div>
        <span class="sp"></span>
        <div class="row" style="justify-content:center;padding-bottom:${S(32)}"${c('back', 'Back')}>${T('Back', 'd', 16, 400, 'ink2')}</div>
      </div>
    </div>`
  }

  const SCREENS = [
    { id: 'home', group: 'Wallet', label: 'Transactions', build: home, shot: '04-Transactions', swift: 'TransactionListView.swift, TransactionRowView.swift' },
    { id: 'send', group: 'Send', label: 'Recipients and amount', build: send, shot: '27-SendRecipientsFilled', swift: 'SendFlowView.swift, SendAmountView.swift' },
    { id: 'fee', group: 'Send', label: 'Network fee sheet', build: fee, shot: '26-NetworkFee-Custom', swift: 'SendFeeSheetView.swift' },
    { id: 'review', group: 'Send', label: 'Review transaction', build: review, shot: '28-ReviewTransaction-Top', swift: 'SendReviewView.swift, PSBTVerificationBadge.swift' },
    { id: 'sign', group: 'Signing', label: 'PSBT QR', build: sign, shot: '31-PSBTQRDisplay', swift: 'PSBTDisplayView.swift' },
    { id: 'scan', group: 'Signing', label: 'Scan signed PSBT', build: scan, shot: '33-ScanSignedPSBT', swift: 'PSBTScanView.swift, URScannerSheet.swift' },
    { id: 'utxos', group: 'UTXOs', label: 'UTXO list', build: utxos, shot: '12-UTXOs', swift: 'UTXOListView.swift' },
    { id: 'utxo', group: 'UTXOs', label: 'UTXO detail', build: utxoDetail, shot: '13-UTXODetail', swift: 'UTXODetailView.swift' },
    { id: 'settings', group: 'Settings', label: 'Settings', build: settings, shot: '14-Settings', swift: 'SettingsView.swift' },
    { id: 'welcome', group: 'Setup', label: 'Welcome', build: welcome, shot: '01-Welcome', swift: 'WelcomeStepView.swift, SetupWizardView.swift' },
    { id: 'setup', group: 'Setup', label: 'Wallet setup', build: walletSetup, shot: '02-Wallet-Setup', swift: 'WalletCreationChoiceView.swift' },
    { id: 'multisig', group: 'Setup', label: 'Multisig configuration', build: multisig, shot: '15-MultisigConfig-Testnet4', swift: 'MultisigConfigView.swift, ElectrumServerSetupSection.swift' },
    { id: 'cosigner', group: 'Setup', label: 'Import cosigners', build: cosigner, shot: '18-CosignerImport-Cosigner1', swift: 'CosignerImportView.swift' },
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
  const shotPath = (screen, mode) => `${mode}/en-US/${encodeURIComponent(`iPhone 17 Pro-${screen.shot}.png`)}`

  /**
   * Every change the Future design makes to Today, one entry each, for the page's overview and the
   * export: { screens: [screen ids, or none for every screen], change: 'what changes', swift: 'files' }.
   * Builders receive the design ('today' or 'future') as their second argument, and each phone
   * carries a d-today or d-future class, so a Future change can branch in a builder or in CSS.
   * Empty while Future is an exact copy of Today.
   */
  const FUTURE_CHANGES = []

  function phone(screen, mode, design = 'today') {
    // The wrapper reserves the scaled size; the phone itself is scaled with a transform, because
    // CSS zoom lets Safari bump 10pt text up to its minimum font size and break the layout
    const rel = shotPath(screen, mode)
    return `<div class="ph-wrap"><figure class="ph m-${mode} d-${design}" data-screen="${screen.id}" data-mode="${mode}" data-design="${design}">
      <div class="ph-screen">${screen.build(mode, design)}${statusBar(mode)}<i class="ph-island"></i>
        <img class="ph-ref"${shotBase ? ` src="${shotBase + rel}"` : ''} data-shot="${rel}" alt="" loading="lazy" decoding="async"></div>
    </figure></div>`
  }

  root.BirchShipped = {
    SCREENS,
    FUTURE_CHANGES,
    phone,
    SHOT_BASES,
    shotPath,
    /** Points every overlay image, current and future, at the screenshots under `base` */
    setShotBase(base) {
      shotBase = base
      document.querySelectorAll('img.ph-ref[data-shot]').forEach((img) => (img.src = base + img.dataset.shot))
    },
  }
})(typeof window !== 'undefined' ? window : globalThis)
