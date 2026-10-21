# AGENTS.md

Instructions for AI coding agents working in this repo or using it from birch-wallet. `README.md` is the version for humans.

## What this repo is

Birch's design system. It is a git submodule of [birch-wallet](https://github.com/Birch-Wallet/birch-wallet), checked out at `design/`. It has two purposes:

1. **Reference for the app as it ships.** Read it before building UI in birch-wallet.
2. **Playground for exploring design changes.** `design-system.html` rebuilds the real app screens and makes every design variable adjustable.

The source of truth is the SwiftUI code in birch-wallet: `birch/Views/Components/Theme.swift` and the views that use it. This repo describes that code. If the two disagree, the code is right and this repo is stale. Fix the docs and tell the user.

Paths in `DESIGN-SYSTEM.md` and in the page are written from the birch-wallet root (`design/...`, `birch/Views/...`, `fastlane/screenshots/...`). From inside this repo, the parent is `../`.

The simulator screenshots live in a separate repo, [birch-screenshots](https://github.com/Birch-Wallet/birch-screenshots), which birch-wallet mounts at `fastlane/screenshots/`. The page and `tools/build-assets.py` look there first, then in `screenshots/` next to the page (a standalone clone, ignored by git, or the copy the GitHub Pages build adds).

The tour that takes them runs on fixed data (`birch/Utilities/ScreenshotFixtures.swift` in birch-wallet): the BTC price, the fee rates, the clock, the wallets' identicons, the chain tip and the transaction it builds. So a new run only changes a screenshot when the app changes, and the builders' values (the $158.92 balance, "2s ago", 28966 confirmations and so on) stay right until then.

The playground is published at https://birch-wallet.github.io/birch-design/ by `.github/workflows/pages.yml` on every push to `main`.

## Building UI in birch-wallet

When a feature needs new screens or UI elements:

1. Read Part 1 of `DESIGN-SYSTEM.md`: color roles (1.2), type (1.3), shape and spacing (1.4), the patterns to keep (1.5), and the known inconsistencies (1.6). Do not copy anything listed in 1.6.
2. Build with the `Theme.swift` primitives: `Color.hb*`, `Font.hb*()`, `.hbCard()`, `.hbPrimaryButton()`, `.hbSecondaryButton()`, `BirchCard`, `BirchSelected`. Don't use inline colors or fonts.
3. Match the closest existing screen. Setup steps follow the setup wizard; transaction steps follow the Send flow.
4. Both appearances ship: Birch Dark and Birch Light. Check the new UI in both.
5. If the feature adds a reusable element or a new pattern, add it to Part 1 and tell the user.
6. Part 2 (Future, Catkin, Leaf, Bark and the interview decisions) is exploration and has not shipped. Don't apply it to app code unless the user asks.

## Applying an export

The page's Markdown export is a prompt for you: it asks you to update the SwiftUI code in birch-wallet. It arrives pasted into the conversation or saved in `reviews/` as `birch-design-changes-YYYY-MM-DD.md`, with a matching `.json` holding the same changes as exact values. Files named `birch-design-review-*` come from an earlier version of the same export.

Each export contains:

- **The selected preset.** Today means "keep the shipped design and apply these changes". Future means "apply Future's design changes and the values listed". A color theme means "move the app to this direction": Future's design changes plus the theme's values.
- **Instructions**, under "How to make the changes". Follow them.
- **Changes from the shipped app.** For Future and the color themes, a Design list of Future's layout and component changes, each with the screens and SwiftUI files. Settings, with readable names, the Tune path, and the shipped and new values. Colors, with their light and dark hex values and the Swift name each one replaces. Only these change.
- **Comments to apply**, each with the screen, element, SwiftUI file and appearance. A comment wins over a table. Comments made on other presets and resolved comments are context only.
- **A reference** with every value of the selected preset.

If a comment asks for a change to the playground rather than the app, make it in this repo instead and say so. After changing the app, bring Part 1 and the Today preset up to date so the reference still matches the app.

## Changing the playground

### Architecture

The page is plain HTML, CSS and JavaScript loaded with `<script>` tags. It has no build step and no dependencies, and it must keep working when opened from `file://`.

| File | Contents |
|---|---|
| `assets/ds-tokens.js` | The OKLCH token engine. `derive()` turns a preset's parameters into tokens and holds every text token at 4.5:1 or better. Presets: T Today and F Future (group `design`), A Catkin, B Leaf and C Bark (group `theme`). T carries `overrides` with the exact `Theme.swift` colors; F starts as a copy of T. |
| `assets/ds-shipped.js`, `ds-shipped.css` | The twenty-four app screens, each rebuilt from its SwiftUI view for four devices (`DEVICES`), and `FUTURE_CHANGES`, the Future design's change log. Every size, spacing, radius, type and color value goes through a CSS variable. The header comment lists the variables and their shipped values. |
| `assets/ds-app.js` | State, `cssFor()` (turns a preset into CSS variables and rules), the Tune panel schema (`DIAL`), comments, export, views and the `?harness=` mode. |
| `assets/ds-screens.js` | The component boards and the type board. |
| `assets/ds-icons.js` | Line icons standing in for SF Symbols on the component boards. |
| `assets/ds-assets.js` | Generated by `tools/build-assets.py`. Never edit it by hand. |
| `assets/seedling/` | The first sync's loading animation on Transactions, loading: eight 360px WebP frames, animated by `.seedling` in `ds-shipped.css`. |
| `.github/workflows/pages.yml` | Publishes `design-system.html` (also as `index.html`), `assets/`, and each screen's screenshot for every device to GitHub Pages. |

### Rules

- **The page must work both from `file://` and from GitHub Pages.** Keep every file it loads under `assets/`, or add it to the workflow's "Assemble the site" step. Don't use `fetch()` for local files, because Safari and Chrome block it on `file://`.

- **Today must match the app almost pixel for pixel, on every device.** Rebuild a screen by reading its SwiftUI view, not by eyeballing the screenshot. Verify it with `design-system.html?harness=<screen>&mode=dark|light&preset=T&device=<device>` in WebKit at the device's size and scale (iPhone 17 Pro 402 × 874 at 3x, `duo-closed` 466 × 678 at 3x, `duo-open` 951 × 669 at 3x, `ipad` 1032 × 1376 at 2x), and diff the result against `../fastlane/screenshots/<mode>/en-US/<device name>-NN-Name.png`. The only intended differences are the light-mode segmented control and Settings picker values (see section 1.6). A screen with no screenshot is checked against the same SwiftUI built in the simulator.
- **Animations hold still in the harness.** An animated part of a screen (the sync dot's halo, the seedling) gets a class and keyframes in `ds-shipped.css`, plus a `body.harness` rule that turns the animation off, so harness renders stay comparable. Its resting style is the still frame, which is also what Reduce Motion shows.
- **Devices.** `DEVICES` in `ds-shipped.js` holds each device's size, safe areas, chrome and layout, and builders read the one being built from `D`. Each phone carries a `dev-<id>` class for device CSS. The iPhone's output must stay identical when you change another device: render all twenty-four iPhone screens before and after, and diff them.
- **Every Tune control must visibly change the app screens.** Controls marked * change the component boards instead. A new control needs an entry in `DIAL`, a CSS variable or rule in `cssFor()`, and a Today value equal to the shipped value. `tools/check-page.js` finds controls from the panel itself, so it covers new ones automatically.
- **Leave Catkin, Leaf and Bark as they are** unless the user asks to change them. They are color themes: they recolor Future's layout and never change it. A layout change made in Future reaches them too.
- **Layout changes belong to Future.** See "Changing Future" below.
- **Saved state** lives in local storage under `birch-ds-v1`, with a schema version `v`. If you change the shape of saved state, bump `v` and extend the migration in `ds-app.js`. Never drop a user's comments or tuned values.
- **Known pitfalls:**
  - Never rebuild the Tune panel during a drag.
  - Number boxes apply their value on Enter or blur, not while the user types.
  - Scale phones with `transform: scale()`, not CSS `zoom`. Safari's minimum font size breaks `zoom`.
- **Adding an SF Symbol:** call `Y('name:size:weight')` in `ds-shipped.js`, then run `python3 tools/build-assets.py`. The script finds symbols by grepping for that call shape and renders only the new ones; the rest keep their images, because AppKit's rendering can shift by a pixel between macOS states and the screens are matched to the images already there (`--fresh` re-renders everything). It needs macOS, Swift, ImageMagick and the screenshots.
- **Adding a screen:** rebuild it from its SwiftUI view, then add an entry to `SCREENS` in `ds-shipped.js` with its id, label, group, builder, screenshot name and Swift files (`shot: null` for a state no screenshot shows; Overlay then skips it). The views, Overlay and the harness all read from that list; a new group also goes in `SCREEN_GROUPS` in `ds-app.js`. A device whose screenshot was taken scrolled gets `scroll: { device: points or 'max' }`, and one whose screenshot can't line up gets a `shotNote`. Add a row to the fidelity table in `DESIGN-SYSTEM.md`, diff the screen against its screenshot on every device in both modes, and update the screen count in `tools/check-page.js`.

### Changing Future

Future is the next version of the app's design. It started as an exact copy of Today, and the user changes it with you a few steps at a time. Part 2 of `DESIGN-SYSTEM.md` lists the changes so far.

When Future's changes ship in the app, Today takes them over: make each Future branch Today's only path in the builders and CSS, empty `FUTURE_CHANGES` and the Part 2 list, update Part 1, and re-diff Today against the new screenshots on every device. Future is then a copy of Today again.

- **Theme values** (colors, shape, type, spacing, buttons, chrome) go in `PRESETS.F` in `ds-tokens.js`, after the copy of T. Edit the copied `overrides` for exact colors.
- **Layout changes** go in the builders in `ds-shipped.js`. Each builder is called as `build(mode, design)`, with `design` `'today'` or `'future'`, and each phone has a `d-today` or `d-future` class. Branch on `design`, or add CSS under `.d-future`. Today's output must stay identical: recheck it against the screenshots after any builder change.
- **Record every change** in `FUTURE_CHANGES` in `ds-shipped.js`: `{ screens: ['home'], change: 'What changes, in one sentence', swift: 'TransactionRowView.swift' }`, with an empty `screens` list for a change to every screen. The overview and the export read from it, and it is the only way a layout change reaches the export.
- Note the change under "Future" in Part 2 of `DESIGN-SYSTEM.md`.
- Every Tune control must still reach Future's screens.

### Verify before you finish

```sh
node tools/check-page.js webkit
node tools/check-page.js chromium
```

Both runs must pass every check with no page errors. The check tunes every preset, Future included. Set `PLAYWRIGHT_CORE` to a `playwright-core` install path if Node can't resolve it. If you touched a screen, re-diff it against its screenshot in both modes. After a deploy, run both again with `--url https://birch-wallet.github.io/birch-design/` to check the hosted copy, which loads over HTTPS and can't read local files.

## When the app changes

If `Theme.swift` or a rebuilt view changes in birch-wallet:

1. Update Part 1 of `DESIGN-SYSTEM.md`.
2. Update the T preset in `ds-tokens.js`: its `overrides` hold the exact colors, and its parametric values are fitted to within about 0.01 ΔE.
3. Update the affected screen in `ds-shipped.js` and `ds-shipped.css`.
4. Regenerate the screenshots in birch-wallet with `fastlane screenshots`, re-diff, then commit them in the `fastlane/screenshots` submodule (birch-screenshots).
5. Once the new screenshots are pushed, rerun the Pages workflow so the hosted Overlay uses them: `gh workflow run pages.yml -R Birch-Wallet/birch-design`.

## Git and the submodule

- Don't commit or push unless the user asks.
- Commit and push in this repo (and in birch-screenshots) first, then commit the updated `design` and `fastlane/screenshots` pointers in birch-wallet. Never point birch-wallet at a commit that hasn't been pushed.
- Exports saved in `reviews/` are committed, so the design history stays together.

## Writing style for the docs

Plain, direct sentences. Prefer tables for reference material. Part 1 describes only what ships; proposals belong in Part 2 or Part 3.
