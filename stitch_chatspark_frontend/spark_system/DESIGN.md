---
name: Spark System
colors:
  surface: '#091324'
  surface-dim: '#091324'
  surface-bright: '#2f394c'
  surface-container-lowest: '#040e1f'
  surface-container-low: '#111c2d'
  surface-container: '#162031'
  surface-container-high: '#202a3c'
  surface-container-highest: '#2b3548'
  on-surface: '#d9e3fb'
  on-surface-variant: '#e3bfb1'
  inverse-surface: '#d9e3fb'
  inverse-on-surface: '#273143'
  outline: '#aa8a7d'
  outline-variant: '#5a4136'
  surface-tint: '#ffb596'
  primary: '#ffb596'
  on-primary: '#581e00'
  primary-container: '#ff6500'
  on-primary-container: '#551d00'
  inverse-primary: '#a33e00'
  secondary: '#aac9f4'
  on-secondary: '#0e3255'
  secondary-container: '#29486d'
  on-secondary-container: '#99b7e2'
  tertiary: '#9dcaff'
  on-tertiary: '#003257'
  tertiary-container: '#009bfe'
  on-tertiary-container: '#003155'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdbcd'
  primary-fixed-dim: '#ffb596'
  on-primary-fixed: '#360f00'
  on-primary-fixed-variant: '#7d2d00'
  secondary-fixed: '#d3e4ff'
  secondary-fixed-dim: '#aac9f4'
  on-secondary-fixed: '#001c38'
  on-secondary-fixed-variant: '#29486d'
  tertiary-fixed: '#d1e4ff'
  tertiary-fixed-dim: '#9dcaff'
  on-tertiary-fixed: '#001d36'
  on-tertiary-fixed-variant: '#00497c'
  background: '#091324'
  on-background: '#d9e3fb'
  surface-variant: '#2b3548'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 36px
    fontWeight: '800'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
  headline-sm:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  title-lg:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
  container-max: 1280px
---

## Brand & Style

The design system is engineered for high-energy, premium digital experiences. It targets a modern, tech-savvy audience that values speed, precision, and a sophisticated aesthetic. The brand personality is bold and electric, designed to evoke a sense of momentum and "sparked" creativity.

The visual style is a fusion of **Corporate Modern** and **High-Contrast Dark**, utilizing deep tectonic layers and vibrant accents. We prioritize clarity and impact, using the dark canvas to make content and calls-to-action feel luminous and urgent. The interface should feel like a high-performance instrument: refined, reactive, and powerful.

## Colors

The palette is anchored by a deep, monochromatic dark base to provide maximum contrast for the high-energy primary accent.

- **Primary (#FF6500):** A vibrant orange used for critical actions, highlights, and brand moments. It represents the "spark."
- **Secondary (#1E3E62):** A muted navy blue used for supportive structural elements, active states, and secondary buttons.
- **Background (#0B192C):** The foundational dark blue/black for the application canvas.
- **Surface (#15253A):** A slightly lighter blue used for cards, modals, and containers to create depth against the background.
- **Text (#FFFFFF):** High-legibility white for primary content, with reduced opacity (70-80%) for secondary metadata.

## Typography

This design system exclusively uses **Hanken Grotesk** to maintain a sharp, contemporary, and engineered feel. 

- **Headlines:** Use heavy weights (700-800) and tight letter-spacing for a commanding presence.
- **Body:** Use regular weight (400) for optimal readability against the dark background. Ensure line height is generous (1.5x) to prevent text fatigue.
- **Labels:** Use semi-bold or medium weights to ensure small-scale information is legible and distinct from body copy.

## Layout & Spacing

The layout utilizes a **fluid grid system** that adapts to the viewport while adhering to a strict 4px baseline rhythm.

- **Desktop:** 12-column grid with 24px gutters and a 40px outer margin.
- **Tablet:** 8-column grid with 20px gutters and 24px outer margins.
- **Mobile:** 4-column grid with 16px gutters and 16px outer margins.

Spacing between major sections should follow a geometric progression (32px, 64px, 128px) to reinforce the high-energy, spacious aesthetic. Internal component spacing should remain tight (8px, 12px, 16px) to feel precise.

## Elevation & Depth

Hierarchy is established through **Tonal Layering** and **Subtle Glows** rather than traditional shadows.

- **Level 0 (Base):** Background (#0B192C).
- **Level 1 (Cards/Sidebar):** Surface (#15253A) with a 1px stroke of #1E3E62 at 50% opacity.
- **Level 2 (Modals/Popovers):** Surface (#1E3E62) with a very soft, primary-tinted outer glow (Orange #FF6500 at 10% opacity) to suggest light emission from the "spark."
- **Interactive States:** Hovering over elements should increase the brightness of the border stroke or introduce a subtle background shimmer.

## Shapes

The design system uses **Rounded (0.5rem)** geometry to balance the aggressive color palette with a premium, approachable feel.

- **Buttons & Inputs:** 8px (0.5rem) corner radius.
- **Cards & Modals:** 16px (1rem) corner radius for a softer, modern container feel.
- **Tags/Chips:** Fully pill-shaped to contrast against the structured grid.

## Components

- **Buttons:** 
  - *Primary:* Solid #FF6500 with white text. High-contrast and bold.
  - *Secondary:* Ghost style with #1E3E62 border and white text.
- **Input Fields:** Deep navy background (#0B192C) with a subtle #1E3E62 border. On focus, the border transitions to #FF6500 with a 2px outer glow.
- **Cards:** Use the Surface color (#15253A). Headlines within cards should be bold, while secondary text should be white at 70% opacity.
- **Lists:** Separated by thin 1px lines of #1E3E62. Active list items should use a left-edge 4px accent bar in primary orange.
- **Glow Effects:** Use sparingly on icons or specific "active" states (like a live chat indicator) using the primary orange to simulate energy.