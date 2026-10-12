# Porto player prototype

A streaming and music-variation walkthrough with a persistent library, creator feed, local sharing, listening budget and illustrative Porto Ledger. Existing records, unfolding sleeves, collections and artist profiles remain accessible. This is a static web prototype with fictional accounts, live browser audio effects and simulated financial states.

[Open the demo](https://porto-listening-room.vercel.app) · [Wireframes](https://porto-listening-room.vercel.app/wireframe.html) · [Music credits](https://porto-listening-room.vercel.app/credits.html) · [Figma library](https://www.figma.com/design/i3K26qDEgyT7BcM9jD56rV/Porto-DS-Library)

Vercel is the only deployment target. Use the demo link above for reviews and investor walkthroughs.

## Start locally

```sh
git clone https://github.com/porto-labs-xyz/player-prototype.git
cd player-prototype
python3 -m http.server 8064 --directory dist
```

Open http://localhost:8064. No package installation or build step is needed. The existing Porto workspace keeps this checkout under `listening-app`; the GitHub repository is `player-prototype`.

## Design and handoff

- [Design-system integration](docs/DESIGN_SYSTEM.md): Figma links, token mapping, component states and implementation gaps.
- [Porto style guide](https://github.com/porto-labs-xyz/porto-design-system/blob/main/STYLEGUIDE.md): foundations and player-specific patterns.
- [Figma player construction specification](https://github.com/porto-labs-xyz/porto-design-system/blob/main/figma/PLAYER_HANDOFF.md): component names and states to implement in Figma.
- [Architecture and behaviour](docs/ARCHITECTURE.md): routes, state, playback, assets and demo boundaries.
- [Contributing and knowledge workflow](CONTRIBUTING.md): traverse, verify, enrich and publish source changes.
- [Prototype history and asset provenance](docs/PROTOTYPE_HISTORY.md): earlier iterations, original artwork briefs and music sources. Current behaviour below supersedes historical restrictions.

## Current behaviour

The root URL, #home and #feed open the community feed. The Porto logo returns there. Reformat from the fictional hyperpop record Sugar Circuit is selected first, with no autoplay. A mixed horizontal rotation includes eight source tracks and their versions across Kiki Static, June Arcade, Moth Season, The Hollow Youth and Sable Noa. The artist discovery row links all fourteen catalogue artists. Twenty-five seeded posts from twelve fictional creators, genre filters, Following and a creator discovery sidebar fill out the feed. Each card has a creator profile picture, waveform and play control. Variations use stable titles such as Reformat/002, a distinct artwork treatment and the creator’s handle stamped on the cover; Dreamy and other descriptors remain metadata tags. Feed, Search and Create are primary navigation; More opens Records, Artists, Collection, Your space, Now playing, Listening budget, Porto Ledger, appearance and prototype information. Desktop also has a persistent library and local profile. Fourteen catalogue records are saved initially. Five artist editions have original generated portraits across Hyperpop, Indie, Alternative, Rock and R&B. Their fifteen distinct full-length instrumental recordings add varied tempos and textures; genre labels describe fictional artist identities, with the real music credited separately. Collection retains the tactile vinyl shelf and readable text index. Record details also have an explicit Open sleeve & liner notes action. Start a side, then add any track next. Queued tracks play in their listed order when the current track ends, before the normal side sequence resumes. There are no skip controls. Pause preserves position; lift needle resets the side.

Add to collection is a primary action on artist cards, the record index, sleeves, record details, the listening screen and the persistent player. Saved records show In collection. Collections persist in browser local storage and synchronize across tabs on the same origin. Demo ownership adds downloads; saving a record is free and does not grant ownership. Existing starter records, removals and demo purchases are preserved. The red `LIVE · LND-001` indicator follows audio playback and visibly says DEMO NODE. It does not establish a connection to a Porto node.

## Vinyl first, digital second

Record details lead with Buy vinyl, followed by Digital only. The vinyl demo describes an artist or label shop destination. These fictional releases have no connected shop or physical stock, so no external retailer, order or payment is invented. Digital only opens an explicitly labelled demo confirmation with an illustrative price; it adds local demo ownership for downloads. Buying vinyl does not automatically grant a digital copy.

Readable sans-serif interface type, plain action labels and “+ Next” queue buttons make the listening and purchase paths explicit. Sleeve display titles retain artist typography; liner notes and track lists use readable sans-serif text. Playback is idle until the listener presses Play.

## Files

| Path | Purpose |
| --- | --- |
| `dist/index.html` | Application shell and persistent player |
| `dist/app.js` | Catalogue, routes, playback and local state |
| `dist/artist-editions.js` | Five fictional artist editions and their fifteen credited recordings |
| `dist/styles.css`, `dist/minimal.css` | Porto foundations and the minimal digital vinyl layout |
| `dist/wireframe.html` | Annotated six-screen flow |
| `dist/credits.html`, `dist/audio-credits.json` | Music attribution, licences and source links |
| `dist/assets/` | Generated covers, approved Porto assets and demo audio |
| `scripts/import-catalogue-music.py` | Reproducible import, normalization and attribution for the new editions |
| `scripts/validate-player.mjs` | Asset, catalogue, migration and simulated playback regression checks |
| `create-demo-audio.py` | Deterministic synthesis for the first three releases |

## Evidence and rights

No payment, licence issuance, streaming attestation, accrual or payout occurs here. No native iOS packaging has been built. The former support route now opens the October listening-budget walkthrough, replacing the earlier subscription and operator-pool explainer. The proposed 90% original and 70% variation rights-holder shares apply to allocated listening revenue, not record sales. The fictional artists do not claim authorship of Kevin MacLeod's recordings. All twenty-one licensed recordings retain CC BY 4.0 attribution and freely accessible downloads. See the credit page and each audio archive for exact terms. No blanket open-source licence is granted for Porto branding or this repository.

Figma currently has a recorded partial native build. The style guide and player handoff are repository specifications, not evidence that native player components have been built or published there.

## Artists and their worlds

Artists opens a horizontal discovery strip and a searchable, genre-filtered directory of all fourteen fictional artists. Each profile brings together a short introduction, releases and a finite Their world grid for BTS, artwork, personal notes and moments. Grid items open as larger images or readable notes. Record and listening pages link back to the artist, and browsing or opening a journal item preserves the current audio session.

The artist journal remains a finite artist-curated space. The separate October creator feed adds following and local variation sharing, with no likes, comments, follower counts, messaging or engagement ranking. Retention is a design hypothesis, not a measured outcome. Profile copy, journals and generated scene images are fictional demo material. The three studio, backstage and artwork scenes are shared illustrative assets, not documentary images of these artists. Content is authored in source; artist accounts, uploading and publishing tools are not implemented.

`dist/artist-profiles.js` contains the directory, profile and journal presentation. `docs/artist-world-image-prompts.json` records the built-in image generation prompts and asset paths.

## October streaming and variation walkthrough

The October product direction supersedes the earlier vinyl-first home and subscription explainer for this prototype. It is an interactive product proposal, not production or protocol evidence.

- **Track DNA:** clicking a track title or artwork opens its genealogy, with the original, every seeded version and local draft in an orbitable 3D projection. Directed parent-child links and highlighted ancestry show forks; drag or arrow keys rotate, and buttons zoom or reset. Every node is a circular crop of that version’s actual artwork, including its blur and distortion treatment. Creator profile photos appear as circular badges on every artwork node, rendered as native SVG images. Tapping a track or graph node opens its detailed track page immediately, with stamped cover, creator photo, source, mood, parent, plays, demo royalties, Play and Co-create above the lineage graph. The family royalty summary follows the graph. A collapsible version list retains creator stamps, play controls, play totals and per-version demo royalties. Family and selected-track royalty amounts are stable fictional GBP examples, independent of play counts, with local drafts at zero. They never enter budget or payment state. The redundant Your feed heading is removed. The shared player thumbnail opens the current song family.
- **Live sound:** Tone.js 15.1.22 is bundled locally under its MIT licence. Voice or text requests change speed, independent pitch, low-pass tone, distortion, bitcrushing, reverse playback, chopped slices and echo in the actual audio signal. There are no sound-editing sliders. Submitting a supported request creates a numbered child without overwriting its parent. Settings persist through reload. No music model is connected.
- **Play counts:** clearly labelled illustrative totals are combined with browser-local plays. Local drafts begin at zero. A local play counts once per loaded playback session after 30 seconds of incremental playback or half the duration of a shorter recording. Pausing/resuming or seeking does not immediately add a play. These are unverified demo counters, separate from royalty, attestation and ledger accounting.
- **Search:** search original and variation titles, creators, artist names, records and catalogue track names.
- **Feed and library:** Reformat uses the existing Sugar Circuit artwork and real Kevin MacLeod recording, with its attribution preserved. The source version is labelled Original. Creator photos link to their profiles; your local posts use a neutral profile avatar. The persistent player begins idle, with no audio source or autoplay. Waveforms use 80 measured audio amplitude buckets and track playback progress.
- **Talk to Porto:** the fixed bottom waveform icon button opens a nonmodal input sheet and starts real browser speech recognition. The Type a request button opens the same sheet without starting the microphone. Tap the voice button inside the sheet to stop, or close the sheet. The sheet says Co-create with the source artist, with no instructional placeholder or prompt suggestions; the empty input invites discovery. The control pulses while starting and listening. Interim transcripts update the editable request without submitting it. Browser speech may use an online recognition service. Permission, service, network, no-speech and unsupported-browser states remain visible; recognition never restarts automatically. Playback continues during capture. Navigation, backgrounding, typing or switching tracks stop capture. “Play Reformat” starts the original. Requests apply live Dreamy, Night drive, Slow drift or Dreamy & slow effect settings. No model, AI transformation or instrument separation is implemented.
- **Variations:** the original stays labelled Original; variation names use @username / chosen title, such as @luna.wav / Velvet Afterhours. Creating a version opens a blank Title field; local versions have a Rename action. Titles persist in this browser and appear consistently in the feed, player, search and genealogy. Older unnamed drafts display @you / Untitled NNN until renamed. Edition numbers remain stable internal identifiers and artwork badges, independently for each source track, reserving 001 for the source. Renaming preserves IDs, artwork, settings and lineage. Every numbered version has its own deterministic crop, colour and image-effects treatment of the source artwork (soft-focus haze, sliced glitch, directional smear or liquid displacement), stamped with its creator handle. This is rendered in the browser, with no image-generation service. Mood descriptors remain searchable metadata tags. Create a draft, preview it, refine into another version, inspect original and parent lineage, then explicitly share it to the browser-local feed. The source original and artist permission explanation stay attached. Each fictional artist’s model is artist-controlled; no actual model or licence registry is connected.
- **Creators:** Twelve fictional accounts populate the feed. Luna Vale, Kai Moss, Milo Reed and Sora Park retain their approved AI-generated portraits; Eight additional creators use distinct AI-generated profile pictures: cartoon, photorealistic, abstract cut-paper, clay, pixel art, collage, ink and felt. Their images appear consistently in track rows, feed posts, discovery and profiles. Prompts and asset paths are recorded in [creator-pfp-prompts.json](docs/creator-pfp-prompts.json). Follow or unfollow them, switch between For you and Following, and explore creator profiles. Your space holds saved tracks, drafts and your locally published versions. Creator credit grants no automatic royalty entitlement.
- **Budget:** the illustrative balance starts at £6.40 against a £10 monthly budget. A scenario control reaches the limit, pausing variation previews while leaving originals and the existing catalogue playable. A confirmed £5 demo top-up or simulated monthly reset restores access. No automatic extra charges or real money; playback does not accrue the illustrative balance. The actual listening tariff, generation price and funding for originals after the cap remain undecided.
- **Ledger:** example allocation rows show 90% to source rights holders for originals and 70% for User Variation Tracks, with illustrative Owed, Sent and Confirmed states. Payout details describe amount, recipient, rights version, calculation and transaction fields. There is no invented wallet, timestamp, transaction hash, exchange rate or live transfer. Daily USDC payouts on Aptos are a product target.

`dist/october.js` supplies the routes and local state; `dist/october.css` extends the existing themes. `dist/voice-input.js` wraps `SpeechRecognition` / `webkitSpeechRecognition`, with a 12-second start timeout and a 60-second session limit. See the [browser speech API](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition) for availability and service constraints. No dependency install or backend is needed.

`scripts/prepare-reformat-variations.py` prepares four full-length MP3 edits from the already credited source recording using FFmpeg. `dist/reformat-audio.js` records filenames, decoded durations, waveform peaks, processing filters and output hashes. `scripts/prepare-feed-audio.py` prepares another 28 full-length edits for seven other source songs. `dist/feed-audio.js` records their original and edited file metadata with measured waveforms. The eight supported source songs have 32 prepared edits in total; 57 seeded posts are shown, with all four presets available for each song in Create. These files remain as downloadable adaptations and a fallback when the audio library is unavailable. Normal variation playback now uses the original recording through live browser effects. All adaptations retain CC BY 4.0 attribution and downloads on the credit page. The earlier Afterlight sound-study assets and synthesizer script remain historical fixtures; they are not the current feed.

Multi-track feed state retains `porto-reformat-v2`, independently of collections, purchases, themes and the earlier `porto-october-v1` data. Older drafts are not silently retitled as a different song. Reset listening demo clears only this walkthrough. Corrupt state is validated; unavailable storage keeps changes for the current visit with visible feedback. Posts are never transmitted. Reloading starts playback idle again.

Run `node scripts/validate-audio-warp.mjs`, `node scripts/validate-player.mjs`, `node scripts/validate-theme.mjs` and `node scripts/validate-voice.mjs`. These check local state, assets, playback events and speech callbacks with simulated services. Browser checks cover responsive layout and real MP3 playback. Live human dictation depends on the host browser and microphone; the embedded review browser reached microphone startup but its speech service returned a network error during testing. Successful spoken-word recognition has not been verified there.

## Multi-artist feed verification, 12 October 2026

The state regression suite verifies source-specific playback files, credits, waveforms, cover identity, numbering, restored drafts, parent lineage, filtering, following and original access at the example budget limit. Legacy Reformat drafts keep their IDs and edition numbers. Desktop and 320px-wide browser checks showed no page overflow or broken loaded images. Real MP3 playback advanced for Dream Culture/003 and Chill Wave/003. The browser console reported no errors. This does not establish live accounts, model inference or successful human dictation.

## Genealogy and live-audio verification, 12 October 2026

Browser checks verified that version playback uses licensed source audio through the Tone.js chain, with pitch/effect settings applied and non-zero measured output. The dry path remains available for original recordings. Submitting a supported request creates a new child with the correct settings, restored after reload. The 320px genealogy keeps wider branches inside its own scrolling region without page overflow. Automated checks cover the full family, source isolation, draft inclusion, effect bounds, child persistence, lazy audio-graph construction, pause gating, dry bypass and local count thresholds/pause/seek behavior. Successful human dictation and royalty-valid listening remain unverified.

## Voice-first command sheet, 12 October 2026

Music transformation is exclusively voice or text based, never slider based. The command dock stays fixed at the bottom on every route, below the player. Voice command opens the pop-out and starts capture from that user gesture; Type a request and Create open it without capture. The source track is shown beside the editable prompt. Closing, Escape, route changes or backgrounding stop recording; the typed draft survives dismissal. A supported submission closes the sheet and opens the new version’s genealogy without autoplay.

The bounded local parser supports combined phrases such as “pitch up 3 semitones and add more echo”, “20% slower”, “more distortion”, “less echo”, “brighter” and “make it dreamy”. Effects inherit the parent settings and remain bounded. Unsupported clauses reject the entire request rather than partially applying it. This is deterministic command parsing, not an ML interpretation service. Existing custom versions and their settings remain playable. Browser checks at 1440px and 320px confirmed the fixed bottom dock, no page overflow and no transformation sliders. A typed pitch/echo request produced the expected live settings; the embedded browser entered the listening state on a voice tap. Successful human transcription remains unverified.

## Search and social previews

The static HTML supplies the title Porto · Co-create, matching search and social descriptions, a production canonical URL, Open Graph image dimensions and alternative text, and Twitter card metadata. The dark preview asset lives at `dist/assets/social/porto-co-create-dark-v1.png`, alongside its editable SVG. The card stays dark regardless of the listener’s saved theme. Check the deployed HTML and image directly; this does not establish search indexing or a refreshed WhatsApp cache.

## Automatic production deployments

Vercel is linked to this repository with `main` as its production branch. The Verify production deployment workflow checks the revision served by the production alias and the Vercel commit status on every main push. Vercel writes `deployment.json` during the build using its Git commit environment variable, so missing GitHub status callbacks do not cause false failures. If Vercel reports a failure or never reports completion within six minutes, the workflow requests a main-only Deploy Hook retry, up to twice. It ignores old statuses and stops when a newer main commit supersedes the run. The hook lives only in the `VERCEL_MAIN_DEPLOY_HOOK` Actions secret; no general Vercel account token is stored in GitHub. A failed recovery leaves a failed workflow for investigation. `python3 scripts/validate-production.py` exercises successful deployment, recovery, obsolete commits, stale statuses and bounded failures.

The observed 12 October failure was `git_info_fail` (Git information retrieval failed), not a disconnected main branch. A native Vercel redeploy of that commit subsequently succeeded. This recovery handles transient failures; it cannot repair revoked Git provider access or a persistent Vercel outage.

## Playback controls

Music keeps playing while voice input opens and captures speech. The pop-out leaves the player accessible. Drag or tap the timeline, or use its keyboard controls, to seek within the current track. Play/pause preserves position; Stop pauses and returns to the beginning of that track. Scrubbing is available without a demo purchase. Sound transformations still use voice or text only.

## Wild versions and comments

The feed includes 57 authored versions across eight songs, including 32 Reverse, Underwater, Chopped and Distorted recipes. Each has a chosen title, creator, source-derived artwork and real lineage. Reverse uses ToneAudioBuffer reversal. Chopped versions reorder and repeat 180ms slices with edge fades, plus a Tone.js tremolo. Underwater versions combine low-pass filtering, slower speed, lower pitch and echo. Distorted versions combine distortion and 4-bit crushing, sometimes with chopping. Existing playback controls work on rendered versions. Preparing appears while a source is decoded, and Stop cancels a pending start.

Try requests such as reverse it, make it underwater, chop it up, make it distorted, or reverse it and make it underwater. Transformation remains voice/text only. No music model runs. Every variation has a comment thread with fictional creator fixtures; feed cards preview replies. New comments persist per track in this browser, with 300 characters per comment and at most 50 local comments per track. Nothing is sent to other users. Existing saved versions and chosen names remain; edition collisions with newly seeded versions are renumbered without changing stable IDs or lineage.

Validation: `node scripts/validate-player.mjs` and `node scripts/validate-wild-audio.mjs`. The latter checks reversed PCM, source-preparation cancellation, cache reuse and position preservation. Browser checks cover effect output, scrubbing, comment persistence and mobile layout.

## Track controls and waveform seeking, 12 October 2026

Every track-local play button selects that track before starting playback. Only the current track toggles pause/resume; a loading track exposes Cancel loading consistently on its card and the fixed player. Switching or stopping invalidates pending audio preparation, and delayed media events cannot overwrite a newer playback state. Pause immediately mutes the effects output. Playback progress does not rebuild play-button contents, preserving click targets during playback.

Waveforms in rotation cards, feed posts and track details are seek surfaces. Clicking or dragging another track's waveform selects it and starts playback at that position, including while reverse/chop audio is preparing. Scrubbing the current track preserves its playing or paused state. Native range input supplies mouse, touch and keyboard operation with a visible focus ring and a 44px minimum target; bars show the current position. These controls seek audio only. Sound transformation remains voice/text based.

## Mobile audio processing, 12 October 2026

Following reports of continuous popping in iPhone Safari, originals start through native media playback without constructing an effects graph. Once Web Audio is needed, its context requests playback latency with 150ms scheduling look-ahead. Each version creates only its required processors; changing recipes disposes the previous nodes, and returning to an original removes all effects. BitCrusher and Tremolo therefore run only for versions that request them. Chopped versions retain the rendered slice edits, with smooth sine tremolo instead of hard square-wave modulation. The effects limiter leaves 3dB of headroom.

Audio progress updates only the current waveform and resets the previous one once. It changes bar classes only when the playhead crosses a bar, avoiding repeated work across the whole feed. Control labels update on transport changes, not every progress tick. This is a mitigation for mobile audio workload, not proof of pop-free output on a physical iPhone; device listening still needs confirmation.
