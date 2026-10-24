#!/usr/bin/env python3
"""
Builds design/assets/ds-assets.js: the SF Symbols, status bar, QR data and app
icon artwork the shipped-layout screens use.

  python3 design/tools/build-assets.py

Needs macOS (Swift + AppKit render the SF Symbols) and ImageMagick (`magick`)
for the pieces cut from the screenshots: the birch-screenshots submodule at
fastlane/screenshots in birch-wallet, or a clone of it at design/screenshots.
Symbols are discovered by scanning ds-shipped.js for quoted 'name:size:weight'
keys, so adding a symbol to a screen and rerunning this script is all it takes.
Symbols already in ds-assets.js are kept as they are and only new keys are
rendered, because AppKit's symbol rendering can shift by a pixel between macOS
states and the screens are matched to the images already there. Pass --fresh
to render every symbol again.
The app icon comes from birch/Assets.xcassets in birch-wallet; in a standalone
clone the icon already in ds-assets.js is kept.
"""
import base64
import json
import os
import re
import subprocess
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
DESIGN = os.path.dirname(HERE)
REPO = os.path.dirname(DESIGN)
# The birch-screenshots submodule in birch-wallet, or a clone of it next to the page
SHOTS = next((d for d in (os.path.join(REPO, 'fastlane', 'screenshots'), os.path.join(DESIGN, 'screenshots'))
              if os.path.isdir(os.path.join(d, 'dark', 'en-US'))), os.path.join(REPO, 'fastlane', 'screenshots'))
SHIPPED = os.path.join(DESIGN, 'assets', 'ds-shipped.js')
ICONS = os.path.join(REPO, 'birch', 'Assets.xcassets')
OUT = os.path.join(DESIGN, 'assets', 'ds-assets.js')
KEY = re.compile(r"'([a-z0-9]+(?:\.[a-z0-9]+)*:\d+(?:\.\d+)?:(?:ultralight|thin|light|regular|medium|semibold|bold|heavy|black)(?::(?:small|medium|large))?)'")


def shot(mode, name):
    return os.path.join(SHOTS, mode, 'en-US', f'iPhone 17 Pro-{name}.png')


def magick(*args):
    # Leave out the PNG date chunks, so unchanged screenshots rebuild a byte-identical ds-assets.js
    *ops, out = args
    subprocess.run(['magick', *ops, '-define', 'png:exclude-chunks=date,time', out], check=True, capture_output=True)


def b64(path):
    with open(path, 'rb') as f:
        return 'data:image/png;base64,' + base64.b64encode(f.read()).decode()


def existing_symbols():
    """The symbols the last run embedded, so a rerun doesn't re-render them"""
    if '--fresh' in sys.argv:
        return {}
    try:
        with open(OUT, encoding='utf-8') as f:
            m = re.search(r'^  const SYMBOLS = (\{.*\})$', f.read(), re.M)
        return json.loads(m.group(1)) if m else {}
    except OSError:
        return {}


def symbols(tmp):
    with open(SHIPPED, encoding='utf-8') as f:
        keys = sorted(set(KEY.findall(f.read())))
    have = existing_symbols()
    data = {k: have[k] for k in keys if k in have}
    todo = [k for k in keys if k not in data]
    if todo:
        binary = os.path.join(tmp, 'render-symbols')
        subprocess.run(['swiftc', '-O', os.path.join(HERE, 'render-symbols.swift'), '-o', binary], check=True, capture_output=True)
        res = subprocess.run([binary, *todo], check=True, capture_output=True, text=True)
        data.update(json.loads(res.stdout))
    missing = [k for k in keys if k not in data]
    if missing:
        print('missing symbols:', ', '.join(missing), file=sys.stderr)
    return data


def status_bar(tmp):
    """Time, signal and Wi-Fi glyphs as an alpha mask; the charging battery as color art"""
    src = shot('dark', '04-Transactions')
    gray = os.path.join(tmp, 'sb-gray.png')
    mask = os.path.join(tmp, 'sb-mask.png')
    magick(src, '-crop', '860x60+150+66', '+repage', '-colorspace', 'gray', '-level', '13%,100%', gray)
    magick('-size', '860x60', 'xc:white', gray, '-compose', 'copy-opacity', '-composite', 'PNG32:' + mask)
    batt = {}
    for mode, bg in (('dark', 'srgb(36,32,24)'), ('light', 'srgb(227,221,211)')):
        out = os.path.join(tmp, f'batt-{mode}.png')
        magick(shot(mode, '04-Transactions'), '-crop', '93x45+1014+74', '+repage', '-fuzz', '9%', '-transparent', bg, 'PNG32:' + out)
        batt[mode] = b64(out)
    return b64(mask), batt


def device_shot(mode, device, name):
    return os.path.join(SHOTS, mode, 'en-US', f'{device}-{name}.png')


def duo_status(tmp):
    """The iPhone Duo's side status as three alpha masks: the clock, Wi-Fi and signal dots (drawn in the
    ink color), the battery ring (system green) and the charging bolt (ink at 50%). Cut from the closed
    Duo's dark Settings screenshot, where the column sits on the plain ground"""
    src = device_shot('dark', 'iPhone Duo (Closed)', '14-Settings')
    # The bolt's box, in pixels of the 130x199 crop
    bolt = '(i>=54 && i<77 && j>=64 && j<97)'
    out = {}
    for name, fx in (
        ('ink', f'{bolt} || g-max(r,b) > 0.1 ? 0 : (min(r,min(g,b)) - 0.08) / 0.92'),
        ('ring', '(g-max(r,b)) / 0.431'),
        ('bolt', f'{bolt} ? (min(r,min(g,b)) - 0.08) / 0.46 : 0'),
    ):
        alpha = os.path.join(tmp, f'duo-{name}-alpha.png')
        mask = os.path.join(tmp, f'duo-{name}.png')
        magick(src, '-crop', '130x199+1190+257', '+repage', '-fx', fx, '-colorspace', 'gray', alpha)
        magick('-size', '130x199', 'xc:white', alpha, '-compose', 'copy-opacity', '-composite', 'PNG32:' + mask)
        out[name] = b64(mask)
    return out


def ipad_status(tmp):
    """The iPad status bar: time, date, app name, signal and Wi-Fi as an alpha mask (2x), the charging
    battery as color art, and the window's resize grip as a mask"""
    gray = os.path.join(tmp, 'ipad-sb-gray.png')
    mask = os.path.join(tmp, 'ipad-sb-mask.png')
    magick(device_shot('dark', 'iPad Pro 13-inch (M5)', '04-Transactions'), '-crop', '1900x32+50+16', '+repage', '-colorspace', 'gray', '-level', '14%,100%', gray)
    magick('-size', '1900x32', 'xc:white', gray, '-compose', 'copy-opacity', '-composite', 'PNG32:' + mask)
    out = {'mask': b64(mask)}
    # The window's resize grip in the bottom-right corner, opaque #808080 in both modes
    grip_a = os.path.join(tmp, 'ipad-grip-alpha.png')
    grip = os.path.join(tmp, 'ipad-grip.png')
    magick(device_shot('dark', 'iPad Pro 13-inch (M5)', '12-UTXOs'), '-crop', '52x52+2006+2694', '+repage', '-fx', '(g - 0.094) / 0.408', '-colorspace', 'gray', grip_a)
    magick('-size', '52x52', 'xc:white', grip_a, '-compose', 'copy-opacity', '-composite', 'PNG32:' + grip)
    out['grip'] = b64(grip)
    for mode, bg in (('dark', 'srgb(36,32,24)'), ('light', 'srgb(227,221,211)')):
        batt = os.path.join(tmp, f'ipad-batt-{mode}.png')
        magick(device_shot(mode, 'iPad Pro 13-inch (M5)', '04-Transactions'), '-crop', '64x30+1948+17', '+repage', '-fuzz', '9%', '-transparent', bg, 'PNG32:' + batt)
        out[mode] = b64(batt)
    return out


def qr_grid(path, size, x, y, n):
    """Point-sample an n x n QR module grid from a screenshot region"""
    res = subprocess.run(
        ['magick', path, '-crop', f'{size}x{size}+{x}+{y}', '+repage', '-colorspace', 'gray',
         '-filter', 'point', '-resize', f'{n}x{n}!', '-threshold', '50%', 'txt:-'],
        check=True, capture_output=True, text=True)
    grid = [['0'] * n for _ in range(n)]
    for line in res.stdout.splitlines():
        m = re.match(r'(\d+),(\d+):.*?(?:gray|srgb)\((\d+)', line)
        if m:
            gx, gy, v = int(m.group(1)), int(m.group(2)), int(m.group(3))
            grid[gy][gx] = '1' if v < 128 else '0'
    return [''.join(r) for r in grid]


def app_icons(tmp):
    """ThemedAppIcon artwork for each appearance, at 3x the 120pt Welcome size"""
    out = {}
    for mode, name in (('dark', 'AppIconPreviewDark'), ('light', 'AppIconPreviewLight')):
        src = os.path.join(ICONS, f'{name}.imageset', 'AppIcon.png')
        if not os.path.isfile(src):
            break
        dst = os.path.join(tmp, f'icon-{mode}.jpg')
        magick(src, '-resize', '360x360', '-quality', '88', dst)
        with open(dst, 'rb') as f:
            out[mode] = 'data:image/jpeg;base64,' + base64.b64encode(f.read()).decode()
    if len(out) == 2:
        return out
    # Standalone clone: keep the icon the last run embedded
    try:
        with open(OUT, encoding='utf-8') as f:
            m = re.search(r'^    icon: (\{.*\}),$', f.read(), re.M)
        if m:
            print('app icon source not found; keeping the embedded icon', file=sys.stderr)
            return json.loads(m.group(1))
    except OSError:
        pass
    print('app icon source not found', file=sys.stderr)
    return {}


def main():
    with tempfile.TemporaryDirectory() as tmp:
        syms = symbols(tmp)
        status, batt = status_bar(tmp)
        duo = duo_status(tmp)
        ipad = ipad_status(tmp)
        qr = {f'psbt_{m}': qr_grid(shot(m, '31-PSBTQRDisplay'), 1136, 35, 673, 57) for m in ('dark', 'light')}
        qr['receive'] = qr_grid(shot('dark', '23-VerifyWallet-Verify'), 566, 320, 929, 33)
        icon = app_icons(tmp)

    sym_json = {k: {'w': v['w'], 'h': v['h'], 'ink': v['ink'], 'png': v['png']} for k, v in syms.items()}
    js = f"""/* Generated by design/tools/build-assets.py. Do not edit by hand. */
;(function (root) {{
  'use strict'
  const SYMBOLS = {json.dumps(sym_json, separators=(',', ':'))}
  const keys = Object.keys(SYMBOLS)
  const index = Object.fromEntries(keys.map((k, i) => [k, i]))
  if (typeof document !== 'undefined') {{
    const css = keys.map((k, i) => {{
      const s = SYMBOLS[k]
      const url = 'url(data:image/png;base64,' + s.png + ')'
      // Symbols scale with the text size, as Dynamic Type scales them in the app
      return '.y-' + i + '{{width:calc(' + s.w + 'px * var(--ts, 1));height:calc(' + s.h + 'px * var(--ts, 1));-webkit-mask-image:' + url + ';mask-image:' + url + '}}'
    }}).join('\\n')
    const style = document.createElement('style')
    style.id = 'birch-symbols'
    style.textContent = css
    document.head.appendChild(style)
  }}
  const cls = (k) => (k in index ? 'y-' + index[k] : '')
  const size = (k) => SYMBOLS[k] || {{ w: 0, h: 0 }}
  const sym = (k) => {{
    if (!(k in index)) {{
      if (typeof console !== 'undefined') console.warn('Missing SF Symbol', k)
      return ''
    }}
    return '<i class="sy ' + cls(k) + '"></i>'
  }}
  root.BirchAssets = {{
    sym, cls, size,
    status: {json.dumps(status)},
    battDark: {json.dumps(batt['dark'])},
    battLight: {json.dumps(batt['light'])},
    duo: {json.dumps(duo)},
    ipad: {json.dumps(ipad)},
    qr: {json.dumps(qr)},
    icon: {json.dumps(icon)},
  }}
}})(typeof window !== 'undefined' ? window : globalThis)
"""
    with open(OUT, 'w', encoding='utf-8') as f:
        f.write(js)
    print(f'wrote {os.path.relpath(OUT, REPO)}: {len(syms)} symbols, {len(js) // 1024} KB')


if __name__ == '__main__':
    main()
