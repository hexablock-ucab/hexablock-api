# ADR-0004: Contract-first API with a generic model by gameId

- **Status:** Proposed — to review in the first team meeting
- **Date:** 2026-10-28
- **Proposed by:** Eduard Velasco
- **Deciders:** —
- **Requirements:** C-22, C-26, FR-21 to FR-25, NFR-02

## Context

The client and the API are developed in parallel by different people, and the design must let the client replace its backend without touching its engine or use cases (NFR-02). Variants differ in progress model (high score or levels with stars) and in level format.

## Decision

- **Contract first.** Each endpoint change starts in the OpenAPI document. The generated `docs/openapi.yaml` is committed, reviewed in the PR and consumed by the client's adapter. Breaking changes are flagged in the PR title (`feat(openapi)!:`).
- **One model for all variants.** `gameId` (`hexa-lines`, `hexa-fit`, `hexa-sort`, `hexa-merge`, …) is a path or query dimension in progress, leaderboard and level resources. One progress entry per user and `gameId` (FR-21).
- **Generic level schema.** A level definition has common fields (`gameId`, `levelId`, `version`, `difficulty`) and a `payload` section specific to the `gameId`, validated by a validator registered for that `gameId` (Strategy). A new level-based variant registers one validator; no new endpoint or table.
- **Consistent errors.** One error format for every endpoint, produced by one exception filter from domain errors.
- **Versioned base path** `/api/v1`.

## Consequences

- The client depends only on the contract, through its own adapter.
- Contract tests (Pact) can check client expectations against this API.
- Adding `gameId` values is configuration; adding a level-based variant is one validator class.
