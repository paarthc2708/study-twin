---
name: Luminous Scholar
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#464554'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#767586'
  outline-variant: '#c7c4d7'
  surface-tint: '#494bd6'
  primary: '#4648d4'
  on-primary: '#ffffff'
  primary-container: '#6063ee'
  on-primary-container: '#fffbff'
  inverse-primary: '#c0c1ff'
  secondary: '#5c5f61'
  on-secondary: '#ffffff'
  secondary-container: '#e0e3e5'
  on-secondary-container: '#626567'
  tertiary: '#6b38d4'
  on-tertiary: '#ffffff'
  tertiary-container: '#8455ef'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2f2ebe'
  secondary-fixed: '#e0e3e5'
  secondary-fixed-dim: '#c4c7c9'
  on-secondary-fixed: '#191c1e'
  on-secondary-fixed-variant: '#444749'
  tertiary-fixed: '#e9ddff'
  tertiary-fixed-dim: '#d0bcff'
  on-tertiary-fixed: '#23005c'
  on-tertiary-fixed-variant: '#5516be'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  mono-code:
    fontFamily: jetbrainsMono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 48px
  2xl: 80px
  container-max: 1200px
  gutter: 24px
---

## Brand & Style

The design system is centered on "Cognitive Clarity"—a philosophy that reduces visual noise to enhance focus and retention. The target audience consists of students, researchers, and lifelong learners who value a premium, organized, and technologically advanced environment. 

The visual style is a **Refined Glassmorphic Minimalism**. It draws from the structural precision of Linear and the organic, user-centric fluidity of Apple and Arc. The interface should feel like a clean, physical desk in a well-lit room—breathable, tactile, and calm. We utilize frosted glass effects (backdrop-blur) to maintain a sense of context and depth, ensuring that the "AI" aspect of the product feels like a transparent companion rather than an intrusive tool.

## Colors

The palette is anchored by a high-clarity background and a sophisticated Indigo primary.

- **Primary (#6366F1):** Used for primary actions, focus states, and active learning paths.
- **Secondary/Background (#F8FAFC):** An off-white slate that reduces eye strain compared to pure white.
- **Text & Neutral (#0F172A):** Deep slate provides optimal contrast for long-form reading without the harshness of pure black.
- **Accents:** Lavender (#8B5CF6) and Teal (#14B8A6) are used sparingly to categorize subjects and indicate AI-generated insights.
- **Glass Surfaces:** Semi-transparent white with a high backdrop-blur (20px-40px) and a subtle 1px inner border to simulate the edge of a glass pane.

## Typography

This design system utilizes **Inter** for all UI and editorial content due to its exceptional legibility and systematic feel. For technical or AI-response blocks, **JetBrains Mono** is used to denote raw data or code snippets.

- **Tight Tracking:** Headlines use a negative letter spacing (-0.01em to -0.02em) to mimic premium editorial layouts.
- **Hierarchy:** Use font weight rather than color shifts to denote importance. Primary text should stay in Deep Slate, while secondary metadata can drop to 60% opacity.
- **Line Height:** Generous leading (line-height) is required in body text to facilitate deep reading and study sessions.

## Layout & Spacing

The layout follows a **Fixed-Fluid Hybrid** model. Large desktop views are centered with a 1200px max-width container, while internal dashboard elements use a fluid 12-column grid.

- **The "Breathe" Principle:** Use `xl` (48px) and `2xl` (80px) vertical spacing between major sections to prevent cognitive overload.
- **Sidebars:** Inspired by Arc, sidebars should be translucent and pinned to the left with a width of 260px.
- **Responsive Behavior:** On mobile, margins reduce to 16px, and the 12-column grid collapses to 1-column. Glass cards on mobile lose their transparency in high-performance mode to save battery but retain the 1px border.

## Elevation & Depth

Depth is conveyed through **Backdrop Refraction** rather than traditional heavy shadows.

1.  **Level 0 (Base):** The #F8FAFC background.
2.  **Level 1 (Cards):** Translucent white surface with 20px backdrop-blur, a 1px white border (30% opacity), and a very soft, large-radius shadow (0px 10px 30px rgba(0,0,0,0.03)).
3.  **Level 2 (Modals/Popovers):** Increased opacity on the surface and a more pronounced shadow (0px 20px 50px rgba(0,0,0,0.08)) to pull the element toward the user.
4.  **The "Glow" Effect:** AI-driven components or active study sessions may feature a subtle background gradient glow (Indigo/Lavender) blurred at 100px behind the glass card.

## Shapes

The design system uses an **Extra-Rounded** shape language to feel approachable and modern. 

- **Primary Containers:** 24px (xl) is the standard for cards and main UI modules.
- **Interactive Elements:** 12px (md) for buttons and input fields to provide a distinct look from the larger containers.
- **AI Bubbles:** 32px (2xl) for chat interface elements to create a softer, more conversational tone.
- **Visual Continuity:** Every element, including images and videos, must inherit a minimum of 16px border radius to maintain the system's softness.

## Components

- **Buttons:** Primary buttons use a solid Indigo fill with a subtle top-light inner shadow. Secondary buttons are glass-morphic with a 1px border. Transitions should be 200ms ease-in-out.
- **Glass Cards:** The core unit of the UI. Must always include `backdrop-filter: blur(20px)` and a `border: 1px solid rgba(255,255,255,0.4)`.
- **Inputs:** Minimalist fields with a faint background tint. On focus, the border transitions to Primary Indigo with a 4px soft outer glow.
- **Chips:** Used for category tagging (e.g., "Biology", "Calculus"). These should use the accent colors (Teal/Lavender) at 10% opacity with 100% opacity text.
- **Study Progress Bar:** A thin, 4px height bar using a gradient from Primary Indigo to Accent Teal, situated at the top of active learning modules.
- **The "Twin" AI Toggle:** A custom switch component that uses a subtle pulse animation and a glass surface to indicate when the AI study partner is active.