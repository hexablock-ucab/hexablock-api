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

### Course sources and questions for the professor

The team's private workspace sits next to this repository (`../hexablock-workspace`). When it is present, read from it (never write to it from here):

- `../hexablock-workspace/context/proyecto/ENUNCIADO_HexaBlockSuite_v1.0.md`: the assignment. It overrides every other source, and `docs/requirements.md` traces to it. Read the section itself; do not rely on a summary.
- `../hexablock-workspace/library/README.md`: maps each topic (Clean Architecture, SOLID, GoF patterns, generics, AOP, DDD, testing, UML) to the chapters of the books the professor published. Read only the chapter you need.
- `../hexablock-workspace/docs/preguntas-profesor.md`: what the professor already clarified in class.

Never copy text from these folders into this repository: the books are copyrighted and the course material is internal. Cite author and chapter instead. If the folders are missing, say so and continue with `docs/requirements.md`.

When the assignment is ambiguous, or a choice affects grading and is not the team's to make, stop and tell the user; never resolve it silently. The team keeps these questions as issues labeled `pregunta-profesor` in the workspace repository: check the open ones first and, with the user's approval, create one in Spanish (`gh issue create -R hexablock-ucab/hexablock-workspace --label pregunta-profesor --label prioridad-<alta|media|baja> --title "..." --body "..."`).

## 3. Architecture rules (Clean Architecture)

> **Decision status.** The assignment fixes Clean Architecture and the Dependency Rule (C-05) and at least one aspect for a cross-cutting concern, required in this repository (C-08): those rules are binding now.
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

Binding rules (C-05, C-08, C-22, NFR-02, NFR-03):

- The domain and the use cases never import `@nestjs/*`, an ORM, `express`, `jsonwebtoken`, `bcrypt` or any I/O library. Framework decorators live in layers 3–4 only.
- Ports (interfaces) are declared in the inner layer that **uses** them, usually `src/application/ports/`. Adapters implement them in an outer layer.
- Use cases are generic over `gameId`. No `if (gameId === 'hexa-sort')` outside the level-schema validators registered per `gameId`.
- Data crosses boundaries as domain types inward and as DTOs outward. Mappers live in layer 3. Controllers never return entities or ORM rows.
- Cross-cutting concerns (logging, timing, error policy, authorization, caching) are aspects: decorators or proxies around use cases (C-08). Use cases never call the logger.
- Time, IDs and randomness are injected through ports, never created inside the domain. Tests use fixed or seeded sources.
- `tool/check-architecture.mjs` enforces the import rules and the `gameId` rule from `tool/architecture-rules.json`, in the `pre-push` hook and in CI. A violation fails the build.
- **Do not over-engineer.** Add an abstraction only when a requirement, an ADR or a second real implementation needs it. Abstractions declared in an ADR are requirements, not speculation.

Low-level details are replaceable: a low-level detail such as the database may change shortly before the defense, never the architecture, and the design must absorb that change without rewriting the project (C-31, NFR-02). The backend is one deployable service organized in modules, not microservices (C-29), and it is deployed on a public cloud host (C-28). A hard-coded low-level detail is the main design flaw to avoid.

## 4. Code conventions

- Everything in the repository is **English**: code, identifiers, comments, docs, commit messages, PR text. Team chat and `odd/tasks` logs may be Spanish.
- TypeScript `strict` mode. No `any` without a comment that justifies it.
- Names say what a thing is in the domain: `PlayerProgress`, `LeaderboardEntry`, `LevelDefinition`. No `Manager`, `Helper`, `Util` or `Data` suffix without a real reason.
- **No primitive obsession** (C-32): the domain and the use cases model their concepts as value objects, not as bare numbers or strings: coordinates, identifiers, scores, colors, tile values, `gameId`. Booleans are acceptable, and so is an integer the team justifies as needing no value object of its own (C-32). Primitives appear only at the boundaries (DTOs, persistence, UI) and the mappers in layer 3 convert them. A value object validates itself when created and compares by value.
- **Names say the role and the layer** (course convention): input ports are interfaces named after the use case (`SyncProgressUseCase`, `GetLeaderboardUseCase`); the application class that implements them is a service (`ProgressService`); output ports name what the inner layer needs (`ProgressRepository`, `TokenService`, `Clock`); adapters name the technology and the role (`PostgresProgressRepository`, `JwtTokenService`); presentation classes name their screen (`ProgressController`). Repositories, factories, builders and value objects carry those names too.
- One reason to change per class (SRP). Small interfaces (ISP). Depend on abstractions (DIP).
- Use bounded generics when a use case needs a capability of its input (for example `TLevel extends LevelDefinition`). Document each bound in the README.
- Consistent responses: one success envelope and one error format (RFC 9457 *problem details* or the team's documented equivalent), mapped from domain errors in one exception filter.
- Comments explain *why*, not *what*. Short sentences, active voice, present tense.
- Prefer the platform and already-installed packages. A new dependency needs a one-line justification in the PR and must be mainstream and maintained.
- Lint and format are clean before you finish; CI fails on any warning.

### Domain model (DDD tactical patterns)

Sources: Evans, *Domain-Driven Design* (2003), Part II, as presented in the course; Evans, *Domain-Driven Design Reference* (2015, CC BY 4.0); Esposito, *Clean Architecture with .NET* (2024), chapters 6 and 7. `docs/domain-model.md` (deliverable D4) lists every domain class with its tactical role; update it in the same PR as the code.

- **Ubiquitous language.** Every domain concept has one name, recorded in the glossary of `docs/domain-model.md` with its Spanish term. Code, tests, diagrams and documents use that name and no synonym; renaming a concept renames the code in the same PR.
- **Rich model.** Behavior lives with the data it protects. Entities and aggregate roots expose **commands** named after the business intent (`recordLevelCompleted`, `submitScore`) and **queries** named after what a rule or a client asks (`bestStarsFor(levelId)`, `hasCompleted(levelId)`). Each command checks its invariants before it changes anything. Fields are `private readonly` where they never change and `private` otherwise; a getter is a derived domain query, never a mirror of a field so that another class can decide.
- **Tell, don't ask.** When a use case reads a domain object's state, decides, and writes the result back, the decision belongs inside the domain object: move it there. Use cases orchestrate (load, call a command, save, publish) and hold no business rule. This is how the code avoids the *anemic domain model* the course warns against.
- **Value objects** have no identity: their value is their identity. They are immutable (an operation returns a new value: `score.add(points)`), compare by value (an `equals` method), validate themselves when created, carry the behavior of their concept, and group values that only make sense together (the two axial components of a coordinate). No setters, and no getter that only mirrors a field.
- **Entities** are defined by an identity that stays the same through their life cycle, modeled as a value object (`UserId`) produced by an injected generator. They compare by identity, have a life cycle, change state only through commands, and use value objects for their attributes.
- **Persistence stays outside the model.** ORM rows are separate classes in layer 4. The repository maps them and rebuilds the aggregate through a named static method (`PlayerProgress.restore(...)`), so the domain needs no public setter or empty constructor for the ORM.
- **Aggregates.** An aggregate is the consistency boundary of an invariant, and its root is the only entry point from outside. Other objects reference an aggregate by its identity (`UserId`), not by holding it. One repository per aggregate root, and it saves and loads the whole aggregate in one transaction. Create an aggregate only where an invariant spans several objects; a lone entity is its own root.
- **Domain services** are stateless and named after a domain operation. Use one for a rule that spans several aggregates or fits none. The class that implements a use case is an *application* service (`ProgressService`), not a domain service.
- **Domain events** have past-tense names (`LevelCompleted`, `LevelPublished`). The aggregate raises them, and only when another part of the system reacts. They are immutable and carry the time (from the `Clock` port) and the identities involved. Domain events are not in Evans (2003); they come from his later *Reference* (2015).
- **Label each class with the role it really plays**, in code names, docs and diagrams. Several of our classes are GoF patterns or Clean Architecture parts, not DDD patterns:

| Class or kind | Role |
|---|---|
| `UserId`, `GameId`, `LevelId`, `Score` | DDD value objects |
| Player progress, user account | DDD entities; aggregate roots where D4 says so |
| `ProgressService` | Application service: implements a use case |
| `ProgressRepository` | DDD repository. The interface lives in layer 2, where it is used (section 3); in classic DDD it sits in the domain |
| Level-schema validator per `gameId` | GoF Strategy selected by `gameId` |
| Logging, timing or authorization decorator (C-08) | Aspect (Decorator or proxy); no DDD role |
| DTOs, controllers, mappers, ORM rows | Boundary types of layers 3 and 4; no DDD role |

In the class diagram, each DDD building block carries its stereotype and every other class keeps its own role, as `docs/diagrams/README.md` states.

## 5. Tests

- Test first when a deterministic, runnable test exists: RED, then GREEN, then REFACTOR.
- Name: `should_<expected result>_when_<condition>`, for example `should_return_404_when_level_does_not_exist`.
- Structure every test as Arrange – Act – Assert, with a blank line between the parts.
- Test behavior through public interfaces, never private state. No fragile tests.
- **Unit:** domain and use cases with in-memory fakes for ports.
- Avoid structural coupling: a test exercises one behavior through the public API of a use case or an endpoint, not one test per class or method. Use real domain objects; replace only what sits behind a port.
- Integration tests create the database the way production does, by running the migrations; never rely on the ORM synchronizing the schema.
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

## 10. Working with another AI agent (Codex, ChatGPT, Copilot)

Everything above applies to any agent. Claude Code adds automation in `.claude/`; other agents can use the same material by hand:

- `.claude/skills/<name>/SKILL.md` and `.claude/agents/*.md` are plain Markdown instructions. Ask the agent to read and follow one, for example: "read `.claude/skills/ship/SKILL.md` and follow it to open the pull request".
- For a substantial task, create the task document from `odd/_TEMPLATE.md`, get the specs approved, then implement test first (`odd/README.md`).
- The git hooks (lefthook), the CI and the protection of `main` apply to everyone, whatever the agent. The Claude Code hooks do not run in other agents, so never use `--no-verify`, never push to `main` and never force-push.
- Record the tool and model in `AI_USAGE.md` (for example "Codex, GPT-5") in every entry.
