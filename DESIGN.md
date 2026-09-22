---
name: Agent Harness Atlas
description: A source-backed workbench for exploring agent runtime architecture.
colors:
  lab-paper: "#F6F8FB"
  carbon: "#17212B"
  zcode-orange: "#E56B36"
  deepseek-violet: "#6D5BD0"
  codex-blue: "#2F62D6"
  ax-teal: "#138A7E"
  surface: "#FFFFFF"
  muted: "#566780"
  divider: "#DCE3ED"
  reading-ink: "#43536C"
  action-hover: "#214EAD"
  focus: "#294FAD"
  policy: "#AD571F"
  evidence-bg: "#EDF2F8"
  evidence-ink: "#4D6179"
typography:
  display:
    fontFamily: '"Recursive Variable", "Recursive Local", sans-serif'
    fontSize: "clamp(2rem, 3.3vw, 3.125rem)"
    fontWeight: 760
    lineHeight: 1.14
    letterSpacing: "-0.045em"
  headline:
    fontFamily: '"Recursive Variable", "Recursive Local", sans-serif'
    fontSize: "clamp(1.75rem, 2.6vw, 2.625rem)"
    fontWeight: 780
    lineHeight: 1.18
    letterSpacing: "-0.04em"
  title:
    fontFamily: '"Recursive Variable", "Recursive Local", sans-serif'
    fontSize: "1rem"
    fontWeight: 690
    lineHeight: 1.25
    letterSpacing: "-0.03em"
  body:
    fontFamily: '"Recursive Variable", "Recursive Local", sans-serif'
    fontSize: "1rem"
    lineHeight: 1.7
  label:
    fontFamily: '"Recursive Variable", "Recursive Local", sans-serif'
    fontSize: "0.8125rem"
    fontWeight: 580
  code:
    fontFamily: '"Recursive Variable", monospace'
    fontSize: "0.6875rem"
    lineHeight: 1.65
    fontVariation: '"MONO" 1, "CASL" 0'
rounded:
  tag: "4px"
  segment: "5px"
  icon: "6px"
  control: "7px"
  field: "8px"
  node: "10px"
  inspector: "13px"
  enclosure: "14px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.codex-blue}"
    textColor: "{colors.surface}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "11px 15px"
  button-primary-hover:
    backgroundColor: "{colors.action-hover}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.reading-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "11px 15px"
  search-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.carbon}"
    rounded: "{rounded.field}"
    padding: "12px 15px"
  main-navigation:
    backgroundColor: "{colors.surface}"
    height: "72px"
  evidence-tag:
    backgroundColor: "{colors.evidence-bg}"
    textColor: "{colors.evidence-ink}"
    rounded: "{rounded.tag}"
    padding: "3px 7px"
  diagram-node:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.carbon}"
    rounded: "{rounded.node}"
    padding: "17px 19px"
  overlay-switch:
    backgroundColor: "#EAF0F7"
    rounded: "{rounded.control}"
    padding: "3px"
  inspector:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.inspector}"
    width: "350px"
---

# Design System: Agent Harness Atlas

## Overview

**Creative North Star: "Exploded Systems Workbench"**

The Atlas is a calm, precise workbench for understanding software boundaries. Lab Paper and Carbon support countable, lifted architecture parts; Recursive connects compact interface labels, explanation, and source code without changing visual voice. The diagram is an object to inspect, with enough depth to reveal selection and grouping.

The material is HTML and SVG: accessible controls, visible edges, restrained layers, and source evidence close to the explanation. The current learning surface follows the approved composition A for guided labs and composition B for the opening landscape. That page arrangement is recorded in the surface brief; the durable system is the workbench, its palette, typography, and meaningful depth. No raster assets ship.

**Key Characteristics:**

- Manipulable diagrams with readable, keyboard-operable parts.
- Pale working surfaces, dark text, and four stable project colors.
- Restrained structural depth and brief lift interactions.
- Evidence labels and visible distinctions between policy and containment.

## Colors

The palette uses cool paper and dark ink as its base; four exact project colors identify systems without implying ranking.

### Primary

- **Codex Blue** is the default action and link color, and identifies Codex within diagrams. The action-hover token darkens primary buttons.

### Secondary

- **ZCode Orange** identifies ZCode.
- **DeepSeek Violet** identifies DeepSeek; the existing model-node treatment also uses violet.
- **AX Teal** identifies AX and the conceptual orchestration enclosure.

### Neutral

- **Lab Paper** is the stage, page, and footer ground; **Surface** is the white reading pane and control face.
- **Carbon** carries primary text; **Reading Ink** carries explanatory copy; **Muted** carries supporting metadata.
- **Divider** separates regions without making every paragraph a card.
- **Evidence Background** and **Evidence Ink** mark factual status quietly.
- **Policy** is a semantic warm accent for policy and host-authority boundaries. It is not a fifth project identity.
- **Focus** is the high-contrast keyboard outline.

**The Identity Rule.** Preserve the four exact project colors and their names; do not exchange them to suit a particular screen.

**The Redundant Cue Rule.** Color accompanies names, icons, labels, strokes, and state attributes. Safety mode reduces unrelated surface depth while keeping node text at full opacity.

## Typography

**Display, body, and label font:** self-hosted Recursive Variable, then Recursive Local, then sans-serif. Source excerpts use the same family with a monospace fallback and the MONO axis enabled. The application imports the full local variable font through Fontsource.

The default axes are MONO 0, CASL 0, CRSV 0. Upright, controlled letterforms make the interface feel technical without turning explanatory prose into terminal output.

### Hierarchy

- **Display:** reference-page headings; the largest responsive role.
- **Headline:** learning-pane headings, tight and balanced. Desktop uses slightly less negative tracking than the base role.
- **Title:** component names on diagram nodes.
- **Body:** introductory explanation; supporting lesson paragraphs use 0.875rem with the same generous 1.7 line height.
- **Label:** action text; navigation and diagram metadata have compact role-specific sizes.
- **Code:** source excerpts, with MONO 1 and CASL 0.

Lesson introductions are limited to 42ch on desktop; reference summaries to 46ch; longer timeline explanations to 68ch. Numbered steps and zoom output use tabular numerals. Mobile and large-text styles alter the scale for their layouts; do not force desktop font sizes onto them.

**The One Family Rule.** Use Recursive's axes and weight range to separate prose, controls, and code before introducing another typeface.

## Layout

The learning workbench has a full-width header (72px) and a desktop reading/stage split of approximately 29% / 71%. The reading column has a 320px minimum in the main grid; between 761px and 1100px it becomes 310px. Harness selection sits above the reading content. The stage keeps its overlay and zoom controls outside the pannable world. The desktop learning frame fills the available viewport below the header, with an existing 740px minimum and 1100px maximum height.

A faint 24px square grid describes the working canvas. The diagram world is 1000 × 795px before fit and zoom. When the stage itself is 760px wide or narrower, its world uses a 620px width and two-column node placement; this is independent of the page breakpoint.

At 760px and below, the page becomes stage-first, followed by narration. The header wraps, harness choices wrap, and an expandable All components list provides another route into the diagram. The mobile stage is 650px tall, or 770px while that list is open. Inspector details become a fixed bottom sheet. Reference layouts stack into one column; the wide comparison table keeps a contained horizontal scroller.

Large text uses the dedicated `.large-text` reflow when the observed 1rem probe exceeds 20px. It makes the world an untransformed, auto-height grid, wraps controls, puts narration below the stage, and replaces drawn edges with textual “To …” connections on nodes. It hides decorative enclosures and zoom controls. Preserve this alternative when extending diagrams; enlarged text must not depend on shrinking an entire canvas.

Spacing uses small control gaps, 24px-scale panel padding, and wider whitespace between distinct reading sections. The reference-page container caps at 1540px with 5% side padding. The large desktop breakpoint is 1600px.

## Elevation & Depth

Depth explains manipulable parts and their state. Reading surfaces stay flat; diagram nodes have a stacked lower edge and restrained ambient shadow. The landscape enclosure has a small offset layer. Inspectors float above the stage, with a stronger separation shadow on mobile.

### Shadow Vocabulary

- **Node stack:** `0 7px 0 -1px #e0e7ef, 0 8px 0 0 #afbdd0, 0 13px 17px -11px #3a4d7250`.
- **Selected node:** the two structural layers derive from its project color; the ambient layer is `0 18px 19px -11px #3a4d7250`.
- **Inspector:** `0 8px 38px #2538562e`; the mobile sheet uses `0 -6px 35px #26384d38`.
- **Active overlay segment:** `0 1px 3px #36465f18`.

**The Meaningful Lift Rule.** Hover and keyboard focus lift nodes by 6px; selection lifts them by 9px. Chapter focus enters with a 3px lift. Do not apply the diagram's stacked depth to every reading container.

Node transitions last 250ms and chapter entry lasts 350ms, both using `cubic-bezier(0.16, 1, 0.3, 1)`. Reduced motion disables animation and transitions and restores automatic scroll behavior. Large-text reflow disables transforms and chapter animation on nodes.

## Shapes

Controls use modest corners: small tags, slightly larger buttons and fields, and rounded rectangular nodes. Circular chapter numbers distinguish sequence from component identity. Dashed outlines denote extensions or boundaries; they are meaningful strokes, not decoration.

The enclosure is a broad plane behind the parts it groups. SVG edges use arrowheads and distinct dashed patterns for results, composition, and state. Keep node labels horizontal and readable; the sense of depth comes from edges and shadows rather than rotated text.

## Components

### Buttons

Compact, direct controls. Primary actions use Codex Blue with white text and the darker hover token; secondary actions use white with a thin border and Reading Ink. Both use the control radius and a 43px minimum height. Disabled controls lower opacity to 0.4 and use a not-allowed cursor. Keyboard focus uses a 3px outline with 4px offset.

### Navigation and project choices

The main navigation uses text links with a blue lower border and stronger weight for the current page. Harness choices combine a small tilted project mark, name, outline, and pressed state; selected backgrounds mix 8% project color with white. Preserve real links for routes and buttons for in-page state changes.

### Overlay switch and evidence tags

Architecture/Safety controls form a compact segmented group; the active segment becomes a white, lightly raised face. Evidence tags use neutral fills, small semibold text, and explicit status names. Tags communicate source status rather than acting as colorful category decorations.

### Search field

A white outlined field with an inline search icon and the field radius. Its surrounding container uses a visible focus-within outline; typing text remains Carbon. The source index reports results separately, so the field stays visually simple.

### Diagram nodes

Each component is a real button containing an icon, a strong title, and a subtitle. Focused chapter nodes gain a light project tint; selected nodes gain a thicker project border, stronger lift, and an inspector. Arrow keys, Home, and End move between nodes. Mouse and touch panning operate on the surrounding canvas, not on a node press.

Model and policy nodes have their existing violet and warm material treatments. Safety mode emphasizes policy and boundary outlines; unrelated nodes retain readable text. In large-text mode, each node exposes outgoing destinations in text.

### Inspector

A floating desktop details panel with evidence status, title, close control, responsibility, input/output contracts, and source trail. On mobile it is a modal bottom sheet: focus moves into it, Tab stays inside, Escape closes it, background regions become inert, and focus returns to the invoking element on close. Desktop remains a complementary panel. Source paths wrap; code excerpts may scroll inside their own surface.

### Reference containers

Comparison tables, timeline rows, source entries, and glossary definitions favor dividers and reading rhythm over repeated elevated cards. Keep the comparison table's sticky headers and contained overflow. Text and source links remain selectable and semantic.

## Do's and Don'ts

### Do:

- **Do** preserve the exact named palette and self-hosted Recursive typography.
- **Do** use HTML buttons and SVG edges for inspectable architecture.
- **Do** keep project identity, evidence status, and safety concepts readable without color alone.
- **Do** preserve stage-first mobile reading and the modal inspector's focus behavior.
- **Do** retain large-text reflow with textual connections and reduced-motion support.
- **Do** keep source evidence close to the explanation it supports.

### Don't:

- **Don't** replace interactive diagrams with raster mockups or WebGL-only content.
- **Don't** lower text opacity to de-emphasize unrelated Safety nodes.
- **Don't** use lift, stacking, or continuous motion as decoration on reading surfaces.
- **Don't** shrink an entire diagram to compensate for enlarged text.
- **Don't** turn the landscape's conceptual placement into a claim of tested integration.
