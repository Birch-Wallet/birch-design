# Birch Design System

Birch is a watch-only Bitcoin multisig coordinator for iOS. This document is the single reference for how it looks and behaves.

| Part | Status |
|---|---|
| 1. Current state | Done. Documents the Birch Light and Birch Dark themes as shipped (build 31). |
| 2. Exploration | In review. Three options in `design-system.html`, tuned and commented in the browser. |
| 3. Final system | Written once an option is chosen and refined: tokens, components, SwiftUI mapping, migration plan, voice and copy. |

## Files

| Path | What it is |
|---|---|
| `design/DESIGN-SYSTEM.md` | This document. |
| `design/README.md`, `design/AGENTS.md` | How to use this repo, for people and for AI agents. The folder is the [birch-design](https://github.com/Birch-Wallet/birch-design) submodule. |
| `design/design-system.html` | Interactive exploration. Open it directly in a browser. Safari is the reference: it renders SF Pro Rounded and SF Mono exactly as iOS does. |
| `design/assets/ds-tokens.js` | Token engine and the presets. Every color is derived from a few OKLCH parameters. |
| `design/assets/ds-shipped.js`, `ds-shipped.css` | The nine app screens, rebuilt point for point from the SwiftUI views. Every size, spacing, radius, type and color value is a Tune variable. |
| `design/assets/ds-assets.js` | Generated: real SF Symbols, the status bar, and QR modules sampled from the screenshots. |
| `design/assets/ds-screens.js` | Component boards (buttons, inputs, callouts and so on), built from tokens. |
| `design/assets/ds-app.js` | Views, the tuning panel, comments, export and the screenshot harness. |
| `design/tools/build-assets.py`, `render-symbols.swift` | Regenerates `ds-assets.js`. Run it after adding a symbol to a screen. |
| `design/tools/check-page.js` | End-to-end check of the page: drags every Tune control in every preset and exercises comments, export, import, views, shortcuts and saved-state migration. |
| `design/reviews/` | Exported reviews (`birch-design-review-YYYY-MM-DD.md` and `.json`) for Claude Code to implement. |

---

# Part 1: Current state

Everything below describes the app as it ships today. Values come from `birch/Views/Components/Theme.swift` and the views that use it. Screenshots: `fastlane/screenshots/{light,dark}/en-US/`.

## 1.1 Theme architecture

- **Five themes exist:** System, Hellbender Dark, Hellbender Light, Birch Dark and Birch Light (`AppTheme`). System follows iOS and shows Birch Dark or Birch Light. Hellbender is legacy and out of scope for this system.
- **`HBTheme`** holds eleven raw colors per theme: `background`, `surface`, `surfaceElevated`, `border`, `textPrimary`, `textSecondary`, `accent`, `heroBackground`, `success`, `error`, `secondaryAccent`.
- **Surface roles** sit on top of the raw colors and are the most consistent part of the current system:

  | Role | Used for | Dark | Light |
  |---|---|---|---|
  | `ground` (`hbBackground`, `hbSheet`) | Screens and sheets | `background` | `surface` (swapped) |
  | `card` (`hbSurface`) | Cards, grouped rows | `surface` | `background` (swapped) |
  | `nested` (`hbSurfaceElevated`, `hbDivider`) | Fields, rows inside cards, segmented track, dividers | `surfaceElevated` | `surface` |
  | `floating` (`hbFloating`) | Popovers and menus | `surfaceElevated` | `background` |

  Light mode swaps ground and card, so cards sit lighter than the screen and lift with a soft shadow. Dark mode steps lighter instead.
- **`ThemeManager`** is a singleton. Colors are read through static `Color.hb*` accessors, so views don't receive the theme through the environment.

## 1.2 Color

### Birch Dark

| Token | Hex | Role |
|---|---|---|
| ground | `#1A1814` | Screen background |
| card | `#242018` | Cards (also `heroBackground`) |
| nested | `#2E2820` | Fields, nested rows, dividers |
| border | `#3D3530` | Disabled primary fill, outlines |
| textPrimary | `#EDE8DF` | Primary text |
| textSecondary | `#A89E92` | Labels and metadata |
| accent | `#D4A835` | Gold: primary buttons, links, selection, toggles, mainnet |
| success | `#6A7A52` | Olive: confirmed, received amounts |
| secondaryAccent | `#6A7A52` | Same olive: "steel blue" role, testnet badge |
| error | `#B03C28` | Errors, destructive |

### Birch Light

| Token | Hex | Role |
|---|---|---|
| ground | `#E3DDD3` | Screen background (beige) |
| card | `#F2EEE6` | Cards |
| nested | `#E3DDD3` | Fields, nested rows (same value as ground) |
| border | `#B0A99D` | Disabled primary fill, outlines |
| textPrimary | `#231F1B` | Primary text |
| textSecondary | `#4F4840` | Labels and metadata |
| accent | `#B28622` | Gold |
| success / secondaryAccent | `#475F39` | Olive (shared) |
| error | `#992E1F` | Errors, destructive |

### Fixed colors outside the theme

- **PSBT inspector map:** dynamic pairs for Global, Input, Output and Signing (`hbPSBTGlobal`, `hbPSBTInput`, `hbPSBTOutput`, `hbPSBTSigning`). This is the only place that already defines separate light and dark values per hue.
- **QR codes:** always black on white, with a soft gold glow (`shadow(hbBitcoinOrange.opacity(0.2), radius: 20)`). Used the same way in six places.
- **Hard-coded system colors:** `Color.purple` (Signet badge and the PDF/Print buttons), `Color.green` (the xpub format toggle in cosigner import and Wallet Settings), `.white` (text on gold and on filled buttons), and a rainbow palette in `WalletIdenticon` and the saved-PSBT list.

## 1.3 Typography

All type is SF: SF Pro, SF Pro Rounded and SF Mono, via `Font.hb*`.

| Style | Definition | Uses |
|---|---|---|
| `hbDisplay(n)` | Rounded, medium | Setup titles (28), app name (34), lock screen (28), result screens (22–24) |
| `hbAmountLarge` | Rounded 36 bold | Balance, transaction amount |
| `hbAmountMedium` | Rounded 24 semibold | Secondary amounts |
| `hbTitle` | Rounded 20 medium | Rare (1 use) |
| `hbHeadline` | Rounded 17 semibold | Primary and secondary button labels, card headers |
| `hbBody(n)` | Default, regular, default 16 | Most text. Sizes 11–20 in use; 14 and 15 are the most common. |
| `hbLabel(n)` | Default, regular, default 13 | Field labels and metadata. 83 uses at 13, plus 10, 11 and 12. |
| `hbMono(n)` / `hbMonoBold(n)` | SF Mono | Addresses, txids, xpubs **and** amounts in lists and detail rows |

- 111 places outside Theme.swift use `.system(size:)` directly instead of an `hb*` style, mostly for icon sizes and small labels.
- Navigation uses the system large title on tab roots (Send, Receive, UTXOs, Settings). Detail screens use an inline title with a circular back button.

## 1.4 Shape, spacing, elevation

- **Radius in the modifiers:** cards 12, nested elements 8, bar buttons 8, primary button 12, sheets 12. Identicons use 6 and capsules are used for badges.
- **Radius actually in use:** 12 (17×), 10 (13×), 8 (12×), 28 (6×, icon previews), 6, 16, 2, 3, 4, 9, 14 and 22. Twelve distinct values.
- **Padding:** horizontal 24 (57×) and 16 (25×) compete as the screen margin. Card padding is 16 (`hbCard`). Primary buttons are 16 vertical, about 52pt tall.
- **Elevation:** light mode cards get a soft shadow (black 6%, radius 8, y 3). Dark mode has no shadows; surfaces step lighter. Cards have no stroke; only the selected state draws a ring.

## 1.5 What is already consistent (keep)

1. **Surface roles.** ground → card → nested, with the light-mode swap. This is the backbone of the new system.
2. **Strokeless cards.** 12pt continuous corners, edges come from the fill step, soft shadow in light mode only.
3. **Selection.** Gold tint at 12% plus a 1.5pt gold ring (`birchSelected`). Used for fee options, cosigner slots and the wallet picker.
4. **Primary button.** Full-width, gold fill, 12pt, about 52pt tall, `hbHeadline` label. One per screen in most flows.
5. **Sheet toolbar buttons.** `HBBarButtonStyle`: Done is a prominent gold button and Cancel uses the card fill, both 8pt corners and 34pt tall, replacing the Liquid Glass capsule.
6. **Labels above values.** A small secondary label ("Amount", "Master Fingerprint", "Change Address") above the value, inside a card.
7. **Address chunking.** Addresses are shown in groups of four with alternating weights, in mono, for checking by eye.
8. **Verification chips.** `PSBTVerificationBadge`/`ChangeVerificationBadge`: icon, title and detail on an 8% tint of the state color. The four states (not checked, verified, partial, failed) map to secondary text, success, accent and error.
9. **Progress.** The setup wizard uses a segmented gold bar. Send uses labeled steps (Recipients, Review, Sign, Broadcast).
10. **Network badge.** Capsule, 11pt semibold, 15% tint of the network color.
11. **QR presentation.** Black on white with quiet-zone padding and a gold glow. Animated UR/BBQR frames.
12. **Tab bar.** The native iOS 26 Liquid Glass bar, tinted with the accent.

## 1.6 Inconsistencies

**Contrast**
- White text on gold fails: 2.2:1 in dark mode and 3.3:1 in light. This affects every primary button and every filled signature slot.
- Gold text on light surfaces fails: 2.9:1 on cards and 2.5:1 on the ground. This affects Copy Address, Add Label, value pickers ("sats", "Electrum Server") and View All Addresses.
- Olive success text on dark cards is 3.5:1. Received amounts in the transaction list are hard to read.
- Error text on dark cards is 2.7:1.
- The light-mode fastlane screenshots show segmented controls with a near-black track (Bitcoin Network, Addresses, Protocol, QR settings). The track color is set through `UISegmentedControl.appearance()` in `ThemeManager.applyControlAppearance()`, which only affects controls created afterwards, so a control created before the light palette applies keeps the dark track. On device in light mode the track is light. It is still a latent bug: switching appearance while a screen is open leaves its segmented controls in the old color.

**Semantics**
- `success`, `secondaryAccent` (`hbSteelBlue`) and the testnet badge are one olive, so "confirmed", "testnet" and "secondary action" look identical.
- Unconfirmed transactions and "partially verified" both use the brand gold, so the brand color doubles as a warning.
- Signet and PDF/Print use system purple, which isn't part of either palette.
- The wallet identicon uses a rainbow palette that doesn't fit the earthy themes.

**Buttons.** There are about eight button looks and no defined secondary or tertiary.
- **Filled gold:** Get Started, Review, Create Wallet, Next, and Scan QR on the Send screen.
- **Card or nested fill with gold text:** Next Address, Scan Descriptor QR, Paste.
- **Tinted fills in five colors:** Show Descriptor QR (gold), Copy Descriptor and Test Connection (olive), PDF/Print (purple), Full Refresh (error), Copy debug info (nested).
- **Text buttons in three colors:** Back (secondary text), View All Addresses and Inspect PSBT (gold), Copy TXID (olive).
- **Footers in two layouts:** full-width primary with Back below (Create Wallet, Get Started), and Back on the left with a compact primary on the right (Import, Next, Next Cosigner, Continue).
- **Disabled primary:** border fill with white text, which is 2.3:1 in light mode and reads as broken rather than inactive.

**Type and numbers**
- Mono is used for amounts in lists and detail rows as well as for machine data, so "8,717 sats" and a txid look alike.
- Title styles vary: system large titles on tab roots, centered Rounded 28 in setup, inline titles on detail screens, and a custom header on Transactions.

**Shape and spacing**
- There are twelve radius values and two competing screen margins (16 and 24).

## 1.7 Screens and states

### In the screenshots (34 per mode)

Welcome · Wallet Setup · Descriptor Import · Transactions · Wallet Picker · Transaction Detail · Wallet Dashboard · Receive · Addresses · Address Detail · Send (empty, filled) · Network Fee (preset, custom) · Review Transaction (top, bottom) · PSBT Inspector · PSBT QR (default, advanced) · Scan Signed PSBT · Save PSBT · UTXOs · UTXO Detail · Settings · Multisig Configuration (testnet, mainnet) · Import Cosigners (empty, filled, last) · Name Your Wallet · Verify Wallet (top, backup, verify address) · New Wallet Loading.

### In the code but not in the screenshots

| Area | States |
|---|---|
| App lock (`ContentView`, `PINPadView`) | Face ID / Touch ID prompt, PIN entry, wrong PIN, progressive lockout (60s to 24h), privacy cover in the app switcher, data wipe |
| Broadcast (`BroadcastResultView`) | Ready to broadcast, broadcasting, animated success with countdown, export transaction |
| Bump fee (`BumpFeeView`) | Full RBF flow with its own fee entry, QR display, scan and broadcast |
| Connection (`ConnectionStatusView`) | Connected, error, test result; Sync now, Full refresh, Test connection, Copy debug info |
| Wallet Settings (`WalletInfoView`) | Edit cosigners, Electrum server, block explorer, gap limit, full refresh, privacy mode, delete wallet; descriptor QR, MP4 export, PDF |
| Saved PSBTs | List with swipe to rename or delete, resume-PSBT sheet |
| UTXOs | Filter sheet, frozen UTXOs, swipe to freeze, coin control picker in Send |
| Empty states | No transactions, No UTXOs, no addresses |
| Transaction rows | Unconfirmed (clock, gold), labeled (tag), privacy mode (masked amounts), fiat display |
| Verification | Inputs not checked, verified, partially verified, failed. Change verified, needs a look, failed |
| Sync status | Not started, syncing (pulse), synced, error |
| Networks | All four badges: Mainnet, Testnet4, Testnet3, Signet |
| Validation | Invalid address prefix, amount over spendable, Max is zero, fee rate of 0, port out of range |
| Alerts | Insecure SSL, delete wallet, reset Electrum, save changes, exit signing, edit transaction, QR settings changed, log export warning, import labels result, authentication unavailable, rename and delete PSBT, paste signed PSBT, errors |
| Layouts | iPad (portrait and landscape), iPhone Duo closed and open (two-column setup across the fold), short screens |

---

# Part 2: Exploration

## Decisions from the interview

| Topic | Decision |
|---|---|
| Scope | Birch Light and Birch Dark only. System follows iOS between them. Hellbender is retired from the design system. |
| Options | One evolution and two bolder directions, each in light and dark. |
| Type | SF family only: SF Pro, SF Pro Rounded, SF Mono. No bundled fonts. |
| Brand hues | A: evolved gold. B: birch-leaf green. C: bark slate, with autumn amber as the one warm accent. |
| Dark grounds | Vary by option: warm-neutral charcoal (A), forest-night (B), cool slate (C). Never brown. |
| Light grounds | Birch-bark white: a cool, faintly tinted off-white with white cards. No beige or cream. |
| Avoid | Cream or ivory grounds, clay or terracotta orange, serif display type, generic system-kit looks. Nothing should resemble a specific company's brand. |
| Amounts | Neutral ink with a +/− sign. Color goes on the direction icon chip only. |
| Numerals | Amounts use SF Pro/Rounded with tabular figures. **SF Mono only for machine data**: addresses, txids, xpubs, fingerprints, derivation paths, PSBT fields. |
| Networks | Each network keeps its own hue, drawn from the palette (no system purple). |
| CTA tiers | Primary, Secondary, Tertiary, plus a Tonal utility button and a destructive variant of each. |
| Flow footers | Full-width primary pinned at the bottom with a tertiary Back underneath. |
| Radius | A and B keep 12 / 8. C goes tighter at 8 / 6. |
| Review tooling | Focus and Compare views, a tuning panel with presets, click-to-pin comments plus section notes, export as Markdown and JSON. |
| Doc extras (final) | SwiftUI token mapping with a migration plan, and voice and copy rules. |
| Claude Design | After the final option is settled, structure the output so `/design-sync` can push it to a claude.ai/design design-system project. |

## The options

| | A · Catkin (evolution) | B · Leaf (bolder) | C · Bark (bolder) |
|---|---|---|---|
| Idea | Today's Birch, refined. Gold named for the birch catkin. | The leaf from the app icon becomes the brand. | Birch bark at dusk: monochrome controls, one warm accent. |
| Primary button | Gold fill, dark text (9.7:1 dark, 8.4:1 light) | Leaf green; dark text in dark mode, white in light | Near-white on slate (dark), deep slate on white (light), about 14.5:1 |
| Accent | Brand only (leaf green if you turn on Second hue) | Brand only (autumn amber if you turn on Second hue) | Autumn amber for amounts, selection, progress, toggles, active tab |
| Dark ground | `#161512` warm-neutral charcoal | `#0F1511` forest-night | `#0F1419` cool slate |
| Light ground | `#F2F1EC` bark white, white cards | `#EEF2ED` green-tinted bark white | `#EBF1F5` slate-tinted bark white |
| Success | Leaf green | Jade, kept apart from the brand green | Leaf green |
| Radius | 12 / 8, capsule chips | 12 / 8, capsule chips | 8 / 6, small-radius chips, hairline card stroke |
| Titles / amounts | Rounded semibold / Rounded | SF Pro bold / Rounded | SF Pro bold / SF Pro |
| Secondary button | Card fill, brand text (as today) | Outlined | Outlined |
| Tertiary button | Brand text | Brand text | Amber text |

A fourth preset, **Today**, renders the shipped Theme.swift colors on the new components as the before picture.

## How a preset becomes colors

Colors are generated, not picked. Each mode has a tint hue and amount, a ground lightness and a surface step. The brand and accent have a hue, a chroma and a lightness per mode. Semantic colors and networks are hues. From those, `derive()` in `ds-tokens.js`:

1. Builds the surfaces: ground, then card and nested stepping lighter in dark mode, or a white card on a tinted ground in light mode.
2. Walks every text token (`ink2`, `brandInk`, `accentInk`, semantic text) lighter or darker until it passes 4.5:1 on every surface it can sit on. Semantic text must also pass on its own tint.
3. Picks dark or white text for each filled button by whichever contrasts more, unless the preset forces one.

Tuning a slider can't push text below AA. When a secondary or tertiary text slider is dragged past that floor, the token is held at the minimum and the row says so. The Overview section shows the live ratios.

## Screen fidelity

The screens in `design-system.html` are the shipped layouts, not redesigns. Each one is rebuilt from its SwiftUI view on the 402 × 874pt iPhone 17 Pro canvas, using the same stacks, paddings, spacing and fonts. With the **Today** preset, the screens line up with `fastlane/screenshots` to within about a point in both modes. **Overlay app** lays the screenshot over each phone so you can check this yourself.

| Screen | Rebuilt from | Screenshot |
|---|---|---|
| Transactions | `TransactionListView`, `TransactionRowView` | `04-Transactions` |
| Recipients and amount | `SendFlowView`, `SendAmountView` | `27-SendRecipientsFilled` |
| Network fee sheet | `SendFeeSheetView` | `26-NetworkFee-Custom` |
| Review transaction | `SendReviewView`, `PSBTVerificationBadge` | `28-ReviewTransaction-Top` |
| PSBT QR | `PSBTDisplayView` | `31-PSBTQRDisplay` |
| Scan signed PSBT | `PSBTScanView`, `URScannerSheet` | `33-ScanSignedPSBT` |
| Multisig configuration | `MultisigConfigView`, `ElectrumServerSetupSection` | `15-MultisigConfig-Testnet4` |
| Import cosigners | `CosignerImportView` | `18-CosignerImport-Cosigner1` |
| Verify wallet | `WalletVerifyView` | `21-VerifyWallet-Top` |

Platform details that the rebuild reproduces:

- **Symbols** are the real SF Symbols, rendered at each call site's point size and weight and used as recolorable masks.
- **Text** uses the iOS line height (1.1934 × size), snapped up to the 1/3pt pixel grid.
- **Chunked addresses** take a 17pt SF Pro space between groups, because the app joins them with bare `Text(" ")`.
- **TextFields** sit 2pt taller than a `Text` with the same padding.
- **The fee sheet** is the iOS 26 floating sheet: laid out full width, then drawn at 386/402 scale, 8pt from the edges, with 12pt corners.
- **The setup wizard** is a full-width sheet at 62pt over the dimmed welcome screen.
- **The PSBT and receive QR codes** are the actual module grids sampled from the screenshots.
- **Liquid Glass** uses system colors sampled from the screenshots. **The segmented control** is drawn the way UIKit composites it: the `nested` fill under iOS's translucent track (rgb 118,118,128 at 24% dark, 12% light), with a white thumb in light mode. The light-mode screenshots show a near-black track that does not appear on device (see 1.6), so light segmented controls are the one place the rebuild intentionally differs from the screenshots.

Every Tune control reaches these screens, through CSS variables whose Today values equal the shipped layout (listed at the top of `ds-shipped.js`). That makes each design decision testable on the real screen. **Apply interview decisions** in Tune's Layout group sets the four rules from the interview at once: numbers in the amount face, signed amounts, received amounts in ink, and a stacked setup footer.

To check a screen against its screenshot, open `design-system.html?harness=<screen>&mode=dark|light&preset=T` at 402 × 874 with device scale 3. This renders the bare screen at 1206 × 2622, the same size as the screenshot. Screen ids: `home`, `send`, `fee`, `review`, `sign`, `scan`, `multisig`, `cosigner`, `verify`. Add `&scroll=<pt>` to scroll it, or `&rules=system` to apply the interview decisions.

## Tune controls

Each control applies to the app screens unless marked *, which means the element exists only in the component sections (the app screens shown have no toggles, errors, secondary or disabled buttons).

| Group | Controls |
|---|---|
| Brand | Hue, chroma, lightness per mode, text on brand |
| Accent and roles | Second hue on/off; with it on, the accent hue, chroma and lightness, and which elements use it: selection, progress, amounts, active tab, toggles* |
| Dark and light surfaces | Tint hue and amount, ground, surface step or card and field depth, secondary text, tertiary text* |
| Semantic | Success, info, warning, danger* hues and chroma |
| Networks | Testnet4, Signet, Testnet3, Mainnet* hues and chroma |
| App chrome | Wallet header fill, tab bar glass or solid, glass opacity, sheet dimming |
| Shape | Card, field, button, pill and sheet radius; selection ring; card stroke; light-mode shadow |
| Type | Text size (Dynamic Type scale, symbols included), title face and weight, amount face, numbers in mono or the amount face |
| Spacing | Screen margin, card padding, field padding, vertical spacing, button height, list row height |
| Buttons and links | Utility button style and color, text link color, pressed style, secondary* and disabled* styles |
| Layout | Setup footer split or stacked, signed amounts, received amounts in color or ink, Apply interview decisions |

Today shows Theme.swift's exact colors. Editing any color switches it to a generated palette fitted to within about 0.01 ΔE of those colors, and Reset preset restores the exact values.

To re-check the page after a change, run `node design/tools/check-page.js webkit` (or `chromium`). It needs `playwright-core`; set `PLAYWRIGHT_CORE` to an install path if it isn't resolvable from the repo.

## Reviewing in `design-system.html`

1. **Pick a preset** in the toolbar, or press 1 to 4. Focus view shows its tokens, type, the button matrix and patterns, the component boards and the nine app screens in light and dark. **Overlay app** (O) shows the simulator screenshot on top.
2. **Compare** shows one screen across all options side by side, with Today if you include it.
3. **Tune** (T) opens the panel. Drag a slider or type a value and press Enter. Every change shows a dot; click the dot to reset that value, or Reset preset for all of them. "Save as preset" keeps a named copy.
4. **Comment** (C) lets you click any element to pin a note. Each pin records the option, the mode, the screen or board, the element and its current computed styles. Section notes sit at the end of each section.
5. **Export** (E) produces Markdown and JSON with the parameter changes, comments, notes, resolved tokens and their Theme.swift mapping. Save them to `design/reviews/` and ask Claude Code to implement them.

State is saved in that browser's local storage. To move to another browser, use Import JSON.

---

# Part 3: Final system

To be written after an option is chosen and refined. It will contain:

- **Tokens:** final light and dark values, one table with roles and the Theme.swift name each replaces.
- **Components:** CTA tiers with states and placement rules, cards and selection, rows, inputs and pickers, chips and badges, callouts, progress, navigation, empty and system states.
- **SwiftUI mapping:** the new `HBTheme` fields and `Color.hb*` accessors, `Font.hb*` mapped to iOS text styles for Dynamic Type, button styles replacing the modifiers, radius and spacing constants.
- **Migration plan:** phased so each step ships safely. Fix contrast first (on-brand text, brand text, segmented control), then button tiers, then mono for machine data only, then radius and spacing cleanup.
- **Voice and copy:** button labels, errors, warnings and Bitcoin terminology.
- **Claude Design:** the package layout `/design-sync` needs.
