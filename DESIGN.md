---
name: Rishini Dharan T · Portfolio
description: A night console for a developer who ships. Deep navy, one ice-blue signal, proof on demand.
colors:
  console-navy: "#061325"
  console-surface: "#0a1b31"
  console-surface-raised: "#0f2440"
  signal-ice: "#8fd0ff"
  signal-ink: "#061325"
  text-frost: "#eaf4ff"
  text-mist: "#9fbbdb"
  text-haze: "#7e9cc0"
  paper: "#f3f7fc"
  paper-surface: "#ffffff"
  paper-surface-raised: "#e7eef8"
  signal-deep: "#0f5e9c"
  text-ink: "#0a1a2f"
  text-slate: "#3d5573"
  text-pewter: "#546c8a"
  terminal-black: "#030b17"
typography:
  display:
    fontFamily: "Bricolage Grotesque, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.9rem, 7.6vw, 6.4rem)"
    fontWeight: 400
    lineHeight: 0.98
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Bricolage Grotesque, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.3rem, 5.4vw, 4.6rem)"
    fontWeight: 400
    lineHeight: 1.02
    letterSpacing: "-0.03em"
  accent-word:
    fontFamily: "Instrument Serif, Georgia, serif"
    fontWeight: 400
  body:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.82rem"
    fontWeight: 400
rounded:
  xs: "6px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  pill: "999px"
spacing:
  gutter: "clamp(16px, 4vw, 40px)"
  section: "clamp(80px, 11vw, 144px)"
  container: "1240px"
components:
  button-primary:
    backgroundColor: "{colors.signal-ice}"
    textColor: "{colors.signal-ink}"
    rounded: "{rounded.pill}"
    padding: "0 22px"
    height: "46px"
  button-ghost:
    textColor: "{colors.text-frost}"
    rounded: "{rounded.pill}"
    padding: "0 22px"
    height: "46px"
  chip:
    rounded: "{rounded.sm}"
    padding: "0 14px"
    height: "44px"
  card:
    backgroundColor: "{colors.console-navy}"
    rounded: "{rounded.lg}"
    padding: "28px"
  input:
    backgroundColor: "{colors.console-surface}"
    textColor: "{colors.text-frost}"
    rounded: "{rounded.sm}"
    padding: "12px 14px"
---

# Design System: Rishini Dharan T · Portfolio

## Overview

**Creative North Star: "The Night Console"**

A calm operator's screen after hours: a deep navy field, one ice-blue signal colour, and everything else in quiet frost tones. The page reads like a console that answers when asked. The work, the numbers and the code are always one click away, and nothing shouts to get attention.

The visitor is a recruiter skimming between candidates, so every surface gives evidence: a live demo, a public repo, a rating with its rank band. Decoration that carries no evidence doesn't belong. Developers who look closer find depth in the programmer layer (command palette, shell, commit graph), but it never blocks the main path.

Light mode is the default for first-time visitors and dark mode is one click away. Both are composed themes, not one inverted from the other. The direction comes from the Helm reference the owner supplied.

**Key Characteristics:**
- One accent colour, used for actions and the current state, never for decoration.
- Light-weight grotesque headlines with exactly one Instrument Serif italic word.
- Monospace only where it means code, data or a measurement.
- Components feel tactile and confident: they rise, press and confirm.
- Proof sits next to every claim.

## Colors

One signal colour on a tonal navy (dark) or paper (light) field. The domain colours (competitive-programming rank bands, LeetCode difficulty) are data and keep their platforms' meanings.

### Primary
- **Signal Ice** (`#8fd0ff`, dark) / **Signal Deep** (`#0f5e9c`, light): primary buttons, links, focus rings, the active filter chip, the italic accent word. It's the only colour that means "act here".

### Neutral
- **Console Navy** (`#061325`), **Console Surface** (`#0a1b31`), **Console Surface Raised** (`#0f2440`): the dark ground, in three tonal steps instead of shadows.
- **Paper** (`#f3f7fc`), **Paper Surface** (`#ffffff`), **Paper Surface Raised** (`#e7eef8`): the light ground's matching steps.
- **Text Frost / Mist / Haze** (dark) and **Text Ink / Slate / Pewter** (light): primary, secondary and tertiary text. Every pair passes WCAG AA on its ground.
- **Terminal Black** (`#030b17`): the shell stays a terminal in both themes, through its own fixed `--term-*` tokens.

### Data and terminal colours
These are fixed meanings, not palette choices. Dark theme first, light theme second:
- **LeetCode difficulty:** Easy `#1cbaba` / `#00796b`, Medium `#ffb800` / `#8a5300`, Hard `#ff6b6b` (arc `#f63737`) / `#c62828`.
- **Codeforces ranks:** Newbie, Pupil, Specialist, Expert and Candidate Master, as `--cf-*` (band) and `--cf-*-ink` (text) tokens.
- **AtCoder bands:** Gray, Brown, Green, Cyan and Blue, as `--ac-*` and `--ac-*-ink`.
- **Terminal:** `--term-bg #030b17`, `--term-text #cfe3fa`, `--term-bright #eaf4ff`, `--term-dim #7e9cc0`, `--term-accent #8fd0ff`, `--term-err #ff9b9b`, `--term-border rgba(200,225,255,0.1)`. The same in both themes.

### Named Rules
**The One Signal Rule.** Ice blue marks action and state only. If something is blue, it can be clicked or it is the current selection.

**The Data Keeps Its Colours Rule.** Codeforces and AtCoder rank colours and LeetCode's difficulty colours are the platforms' own. They appear only as data (ladders, donut, rank badges), with lighter variants for the dark ground, and they never become part of the interface palette.

## Typography

**Display Font:** Bricolage Grotesque (fallback: ui-sans-serif, system-ui)
**Accent Font:** Instrument Serif italic (fallback: Georgia)
**Body Font:** Geist (fallback: ui-sans-serif, system-ui)
**Label/Mono Font:** JetBrains Mono (fallback: ui-monospace)

The headline voice is light, at weight 400, and tightly tracked. A single italic serif word in each headline carries the emphasis instead of bold or colour changes.

### Hierarchy
- **Display** (400, clamp 2.9–6.4rem, line-height 0.98): the hero headline only.
- **Headline** (400, clamp 2.3–4.6rem, line-height 1.02): one per section, balanced wrapping.
- **Body** (400, 1.0625rem, line-height 1.6): reading text, capped at about 75–80 characters per line, with `text-wrap: pretty`.
- **Label** (JetBrains Mono, about 0.82rem): code, ratings, dates, shell output and file paths.

### Named Rules
**The One Italic Word Rule.** Each headline gets exactly one Instrument Serif italic word, the word that carries the meaning ("live *demo*", "how they're *built*").

**The Mono Means Data Rule.** Monospace is for code, numbers and measurements, never for technical decoration.

## Layout

A 1240px container with a fluid gutter (`clamp(16px, 4vw, 40px)`) and fluid section padding (`clamp(80px, 11vw, 144px)`). Headings sit on the content edge with no label column or section numbers beside them. Sections alternate between the plain ground and a banded surface (`.section-band`) for rhythm. Below 960px everything collapses to one column. At 390px every tap target is at least 44px tall, and nothing scrolls sideways.

## Elevation & Depth

Depth comes from tonal surface steps and 1px borders first. Interactive surfaces then lift softly on hover, which signals "this responds" without adding a permanent second layer.

### Shadow Vocabulary
- **Ambient lift** (`--shadow-lift`: `0 10px 30px -12px rgba(0,0,0,0.55)` dark, `0 12px 28px -14px rgba(10,26,47,0.28)` light): coding cards and gallery photos on hover or focus.
- **Palette float** (`0 30px 80px rgba(0,0,0,0.45)`): the command palette, the only surface that floats over the page at rest.

### Named Rules
**The Lift Means Interactive Rule.** A shadow appears only on something you can act on, and only while you're pointing at or focused on it. At rest, the page is flat.

## Shapes

A small radius scale and a pill: 6px (`--radius-xs`) for tags, badges and logo tiles; 8px (`--radius-sm`) for chips and inputs; 12px (`--radius-md`) for the code excerpt and the terminal; 16px (`--radius`) for cards and photos; and 999px for buttons. Icon buttons are circles. Corners stay consistent between a photo's thumbnail and its enlarged view, and the enlarge animation carries the radius through the transition.

## Components

### Buttons
- **Shape:** a 46px-tall pill.
- **Primary:** Signal background with Signal Ink text, darkening slightly towards the text colour on hover.
- **Ghost:** an accent-soft tint with a hairline border that strengthens on hover.
- **Press:** every button moves down 1px on `:active`. Tactile feedback is part of the system.

### Chips
Skill chips are 44px tall with an 8px radius. Hovering tints them accent-soft. The active filter fills with the Signal colour, which drives the project filter.

### Cards / Containers
Cards have a 16px radius, a 1px border and 28px of padding, and sit on the ground or surface tone. On hover, interactive cards gain the ambient lift and a stronger border.

### Inputs / Fields
Inputs have visible labels above them, an 8px radius and a strong border. Focus turns the border Signal-coloured and adds a 3px accent-soft ring. Errors never turn the field red. They are announced through `aria-invalid` and a status line under the form, and focus moves to the first field that needs attention.

### Navigation
A fixed 68px bar holding the logo wordmark (with "Dharan" in the italic serif), four text links (Work, Skills, About, Experience), the Ctrl K palette key, the theme toggle, a ghost "Résumé" pill and a primary "Contact me" pill. Shell and Gallery are reached through the palette, not the nav. Below 960px it becomes a full-screen menu.

### Rank Ladder (signature)
A horizontal bar of a platform's rank bands in their real colours, with markers for the current and peak ratings and labels like "1,251 · Pupil". The markers climb into place when the card enters view. The numbers come from `stats.json`, refreshed daily.

## Do's and Don'ts

### Do:
- **Do** put the evidence (link, number, code) next to every claim.
- **Do** use the Signal colour only for actions and the current state.
- **Do** give every motion a job: confirm an action, show a change of state, or keep continuity (the theme reveal, the photo enlarge).
- **Do** respect `prefers-reduced-motion` with a gentler alternative, never by silently removing a feature (the gallery offers a Play button).
- **Do** theme browser surfaces too: selection, caret, scrollbars and focus rings.

### Don't:
- **Don't** add section numbers or eyebrow labels above headings.
- **Don't** use more than one italic serif word per headline, or gradient text anywhere.
- **Don't** use monospace as a "techy" costume for prose.
- **Don't** put shadows on non-interactive surfaces or leave them at rest.
- **Don't** tilt, parallax or fade in every section on scroll. Keep to one authored moment per surface.
- **Don't** invent claims, testimonials or numbers. Stats come from the platforms' own data.
