# Porto player prototype

A working record-led listening room: a loaded vinyl shelf, unfolding sleeves, album navigation and a persistent player. This is a web prototype with fictional releases and simulated ownership and node status.

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

Fourteen records are saved initially. Five new artist editions lead discovery with original generated portraits across Hyperpop, Indie, Alternative, Rock and R&B. Their fifteen distinct full-length instrumental recordings add varied tempos and textures; genre labels describe fictional artist identities, with the real music credited separately. Selecting a narrow spine opens the front/back sleeve or liner notes. Any track can be selected without purchase; previous/next cross sides within the album. Automatic playback continues through the chosen side and stops at its end. Pause preserves position; lift needle resets the side.

Add to collection is a primary action on artist cards, the record index, sleeves, record details, the listening screen and the persistent player. Saved records show In collection. Collections persist in browser local storage and synchronize across tabs on the same origin. Demo ownership adds seeking and downloads; saving a record is free and does not grant ownership. Existing starter records, removals and demo purchases are preserved. The red `LIVE · LND-001` indicator follows audio playback and visibly says DEMO NODE. It does not establish a connection to a Porto node.

## Files

| Path | Purpose |
| --- | --- |
| `dist/index.html` | Application shell and persistent player |
| `dist/app.js` | Catalogue, routes, playback and local state |
| `dist/artist-editions.js` | Five fictional artist editions and their fifteen credited recordings |
| `dist/styles.css` | Porto styling, shelf, sleeve and transport |
| `dist/wireframe.html` | Annotated six-screen flow |
| `dist/credits.html`, `dist/audio-credits.json` | Music attribution, licences and source links |
| `dist/assets/` | Generated covers, approved Porto assets and demo audio |
| `scripts/import-catalogue-music.py` | Reproducible import, normalization and attribution for the new editions |
| `scripts/validate-player.mjs` | Asset, catalogue, migration and simulated playback regression checks |
| `create-demo-audio.py` | Deterministic synthesis for the first three releases |

## Evidence and rights

No payment, licence issuance, streaming attestation, accrual or payout occurs here. No native iOS packaging has been built. The support page illustrates the subscription model, not record-sale fees. The fictional artists do not claim authorship of Kevin MacLeod's recordings. All twenty-one licensed recordings retain CC BY 4.0 attribution and freely accessible downloads. See the credit page and each audio archive for exact terms. No blanket open-source licence is granted for Porto branding or this repository.

Figma currently has a recorded partial native build. The style guide and player handoff are repository specifications, not evidence that native player components have been built or published there.
