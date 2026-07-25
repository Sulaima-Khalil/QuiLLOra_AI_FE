---
name: Oceanic Midnight
colors:
  surface: '#fcf8fa'
  surface-dim: '#dcd9db'
  surface-bright: '#fcf8fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f5'
  surface-container: '#f0edef'
  surface-container-high: '#eae7e9'
  surface-container-highest: '#e4e2e4'
  on-surface: '#1b1b1d'
  on-surface-variant: '#45464d'
  inverse-surface: '#303032'
  inverse-on-surface: '#f3f0f2'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#006b5f'
  on-secondary: '#ffffff'
  secondary-container: '#62fae3'
  on-secondary-container: '#007165'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#0d1c2f'
  on-tertiary-container: '#76859b'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#62fae3'
  secondary-fixed-dim: '#3cddc7'
  on-secondary-fixed: '#00201c'
  on-secondary-fixed-variant: '#005047'
  tertiary-fixed: '#d5e3fd'
  tertiary-fixed-dim: '#b9c7e0'
  on-tertiary-fixed: '#0d1c2f'
  on-tertiary-fixed-variant: '#3a485c'
  background: '#fcf8fa'
  on-background: '#1b1b1d'
  surface-variant: '#e4e2e4'
typography:
  display-lg:
    fontFamily: Sora
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Sora
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Sora
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Sora
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
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
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
  max-width-content: 800px
---

## Brand & Style

The design system focuses on a high-precision, AI-driven writing environment. It targets professionals, researchers, and technical writers who require a focused, "lights-out" executive feel while maintaining the clarity of an editorial workspace. 

The design style is **Corporate Modern with a Minimalist focus**. It leverages high contrast to distinguish between structural "tool" areas (the navy interface) and the "canvas" (the off-white workspace). The aesthetic emphasizes utility and intelligence through sharp execution, ample white space, and subtle technical accents that evoke a sense of deep-sea stability and technological fluency.

## Colors

The palette is anchored by **Deep Navy (#0F172A)**, used for primary navigation and high-level headers to establish authority. **Teal (#2DD4BF)** acts as a precise high-energy accent for AI-related actions, status indicators, and highlights, cutting through the neutral tones. 

**Slate Blue (#334155)** serves as a functional bridge for secondary UI elements like icons and borders. The workspace is defined by **Off-white (#F8FAFC)** to reduce eye strain during long writing sessions, while pure White is reserved for elevated surface containers like cards and modals.

## Typography

This design system utilizes a dual-font strategy. **Sora** is employed for headlines and display text to provide a modern, technical, and slightly geometric character. **Inter** is used for all body copy and interface labels due to its exceptional legibility and neutral systematic feel.

For long-form writing content, use `body-lg` with increased line-height to ensure maximum readability. Use `label-sm` in all-caps for categories or small metadata tags to maintain a structured, professional information hierarchy.

## Layout & Spacing

The layout follows a **fluid grid** model with a strictly defined max-width for the writing canvas to optimize line lengths for readability. 

- **Desktop:** 12-column grid with 24px gutters. The primary sidebar is fixed at 280px, while the main content area remains fluid up to a 1440px viewport.
- **Writing Canvas:** Regardless of screen size, the actual writing area should be constrained to a centered `max-width-content` of 800px.
- **Mobile:** Single column with 16px horizontal margins.
- **Rhythm:** All margins and padding should be multiples of the 8px base unit to ensure a rigorous, professional alignment.

## Elevation & Depth

Hierarchy is established through **Tonal Layers** and **Low-contrast outlines** rather than heavy shadows.

- **Level 0 (Background):** Off-white (#F8FAFC), used for the main application backdrop.
- **Level 1 (Surface):** White (#FFFFFF), used for the document editor and cards. These surfaces use a 1px border of Slate Blue at 10% opacity.
- **Level 2 (Navigation):** Deep Navy (#0F172A), used for the sidebar to create a strong vertical anchor.
- **Floating Elements:** Modals and dropdowns use a soft, ambient shadow: `0px 10px 15px -3px rgba(15, 23, 42, 0.1)`. No heavy black shadows are permitted; all shadows must be tinted with the Primary Deep Navy color.

## Shapes

The system uses a **Soft (0.25rem)** roundedness approach to maintain a professional, sharp-edged look while avoiding the harshness of a strictly 0px grid. 

Buttons and input fields utilize the standard 0.25rem (4px) radius. Larger containers like cards or the main editor panel use `rounded-lg` (8px). This subtle rounding communicates precision and modern software standards without becoming too casual or playful.

## Components

- **Buttons:** 
  - *Primary:* Deep Navy background with White text. High-contrast.
  - *Secondary:* Transparent background with a 1px Slate Blue border.
  - *Action:* Teal background with Deep Navy text, reserved for "Generate" or AI-specific triggers.
- **Input Fields:** Flat White background with a 1px border (#E2E8F0). On focus, the border transitions to Deep Navy with a 2px Teal glow (outer shadow).
- **Chips/Tags:** Used for keywords or categories. Small, 12px Inter Semibold text. Off-white background with Slate Blue text.
- **AI Feedback/Lists:** List items should be separated by 1px horizontal rules (#F1F5F9). AI suggestions are highlighted with a subtle Teal left-border (4px width).
- **Cards:** White surfaces with a very fine 1px border. No shadows unless they are "floating" over other content.
- **The "Pulse" (Unique Component):** A small, animated Teal dot used next to AI-generating states to indicate activity without interrupting the clean UI.