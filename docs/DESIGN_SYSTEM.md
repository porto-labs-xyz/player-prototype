# Design-system integration

Use the [Porto Design System](https://github.com/porto-labs-xyz/porto-design-system/blob/main/README.md) as the shared visual foundation. The player extends package `0.1.0-dev.1` with documented prototype patterns, without declaring a new released Figma version.

## Figma and source links

- [Porto DS Library](https://www.figma.com/design/i3K26qDEgyT7BcM9jD56rV/Porto-DS-Library)
- [Recorded Start Here frame](https://www.figma.com/design/i3K26qDEgyT7BcM9jD56rV/Porto-DS-Library?node-id=2-8)
- [Release manifest](https://github.com/porto-labs-xyz/porto-design-system/blob/main/figma/release-manifest.json), the registry for file keys, nodes and verification evidence.
- [Style guide](https://github.com/porto-labs-xyz/porto-design-system/blob/main/STYLEGUIDE.md)
- [Player Figma handoff](https://github.com/porto-labs-xyz/porto-design-system/blob/main/figma/PLAYER_HANDOFF.md)
- [Tokens](https://github.com/porto-labs-xyz/porto-design-system/blob/main/tokens/porto.tokens.json), [foundations](https://github.com/porto-labs-xyz/porto-design-system/blob/main/specifications/foundations.md), [component rules](https://github.com/porto-labs-xyz/porto-design-system/blob/main/specifications/components.md), [content rules](https://github.com/porto-labs-xyz/porto-design-system/blob/main/specifications/content.md).

The manifest records the first three Figma pages and one inspected overview. Player component node IDs, linked-instance checks and a named release version are not recorded. The prior Starter-plan and credit limits are recorded build conditions, not a fresh account check. Repository changes do not automatically edit Figma.

## Token mapping

| Released token | Player CSS | Value |
| --- | --- | --- |
| color.charcoal | --bg | #090A0A |
| color.paper | --paper | #EEE8DC |
| color.muted | --muted | #B9B2A5 |
| color.coral | --red | #EE6251 |
| type.web.sans | --sans | DM Sans |
| type.web.mono | --mono | IBM Plex Mono |

The player currently uses line opacity `#EEE8DC26` versus released `#EEE8DC2E`, and a 2px transport radius versus the general 5px control token. These are explicit player-specific treatments. Record spine colours and variable dimensions belong to artwork presentation, not new global palette tokens.

## Component mapping

| Proposed Figma component | Implementation | States |
| --- | --- | --- |
| Player/Record-spine | vinylShelf, .record-spine | Rest, hover, focus, selected |
| Player/Sleeve | openJacket, sleeveBack, sleeveNotes | Closed, front/back, liner notes |
| Player/Track-row | tracks, sleeveBack | Available, current, keyboard focus |
| Player/Transport | updatePlayer, .play-button, .skip-button | Play, pause, previous, next, disabled boundary |
| Player/Node-status | #node-status | Ready, buffering, live, paused; demo label always visible |
| Player/Ownership | purchase, local owned state | Unowned, demo confirmation, demo owned |

These names are a construction specification, not existing Figma node identifiers. Current player CSS includes very small spine/catalogue metadata and some 30px mobile transport widths. The style guide calls for larger alternatives and 44px primary touch targets; a native release must close these accessibility gaps rather than treating the prototype as a verified component library.

## Custom support icon

The Your support navigation uses a hand-authored northeast-arrow SVG with a 24px view box, 1.6px rounded stroke and no fill. It inherits the muted, paper hover and coral active navigation colours. Keep it decorative beside the accessible link text. This player-specific vector pattern replaces the platform-dependent emoji and follows the existing transport line treatment; it does not imply a new Figma component release.

## Five appearance themes

A custom split-circle button in primary navigation cycles Dark, Light, Dusk, Forest and Ink, then returns to Dark. On mobile it sits in the topmost navigation alongside the route icons; the desktop sidebar shows the current name and position out of five. Its accessible name identifies both the current theme and next selection. All controls retain 44px targets.

Dark is the initial default. Light uses warm paper surfaces and charcoal text. Dusk uses muted plum and peach, Forest uses deep green and sage, and Ink uses slate and soft blue. Palettes cover canvas, navigation, text, dividers, dialogs, actions and the persistent player. Record art, spine colours and printed sleeve palettes stay unchanged. These are player-specific theme mappings, not changes to released global tokens or native Figma evidence.

The browser stores the explicit choice under `porto-theme`, applies it before stylesheet loading and synchronizes it across tabs. Existing dark/light choices remain valid; invalid or cleared values return to Dark. Storage failures leave the control usable for the visit. Theme changes do not rebuild the player or interrupt audio. The wireframe preview retains its separate palette and hides the theme control.

## Making a change

Read the current manifest and style guide, inspect the corresponding function/CSS, and trace the relevant source through the knowledge graph. Record whether the decision is a shared token, a player-specific pattern or a prototype-only exception. Export verified Figma changes back into the package at release time. Never invent node IDs or call a generated image an editable Figma component.


## Copyright notice

The player footer displays © 2026 Porto Labs Ltd. UK, as requested by the user. Individual music recordings retain their existing composer attribution and licence terms.
