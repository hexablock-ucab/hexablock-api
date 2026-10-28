# Contributing

## Workflow

1. Pick an issue from the project board and assign it to yourself.
2. Create a branch from `main`: `<type>/<short-slug>`, where type is `feat`, `fix`, `docs`, `test`, `refactor` or `chore`.
3. For substantial work, open a task document in `odd/tasks/` (see `odd/README.md`).
4. Commit in small, logical units following Conventional Commits.
5. Open a pull request with the template filled. CI must be green and a teammate must approve.
6. The PR is squash-merged; its title becomes the commit on `main`.

`main` is protected: no direct pushes, no force pushes, no merges without green CI.

## Setup after cloning

```bash
npm install        # installs commitlint and lefthook, and runs `lefthook install`
```

Requires Node.js 22 LTS. The database and environment variables are described in the README *Getting Started* section.

## Conventional Commits

```
<type>(<scope>): <imperative summary in English>

[optional body: why, not what]

[optional footer, e.g. Refs: FR-21, odd/tasks/0003-progress-sync.md]
```

Examples:

```
feat(auth): add JWT sign-in endpoint
feat(progress): sync player progress by gameId
fix(leaderboard): order ties by earliest submission
test(levels): add e2e tests for level definitions filtered by gameId
docs(openapi): document error responses
refactor(aop): extract logging decorator for use cases
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.
Scopes: `domain`, `application`, `adapters`, `frameworks`, `auth`, `progress`, `leaderboard`, `levels`, `openapi`, `aop`, `ci`, `docs`, `readme`, `deps`, `deps-dev`, `claude`, `release`, `workspace`. The scope is optional.

## Quality gates

Every rule below is a check that fails the build, so it does not depend on anyone remembering it.

| Gate | Tool | Runs on |
|---|---|---|
| Commit messages follow Conventional Commits | commitlint | `commit-msg` hook, CI |
| PR title follows Conventional Commits | action-semantic-pull-request | CI |
| Formatting | Prettier | CI (and `pre-commit` once task 0001 installs Prettier) |
| Lint with zero warnings, TypeScript `strict` | ESLint + typescript-eslint | CI |
| Clean Architecture import rules and no code for one specific `gameId` in the core | `tool/check-architecture.mjs` + `tool/architecture-rules.json` | `pre-push` hook, CI |
| Test names `should_<expected_result>_when_<condition>` | `tool/check-test-names.mjs` | `pre-push` hook, CI |
| Build, unit and integration tests pass | `npm run build`, `npm test`, `npm run test:e2e` | CI |
| Line coverage of at least 90% in the domain and the use cases (the total is reported, not enforced) | `tool/check-coverage.mjs` + `tool/quality-gates.json` | CI |

Run them locally with `npm run check:architecture`, `npm run check:test-names` and, after `npm test -- --coverage`, `npm run check:coverage`.

## Code review checklist

- The change traces to requirement IDs.
- Tests were written first where applicable and pass.
- No inner layer depends on an outer one; nothing specific to one `gameId` outside the level-schema validators.
- README, `docs/openapi.yaml` and diagrams are updated if affected.
- `AI_USAGE.md` has an entry for significant AI-assisted work.
