---
name: Sanctuary Nocturne
colors:
  surface: '#051613'
  surface-dim: '#020b09'
  surface-bright: '#2b3d39'
  surface-container-lowest: '#02110e'
  surface-container-low: '#081d19'
  surface-container: '#0e2924'
  surface-container-high: '#15352f'
  surface-container-highest: '#1c423b'
  on-surface: '#fbf9f0'
  on-surface-variant: '#9ab3ac'
  inverse-surface: '#d3e7e1'
  inverse-on-surface: '#223430'
  outline: '#91927d'
  outline-variant: '#464837'
  surface-tint: '#bdd14b'
  primary: '#ffffff'
  on-primary: '#2c3400'
  primary-container: '#d8ed64'
  on-primary-container: '#5d6b00'
  inverse-primary: '#586400'
  secondary: '#abcec5'
  on-secondary: '#163630'
  secondary-container: '#304f48'
  on-secondary-container: '#9ebfb7'
  tertiary: '#ffffff'
  on-tertiary: '#1e3530'
  tertiary-container: '#cee8e0'
  on-tertiary-container: '#526963'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d8ed64'
  primary-fixed-dim: '#bdd14b'
  on-primary-fixed: '#191e00'
  on-primary-fixed-variant: '#414b00'
  secondary-fixed: '#c7eae1'
  secondary-fixed-dim: '#abcec5'
  on-secondary-fixed: '#00201b'
  on-secondary-fixed-variant: '#2d4c46'
  tertiary-fixed: '#cee8e0'
  tertiary-fixed-dim: '#b2ccc5'
  on-tertiary-fixed: '#081f1b'
  on-tertiary-fixed-variant: '#344b46'
  background: '#051613'
  on-background: '#d3e7e1'
  surface-variant: '#273834'
  text-muted: '#5c7972'
  border-subtle: rgba(251, 249, 240, 0.08)
  border-structural: '#1c423b'
  bubble-outgoing: '#e0f56b'
  bubble-incoming: '#0e2924'
typography:
  display-lg:
    fontFamily: Manrope
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Manrope
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 34px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Manrope
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  title-md:
    fontFamily: Manrope
    fontSize: 17px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: DM Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: DM Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: DM Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: DM Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: DM Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: DM Sans
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.03em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-mobile: 0.75rem
  margin: 1.5rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

The design system translates the intimate, private sanctuary into an enveloping, late-night haven tailored for focused, confidential communication. Emphasizing privacy as an atmosphere of deep rest and security, the visual language adopts a deep midnight bottle green foundation paired with high-contrast, luminescent accents.

Drawing from modern dark mode minimalism and atmospheric editorial styling, the interface feels tactile, grounded, and discreet. Interfaces eliminate aggressive luminescence in favor of rich, dark botanical depths where text glimmers warmly like neo-pearl on velvet. Vivid acid-yellow accents puncture the darkness with electric precision, signaling conversational momentum, unread signals, and primary actions without disturbing the serene baseline.

## Colors

The dark-mode palette is built on tonal tiers of midnight bottle green, counterbalanced by warm pearl typography and electric yellow triggers:

- **Surface & Canvas (`#041512` / `#072923`)**: Deepest nocturnal green acting as the canvas bedrock. It establishes a calming, battery-efficient, low-glare backdrop.
- **Tonal Hierarchy**: Elevation steps sequentially from `#020b09` (Surface Dim) through `#081d19` (Surface Container Low), `#0e2924` (Surface Container), `#15352f` (Surface Container High), to `#1c423b` (Surface Container Highest).
- **Text Primary / Neo Pearl (`#FBF9F0`)**: A warm, desaturated off-white providing crisp, glare-free legibility across dark surfaces.
- **Text Secondary & Muted (`#9AB3AC` / `#5C7972`)**: Organic mossy greys calibrated for secondary metadata, read receipts, and timestamps without drawing peripheral focus.
- **Vivid Yellow (`#E0F56B`)**: The energetic catalyst. Applied to outgoing message bubbles, unread notification dots, active tab bars, and primary call-to-actions. Any text over Vivid Yellow must strictly render in deep bottle green (`#072923`) to meet WCAG AA standards.
- **Borders & Dividers**: Low-opacity pearl borders (`rgba(251, 249, 240, 0.08)`) or solid container borders (`#1C423B`) define crisp boundaries while preventing visual fragmentation.

## Typography

The typographic system pairs the structural, geometric warmth of **Manrope** for navigation titles, headers, and modal headings with the humanistic, legible cadence of **DM Sans** for conversational message content and metadata.

Chat dialogue renders primarily at `body-md` (15px / 22px) in Neo Pearl (`#FBF9F0`) within incoming bubbles, and bottle green (`#072923`) within outgoing bubbles. Small utility copy, encryption notices, timestamps, and message status ticks are standardized onto `label-sm` with slight positive letter spacing to maintain legibility against dark bottle green tonal backdrops.

## Layout & Spacing

The layout is structured around an 8px baseline spatial rhythm. On mobile devices (&lt; 600px), views operate with 16px screen margins (`margin-mobile`) and 12px column gutters (`gutter-mobile`). On tablet and desktop displays, conversational viewports are constrained to a focused 768px central track flanked by sidebar panels to preserve readability and personal intimacy.

Chat threads observe distinct conversational rhythms:
- **Sequential Messages (Same Sender)**: 4px vertical gap (`space-xs`).
- **Sender Transitions**: 12px vertical gap.
- **Date Separators & System Blocks**: 24px vertical gap.
- **Composer & Input Docking**: Pinned to the screen base with 16px inner padding and strict safe-area-inset accommodation.

## Elevation & Depth

In this dark-mode paradigm, elevation is established primarily through **tonal container stacking** and **crisp, low-contrast ghost outlines** rather than black shadows, which are imperceptible against midnight backgrounds.

- **Level 0 (Canvas)**: Background surface in `#041512` or `#072923`.
- **Level 1 (Feed Panels, Pinned Bars & Incoming Bubbles)**: Elevated surface containers (`#0E2924` or `#15352F`) bounded by crisp 1px borders rendered in `rgba(251, 249, 240, 0.08)`.
- **Level 2 (Active Dialogs, Context Drawers & Menus)**: Deep container `#1C423B` bordered with 1px `rgba(251, 249, 240, 0.12)`, lifted by a soft bottle-green atmospheric shadow: `0 16px 36px rgba(0, 0, 0, 0.45)`.
- **Level 3 (Outgoing Bubbles & Floating Actions)**: Vivid Yellow surfaces (`#E0F56B`) creating instantaneous visual prominence through pure chromatic luminescence and a localized neon bloom: `0 0 20px rgba(224, 245, 107, 0.15)`.

## Shapes

The interface employs a balanced 8px base radius (`roundedness: 2`) that brings soft organic ergonomics without appearing overly juvenile.

- Standard buttons, input bars, cards, and modal containers utilize 8px (`rounded`).
- Chat message bubbles use directional asymmetry: 16px (`rounded-lg`) on three corners, with the tail corner tucked to 4px (`rounded-sm`).
- Interactive pills, status indicators, active tab indicators, and user avatars utilize continuous full pill rounding (`rounded-full`).

## Components

### Buttons
- **Primary Action**: Solid Vivid Yellow (`#E0F56B`) background, deep Bottle Green (`#072923`) typography, 8px corner radius, height 48px, horizontal padding 20px. On press: `scale(0.98)` with a subtle bloom drop.
- **Secondary Action**: Background `#15352F`, Neo Pearl (`#FBF9F0`) text, bounded by 1px border `rgba(251, 249, 240, 0.08)`.
- **Icon Buttons**: 40x40px touch frame with transparent base, featuring 1.5px stroke icons in Neo Pearl or muted `#9AB3AC`.

### Chat Bubbles
- **Incoming Messages**: Background in Surface Container (`#0E2924` or `#15352F`), 1px outline in `rgba(251, 249, 240, 0.08)`, text in Neo Pearl (`#FBF9F0`). Tail on bottom-left. Timestamps rendered in `label-sm` with text secondary (`#9AB3AC`).
- **Outgoing Messages**: Background in Vivid Yellow (`#E0F56B`), text and delivery checks strictly rendered in deep Bottle Green (`#072923`), tail on bottom-right.
- **System & Security Messages**: Pill badge floating centrally in `#081D19`, bordered with `#1C423B`, typography in `#9AB3AC` paired with an outlined lock icon.

### Text Inputs & Composer
- Docked footer bar in `#041512` or `#072923` with top border `rgba(251, 249, 240, 0.08)`.
- Input chamber styled as an elongated pill in `#0E2924` with 1px border `#1C423B`. Active typing state illuminates border to `#9AB3AC` or subtle Vivid Yellow.
- Send trigger initiates as muted `#5C7972` and snaps to glowing Vivid Yellow (`#E0F56B`) as soon as character input is detected.

### Navigation Bar & Headers
- Fixed headers in `#041512` with subtle bottom border `rgba(251, 249, 240, 0.08)`.
- Navigation items leverage Neo Pearl for inactive states (`#9AB3AC`) and glowing Vivid Yellow underlines / dot indicators for active views.

### Lists & Thread Rows
- Thread items separated by 1px dividing lines in `#1C423B`.
- Unread threads identified by a luminous 8px Vivid Yellow dot aligned to the right, with bold Neo Pearl title text.