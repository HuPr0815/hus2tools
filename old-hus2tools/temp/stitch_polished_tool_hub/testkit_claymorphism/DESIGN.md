---
name: TestKit Claymorphism
colors:
  surface: '#f6f9ff'
  surface-dim: '#d4dbe3'
  surface-bright: '#f6f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eef4fd'
  surface-container: '#e8eef7'
  surface-container-high: '#e2e9f1'
  surface-container-highest: '#dce3ec'
  on-surface: '#151c22'
  on-surface-variant: '#3f4943'
  inverse-surface: '#2a3138'
  inverse-on-surface: '#ebf1fa'
  outline: '#6f7a72'
  outline-variant: '#bec9c0'
  surface-tint: '#0e6c4a'
  primary: '#0e6c4a'
  on-primary: '#ffffff'
  primary-container: '#74c69d'
  on-primary-container: '#005236'
  inverse-primary: '#85d7ad'
  secondary: '#30628a'
  on-secondary: '#ffffff'
  secondary-container: '#a1d1fe'
  on-secondary-container: '#265a81'
  tertiary: '#ad2c4d'
  on-tertiary: '#ffffff'
  tertiary-container: '#ff98a8'
  on-tertiary-container: '#8d0f37'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#a0f4c8'
  primary-fixed-dim: '#85d7ad'
  on-primary-fixed: '#002113'
  on-primary-fixed-variant: '#005236'
  secondary-fixed: '#cde5ff'
  secondary-fixed-dim: '#9bcbf8'
  on-secondary-fixed: '#001d32'
  on-secondary-fixed-variant: '#104a70'
  tertiary-fixed: '#ffd9dd'
  tertiary-fixed-dim: '#ffb2bc'
  on-tertiary-fixed: '#400013'
  on-tertiary-fixed-variant: '#8d0f36'
  background: '#f6f9ff'
  on-background: '#151c22'
  surface-variant: '#dce3ec'
  clay-pink-light: '#ffc8dd'
  clay-pink-main: '#ffb3d9'
  clay-pink-dark: '#ff8fb3'
  clay-pink-deep: '#ff6a88'
  clay-blue-light: '#cae9ff'
  clay-blue-main: '#a2d2ff'
  clay-blue-dark: '#5a9fd4'
  clay-blue-deep: '#356590'
  clay-purple-light: '#e4c1f9'
  clay-purple-main: '#d4a5f3'
  clay-purple-dark: '#b377dc'
  clay-purple-deep: '#7e5ca0'
  clay-green-light: '#d8f3dc'
  clay-green-main: '#b7e4c7'
  clay-green-dark: '#74c69d'
  clay-green-deep: '#2d6a4f'
  clay-yellow-light: '#fff4bd'
  clay-yellow-main: '#ffe6a7'
  clay-yellow-dark: '#ffcc77'
  clay-yellow-deep: '#d4a373'
  dark-jewel-pink: '#9d2d6d'
  dark-jewel-blue: '#1e40af'
  dark-jewel-purple: '#5b21b6'
  dark-jewel-green: '#065f46'
  dark-jewel-yellow: '#92400e'
typography:
  display-hero:
    fontFamily: Quicksand
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Quicksand
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Quicksand
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  tool-title:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  micro:
    fontFamily: Inter
    fontSize: 10px
    fontWeight: '500'
    lineHeight: '1.2'
  display-hero-mobile:
    fontFamily: Quicksand
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  container-padding: 24px
  gutter: 16px
  stack-gap: 12px
  clay-padding-sm: 12px 16px
  clay-padding-md: 20px 24px
---

## Brand & Style

The design system is centered around a **Claymorphic** aesthetic—a high-tactile, soft-touch interface that feels like physical modeling clay. The brand personality is playful, approachable, and friendly, designed to reduce the technical friction of "tool-heavy" environments. 

The visual style is defined by:
- **Tactile Volume:** Surfaces appear inflated or "puffed" through complex, multi-layered shadows and inner highlights.
- **Elasticity:** Interactivity is defined by physical physics, using spring-based motion to simulate the squishy nature of clay.
- **Jewel-Tone Depth:** A shift from desaturated pastels to vibrant, saturated jewel tones in dark mode ensures the UI remains energetic and legible regardless of the color scheme.

## Colors

The color system utilizes five core "Clay" families. In **Light Mode**, these are soft, "candy-like" pastels that emphasize volume through subtle inner shadows. In **Dark Mode**, the palette shifts to **Jewel Tones**—deeper, high-saturation colors that maintain a "glow" effect against dark backgrounds rather than appearing flat or desaturated.

- **Primary (Green):** Brand identity and success states.
- **Secondary (Blue):** Informational and secondary navigation.
- **Tertiary (Pink/Red):** High-priority CTAs and error states.
- **Backgrounds:** Light mode uses a warm `#ffecd2` tint; Dark mode uses a deep navy-tinted charcoal `#14142a`.

When applying colors to clay components, the "shadow" layer of the component should use a 40% opacity version of the base hue to create a realistic, color-tinted depth effect.

## Typography

This system pairs **Quicksand** for headings with **Inter** for UI and body text. 

- **Quicksand:** Used for all large headings and titles. Its rounded terminals mirror the "clay" shape language, reinforcing the soft aesthetic.
- **Inter:** Used for maximum legibility in tool descriptions, data displays, and labels. It provides a grounded, professional contrast to the playful headings.

Headings should generally use a tight letter-spacing (`-0.02em`) to feel more cohesive and "inflated." Body text should prioritize generous line-heights to maintain the airy, lightweight feel of the layout.

## Layout & Spacing

The layout uses a **Fluid Grid** model with a focus on generous internal container padding. Because clay components rely on large shadows that occupy visual space, the spacing rhythm is wider than traditional flat designs.

- **Desktop:** 12-column grid with 24px gutters. Content is typically centered in high-volume containers.
- **Mobile:** Single column with 16px side margins.
- **Rhythm:** Spacing follows a 4px base unit. Components use "squishy" padding—vertical padding is typically 75% of horizontal padding to reinforce the horizontal pill-like shapes common in the system.

## Elevation & Depth

Elevation is achieved through a signature **4-layer shadow stack** that simulates a physical object pressed into or resting on a surface.

1.  **Outer Light (Top-Left):** A white or light-tinted soft glow to simulate a light source.
2.  **Outer Shadow (Bottom-Right):** A blurred, color-tinted shadow (using the component's hue at 30% opacity) to provide lift.
3.  **Inner Light (Top-Left):** A subtle white inner stroke that creates the "rim" of the clay.
4.  **Inner Shadow (Bottom-Right):** A soft, dark-tinted inner glow that gives the element its rounded volume.

**Interactive States:**
- **Hover:** Shadows expand (6px to 8px offsets) and the element scales slightly up.
- **Active:** Shadows contract (1px to 2px offsets) and an "Inset" inner shadow increases, simulating a physical finger pressing into the clay.

## Shapes

The shape language is extremely organic and soft. Standard components use `rounded-xl` (24px) to ensure no sharp corners exist. 

- **Cards/Panels:** Use `rounded-clay-lg` (32px) for a soft, pillowy appearance.
- **Buttons/Pills:** Use `rounded-clay-full` (50px) to maximize the "clay bead" effect.
- **Inputs:** Use `rounded-xl` (12px) to provide a slightly more structured but still softened feel.

Avoid sharp 0px or 4px corners entirely, as they break the physical metaphor of the design system.

## Components

### Clay Cards
Primary containers for content. They must feature the full 4-layer `shadow-clay` stack. In dark mode, the outer shadow should use a vibrant jewel-tone tint (e.g., Purple) to create a "neon clay" glow.

### Inset Inputs
Unlike cards, inputs use a "punched-in" effect. This is achieved by removing outer shadows and using only **Inner Shadows** (top-left dark, bottom-right light). This makes the input feel like it was carved into the clay surface.

### Floating Action Buttons (FAB)
Highly rounded (`rounded-full`) circles with an exaggerated `shadow-clay-hover` effect. These should always use the `spring` timing function (`cubic-bezier(0.34, 1.56, 0.64, 1)`) for their entry and hover animations.

### Spring Interactivity
Every transition—scale, color shift, or movement—must use the spring timing function. This creates the "overshoot" and "bounce" that makes the UI feel elastic and responsive.

### Clay Chips
Small, high-contrast badges used for categorization. They should have a simplified version of the clay shadow (reduced blur) to remain legible at small scales.