# Contributing

Read README.md, docs/DESIGN_SYSTEM.md and the current design-system release manifest before editing. Keep product claims separate from prototype choices. No em dashes in Porto-facing copy.

## Always traverse, enrich and build meaning

In the Porto workspace, route the task through `porto-knowledge/scripts/knowledge.py`, traverse one or two typed hops in both directions when tracing source documents, then read the cited source. Use the marketing-deck route for visual work and player-prototype for player behaviour. INFERRED edges guide reading; they do not prove mechanics.

After source changes, update the relevant style guide or design notes. Run the workspace `scripts/update-porto-knowledge-graph.sh` to run Graphify, augmentation, semantic enrichment, source-text population, Obsidian generation and the organisation projection. Run impact for each changed declared source. Both graph checks must pass. Verify source hashes and meaningful typed connections, not just a larger node count. Never hand-edit generated notes.

A standalone clone does not contain the organisation graph. Use the [knowledge repository](https://github.com/porto-labs-xyz/porto-knowledge) and its documented workspace layout; do not invent missing source evidence. The organisation manifest maps this repository to the workspace directory `listening-app`.

## Review and publish

Check JavaScript syntax, changed local links and the affected playback/storage behaviour. Preserve music attribution and demo labels. Do not claim visual, native-device or network validation from DOM simulations. Keep credentials and restricted source documents out of Git. Commit the source repositories before refreshing the final graph so provenance names the committed revisions. Push the reviewed changes and dispatch `notify_source_change.py` for the changed declared source.
