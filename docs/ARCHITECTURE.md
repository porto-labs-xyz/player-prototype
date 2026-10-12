# Architecture and behaviour

The app is static HTML, CSS and JavaScript. `app.js` renders hash routes into the main region; the audio element and persistent player remain outside that region so browsing does not replace playback.

## Routes and state

Discover filters the catalogue. My shelf combines browser-local saved and owned IDs. Record detail exposes side and track selection. Listening focuses the current record. Support is an alias for the October listening-budget walkthrough. Wireframes include an annotated page and the interactive `?wireframe=1` mode.

`porto-saved` and `porto-owned` store arrays in localStorage. `porto-shelf-seed-v1` seeds the original collection once; `porto-catalog-v2` adds the six later records once. `porto-catalog-v3` adds only the five artist editions once, preserving older removals and demo purchases. Removals persist after migration. Reset restores the whole collection and clears demo ownership. Storage is not an account or backend purchase record. Collection state uses localStorage, with no cookie or server account required. Records stay on the same browser and origin until removed or browser data is cleared. IDs are validated and deduplicated; saved and owned values are parsed independently so one malformed value does not reset the other. Rendering does not write storage. User changes persist immediately, and storage events update other open tabs. If storage is blocked or full, the app keeps the change for the current visit and explicitly reports that it was not saved persistently.

## Collection actions

Use the full Add to collection label as a primary action on artist cards, every record in the index, sleeves, record details and listening. Keep the same action in the fixed player at desktop and mobile sizes. The selected record is shown as In collection after saving, with an accessible remove label. Owned demo copies remain included and show a disabled collected state; a save action never grants ownership. My collection shows the union of saved and demo-owned IDs.

Saving from a music screen updates the collection controls in place, preserving keyboard focus and current playback. Removing from the collection view rerenders the shelf and focuses the main region. The existing fourteen starter records remain saved; this change does not clear or reseed anyone’s collection.

## Playback

The initial selection is the Afterlight concept study. Playback waits for the listener to press play; initialization loads no audio source. The older catalogue remains available without altering its credits or collection state.

`queueTrack` adds any album, side and track to the session queue without replacing the current track. `playQueuedTrack` consumes the queue in order before normal side progression resumes. `source` selects a local WAV or MP3 file. Playback follows each track's declared duration; seeking is shown for demo-owned copies. Automatic progression stops at the end of a side. A request counter prevents stale play promises from restoring UI state after a pause or new selection.

The live badge is simulated. It pulses after `playing`, and stops on waiting, stalled, loadstart, pause, error or ended events. The badge displays the fictional node identifier LND-001 and DEMO NODE. Audio-event handling demonstrates player state, not peer-to-peer delivery or network attestation.

## Assets and rights

Three releases use original synthesized 24-second WAV studies. Six use Kevin MacLeod recordings divided into consecutive MP3 chapters. Five artist editions add fifteen distinct full-length Kevin MacLeod recordings, normalized to a -16 LUFS target and encoded as 128 kbps MP3. Each edition has two tracks on side A and one on side B; all counting, side completion and navigation use actual array lengths. `audio-credits.json` records their real titles, sources, licence URLs, modifications and durations. Each ZIP includes attribution. Generated artwork and fictional packaging are separate from the real music credits.

## Artist editions and discovery

`artist-editions.js` loads before the application and supplies fictional artist metadata, square generated cover assets, per-track attribution and actual audio durations. Discovery uses one featured digital vinyl hero and a readable cover grid. Search and a genre selector filter the grid. The existing vinyl shelf remains in Collection, and record details expose the gatefold through an explicit button. Search matches artists, record titles, genres and track names. The art directions span Hyperpop, Indie, Alternative, Rock and R&B; the audio is instrumental demo music with related textures, not original performances by those fictional artists.

`docs/music-provenance/2026-09-20.json` records direct source links and original/downloaded file hashes. `scripts/import-catalogue-music.py` rebuilds audio and credits from the selected source catalogue. If re-importing, synchronize updated durations and credit entries in `artist-editions.js` and regenerate any modified credit-page text before validation.

## Purchase presentation

`buyingOptions` renders physical vinyl before digital-only purchase controls on every record. `purchase(id, format)` opens the vinyl destination explanation or the digital demo confirmation. The catalogue has no connected physical retailers or stock, so the vinyl path has no external checkout and never writes ownership. Only the explicit digital confirmation updates `porto-owned`. Existing demo ownership preserves seeking and credited downloads. Saving remains independent of ownership.

## Hosting

Vercel is the only deployment target for this prototype: https://porto-listening-room.vercel.app. Deploy the existing linked Vercel project using `vercel.json`, with `dist` as its output directory. Local HTTP serving remains available for development. Do not recreate an OpenAI Sites hosting association or publish updates there. GitHub is the source repository; its About website points to the Vercel URL. A source push alone does not establish a successful deployment. Verify the Vercel production alias after publishing. Do not commit credentials, `.vercel`, private decks or machine-specific paths.

## Evidence limits

There is no payment provider, user account service, persistent rights registry, live Porto node, streaming attestation or settlement implementation. Sequential files may have transitions between chapters; this is not verified gapless native playback. The responsive web layout has no TestFlight, App Clip or installable iOS package.

## Artist routes and journal

`#artists` renders the directory; `#artist/<artist-slug>` renders a profile or a helpful not-found state. Artists are deduplicated by name and grouped across releases. The directory has independent search and genre state, so returning from a profile preserves the chosen search. Profile category state resets on changing artists. The profile links from Discover, record details and Listening connect these routes.

`artist-editions.js`, `artist-profiles.js` and `app.js` load in order as classic scripts at the end of the document. Profile functions use the catalogue and playback helpers after app initialization. The artist profile data is a prototype source model: image entries have a local source, alternative text, title and caption; note entries have a title and body. Categories and grid length derive from each artist's items. The initial examples are fictional and share three generated scene assets. No user content is accepted and no authoring backend exists. Source strings are escaped before insertion in artist templates.

Play the music starts the artist's record without leaving the profile. Rendering the directory, filtering the grid and opening the detail dialog never replaces the audio element or changes its source. The dialog uses browser focus trapping and Escape dismissal, with a descriptive title and focus return. Navigating away closes it. Record collection controls retain the existing local collection behaviour.

The retention hypothesis is that artist-selected context gives listeners a reason to explore while music continues. No measured retention claim, engagement counters, algorithmic feed, social actions, new analytics or notifications are introduced.

## October routes, model boundary and data

`october.js` loads before `app.js`, defines route renderers and initializes after the existing player. `#home` (alias of the default `#feed`), `#original`, `#search`, `#studio`, `#variation/<id>`, `#feed`, `#creator/<id>`, `#you`, `#budget` and `#ledger` are the new surfaces. `#support` aliases budget. Existing record, artist, collection and listening routes remain. If the current item is a concept preview, Listening opens its variation surface.

Reformat uses a separate in-memory track record with explicit audio files and decoded full-length durations from `reformat-audio.js`. The original references the existing Sugar Circuit recording; four conventional DSP adaptations have separate MP3s. The feed cards use precomputed waveform amplitudes and update their highlighted progress on timeupdate. It is not inserted into the fourteen-record catalogue or its ownership IDs. `source()` supports explicit fixture files; `resume()` checks the demo budget before allowing a variation. Ordinary catalogue playback, original previews and queue priority are preserved. Page navigation never replaces the audio element. Playback does not update the example balance or ledger.

`porto-reformat-v2` holds validated variations, parent IDs, publish flags, creator follows, track saves and illustrative budget state. A saved variation must reference an existing parent, one of four prepared presets and a validated local ID. Invalid IDs, unknown creators and unsupported presets are discarded on load. No raw prompt text is persisted. Local creation is bounded to 30 versions. Text rendering escapes input; custom model output is not accepted. Cross-tab storage events refresh state and pause a variation when a new cap blocks it. Private source documents are not bundled.

`voice-input.js` creates a new browser SpeechRecognition instance only after a click or tap. Starting and listening pulse visibly; interim results rebuild the editable transcript from the complete result list to avoid duplication. Stop finishes the transcript; cancellation invalidates late callbacks and aborts the service. Permission, network and availability errors survive the service end event. Startup times out after 12 seconds and listening ends after 60 seconds, with no auto-restart. Playing audio, navigating away, hiding the page, typing or submitting cancels capture. Browser speech can use its provider’s remote recognition service; no service key or Porto speech server is configured. Old Afterlight storage is preserved under its original key, with no cross-song migration. The supported text requests select prepared fixtures and preserve source lineage. Local publish requires its own confirmation and is idempotent. The artist-permission panel describes fictional permissions, not an authorization check against a live rights registry. Creator credit is distinct from a royalty allocation.

GBP ledger examples are separate from the listening-budget fixture. A proposed future payout record references the Aptos/USDC target without representing GBP as a USDC amount or inventing a transaction. No model, payment, wallet or chain is connected. Browser speech is the only optional external service.
