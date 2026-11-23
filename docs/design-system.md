# Pipesor design system — "Ink on paper"

The visual language of the dashboard. [`src/app/styles/tokens.css`](../src/app/styles/tokens.css) is authoritative for values; this guide explains intent and usage. The Paper mockups remain a reference for information architecture and screen content, not for visual styling.

## Principles

- **Sober and precise.** The brand is monochrome (ink `#17191c` on paper `#f4f6f8`). Primary actions are ink, hairline borders separate content, and color is reserved for meaning.
- **One accent, for interaction only.** Blue marks what you can act on or where you are: links, focus, selection and position indicators (the active navigation bar and icon, the current tab's underline). The label of the current item stays ink, for legibility. Blue never decorates and never competes with status colors.
- **Calm density.** An operations tool shows a lot of data. Use generous whitespace between groups, compact rows inside them, and tabular numerals for durations, counts and timestamps.
- **Quiet motion that confirms.** Transitions of 120–280 ms acknowledge hover, press and completed actions. Nothing moves on its own, and everything still works with `prefers-reduced-motion`, which collapses all motion globally.
- **Accessible by construction.** Every text/background pair below is WCAG AA in both themes. Focus is always visible, and status is never conveyed by color alone (always a label, optionally a dot).

## Color

| Role | Tokens | Use |
| --- | --- | --- |
| Canvas and surfaces | `--color-bg-app`, `--color-surface`, `--color-surface-subtle`, `--color-surface-tint`, `--color-surface-elevated` | App background, cards, hover/selected rows, popovers. |
| Borders | `--color-border`, `--color-border-strong` | Hairlines between and around surfaces; strong for inputs and dividers that must read. |
| Text | `--color-text-primary`, `--color-text-secondary`, `--color-text-tertiary` | Content, supporting text, metadata (all AA on every surface). |
| Ink | `--color-ink`, `--color-ink-hover`, `--color-on-ink` | Primary buttons and the main call to action of a view. |
| Accent | `--color-accent`, `--color-accent-hover`, `--color-on-accent`, `--color-accent-soft`, `--color-focus`, `--color-selection` | Links, focus ring, selection, position indicators, the selected option of a segmented control. |
| Chrome | `--color-chrome` | Translucent canvas (with backdrop blur) for sticky chrome such as the narrow-screen top bar. |
| Status | `--color-{critical,warning,success,info}` | Vivid: dots, bars, fills (≥ 3:1 non-text contrast). |
| | `--color-{status}-text` | Status-colored text (AA). Never use the vivid token for text. |
| | `--color-{status}-soft`, `--color-{status}-border` | Tinted badge and callout backgrounds and borders, derived from the active theme. |

Measured contrast (light / dark): primary text 17.6 / 17.2, secondary 6.2 / 7.7, tertiary 5.1 / 5.4, accent 6.0 / 7.2, status text 5.7–6.6 / 9.6–12.0, status text on its soft tint 4.9–5.5 / 8.2–9.7, text on ink 17.6 / 18.1.

Do not add hex values in components. If a new role is needed, add a semantic token here first, with both themes and its contrast.

## Typography

- **Geist** for the interface and **Geist Mono** for identifiers, commits, logs and evidence. Both are loaded from Google Fonts in `index.html`.
- Scale (size / line-height): `--text-2xs` 11/16, `--text-xs` 12/18, `--text-sm` 13/20, `--text-base` 14/22 (body default), `--text-md` 16/24, `--text-lg` 18/26, `--text-xl` 22/30, `--text-2xl` 28/36. Always pair a size with its leading.
- Weights: 400 body, 500 labels and emphasis, 600 headings. Headings use `--tracking-snug` (applied globally to `h1`–`h3`) or `--tracking-tight` at 22 px and above. Use `--tracking-wide` only for small uppercase overlines.
- Tables and `<time>` use tabular numerals globally.

## Space, shape and elevation

- Spacing follows a 4 px grid: `--space-0-5` (2) … `--space-16` (64). Use `--space-2`/`--space-3` inside components, `--space-4`/`--space-6` between related groups, and `--space-8` and up between sections.
- Radii: `--radius-xs` 4 (inline tags), `--radius-sm` 6 (small controls, code), `--radius-md` 8 (buttons, inputs), `--radius-lg` 12 (cards, panels), `--radius-xl` 16 (dialogs, sign-in), `--radius-full` (pills, avatars).
- Elevation: `--shadow-xs`/`--shadow-sm` for resting cards, `--shadow-md` for raised or hovered elements, `--shadow-lg` for popovers, menus and overlays. Dark mode adds a hairline because shadows barely show on black.

## Motion

- Durations: `--duration-fast` (120 ms: hover, color), `--duration-base` (180 ms: press, small movement), `--duration-slow` (280 ms: panels, reveals).
- Easing: `--ease-standard` for state changes, `--ease-out` for things entering.
- Press feedback: `transform: scale(var(--press-scale))` on `:active` for buttons.
- Never animate layout-heavy properties on large areas. Prefer opacity, transform and color.

## Focus and accessibility

- `global.css` provides a single ring (`--focus-ring-width` in `--color-focus`, `--focus-ring-offset`) on `:focus-visible` for every element. Components only adjust the offset when space is tight.
- Programmatic focus targets (page headings with `tabIndex={-1}`) suppress the outline with `:focus { outline: none }`. They are not interactive.
- Keep the existing semantics: native tables, buttons for actions, links for navigation, `aria-live` for asynchronous confirmations.

## Layout and navigation

- **Shell.** `AppLayout` places the sidebar rail (`--sidebar-width`, collapsible to `--sidebar-width-collapsed`) beside the content. Content is capped at `--content-max-width` and centred on wide monitors, with `--content-padding` gutters (20 px on phones).
- **Sidebar.** The current destination shows an ink label on a tinted row, an accent icon and an accent bar (`--indicator-thickness`) flush with the rail's outer edge. The profile control at the bottom shows the GitHub avatar (derived from the user id on GitHub's avatar CDN, the only external image origin the CSP allows; initials underneath as fallback) and opens a popover with identity, theme, language and Sign out.
- **Narrow screens (≤ 900 px).** A fixed top bar (`--mobile-bar-height`, `--color-chrome` with backdrop blur) holds the menu trigger and the brand; the rail opens over the content with a backdrop and closes with Escape, the backdrop or its own control.
- **Page header.** Every screen starts with `PageHeader`: an optional back link (chevron plus text, no arrow characters in copy), one `h1` at `--text-2xl` with `--tracking-tight` (`--text-xl` on phones), an optional subtitle, facts (`meta`) and actions. Detail screens add the `divider`.
- **Tabs.** Views of one screen use `TabNav` links with `aria-current="page"`. The current tab is ink with an accent underline that grows in; hover previews a neutral underline. On phones the labels drop to `--text-sm`, and the bar scrolls sideways if a translation still does not fit.

## Tables and key figures

- **One table system.** Every list composes `dataTable` classes inside a bordered card (`frame`). Column headers are `--text-xs` on a subtle band; cells are `--text-sm` with `--space-3` padding (`--space-4` at the row edges). Wide tables keep a minimum width and scroll inside the card, never the page.
- **Rows that open something.** The row's primary link (`rowLink`, the display ID or workflow name) stretches over the whole row: the row is one click target with one accessible name. Hover tints the row, adds the accent indicator on its leading edge, underlines the link and nudges the trailing chevron. Keyboard focus outlines the whole row. Rows that open nothing get no hover.
- **Cell content.** Use `stack` for multi-line cells, `id` for display identifiers, `mono` for repositories, durations and timestamps, `muted` for secondary lines, `clamp` for long prose (three lines), and `trailing` for a value with the row chevron.
- **Empty tables.** One `TableEmptyRow` with a title and/or a sentence, centred.
- **Key figures.** `StatGroup` and `Stat` show the figures of a view in one card: label above, value at `--text-xl` with tabular numerals (`mono` for durations). A status dot (`tone`) may precede a label whose meaning is a status. `live` pulses it while a process runs, for example analyses in progress. Freshness and refresh go in the group's `aside`. Phones show two columns.

## Detail screens (Incident Workspace)

- **Layout.** A main column of cards (diagnosis, lifecycle, review) beside a quiet context rail. Below 1100 px the rail moves under the cards.
- **Kinds of content.** Model output leads the diagnosis card on a `--color-surface-subtle` band under an uppercase overline ("AIOps inference · model output"). Observed evidence and retrieved knowledge follow on the plain surface, each with its own heading and note. The recommendation repeats the inference overline.
- **Evidence.** Sanitized log excerpts read as bordered mono blocks; "Cited by the diagnosis" is a neutral tag beside the locator.
- **Lifecycle.** `LifecycleSteps` shows Open → In remediation → Verification → Resolved from the recorded status: complete steps in success, the current step in ink (`aria-current="step"`). Narrow cards show two rows. Each card has at most one ink action.
- **Rail.** Section titles are uppercase overlines. Facts are a two-column description list. The timeline joins recorded events with a hairline, and the latest event is the ink dot.

## Forms and messages

- **Layout.** Forms are a card of sections, like detail screens. Each field has a label lane (220 px) and a control lane (440 px), stacked on phones. Section descriptions read at `--text-sm`; hints under a control are `--text-xs` and linked with `aria-describedby`.
- **Required and errors.** Required fields carry the `required` attribute plus a decorative asterisk in `--color-critical-text`. Field errors appear after a submit attempt, below the hint, with `aria-invalid` (critical border) and `aria-describedby`. A failure of the whole action is a critical `Notice` with `role="alert"` above the actions.
- **Choices.** Two or three mutually exclusive options use a segmented control: a tinted track with the chosen option raised and in accent.
- **Review before submit.** Summarise what will be recorded in a `--color-surface-subtle` panel next to the actions.
- **Messages.** Use `Notice` with a tone: `critical` for failures, `warning` for blocked or limited actions (missing capability, a blocked capture), `success` for a completed step, `info` or `neutral` for context. A notice that appears after an action gets `role="status"` or `role="alert"`.
- **Screens outside the shell.** Sign-in, sign-in completion and Not Found use `StandalonePage`: one elevated card (`--radius-xl`, `--shadow-md`) over a dotted canvas in a border tone that fades out toward the edges. The canvas is decorative.

## Loading, empty and confirmation states

- **Loading.** A region that loads shows a skeleton of its final shape (`TableSkeleton` for tables, skeleton lines for cards and the Workspace) and announces itself with a visually hidden `role="status"` message. Never show `0` or another figure before it is known: `Stat` takes `loading` (placeholder) and an unavailable figure is an em dash.
- **Busy actions.** `Button loading` shows a spinner and `aria-busy`, keeps the button at full strength and keeps its label saying what happens ("Recording…"). A running capture shows the spinner beside its phase.
- **Empty.** `TableEmptyRow` explains what the absence means. When nothing needs attention it is reassuring (`tone="success"` with a check); when the table is empty because nothing exists yet it offers the action that fills it (for example "Add monitored workflow").
- **Confirmation.** A recorded change appears as a success `Notice` inside a live region that is always rendered, so it is announced. Notices settle in with a short fade, and the lifecycle step just reached settles with a small scale. All of it collapses under `prefers-reduced-motion`.
- **Errors loading a view.** A critical `Notice` with the error reference, when there is one, and a retry button.

## Components (`src/shared/ui`)

| Primitive | Use |
| --- | --- |
| `Button` (`primary`, `secondary`, `ghost`, `link`; `sm`, `md`, `lg`; `block`) | `primary` is ink, for the main action of a section (at most one per section). `secondary` for alternatives, `ghost` for low emphasis in dense UI, `link` for inline text actions (Refresh, View context, Reconnect). Press feedback (`--press-scale`) and transitions are built in. |
| `buttonClassName()` | The same styles for elements that must remain links (router `Link`, external `<a>`). |
| `StatusBadge` (`tone`, `soft` or `dot`, `live`) | The only way to show a status. `soft` (tinted pill) for statuses that must stand out (severity, review); `dot` for dense lists and secondary facts (lifecycle, criticality, monitoring, connection). `live` pulses the dot for ongoing processes. Domain mappings live in entities: `IncidentSeverity`, `IncidentStatusBadge`, `DiagnosisStatusLabel`, `CriticalityBadge`, `MonitoringBadge`. |
| `TextInput` (`icon`), `Select`, `Textarea` | Form fields share the control height, a ≥ 3:1 outline (`--color-border-input`), an accent border plus halo on focus and a critical border when `aria-invalid`. `Select` keeps the native element with a token-styled chevron. |
| `Skeleton` (`width`, `height`, `shape`) | Placeholder while content loads; decorative (`aria-hidden`). The loading region still announces itself with `role="status"`. |
| `Spinner` | Activity ring in the current text color; used by `Button loading` and running captures. |
| `Badge` | Count pill next to tab and navigation labels only. |
| `PageHeader` (`title`, `subtitle`, `back`, `meta`, `actions`, `divider`, `headingRef`) | The title block of every navigable screen. `headingRef` makes the `h1` a programmatic focus target after navigation. |
| `TabNav` + `tabClassName(active)` | Tab bar for views of one screen; the page supplies router links. |
| `dataTable` (class names) + `TableEmptyRow` (`icon`, `tone`, `action`) + `TableSkeleton` | The table system above. Widgets keep only column widths and domain cells. |
| `StatGroup` + `Stat` (`label`, `value`, `tone`, `live`, `mono`) | Key figures of a view, as a description list. |
| `Notice` (`tone`) | Inline message with a tinted background and a vivid leading edge; pass `role` when it follows an action. |
| `StandalonePage` | Frame for screens without the app shell. |
