---
name: "Houston, Handled. — JWILLSOLDIT"
description: "A practical Texas field guide for Greater Houston housing decisions."
colors:
  paper: "#FAF7F2"
  pure: "#FFFFFF"
  forest: "#1C3B2E"
  forest-deep: "#142B21"
  signal-red: "#E03A1F"
  accessible-red-text: "#C93318"
  ember: "#E85D2A"
  copper: "#B05C2E"
  ink: "#0D0D0D"
  mid-gray: "#6B6B6B"
  trace: "#E7E1D8"
  trace-dark: "rgba(250, 250, 250, 0.16)"
  mid-on-dark: "rgba(250, 250, 250, 0.62)"
typography:
  display:
    fontFamily: "Instrument Sans, system-ui, sans-serif"
    fontSize: "clamp(2.75rem, 8.5vw, 6.5rem)"
    fontWeight: 700
    lineHeight: 0.98
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Instrument Sans, system-ui, sans-serif"
    fontSize: "clamp(2rem, 4.5vw, 3.25rem)"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Instrument Sans, system-ui, sans-serif"
    fontSize: "clamp(1.25rem, 2.2vw, 1.625rem)"
    fontWeight: 600
    lineHeight: 1.15
  body:
    fontFamily: "Libre Franklin, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Space Mono, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.14em"
rounded:
  focus-detail: "2px"
spacing:
  section: "clamp(84px, 12vw, 160px)"
  block: "clamp(40px, 6vw, 72px)"
  gutter: "clamp(20px, 4.5vw, 56px)"
components:
  button-hero:
    backgroundColor: "{colors.forest}"
    textColor: "{colors.paper}"
    padding: "14px 22px"
  button-signal:
    backgroundColor: "{colors.signal-red}"
    textColor: "{colors.pure}"
    padding: "14px 22px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    padding: "14px 22px"
  editorial-card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    padding: "clamp(24px, 4vw, 38px)"
---

# Design System: Houston, Handled.

## Overview

**Creative North Star: "The Texas Field Guide"**

The incumbent system feels like a well-edited field guide: direct, regional, source-conscious, and useful in the real world. Warm paper and assertive display type keep it human; mono labels, hairline structures, and schematic maps make complex regional information easy to scan.

The experience is editorial rather than promotional and confident without looking luxurious or theatrical. Flat surfaces and square geometry create order. Forest anchors the system, red signals action and focus, and visible sourcing and compliance carry as much brand weight as decorative elements.

**Key Characteristics:**

- Warm paper, forest, signal red, and ink.
- Large, tightly tracked editorial headlines.
- Mono system labels and readable long-form body copy.
- Flat color fields, square geometry, and hairline grids.
- Source panels, adjacent disclaimers, and schematic accuracy captions.
- Restrained, optional motion with reduced-motion support.

## Colors

The palette is a warm Texas editorial system: paper and ink carry reading, forest establishes identity and structure, and red marks signal moments.

### Primary

- **Field Forest** (`#1C3B2E`): hero action, full-bleed editorial bands, selection color, borders, and map structure.
- **Signal Red** (`#E03A1F`): CTA fills, focus rings, large accent marks, and interactive emphasis.
- **Accessible Red Text** (`#C93318`): small red text on paper. Use it whenever red text is below the large-text contrast threshold.

### Secondary

- **Ember** (`#E85D2A`): observed in the optional cursor trail.
- **Forest Deep** (`#142B21`) and **Copper** (`#B05C2E`): defined tokens whose system-wide roles are not yet confirmed. Do not introduce new uses without checking the implementation.

### Neutral

- **Paper** (`#FAF7F2`): base page and card surface.
- **Pure** (`#FFFFFF`): sparing high-contrast surface and text-on-red.
- **Ink** (`#0D0D0D`): primary text and footer background.
- **Mid Gray** (`#6B6B6B`): secondary text and labels.
- **Trace** (`#E7E1D8`): light-surface borders and grid seams.
- **Trace Dark** (`rgba(250, 250, 250, 0.16)`): dividers on dark surfaces.
- **Mid on Dark** (`rgba(250, 250, 250, 0.62)`): secondary copy on dark surfaces.

**The Signal Rule.** Forest establishes the world; red marks attention, focus, and decisive action. Preserve the observed forest hero action and red relocation CTA as distinct variants.

**The Small-Text Red Rule.** Use `#C93318` for small red text on paper. Keep `#E03A1F` for fills, borders, focus, and large display marks.

## Typography

**Display Font:** Instrument Sans (with system sans fallback)  
**Body Font:** Libre Franklin (with system sans fallback)  
**Label/Mono Font:** Space Mono (with monospace fallback)

**Character:** Instrument Sans provides compact editorial authority, Libre Franklin keeps long explanations approachable, and Space Mono makes navigation and factual labels feel like a field record.

### Hierarchy

- **Display** (700, `clamp(2.75rem, 8.5vw, 6.5rem)`, 0.9–0.98): page-level hero headings.
- **Headline** (700, `clamp(2rem, 4.5vw, 3.25rem)`, 1): section headings.
- **Title** (600, `clamp(1.25rem, 2.2vw, 1.625rem)`, 1.15): cards and article subheads.
- **Body** (400, `1rem`, 1.6–1.75): running copy; long-form reading stays near 68–72 characters.
- **Label** (400, `0.75rem`, `0.14em`, uppercase): navigation, eyebrows, buttons, and structured data terms.

**The System-Label Rule.** Space Mono is for navigation, labels, buttons, and data terms, not headlines or prose.

## Layout

Content uses a centered `1280px` maximum container with fluid `20px–56px` gutters. Major sections use `84px–160px` vertical spacing; internal page blocks use `40px–72px`. Guide and area prose stays within a 68–72ch reading measure.

The system is mobile-first. The masthead label shortens below `560px`; fact grids expand near `700px`; major two-column landing arrangements appear near `860px`. Editorial card grids use auto-fit behavior around a `310px` minimum rather than rigid desktop column counts.

## Elevation & Depth

The system is flat. It uses no drop shadows, glass, blur, or simulated floating surfaces. Depth comes from full-bleed color changes, paper against ink or forest, and 1px hairline dividers.

**The Flat-by-Default Rule.** Separate information with color fields, spacing, and hairlines—never decorative elevation.

## Shapes

Cards and buttons are visually square. Most components have no applied radius. The defined `2px` radius appears as a small focus/detail treatment and must not be generalized into rounded cards. Borders are typically 1px; a heavier left rule is reserved for editorial callouts and disclaimer structures.

## Components

### Buttons

- **Hero action:** forest fill with paper text.
- **Signal CTA:** signal-red fill and border with pure-white text.
- **Ghost action:** transparent with a context-appropriate hairline border.
- **Shape:** square, with at least a 44px touch target.
- **State:** short color and border transitions; visible 2px signal-red focus outline with 3px offset.

### Cards and Fact Grids

Cards are flat paper surfaces with square corners and no shadow. Many grids place a 1px trace-colored gap behind cards to create shared hairline seams. Card content typically combines a mono eyebrow, display title, readable secondary copy, structured facts, and a red arrow link.

### Masthead

The sticky 60px masthead uses paper, a trace bottom border, a linked JWILLSOLDIT wordmark with red dot, and mono navigation. Below `560px`, “Houston, Handled.” becomes “Houston” instead of shrinking the type.

### Related Editorial Links

Related links follow long-form content as a trace-separated “Keep exploring” section. Each square link card names its content type, title, and arrow. Hover and keyboard focus move the border to signal red and the surface to pure white.

### Source Panel and Disclaimers

Every guide and area page renders its own source list and review date from frontmatter. Disclaimers sit adjacent to the claim they qualify. These are customer-facing trust components, not hidden legal cleanup.

### Schematic Maps

Houston maps use the palette and field-guide labeling system but remain explicitly schematic. Accuracy captions are required. Do not imply exact boundaries, parcels, travel times, schools, flood risk, or availability.

### Compliance Footer

The ink footer contains the linked wordmark, Joey/REALTOR/CRG identity, IABS, Consumer Protection Notice, privacy, Houston, and Smart Move links, the supplied CRG logo, Equal Housing language, and shared disclaimer copy. Identity and legal-link type share a size to preserve the documented TREC relationship.

### Motion

Motion is restrained and under 600ms. The optional fine-pointer cursor trail is the only expressive motion pattern. It pauses when hidden and is disabled for reduced motion or non-hover pointers.

## Do's and Don'ts

### Do:

- **Do** preserve the parent JWILLSOLDIT wordmark and red dot across every surface.
- **Do** keep source panels, review dates, and relevant disclaimers visible.
- **Do** use accessible red text for small red copy on paper.
- **Do** keep long-form content within the established reading measure.
- **Do** preserve the forest hero action and red signal CTA as separate observed variants.
- **Do** retain keyboard focus, touch-target, and reduced-motion behavior.
- **Do** describe maps as schematic and route property-specific facts to address-level verification.

### Don't:

- **Don't** add shadows, gradients, glassmorphism, rounded SaaS cards, or dark dashboard styling.
- **Don't** introduce generic luxury-realtor photography as a substitute for verified local content.
- **Don't** restore the location finder, public methodology page, or generic community stubs as a visual-design side effect.
- **Don't** use Space Mono for prose or display headlines.
- **Don't** use small signal-red text on paper when the accessible red-text token is required.
- **Don't** rank communities or visually imply desirability, safety, school quality, or demographic fit.
- **Don't** use motion that scroll-jacks, creates parallax, ignores reduced-motion preferences, or competes with reading.

