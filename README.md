# HexaBlock API — one backend for every variant

[![CI](https://github.com/hexablock-ucab/hexablock-api/actions/workflows/ci.yml/badge.svg)](https://github.com/hexablock-ucab/hexablock-api/actions/workflows/ci.yml)
![Tests](https://img.shields.io/badge/tests-unit%20%7C%20integration%20%7C%20contract-blue)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> Semester project — *Desarrollo de Software*, Universidad Católica Andrés Bello (UCAB), 2026-2.
> Team: Valentina Maza · Ali Dahouk · Eduard Velasco — see [Team](#team).

> **Project status:** foundation stage. Requirements, architecture decisions (*Accepted* once the three members agree in [#22](https://github.com/hexablock-ucab/hexablock-api/pull/22)) and quality gates are in place; development starts with the NestJS scaffold (task 0001). Sections marked *TODO* are filled as the work lands.

## Description

REST API of [HexaBlock Suite](https://github.com/hexablock-ucab/hexablock-app): user accounts with JWT, progress sync, global leaderboards and level definitions for the four game variants. `gameId` is a dimension of one generic model, so a new variant needs configuration, not new endpoints or tables.

Stack: NestJS, TypeScript, PostgreSQL with Prisma, and Argon2id for passwords ([ADR-0002](docs/adr/0002-nestjs-and-postgresql.md)). The contract is the OpenAPI document `docs/openapi.yaml`, written first and served as Swagger UI at `/api/docs` ([ADR-0004](docs/adr/0004-contract-first-generic-gameid-model.md), task 0001).

## Documentation

| Document | Holds |
|---|---|
| [docs/requirements.md](docs/requirements.md) | Requirement catalog: constraints, functional and non-functional requirements with stable IDs |
| [docs/adr/](docs/adr/) | Architecture Decision Records |
| `docs/openapi.yaml` | The API contract (task 0001) |
| [docs/diagrams/](docs/diagrams/) | Class and Clean layers diagrams (image and editable source) |
| [odd/](odd/) | One document per substantial task: specs, verification and log |
| [AGENTS.md](AGENTS.md) | Rules every contributor and AI agent follows |

## Architecture

> TODO: embed `docs/diagrams/clean-architecture.png` and explain each layer.

Clean Architecture (Martin, 2017) inside NestJS, organized by module first and by layer inside each module ([ADR-0003](docs/adr/0003-clean-architecture-in-nestjs.md)). The framework, the database and HTTP stay in the two outer layers. One deployable service with three business modules (C-29):

| Module | Folder | Owns |
|---|---|---|
| Accounts | `src/modules/accounts` | Users, registration, sign-in and roles (`users`) |
| Progress | `src/modules/progress` | Progress sync and the leaderboards (`game_progress`, `level_progress`) |
| Levels | `src/modules/levels` | Level definitions and the level-schema validator per `gameId` (`levels`, `games`) |
| Shared | `src/shared` | The generic use-case interface, the aspects, common value objects, the error filter, Prisma and configuration |

Each module and `src/shared` have the same four layers:

| Layer | Folder in each module | Contents | Must not depend on |
|---|---|---|---|
| Entities | `domain/` | TODO | Any other layer; NestJS, Prisma, Express, JWT or hashing libraries |
| Use cases | `application/` | TODO | `interface-adapters/`, `frameworks/`; NestJS, Prisma, Express, JWT or hashing libraries |
| Interface adapters | `interface-adapters/` | TODO | `frameworks/` |
| Frameworks & drivers | `frameworks/` | TODO | — (outermost layer) |

`tool/check-architecture.mjs` checks, in the `pre-push` hook and in CI, the Dependency Rule in every module, that a module uses another one only through its `index.ts`, and the `gameId` rule.

Placements that are not obvious:

- **Composition root:** `src/main.ts` and `src/app.module.ts`; each module's `frameworks/` folder wires its plain use-case classes with factory providers (ADR-0003).
- **Module boundary:** `src/modules/<module>/index.ts` is the only public entry of a module (ADR-0003).
- **Domain errors to HTTP:** one exception filter in `src/shared/interface-adapters` maps domain errors to status codes; the domain knows nothing about HTTP (ADR-0004).
- **Repository implementations and the ORM client:** the Prisma schema and client live in `src/shared/frameworks`; each module's repositories, in its `interface-adapters/`, convert Prisma models to domain objects and back (ADR-0002).
- **Who changes levels:** only a user with the ADMIN role, checked by the authorization aspect ([ADR-0006](docs/adr/0006-admin-only-level-changes.md)).

## API Overview

> TODO: one row per endpoint. Contract-first rules: [ADR-0004](docs/adr/0004-contract-first-generic-gameid-model.md).

| Method | Path | Auth | Success | Errors | Requirement |
|---|---|---|---|---|---|
| TODO | | | | | |

## Design Patterns

> TODO: one row per implemented pattern, with the justification and a code excerpt.

| Pattern | Category | Where | Why here |
|---|---|---|---|
| Strategy | Behavioral | TODO (level-schema validators by `gameId`) | TODO |

## SOLID Principles

> TODO: one concrete example per principle, with the class, the justification and an excerpt.

## AOP

> TODO: the aspects implemented as decorators or proxies around the generic use cases (logging, timing, error policy, authorization, caching), and why they apply to every `gameId`.

**Why Decorator:** each aspect implements the same generic use-case interface it wraps, so one aspect class serves every use case and every `gameId`, and aspects can be stacked in the composition root. NestJS interceptors and guards are framework features, not the SOLID-based strategy the assignment asks for, so they are not the AOP mechanism here ([ADR-0002](docs/adr/0002-nestjs-and-postgresql.md), [ADR-0003](docs/adr/0003-clean-architecture-in-nestjs.md)).

## Getting Started

> TODO (task 0001): prerequisites with versions, `.env` from `.env.example`, database and run commands.

After cloning, run `npm install` once to install the git hooks (commit message and pre-push checks).

## Running Tests

> TODO (task 0001).

## Deployment

The API and its database run on a public cloud host, reachable from the internet, for the delivery and the defense.

> TODO (deployment ADR): the provider, how a merge to `main` is deployed only after CI passes, how database migrations run, and the health-check URL.

### Environment variables

Values live in the host's secret settings and, for local work, in a `.env` created from `.env.example`. Real values are never committed.

| Variable | Purpose | Required |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_SECRET` | Secret that signs the JWTs | Yes |
| `PORT` | HTTP port the server listens on | No |

The final list is fixed in task 0001.

## AI Usage Documentation

How the team uses AI tools, with the prompts, results, corrections and a critical evaluation: [AI_USAGE.md](AI_USAGE.md).

## Contributing

Conventional Commits, branch naming, quality gates and the pull request process: [CONTRIBUTING.md](CONTRIBUTING.md).

## Team

| Member | GitHub | Main areas |
|---|---|---|
| Eduard Velasco | [Eduardvs13](https://github.com/Eduardvs13) | Generic engine, Hexa Lines, client architecture |
| Valentina Maza | [valenmaza](https://github.com/valenmaza) | User interface, Hexa Fit, Hexa Sort, level design |
| Ali Dahouk | [AS18DC](https://github.com/AS18DC) | API: authentication, progress, leaderboards, levels, deployment |

The areas follow the current work plan and say who leads each part; every member can explain any part of the project.

## Credits

Third-party code and tools: [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## License

[MIT](LICENSE) © 2026 Valentina Maza, Ali Dahouk, Eduard Velasco.
