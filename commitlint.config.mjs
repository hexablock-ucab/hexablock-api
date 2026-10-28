// Conventional Commits, enforced locally (lefthook commit-msg) and in CI.
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      2,
      'always',
      [
        'domain', 'application', 'adapters', 'frameworks',
        'auth', 'progress', 'leaderboard', 'levels', 'openapi', 'aop',
        'ci', 'docs', 'readme', 'deps', 'deps-dev', 'claude', 'release', 'workspace',
      ],
    ],
  },
};
