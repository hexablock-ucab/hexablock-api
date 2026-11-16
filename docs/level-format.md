# Level format

The format of the hand-designed levels of Hexa Fit and Hexa Sort (design task D3).
The same file is bundled in the app (FR-04), served and updated by the API (FR-23) and downloaded on sync (FR-14).

- **Schema:** [`docs/schemas/level.schema.json`](schemas/level.schema.json) (JSON Schema 2020-12).
- **Examples:** [`hexa-fit-001.json`](schemas/examples/hexa-fit-001.json) and [`hexa-sort-001.json`](schemas/examples/hexa-sort-001.json).
- **Rules it serves:** FIT-1 to FIT-3 and SORT-4 to SORT-7 of `docs/game-rules.md` in `hexablock-app`, including the two "What a level file must provide" lists.
- **Task document:** [`odd/tasks/0002-level-format.md`](../odd/tasks/0002-level-format.md).

## Design in one paragraph

A level is one JSON object with **common fields** that every level-based variant has, a **board** made of a topology and a shape, and a **payload** whose shape depends on `gameId` (ADR-0004).
Nothing in the file is a hexagon on purpose: the board names its topology, and coordinates are lists of integers that the topology interprets.
The file holds rules data only, never presentation: no screen positions, no colors in hex codes, no texts.

## Why JSON

FR-04 allows JSON or YAML. JSON is read by Dart (`dart:convert`) and by Node without a new dependency, it is what the API sends anyway, and JSON Schema can check it in both repositories and in CI.

## Common fields

| Field | Type | Meaning |
|---|---|---|
| `formatVersion` | `1` | Version of this format. A reader rejects a version it does not know. |
| `gameId` | `"hexa-fit"` \| `"hexa-sort"` | The variant. It chooses the payload. |
| `levelId` | string, `hexa-fit-007` | Stable identifier: `gameId`, a hyphen and the number in three digits. It never changes. |
| `number` | integer ≥ 1 | Position in the variant's progression. "Next level" is `number + 1` (FR-06). |
| `version` | integer ≥ 1 | Edit counter. It grows by 1 every time the level changes, so sync downloads only new or changed levels (FR-14). |
| `difficulty` | integer 1–5 | The designer's estimate, used to check that difficulty is progressive (FR-46, FR-55). It changes nothing in the game. |
| `board` | object | The board (next section). |
| `payload` | object | The section of the variant (Hexa Fit, Hexa Sort below). |

Unknown fields are errors everywhere (`additionalProperties: false`), so a typo never passes silently.

## Board

```json
"board": { "topology": "hex", "shape": { "kind": "regular", "radius": 2 } }
```

- `topology`: the grid geometry (ADR-0004 in `hexablock-app`). Only `"hex"` exists: axial coordinates `[q, r]`, 6 neighbors, rotation by 60°.
- `shape`: one of two kinds.
  - `{ "kind": "regular", "radius": n }`: the regular region of the topology around the origin. For `"hex"`, radius 2 gives the 19 cells of Hexa Sort (FR-50).
  - `{ "kind": "cells", "cells": [[q, r], …] }`: any set of cells, listed one by one. Hexa Fit uses it for its figure (FR-40) and must use it.

**If the professor asks for square cells (C-31):** the client adds a square topology and the schema adds `"square"` to the `topology` list. Coordinates are still lists of integers (`[x, y]`), and `"regular"` means the square region of that topology. No field, payload or other level changes; existing hexagon levels stay valid.

## Hexa Fit payload

```json
"payload": {
  "pieces": [ { "cells": [[0, 0], [1, 0], [1, -1]] }, { "cells": [[0, 0], [0, 1], [1, 1], [2, 0]] } ],
  "par": { "moves": 4, "seconds": 30 },
  "solution": [ { "at": [0, 0], "rotation": 0 }, { "at": [0, -1], "rotation": 1 } ]
}
```

- `pieces`: the fixed set of pieces (FR-40). Each piece lists its cells relative to its own origin `[0, 0]`, which is also the point it rotates around (FIT-2). The same piece may appear more than once.
- `par.moves`, `par.seconds`: the two thresholds of FIT-3. A won level earns 1 star, +1 if moves ≤ `par.moves`, +1 if whole seconds ≤ `par.seconds`.
- `solution` (optional): one placement per piece, in the order of `pieces`. Each piece turns `rotation` steps of the topology around its origin and then moves its origin to `at`. Tests use it to prove that every bundled level can be solved; the game never shows it.

One rotation step for `"hex"` maps `[q, r]` to `[-r, q + r]` (Red Blob Games, *Hexagonal Grids*).

## Hexa Sort payload

```json
"payload": {
  "goal": 1,
  "tray": { "seed": 1001, "colors": ["red", "cyan", "green"], "stackSize": { "min": 1, "max": 4 } },
  "moveThresholds": [15, 10]
}
```

- `goal`: the number of blocks of 10 or more tiles to remove to win (FR-53, FR-54, SORT-4, SORT-5).
- `tray`: the parameters of the seeded generator (SORT-6).
  - `seed`: 0 to 2³² − 1. **Decision proposed by D3:** the level stores the seed, so a level always offers the same stacks. Every player gets the same level, which keeps the per-level leaderboard fair (FR-22) and lets the designer tune `moveThresholds` against a known sequence. A replay with the same seed gives the same game (NFR-05).
  - `colors`: the colors in play, at least 2, no repeats. Names, not hex codes: the client maps each name to its palette and its glyph (`red`, `orange`, `yellow`, `green`, `cyan`, `violet`, as in the UI mockups).
  - `stackSize`: the number of tiles in each drawn stack, both ends included, at most 9, so that a stack never arrives already holding a block to remove.
- `moveThresholds`: the two thresholds of SORT-7, the larger first. A won level earns 1 star, +1 for each threshold the moves are ≤ to.

## Rules JSON Schema cannot check

These rules need geometry or compare two fields. The level builder of the client (ADR-0006) and the API's validator for each `gameId` (ADR-0004) check them, and an invalid level fails with a domain error before anyone plays it.

| ID | Rule | Source |
|---|---|---|
| L1 | `levelId` ends with `number` in three digits. | this format |
| L2 | Every cell is a valid coordinate of the topology (two integers for `"hex"`). | ADR-0004 |
| F1 | The figure is connected and has no holes. | FIT-1 |
| F2 | Each piece is connected. | FIT-2 |
| F3 | The pieces' total area equals the figure's area. | FR-40 |
| F4 | `par.moves` ≥ the number of pieces (each piece needs at least one placement). | FIT-3, FIT-4 |
| F5 | If `solution` is present, it has one placement per piece and covers the figure with no gap and no overlap. | FR-43 |
| S1 | `stackSize.min` ≤ `stackSize.max`. | SORT-6 |
| S2 | `moveThresholds[0]` > `moveThresholds[1]`. | SORT-7 |

## Files

One file per level, named after its `levelId` (`hexa-fit-001.json`).
The client bundles them under one folder per `gameId`; the exact asset path is the client's choice.
The API stores and returns the same object, so a level downloaded on sync and a bundled level are read by the same adapter.

## Out of scope

- The API endpoints and their OpenAPI entries (FR-23): a later task, which uses this schema as the body of the level resource.
- The 15 Hexa Fit and 10 Hexa Sort levels themselves (FR-46, FR-55): designed after this format is approved.
- Starting stacks on the Hexa Sort board, blocked cells and piece colors: no rule asks for them. Each would be a new optional field, so adding one later does not break existing levels.
