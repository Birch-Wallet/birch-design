# Birch Design System

Birch is a watch-only Bitcoin multisig coordinator for iOS. This document is the single reference for how it looks and behaves.

| Part | Status |
|---|---|
| 1. Current state | Done. Documents the Birch Light and Birch Dark themes as shipped: build 31, with the setup flow and the seedling loader from [birch-wallet #82](https://github.com/Birch-Wallet/birch-wallet/pull/82). |
| 2. Exploration | In review. The Future design and three color themes in `design-system.html`, tuned and commented in the browser. Future's first changes have shipped; it now carries the Settings cards and the Transactions, wallet picker, Wallet Settings and Edit Cosigners changes from [birch-wallet #90](https://github.com/Birch-Wallet/birch-wallet/pull/90). |
| 3. Final system | Written once an option is chosen and refined: tokens, components, SwiftUI mapping, migration plan, voice and copy. |

## Files

| Path | What it is |
|---|---|
| `design/DESIGN-SYSTEM.md` | This document. |
| `design/README.md`, `design/AGENTS.md` | How to use this repo, for people and for AI agents. The folder is the [birch-design](https://github.com/Birch-Wallet/birch-design) submodule, published at https://birch-wallet.github.io/birch-design/. |
| `design/design-system.html` | Interactive exploration. Open it directly in a browser. Safari is the reference: it renders SF Pro Rounded and SF Mono exactly as iOS does. |
| `design/assets/ds-tokens.js` | Token engine and the presets. Every color is derived from a few OKLCH parameters. |
| `design/assets/ds-shipped.js`, `ds-shipped.css` | The twenty-six app screens, rebuilt point for point from the SwiftUI views for four devices, and the Future design's change log. Every size, spacing, radius, type and color value is a Tune variable. |
| `design/assets/seedling/` | The first sync's loading animation (`SeedlingLoadingView`): eight frames of a birch seed growing into a tree, 360px WebP. |
| `design/assets/ds-assets.js` | Generated: real SF Symbols, the status bars (iPhone, iPhone Duo, iPad), QR modules sampled from the screenshots, and the app icon artwork. |
| `design/assets/ds-screens.js` | Component boards (buttons, inputs, callouts and so on), built from tokens. |
| `design/assets/ds-app.js` | Views, the tuning panel, comments, export and the screenshot harness. |
| `design/tools/build-assets.py`, `render-symbols.swift` | Regenerates `ds-assets.js`. Run it after adding a symbol to a screen. |
| `design/tools/check-page.js` | End-to-end check of the page: drags every Tune control in every preset and exercises comments, export, import, views, shortcuts and saved-state migration. |
| `design/reviews/` | Saved exports (`birch-design-changes-YYYY-MM-DD.md` and `.json`): prompts for Claude Code to update the app. |

---

# Part 1: Current state

Everything below describes the app as it ships today. Values come from `birch/Views/Components/Theme.swift` and the views that use it. Screenshots: `fastlane/screenshots/{light,dark}/en-US/`, the [birch-screenshots](https://github.com/Birch-Wallet/birch-screenshots) submodule.

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
3. **Selection.** Gold tint at 12% plus a 1.5pt gold ring (`birchSelected`). Used for fee options, the cosigner slots in Wallet Settings and the wallet picker.
4. **Primary button.** Full-width, gold fill, 12pt, about 52pt tall, `hbHeadline` label. One per screen in most flows.
5. **Sheet toolbar buttons.** `HBBarButtonStyle`: Done is a prominent gold button and Cancel uses the card fill, both 8pt corners and 34pt tall, replacing the Liquid Glass capsule.
6. **Labels above values.** A small secondary label ("Amount", "Master Fingerprint", "Change Address") above the value, inside a card.
7. **Address chunking.** Addresses are shown in groups of four with alternating weights, in mono, for checking by eye.
8. **Verification chips.** `PSBTVerificationBadge`/`ChangeVerificationBadge`: icon, title and detail on an 8% tint of the state color. The four states (not checked, verified, partial, failed) map to secondary text, success, accent and error.
9. **Progress.** The setup wizard uses a segmented gold bar, only while creating a wallet: Multisig configuration, Import cosigners and Verify wallet are steps 1 to 3. Send uses labeled steps (Recipients, Review, Sign, Broadcast).
10. **Network badge.** Capsule, 11pt semibold, 15% tint of the network color.
11. **QR presentation.** Black on white with quiet-zone padding and a gold glow. Animated UR/BBQR frames.
12. **Tab bar.** The native iOS 26 Liquid Glass bar, tinted with the accent.
13. **Setup footers.** Back on the left as a compact secondary button (`hbCompactSecondaryButton`: `hbHeadline` in gold on the card fill), and the step's action on the right as a compact primary of the same size (`hbCompactPrimaryButton`). The primary is filled, disabled (white on `hbBorder`) while nothing can happen, or outlined (a 1.5pt gold border and gold text, no fill) while the step isn't finished but can still be tapped. Verify wallet and Wallet setup keep a text Back.
14. **In-card utilities.** Actions on a field sit under it inside its card as equal tonal buttons (`HBTonalButton`): 44pt tall, 12pt corners, 15pt semibold with the symbol, gold on a 12% gold tint for the most useful action and ink on the nested fill for the rest. Scan QR and Paste on Import descriptor and Import cosigners.
15. **Field errors.** Validation shows only after the user asks to go on. The field gets a 1.5pt `hbError` border inside its nested fill and the reason under it in `hbLabel` and `hbError` (`hbFieldError`). Editing the field clears it. Next scrolls the first flagged field into view and reads the reason out.
16. **Folder tabs.** Import cosigners puts one tab per cosigner on top of the form card (`CosignerTabs`): the open tab stands 4pt taller and joins the card, whose top corners are square (`hbCard(squareTop:)`); a check in the success color marks a cosigner whose fields all validate. Past six cosigners the tabs scroll.
17. **Machine data wraps at the character.** Keys and descriptors fill every line to the edge instead of breaking after slashes and commas: `CharWrappingTextEditor` (a `UITextView` set to `.byCharWrapping`) for the fields, and `String.charWrapped` in a `Text` for display.

## 1.6 Inconsistencies

**Contrast**
- White text on gold fails: 2.2:1 in dark mode and 3.3:1 in light. This affects every primary button and every filled signature slot.
- Gold text on light surfaces fails: 2.9:1 on cards and 2.5:1 on the ground. This affects Copy Address, Add Label, value pickers ("sats", "Electrum Server"), View All Addresses, the setup footers' Back and outlined Next, and the Scan QR utility.
- Olive success text on dark cards is 3.5:1. Received amounts in the transaction list are hard to read.
- Error text on dark cards is 2.7:1, which includes the field error messages on Import cosigners.
- Switching appearance while a screen is open leaves its segmented controls (Bitcoin Network, Addresses, Protocol, QR settings) with the old palette's track: going from dark to light leaves a near-black track. The track color is set through `UISegmentedControl.appearance()` in `ThemeManager.applyControlAppearance()`, which only affects controls created afterwards.
- The same switch leaves the menu picker values in Settings (Electrum Server, sats, Zeus, USD, System) in the old palette's gold: `#D4A835` instead of `#B28622` after going from dark to light. The pickers are UIKit menus that keep the `.tint()` color they were created with. Toggles change with the palette. The fastlane screenshots set the appearance before the app launches, so they show the right colors.

**Semantics**
- `success`, `secondaryAccent` (`hbSteelBlue`) and the testnet badge are one olive, so "confirmed", "testnet" and "secondary action" look identical.
- Unconfirmed transactions and "partially verified" both use the brand gold, so the brand color doubles as a warning.
- Signet and PDF/Print use system purple, which isn't part of either palette.
- The wallet identicon uses a rainbow palette that doesn't fit the earthy themes.

**Buttons.** There are about ten button looks and no defined tertiary.
- **Filled gold:** Get Started, Review, Create Wallet, Next, Import, and Scan QR on the Send screen.
- **Outlined gold:** Next on Import cosigners until every cosigner is complete.
- **Card fill with gold text:** Next Address, and Back on the setup footers.
- **Tonal:** Scan QR (gold tint) and Paste (nested fill) inside the setup cards.
- **Tinted fills in five colors:** Show Descriptor QR (gold), Copy Descriptor and Test Connection (olive), PDF/Print (purple), Full Refresh (error), Copy debug info (nested).
- **Text buttons in three colors:** Back on Wallet setup and Verify wallet (secondary text), View All Addresses and Inspect PSBT (gold), Copy TXID (olive).
- **Footers in two layouts:** full-width primary with a text Back below (Create Wallet), and a compact secondary Back on the left with a compact primary on the right (Import, Next). Get Started stands alone.
- **Disabled primary:** border fill with white text, which is 2.3:1 in light mode and reads as broken rather than inactive.

**Type and numbers**
- Mono is used for amounts in lists and detail rows as well as for machine data, so "8,717 sats" and a txid look alike.
- Title styles vary: system large titles on tab roots, centered Rounded 28 in setup, inline titles on detail screens, and a custom header on Transactions.

**Shape and spacing**
- There are twelve radius values and two competing screen margins (16 and 24).

## 1.7 Screens and states

### In the screenshots (34 per mode)

Welcome · Wallet Setup · Descriptor Import · Transactions · Wallet Picker · Transaction Detail · Wallet Dashboard · Receive · Addresses · Address Detail · Send (empty, filled) · Network Fee (preset, custom) · Review Transaction (top, bottom) · PSBT Inspector · PSBT QR (default, advanced) · Scan Signed PSBT · Save PSBT · UTXOs · UTXO Detail · Settings · Multisig Configuration (testnet, mainnet) · Import Cosigners (empty, filled, last, flagged) · Verify Wallet (top, backup, verify address) · New Wallet Loading.

### In the code but not in the screenshots

| Area | States |
|---|---|
| App lock (`ContentView`, `PINPadView`) | Face ID / Touch ID prompt, PIN entry, wrong PIN, progressive lockout (60s to 24h), privacy cover in the app switcher, data wipe |
| Broadcast (`BroadcastResultView`) | Ready to broadcast, broadcasting, animated success with countdown, export transaction |
| Bump fee (`BumpFeeView`) | Full RBF flow with its own fee entry, QR display, scan and broadcast. The fee entry step is in the page. |
| Connection (`ConnectionStatusView`) | Connected, error, test result; Sync now, Full refresh, Test connection, Copy debug info |
| Wallet Settings (`WalletInfoView`) | Electrum server test result, rename, the labels import result, delete confirmation; descriptor QR, MP4 export, PDF. The sheet as it opens and Edit Cosigners are in the page. |
| Saved PSBTs | List with swipe to rename or delete, resume-PSBT sheet |
| UTXOs | Filter sheet (in the page), frozen UTXOs, swipe to freeze, coin control picker in Send |
| Empty states | No transactions and the first sync's seedling (both in the page), No UTXOs, no addresses |
| Transaction rows | Unconfirmed (clock, gold), labeled (tag), privacy mode (masked amounts), fiat display |
| Verification | Inputs not checked, verified, partially verified, failed. Change verified, needs a look, failed |
| Sync status | Not started, syncing (pulse), synced, error |
| Networks | All four badges: Mainnet, Testnet4, Testnet3, Signet |
| Validation | Invalid address prefix, amount over spendable, Max is zero, fee rate of 0, port out of range, a missing Electrum host on Mainnet (the Host field flagged), a bad or wrong-network descriptor (the field flagged) |
| Alerts | Insecure SSL, delete wallet, reset Electrum, save changes, exit signing, edit transaction, QR settings changed, log export warning, import labels result, authentication unavailable, rename and delete PSBT, paste signed PSBT, changing between Mainnet and a test network with keys entered, lowering the cosigner count below a filled cosigner, errors |
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

The presets fall into two groups, and the toolbar shows them apart:

- **Designs** can change layout as well as theme. **Today** is the app as it ships, with the exact Theme.swift colors: the before picture. **Future** is the next version of the app's design, built on Today.
- **Color themes** recolor Future's layout without changing it: Catkin, Leaf and Bark, above. Each layout change made in Future shows up in all three, and a theme's export includes Future's design changes.

## Future

Future started as an exact copy of Today, and becomes one again whenever its changes ship. Changes to it are made a few at a time, so each can be judged against the app as it ships, and each one is recorded so the export can describe it:

- **Theme values** (colors, shape, type, spacing, buttons) go in the Future preset in `ds-tokens.js`. The export lists them with the other changes from the shipped app.
- **Layout changes** go in the screen builders in `ds-shipped.js`. Each builder receives the design (`'today'` or `'future'`) as its second argument, and each phone carries a `d-today` or `d-future` class, so a change can branch in the builder or in CSS. Today's screens must not change.
- **Every change**, of either kind, gets an entry in `FUTURE_CHANGES` in `ds-shipped.js`: the screens it touches, what changes, and the SwiftUI files. The overview lists them under "What changes from today", and the export lists them under "Design".

### Changes so far

Future's first changes, the setup flow and the seedling loader, shipped in [birch-wallet #82](https://github.com/Birch-Wallet/birch-wallet/pull/82) and are now part of Today (Part 1). The changes since are below. The rows marked shipped in #90 are in the app already; Today takes them over once `fastlane screenshots` has captured them.

| Screen | Change | SwiftUI |
|---|---|---|
| Transactions | The top-left button is `slider.horizontal.3` (18pt, secondary text) and opens Wallet Settings directly instead of a menu. Dashboard moves to a small `chart.bar.xaxis` icon (15pt, primary text) at the trailing end of the Transactions header, in a 44 × 22pt frame that widens the tap area and makes the header 2pt taller. The labels import and export move to Wallet Settings. Also on Transactions, loading and No transactions. Shipped in [birch-wallet #90](https://github.com/Birch-Wallet/birch-wallet/pull/90). | `TransactionListView.swift` |
| Wallet picker | The panel is 16pt in from each side instead of 35pt, so long names fit. Each row ends in a `slider.horizontal.3` button (17pt, secondary text, 40 × 36pt) that opens that wallet's settings without switching to it. Shipped in #90. | `TransactionListView.swift` (`walletPickerOverlay`) |
| Wallet settings | A grabber and a half-height stop (`birchResizableSheet`): the sheet opens at full height and returns to it when the keyboard appears. Dashboard and Connection Status get the same. A Wallet Labels card above Privacy Mode holds the BIP 329 import and export, by file and by QR, as two rows of tonal buttons (import in the brand tint, export neutral); it only shows for the loaded wallet. The Cosigners card's Edit is plain 15pt text without the pencil. Shipped in #90. | `WalletInfoView.swift` (`WalletLabelsCard`), `Theme.swift` (`BirchResizableSheet`) |
| Edit cosigners | Uses the Import cosigners form, now shared as `CosignerForm`: folder tabs with completion checks, then Label, Extended Public Key with Scan QR and Paste, Master Fingerprint and Derivation Path, with field-level flags. A centered 28pt title replaces the navigation bar, and Cancel and Save Changes sit in the setup footer; Save is outlined until every cosigner is complete. Shipped in #90. | `WalletInfoView.swift` (`EditCosignersView`), `CosignerForm.swift` |
| Settings | The inset grouped List becomes the app's own cards: 12pt corners, the card fill and the light-mode shadow, as on UTXO Detail. Section headers keep the system style (17pt semibold, secondary label color, 4pt in from the card). A card has 16pt sides and 4pt above and below its rows; a row is 8pt above and below and at least 52pt, with an `HBDivider` between rows. A choice (Fee Source, Bitcoin Unit, Price Source, Currency, Theme, Lock After) shows its value in secondary text and a chevron and pushes a card of the options with a gold checkmark, instead of opening a menu: on iOS 26 a menu collapses back into its button and leaves the value misaligned for a moment. In review in [birch-wallet #86](https://github.com/Birch-Wallet/birch-wallet/pull/86). | `SettingsView.swift` |

## How a preset becomes colors

Colors are generated, not picked. Each mode has a tint hue and amount, a ground lightness and a surface step. The brand and accent have a hue, a chroma and a lightness per mode. Semantic colors and networks are hues. From those, `derive()` in `ds-tokens.js`:

1. Builds the surfaces: ground, then card and nested stepping lighter in dark mode, or a white card on a tinted ground in light mode.
2. Walks every text token (`ink2`, `brandInk`, `accentInk`, semantic text) lighter or darker until it passes 4.5:1 on every surface it can sit on. Semantic text must also pass on its own tint.
3. Picks dark or white text for each filled button by whichever contrasts more, unless the preset forces one.

Tuning a slider can't push text below AA. When a secondary or tertiary text slider is dragged past that floor, the token is held at the minimum and the row says so. The Overview section shows the live ratios.

## Screen fidelity

The screens in `design-system.html` are the shipped layouts, not redesigns. Each one is rebuilt from its SwiftUI view, using the same stacks, paddings, spacing and fonts, for each of the devices `fastlane screenshots` captures (see Devices below). With the **Today** preset, the screens line up with `fastlane/screenshots` to within about a point in both modes. **Overlay Screenshot** lays the screenshot over each phone so you can check this yourself.

| Screen | Rebuilt from | Screenshot |
|---|---|---|
| Transactions | `TransactionListView`, `TransactionRowView` | `04-Transactions` |
| Wallet picker | `TransactionListView` (`walletPickerOverlay`) | `05-WalletPicker` |
| Send, empty | `SendFlowView`, `SendAmountView` | `11-Send` |
| Recipients and amount | `SendFlowView`, `SendAmountView` | `27-SendRecipientsFilled` |
| Network fee sheet | `SendFeeSheetView` | `26-NetworkFee-Custom` |
| Review transaction | `SendReviewView`, `PSBTVerificationBadge` | `28-ReviewTransaction-Top` |
| PSBT QR | `PSBTDisplayView` | `31-PSBTQRDisplay` |
| Scan signed PSBT | `PSBTScanView`, `URScannerSheet` | `33-ScanSignedPSBT` |
| Multisig configuration | `MultisigConfigView`, `WalletNameNetworkCard` | `15-MultisigConfig-Testnet4` |
| Import cosigners, empty | `CosignerImportView` | `17-CosignerImport-Empty` |
| Import cosigners | `CosignerImportView`, `CharWrappingTextEditor` | `18-CosignerImport-Cosigner1` |
| Import cosigners, flagged | `CosignerImportView`, `hbFieldError` | `20-CosignerImport-Errors` |
| Verify wallet | `WalletVerifyView` | `21-VerifyWallet-Top` |
| UTXO list | `UTXOListView` | `12-UTXOs` |
| UTXO detail | `UTXODetailView` | `13-UTXODetail` |
| Settings | `SettingsView` | `14-Settings` |
| Welcome | `WelcomeStepView`, `SetupWizardView` | `01-Welcome` |
| Wallet setup | `WalletCreationChoiceView` | `02-Wallet-Setup` |
| Import descriptor | `DescriptorImportView`, `WalletNameNetworkCard`, `CharWrappingTextEditor` | `03-DescriptorImport` |
| Import descriptor, empty | `DescriptorImportView` | None. The Import descriptor rebuild with the field empty: the field at its 120pt minimum showing the format as its placeholder, and Import disabled. |
| Transactions, loading | `TransactionListView` (`transactionContent`), `SeedlingLoadingView`, `SyncStatusDot` | None. A new wallet's first sync: the seedling 100pt under the title, a birch seed growing into a tree over 3s, the syncing dot with its halo pulsing, and its message. Checked against the view built in the simulator. |
| No transactions | `TransactionListView` (`transactionContent`) | None. Synced and empty: ContentUnavailableView 100pt under the title (a 40pt symbol, a 20pt bold title and a 20pt description). Checked in the simulator. |
| Bump fee | `BumpFeeView` (`BumpFeeInputView`, `BumpFeeRateCard`), `HBBarButtonStyle` | None. The fee step as it opens: the rate card expanded, Custom prefilled at the minimum. Checked in the simulator. |
| UTXO filter sheet | `UTXOFilterSheet` | None. At its medium detent over the UTXO list, with the default filter. Checked in the simulator. |
| Wallet settings | `WalletInfoView`, `CosignerCardView`, `BirchResizableSheet` | None. The sheet over Transactions as it opens, at full height. Today is the app before [birch-wallet #90](https://github.com/Birch-Wallet/birch-wallet/pull/90), Future the app after it. The large title's position is estimated (34pt bold, 52pt under the toolbar), not measured. |
| Edit cosigners | `EditCosignersView`, `CosignerForm` | None. The sheet over Wallet Settings with cosigner 1 open. Today is the app before #90, Future the app after it. |

Platform details that the rebuild reproduces:

- **Symbols** are the real SF Symbols, rendered at each call site's point size and weight and used as recolorable masks.
- **Text** uses the iOS line height (1.1934 × size), snapped up to the pixel grid: a third of a point at 3x, half a point on the 2x iPad. A wrapped paragraph is one view, so its lines keep the exact height.
- **Chunked addresses** take a 17pt SF Pro space between groups, because the app joins them with bare `Text(" ")`.
- **TextFields** sit 2pt taller than a `Text` with the same padding, using the font's unrounded line height. An empty TextField sizes to the default 17pt body line (20pt) whatever its font, so the empty fingerprint and wallet name fields are 46pt tall, 3.3pt more than a filled fingerprint. Once a field has held text it keeps its own font's line: on the flagged Import cosigners screen the fingerprint field, which held cosigner 1's fingerprint a moment before, is a filled one's height with the placeholder in it. **CharWrappingTextEditor** (the descriptor and key fields) is a UITextView: 8pt above and below the text, 5pt at the sides, lines 13.14pt apart at 11pt mono. It breaks at the character, so every line is full.
- **The Send amount field** measures 1.33pt taller holding text than showing its "0" placeholder.
- **Card shadows in light mode** also fall on every view inside the card, because `birchCard()` applies `.shadow` without a `.compositingGroup()`: nested fields, pills and buttons inside a card carry a faint 6% shadow. The rebuild doesn't draw these inner shadows yet.
- **The segmented control** takes a 31pt frame and draws its 32pt track 1pt past it, so the network card is 86.67pt tall.
- **The fee and filter sheets** are the iOS 26 floating sheet: on the iPhone laid out full width, then drawn at 386/402 scale, 8pt from the edges, with 12pt corners and a 57pt × 4pt grabber 6pt from the top. The filter sheet stops at its medium detent, 451pt tall.
- **The setup wizard**, on the iPhone, is a full-width sheet at 62pt over the dimmed wallet for the import descriptor, multisig, cosigner and verify steps. Welcome and Wallet setup are the first-launch wizard, full screen. The other devices differ: see Devices.
- **Lists** use the system metrics iOS 27.2 draws: plain lists (Transactions, UTXOs) with 16pt insets and the system chevron; the inset grouped list in Settings with 26pt section corners, section headers, rows and separators 20pt in from the section's edges on the iPhone and the Duo, 52pt minimum rows, 17pt semibold section headers in the system secondary label color, and 63 × 28pt switches. Separators are `#3C3A38` on the dark card and `#DCD9D2` on the light one. The list shapes are drawn by iOS, so Tune's radius controls don't change them.
- **Navigation bars** have the Liquid Glass back button (44pt) and the inline title in the system label color.
- **Sheet toolbars** use `HBBarButtonStyle`: 15pt semibold on the card fill (the prominent one on the brand fill), 34pt tall, 21pt down and 16pt in, around the inline title.
- **SF Symbol frames** sometimes differ from the AppKit render by a point. Where that moves a layout, the builder sets the frame SwiftUI uses (the Welcome feature icons, the Add Label button, the warning symbol on Verify wallet).
- **The app icon** is the artwork from `Assets.xcassets`. On Welcome, a ground-colored 24pt stroke blurred by 12pt fades its edges, as in `WelcomeStepView`.
- **The PSBT and receive QR codes** are the actual module grids sampled from the screenshots.
- **Liquid Glass** uses system colors sampled from the screenshots. **The segmented control** is drawn the way UIKit composites it: the `nested` fill under iOS's translucent track (rgb 118,118,128 at 24% dark, 12% light), with a white thumb in light mode.

Every Tune control reaches these screens, through CSS variables whose Today values equal the shipped layout (listed at the top of `ds-shipped.js`). That makes each design decision testable on the real screen. **Apply interview decisions** in Tune's Layout group sets the four rules from the interview at once: numbers in the amount face, signed amounts, received amounts in ink, and a stacked setup footer.

### Devices

**Device** above the screens (and in Compare) rebuilds every screen for one of the devices the fastlane tour captures, all on iOS 27.2. `DEVICES` in `ds-shipped.js` holds each one's size, safe areas, chrome and layout:

| Device | Size | Chrome | Setup layout |
|---|---|---|---|
| iPhone 17 Pro | 402 × 874pt, 3x | Status bar and Dynamic Island; floating tab bar at the bottom | One column, setup steps in a sheet at 62pt |
| iPhone Duo, closed | 466 × 678pt, 3x | No top inset; an 84pt side column with the clock, a battery ring and a vertical Liquid Glass tab bar (icons only); 34.67pt at the bottom | One column; sheets float 8pt in from the top and sides |
| iPhone Duo, open | 951 × 669pt, 3x | The same side column | Two columns split at the fold (32pt and 24pt margins, a 64pt gap centered on the fold); sheets are 653pt page sheets centered on the screen |
| iPad Pro 13-inch, portrait | 1032 × 1376pt, 2x | Status bar with the date and app name; floating text tab bar 32pt down; the window's resize grip | One 600pt readable column; page sheets 928pt wide, form sheets 580 × 660pt |

What changes on the other devices, beyond size:

- **Lists** on the Duo and iPad take 20pt margins, and on the Duo they and the grouped lists end at the side column, with separators running to that edge. Plain-list chevrons are a point smaller.
- **Navigation** on the Duo leads with the title at the top and puts a 48pt glass back button in the side column under the clock. The iPad's back button sits 10pt in, level with its tab bar.
- **Sheets**: on the Duo the fee and filter sheets float 8pt in and aren't scaled, their content stops at the side column, and sheet toolbars sit 2pt lower (the closed Duo leads with the title beside the first button). On the iPad, Bump fee is a form sheet in the middle of the screen, the fee sheet ends where that form sheet does, and the filter sheet is form-sheet wide at its medium detent. Behind a page or form sheet the wallet dims, its tab bar a little more, with the selected tab turned gray.
- **Setup**: Import descriptor is full screen everywhere but the iPhone's tour; the open Duo splits Welcome, Wallet setup and Import descriptor in two columns; the iPad's steps take 40pt more at the top, and the first-launch wizard starts 32pt down there (no tab bar).
- **Data** in the screenshots is the same on every device, because the tour runs on fixed data (`ScreenshotFixtures` in the app: the price, the fee rates, the clock, the identicons, the chain tip and the transaction). Only the Duo differs, with Touch ID where the others have Face ID, and the builders follow it.
- The Duo, which has its own iOS 27.2 simulator runtime, spaces wrapped address lines 1.67pt further apart than the iPhone and the iPad do. A few long Duo and iPad screens drift by 1 to 2pt mid-screen from rounding differences.
- The flagged Import cosigners screenshot is scrolled on the Duo, where Next brings the flagged key into view: 10.33pt closed and 15pt open. The page scrolls the screen to match.

### The harness

To check a screen against its screenshot, open `design-system.html?harness=<screen>&mode=dark|light&preset=T&device=<device>` at the device's size and scale (`iphone` 402 × 874 at 3x, the default; `duo-closed` 466 × 678 at 3x; `duo-open` 951 × 669 at 3x; `ipad` 1032 × 1376 at 2x). This renders the bare screen at the screenshot's pixel size, with its animations held still (the sync dot's halo at full size, the seedling grown). Screen ids: `home`, `wallet-picker`, `home-loading`, `home-empty`, `bump`, `send-empty`, `send`, `fee`, `review`, `sign`, `scan`, `utxos`, `utxo`, `utxo-filter`, `settings`, `welcome`, `setup`, `descriptor`, `descriptor-empty`, `multisig`, `cosigner-empty`, `cosigner`, `cosigner-errors`, `verify`. Use `preset=F` to see Future. Add `&scroll=<pt>` to scroll it, or `&rules=system` to apply the interview decisions.

## Tune controls

Each control applies to the app screens unless marked *, which means the element exists only in the component sections (the app screens shown have no warnings, error states, destructive buttons, tertiary text or Mainnet badge).

| Group | Controls |
|---|---|
| Brand | Hue, chroma, lightness per mode, text on brand |
| Accent and roles | Second hue on/off; with it on, the accent hue, chroma and lightness, and which elements use it: selection, progress, amounts, active tab, toggles (Settings, the UTXO filter sheet) |
| Dark and light surfaces | Tint hue and amount, ground, surface step or card and field depth, secondary text, tertiary text* |
| Semantic | Success, info, warning*, danger* hues and chroma |
| Networks | Testnet4, Signet, Testnet3, Mainnet* hues and chroma |
| App chrome | Wallet header fill, tab bar glass or solid, glass opacity, sheet dimming |
| Shape | Card, field, button, pill and sheet radius; selection ring; card stroke; light-mode shadow |
| Type | Text size (Dynamic Type scale, symbols included), title face and weight, amount face, numbers in mono or the amount face |
| Spacing | Screen margin, card padding, field padding, vertical spacing, button height, list row height |
| Buttons and links | Utility button style and color, text link color, pressed style, secondary style (Back on the setup footers), disabled style (Review on the empty Send screen, Import on the empty Import descriptor) |
| Layout | Setup footer split or stacked, signed amounts, received amounts in color or ink, Apply interview decisions |

Today shows Theme.swift's exact colors. Editing any color switches it to a generated palette fitted to within about 0.01 ΔE of those colors, and Reset preset restores the exact values.

To re-check the page after a change, run `node design/tools/check-page.js webkit` (or `chromium`). It needs `playwright-core`; set `PLAYWRIGHT_CORE` to an install path if it isn't resolvable from the repo.

## Using `design-system.html`

1. **Pick a preset** in the toolbar, or press 1 to 5. The toolbar groups the designs (Today, Future) apart from the color themes (Catkin, Leaf, Bark). The page opens on Today in Focus view, which shows the preset's tokens, type, the button matrix and patterns, the component boards and the twenty-six app screens in light and dark, for the device chosen above them. **Overlay Screenshot** (O) shows the simulator screenshot on top.
2. **Compare** shows one screen across all presets side by side, with Today if you include it.
3. **Tune** (T) opens the panel. Drag a slider or type a value and press Enter. Every change shows a dot; click the dot to reset that value, or Reset preset for all of them. "Save as preset" keeps a named copy.
4. **Comment** (C) lets you click any element to pin a note. Each pin records the option, the mode, the screen or board, the element and its current computed styles. Section notes sit at the end of each section.
5. **Export** (E) produces a prompt for Claude Code to update the SwiftUI code. It lists the selected preset, the settings and colors that differ from the shipped app (with the Swift names they replace), the comments and notes, and step-by-step instructions. Paste it into Claude Code in birch-wallet, or save it to `design/reviews/`. The JSON version holds the same changes as exact values and can be imported back into the page.

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
