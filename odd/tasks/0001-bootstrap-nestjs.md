# 0001 — Bootstrap NestJS on the Clean Architecture folders and quality gates

- **Status:** Draft — starts after the team accepts ADR-0002, ADR-0003 and ADR-0004
- **Owner:** TBD
- **Branch / PR:** `chore/bootstrap-nestjs` · #
- **Requirements:** C-02, C-05, C-13, C-23, C-24, FR-24, NFR-03
- **ADRs:** 0002 (NestJS), 0003 (layer folders and architecture check), 0004 (contract first, `/api/v1`)

## Objective

The repository runs, lints, checks the Dependency Rule, builds and tests an empty NestJS API with the four Clean Architecture folders, locally and in CI.

## Problem

There is no code yet. Every later task needs the layer folders, the npm scripts the CI already calls, and green CI on real code. The CI workflow and the architecture check already exist; their NestJS steps start running as soon as `src/` exists.

## Scope

- In scope: NestJS scaffolded into the existing `package.json` (keeping commitlint, lefthook and the `prepare` script); `src/domain`, `src/application`, `src/interface-adapters`, `src/frameworks`; ESLint, Prettier and the lefthook `pre-commit` format check; Jest and supertest; `GET /api/v1/health`; Swagger; `.env.example`; CI green.
- Out of scope: authentication, the database, game endpoints.

## Specs

- **S1** (C-05): The four layer folders exist and `node tool/check-architecture.mjs` applies its four rules and passes.
- **S2** (C-05, NFR-03): Given a temporary import of `@nestjs/common` in `src/domain`, when `node tool/check-architecture.mjs` runs, then it fails naming the rule. The import is removed afterwards and the evidence is reported.
- **S3** (C-23, C-24): `GET /api/v1/health` answers `200` with `{ "status": "ok" }`, covered by a unit test of its use case and an e2e test with supertest, both named `should_<result>_when_<condition>` with Arrange – Act – Assert.
- **S4** (C-13): The npm scripts `lint`, `format:check`, `build`, `test` and `test:e2e` exist, and the CI workflow is green on the pull request.
- **S5** (FR-24): Swagger UI is served at `/api/docs`, and `npm run openapi:export` writes `docs/openapi.yaml`.
- **S6** (C-02): The README *Getting Started* section records the Node and npm versions; `package-lock.json` is committed.

## Allowed edit surfaces

- `package.json`, `package-lock.json`, `tsconfig*.json`, `nest-cli.json`, `eslint.config.*`, `.prettierrc*`, `.env.example`
- `src/**`, `test/**`
- `lefthook.yml` (add the `pre-commit` format check)
- `docs/openapi.yaml`
- `README.md` (*Getting Started*, *Running Tests*)

## Tasks

- [ ] **T1** (S1) Scaffold NestJS into the repository and create the layer folders.
- [ ] **T2** (S2) Prove the architecture check fails on a forbidden import.
- [ ] **T3** (S3) Health use case, controller, unit and e2e tests.
- [ ] **T4** (S4) npm scripts, ESLint, Prettier and the lefthook `pre-commit` check; CI green.
- [ ] **T5** (S5) Swagger and the export script.
- [ ] **T6** (S6) README *Getting Started* and *Running Tests*.
- [ ] **T7** `log-ai-usage` entry.

## Verification

Commands, run exactly as written:

```bash
npm ci
npm run lint -- --max-warnings=0
npm run format:check
npm run build
npm test -- --coverage
npm run test:e2e
node tool/check-architecture.mjs
node tool/check-test-names.mjs
node tool/check-coverage.mjs
```

| Spec | Evidence | Verdict |
|---|---|---|
| S1 | | |
| S2 | | |
| S3 | | |
| S4 | | |
| S5 | | |
| S6 | | |

## Open questions

- Whether the API must be deployed for the defense and the release is a question for the professor; it does not block this task.

## Next step

The team accepts ADR-0002, ADR-0003 and ADR-0004; then someone takes this task.

## Log

- 2026-10-28 — Eduard Velasco with Claude Code (setup): task drafted as the first task of the repository.
