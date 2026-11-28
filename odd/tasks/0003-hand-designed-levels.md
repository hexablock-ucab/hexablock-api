# 0003 — The 15 Hexa Fit and 10 Hexa Sort levels

- **Status:** Draft — depends on the level format (task 0002, PR "docs(levels): add the level format…") being approved
- **Owner:** Valentina Maza
- **Branch / PR:** `feat/levels` · # (based on `docs/level-format`)
- **Requirements:** FR-04, FR-14, FR-23, FR-40, FR-43, FR-44, FR-46, FR-50, FR-53, FR-54, FR-55, C-10
- **ADRs:** 0004 (generic level schema)

## Objective

Every level the assignment asks for exists as a valid file, with progressive difficulty, a proven solution for Hexa Fit and calibrated star thresholds for Hexa Sort.

## Problem

The app must ship at least 15 Hexa Fit and 10 Hexa Sort levels, designed by hand and loaded from configuration files, with progressive difficulty (§5.1.5). The professor allows generating them with AI if it is recorded (meeting of 2026-11-05, answer 18).

## Scope

- In scope: `levels/hexa-fit/*.json`, `levels/hexa-sort/*.json`, `levels/README.md` with a summary and a preview; the Hexa Sort example of `docs/level-format.md` aligned with level 1.
- Out of scope: copying the files into the app's assets (the app task that writes the level loader); loading them into the API's database (the level endpoints task).

## Specs

- **S1** (FR-46, FR-55): 15 Hexa Fit and 10 Hexa Sort files; every one is valid against `docs/schemas/level.schema.json` and the extra rules L1, L2, F1–F5, S1, S2.
- **S2** (FR-40, FR-43): every Hexa Fit level has a `solution` that covers its figure with no gap and no overlap.
- **S3** (FR-46, FR-55): difficulty never decreases with `number`. Hexa Fit grows in cells, pieces and fewer solutions (unique from level 8); Hexa Sort grows in goal, colors and stack size.
- **S4** (FIT-2): no Hexa Fit piece reaches the tray already in its solved orientation, unless it looks the same in every orientation.
- **S5** (SORT-7, FR-54): every Hexa Sort level is won by a greedy player in at least 75% of 400 simulated games, and its stored seed is won within its 3★ threshold.
- **S6** (FR-14): every level has `version` 1.

## Allowed edit surfaces

- `levels/**`
- `docs/schemas/examples/hexa-sort-001.json`, `docs/level-format.md` (the Hexa Sort example only)
- `odd/tasks/0003-hand-designed-levels.md`
- `AI_USAGE.md`

## Tasks

- [x] **T1** (S1–S4) Generate Hexa Fit candidates (grown figures without holes, split into connected pieces of 2–5 cells), count each candidate's solutions with an exact-cover solver, and pick one per level by the difficulty curve.
- [x] **T2** (S1, S3, S5) Simulate Hexa Sort (SORT-1 to SORT-5, greedy player, 400 games per level) and set the goal, colors, stack size, thresholds and seed.
- [x] **T3** (S1) Validate the 25 files.
- [x] **T4** Write `levels/README.md` and the preview.
- [ ] **T5** Play-test levels 1, 8 and 15 of Hexa Fit on paper or in the app once it exists. **Needs a person.**
- [ ] **T6** Recheck the Hexa Sort thresholds with the engine's real tray generator (S5). **After the engine exists.**
- [x] **T7** `log-ai-usage` entry.

## Verification

Run outside the repository (no dependency added): Ajv 8 with JSON Schema 2020-12 plus the extra-rule script of task 0002, and the two calibration scripts.

| Spec | Evidence | Verdict |
|---|---|---|
| S1 | 25 of 25 files PASS (schema and extra rules). | Pass |
| S2 | F5 checked on all 15 Hexa Fit files: the solution covers the figure exactly. | Pass |
| S3 | Summary tables in `levels/README.md`: Fit 7 → 30 cells, 2 → 8 pieces, solutions 6 → 1; Sort goal 1 → 8, colors 3 → 6, stacks 1–4 → 3–7. | Pass |
| S4 | Each stored piece is 1–3 rotation steps from its solved orientation; symmetric pieces count 0 steps. | Pass |
| S5 | Greedy win rate per level: 100, 100, 100, 100, 98, 99, 99, 84, 80, 79 %; each stored seed wins within its 3★ threshold. | Pass (provisional, T6) |
| S6 | All files have `"version": 1`. | Pass |

## Open questions

- Does the team agree that `levels/` in this repository is the single source, and the app copies the files into its assets?
- The tray generator of the simulator is an assumption (T6).

## Next step

After the level format is approved, mark this PR ready; Valentina play-tests T5 when the app can load levels.

## Log

- 2026-11-16 15:39 — Valentina (prompt): "si!!" (answering: "Puedo hacerlos ya con este formato, de fácil a difícil … ¿Le damos con los niveles?")
- 2026-11-16 — Claude: generated and selected the levels with the scripts described in T1 and T2; validated all 25 files.
- 2026-11-16 — Decision (Claude, for team review): par formulas and threshold rule written in `levels/README.md`; the Hexa Sort example of task 0002 updated to equal level 1 (thresholds 15 / 10 instead of 24 / 18).
- 2026-11-28 — Review fixes (Valentina with Claude): 9 Hexa Fit pieces no longer arrive solved (S4 now holds for every piece that is not fully symmetric; par moves recomputed for levels 1, 2, 4, 7, 10–13 and 15); Hexa Sort levels 6 and 9 have their own seed (1600, 1902); the 11 levels are at `version` 2; `docs/schemas/examples/hexa-fit-001.json` equals level 1 again.
