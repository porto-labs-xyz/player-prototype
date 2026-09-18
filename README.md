# Porto listening room

A responsive, interactive web prototype and wireframe for the pitch deck's proposed listening app. This is a design prototype, not a shipped Porto service or a native Figma deliverable.

## Experience

- Browse upright vinyl spines in Discovery and My shelf. Press a spine to pull out an animated gatefold sleeve with front artwork, a designed back cover and liner notes. Put back or Escape closes it. On phones the sleeve unfolds vertically so the artwork and text stay readable.
- Inspect the track order and select side A or B directly from the sleeve.
- Drop the needle to play original demo audio. Tracks advance in order within the chosen side.
- Pause preserves position. Lift needle resets the side. Streaming deliberately has no track skipping or seeking.
- Start with all nine demo records saved on the browser-local shelf. Existing visitors receive this starter collection once; later removals persist. Reset restores the starter collection and clears demo purchases.
- Confirm a clearly labelled demonstration purchase to unlock full track navigation, seeking and a downloadable archive of the demo audio. No payment, purchase contract or commercial licence is created.
- Explore the subscription allocation model separately from record purchases. The model is 70% rights holders, 25% operators and 5% protocol treasury. Rights-holder amounts follow registered rights splits. Beta settlement is daily, not immediate per play.

## Deliverables

- `dist/index.html`: full interactive application with discovery, record detail, listening, shelf and support views.
- `dist/wireframe.html`: six-screen wireflow with annotations and links to corresponding interactions.
- `dist/index.html?wireframe=1`: interactive low-fidelity mode.
- `dist/assets`: original record artwork, original synthesized demo audio, CC BY 4.0 music chapters, downloadable audio archives and approved Porto assets.

## Source and evidence

Visual foundation: Porto Design System 0.1.0-dev.1, its released tokens, approved mark and architectural artwork; current design notes and brand guidance. The core listening and ownership interactions follow the private pitch deck's product concept. The private deck, personal material and commercial terms are not included here.

Product mechanics: Porto whitepaper and PIP-5 for listener attribution, rights-holder qualification and daily Beta settlement. The application does not perform network streaming attestations or accrue or settle money. Purchase licensing, fees and settlement remain open product questions.

Prototype choices: fictional catalogue and prices, original generated sleeves, three sound studies or licensed music chapters per side, category filters, browser-local saved/owned state, support explainer and responsive desktop/mobile layouts. These are proposed interaction choices, not previously approved production requirements.

## Assets

The three original sleeves were generated with built-in ImageGen, one request each and no variants. Working prompts: After the rain, a solitary cypress against warm ivory dusk and burnt vermilion earth, soft-focus analogue photography; Soft architecture, high-contrast warm monochrome curved concrete staircase with a tiny red accent; Blue hours, atmospheric deep cobalt cyanotype water ripples with an ivory reflection. Each requested a square, full-bleed, text-free independent record sleeve with no actual artist imitation.

The original audio is deterministic synthesis created by `create-demo-audio.py`. All six tracks in each fictional release are 24 seconds long. Downloads contain WAV files and a plain-text explanation.

## Run

Serve the `dist` directory with any static HTTP server. No external backend is required. Typography uses DM Sans and IBM Plex Mono with system fallbacks. Browser storage is only for the local demo shelf.

## Sharing

The web prototype is also hosted at https://porto-listening-room.vercel.app with wireframes at /wireframe.html. This deployment is a publicly accessible web demo. It is not yet an installable PWA, native iOS application, TestFlight build or App Clip.


## Architectural shelf and expanded catalogue, 19 September 2026

The shelf is a minimal architectural elevation: nine matte spines, 23–39px wide, varied heights, a fine continuous baseline, small catalogue numbers and a compact text index. Cream, stone, slate, ochre and muted red keep the catalogue within the Porto palette. The sleeve pulls vertically, then unfolds below into front/back or liner notes. The mobile shelf scrolls horizontally when needed, with a larger text-index alternative for selection. Reduced motion disables the unfolding animation.

Six fictional visual releases join the original three: Vela Saint / Velvet after midnight and Iris Vale / Second skin (R&B); Static Harbour / Concrete bloom and Paper Weather / Rooms we left (Alt rock); June Assembly / Sunday geometry (Jazz); Index Field / Parallel lines (Electronic). A one-time catalogue migration adds only the six new records, preserving removals of older records and all demo purchases. Subsequent removals persist.

Six new covers were generated in one request each with no variants. Shared brief: square full-bleed independent sleeve, tactile analogue grain, minimal composition, no text, logo, watermark, product mockup or actual artist imitation. Individual prompts: black satin folded into a restrained architectural curve with deep wine-red light and an ivory fleck; an adult dark-skinned woman's hand on red pleated fabric, intimate abstract crop; a tiny wildflower in a cracked concrete wall, desaturated flash and photocopy grain; a black-and-white empty rehearsal room with one chair, diagonal light and tiny red tape; warm light through blinds onto a cream wall and dark chair edge; a black/ivory physical-paper collage with parallel drafting lines and one offset red block.

## Licensed demo music

The six new releases use real recordings by Kevin MacLeod (incompetech.com), licensed under Creative Commons Attribution 4.0: Slow Jam, Clean Soul, Cool Rock, Bummin on Tremelo, Backed Vibes (clean), and Cipher, respectively. These are credited source recordings, not music made by the fictional catalogue artists. Genre names describe the fictional visual catalogue; the source music is identified by its real title.

Each recording is split into six consecutive chapters and re-encoded as 160kbps MP3, arranged three per side. Side progress, displayed times and owned-copy seeking use each chapter's duration. The original three releases retain their 24-second synthesized sound studies.

`dist/audio-credits.json` records each original track page, direct download, licence URL, changes and chapter durations. `dist/credits.html` provides visible attribution and freely accessible downloads independent of simulated ownership. Each new download ZIP includes all six chapters and ATTRIBUTION.txt, retaining the creator, source, licence and modification notice. Liner notes, record details, listening view and persistent player distinguish real audio from fictional packaging. No endorsement is implied.

Music source: https://incompetech.com/music/royalty-free/ . Licence: https://creativecommons.org/licenses/by/4.0/ . Verified 19 September 2026.
