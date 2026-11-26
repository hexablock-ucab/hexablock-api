# 0004 — Check every level file in CI

- **Status:** Verifying
- **Owner:** Valentina Maza
- **Branch / PR:** `ci/level-check` · # (based on `feat/levels`)
- **Requirements:** FR-04, FR-23, FR-40, FR-43, FR-46, FR-55, C-13
- **ADRs:** 0004 (generic level schema); in `hexablock-app`: 0004 (grid topology)

## Objective

A broken level never reaches `main`: CI checks every level file against the schema and the rules of `docs/level-format.md`.

## Problem

Tasks 0002 and 0003 checked the levels with a script that stayed outside the repository. Once anyone edits a level, nothing checks it again until the app or the API code exists.

## Scope

- In scope: `tool/check-levels.mjs`, invalid fixtures, the npm script, a CI step and a pre-push hook.
- Out of scope: the API's validators per `gameId` and the app's level builder (they replace this check when the code exists).

## Specs

- **S1** (FR-23): every file in `levels/` and `docs/schemas/examples/` validates against `docs/schemas/level.schema.json`.
- **S2** (FR-40, FR-43): the rules L1, L2, F1–F5, S1 and S2 of `docs/level-format.md` hold for every file.
- **S3** (FR-46, FR-55): in each folder of `levels/`, the file name is the `levelId`, numbers run 1..N with no gap, difficulty never decreases, and every Hexa Fit level has a solution.
- **S4**: each file in `tool/fixtures/invalid-levels/` is rejected, so a check that stops working fails the build.
- **S5** (C-13): the check runs in CI on every pull request and before a push that touches a level.

## Allowed edit surfaces

- `tool/check-levels.mjs`, `tool/fixtures/invalid-levels/**`
- `package.json`, `.github/workflows/ci.yml`, `lefthook.yml`
- `docs/level-format.md`, `levels/README.md`, `THIRD_PARTY_NOTICES.md`, `AI_USAGE.md`, this file

## Tasks

- [x] **T1** (S1–S4) Write `tool/check-levels.mjs`; the geometry lives in one table per topology.
- [x] **T2** (S4) Commit the nine invalid levels used in task 0002 as fixtures.
- [x] **T3** (S5) `npm run check:levels`, a CI step and a pre-push command limited to level files.
- [x] **T4** `log-ai-usage` entry.

## Verification

| Spec | Evidence | Verdict |
|---|---|---|
| S1, S2 | `node tool/check-levels.mjs`: "Levels OK (27 files valid; 9 invalid fixtures rejected)". | Pass |
| S2 | Turning one piece of `hexa-fit-008` one step fails with F5 (overlap, leaves the figure, gaps). | Pass |
| S3 | Setting `hexa-sort-004` to difficulty 1 fails: "difficulty decreases after level 3". | Pass |
| S4 | Each fixture fails for its own rule: area 6 of 7 (F3), wrong rotation (F5), ring with a hole (F1), unknown field, `gameId` and `levelId` that disagree, `min` > `max` (S1), ascending thresholds (S2), color `pink`, topology `square`. | Pass |
| S5 | Step "Level files" in `ci.yml`; `levels` command in `lefthook.yml` with a glob, so other pushes skip it. | Pending CI run on the PR |

## Open questions

- None. A new dependency, Ajv 8 (MIT, the most used JSON Schema validator for Node), is justified in the PR as AGENTS.md asks.

## Next step

Review and merge after #19.

## Log

- 2026-11-24 — Valentina Maza (verbatim): "si" (answering the offer to put the level check in the repository and CI, and to prepare the script that copies the levels to the app).
- 2026-11-24 — Valentina Maza with Claude (Opus 5.5, claude.ai): T1–T4 done; the check was proved by breaking one Fit solution and one Sort difficulty and seeing it fail.
