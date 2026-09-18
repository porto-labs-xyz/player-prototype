# Porto listening room

A responsive, interactive web prototype and wireframe for the pitch deck's proposed listening app. This is a design prototype, not a shipped Porto service or a native Figma deliverable.

## Experience

- Discover a record, inspect its track order and select side A or B.
- Drop the needle to play original demo audio. Tracks advance in order within the chosen side.
- Pause preserves position. Lift needle resets the side. Streaming deliberately has no track skipping or seeking.
- Save records to a browser-local shelf.
- Confirm a clearly labelled demonstration purchase to unlock full track navigation, seeking and a downloadable archive of the demo audio. No payment, purchase contract or commercial licence is created.
- Explore the subscription allocation model separately from record purchases. The model is 70% rights holders, 25% operators and 5% protocol treasury. Rights-holder amounts follow registered rights splits. Beta settlement is daily, not immediate per play.

## Deliverables

- `dist/index.html`: full interactive application with discovery, record detail, listening, shelf and support views.
- `dist/wireframe.html`: six-screen wireflow with annotations and links to corresponding interactions.
- `dist/index.html?wireframe=1`: interactive low-fidelity mode.
- `dist/assets`: original record artwork, original synthesized demo audio, downloadable audio archives and approved Porto assets.

## Source and evidence

Visual foundation: Porto Design System 0.1.0-dev.1, its released tokens, approved mark and architectural artwork; current design notes and brand guidance. The core listening and ownership interactions follow the private pitch deck's product concept. The private deck, personal material and commercial terms are not included here.

Product mechanics: Porto whitepaper and PIP-5 for listener attribution, rights-holder qualification and daily Beta settlement. The application does not perform network streaming attestations or accrue or settle money. Purchase licensing, fees and settlement remain open product questions.

Prototype choices: fictional catalogue and prices, original generated sleeves, three 24-second sound studies per side, category filters, browser-local saved/owned state, support explainer and responsive desktop/mobile layouts. These are proposed interaction choices, not previously approved production requirements.

## Assets

The three original sleeves were generated with built-in ImageGen, one request each and no variants. Working prompts: After the rain, a solitary cypress against warm ivory dusk and burnt vermilion earth, soft-focus analogue photography; Soft architecture, high-contrast warm monochrome curved concrete staircase with a tiny red accent; Blue hours, atmospheric deep cobalt cyanotype water ripples with an ivory reflection. Each requested a square, full-bleed, text-free independent record sleeve with no actual artist imitation.

The original audio is deterministic synthesis created by `create-demo-audio.py`. All six tracks in each fictional release are 24 seconds long. Downloads contain WAV files and a plain-text explanation.

## Run

Serve the `dist` directory with any static HTTP server. No external backend is required. Typography uses DM Sans and IBM Plex Mono with system fallbacks. Browser storage is only for the local demo shelf.
