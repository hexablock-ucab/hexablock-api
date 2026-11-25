# ADR-0003: Clean Architecture inside NestJS, by module, enforced by an architecture check

- **Status:** Accepted
- **Date:** 2026-11-25 (proposed 2026-10-28)
- **Proposed by:** Eduard Velasco
- **Deciders:** Eduard Velasco, Ali Dahouk, Valentina Maza
- **Requirements:** C-05, C-08, C-22, C-29, NFR-02, NFR-03

## Context

NestJS tutorials put controllers, services and ORM entities together per feature module, so the framework and the database leak into business rules. The assignment requires the four Clean Architecture layers and the Dependency Rule (§3.4). The professor also asked for one deployable service that is modular, not microservices (C-29, meeting of 2026-11-05). A tree with the layers on top leaves the modules without a boundary anyone can check.

## Decision

Modules first, then layers: each module has the four layers inside. This is the "package by component" option (Brown, in Martin, 2017, ch. 34), with the layers kept apart inside each component.

```
src/
├── main.ts                     # Composition root, with app.module.ts.
├── app.module.ts
├── shared/                     # What every module uses, with the same four folders:
│   ├── domain/                 #   common value objects, domain errors.
│   ├── application/            #   the generic use-case interface, the three aspects as use-case decorators.
│   ├── interface-adapters/     #   the single error filter, the success envelope.
│   └── frameworks/             #   the Prisma schema and client, configuration.
└── modules/
    ├── accounts/               # Users, registration, sign-in, roles. Owns `users`.
    ├── progress/               # Progress sync and the leaderboards. Owns `game_progress` and `level_progress`.
    └── levels/                 # Level definitions and the validator per gameId. Owns `levels` and `games`.
        ├── index.ts            # The module's only public entry.
        ├── domain/             # Layer 1: entities, value objects, domain errors. No framework.
        ├── application/        # Layer 2: use cases and the ports they use (repositories, token service, clock).
        ├── interface-adapters/ # Layer 3: controllers, DTOs, presenters, mappers, repository implementations.
        └── frameworks/         # Layer 4: the Nest module of this module, framework wiring.
```

- **One public entry per module.** A module uses another one only through `src/modules/<module>/index.ts`; it never imports a file inside another module. Each module owns its tables.
- **The Dependency Rule inside each module and in `shared/`:** the four layers and their import rules are the same everywhere.
- `tool/check-architecture.mjs`, with the rules in `tool/architecture-rules.json`, forbids any import from an inner layer to an outer one, any `@nestjs/*`, ORM or I/O import inside a `domain/` or `application/` folder, any import of another module that skips its `index.ts`, and any code path for one specific `gameId` outside `src/modules/levels/domain` (the level-schema validators). Rule paths use `*` for the module name, so a new module needs no rule change. It runs in the `pre-push` hook and in CI.
- Use cases are plain classes; Nest wires them in `frameworks/` with factory providers.
- Aspects (authorization, error policy, logging) are decorators that implement the same use-case interface and wrap the generic use case, so they apply to every `gameId`.

## Alternatives considered

| Option | Why not |
|---|---|
| Default Nest feature modules | Fast to start, but violates the Dependency Rule. |
| Layers on top with feature subfolders (`src/domain/levels`, `src/application/levels`, …) | It follows the Dependency Rule, but a module is spread over four folders and has no boundary the check can enforce; C-29 asks for modules. |
| Separate npm packages per layer or per module | Stronger isolation, but too much setup for this project; the architecture check gives the same guarantee in CI. |
| dependency-cruiser | A mainstream tool for the same job, but it adds a dependency and its own rule language; the check we use has no dependencies and follows the same rule format as the client's. |

## Consequences

- Slightly more wiring code in each module's `frameworks/` folder and in `app.module.ts`, paid once.
- The domain and use cases are testable without Nest or a database.
- Everything about one topic is in one folder, and the layers diagram (C-11b) still shows four concentric layers: each module is a slice of them.
- A module that needs another module's data asks through that module's `index.ts`, so the dependencies between modules are visible and few.

## References

- Martin, R. C. (2017). *Clean Architecture*. Prentice Hall. Ch. 22 (The Clean Architecture) and ch. 34 (The Missing Chapter, by Simon Brown: "package by component").
