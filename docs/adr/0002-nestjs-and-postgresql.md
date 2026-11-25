# ADR-0002: NestJS (TypeScript) and PostgreSQL for the backend

- **Status:** Accepted
- **Date:** 2026-11-25 (proposed 2026-10-28)
- **Proposed by:** Eduard Velasco
- **Deciders:** Eduard Velasco, Ali Dahouk, Valentina Maza
- **Requirements:** C-02, C-24, C-26, C-28, FR-20 to FR-25, NFR-06

## Context

The backend needs JWT authentication, a generic data model by `gameId`, OpenAPI documentation, consistent errors, integration tests over HTTP and, ideally, contract tests. The course examples and exams use TypeScript, so the whole team already reads it.

## Decision

Use NestJS on Node.js LTS with TypeScript in `strict` mode, PostgreSQL as the database, Prisma as the ORM, Argon2id to hash passwords, and Jest + supertest for tests.

- **Contract tests (C-26):** the request and response examples are validated against `docs/openapi.yaml`, which is the contract (ADR-0004). Pact (pact-js) is an extra if time allows.
- **Prisma** is a detail of the outer layer: its schema, client and models live in the `frameworks/` and `interface-adapters/` folders, and each repository adapter converts Prisma models to domain objects and back. Replacing the database or the ORM changes only those adapters and the composition root (C-31, NFR-02).
- **Argon2id** is the password hash OWASP recommends first. It sits behind a port (`PasswordHasher`), so the domain and the use cases never import it (NFR-06a).

NestJS is a **framework detail** (layer 4): its decorators and modules stay out of every `domain/` and `application/` folder (ADR-0003).

## Alternatives considered

| Option | Why not |
|---|---|
| Dart (shelf / dart_frog) | One language with the client, but weaker OpenAPI, auth and contract-testing tooling. |
| Express without a framework | Less structure; DI, validation and Swagger would be hand-built. |
| Firebase | Hides the backend architecture the course evaluates. |
| TypeORM or Drizzle | Both work; Prisma has the clearest migrations and generated types, and its models stay in the outer layer either way. |
| bcrypt | Still acceptable, but OWASP lists Argon2id first, and bcrypt truncates passwords longer than 72 bytes, below the 128 characters NFR-06b allows. |
| Pact as the only contract test | It needs a broker or shared pact files between two repositories; validating examples against `docs/openapi.yaml` checks the same contract with the file both repositories already share. |

## Consequences

- TypeScript generics are erased at runtime; the generic model by `gameId` relies on validation at the boundary (DTO and level-schema validators).
- NestJS's own interceptors are **not** our AOP mechanism: the assignment asks for aspects built with SOLID techniques (decorators/proxies around use cases), see C-08.
- Integration tests create the database by running the Prisma migrations, never by synchronizing the schema (C-24a).
- The API and the database must run on a public cloud host for the delivery and the defense (C-28). The provider is chosen in a later ADR.
