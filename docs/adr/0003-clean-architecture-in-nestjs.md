# ADR-0003: Clean Architecture inside NestJS, enforced by an architecture check

- **Status:** Proposed — to review in the first team meeting
- **Date:** 2026-10-28
- **Proposed by:** Eduard Velasco
- **Deciders:** —
- **Requirements:** C-05, C-08, C-22, NFR-02, NFR-03

## Context

NestJS tutorials put controllers, services and ORM entities together per feature module, so the framework and the database leak into business rules. The assignment requires the four Clean Architecture layers and the Dependency Rule.

## Decision

```
src/
├── domain/               # Layer 1: entities, value objects, domain errors. No framework.
├── application/          # Layer 2: generic use cases, ports (repositories, token service, clock), aspects as use-case decorators.
├── interface-adapters/   # Layer 3: controllers, DTOs, presenters, mappers, repository implementations.
└── frameworks/           # Layer 4: Nest modules (composition root), ORM schema and client, JWT, config, main.ts.
```

- `tool/check-architecture.mjs`, with the rules in `tool/architecture-rules.json`, forbids any import from an inner layer to an outer one, any `@nestjs/*`, ORM or I/O import inside `domain/` and `application/`, and any code path for one specific `gameId` outside the level-schema validators. It runs in the `pre-push` hook and in CI.
- Use cases are plain classes; Nest wires them in `frameworks/` with factory providers.
- Aspects (logging, timing, error policy, authorization) are decorators that implement the same use-case interface and wrap the generic use case, so they apply to every `gameId`.

## Alternatives considered

| Option | Why not |
|---|---|
| Default Nest feature modules | Fast to start, but violates the Dependency Rule. |
| Separate npm packages per layer | Stronger isolation, but too much setup for this project; the architecture check gives the same guarantee in CI. |
| dependency-cruiser | A mainstream tool for the same job, but it adds a dependency and its own rule language; the check we use has no dependencies and follows the same rule format as the client's. |

## Consequences

- Slightly more wiring code in `frameworks/`, paid once.
- The domain and use cases are testable without Nest or a database.
