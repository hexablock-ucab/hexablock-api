# ADR-0004: Contract-first API with a generic model by gameId

- **Status:** Accepted
- **Date:** 2026-11-25 (proposed 2026-10-28)
- **Proposed by:** Eduard Velasco
- **Deciders:** Eduard Velasco, Ali Dahouk, Valentina Maza
- **Requirements:** C-22, C-26, FR-04, FR-12, FR-14, FR-21 to FR-25, NFR-02

## Context

The client and the API are developed in parallel by different people, and the design must let the client replace its backend without touching its engine or use cases (NFR-02). Variants differ in progress model (high score or levels with stars) and in level format.

## Decision

- **Contract first.** `docs/openapi.yaml` is written first and is the contract. Each endpoint change starts in that file, is reviewed in the PR and is consumed by the client's adapter; the code is checked against it (contract tests, ADR-0002), not the other way round. Breaking changes are flagged in the PR title (`feat(openapi)!:`).
- **One model for all variants.** `gameId` (`hexa-lines`, `hexa-fit`, `hexa-sort`, `hexa-merge`, …) is a path or query dimension in progress, leaderboard and level resources. One progress entry per user and `gameId` (FR-21).
- **The progress merge lives only in the API.** When the API receives progress, it merges it with the stored progress (the highest high score, the union of completed levels, the best result per level) and returns the result; the client stores what the API returns (FR-12, FR-21).
- **Generic level schema.** A level definition has common fields (`gameId`, `levelId`, `version`, `difficulty`, …) and a `payload` section specific to the `gameId`, validated by a validator registered for that `gameId` (Strategy). The format is `docs/level-format.md` with `docs/schemas/level.schema.json`. A new level-based variant registers one validator; no new endpoint or table.
- **`levels/` is the single source of the levels.** The files in `levels/` of this repository are the hand-designed levels: a script copies them into the client's assets, the client's CI fails if they differ, and the database is seeded from the same files (FR-04, FR-14). Each level is stored as the same document as its file, so a level downloaded on sync and a bundled level are read by the same adapter. The seed writes a level only when the file carries a greater `version` than the database, so it never overwrites a change made through the API.
- **Consistent errors.** One error format for every endpoint, produced by one exception filter from domain errors (FR-25a), and one success format (FR-25b).
- **Versioned base path** `/api/v1`.

## Consequences

- The client depends only on the contract, through its own adapter.
- Contract tests check the examples of `docs/openapi.yaml` against this API; Pact can be added on top (ADR-0002).
- Adding `gameId` values is configuration; adding a level-based variant is one validator class.
- A change to a level is a change to its file in `levels/`, or a `PUT` by an ADMIN (ADR-0006) that carries a greater `version`.
