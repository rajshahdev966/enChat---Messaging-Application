---
name: Sanctuary Quietude
colors:
  surface: '#fbf9f0'
  surface-dim: '#dcdad1'
  surface-bright: '#fbf9f0'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f4eb'
  surface-container: '#f0eee5'
  surface-container-high: '#eae8df'
  surface-container-highest: '#e4e3da'
  on-surface: '#1b1c17'
  on-surface-variant: '#414846'
  inverse-surface: '#30312b'
  inverse-on-surface: '#f3f1e8'
  outline: '#717976'
  outline-variant: '#c1c8c5'
  surface-tint: '#45645d'
  primary: '#00120e'
  on-primary: '#ffffff'
  primary-container: '#072923'
  on-primary-container: '#719289'
  inverse-primary: '#abcec4'
  secondary: '#586400'
  on-secondary: '#ffffff'
  secondary-container: '#d8ed64'
  on-secondary-container: '#5d6b00'
  tertiary: '#001302'
  on-tertiary: '#ffffff'
  tertiary-container: '#122913'
  on-tertiary-container: '#779274'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c7eae0'
  primary-fixed-dim: '#abcec4'
  on-primary-fixed: '#00201b'
  on-primary-fixed-variant: '#2d4d46'
  secondary-fixed: '#d8ed64'
  secondary-fixed-dim: '#bdd14b'
  on-secondary-fixed: '#191e00'
  on-secondary-fixed-variant: '#414b00'
  tertiary-fixed: '#ceeac7'
  tertiary-fixed-dim: '#b2cead'
  on-tertiary-fixed: '#09200b'
  on-tertiary-fixed-variant: '#344d33'
  background: '#fbf9f0'
  on-background: '#1b1c17'
  surface-variant: '#e4e3da'
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

The design system embodies a tranquil, personal refuge tailored for intimate, private conversations rather than public spectacle or social media broadcasting. Guided by the ethos "Just Between Us," the experience feels like an undisturbed retreat: warm, discreet, serene, and sophisticated. The interface instills a deep sense of psychological safety and calm confidence through spacious compositions, organic tactility, and intentional restraint.

Drawing from warm editorial minimalism and quiet luxury interface design, visual clutter, performative engagement loops, and high-frequency animations are completely stripped away. The tactile environment prioritizes focused micro-interactions, soft physical presence, and legibility under varying lighting conditions, ensuring privacy is experienced not as technical friction, but as effortless peace of mind.

## Colors

The palette establishes an organic, grounded environment rooted in natural deep foliage and parchment warmth:

- **Bottle Green (`#072923`)**: Serves as the primary structural foundation. Used for immersive top app bars, primary labels, critical navigation chrome, and high-emphasis body text.
- **Neo Pearl (`#F8F6ED`)**: The canvas surface. Provides an off-white, glare-reducing backdrop that houses incoming chat bubbles, background layers, and main content fields.
- **Vivid Yellow (`#E0F56B`)**: The kinetic signature accent. Applied sparingly to outgoing chat bubbles, primary floating call-to-actions, unread indicators, and active toggle states. In text contexts over Vivid Yellow, text must strictly render in deep Bottle Green to guarantee WCAG AA compliance.
- **Sage Green (`#A5C1A0`)**: The ambient balancer. Used for delicate 1px structural dividing lines, status chips, verified end-to-end security shields, delivery receipts, and tertiary interactive states.

Color application strictly separates outgoing conversational momentum (Vivid Yellow) from neutral receiving space (Neo Pearl) against deep, stabilizing boundaries (Bottle Green).

## Typography

The typographic hierarchy blends the architectural clarity of **Manrope** for headlines and conversation titles with the legible, friendly humanism of **DM Sans** for conversational streams, timestamps, inputs, and functional labels.

Chat streams require optimal readability across rapid scanning and lengthy dialogue. `body-md` (15px / 22px) serves as the primary chat speech bubble scale. Timestamps, read states, and delivery metadata are standardized onto `label-sm` with slight positive tracking to ensure absolute clarity at small scales without competing with message content.

## Layout & Spacing

A strict 8px spatial grid enforces rhythm across all screen sizes. For mobile viewports (< 600px), a fluid layout with a baseline 16px screen margin (`margin-mobile`) and 12px inter-column gutter (`gutter-mobile`) anchors touch targets comfortably within thumb reach. On tablet and desktop displays, message feeds stay locked within a maximum 768px content track to preserve an intimate conversation aspect ratio rather than over-stretching across broad viewports.

Conversation streams utilize asymmetric micro-rhythms: 4px vertical distance between consecutive messages from the same sender, 12px between sender transitions, and 24px preceding date separators. Fixed bottom docks house the input apparatus with 16px internal padding and safe-area inset allowances.

## Elevation & Depth

Visual hierarchy rejects aggressive drop shadows and harsh skeuomorphism in favor of tonal layering and soft, low-contrast outlines:

- **Level 0 (Canvas)**: Neo Pearl (`#F8F6ED`) flat plane.
- **Level 1 (Cards & Feed Panels)**: Pure surface distinction created by 1px solid borders in Sage Green with 40% opacity (`rgba(165, 193, 160, 0.4)`), accompanied by an ambient, deep-tinted shadow: `0 2px 8px rgba(7, 41, 35, 0.04)`.
- **Level 2 (Active Dialogs, Popovers & Context Sheets)**: Elevated Neo Pearl containers framed with a 1px Sage Green border (`rgba(165, 193, 160, 0.6)`) and an ultra-diffused atmospheric shadow: `0 12px 32px rgba(7, 41, 35, 0.08)`.
- **Level 3 (Action Anchors & FABs)**: Vivid Yellow surfaces leverage a subtle contact shadow: `0 4px 16px rgba(7, 41, 35, 0.12)` to lift interactive triggers directly into focus.

## Shapes

The design system adopts a soft, friendly rounded geometry (Level 2: 8px / 0.5rem base radius) to invoke safety, warmth, and tactility.

- Standard buttons, text inputs, and preview tiles adopt `rounded` (8px / 0.5rem).
- Conversation bubbles utilize directional corner geometry: 16px (`rounded-lg`) on three corners, with the directional tail corner tucked to 4px.
- Avatars, security status indicators, floating micro-badges, and bottom bar triggers use continuous pill/circular shaping for rapid visual parsing.

## Components

### Buttons
- **Primary Action**: Vivid Yellow (`#E0F56B`) background, Bottle Green (`#072923`) text and icons, 8px radius, height 48px, minimum horizontal padding 20px. On press: scale(0.98) with subtle opacity fade to 90%.
- **Secondary Action**: Transparent background, Bottle Green text, bordered with 1px Sage Green (`#A5C1A0`).
- **Icon Buttons**: 40x40px touch zone, 1.5px stroke minimalist outline icons, tinted in Bottle Green or muted Sage Green.

### Chat Bubbles
- **Incoming Messages**: Background in white/elevated Neo Pearl, 1px border `rgba(165, 193, 160, 0.4)`, text in Bottle Green (`#072923`). Tail on bottom-left. Timestamps rendered in `label-sm` muted Bottle Green (60% opacity).
- **Outgoing Messages**: Background in Vivid Yellow (`#E0F56B`), text in Bottle Green (`#072923`), tail on bottom-right. Micro delivery checks rendered in Bottle Green.
- **System / Encryption Notices**: Centered pill shape, background `rgba(165, 193, 160, 0.2)`, text in Bottle Green, accompanied by a 14px outlined lock icon.

### Text Inputs & Composer
- Capsule-style composer docking at the screen footer.
- Background in pure elevated Neo Pearl with an inset 1px Sage Green outline (`#A5C1A0`). Active focus transitions outline to Bottle Green (`#072923`).
- Integrated actions: Media attachment and voice memo icons in 1.5px outline Bottle Green. Dynamic send button transitions from muted Sage Green to active Vivid Yellow upon keystroke detection.

### Privacy & Verification Badges
- **Safety Indicator**: A compact pill chip featuring a 12px shield outline and label "E2E Encrypted" in `label-sm`. Sage Green background at 15% opacity with solid Bottle Green text.
- **Ephemeral Message Timer**: Crisp circular badge with a countdown ring stroke in Vivid Yellow, notifying conversation expiration discreetly beside conversation titles.

### Cards & Thread Items
- Conversation list rows are separated by 0.5px Sage Green hairlines indented past the 48px avatar margin. Unread message threads display a solid 8px Vivid Yellow dot indicator aligned to the right margin.