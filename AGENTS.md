# AGENTS.md — HexaBlock Suite (backend API)

Rules for every AI agent and every human that works in this repository.
`CLAUDE.md` imports this file. Other agents (Copilot, Gemini, Codex) read it directly.

## 1. What this repository is

The REST API of HexaBlock Suite, a mobile app with four puzzle games (Hexa Lines, Hexa Fit, Hexa Sort, Hexa Merge) built on one generic engine.
It is the semester project of *Desarrollo de Software* (UCAB, 2026-2).

The API manages users, progress, scores and level definitions **for all games with one model**: `gameId` is a dimension of the data, never a reason to duplicate a module, a table or a use case.
A new game must need configuration only (a new `gameId` and, for level-based games, a new level-schema validator), never a new controller or table.

The game client lives in `hexablock-ucab/hexablock-app`. The contract between them is the OpenAPI document of this API (`docs/openapi.yaml`).
Another team's client must be able to use this API from that document alone.

## 2. Sources of truth

Read these before you design or change behavior. Do not rely on memory or summaries.

| File | Holds |
|---|---|
| `docs/requirements.md` | Requirement catalog with stable IDs (`FR-`, `NFR-`, `C-`). Every change traces to one or more IDs. It is identical in both repositories. |
| `docs/adr/` | Architecture Decision Records. An ADR in status *Accepted* is a requirement. |
| `docs/openapi.yaml` | The API contract. |
| `odd/tasks/` | One document per substantial task: specs, tasks and log. |
| `README.md` | The public face of the project. It is graded. |
| `AI_USAGE.md` | Mandatory log of AI usage. It is graded. |

## 3. Architecture rules (Clean Architecture)

> **Decision status.** The assignment fixes Clean Architecture and the Dependency Rule (C-05) and aspects for cross-cutting concerns (C-08): those rules are binding now.
> NestJS with TypeScript (ADR-0002), the folder layout below (ADR-0003) and the contract-first model by `gameId` (ADR-0004) are **Proposed**.
> Until the team accepts those ADRs, do not scaffold the project or choose a database; ask the user instead.

Four concentric layers. Source code dependencies point inward only (the Dependency Rule).

Proposed layout (ADR-0003):

| Layer | Folder | May import |
|---|---|---|
| 1. Entities (domain) | `src/domain/` | nothing outside `src/domain/` and the TypeScript standard library |
| 2. Use cases (application) | `src/application/` | `src/domain/` |
| 3. Interface adapters | `src/interface-adapters/` (controllers, presenters, DTOs, mappers, repository implementations) | layers 1–2 |
| 4. Frameworks and drivers | `src/frameworks/` (NestJS modules, ORM schema, database, JWT, configuration, `main.ts`) | everything |

Binding rules (C-05, C-08, NFR-02, NFR-03, NFR-07):

- The domain and the use cases never import `@nestjs/*`, an ORM, `express`, `jsonwebtoken`, `bcrypt` or any I/O library. Framework decorators live in layers 3–4 only.
- Ports (interfaces) are declared in the inner layer that **uses** them, usually `src/application/ports/`. Adapters implement them in an outer layer.
- Use cases are generic over `gameId`. No `if (gameId === 'hexa-sort')` outside the level-schema validators registered per `gameId`.
- Data crosses boundaries as domain types inward and as DTOs outward. Mappers live in layer 3. Controllers never return entities or ORM rows.
- Cross-cutting concerns (logging, timing, error policy, authorization, caching) are aspects: decorators or proxies around use cases (C-08). Use cases never call the logger.
- Time, IDs and randomness are injected through ports, never created inside the domain. Tests use fixed or seeded sources.
- `tool/check-architecture.mjs` enforces the import rules and the `gameId` rule from `tool/architecture-rules.json`, in the `pre-push` hook and in CI. A violation fails the build.
- **Do not over-engineer.** Add an abstraction only when a requirement, an ADR or a second real implementation needs it. Abstractions declared in an ADR are requirements, not speculation.

The professor's guidance: the design must survive change (another client, another database, another team's frontend) without rewriting the project. Hard-coded low-level details are the main thing he penalizes.

## 4. Code conventions

- Everything in the repository is **English**: code, identifiers, comments, docs, commit messages, PR text. Team chat and `odd/tasks` logs may be Spanish.
- TypeScript `strict` mode. No `any` without a comment that justifies it.
- Names say what a thing is in the domain: `PlayerProgress`, `LeaderboardEntry`, `LevelDefinition`. No `Manager`, `Helper`, `Util` or `Data` suffix without a real reason.
- One reason to change per class (SRP). Small interfaces (ISP). Depend on abstractions (DIP).
- Use bounded generics when a use case needs a capability of its input (for example `TLevel extends LevelDefinition`). Document each bound in the README.
- Consistent responses: one success envelope and one error format (RFC 9457 *problem details* or the team's documented equivalent), mapped from domain errors in one exception filter.
- Comments explain *why*, not *what*. Short sentences, active voice, present tense.
- Prefer the platform and already-installed packages. A new dependency needs a one-line justification in the PR and must be mainstream and maintained.
- Lint and format are clean before you finish; CI fails on any warning.

## 5. Tests

- Test first when a deterministic, runnable test exists: RED, then GREEN, then REFACTOR.
- Name: `should_<expected result>_when_<condition>`, for example `should_return_404_when_level_does_not_exist`.
- Structure every test as Arrange – Act – Assert, with a blank line between the parts.
- Test behavior through public interfaces, never private state. No fragile tests.
- **Unit:** domain and use cases with in-memory fakes for ports.
- **Integration:** use cases with real repositories on an in-memory or containerized database; endpoints with `supertest`, including the `gameId` filter, validation errors and authorization.
- **Contract (recommended):** verify the API against the client's expectations from `docs/openapi.yaml`.

## 6. Git workflow

- `main` is protected. Every change enters through a pull request with green CI and, once the three members have joined, one approval.
- One branch per task: `feat/<task>`, `fix/<task>`, `docs/<task>`, `test/<task>`, `refactor/<task>`, `chore/<task>`.
- Commits follow Conventional Commits, in English: `feat(progress): add progress sync endpoint by gameId`.
- Scopes: `domain`, `application`, `adapters`, `frameworks`, `auth`, `progress`, `leaderboard`, `levels`, `openapi`, `aop`, `ci`, `docs`, `readme`, `deps`, `deps-dev`, `claude`, `release`, `workspace`.
- Never commit on `main`, never force-push, never skip hooks (`--no-verify`). Hooks in `.claude/hooks/` and lefthook enforce this.
- PRs are squash-merged. The PR title is the final commit message, so it follows Conventional Commits too.
- A change the client also needs starts here, in the contract, and gets a linked PR with the same slug in `hexablock-app`.

## 7. Definition of Done (every PR)

- [ ] Traces to requirement IDs and, for substantial work, to an `odd/tasks/` document.
- [ ] Tests written first where applicable; all tests pass locally and in CI.
- [ ] Lint, format and the architecture check are clean.
- [ ] `docs/openapi.yaml` is regenerated when an endpoint changes; breaking changes are flagged in the PR.
- [ ] README sections affected (patterns, SOLID, AOP, architecture) are updated.
- [ ] An `AI_USAGE.md` entry exists for every significant AI-assisted change.
- [ ] Third-party code is cited in code and in `THIRD_PARTY_NOTICES.md`.

## 8. AI usage and academic integrity

- The team owns every line. Architecture and pattern choices are decided by the team; AI implements and advises.
- Log each significant AI use in `AI_USAGE.md` (tool, prompt, result, what the team changed, lessons).
- Never paste credentials, tokens, `.env` contents or personal data into a prompt. Never commit secrets.
- When an agent adapts code from a source, it adds a citation comment: `// Adapted from: <title>, <url>`.
- Never copy code from another team or an uncited public repository.
- Never commit copyrighted books or course PDFs.

## 9. Commands

Available now:

```bash
npm install                          # once after cloning: git hooks (commitlint, lefthook)
node tool/check-architecture.mjs     # Clean Architecture import rules and the gameId rule
node tool/check-test-names.mjs       # should_<result>_when_<condition>
node tool/check-coverage.mjs         # 90% minimum in domain and use cases (after a coverage run)
```

Added by task 0001 when the project is scaffolded (CI already runs them once `src/` exists):

```bash
npm run start:dev                    # run locally
npm run lint -- --max-warnings=0     # ESLint, zero warnings
npm run format:check                 # Prettier
npm run build                        # compile
npm test -- --coverage               # unit tests with coverage
npm run test:e2e                     # integration and endpoint tests
```

The quality gates are described in `CONTRIBUTING.md`. A rule that matters has a check; if you add a rule here, add its check too.
