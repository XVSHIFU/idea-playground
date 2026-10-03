---
name: MIRROR 7
description: Recovered pages retain the typography and material character of their fictional sources.
colors:
  ink: "#183d67"
  paper: "#f0f3f2"
  muted: "#566778"
  line: "#b8c7d0"
  accent: "#224f91"
  tutorial-ink: "#26291e"
  tutorial-paper: "#fbf9ed"
  tutorial-muted: "#626451"
  tutorial-line: "#c7c7ad"
  tutorial-accent: "#243d98"
  forum-ink: "#253446"
  forum-paper: "#e8edf1"
  forum-muted: "#586776"
  forum-line: "#b1bfce"
  forum-accent: "#1d4e88"
  manual-ink: "#283e39"
  manual-paper: "#fcfcfa"
  manual-muted: "#5f6c67"
  manual-line: "#b7c7bd"
  manual-accent: "#216555"
  bulletin-ink: "#202a36"
  bulletin-paper: "#fafafa"
  bulletin-muted: "#5d6570"
  bulletin-line: "#bec6ce"
  bulletin-accent: "#254d7d"
  discussion-ink: "#303a33"
  discussion-paper: "#f6f5f1"
  discussion-muted: "#646e64"
  discussion-line: "#c9cfc4"
  discussion-accent: "#3c664a"
  visited: "#645a80"
typography:
  display:
    fontFamily: "Georgia, 'Times New Roman', 'Songti SC', SimSun, serif"
    fontSize: "clamp(4rem,9vw,6rem)"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-.04em"
  body:
    fontFamily: "Georgia, 'Times New Roman', 'Songti SC', SimSun, serif"
    fontSize: "16px"
    lineHeight: 1.8
  forum-body:
    fontFamily: "Tahoma, 'Microsoft YaHei', sans-serif"
    fontSize: "14px"
    lineHeight: 1.8
  sans-body:
    fontFamily: "'Microsoft YaHei', sans-serif"
    fontSize: "15px"
    lineHeight: 1.8
  headline:
    fontSize: "32px"
    lineHeight: 1.3
  section:
    fontSize: "1.3rem"
    lineHeight: 1.5
  label:
    fontFamily: "Consolas, 'Courier New', monospace"
    fontSize: "12px"
    lineHeight: 1.5
  record-title:
    fontSize: "19px"
spacing:
  document-inline: "44px"
  document-inline-mobile: "20px"
  directory-gap: "56px"
  directory-gap-mobile: "32px"
  paragraph-after: "1.3em"
  section-before: "2em"
  footer-before: "38px"
components:
  mirror-navigation:
    backgroundColor: "#edf1f4"
    textColor: "#354d64"
    typography: "{typography.label}"
    padding: "10px 28px"
  directory-record:
    padding: "18px 0 19px"
  document-note:
    padding: "17px 21px"
  forum-post:
    backgroundColor: "#fff"
    textColor: "{colors.forum-ink}"
    typography: "{typography.forum-body}"
  paper-slip:
    backgroundColor: "#fffef2"
    padding: "13px 17px"
  discussion-comment:
    padding: "23px 0"
  bulletin-disclosure:
    padding: "15px 0"
---

# Design System: MIRROR 7

## Overview

**Creative North Star: "Recovered source pages"**

The archive index is cool, spare and typographic. Each recovered document keeps a distinct source identity: a cream personal website, a blue forum, a green software manual, a neutral security bulletin and a quiet contemporary discussion page. Typography and document structure carry the atmosphere; all imagery is made from HTML and CSS.

**Key Characteristics:**
- Large serif archive masthead with compact monospaced catalog metadata.
- Five source palettes and local font stacks, connected by a thin mirror navigation strip.
- Flat, square document surfaces, visible rules and native text links.

## Colors

### Primary

The index uses blue ink and link accents against cool paper. Each source overrides the same five CSS roles: ink, paper, muted, line and accent. Tutorial links remain blue; manual and contemporary discussion links use green. Visited links share the muted purple token across sources.

### Neutral

Paper, muted text and rule colors remain specific to their source. White forum bodies sit beside blue author cells; the manual's pale paper slip sits within a green diagram field. The navigation strip keeps its own cool tint across all documents.

## Typography

Local system fonts are deliberate period cues. The index and tutorial use the serif body stack; the old forum uses Tahoma; the manual, bulletin and modern discussion use Microsoft YaHei. Consolas and Courier New distinguish catalog labels, path names, dates and literal technical strings. No web fonts are loaded.

The display token belongs to the index masthead. Document titles use the headline role with source overrides: old forum (24px), bulletin (30px), modern discussion (31px). Body line height stays generous across sources. Section titles, bold lead-ins and compact metadata provide hierarchy without extra decoration.

## Layout

The index is centered with a maximum width of 1200px and desktop padding of 44px 56px 36px. Its directory has a flexible records column and a 220px mirror-note column. Record dates occupy a 90px column beside linked titles.

Documents share a centered container, normally 880px wide, with a 38px top margin and 64px bottom margin. Source limits are 1000px for the old forum, 1030px for the manual and 870px for the modern discussion. Forum posts use a 135px author column. The manual places a 150px contents rail beside the article with a 34px gap.

At 700px and below, the index uses 25px 23px padding; the directory becomes one column, with its note below the records. Date columns shrink to 76px and linked titles to 17px. Document margins and padding tighten; titles become 27px, except bulletin and modern discussion titles at 26px. Forum author cells become horizontal strips above posts. The manual rail becomes a wrapping row above its article. Table cell padding reduces from 12px to 8px; tutorial edition text drops below its masthead.

## Elevation & Depth

There are no shadows, gradients or floating surfaces. Rules, double rules, solid masthead bands and lightly tinted fields distinguish document regions. The manual illustration uses nested bordered rectangles to describe a paper slip.

## Shapes

All surfaces have square corners. Thin borders organize notes, forum posts and tables; heavier masthead strokes mark the source identity. There are no pill controls, rounded cards or decorative icons.

## Components

- **Mirror navigation:** a compact flex row with a return link and wrapping source path, separated from the page by a thin rule. Its padding narrows on mobile.
- **Directory record:** a date-and-title grid with a top rule and a monospaced provenance line. Titles stay native underlined links.
- **Document note:** a plain bordered inset with compact prose; its colors inherit from the source page.
- **Forum post:** a tinted author cell, white body, timestamp divider and optional inset quote. On mobile the author cell moves above the body.
- **Manual paper slip:** a small cream rectangle with source metadata, contained in a bordered demonstration figure. It is an illustration, not a draggable control.
- **Bulletin table:** collapsed borders, tinted header cells and left-aligned text; row and column headers remain semantic HTML.
- **Discussion comment:** a top rule, name/time header and uninterrupted prose. No avatars or simulated input controls.
- **Revision disclosure:** native details/summary with top and bottom rules. Keyboard focus uses the same visible outline as links.

Links use a 4px underline offset, a thicker underline on hover and a 2px current-color focus outline with a 5px offset. Supporting browsers may animate document navigation for 100ms outgoing and 140ms incoming only when reduced motion is not requested. Content and navigation require no script.

## Do's and Don'ts

- **Do** preserve each source's palette, typography and document structure.
- **Do** use local fonts, native links and semantic document elements.
- **Do** preserve the thin return-to-index strip across recovered pages.
- **Don't** introduce remote assets, downloaded fonts or raster decoration.
- **Don't** add task bars, progress indicators or a reveal interface.
- **Don't** turn the paper-slip illustration into an interactive application mockup.
