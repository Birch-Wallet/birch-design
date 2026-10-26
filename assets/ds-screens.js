/*
 * Component boards for the design system page, built from token-driven
 * classes (b-*). The app screens themselves live in ds-shipped.js, rebuilt
 * from the SwiftUI views.
 *
 * Every element a reviewer may want to comment on carries data-c (a key unique
 * within its screen or board) and data-cl (a readable label).
 */
;(function (root) {
  'use strict'

  const I = (name, size, cls) => root.BirchIcons.icon(name, size, cls)
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  const c = (key, label) => ` data-c="${esc(key)}" data-cl="${esc(label)}"`
  const MINUS = '−'

  // ---------------------------------------------------------------------------
  // Generated artwork: QR codes, identicons, transaction flow
  // ---------------------------------------------------------------------------

  function rng(seed) {
    let h = 2166136261
    for (let i = 0; i < seed.length; i++) {
      h ^= seed.charCodeAt(i)
      h = Math.imul(h, 16777619)
    }
    return function () {
      h |= 0
      h = (h + 0x6d2b79f5) | 0
      let t = Math.imul(h ^ (h >>> 15), 1 | h)
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
  }

  /** Decorative QR-shaped pattern (not scannable): finder, timing, random data */
  function qr(seed, n = 29) {
    const r = rng(seed)
    const g = Array.from({ length: n }, () => Array(n).fill(0))
    const reserved = Array.from({ length: n }, () => Array(n).fill(false))
    const finder = (ox, oy) => {
      for (let y = -1; y <= 7; y++)
        for (let x = -1; x <= 7; x++) {
          const X = ox + x
          const Y = oy + y
          if (X < 0 || Y < 0 || X >= n || Y >= n) continue
          reserved[Y][X] = true
          const ring = x === 0 || x === 6 || y === 0 || y === 6
          const core = x >= 2 && x <= 4 && y >= 2 && y <= 4
          g[Y][X] = x >= 0 && x <= 6 && y >= 0 && y <= 6 && (ring || core) ? 1 : 0
        }
    }
    finder(0, 0)
    finder(n - 7, 0)
    finder(0, n - 7)
    for (let i = 8; i < n - 8; i++) {
      g[6][i] = g[i][6] = i % 2 === 0 ? 1 : 0
      reserved[6][i] = reserved[i][6] = true
    }
    let d = ''
    for (let y = 0; y < n; y++)
      for (let x = 0; x < n; x++) {
        if (!reserved[y][x]) g[y][x] = r() < 0.5 ? 1 : 0
        if (g[y][x]) d += `M${x} ${y}h1v1h-1z`
      }
    return `<svg class="b-qr-svg" viewBox="-2 -2 ${n + 4} ${n + 4}" shape-rendering="crispEdges" aria-hidden="true"><rect x="-2" y="-2" width="${n + 4}" height="${n + 4}" style="fill:var(--qrBg)"/><path d="${d}" style="fill:var(--qrInk)"/></svg>`
  }

  /** 4x4 wallet identicon drawn from the earthy token palette */
  function ident(seed) {
    const r = rng(seed)
    const pal = ['var(--brand)', 'var(--success)', 'var(--info)', 'var(--net_signet)', 'var(--warning)', 'var(--net_testnet3)']
    let cells = ''
    for (let y = 0; y < 4; y++)
      for (let x = 0; x < 4; x++) {
        const col = pal[Math.floor(r() * pal.length)]
        const op = (0.55 + r() * 0.45).toFixed(2)
        cells += `<rect x="${x}" y="${y}" width="1" height="1" style="fill:${col};fill-opacity:${op}"/>`
      }
    return `<span class="b-ident"><svg viewBox="0 0 4 4" shape-rendering="crispEdges" aria-hidden="true">${cells}</svg></span>`
  }

  // ---------------------------------------------------------------------------
  // Small building blocks
  // ---------------------------------------------------------------------------

  /** Address in groups of four, alternating ink weights like the app */
  function addr(s) {
    const groups = s.match(/.{1,4}/g) || []
    return `<span class="b-addr">${groups.map((g, i) => `<span class="${i % 2 ? 'a2' : 'a1'}">${g}</span>`).join(' ')}</span>`
  }

  const net = (name, label, key) => `<span class="b-chip chip-net" data-net="${name}"${key ? c(key, `Network badge (${label})`) : ''}>${label}</span>`

  function tabbar(active) {
    const tabs = [
      ['list.bullet.rectangle', 'Transactions'],
      ['arrow.up.right', 'Send'],
      ['arrow.down.left', 'Receive'],
      ['bitcoinsign.circle', 'UTXOs'],
      ['gearshape', 'Settings'],
    ]
    return `<nav class="b-tabbar"${c('tabbar', 'Tab bar')}>${tabs
      .map(([ic, l]) => `<span class="b-tab${l === active ? ' on' : ''}">${I(ic, 22)}<span>${l}</span></span>`)
      .join('')}</nav>`
  }

  function progress(states) {
    return `<div class="b-progress"${c('wizard-progress', 'Setup progress bar')}>${states
      .map((s) => `<i class="${s}"></i>`)
      .join('')}</div>`
  }

  const navLarge = (title, key) =>
    `<div class="b-navlarge"><h1 class="b-large"${c(key || 'large-title', 'Large title')}>${title}</h1><button class="b-iconbtn"${c('more', 'More menu')} aria-label="More">${I('ellipsis', 22)}</button></div>`

  function callout(kind, ic, title, text, key, extra = '') {
    return `<div class="b-callout ${kind}"${key ? c(key, `${kind[0].toUpperCase() + kind.slice(1)} callout: ${title}`) : ''}>
      ${I(ic, 18, 'b-callout-ic')}
      <div class="b-callout-body"><div class="b-callout-title">${title}</div>${text ? `<div class="b-callout-text">${text}</div>` : ''}${extra}</div>
    </div>`
  }

  function txRow(t, i) {
    const icon = { in: 'arrow.down.left', out: 'arrow.up.right', self: 'arrow.triangle.2.circlepath' }[t.dir]
    const sign = t.dir === 'in' ? '+' : t.dir === 'out' ? MINUS : ''
    const status = t.unconf
      ? `<span class="b-status warn">${I('clock', 11)}Unconfirmed</span>`
      : `<span class="b-status ok">${I('checkmark.circle', 11)}${t.conf}</span>`
    return `<div class="b-li"${c('tx-' + i, `Transaction row: ${t.title}${t.unconf ? ' (unconfirmed)' : ''}`)}>
      <span class="b-dir ${t.dir}">${I(icon, 17)}</span>
      <div class="b-li-main"><div class="b-body">${t.title}</div><div class="b-cap c-ink2">${t.label ? `${I('tag', 11)} ${t.label} · ` : ''}${t.date}</div></div>
      <div class="b-li-trail"><div class="b-amt-row b-num">${sign}${t.amt}<span class="b-unit-s"> sats</span></div>${status}</div>
      ${I('chevron.right', 14, 'c-ink3 b-chev')}
    </div>`
  }

  function sigSlots(signed, total) {
    let h = ''
    for (let i = 0; i < total; i++) {
      h += i < signed ? `<span class="b-slot signed">${I('signature', 20)}</span>` : `<span class="b-slot">${i + 1}</span>`
    }
    return h
  }

  function field(label, value, opts = {}) {
    const cls = ['b-field', opts.mono && 'b-mono', opts.focus && 'focus', opts.error && 'error', opts.placeholder && 'b-placeholder'].filter(Boolean).join(' ')
    return `<label class="b-fieldset"${opts.key ? c(opts.key, opts.cl || `${label} field`) : ''}>
      <span class="b-label">${label}</span>
      <span class="${cls}">${value}${opts.focus ? '<i class="b-caret"></i>' : ''}</span>
      ${opts.help ? `<span class="b-help${opts.error ? ' c-danger' : ''}">${opts.help}</span>` : ''}
    </label>`
  }

  const toggle = (on, key) => `<span class="b-toggle${on ? ' on' : ''}"${key ? c(key, `Toggle (${on ? 'on' : 'off'})`) : ''}><i></i></span>`

  function seg(items, on, key) {
    return `<div class="b-seg"${key ? c(key, 'Segmented control') : ''}>${items
      .map((s) => `<span class="${s === on ? 'on' : ''}">${s}</span>`)
      .join('')}</div>`
  }

  const stepper = (label, value, key) =>
    `<div class="b-li tight"${c(key, label + ' stepper')}><span class="b-body">${label}</span><span class="b-spacer"></span>
      <span class="b-stepper"><button aria-label="Decrease">${I('minus', 16)}</button><b class="b-num">${value}</b><button aria-label="Increase">${I('plus', 16)}</button></span></div>`

  const btn = (cls, label, key, cl, ic) =>
    `<button class="b-btn ${cls}"${key ? c(key, cl || label) : ''}>${ic ? I(ic, 18) : ''}<span>${label}</span></button>`

  // ---------------------------------------------------------------------------
  // Screens
  // ---------------------------------------------------------------------------

  const TXS = [
    { dir: 'in', title: 'Received', date: 'Just now', amt: '12,000', unconf: true },
    { dir: 'out', title: 'Sent', date: 'Mar 29, 1:02 AM', amt: '8,717', conf: '6+ conf' },
    { dir: 'in', title: 'Received', date: 'Mar 29, 1:02 AM', amt: '8,754', conf: '6+ conf' },
    { dir: 'self', title: 'Self transfer', date: 'Mar 22, 2:34 PM', amt: '67,279', conf: '6+ conf' },
    { dir: 'out', title: 'Sent', date: 'Mar 20, 12:23 AM', amt: '5,455', conf: '6+ conf', label: 'Coldcard upgrade' },
    { dir: 'in', title: 'Received', date: 'Mar 20, 12:23 AM', amt: '41,904', conf: '6+ conf' },
    { dir: 'out', title: 'Sent', date: 'Mar 18, 9:10 AM', amt: '5,971', conf: '6+ conf' },
  ]

  // ---------------------------------------------------------------------------
  // Component boards (one per mode)
  // ---------------------------------------------------------------------------

  const BTN_ROWS = [
    ['primary', 'Primary', 'b-primary', 'Continue'],
    ['secondary', 'Secondary', 'b-secondary', 'Inspect'],
    ['tertiary', 'Tertiary', 'b-tertiary', 'View all'],
    ['tertiary-quiet', 'Tertiary, neutral', 'b-tertiary b-quiet', 'Back'],
    ['tonal', 'Tonal', 'b-tonal', 'Scan QR'],
    ['tonal-neutral', 'Tonal, neutral', 'b-tonal neutral', 'Copy'],
    ['danger', 'Destructive primary', 'b-danger', 'Delete'],
    ['danger-secondary', 'Destructive secondary', 'b-secondary b-danger-ink', 'Reset'],
    ['danger-tertiary', 'Destructive tertiary', 'b-tertiary b-danger-ink', 'Remove'],
  ]
  const BTN_STATES = [
    ['default', 'Default', ''],
    ['pressed', 'Pressed', 'is-pressed'],
    ['disabled', 'Disabled', 'is-disabled'],
    ['loading', 'Loading', 'is-loading'],
  ]

  function boardButtons() {
    const head = `<div class="mx-head"><span></span>${BTN_STATES.map(([, l]) => `<span>${l}</span>`).join('')}</div>`
    const rows = BTN_ROWS.map(
      ([k, l, cls, text]) =>
        `<div class="mx-row"><span class="mx-label">${l}</span>${BTN_STATES.map(
          ([sk, sl, scls]) =>
            `<button class="b-btn b-mx ${cls} ${scls}"${c(`btn-${k}-${sk}`, `${l} button, ${sl.toLowerCase()}`)}${scls === 'is-disabled' ? ' aria-disabled="true"' : ''}>${scls === 'is-loading' ? '<i class="b-spin"></i>' : ''}<span>${text}</span></button>`,
        ).join('')}</div>`,
    ).join('')
    return `<div class="mx">${head}${rows}</div>`
  }

  function boardButtonPatterns() {
    return `<div class="pat-grid">
      <div class="pat"><div class="pat-label">Flow footer</div><div class="pat-body b-footer flat">
        ${btn('b-primary b-block', 'Create wallet', 'pat-footer-primary', 'Flow footer: primary')}
        ${btn('b-tertiary b-quiet', 'Back', 'pat-footer-back', 'Flow footer: tertiary Back')}</div></div>
      <div class="pat"><div class="pat-label">Disabled, with the reason</div><div class="pat-body b-footer flat">
        ${btn('b-primary b-block is-disabled', 'Review', 'pat-disabled', 'Disabled primary with hint')}
        <span class="b-help b-center">Enter an address and amount to continue</span></div></div>
      <div class="pat"><div class="pat-label">Sheet toolbar</div><div class="pat-body"><div class="b-sheetbar"${c('pat-sheetbar', 'Sheet toolbar')}>
        ${btn('b-secondary b-sm', 'Cancel', 'pat-cancel', 'Bar button: Cancel')}<span class="b-head">Wallet dashboard</span>${btn('b-primary b-sm', 'Done', 'pat-done', 'Bar button: Done')}</div></div></div>
      <div class="pat"><div class="pat-label">In-card utilities</div><div class="pat-body"><div class="b-card b-stack">
        <span class="b-label">Output descriptor</span><span class="b-field b-mono b-textarea">wsh(sortedmulti(2,[07d25f0c/48'/1'/0'/2']tpubDE2g…/0/*,…))</span>
        <div class="b-row b-gap8">${btn('b-tonal b-grow', 'Show QR', 'pat-tonal-qr', 'Tonal: Show QR', 'qrcode')}${btn('b-tonal neutral b-grow', 'Copy', 'pat-tonal-copy', 'Tonal neutral: Copy', 'doc.on.doc')}</div></div></div></div>
      <div class="pat"><div class="pat-label">Destructive confirmation</div><div class="pat-body"><div class="b-card b-stack"${c('pat-confirm', 'Destructive confirmation card')}>
        <span class="b-head">Delete “Birch Vault”?</span><span class="b-foot c-ink2">This removes the wallet from this phone. You can import it again from the output descriptor.</span>
        ${btn('b-danger b-block', 'Delete wallet', 'pat-delete', 'Destructive primary: Delete wallet')}${btn('b-tertiary b-quiet', 'Cancel', 'pat-delete-cancel', 'Tertiary: Cancel')}</div></div></div>
      <div class="pat"><div class="pat-label">Working</div><div class="pat-body b-footer flat">
        <button class="b-btn b-primary b-block is-loading"${c('pat-loading', 'Primary, loading')}><i class="b-spin"></i><span>Broadcasting</span></button>
        <span class="b-help b-center">Sending to your Electrum server</span></div></div>
    </div>`
  }

  function boardCards() {
    return `<div class="b-stack">
      <div class="b-card b-stack"${c('card', 'Card')}>
        <span class="b-label">Card</span><span class="b-body">Groups related content on the ground.</span>
        <span class="b-field"${c('nested', 'Nested fill')}>Nested: fields and rows inside a card</span>
      </div>
      <div class="b-opt b-sel"${c('selected', 'Selected card')}><span class="b-radio on"></span><span class="b-body">Selected</span><span class="b-spacer"></span><span class="b-cap c-ink2">ring + tint</span></div>
      <div class="b-opt"${c('unselected', 'Unselected option')}><span class="b-radio"></span><span class="b-body">Not selected</span></div>
      <div class="b-menu"${c('floating', 'Floating menu')}>
        <span class="b-menu-head"><span class="c-ink2">Edit</span><b>Wallets</b><span class="c-brand">Add</span></span>
        <span class="b-menu-item on">${ident('birch-vault')}<span>Birch Vault</span>${net('testnet4', 'Testnet4')}</span>
        <span class="b-menu-item">${ident('family-reserve')}<span>Family reserve</span>${net('mainnet', 'Mainnet')}</span>
      </div>
    </div>`
  }

  function boardRows() {
    return `<div class="b-stack">
      <div class="b-card flush b-list"${c('tx-rows', 'Transaction rows')}>
        ${[TXS[0], TXS[1], TXS[3], TXS[4]].map(txRow).join('<div class="b-divider inset"></div>')}
      </div>
      <div class="b-card flush b-list"${c('settings-rows', 'Settings rows')}>
        <div class="b-li"><div class="b-li-main"><div class="b-body">App lock</div><div class="b-cap c-ink2">Require Face ID to open Birch</div></div>${toggle(false, 'toggle-off')}</div><div class="b-divider inset"></div>
        <div class="b-li"><div class="b-li-main"><div class="b-body">Show fiat price</div></div>${toggle(true, 'toggle-on')}</div><div class="b-divider inset"></div>
        <div class="b-li"${c('value-row', 'Value picker row')}><span class="b-body">Bitcoin unit</span><span class="b-spacer"></span><span class="b-sub c-brand">sats ${I('chevron.up.chevron.down', 11)}</span></div><div class="b-divider inset"></div>
        <div class="b-li"${c('nav-row', 'Navigation row')}><span class="b-body">Wallet settings</span><span class="b-spacer"></span>${I('chevron.right', 14, 'c-ink3 b-chev')}</div>
      </div>
    </div>`
  }

  function boardInputs() {
    return `<div class="b-card b-stack">
      ${field('Wallet name', 'Birch Vault', { key: 'field-default', cl: 'Text field' })}
      ${field('Host', 'Enter server host', { key: 'field-placeholder', placeholder: true, cl: 'Text field, placeholder' })}
      ${field('Master fingerprint', '73c5da0a', { mono: true, focus: true, key: 'field-focus', cl: 'Mono field, focused' })}
      ${field('Port', '700001', { mono: true, error: true, key: 'field-error', help: 'Port must be between 1 and 65535', cl: 'Field with error' })}
      ${seg(['Mainnet', 'Testnet4', 'Testnet3', 'Signet'], 'Mainnet', 'seg-4')}
      ${seg(['UR', 'BBQR'], 'UR', 'seg-2')}
      <div class="b-card flush b-list nested-list">${stepper('Required signatures', 2, 'stepper')}</div>
    </div>`
  }

  function boardChips() {
    return `<div class="b-card b-stack">
      <span class="b-label">Networks</span>
      <div class="b-wrap">${net('mainnet', 'Mainnet', 'net-mainnet')}${net('testnet4', 'Testnet4', 'net-testnet4')}${net('testnet3', 'Testnet3', 'net-testnet3')}${net('signet', 'Signet', 'net-signet')}</div>
      <span class="b-label">Status</span>
      <div class="b-wrap">
        <span class="b-chip chip-success"${c('chip-confirmed', 'Status chip: Confirmed')}>${I('checkmark.circle', 11)}Confirmed</span>
        <span class="b-chip chip-warning"${c('chip-unconfirmed', 'Status chip: Unconfirmed')}>${I('clock', 11)}Unconfirmed</span>
        <span class="b-chip chip-neutral"${c('chip-used', 'Status chip: Used')}>Used</span>
        <span class="b-chip chip-info"${c('chip-frozen', 'Status chip: Frozen')}>${I('lock.fill', 11)}Frozen</span>
        <span class="b-chip chip-neutral"${c('chip-change', 'Status chip: Change')}>Change</span>
      </div>
      <span class="b-label">Actions and pickers</span>
      <div class="b-wrap">
        <span class="b-chip chip-brand"${c('chip-max', 'Max chip')}>Max</span>
        <span class="b-chip chip-neutral"${c('chip-unit', 'Unit chip')}>sats ${I('chevron.up.chevron.down', 11)}</span>
        <span class="b-chip chip-brand"${c('chip-fee', 'Fee chip')}>Medium</span>
        <span class="b-chip chip-accent"${c('chip-filter', 'Filter chip, on')}>All fields</span>
        <span class="b-chip chip-neutral">In QR</span>
      </div>
    </div>`
  }

  function boardCallouts() {
    return `<div class="b-stack">
      ${callout('info', 'info.circle', 'Only BIP-67 P2WSH multisig is supported', '', 'callout-info')}
      ${callout('success', 'checkmark.shield', 'Inputs verified against wallet', '2 inputs match the amounts this wallet has recorded.', 'callout-success')}
      ${callout('warning', 'exclamationmark.triangle', 'Inputs partially verified', '1 verified, 1 could not be checked. Refresh the wallet, then review the fee before signing.', 'callout-warning')}
      ${callout('danger', 'xmark.octagon', 'Input amounts do not match this wallet', 'Do not sign. The PSBT claims input values this wallet has not seen.', 'callout-danger')}
    </div>`
  }

  function boardProgress() {
    return `<div class="b-card b-stack">
      <span class="b-label">Setup progress</span>${progress(['done', 'done', 'on', '', '', ''])}
      <span class="b-label">Signatures</span>
      <div class="b-row b-gap16">
        <div class="b-sigs"${c('sigs-0', 'Signature slots, 0 of 2')}>${sigSlots(0, 2)}</div>
        <div class="b-sigs"${c('sigs-1', 'Signature slots, 1 of 2')}>${sigSlots(1, 2)}</div>
        <div class="b-sigs"${c('sigs-2', 'Signature slots, 2 of 2')}>${sigSlots(2, 2)}</div>
      </div>
      <span class="b-label">Cosigners</span>
      <div class="b-cslots"${c('cslots', 'Cosigner slots')}><span class="b-cslot done">${I('lock.fill', 16)}<small>1</small></span><span class="b-cslot on">${I('lock.open', 16)}<small>2</small></span><span class="b-cslot">${I('lock.open', 16)}<small>3</small></span></div>
      <span class="b-label">Scan</span><div class="b-meter"${c('meter', 'Scan progress meter')}><i style="width:62%"></i></div>
      <span class="b-label">Sync</span>
      <div class="b-row b-gap16"><span class="b-sync idle"><i></i></span><span class="b-cap c-ink2">Not started</span><span class="b-sync syncing"><i></i></span><span class="b-cap c-ink2">Syncing</span><span class="b-sync"><i></i></span><span class="b-cap c-ink2">Synced</span><span class="b-sync err"><i></i></span><span class="b-cap c-ink2">Error</span></div>
    </div>`
  }

  function boardStates() {
    return `<div class="b-stack">
      <div class="b-card b-empty"${c('empty', 'Empty state')}>
        <span class="b-empty-ic">${I('list.bullet.rectangle', 26)}</span>
        <span class="b-head">No transactions yet</span>
        <span class="b-foot c-ink2">Transactions appear here after Birch finds them on your Electrum server.</span>
        ${btn('b-tonal', 'Show receive address', 'empty-cta', 'Empty state action', 'arrow.down.left')}
      </div>
      <div class="b-card b-empty"${c('locked', 'Locked state')}>
        <span class="b-empty-ic">${I('faceid', 26)}</span>
        <span class="b-head">Birch is locked</span>
        ${btn('b-primary b-block', 'Unlock', 'unlock', 'Primary: Unlock')}
      </div>
      <div class="b-toast"${c('toast', 'Toast')}>${I('checkmark.circle', 16, 'c-success')}<span>Address copied</span></div>
    </div>`
  }

  function boardNav() {
    return `<div class="b-stack">
      <div class="b-navdemo">${navLarge('Receive', 'nav-large')}</div>
      <div class="b-navinline"${c('nav-inline', 'Inline navigation bar')}><button class="b-iconbtn round" aria-label="Back">${I('chevron.left', 18)}</button><span class="b-head">Transaction</span><span style="width:36px"></span></div>
      <div class="b-tabdemo">${tabbar('Send')}</div>
    </div>`
  }

  const BOARDS = {
    buttons: { label: 'Button matrix', build: boardButtons, wide: true },
    patterns: { label: 'Button patterns', build: boardButtonPatterns, wide: true },
    cards: { label: 'Surfaces', build: boardCards },
    rows: { label: 'Rows', build: boardRows },
    inputs: { label: 'Inputs and controls', build: boardInputs },
    chips: { label: 'Chips and badges', build: boardChips },
    callouts: { label: 'Callouts', build: boardCallouts },
    progress: { label: 'Progress and status', build: boardProgress },
    states: { label: 'Empty and system states', build: boardStates },
    nav: { label: 'Navigation', build: boardNav },
  }

  function board(id, mode) {
    const b = BOARDS[id]
    return `<div class="board m-${mode}" data-board="${id}" data-mode="${mode}"><div class="board-tag">${mode === 'light' ? 'Light' : 'Dark'}</div>${b.build()}</div>`
  }

  /** Type specimen rows: [token, sample, class, spec, iOS text style] */
  const TYPE_ROWS = [
    ['amount-xl', '193,885 sats', 'b-amt-xl b-num', 'Amount face · 40 / bold · tabular', 'Custom (scales with Large Title)'],
    ['large-title', 'Send', 'b-large', 'Display face · 34 / title weight', '.largeTitle'],
    ['title-xl', 'Multisig configuration', 'b-title-xl', 'Display face · 28 / title weight', '.title'],
    ['title', 'Review transaction', 'b-title', 'Display face · 22 / semibold', '.title2'],
    ['title3', 'Network fee', 'b-title3', 'Display face · 20 / semibold', '.title3'],
    ['amount-m', '71,234 sats', 'b-amt-m b-num', 'Amount face · 24 / semibold · tabular', 'Custom (.title2)'],
    ['headline', 'Verify receive address', 'b-head', 'Text · 17 / semibold', '.headline'],
    ['body', 'Cold storage top-up', 'b-body', 'Text · body size / regular', '.body'],
    ['subhead', 'Scan this QR code with your signing device', 'b-sub', 'Text · 15 / regular', '.subheadline'],
    ['label', 'Master fingerprint', 'b-label', 'Text · 13 / medium · secondary ink', '.footnote'],
    ['footnote', 'Load the descriptor on your signing device.', 'b-foot', 'Text · 13 / regular', '.footnote'],
    ['caption', 'Mar 29, 1:02 AM', 'b-cap', 'Text · 12 / regular', '.caption'],
    ['caption2', '6+ conf', 'b-cap2', 'Text · 11 / medium', '.caption2'],
    ['mono', '', 'b-mono b-addr-block', 'Mono · 14 / regular · machine data only', '.body.monospaced()'],
  ]

  function typeBoard(mode) {
    return `<div class="board m-${mode}" data-board="type" data-mode="${mode}"><div class="board-tag">${mode === 'light' ? 'Light' : 'Dark'}</div>
      <div class="b-card flush type-list">${TYPE_ROWS.map(
        ([tok, sample, cls, spec, ios]) =>
          `<div class="type-row"${c('type-' + tok, `Type style: ${tok}`)}><div class="type-sample ${cls}">${tok === 'mono' ? addr('tb1qkmp8r90rcqpzdm6u') : sample}</div><div class="type-meta"><code>${tok}</code><span>${spec}</span><span>${ios}</span></div></div>`,
      ).join('')}</div></div>`
  }

  root.BirchScreens = { BOARDS, board, typeBoard, qr, ident, esc }
})(typeof window !== 'undefined' ? window : globalThis)
