---
name: 缓存之城
description: A quiet city atlas and literary reading sheet.
colors:
  paper: "#ece9df"
  ink: "#283c38"
  muted: "#596962"
  line: "#bbc0b3"
  accent: "#a4432f"
  white: "#f8f6ef"
  hover: "#dce1d3"
  primary-hover: "#40564b"
  map-hover: "#c9d5b4"
typography:
  display:
    fontFamily: '"City Serif", "Noto Serif SC", "Songti SC", "SimSun", serif'
    fontSize: "clamp(28px, 3.1vw, 46px)"
    fontWeight: 500
    lineHeight: 1.45
    letterSpacing: "-.025em"
  headline:
    fontFamily: '"City Serif", "Noto Serif SC", "Songti SC", "SimSun", serif'
    fontSize: "38px"
    fontWeight: 500
    letterSpacing: ".025em"
  story:
    fontFamily: '"City Serif", "Noto Serif SC", "Songti SC", "SimSun", serif'
    fontSize: "18px"
    lineHeight: 2.1
  body:
    fontFamily: '"Microsoft YaHei", system-ui, sans-serif'
    fontSize: "14px"
  label:
    fontFamily: '"Microsoft YaHei", system-ui, sans-serif'
    fontSize: "11px"
spacing:
  choice-gap: "8px"
  compact: "16px"
  section: "24px"
  pane: "28px"
  desktop-inset: "42px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.white}"
    padding: "11px 16px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    padding: "11px 16px"
  button-secondary-hover:
    backgroundColor: "{colors.hover}"
  anchor-editor:
    backgroundColor: "{colors.white}"
    padding: "20px"
  saved-quote:
    textColor: "{colors.accent}"
    padding: "18px 0"
---

# Design System: 缓存之城

## Overview

**Creative North Star: "The Quiet City Atlas"**

An atlas and a literary reading sheet share one paper surface. Green ink carries the city and its prose; rust identifies words held in place and changes that matter. This describes the implemented direction selected during direct coding, not a separate user-approved visual exploration.

**Key Characteristics:**

- Flat paper, restrained rules, and generous reading space.
- Chinese serif storytelling paired with compact sans-serif controls.
- Geometric routes and location markers convey actionable geography.

## Colors

### Primary

Rust (`accent`) identifies anchors, selected phrases, important story changes, and focus outlines. Dark green (`ink`) supplies text, the current location, and the primary action.

### Neutral

Paper is the continuous page background. Warm white provides a gentle inset for the anchor editor, instructions, and dialog. Muted ink carries supporting information; line separates adjacent regions. Hover colors give controls and available map locations visible feedback.

**The Meaningful Rust Rule.** Use rust for anchors, meaningful change, selected phrases, and keyboard focus.

## Typography

The bundled City Serif face is a Noto Serif SC subset at `assets/story-serif.ttf`, declared at weight 400 with swap loading. The fallback stack supports missing characters. Headings request weight 500 and the wordmark requests 700; these are not separately bundled weights.

The display role introduces the atlas. The headline role names the current location; it reduces to 32px on narrow screens. Story text uses the serif role with a maximum measure of 34em. It reduces to 17px at the intermediate breakpoint and returns to 18px on narrow screens. Saved phrases use serif text at 21px; notebook phrases use 16px. Controls use the sans-serif body role, while utility information commonly uses the label role.

**The Reading Voice Rule.** Keep story prose and saved words in the serif voice, and operational controls in the sans-serif voice.

## Layout

Desktop content uses 4vw outer margins and a two-column 1.24fr / 1fr grid. A ruled map pane sits beside the reading pane, and the notebook repeats the same grid below. Above 1500px, the body is capped at 1600px and centered.

At 950px and below, internal padding contracts and the atlas introduction stacks. At 650px and below, outer margins become 22px and the layout follows map, reading pane, then notebook. The map keeps its SVG viewBox and has a mobile maximum height of 310px. The notebook becomes a single column. Labels are retained where needed to understand location state and anchors.

## Elevation & Depth

The interface has no box shadows. Fine borders and the warm white inset distinguish content without lifting it off the paper. The native dialog uses a translucent ink backdrop. Scene changes arrive with a slight vertical movement and blur over half a second; reduced-motion preferences remove animations and transitions.

**The Shared Paper Rule.** Separate ordinary regions with space and thin rules rather than raised cards.

## Shapes

Panels, phrase rows, and controls use rectilinear forms. Circular marks belong to map locations and their legend. Roads use fine strokes; the revealed route uses a dashed rust stroke. Do not propagate map circles into rounded panel containers.

## Components

### Buttons

The primary action is green ink with warm white text and a matching border. Secondary travel and phrase controls use transparent backgrounds with line-colored borders. Both share the documented padding and a short color/background transition. Hover shifts the fill; keyboard focus adds a three-pixel rust outline offset by five pixels. Disabled buttons reduce opacity to .55. Text actions use an underline, and header utility actions omit borders.

### Navigation

Available map locations and travel buttons provide two ways to move. The current map location is filled with ink; available locations gain a green hover fill and thicker stroke. Old place names are struck through. State labels and the current-location legend supplement color. Travel buttons wrap with a 10px gap.

### Saved words and editor

A saved quotation is framed by horizontal rules and rendered in rust. The notebook presents saved phrases in divided rows with a narrow metadata column. The warm white editor contains vertically stacked phrase choices; the selected choice changes border and text to rust. The system has no free-text input.

### Restart dialog

The warm white dialog has a thin line border, 28px padding, a compact serif title, and two action buttons. Its maximum width leaves 32px of viewport clearance. Buttons wrap on narrow screens.

## Do's and Don'ts

### Do:

- **Do** keep the reading voice distinct from navigation and status labels.
- **Do** pair meaningful map colors with labels or geometric state changes.
- **Do** honor reduced motion and preserve visible keyboard focus.

### Don't:

- **Don't** use raised cards to divide the shared paper surface.
- **Don't** turn every action into a rust-filled primary button.
- **Don't** assume the bundled serif subset provides arbitrary new story characters or separate heading weights.
