# Birch Design

The design system for [Birch](https://github.com/Birch-Wallet/birch-wallet), the watch-only Bitcoin multisig coordinator for iOS.

This repo does two jobs:

1. **Reference for the app as it ships.** It records Birch's current design system: colors, type, shape, components and screens. Use it when building a feature that needs new UI, so the new screens match the rest of the app.
2. **Playground for design changes.** A browser page rebuilds the real app screens and lets you adjust every design variable, try layout changes in the Future design, compare color themes, and pin comments that Claude Code can implement.

**Open the playground: https://birch-wallet.github.io/birch-design/**

## What's here

| Path | What it is |
|---|---|
| `DESIGN-SYSTEM.md` | The written design system. Part 1 is the app as it ships. Part 2 is the exploration: the Future design and the color themes. Part 3 will hold the final system once a direction is chosen. |
| `design-system.html` | The playground. Open it in a browser. There is no build step and no server. |
| `assets/` | The page's scripts and styles. `ds-assets.js` is generated; don't edit it by hand. |
| `tools/` | The asset generator and the end-to-end check of the page. |
| `.github/workflows/pages.yml` | Publishes the playground to GitHub Pages. |
| `reviews/` | Exported change prompts, kept with the work they produced. |
| `AGENTS.md` | Instructions for AI coding agents working in this repo. |

## Getting it

This repo is a submodule of birch-wallet, checked out at `design/`.

```sh
git clone --recurse-submodules git@github.com:Birch-Wallet/birch-wallet.git

# or, in an existing clone
git submodule update --init design fastlane/screenshots
```

Two features use the simulator screenshots from [birch-screenshots](https://github.com/Birch-Wallet/birch-screenshots):

- **Overlay Screenshot** lays them over the rebuilt screens.
- **`tools/build-assets.py`** cuts the QR codes and status bar out of them.

birch-wallet has birch-screenshots as a second submodule at `fastlane/screenshots/`, and the page finds it there. In a standalone clone of this repo, clone birch-screenshots into `screenshots/` instead. That folder is ignored by git. Without either, the Overlay button is dimmed and says what's missing.

## Using the playground

Use the [hosted copy](https://birch-wallet.github.io/birch-design/), or open `design-system.html` from your checkout. Use Safari: it renders SF Pro Rounded and SF Mono the same way iOS does. Chrome can only show SF Pro Rounded when the page is opened from a local file. On the hosted copy it falls back to SF Pro, because Apple's license doesn't allow hosting the font.

The toolbar groups the presets in two. **Designs** can change layout as well as theme. **Color themes** only recolor Today's layout.

| Preset | Group | What it is |
|---|---|---|
| **Today** | Design | The app as it ships, using the exact colors from `Theme.swift`. |
| **Future** | Design | The next version of the app's design, built on Today. It starts as an exact copy; layout, type, color and component changes are made here a few at a time. |
| **A · Catkin** | Color theme | An evolution of today's look with a refined gold. |
| **B · Leaf** | Color theme | A bolder direction: the leaf from the app icon becomes the brand color. |
| **C · Bark** | Color theme | A bolder direction: monochrome slate controls with a single autumn amber accent. |

| Key | Action |
|---|---|
| 1 to 5 | Switch preset, in toolbar order |
| T | Tune: sliders for brand, surfaces, type, spacing, shape, buttons and layout |
| C | Comment: click any element to pin a note |
| E | Export a prompt for Claude Code to update the app's Swift code |
| O | Overlay the simulator screenshots on the screens |

The page opens on **Today** in **Focus**. Focus shows one preset in full: tokens, type, buttons, components and the fourteen app screens in light and dark. **Compare** puts one screen side by side across every preset.

The screens cover the wallet (Transactions, UTXO list, UTXO detail, Settings), sending and signing (recipients, network fee, review, PSBT QR, scan), and setup (Welcome, Wallet setup, multisig configuration, cosigners, verify).

Your tuning and comments are saved in that browser's local storage, separately for the hosted copy and for each local file. To move them, export JSON from one and import it in the other.

## From idea to app

1. **Choose.** Start from Today, the app as it ships, from Future, or pick a color theme to move the app to.
2. **Tune and comment.** Adjust values in Tune, pin notes on the elements you want changed, and add section notes.
3. **Export.** The Markdown export is a prompt for Claude Code. It lists the selected preset, every setting and color that differs from the shipped app, and your comments, with instructions for changing the SwiftUI code.
4. **Implement.** Paste it into Claude Code in birch-wallet, or save it to `reviews/` and point Claude Code at the file.
5. **Update this repo.** Once the app changes, bring Part 1 of `DESIGN-SYSTEM.md` and the Today preset up to date. The reference is only useful while it matches the app.

## Keeping it accurate

With the Today preset, the rebuilt screens match the simulator screenshots to within about a point. After changing the page, run the end-to-end check in both engines:

```sh
node tools/check-page.js webkit
node tools/check-page.js chromium
```

To check the hosted copy after a deploy, add `--url https://birch-wallet.github.io/birch-design/`.

The check drags every Tune control in every preset, then exercises comments, export, import, views, shortcuts and upgrades of saved settings. It needs [`playwright-core`](https://www.npmjs.com/package/playwright-core). Set `PLAYWRIGHT_CORE` to its install path if Node can't find it from here. WebKit also needs Playwright's WebKit build (`npx playwright install webkit`). Chromium uses your installed Google Chrome.

After adding an SF Symbol to a screen, regenerate the assets. This needs macOS, Swift and ImageMagick:

```sh
python3 tools/build-assets.py
```

## Publishing

Every push to `main` publishes the playground to GitHub Pages. The build copies the iPhone 17 Pro screenshots from the latest birch-screenshots, and it fails if any screen's screenshot is missing. To pick up new screenshots without changing anything here, run the workflow by hand:

```sh
gh workflow run pages.yml -R Birch-Wallet/birch-design
```

## Updating birch-wallet

birch-wallet pins a specific commit of this repo. Commit and push changes here first, then record the new commit in birch-wallet:

```sh
# in birch-wallet
git -C design pull
git add design
git commit -m "Update design submodule"
```

## Status

| Part | Status |
|---|---|
| 1. Current state | Done, as of build 31. |
| 2. Exploration | In review. |
| 3. Final system | Not started. It will be written once a direction is chosen. |
