# Porto player prototype

A streaming and music-variation walkthrough with a persistent library, creator feed, local sharing, listening budget and illustrative Porto Ledger. Existing records, unfolding sleeves, collections and artist profiles remain accessible. This is a static web prototype with fictional accounts, prepared audio previews and simulated financial states.

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

The feed is the landing page. Reformat from the fictional hyperpop record Sugar Circuit is selected first, with an Original card and four prepared variations in a horizontal row. Each card has a creator profile picture, waveform and play control. Feed, Search and Create are primary navigation; More opens Records, Artists, Collection, Your space, Now playing, Listening budget, Porto Ledger, appearance and prototype information. Desktop also has a persistent library and local profile. Fourteen catalogue records are saved initially. Five artist editions have original generated portraits across Hyperpop, Indie, Alternative, Rock and R&B. Their fifteen distinct full-length instrumental recordings add varied tempos and textures; genre labels describe fictional artist identities, with the real music credited separately. Collection retains the tactile vinyl shelf and readable text index. Record details also have an explicit Open sleeve & liner notes action. Start a side, then add any track next. Queued tracks play in their listed order when the current track ends, before the normal side sequence resumes. There are no skip controls. Pause preserves position; lift needle resets the side.

Add to collection is a primary action on artist cards, the record index, sleeves, record details, the listening screen and the persistent player. Saved records show In collection. Collections persist in browser local storage and synchronize across tabs on the same origin. Demo ownership adds seeking and downloads; saving a record is free and does not grant ownership. Existing starter records, removals and demo purchases are preserved. The red `LIVE · LND-001` indicator follows audio playback and visibly says DEMO NODE. It does not establish a connection to a Porto node.

## Vinyl first, digital second

Record details lead with Buy vinyl, followed by Digital only. The vinyl demo describes an artist or label shop destination. These fictional releases have no connected shop or physical stock, so no external retailer, order or payment is invented. Digital only opens an explicitly labelled demo confirmation with an illustrative price; it adds local demo ownership for seeking and downloads. Buying vinyl does not automatically grant a digital copy.

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

- **Search:** search original and variation titles, creators, artist names, records and catalogue track names.
- **Feed and library:** Reformat uses the existing Sugar Circuit artwork and real Kevin MacLeod recording, with its attribution preserved. The source version is labelled Original. Creator photos link to their profiles; your local posts use a neutral profile avatar. The persistent player begins idle, with no audio source or autoplay. Waveforms use 80 measured audio amplitude buckets and track playback progress.
- **Talk to Porto:** tap to start real browser speech recognition, tap again to stop, or type a request. The control pulses while starting and listening. Interim transcripts update the editable request without submitting it. Browser speech may use an online recognition service. Permission, service, network, no-speech and unsupported-browser states remain visible; recognition never restarts automatically. Playback pauses before capture, and navigation, backgrounding, typing or playback stop capture. “Play Reformat” starts the original. Requests choose prepared Dreamy, Night drive, Slow drift or Dreamy & slow edits. No model, AI transformation or instrument separation is implemented.
- **Variations:** create a draft, preview it, refine into another version, inspect original and parent lineage, then explicitly share it to the browser-local feed. The source original and artist permission explanation stay attached. Each fictional artist’s model is artist-controlled; no actual model or licence registry is connected.
- **Creators:** Luna Vale, Kai Moss, Milo Reed and Sora Park are fictional accounts with approved AI-generated portraits. Follow or unfollow them, switch between For you and Following, and explore creator profiles. Your space holds saved tracks, drafts and your locally published versions. Creator credit grants no automatic royalty entitlement.
- **Budget:** the illustrative balance starts at £6.40 against a £10 monthly budget. A scenario control reaches the limit, pausing variation previews while leaving originals and the existing catalogue playable. A confirmed £5 demo top-up or simulated monthly reset restores access. No automatic extra charges or real money; playback does not accrue the illustrative balance. The actual listening tariff, generation price and funding for originals after the cap remain undecided.
- **Ledger:** example allocation rows show 90% to source rights holders for originals and 70% for User Variation Tracks, with illustrative Owed, Sent and Confirmed states. Payout details describe amount, recipient, rights version, calculation and transaction fields. There is no invented wallet, timestamp, transaction hash, exchange rate or live transfer. Daily USDC payouts on Aptos are a product target.

`dist/october.js` supplies the routes and local state; `dist/october.css` extends the existing themes. `dist/voice-input.js` wraps `SpeechRecognition` / `webkitSpeechRecognition`, with a 12-second start timeout and a 60-second session limit. See the [browser speech API](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition) for availability and service constraints. No dependency install or backend is needed.

`scripts/prepare-reformat-variations.py` prepares four full-length MP3 edits from the already credited source recording using FFmpeg. `dist/reformat-audio.js` records filenames, decoded durations, waveform peaks, processing filters and output hashes. All adaptations retain CC BY 4.0 attribution and downloads on the credit page. The earlier Afterlight sound-study assets and synthesizer script remain historical fixtures; they are not the current feed.

Reformat state uses `porto-reformat-v2`, independently of collections, purchases, themes and the earlier `porto-october-v1` data. Older drafts are not silently retitled as a different song. Reset Reformat demo clears only this walkthrough. Corrupt state is validated; unavailable storage keeps changes for the current visit with visible feedback. Posts are never transmitted. Reloading starts playback idle again.

Run `node scripts/validate-player.mjs`, `node scripts/validate-theme.mjs` and `node scripts/validate-voice.mjs`. These check local state, assets, playback events and speech callbacks with simulated services. Browser checks cover responsive layout and real MP3 playback. Live human dictation depends on the host browser and microphone; the embedded review browser reached microphone startup but its speech service returned a network error during testing. Successful spoken-word recognition has not been verified there.
