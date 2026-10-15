#!/usr/bin/env node
/*
 * End-to-end check of design/design-system.html: every Tune control in every
 * preset, comments, export and import, views, shortcuts and saved-state
 * migration. Drives the page with real mouse and keyboard input.
 *
 *   node design/tools/check-page.js [webkit|chromium] [--presets A,B,C,T] [--skip-tune] [--url <url>]
 *
 * --url checks a served copy instead of the local file, for example the GitHub Pages site:
 * https://birch-wallet.github.io/birch-design/
 *
 * Needs playwright-core. Point PLAYWRIGHT_CORE at an install if it is not
 * resolvable from here; WebKit needs Playwright's WebKit build, chromium uses
 * the installed Google Chrome.
 */
'use strict'

const path = require('path')
const fs = require('fs')
const os = require('os')
const pw = require(process.env.PLAYWRIGHT_CORE || 'playwright-core')

const args = process.argv.slice(2)
const engine = args.find((a) => a === 'webkit' || a === 'chromium') || 'webkit'
const presetArg = args.includes('--presets') ? args[args.indexOf('--presets') + 1] : 'A,B,C,T'
const PRESETS = presetArg.split(',')
const SKIP_TUNE = args.includes('--skip-tune')
const PAGE = args.includes('--url') ? args[args.indexOf('--url') + 1] : 'file://' + path.resolve(__dirname, '..', 'design-system.html')

const results = []
const pass = (area, name, detail = '') => results.push({ ok: true, area, name, detail })
const fail = (area, name, detail = '') => results.push({ ok: false, area, name, detail })
const check = (cond, area, name, detail) => (cond ? pass(area, name, detail) : fail(area, name, detail))

async function settle(p, ms = 40) {
  await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
  if (ms) await p.waitForTimeout(ms)
}

/** Hash of computed styles in the app screens and in the component boards */
function fingerprint(p) {
  return p.evaluate(() => {
    const props = ['color', 'backgroundColor', 'backgroundImage', 'borderTopLeftRadius', 'fontFamily', 'fontSize', 'fontWeight', 'paddingTop', 'paddingLeft', 'boxShadow', 'height', 'width', 'opacity', 'transform', 'stroke', 'fill', 'display', 'flexDirection', 'gap', 'minHeight', 'letterSpacing']
    const hash = (els) => {
      let h = 0
      for (const el of els) {
        const cs = getComputedStyle(el)
        for (const k of props) {
          const v = cs[k] || ''
          for (let i = 0; i < v.length; i++) h = (h * 31 + v.charCodeAt(i)) | 0
        }
      }
      return h
    }
    const screens = [...document.querySelectorAll('.ph-screen')].flatMap((s) => [...s.querySelectorAll('*')])
    const boards = [...document.querySelectorAll('.board')].flatMap((s) => [...s.querySelectorAll('*')])
    return { screens: hash(screens), boards: hash(boards) }
  })
}

async function open(p) {
  await p.goto(PAGE)
  await p.evaluate(() => localStorage.clear())
  await p.reload()
  await p.waitForSelector('#dial .dg')
  await p.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important}' })
  await settle(p, 200)
}

const state = (p) => p.evaluate(() => JSON.parse(localStorage.getItem('birch-ds-v1') || '{}'))
const waitSave = (p) => p.waitForTimeout(380) // state saves on a 300 ms debounce

async function selectPreset(p, id) {
  await p.locator(`#presetSeg [data-preset="${id}"]`).click()
  await settle(p, 120)
}

async function expandAll(p) {
  await p.evaluate(() => document.querySelectorAll('#dial .dg[aria-expanded="false"] .dg-head').forEach((h) => h.click()))
  await settle(p)
}

async function resetPreset(p) {
  const b = p.locator('#dialReset')
  if (await b.isEnabled()) await b.click()
  await settle(p, 60)
  await expandAll(p)
}

/** Drag a range input's thumb by `frac` of its width with real mouse events */
async function drag(p, sel, frac) {
  const loc = p.locator(sel)
  await loc.scrollIntoViewIfNeeded()
  const box = await loc.boundingBox()
  const st = await loc.evaluate((e) => ({ min: +e.min, max: +e.max, v: +e.value }))
  const fx = (st.v - st.min) / (st.max - st.min)
  const x0 = box.x + 8 + fx * (box.width - 16)
  const y = box.y + box.height / 2
  const x1 = Math.max(box.x + 2, Math.min(box.x + box.width - 2, x0 + frac * box.width))
  await p.mouse.move(x0, y)
  await p.mouse.down()
  await p.mouse.move((x0 + x1) / 2, y, { steps: 3 })
  await p.mouse.move(x1, y, { steps: 3 })
  await p.mouse.up()
  await settle(p, 60)
}

async function tuneAudit(p) {
  for (const preset of PRESETS) {
    await selectPreset(p, preset)
    await expandAll(p)
    // Turn the accent on as a separate step so its rows can be tested too
    const rows = await p.evaluate(() =>
      [...document.querySelectorAll('#dial .dr')].map((r) => {
        const rng = r.querySelector('input[type=range]')
        const segs = [...r.querySelectorAll('.dseg button')]
        return {
          path: r.dataset.row,
          label: r.querySelector('.dr-l > span').textContent.replace('*', ''),
          group: r.closest('.dg').dataset.group,
          kind: rng ? 'range' : 'seg',
          comp: !!r.querySelector('sup.only') || r.dataset.preview === 'components',
          pressed: r.dataset.preview === 'components',
          floor: !!r.querySelector('.dr-hint'),
          options: segs.map((b) => b.dataset.val),
        }
      }),
    )
    for (const row of rows) {
      const area = `Tune ${preset}`
      const name = `${row.group} › ${row.label}`
      const expect = row.comp ? 'boards' : 'screens'
      if (row.kind === 'range') {
        const sel = `#dial input[type=range][data-path="${row.path}"]`
        const num = `#dial input[type=number][data-path="${row.path}"]`
        if (!(await p.locator(sel).count())) {
          fail(area, name, 'control missing after re-render')
          continue
        }
        const disabled = await p.locator(sel).isDisabled()
        if (disabled) {
          fail(area, name, 'disabled')
          continue
        }
        const before = await fingerprint(p)
        const v0 = await p.locator(sel).inputValue()
        const st = await p.locator(sel).evaluate((e) => ({ min: +e.min, max: +e.max, v: +e.value }))
        const toward = (st.v - st.min) / (st.max - st.min) > 0.5 ? -0.3 : 0.3
        await drag(p, sel, toward)
        const v1 = await p.locator(sel).inputValue()
        const n1 = await p.locator(num).inputValue()
        const after = await fingerprint(p)
        const moved = v1 !== v0
        const synced = Math.abs(parseFloat(n1) - parseFloat(v1)) < 0.011
        let effect = expect === 'boards' ? after.boards !== before.boards : after.screens !== before.screens
        let detail = `${v0} → ${v1}`
        if (!effect && row.floor) {
          // Held at the contrast floor: the hint must say so, and the other direction must work
          const hint = await p.locator(`#dial .dr[data-row="${row.path}"] .dr-hint`).isVisible()
          const b2 = await fingerprint(p)
          await drag(p, sel, -toward * 1.6)
          const a2 = await fingerprint(p)
          const other = expect === 'boards' ? a2.boards !== b2.boards : a2.screens !== b2.screens
          effect = hint && other
          detail += hint ? ', held at contrast floor with hint; other direction changes it' : ', held at floor without hint'
        }
        check(moved && synced && effect, area, name, `${detail}${moved ? '' : ' (did not move)'}${synced ? '' : ` (number box shows ${n1})`}${effect ? '' : ` (no change in ${expect})`}`)

        // Typing into the number box applies on Enter
        const target = +(st.min + (st.max - st.min) * 0.37).toFixed(3)
        await p.locator(num).fill(String(target))
        await p.locator(num).press('Enter')
        await settle(p, 40)
        const rv = parseFloat(await p.locator(sel).inputValue())
        const step = parseFloat(await p.locator(sel).getAttribute('step'))
        check(Math.abs(rv - target) <= step + 1e-9, area, `${name} (typed value)`, `typed ${target}, slider ${rv}`)
      } else {
        const opts = row.options
        const changed = []
        let pressedOk = true
        for (const val of opts) {
          const btn = p.locator(`#dial .dseg button[data-path="${row.path}"][data-val='${val}']`)
          if (!(await btn.count())) continue
          if ((await btn.getAttribute('aria-pressed')) === 'true') continue
          const before = await fingerprint(p)
          await btn.scrollIntoViewIfNeeded()
          await btn.click()
          await settle(p, 60)
          const after = await fingerprint(p)
          const nowPressed = await p.locator(`#dial .dseg button[data-path="${row.path}"][data-val='${val}']`).getAttribute('aria-pressed')
          if (nowPressed !== 'true') pressedOk = false
          if (expect === 'boards' ? after.boards !== before.boards : after.screens !== before.screens) changed.push(val)
        }
        check(pressedOk && changed.length > 0, area, name, `options that changed the ${expect}: ${changed.join(', ') || 'none'}`)
        if (row.pressed) {
          // Held-down state on a real app-screen button: Scale shrinks it, Dim does not
          const btn = p.locator('#scope [data-screen="send"][data-mode="dark"] .pbtn')
          await btn.scrollIntoViewIfNeeded()
          const box = await btn.boundingBox()
          const held = async () => {
            await p.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
            await p.mouse.down()
            await settle(p, 20)
            const tf = await btn.evaluate((e) => getComputedStyle(e).transform)
            await p.mouse.up()
            return tf
          }
          await p.locator(`#dial .dseg button[data-path="${row.path}"][data-val='"scale"']`).click()
          await settle(p, 40)
          const scaled = await held()
          await p.locator(`#dial .dseg button[data-path="${row.path}"][data-val='"dim"']`).click()
          await settle(p, 40)
          const dimmed = await held()
          check(scaled !== 'none' && dimmed === 'none', area, `${name} (holding a screen button)`, `scale: ${scaled}, dim: ${dimmed}`)
        }
      }
      await resetPreset(p)
    }
  }
}

async function tuneFeatures(p) {
  const area = 'Tune features'
  await selectPreset(p, 'A')
  await expandAll(p)

  // Reset dot on one row
  await drag(p, '#dial input[type=range][data-path="shape.card"]', 0.3)
  check(await p.locator('#dial [data-reset="shape.card"]').count(), area, 'Changed row shows a reset dot')
  await p.locator('#dial [data-reset="shape.card"]').click()
  await settle(p)
  const st0 = await state(p)
  await waitSave(p)
  const st = await state(p)
  check(st.params.A.shape.card === 12 && !(await p.locator('#dial [data-reset="shape.card"]').count()), area, 'Reset dot restores the preset value', `card radius ${st.params.A.shape.card}`)

  // Accent rows appear when the second hue is turned on
  const hidden = await p.locator('#dial .dr[data-row="accent.hue"]').count()
  await p.locator(`#dial .dseg button[data-path="accent.enabled"][data-val='true']`).click()
  await settle(p)
  const shown = await p.locator('#dial .dr[data-row="accent.hue"]').count()
  check(hidden === 0 && shown === 1, area, 'Accent controls appear only with the second hue on')
  const roles = await p.locator('#dial .dr[data-row="roles.selection"]').count()
  check(roles === 1, area, 'Accent roles appear with the second hue on')

  // Apply interview decisions
  await p.locator('#applyInterview').click()
  await settle(p)
  await waitSave(p)
  const s2 = await state(p)
  check(s2.params.A.type.numerals === 'proportional' && s2.params.A.layout.signed === true && s2.params.A.layout.received === 'ink' && s2.params.A.layout.footer === 'stacked', area, 'Apply interview decisions sets all four values')
  const stacked = await p.evaluate(() => getComputedStyle(document.querySelector('[data-screen="multisig"] .wizfoot')).flexDirection)
  check(stacked === 'column-reverse', area, 'Interview decisions reach the screens (stacked footer)')

  // Save as preset, then delete it
  await p.locator('#saveName').fill('Review copy')
  await p.locator('#dialSave').click()
  await settle(p, 80)
  const hasCustom = await p.locator('#presetSeg [data-preset="U1"]').count()
  const curTag = await p.locator('#dial .dial-head .tag').first().textContent()
  check(hasCustom === 1 && /Review copy/.test(curTag), area, 'Save as preset adds and selects a new preset')
  await p.locator('#dialDelete').click()
  await p.locator('#delYes').click()
  await settle(p, 80)
  check(!(await p.locator('#presetSeg [data-preset="U1"]').count()), area, 'Deleting a custom preset removes it')

  // Reset preset
  await selectPreset(p, 'A')
  await p.locator('#dialReset').click()
  await settle(p)
  await waitSave(p)
  const s3 = await state(p)
  check(s3.params.A.type.numerals === 'mono' && s3.params.A.accent.enabled === false, area, 'Reset preset restores every value')

  // Today: exact Theme.swift colors until a color is edited, Reset restores them
  await selectPreset(p, 'T')
  await expandAll(p)
  const exactNote = await p.locator('#dial .dg-note.top').textContent()
  const btnBefore = await p.evaluate(() => getComputedStyle(document.querySelector('[data-screen="send"][data-mode="dark"] .pbtn')).backgroundColor)
  await drag(p, '#dial input[type=range][data-path="brand.hue"]', 0.2)
  const genNote = await p.locator('#dial .dg-note.top').textContent()
  const btnAfter = await p.evaluate(() => getComputedStyle(document.querySelector('[data-screen="send"][data-mode="dark"] .pbtn')).backgroundColor)
  check(/exact/.test(exactNote) && /Generated/.test(genNote) && btnBefore !== btnAfter, area, 'Today color sliders move and switch to generated colors', `${btnBefore} → ${btnAfter}`)
  await p.locator('#dialReset').click()
  await settle(p)
  const btnReset = await p.evaluate(() => getComputedStyle(document.querySelector('[data-screen="send"][data-mode="dark"] .pbtn')).backgroundColor)
  check(btnReset === btnBefore && /exact/.test(await p.locator('#dial .dg-note.top').textContent()), area, 'Reset preset restores Today’s exact colors', btnReset)

  // Expand / collapse all
  await p.locator('#dialExpand').click()
  await settle(p)
  const collapsed = await p.locator('#dial .dg[aria-expanded="true"]').count()
  await p.locator('#dialExpand').click()
  await settle(p)
  const expanded = await p.locator('#dial .dg[aria-expanded="true"]').count()
  check(collapsed === 0 && expanded > 10, area, 'Expand all and Collapse all', `${collapsed} open, then ${expanded} open`)

  // Tune panel: close with its button, reopen with T
  await p.locator('#dialClose').click()
  await settle(p)
  const closed = await p.locator('#dial').isHidden()
  await p.keyboard.press('t')
  await settle(p)
  check(closed && (await p.locator('#dial').isVisible()), area, 'Close button and T key toggle the panel')
}

async function comments(p) {
  const area = 'Comments'
  await selectPreset(p, 'A')
  await p.locator('#commentBtn').click()
  check((await p.locator('#commentBtn').getAttribute('aria-pressed')) === 'true', area, 'Comment button turns comment mode on')

  // 1. On an app screen element
  const target = p.locator('#scope [data-screen="review"][data-mode="dark"] [data-c="primary-cta"]')
  await target.scrollIntoViewIfNeeded()
  await target.click({ position: { x: 30, y: 15 } })
  check(await p.locator('#pop').isVisible(), area, 'Clicking a screen element opens the composer')
  const ctx = await p.locator('#pop .ctx').textContent()
  check(/Review transaction/.test(ctx) && /Dark/.test(ctx), area, 'Composer names the screen and mode', ctx.replace(/\s+/g, ' ').trim())
  await p.locator('#pop [data-type="Issue"]').click()
  await p.locator('#popText').fill('Primary button is too tall in dark mode.')
  await p.locator('#pop [data-act="save"]').click()
  await settle(p)
  check((await p.locator('#scope [data-screen="review"][data-mode="dark"] .pin').count()) === 1, area, 'Saved comment pins to the element')

  // 2. On a component board
  const boardEl = p.locator('#scope [data-board="callouts"][data-mode="light"] [data-c="callout-warning"]')
  await boardEl.scrollIntoViewIfNeeded()
  await boardEl.click()
  await p.locator('#popText').fill('Warning callout needs more contrast.')
  await p.keyboard.press(process.platform === 'darwin' ? 'Meta+Enter' : 'Control+Enter')
  await settle(p)
  check((await p.locator('#scope [data-board="callouts"] .pin').count()) === 1, area, 'Cmd+Enter saves a comment on a component board')

  // 3. On a token row
  const tok = p.locator('#scope [data-c="token-brand"]')
  await tok.scrollIntoViewIfNeeded()
  await tok.click({ position: { x: 20, y: 10 } })
  await p.locator('#popText').fill('Brand gold should be warmer.')
  await p.locator('#pop [data-act="save"]').click()
  await settle(p)
  check((await p.locator('.pin').count()) === 3, area, 'Comments on screens, boards and token rows all pin', `${await p.locator('.pin').count()} pins`)

  // Cancel does not save; Escape closes the composer
  await target.click({ position: { x: 30, y: 15 } })
  await p.locator('#popText').fill('discard me')
  await p.locator('#pop [data-act="cancel"]').click()
  await target.click({ position: { x: 30, y: 15 } })
  await p.keyboard.press('Escape')
  check((await p.locator('.pin').count()) === 3 && (await p.locator('#pop').isHidden()), area, 'Cancel and Escape discard a draft')

  // Edit through the pin, then resolve
  await p.locator('#commentBtn').click() // leave comment mode; pins still open
  const pin = p.locator('#scope [data-screen="review"][data-mode="dark"] .pin')
  await pin.click()
  check(await p.locator('#pop').isVisible(), area, 'Clicking a pin opens it for editing')
  await p.locator('#popText').fill('Primary button is too tall in dark mode. Try 48pt.')
  await p.locator('#pop [data-act="save"]').click()
  await settle(p)
  await waitSave(p)
  let st = await state(p)
  check(st.comments.length === 3 && st.comments[0].text.endsWith('48pt.'), area, 'Editing updates the comment')

  // Section notes and overall notes
  await p.locator('#color .notes summary').click()
  await p.locator('[data-note="color"]').fill('Dark ground feels too warm.')
  await waitSave(p)

  // Drawer: list, resolve, locate
  await p.locator('#exportBtn').click()
  await p.locator('#drawer [data-tab="comments"]').click()
  check((await p.locator('#drawer .cm').count()) === 3, area, 'Drawer lists all comments')
  const firstId = st.comments[0].id
  await p.locator(`#drawer [data-resolve="${firstId}"]`).click()
  await settle(p)
  check((await p.locator('#commentCount').textContent()) === '2', area, 'Resolving lowers the open count')
  await p.locator(`#drawer [data-locate="${firstId}"]`).click()
  // Smooth scrolling over a long page takes a moment; poll for up to 3 s
  const inView = await p
    .waitForFunction(() => {
      const r = document.querySelector('#scope [data-screen="review"][data-mode="dark"] [data-c="primary-cta"]').getBoundingClientRect()
      return r.top > 0 && r.bottom < innerHeight
    }, null, { timeout: 3000 })
    .then(() => true, () => false)
  check(inView, area, 'Show scrolls to the comment’s element')

  // Export: Markdown and JSON
  await p.locator('#exportBtn').click()
  await p.locator('#overall').fill('Take Catkin forward.')
  await settle(p, 300)
  const md = await p.locator('#expPre').textContent()
  check(md.includes('Brand gold should be warmer.') && md.includes('Resolved comments (1)') && md.includes('Dark ground feels too warm.') && md.includes('Take Catkin forward.'), area, 'Markdown export holds comments, notes and overall notes')
  check(md.includes('SendReviewView.swift') && md.includes('| `brand` |'), area, 'Markdown export names Swift files and the token table')
  await p.locator('#drawer [data-fmt="json"]').click()
  const json = JSON.parse(await p.locator('#expPre').textContent())
  check(json.schema === 'birch-design-review/1' && json.comments.length === 3 && json.layout && json.layout.spacing, area, 'JSON export parses and includes layout values')

  const [dl] = await Promise.all([p.waitForEvent('download', { timeout: 5000 }).catch(() => null), p.locator('#expDl').click()])
  let file = null
  if (dl) {
    file = path.join(os.tmpdir(), `birch-review-${Date.now()}.json`)
    await dl.saveAs(file)
  }
  check(!!dl && /birch-design-review-.*\.json$/.test(dl.suggestedFilename()), area, 'Download produces a review file', dl ? dl.suggestedFilename() : 'no download event')

  // Clear, then import the downloaded JSON
  await p.locator('#expClear').click()
  await p.locator('#clearYes').click()
  await settle(p)
  check((await p.locator('.pin').count()) === 0, area, 'Clear comments removes them after confirmation')
  if (file) {
    await p.locator('#expImport').click()
    await p.locator('#importFile').setInputFiles(file)
    await settle(p, 200)
    check((await p.locator('#drawer .cm').count()) === 3, area, 'Import JSON restores the comments')
    fs.unlinkSync(file)
  }
  await p.locator('#drawerClose').click()

  // Persistence across reload
  await waitSave(p)
  await p.reload()
  await p.waitForSelector('#dial .dg')
  await settle(p, 300)
  st = await state(p)
  check(st.comments.length === 3 && (await p.locator('.pin').count()) >= 2 && st.notes.color === 'Dark ground feels too warm.', area, 'Comments, pins and notes survive a reload', `${await p.locator('.pin').count()} pins visible`)

  // Delete one
  await p.locator('#exportBtn').click()
  await p.locator('#drawer [data-tab="comments"]').click()
  const delId = st.comments[2].id
  await p.locator(`#drawer [data-del="${delId}"]`).click()
  await settle(p)
  check((await p.locator('#drawer .cm').count()) === 2, area, 'Delete removes a comment')
  await p.locator('#drawerClose').click()

  // C key toggles comment mode, Esc leaves it
  await p.keyboard.press('c')
  const on = await p.evaluate(() => document.body.classList.contains('commenting'))
  await p.keyboard.press('Escape')
  const off = !(await p.evaluate(() => document.body.classList.contains('commenting')))
  check(on && off, area, 'C key and Escape toggle comment mode')
}

async function views(p) {
  const area = 'Views'
  await p.locator('#viewSeg [data-view="compare"]').click()
  await settle(p, 100)
  check((await p.locator('.cmp-grid .ph').count()) === 8, area, 'Compare shows four presets in both modes', `${await p.locator('.cmp-grid .ph').count()} phones`)
  await p.locator('#incToday').uncheck()
  await settle(p, 60)
  check((await p.locator('.cmp-grid .ph').count()) === 6, area, 'Include Today toggles the Today column')
  await p.locator('.chip-x[data-cmp="multisig"]').click()
  await settle(p, 60)
  check((await p.locator('.cmp-grid [data-screen="multisig"]').count()) === 6, area, 'Compare screen chips switch the screen')
  await p.locator('#modeSeg [data-modes="dark"]').click()
  await settle(p, 60)
  check((await p.locator('.cmp-grid .ph').count()) === 3, area, 'Dark only shows one mode in Compare')
  await p.locator('#modeSeg [data-modes="both"]').click()
  await p.locator('#viewSeg [data-view="focus"]').click()
  await settle(p, 100)
  check((await p.locator('#scope .shot').count()) === 9, area, 'Focus shows the nine screens')

  await p.locator('#modeSeg [data-modes="light"]').click()
  await settle(p)
  const darkHidden = await p.locator('#scope [data-screen="home"][data-mode="dark"]').isHidden()
  await p.locator('#modeSeg [data-modes="both"]').click()
  check(darkHidden, area, 'Light only hides the dark phones')

  // Size slider resizes phones and their wrappers
  const w0 = await p.evaluate(() => document.querySelector('#scope .ph-wrap').getBoundingClientRect().width)
  await p.locator('#zoom').fill('0.9')
  await p.locator('#zoom').dispatchEvent('input')
  await settle(p)
  const w1 = await p.evaluate(() => document.querySelector('#scope .ph-wrap').getBoundingClientRect().width)
  const fits = await p.evaluate(() => {
    const w = document.querySelector('#scope .ph-wrap').getBoundingClientRect()
    const f = document.querySelector('#scope .ph').getBoundingClientRect()
    return Math.abs(w.width - f.width) < 1 && Math.abs(w.height - f.height) < 1
  })
  check(w1 > w0 && fits, area, 'Size slider scales phones and keeps layout space in step', `${w0.toFixed(0)} → ${w1.toFixed(0)}`)

  // Overlay
  // The page looks for the screenshots first, so wait for it to turn the overlay on
  await p.locator('#refBtn').click()
  const refShown = await p
    .waitForFunction(() => document.body.classList.contains('show-ref') && getComputedStyle(document.querySelector('#scope .ph-ref')).display !== 'none', null, { timeout: 5000 })
    .then(() => true, () => false)
  // Every phone's overlay points at a real 1206 x 2622 screenshot
  const refSrc = await p.evaluate(() => document.querySelector('#scope .ph-ref').getAttribute('src') || '')
  const refsLoad = await p.evaluate(() =>
    Promise.all(
      [...document.querySelectorAll('#scope .ph-ref')].map(
        (el) =>
          new Promise((resolve) => {
            const img = new Image()
            img.onload = () => resolve(img.naturalWidth === 1206 && img.naturalHeight === 2622)
            img.onerror = () => resolve(false)
            img.src = el.src
          })
      )
    ).then((all) => all.length > 0 && all.every(Boolean))
  )
  check(refsLoad, area, 'Overlay screenshots load for every phone', refSrc.split('/').slice(0, 3).join('/'))
  await p.keyboard.press('o')
  await settle(p)
  const refHidden = await p.evaluate(() => getComputedStyle(document.querySelector('#scope .ph-ref')).display === 'none')
  check(refShown && refHidden, area, 'Overlay button and O key show and hide the screenshot')

  // Page theme cycles system → light → dark → system
  const themes = []
  for (let i = 0; i < 3; i++) {
    await p.locator('#themeBtn').click()
    themes.push(await p.evaluate(() => document.documentElement.getAttribute('data-theme') || 'system'))
  }
  check(themes.join(',') === 'light,dark,system', area, 'Page theme button cycles', themes.join(' → '))

  // Number keys switch presets
  await p.keyboard.press('3')
  await settle(p)
  check((await p.locator('#presetSeg [aria-pressed="true"]').getAttribute('data-preset')) === 'C', area, 'Number keys switch presets')
  await p.keyboard.press('1')

  // Rail navigation
  await p.locator('#rail a[href="#buttons"]').click()
  await settle(p, 400)
  const top = await p.evaluate(() => document.getElementById('buttons').getBoundingClientRect().top)
  check(top < 200 && top > -20, area, 'Section rail scrolls to a section', `top ${top.toFixed(0)}px`)

  // E opens export, Esc closes
  await p.keyboard.press('e')
  const drawerOpen = await p.locator('#drawer').isVisible()
  await p.keyboard.press('Escape')
  check(drawerOpen && (await p.locator('#drawer').isHidden()), area, 'E opens Export and Escape closes it')

  // Copying a token value
  await p.locator('#scope .chex').first().click()
  await settle(p, 100)
  check(/Copied|Copy failed/.test(await p.locator('#toast').textContent()), area, 'Clicking a token value copies it (or explains why not)')
}

async function migration(p) {
  const area = 'Saved state'
  const v1 = await p.evaluate(() => {
    const T = window.BirchTokens
    const params = {}
    for (const id of ['A', 'B', 'C', 'T']) {
      const x = JSON.parse(JSON.stringify(T.PRESETS[id]))
      delete x.layout
      delete x.chrome
      x.density = { gutter: 16, cardPad: 16, buttonH: 52, rowH: 58, gap: 12 }
      x.type.body = 16
      x.shape.chip = 12
      params[id] = x
    }
    params.A.brand.hue = 100 // a real tune that must survive
    return { v: 1, current: 'A', params, custom: {}, rules: 'system', comments: [{ id: 'c1', n: 1, type: 'Change', text: 'Old comment', status: 'open', opt: 'A', optName: 'Catkin', mode: 'dark', scope: 'screen:home', scopeLabel: 'Wallet › Transactions', key: 'balance', label: 'Balance', x: 50, y: 50 }], notes: {}, overall: '', nextN: 2 }
  })
  await p.evaluate((s) => localStorage.setItem('birch-ds-v1', JSON.stringify(s)), v1)
  await p.reload()
  await p.waitForSelector('#dial .dg')
  await settle(p, 300)
  await waitSave(p)
  await p.locator('#dialCopy').click() // any action that saves
  await waitSave(p)
  const st = await p.evaluate(() => JSON.parse(localStorage.getItem('birch-ds-v1')))
  const margin = await p.evaluate(() => getComputedStyle(document.querySelector('#scope [data-screen="review"][data-mode="dark"] .pbtn').parentElement).paddingLeft)
  check(st.v === 2 && st.params.A.density.gutter === 24 && st.params.A.brand.hue === 100 && st.comments.length === 1 && !('rules' in st), area, 'v1 state migrates: new layout defaults, tunes and comments kept', `gutter ${st.params.A.density.gutter}, hue ${st.params.A.brand.hue}, margin ${margin}`)
}

;(async () => {
  const launch = engine === 'webkit' ? pw.webkit.launch() : pw.chromium.launch({ channel: 'chrome' })
  const browser = await launch
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 }, acceptDownloads: true })
  const p = await ctx.newPage()
  const errors = []
  p.on('pageerror', (e) => errors.push(e.message))
  p.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  const t0 = Date.now()
  await open(p)
  for (const [name, fn] of [['tune audit', SKIP_TUNE ? null : tuneAudit], ['tune features', tuneFeatures], ['comments', comments], ['views', views], ['migration', migration]]) {
    if (!fn) continue
    try {
      await fn(p)
    } catch (e) {
      fail(name, 'threw', e.message.split('\n')[0])
    }
  }
  check(errors.length === 0, 'Page', 'No script errors', errors.join(' | '))
  await browser.close()

  const bad = results.filter((r) => !r.ok)
  const byArea = {}
  for (const r of results) (byArea[r.area] = byArea[r.area] || []).push(r)
  for (const [area, rs] of Object.entries(byArea)) {
    const n = rs.filter((r) => r.ok).length
    console.log(`\n${area}: ${n}/${rs.length} passed`)
    for (const r of rs) if (!r.ok || process.env.VERBOSE) console.log(`  ${r.ok ? 'ok  ' : 'FAIL'} ${r.name}${r.detail ? ' — ' + r.detail : ''}`)
  }
  console.log(`\n${engine}: ${results.length - bad.length}/${results.length} passed in ${((Date.now() - t0) / 1000).toFixed(0)}s`)
  process.exit(bad.length ? 1 : 0)
})()
