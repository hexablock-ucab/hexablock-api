# 0002 — Level format for Hexa Fit and Hexa Sort (D3)

- **Status:** Draft — waiting for the team to approve the specs; depends on `docs/game-rules.md` (`hexablock-app` #13)
- **Owner:** Valentina Maza
- **Branch / PR:** `docs/level-format` · #
- **Requirements:** FR-04, FR-14, FR-23, FR-40, FR-46, FR-50, FR-53, FR-54, FR-55, NFR-02, NFR-05, C-31, C-33
- **ADRs:** 0004 (generic level schema with a payload per `gameId`); in `hexablock-app`: 0004 (grid topology), 0006 (level builder)

## Objective

One documented, machine-checkable level format that the app bundles, the API serves and the level builder reads, for Hexa Fit and Hexa Sort.

## Problem

The game rules (`hexablock-app` #13) list what a Hexa Fit and a Hexa Sort level must provide, and leave the format to D3.
Without it, nobody can design the 25 levels, write the level builder or the level endpoints.

## Scope

- In scope: `docs/level-format.md`; `docs/schemas/level.schema.json`; one valid example per variant; the rules JSON Schema cannot check, listed for the builder and the validators.
- Out of scope: the level endpoints and OpenAPI (FR-23, later task); the 25 levels (FR-46, FR-55); the client's asset folder and loader.

## Specs

- **S1** (FR-23, ADR-0004): one schema covers both variants: common fields `formatVersion`, `gameId`, `levelId`, `number`, `version`, `difficulty`, `board`, and a `payload` chosen by `gameId`. Example: `hexa-fit-001.json` and `hexa-sort-001.json` both validate against the same file.
- **S2** (FR-40, FIT-2, FIT-3): a Hexa Fit level provides the figure as a list of cells, the pieces in their own coordinates and `par.moves` and `par.seconds`.
- **S3** (FR-53, FR-54, SORT-6, SORT-7): a Hexa Sort level provides `goal`, the tray's `seed`, `colors` and `stackSize`, and two `moveThresholds`.
- **S4** (NFR-02, C-31): no field assumes hexagons. The board names its `topology`; coordinates are integer lists the topology interprets. Adding square cells adds one value to `topology` and changes no existing level.
- **S5** (FR-14): `version` grows by 1 on every edit, and `levelId` never changes, so sync can tell new and changed levels apart.
- **S6** (NFR-05): the seed is stored in the level, so the same level always offers the same stacks.
- **S7**: a file with an unknown field, an unknown color, an unknown topology or a payload of the other variant is rejected by the schema.
- **S8** (FIT-1, FR-40, FR-43, SORT-6, SORT-7): the rules the schema cannot check (L1, L2, F1–F5, S1, S2) are listed with their source in `docs/level-format.md`, for the level builder and the API validators.

## Allowed edit surfaces

- `docs/level-format.md`
- `docs/schemas/**`
- `odd/tasks/0002-level-format.md`
- `AI_USAGE.md`

## Tasks

- [x] **T1** (S1–S6) Write `docs/schemas/level.schema.json`.
- [x] **T2** (S1–S3) Write one example level per variant; the Hexa Fit example includes a solution that needs a rotation.
- [x] **T3** (S1–S8) Write `docs/level-format.md`.
- [x] **T4** (S7, S8) Validate the examples and nine invalid variants of them (evidence below).
- [ ] **T5** Team review: approve S6 (seed in the level) and the 1–5 `difficulty` scale. **Needs a decision.**
- [ ] **T6** After approval, a linked PR `docs/level-format` in `hexablock-app` that copies the schema next to the bundled levels.
- [x] **T7** `log-ai-usage` entry.

## Verification

The repository has no JSON Schema validator yet, and this task adds no dependency. The examples were checked outside the repository with Ajv 8 (JSON Schema 2020-12, strict mode) and a script that applies L1, F1–F5, S1 and S2 with axial-coordinate math:

| Spec | Evidence | Verdict |
|---|---|---|
| S1 | `hexa-fit-001.json` and `hexa-sort-001.json` valid against the one schema. | Pass |
| S2 | Fit example: 7-cell figure, pieces of 3 and 4 cells; F1–F5 hold; its solution covers the figure, with the second piece rotated one step. | Pass |
| S3 | Sort example valid; `regular` radius 2 gives 19 cells (FR-50). | Pass |
| S4 | `"topology": "square"` is rejected today as unknown, by one enum, which is the single place to extend. | Pass |
| S7 | Rejected: unknown field in `par`; color `pink`; topology `square`; a Fit file labelled `hexa-sort`. | Pass |
| S8 | Rejected by the extra rules: a ring with a hole (F1), area 6 for a figure of 7 (F3), a solution with the wrong rotation (F5), ascending thresholds (S2), `min` > `max` (S1). | Pass |

## Open questions

- S6: does the team agree that the level stores the seed, rather than the game choosing one per attempt?
- Is a 1–5 `difficulty` scale enough, or does the team prefer names (easy, medium, hard)?

## Next step

Eduard reviews the specs; after approval, open the PR and the linked one in `hexablock-app`.

## Log

- 2026-11-16 14:05 — Valentina (prompt): "ok listo, no podemos seguir???"
- 2026-11-16 — Claude: proposed starting D3 as a draft while Eduard confirms the assignment; the format follows the "What a level file must provide" lists of `hexablock-app` #13.
- 2026-11-16 — Decision proposed (Claude, for team approval): JSON over YAML; the seed stored in the level; `stackSize.max` ≤ 9; an optional `solution` for tests; no colors or texts in the level.
- 2026-11-16 — Verification (Claude): Ajv 8 plus the extra-rule script; 2 valid examples accepted, 9 invalid variants rejected.
