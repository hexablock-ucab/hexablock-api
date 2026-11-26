# 0005 — Accept the ADRs, with the module-first layout and ADMIN-only levels

- **Status:** Verifying
- **Owner:** Eduard Velasco
- **Branch / PR:** `docs/accept-adrs` · #22
- **Requirements:** C-05, C-08, C-22, C-24, C-26, C-29, FR-14, FR-20 to FR-25, NFR-02, NFR-03, NFR-06
- **ADRs:** 0001 to 0005 (accepted here), 0006 (new)

## Objective

Every ADR of the API is *Accepted* by the three members, with the decisions the team took on 2026-11-24, and the architecture check enforces the module-first layout that ADR-0003 now describes.

## Problem

The ADRs are still *Proposed*, so `AGENTS.md` forbids scaffolding the project. Several of them are out of date: ADR-0002 leaves the ORM open, ADR-0003 describes a layer-first tree that does not show the modules C-29 asks for, ADR-0004 says `docs/openapi.yaml` is generated, and no ADR records who may change levels. The architecture check reads only literal paths, so it cannot follow a layout with one folder per module.

## Scope

- In scope: ADR-0001 to ADR-0005 accepted with their adjustments; new ADR-0006; the `version` text of the level format and its schema; `AGENTS.md` §3 (decision status and layout); task 0001 loses its wait condition; `tool/architecture-rules.json`, `tool/quality-gates.json`, `tool/check-architecture.mjs` and `tool/check-coverage.mjs` with tests; CI runs those tests.
- Out of scope: the sync ADR (D6) and the hosting provider ADR (D11); scaffolding NestJS (task 0001).

## Specs

- **S1** (C-05, C-27): ADR-0001 to ADR-0006 say *Status: Accepted*, the date 2026-11-25 and *Deciders: Eduard Velasco, Ali Dahouk, Valentina Maza*. ADR-0001 says an ADR is accepted when the three members agree in the pull request, "an approving review, or their agreement recorded in the pull request".
- **S2** (C-24, C-26, NFR-06): ADR-0002 names Prisma as the ORM, Argon2id as the password hash and contract tests that validate the request and response examples against `docs/openapi.yaml`, with Pact as an extra. The hosting provider stays for a later ADR.
- **S3** (C-05, C-29, NFR-03): ADR-0003 describes `src/modules/<module>/` with `domain/`, `application/`, `interface-adapters/` and `frameworks/` inside; the business modules `accounts`, `progress` and `levels`; `src/shared/` with the same four folders; an `index.ts` per module as its only public entry; `src/main.ts` and `src/app.module.ts` as the composition root. It cites C-29 and Martin (2017), ch. 34, and lists "layers on top with feature subfolders" as a rejected alternative.
- **S4** (C-22, C-26, FR-14, FR-21, FR-23): ADR-0004 says `docs/openapi.yaml` is written first and is the contract; `levels/` is the single source of the levels; each level is stored as the same document as its file; the progress merge lives only in the API.
- **S5** (FR-14, FR-23): `docs/level-format.md` and the `version` description of `docs/schemas/level.schema.json` say that whoever changes a level raises the version (by convention by 1), in the file of `levels/` or in the body of the ADMIN's `PUT`; the API does not compute it and rejects with 409 a version that is not greater than the stored one; the seed writes a level only when the file carries a greater version than the database.
- **S6** (FR-23, NFR-06d, C-08): ADR-0006 says only a user with the ADMIN role (a JWT claim) creates or updates levels; POST and PUT are protected by the authorization aspect; there is no editing screen; the first ADMIN account is created from environment variables.
- **S7** (C-05, C-22, NFR-03): Given `src/modules/levels/domain/x.ts` that imports `@nestjs/common`, when `node tool/check-architecture.mjs` runs, then it fails with rule `domain-is-framework-free`. The same holds for `src/shared/domain/`. A rule path may contain `*` as one whole path segment.
- **S8** (C-29): Given `src/modules/progress/application/a.ts` that imports `../../levels/domain/level`, when the check runs, then it fails with rule `modules-use-each-other-through-index`; importing `../../levels` or `../../levels/index` passes.
- **S9** (FR-21, FR-23): Given `'hexa-fit'` in `src/modules/progress/domain/`, the check fails with `no-game-specific-code-in-the-core`; in `src/modules/levels/domain/` it passes.
- **S10** (C-23): `node tool/check-coverage.mjs` applies the minimum of 90 % to `src/shared/domain`, `src/shared/application`, `src/modules/*/domain` and `src/modules/*/application`.
- **S11** (C-13): The tests of the two scripts run with `node --test "tool/test/*.test.mjs"` locally and in CI, and the tests are named `should_<result>_when_<condition>`.

## Allowed edit surfaces

- `docs/adr/0001-*.md` to `docs/adr/0006-*.md`
- `docs/level-format.md`, `docs/schemas/level.schema.json` (the `version` description only)
- `AGENTS.md` (§3 only), `odd/tasks/0001-bootstrap-nestjs.md`, `odd/tasks/0005-accept-adrs.md`, `AI_USAGE.md`
- `tool/architecture-rules.json`, `tool/quality-gates.json`, `tool/check-architecture.mjs`, `tool/check-coverage.mjs`, `tool/test/**`
- `.github/workflows/ci.yml` (one step for the tool tests)
- `README.md` (project status, stack sentence and *Architecture* section)

## Tasks

- [x] **T1** (S1, S2, S3, S4, S6) Accept and adjust the ADRs; write ADR-0006.
- [x] **T2** (S5) The `version` text of the level format and the schema.
- [x] **T3** (S3) `AGENTS.md` §3 and task 0001.
- [x] **T4** (S7–S11) Rules, scripts and their tests (`odd-worker`).
- [x] **T5** Verify every spec (`odd-verify`).
- [x] **T6** `log-ai-usage` entry.
- [x] **T7** After api #14 merges: rebase, then update the README architecture table and project status.

## Verification

Commands, run exactly as written:

```bash
node --test "tool/test/*.test.mjs"
node tool/check-architecture.mjs
node tool/check-test-names.mjs
node tool/check-coverage.mjs
```

| Spec | Evidence | Verdict |
|---|---|---|
| S1–S6 | ADR texts, ADR-0006, level format and schema reviewed against the change plan §2.6 and §2.9 | Pass |
| S7–S10 | 18 behavior tests of the two scripts (fixture trees, scripts run as child processes) | Pass |
| S11 | `node --test "tool/test/*.test.mjs"`: 18 pass, 0 fail; CI step *Tool tests*. Names follow the convention but `check-test-names.mjs` does not scan `.test.mjs` | Pass, names checked by hand |

## Open questions

None. The decisions come from the team's change plan of 2026-11-24 (decisions 1, 8, 12, 20, 22, 24, 25, 28 and 30).

## Next step

The three members record their agreement in the pull request. When api #21 merges, merge `main` into this branch and keep both `AI_USAGE.md` entries.

## Log

- 2026-11-25 — Eduard Velasco (prompt): "Después sigue con la fase 0 de la api, según ../hexablock-workspace/docs/auditoria/2026-11-24-plan-de-cambios-pr.md (secciones 1, 2.2, 2.3, 2.8 y 2.9), sin pedirme confirmación entre pasos; para solo si algo contradice el enunciado o si necesito aprobar en GitHub: 1. api #14: revierte dentro de la rama el merge de api #15 y haz push. 2. La parte api del par docs/domain-model-without-ddd (2.3), cuando api #14 esté fusionado. 3. Las ramas api de docs/requirements-baseline (2.8) y docs/accept-adrs (2.9, que incluye ADR-0003 por módulos y el texto de version del formato), con los PR abiertos. Sigue AGENTS.md. No fusiones nada."
- 2026-11-25 — Claude: the plan's §2.9 recommends teaching the scripts to expand `*` rather than listing each module's paths; applied, so a new module needs no rule change.
- 2026-11-25 — odd-worker: T4 done, RED 13 of 18 failing, GREEN 18 of 18; `check-architecture` "0 of 5 rules applied" (no `src/` yet).
- 2026-11-25 — Claude: `node --test tool/test/` fails on Node 21+ with a folder argument; chose the glob `"tool/test/*.test.mjs"` in CI and here instead of an index.js entry (no double run). odd-verify not run; the parent session re-ran the four verification commands.
- 2026-11-25 — Eduard Velasco (prompt): "Lee odd/tasks/0005-accept-adrs.md y ../hexablock-workspace/docs/auditoria/2026-11-24-plan-de-cambios-pr.md (secciones 1, 2.3 y 2.9). Sin pedirme confirmación entre pasos; para solo si algo contradice el enunciado: 1. Termina T7: la tabla del README en api #22, y haz push. 2. La mitad api del par docs/domain-model-without-ddd (2.3), con el PR abierto. 3. Cuando api #21 se fusione, resuelve el conflicto de AI_USAGE.md en api #22. Sigue AGENTS.md. No fusiones nada."
- 2026-11-25 — Claude: T7 done. api #14 was already in the branch (merge `a38fa1a`), so no rebase was needed. The README now shows the three modules and `src/shared`, the four layers inside each, the module boundary, Prisma in the outer layers and ADR-0006; the project status says the ADRs are accepted once the three agree in #22.
