# HexaBlock API — one backend for every variant

[![CI](https://github.com/hexablock-ucab/hexablock-api/actions/workflows/ci.yml/badge.svg)](https://github.com/hexablock-ucab/hexablock-api/actions/workflows/ci.yml)
![Tests](https://img.shields.io/badge/tests-unit%20%7C%20integration%20%7C%20contract-blue)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> Semester project — *Desarrollo de Software*, Universidad Católica Andrés Bello (UCAB), 2026-2.
> Team: Valentina Maza · Ali Dahouk · Eduard Velasco.

> **Project status:** foundation stage. Requirements, architecture decisions (all *Proposed*) and quality gates are in place; development starts after the team review. Sections marked *TODO* are filled as the work lands.

## Description

REST API of [HexaBlock Suite](https://github.com/hexablock-ucab/hexablock-app): user accounts with JWT, progress sync, global leaderboards and level definitions for the four game variants. `gameId` is a dimension of one generic model, so a new variant needs configuration, not new endpoints or tables.

Proposed stack: NestJS, TypeScript and PostgreSQL ([ADR-0002](docs/adr/0002-nestjs-and-postgresql.md)). The contract is the OpenAPI document `docs/openapi.yaml`, served as Swagger UI at `/api/docs` (task 0001).

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

Clean Architecture (Martin, 2017) inside NestJS: the framework, the database and HTTP stay in the two outer layers. `tool/check-architecture.mjs` checks the Dependency Rule and the `gameId` rule in CI ([ADR-0003](docs/adr/0003-clean-architecture-in-nestjs.md)).

| Layer | Folder | Contents |
|---|---|---|
| Entities | `src/domain` | TODO |
| Use cases | `src/application` | TODO |
| Interface adapters | `src/interface-adapters` | TODO |
| Frameworks & drivers | `src/frameworks` | TODO |

## API Overview

> TODO: endpoints table (method, path, authentication, requirement ID). Contract-first rules: [ADR-0004](docs/adr/0004-contract-first-generic-gameid-model.md).

## Design Patterns

> TODO: one row per implemented pattern, with the justification and a code excerpt.

| Pattern | Category | Where | Why here |
|---|---|---|---|
| Strategy | Behavioral | TODO (level-schema validators by `gameId`) | TODO |

## SOLID Principles

> TODO: one concrete example per principle, with the class, the justification and an excerpt.

## AOP

> TODO: the aspects implemented as decorators or proxies around the generic use cases (logging, timing, error policy, authorization, caching), and why they apply to every `gameId`.

## Getting Started

> TODO (task 0001): prerequisites with versions, `.env` from `.env.example`, database and run commands.

After cloning, run `npm install` once to install the git hooks (commit message and pre-push checks).

## Running Tests

> TODO (task 0001).

## AI Usage Documentation

How the team uses AI tools, with the prompts, results, corrections and a critical evaluation: [AI_USAGE.md](AI_USAGE.md).

## Contributing

Conventional Commits, branch naming, quality gates and the pull request process: [CONTRIBUTING.md](CONTRIBUTING.md).

## Credits

Third-party code and tools: [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## License

[MIT](LICENSE) © 2026 Valentina Maza, Ali Dahouk, Eduard Velasco.
