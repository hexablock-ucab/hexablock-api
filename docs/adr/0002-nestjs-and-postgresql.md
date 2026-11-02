# ADR-0002: NestJS (TypeScript) and PostgreSQL for the backend

- **Status:** Proposed — to review in the first team meeting
- **Date:** 2026-10-28
- **Proposed by:** Eduard Velasco
- **Deciders:** —
- **Requirements:** C-02, C-24, C-26, FR-20 to FR-25, NFR-06

## Context

The backend needs JWT authentication, a generic data model by `gameId`, OpenAPI documentation, consistent errors, integration tests over HTTP and, ideally, contract tests. The course examples and exams use TypeScript, so the whole team already reads it.

## Decision

Use NestJS on Node.js LTS with TypeScript in `strict` mode, PostgreSQL as the database, Jest + supertest for tests, `@nestjs/swagger` to generate the OpenAPI document, and Pact (pact-js) for provider verification.

NestJS is a **framework detail** (layer 4): its decorators and modules stay out of `src/domain` and `src/application` (ADR-0003).

## Alternatives considered

| Option | Why not |
|---|---|
| Dart (shelf / dart_frog) | One language with the client, but weaker OpenAPI, auth and contract-testing tooling. |
| Express without a framework | Less structure; DI, validation and Swagger would be hand-built. |
| Firebase | Hides the backend architecture the course evaluates. |

## Consequences

- TypeScript generics are erased at runtime; the generic model by `gameId` relies on validation at the boundary (DTO and level-schema validators).
- NestJS's own interceptors are **not** our AOP mechanism: the assignment asks for aspects built with SOLID techniques (decorators/proxies around use cases), see C-08.
- The ORM (Prisma, TypeORM or Drizzle) is chosen in task 0001 and recorded in a follow-up ADR.
- Where the API and the database run (local only, or a public host) depends on a question for the professor: whether the backend must be deployed for the defense and the release.
