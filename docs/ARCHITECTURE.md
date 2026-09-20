# Architecture and behaviour

The app is static HTML, CSS and JavaScript. `app.js` renders hash routes into the main region; the audio element and persistent player remain outside that region so browsing does not replace playback.

## Routes and state

Discover filters the catalogue. My shelf combines browser-local saved and owned IDs. Record detail exposes side and track selection. Listening focuses the current record. Support explains the proposed subscription allocation. Wireframes include an annotated page and the interactive `?wireframe=1` mode.

`porto-saved` and `porto-owned` store arrays in localStorage. `porto-shelf-seed-v1` seeds the original collection once; `porto-catalog-v2` adds the six later records once. `porto-catalog-v3` adds only the five artist editions once, preserving older removals and demo purchases. Removals persist after migration. Reset restores the whole collection and clears demo ownership. Storage is not an account or backend purchase record.

## Playback

`selectTrack` selects any album, side and track. `stepTrack` moves within album bounds and crosses the A/B boundary. `source` selects a local WAV or MP3 file. Playback follows each track's declared duration; seeking is shown for demo-owned copies. Automatic progression stops at the end of a side. A request counter prevents stale play promises from restoring UI state after a pause or new selection.

The live badge is simulated. It pulses after `playing`, and stops on waiting, stalled, loadstart, pause, error or ended events. The badge displays the fictional node identifier LND-001 and DEMO NODE. Audio-event handling demonstrates player state, not peer-to-peer delivery or network attestation.

## Assets and rights

Three releases use original synthesized 24-second WAV studies. Six use Kevin MacLeod recordings divided into consecutive MP3 chapters. Five artist editions add fifteen distinct full-length Kevin MacLeod recordings, normalized to a -16 LUFS target and encoded as 128 kbps MP3. Each edition has two tracks on side A and one on side B; all counting, side completion and navigation use actual array lengths. `audio-credits.json` records their real titles, sources, licence URLs, modifications and durations. Each ZIP includes attribution. Generated artwork and fictional packaging are separate from the real music credits.

## Artist editions and discovery

`artist-editions.js` loads before the application and supplies fictional artist metadata, square generated cover assets, per-track attribution and actual audio durations. A responsive artwork row appears above the existing vinyl shelf and responds to the same genre/search filters. Search matches artists, record titles, genres and track names. The art directions span Hyperpop, Indie, Alternative, Rock and R&B; the audio is instrumental demo music with related textures, not original performances by those fictional artists.

`docs/music-provenance/2026-09-20.json` records direct source links and original/downloaded file hashes. `scripts/import-catalogue-music.py` rebuilds audio and credits from the selected source catalogue. If re-importing, synchronize updated durations and credit entries in `artist-editions.js` and regenerate any modified credit-page text before validation.

## Hosting

The same `dist` directory can be served locally, by Vercel or Sites. Vercel uses `vercel.json`; Sites uses the existing `.openai/hosting.json`. Keep that Sites project association intact. GitHub is the source repository and does not deploy the app by itself. Do not commit credentials, `.vercel`, private decks or machine-specific paths.

## Evidence limits

There is no payment provider, user account service, persistent rights registry, live Porto node, streaming attestation or settlement implementation. Sequential files may have transitions between chapters; this is not verified gapless native playback. The responsive web layout has no TestFlight, App Clip or installable iOS package.
