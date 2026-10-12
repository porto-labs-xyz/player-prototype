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
| Player/Transport | updatePlayer, .play-button, .queue-button | Play, pause, queue count, queue review and removal |
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

## Artist directory and profile journal, 21 September 2026

Artist discovery uses a horizontal portrait strip with native scrolling and a readable directory below. Profiles use a large artist image, a short introduction, a release row and a two-column Their world grid. At narrow phone widths the journal becomes one column so notes remain readable. Artist names on record and listening pages link to the profile. Keep music and collection actions available; the fixed player remains outside the changing view.

The journal mixes full-bleed imagery with quiet note cards and labels drawn from the content categories. BTS, Moments, Artwork and Notes are the initial examples. Categories describe the work, not engagement. Grid buttons open an accessible native dialog with the full image or note, restore focus on dismissal and respect reduced motion. Use existing theme tokens, visible focus outlines and 44px controls. These are prototype patterns, not new released tokens or completed native Figma components.

No likes, comments, followers, direct messages, sharing controls, public counts or engagement ranking. Keep this a finite artist-selected collection that invites exploration during listening. Demo imagery and text remain clearly identified as fictional.


## Five sleeve typography choices

The player offers five curated sleeve styles. The fictional catalogue demonstrates choices assigned per artist, with the same selection applied to front-caption titles, back-cover headings and track names, and liner-note headings and prose. The listener sees the artist's choice; this prototype does not include an artist publishing or font-upload interface. A new artist without a configured choice falls back to Studio. Keep preset and font-family names in internal documentation. Do not expose font labels or typography credits in the listening experience.

| Style | Typeface | Treatment | Example artist |
| --- | --- | --- | --- |
| Studio | DM Sans | Quiet sentence case, medium headings, open body copy | Sable Noa |
| Editorial | Cormorant Garamond | Larger literary serif headings and 20px reading text | June Arcade |
| Archive | IBM Plex Mono | Measured monospaced titles and spacious reading rhythm | Moth Season |
| Poster | Archivo Narrow | Condensed uppercase headings, sentence-case reading text | The Hollow Youth |
| Pulse | Space Grotesk | Geometric headings, tighter display spacing, open body copy | Kiki Static |

Preserve shared Porto interface fonts, catalogue metadata, timings, credits, navigation and playback controls. Artists select a complete preset, not arbitrary fonts, sizes, tracking or colours. Keep body copy at 16px or above except Archive's 15px desktop text, increased to 16px on mobile. Never apply tight display tracking or uppercase to long-form reading text. All presets preserve square artwork, sleeve animation, reduced-motion rules, readable wrapping, 44px track controls and the existing printed colour palette across interface themes.

The three additional families are self-hosted in the player with their SIL Open Font Licenses. DM Sans and IBM Plex Mono use existing interface font loading. These are requested player-specific extensions of package 0.1.0-dev.1, not a new released token package or verified native Figma implementation.


## Compact navigation and footer branding

Only the original branded P appears in primary navigation. The lowercase porto wordmark sits in the page footer beside the company-wide tagline, “Made To Be Listened To.” The home link retains its accessible name. In the sticky mobile row, allocate 44px to the P and each of the six controls, including the theme switcher. Use 12px gutters and an 8px gap normally, reducing to 6px gutters and no gap below 360px. This fits the full navigation at 320px without hiding the P or allowing the theme button offscreen. Theme labels and sequence counts remain available on desktop and in the switcher's accessible name on mobile. This is a player-specific layout refinement.


## Copyright notice

The player footer displays © 2026 Porto Labs Ltd. UK, as requested by the user. Individual music recordings retain their existing composer attribution and licence terms.


## Minimal digital vinyl interface, 24 September 2026

This player presentation supersedes the compact icon navigation and discovery shelf treatments above. Use a single digital vinyl hero, square cover grid, a genre selector and search. Keep three text navigation labels visible at all sizes, with secondary destinations and themes in More. The original P remains unchanged. Collection retains its shelf with a readable index; record details explicitly expose the sleeve and notes.

Use DM Sans and system sans-serif fallbacks for the shared interface, including buttons. Body and sleeve reading text are at least 16px. Most controls and secondary labels are 14-16px, with clear contrast and 44px primary targets. Artist-specific sleeve titles remain expressive; track names and liner-note prose use the interface sans-serif. Queue buttons visibly say “+ Next”. The persistent player keeps play/pause, queue and DEMO NODE visible on phones.

The ownership pattern presents a physical vinyl option first and a digital-only option second. Vinyl is the prominent route to the artist or label's shop. The fictional demo has no shop or stock, and its vinyl dialog states that clearly. Digital-only confirmation is explicitly simulated, with an illustrative price. No physical purchase, real payment or automatic vinyl/digital bundle is claimed. These are prototype patterns, not a new native Figma release or amended commercial terms.

## October streaming and creator surfaces, 11 October 2026

This revision supersedes the September vinyl-first home for the updated prototype. Warm charcoal, paper, coral #EE6251, DM Sans and approved P/artwork remain. Supporting violet marks the waveform composer and variation cards. Feed, Search and Create now lead; the existing records, artist profiles, sleeves, collection and buying options remain in More. At desktop widths of 1100px and above, a persistent left library and profile follow the deck composition. Mobile keeps three text links and More, with stacked cards and an independent fixed player.

The new creator feed is separate from the existing artist journal. It supports local following, version sharing and original/parent lineage. No real community size or automatic creator royalty share is implied. Approved fictional creator portraits come from the October visual concept. Variation and ledger screens carry demo boundaries next to their content. The 12 October feed revision uses measured playback waveforms. The compact voice icon is decorative; its pulse indicates microphone startup/listening, not measured microphone levels.

Use 44px primary controls, native dialogs, visible keyboard focus, explicit labels and theme tokens. Body text remains readable; ledger tables scroll within their own region on narrow phones. Voice transcripts and typed text do not submit until the choose-version action is activated. These are prototype component patterns, not a new shared token release or verified native Figma build.


## Feed and voice revision, 12 October 2026

The latest home-page revision returns the feed to the root URL and #home. Kiki Static remains the first selected source and a discoverable artist. Use a native horizontal scrolling row of square track cards with Reformat Original first, followed by a mix of artists and creator versions. Place the circular creator photo and a 44px play control over each cover. The active card has a violet border, with coral marking elapsed waveform bars. Profile photos link to their creators; the local user uses a neutral silhouette instead of an invented likeness.

Keep the request composer directly below the row. The microphone pulses while starting or listening, with text for starting, listening, stopping and failures. Reduced-motion mode uses a static outline. The microphone never starts on page load, navigation or a timer. A second tap stops it. Keep the editable transcript, prepared-version suggestions and speech-service disclosure visible. These changes extend the existing Porto tokens; no new shared design-system or Figma release is claimed.


## Numbered variation artwork, 12 October 2026

Use Reformat/002, Reformat/003 and onward for variation titles. Keep Original as the source label; 001 is reserved internally. Keep Dreamy, Night drive, Slow drift and Dreamy & slow as metadata tags, not title suffixes. Each version gets a distinct, stable browser-rendered crop, colour treatment and graphic composition derived from each song’s source artwork. Stamp its creator handle, such as @luna.wav, directly over the image in a paper label with dark type. Keep the profile-photo link and play control visible beneath the stamp. Small thumbnails retain the treatment; the track page exposes the full cover. Local versions use @you until a real account profile exists.

These are prototype cover treatments, with no image-generation service or change to the shared brand tokens. Numbers and artwork persist through reloads and remain consistent across the listening surfaces.


### Image-effects refinement

Apply a visible image effect in addition to colour: Dreamy uses soft-focus blur and a hazy double exposure; Night drive uses shifted glitch bands; Slow drift uses directional smear and ghosting; Dreamy & slow uses liquid displacement. Effects are static and rendered with CSS/SVG. Keep creator stamps, edition numbers, mood labels, profile photos and controls crisp. The source original receives no distortion.

## Multi-artist home feed, 12 October 2026

The feed is the home page, superseding the earlier Kiki Static landing choice. Mix source artists across the first horizontal row. Retain Original badges, numbered variant titles, mood tags, source-derived waveforms, creator avatars and stamped distortion/blur artwork. Genre chips filter the rotation and posts. A circular artist row exposes the existing fourteen profiles. Interleave 25 seeded posts from twelve fictional creators across eight source songs, with short authored captions and two columns on wider desktops. Local published versions lead the feed. The side column holds the voice/text composer and creator discovery; narrow screens stack the content. Additional fictional creators use distinct initial avatars; do not reuse portrait photos as different people. No live activity counters or relative timestamps are invented.

## Track DNA and sound controls, 12 October 2026

Remove the visible Your feed heading and its introductory copy; the existing navigation supplies context. Track artwork and titles open a full song genealogy. Show the selected artwork, mood, creator stamp and counts, then the original and every child version connected through parent lines. Include siblings and local drafts, with a distinct selected node and ancestry path. Every node has its own play action. Keep the tree semantic and keyboard navigable. Wider families scroll inside the tree on mobile instead of widening the page.

Transformation is voice or text only. Do not use sliders or a numeric effect panel. Keep the genealogy full-width and expose a bottom command dock on every route. Voice command opens the input sheet and starts listening; Type a request opens the same sheet for typing. The source track, editable transcript, pulsing voice button, suggestions, submit and close actions live inside the sheet. Submitting creates a child. Keep demo-total and browser-local labels next to the headline play count. Seed counts are illustrative and must not appear as live adoption or royalty evidence.

## Sticky voice command, 12 October 2026

The fixed command dock sits at the bottom beneath the player, with Voice command and Type a request. Keep both readable at 320px. The pop-out anchors above the dock, has its own vertical scrolling when needed, and respects safe-area insets and dynamic viewport height. Keep prompt text at least 16px on mobile. Closing the sheet ends capture and restores focus. Voice pulse indicates recognition state, not measured microphone levels. The approved interaction is never a slider-based sound editor.

## Expressive creator profile pictures, 12 October 2026

The user requested fun profile pictures in varied styles. Eight fictional creators now have distinct generated cartoon, photorealistic, abstract cut-paper, clay, pixel-art, collage, ink and felt identities, replacing initial-only avatars. The original four portraits and neutral local-user silhouette remain. Circular crops share the same image across track cards, posts, discovery and profiles. These user-selected artwork styles are an explicit exception to the restrained brand-art guidance, scoped to creator identity rather than interface tokens. The portraits do not represent actual users. Built-in image generation prompts are preserved in the prototype docs.

## Quiet voice input, 12 October 2026

The user requested discovery through use. Remove the How should it sound heading, Talk to Porto eyebrow, instructional labels, textarea placeholder and suggested prompt chips from the pop-out. Keep an empty editable input, voice control, submit arrow, source track identity and close action. Preserve nonvisual accessible labels, live recognition/error feedback and a brief speech-processing disclosure. This supersedes the suggestion-heavy composer guidance above; voice and text remain the only transformation input.

## Orbitable genealogy and co-creation, 12 October 2026

The user requested Co-create with the source artist in the audio pop-out, a 3D knowledge-graph style genealogy and made-up royalty totals. The pop-out now names the current source artist, retaining the empty editable input. Genealogy uses a browser-native SVG projection of actual 3D coordinates with user-controlled orbit, zoom, reset and keyboard rotation. Directed edges follow saved parent IDs; the selected ancestry is highlighted, including forks from child versions. Every seeded version and local draft remains represented. A collapsible semantic list provides full titles, per-node plays, artwork, playback and illustrative royalties.

Family and selected-track royalties show stable invented GBP figures with adjacent DEMO labels. Local drafts start at zero; local play counts do not change money. These examples do not claim earned income, creator entitlement, rights-holder allocation or a live payout ledger. Shared tokens, real source-audio attribution and voice/text-only transformation remain unchanged. This is a prototype visual pattern, not a native Figma release.
