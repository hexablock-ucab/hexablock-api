## Summary

<!-- What changes and why, in two or three sentences. -->

## Traceability

- Requirements: <!-- e.g. FR-21, C-24 -->
- Task document: <!-- odd/tasks/NNNN-slug.md, or "small change" -->
- ADRs: <!-- if any -->

## Evidence

<!-- Test output, request/response examples, verifier verdict. -->

## Checklist

- [ ] Tests written first where applicable; all pass locally and in CI (quality gates: architecture, test names, lint, format, build, coverage).
- [ ] No inner layer depends on an outer one; nothing specific to one `gameId` outside the level-schema validators.
- [ ] `docs/openapi.yaml` regenerated if an endpoint changed; breaking changes flagged.
- [ ] README / diagrams updated if affected.
- [ ] `AI_USAGE.md` entry added for significant AI-assisted work.
- [ ] Third-party code or assets cited in code and in `THIRD_PARTY_NOTICES.md`.
- [ ] PR title follows Conventional Commits (it becomes the squash commit).
