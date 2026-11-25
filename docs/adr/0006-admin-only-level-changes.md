# ADR-0006: Only an ADMIN creates or changes levels

- **Status:** Accepted
- **Date:** 2026-11-25
- **Proposed by:** Eduard Velasco
- **Deciders:** Eduard Velasco, Ali Dahouk, Valentina Maza
- **Requirements:** C-08, FR-14, FR-20, FR-23, NFR-06

## Context

FR-23 asks the API to return and update the level definitions. Players read levels, and the app downloads the new or changed ones on sync (FR-14). If any signed-in user could create or change a level, one player could break a level for everybody or change the per-level leaderboard. The assignment does not say who may change levels, so the team decides (question #5 of the team workspace).

## Decision

- Any client reads the levels, signed in or not.
- Only a user with the **ADMIN** role creates (`POST`) or changes (`PUT`) a level. The role is a claim of the JWT the API issues (FR-20); the server assigns it, never the request body (NFR-06d).
- `POST` and `PUT` are protected by the **authorization aspect**: a decorator around the use cases that checks the role (C-08, ADR-0003). The use cases themselves do not check roles.
- There is no screen to edit levels. An ADMIN changes a level by sending the same document as its file in `levels/` (ADR-0004), with a greater `version`.
- The first ADMIN account is created at start-up from environment variables, so no credential is ever in the repository (NFR-06e).

## Alternatives considered

| Option | Why not |
|---|---|
| Any signed-in user changes levels | One user could break a level or the per-level leaderboard for everyone. |
| No endpoint to change levels, only the files | FR-23 asks the API to update levels, and FR-14 needs levels to change without an app update. |
| An editing screen in the app | No requirement asks for it, and it would add screens and tests outside the scope. |
| An ADMIN account in a migration or a seed file | The password would be in the repository. |

## Consequences

- The authorization aspect is the first aspect the API needs, and the README's AOP section documents it.
- The integration tests cover a `PUT` by a player (403), by an ADMIN (200) and without a token (401).
- Answers question #5 of the team workspace (`hexablock-ucab/hexablock-workspace#5`), which is closed when this ADR is merged.
