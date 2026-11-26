# AI Usage Documentation

This file documents every significant use of AI tools in this repository, as the assignment requires (§7.2). The team is responsible for all code and documents, whether or not AI assisted them, and can explain every part of them.

## Tools

| Tool | Version / model | Role in the workflow |
|---|---|---|
| Claude Code | 2.1.312 — Sonnet 5.5 (main session, exploration, verification, review), Opus (implementation sub-agent) | Coding agent in the terminal: exploration, test-first implementation, independent verification and design review. |
| Claude (claude.ai, agent session) | Configured model: Claude Opus 5.5 | Course research, requirement analysis, repository and tooling setup, documentation drafts. |
| Context7 MCP | — | Up-to-date library documentation (NestJS, Jest, Pact). |

## Workflow

The team works with **ODD (Organic Driven Development)** and requirement traceability ([ADR-0005](docs/adr/0005-workflow-odd-with-traceability.md)):

1. Requirements live in [docs/requirements.md](docs/requirements.md) with stable IDs.
2. Each substantial task has one document in [odd/tasks/](odd/tasks/), with specs linked to those IDs and a verbatim log of the prompts.
3. Claude Code delegates to sub-agents defined in [.claude/agents/](.claude/agents/): `odd-explore` (read-only mapping), `odd-worker` (bounded implementation, test first, no commits), `odd-verify` (independent verification per spec) and `architecture-reviewer` (independent design review).
4. Deterministic guardrails: git hooks (Conventional Commits and checks before push), Claude Code hooks (no commits on `main`, no force pushes or skipped hooks, format and analysis after each edit, a reminder to compact long sessions), CI on every pull request and a protected `main`.
5. A team member reviews every AI-assisted change in a pull request, and significant uses are logged below.

Project rules for agents: [AGENTS.md](AGENTS.md) and [CLAUDE.md](CLAUDE.md).

### What each entry records

- **One entry per significant AI use**, not one per prompt. The full prompts of a task stay in its task document in [odd/tasks/](odd/tasks/).
- **Prompt policy:** prompts that led to a design decision or exposed an AI error are quoted **verbatim**, in their original language. Routine prompts are summarized as a faithful paraphrase.
- **Verification:** each entry names the tests, commands or reviews that checked the AI's output.
- **Traceability:** each entry names its pull request. AI-assisted commits carry a `Co-Authored-By` trailer that names the model, so the history shows which commits had AI assistance.
- **Completion:** an entry is complete before its pull request is merged; no field stays pending. If something is still open, the entry says what and who closes it.
- **AI-generated content** (for example level definitions or seed data): the entry also states how many items were generated, how each one was checked and what was adjusted by hand.

## Usage log

<!-- Entries are added with the log-ai-usage skill. Newest last. -->

| Date | Entry |
|---|---|
| 2026-10-27 to 2026-10-28 | [Project foundation: course analysis, repositories, tooling and documentation](#2026-10-27-to-2026-10-28--project-foundation-course-analysis-repositories-tooling-and-documentation-setup-no-task-document) |
| 2026-11-08 | [Professor's answers of 2026-11-05 applied to the requirements](#2026-11-08--professors-answers-of-2026-11-05-applied-to-the-requirements-docs-no-task-document) |
| 2026-11-09 | [README and AI usage log adjusted after reviewing reference repositories](#2026-11-09--readme-and-ai-usage-log-adjusted-after-reviewing-reference-repositories-docs-no-task-document) |
| 2026-11-25 | [Domain model rules without DDD](#2026-11-25--domain-model-rules-without-ddd-docs-no-task-document) |

### 2026-10-27 to 2026-10-28 — Project foundation: course analysis, repositories, tooling and documentation (setup; no task document)

- **Author:** Eduard Velasco
- **Tool / model:** Claude (claude.ai agent session, configured model Claude Opus 5.5) with access to the course platform, GitHub and a cloud workspace; Claude Code 2.1.312 on Eduard's computer to install tools and verify the setup.
- **Task:** Read Module 7 of the course (assignment, architecture classes, readings); choose an AI workflow; create the organization's repositories with quality gates, agent rules, sub-agents, skills and hooks; write the requirement catalog, the proposed ADRs, the ODD template and the documentation skeletons (C-03, C-04, C-09, C-10, C-13, C-18).
- **Prompts (faithful paraphrase; originals in Spanish):**
  - "Access Module 7, download and analyze everything, convert it to Markdown if that saves tokens, and tell me how we should proceed before doing anything."
  - "Review my installed skills and plugins: which to use, which conflict, and what else we need for a professional result that fully meets the assignment."
  - "Analyze a classmate's agent kit and workflow (explore / worker / verify agents) and tell me what to adopt."
  - "Shouldn't the requirements, architecture, diagrams and use cases be decided by us, step by step? Redo it properly, ask me everything, assume nothing."
  - "Are you sure you classified functional, non-functional and constraints correctly, with the right wording and the required level of detail?"
  - "Keep a list of questions for the professor at all times: only real ambiguities he can settle, not team decisions."
- **Result:** The course material in Markdown, split by chapter; three repositories (client, API, private team workspace) with CI, commit and architecture checks, protected `main` and Dependabot; agent rules, ODD sub-agents, skills and hooks in both project repositories; a requirement catalog traced to the assignment; ADR-0000 to ADR-0005 as *Proposed*; ODD template and first task; README and documentation skeletons; questions for the professor as issues of the team workspace.
- **Team modifications:** Eduard stopped the first version and required that every architecture choice stay *Proposed* until the team decides; that the repositories be recreated so the history starts clean with team authorship; that the work be split into small pull requests reviewed one by one; that the three repositories sit side by side in one project folder; that the agent kit be written in the team's own words; and that the requirement catalog be reclassified and rewritten.
- **Errors and corrections:**
  - The first commits were authored as the AI and had the attribution line glued to the subject — detected by Eduard; the repositories were recreated.
  - Proposed architecture was written as binding rules — detected by Eduard; marked *Proposed*.
  - The first folder layouts put the repositories inside the course folder and later nested them — detected by Eduard; replaced by three sibling repositories.
  - Nine requirements were labelled non-functional although they were design or verification constraints, and several rows bundled many requirements — detected after Eduard questioned the classification; the catalog was rewritten (one requirement per row, `shall` and EARS wording, ISO/IEC 25010 tags).
  - Commit bodies longer than 100 characters failed commitlint in CI — detected by the `commits` check; the pull request was recreated with wrapped messages instead of force-pushing.
  - Dependabot commits failed commitlint — detected in CI; commitlint now ignores Dependabot's sign-off line and updates are grouped.
- **Lessons:** Let the AI prepare infrastructure and drafts, but keep design decisions explicit, reviewed and recorded in ADRs. Review commit metadata, not only file contents. Ask the AI to check its own output against a named standard; it found real defects when asked.

### 2026-11-08 — Professor's answers of 2026-11-05 applied to the requirements (docs; no task document)

- **Author:** Eduard Velasco
- **Tool / model:** Claude (claude.ai agent session, configured model Claude Opus 5.5).
- **Task:** Review the automatic transcription of the team's meeting with the professor against its context, record each answer in the team's question tracker, and apply the confirmed answers to the requirement catalog, `AGENTS.md` and the affected ADRs (C-05, C-06, C-08, C-11, C-17, C-18, C-27 to C-33, FR-04, FR-12, FR-14, FR-15, NFR-02).
- **Prompts (faithful paraphrase; original in Spanish):**
  - "Here are the transcription and the audio of everything the professor told us in the meeting; the transcription has errors. Make every change needed, record those decisions and arrange the next steps, very professionally, without inventing anything."
- **Result:** A revised transcription with the doubtful passages marked for the team to check against the audio; seventeen answered questions closed with the professor's words; new constraints C-28 to C-33 and FR-15; updated C-05, C-06, C-08, C-11, C-17, C-18, C-27, FR-04, FR-12, FR-14 and NFR-02.
- **Team modifications:** Pending: the team reviews the catalog before it becomes *Baseline*.
- **Errors and corrections:** The AI could not run speech recognition on the audio in its environment, so it corrected the existing transcription from context instead of producing a new one, and listed the passages a person must check by listening (for example, whether the AOP answer refers only to the aspect).
- **Lessons:** Quote the professor's exact words next to each decision, and keep the AI's interpretation in a separate column, so the team can tell what was said from what was inferred.

### 2026-11-09 — README and AI usage log adjusted after reviewing reference repositories (docs; no task document)

- **Author:** Eduard Velasco
- **Pull request:** #14, paired with hexablock-app #15
- **Tool / model:** Claude Code (VS Code extension), model Claude Opus 5.5.
- **Task:** Compare the reference repositories from the previous semester that the course shared with this project's documents and with this semester's assignment, then apply the README and AI usage changes the team approved (C-09, C-10, C-18).
- **Prompts (faithful paraphrase; originals in Spanish):**
  - "Analyze in depth the reference repositories the professor sent and compare them with what the team has or plans. Describe each topic with evidence, classify each finding, and list proposed changes for the README and AI_USAGE.md and points for the team to review. Do not copy text or code from those repositories, do not invent, and do not assume something is right because they did it."
  - "I approve everything in the first list; make the pull requests."
- **Result:** An internal comparison kept in the team workspace (not in this repository) and, in this pull request: a "Must not depend on" column in the architecture table, the endpoint table columns, the *Why Decorator* note, and the *Deployment* and *Team* sections of the README; the "What each entry records" rules, the entry index and the running error table in this file; the *Verification* field and the completion rule in the `log-ai-usage` skill, the pull request template and `CONTRIBUTING.md`.
- **Team modifications:** Eduard reviewed the proposed changes and approved them; the design points the comparison raised were left for the team to decide in the ADRs and design tasks.
- **Errors and corrections:** None detected in this change.
- **Verification:** Each edit was applied by exact text replacement that fails if the original text is not found once; the diff was reviewed in the pull request, and commitlint and CI run on it.
- **Lessons:** Reference projects help with documentation and process, but every finding was checked against this semester's assignment before adopting it; none of them had a generic engine to learn from.

### 2026-11-16 — Level format for Hexa Fit and Hexa Sort (D3, [odd/tasks/0002-level-format.md](odd/tasks/0002-level-format.md))

- **Author:** Valentina Maza
- **Tool / model:** Claude (claude.ai agent session, configured model Claude Opus 5.5).
- **Task:** Draft the level format that the rules of `hexablock-app` #13 leave to D3: one JSON Schema for both variants, one example per variant and the rules the schema cannot check (FR-04, FR-14, FR-23, FR-40, NFR-02, NFR-05).
- **Prompts (faithful paraphrase; original in Spanish):**
  - "OK, done. Can't we keep going?" (after setting up Flutter, with D3 as the next task of the plan)
- **Result:** `docs/level-format.md`, `docs/schemas/level.schema.json` and two example levels. Checked with Ajv 8 and a script for the geometric rules: both examples valid, nine invalid variants rejected.
- **Team modifications:** Pending: the team reviews the specs, the seed stored in the level and the 1–5 difficulty scale.
- **Errors and corrections:** None found yet.
- **Lessons:** Let the rules document say *what* a level needs and keep the format to *how*; then each field traces to a rule.

### 2026-11-16 — The 15 Hexa Fit and 10 Hexa Sort levels ([odd/tasks/0003-hand-designed-levels.md](odd/tasks/0003-hand-designed-levels.md))

- **Author:** Valentina Maza
- **Tool / model:** Claude (claude.ai agent session, configured model Claude Opus 5.5). The professor allows generating levels with AI if it is recorded (meeting of 2026-11-05, answer 18).
- **Task:** Design the levels the assignment asks for (FR-46, FR-55) in the format of task 0002, with progressive difficulty.
- **Prompts (faithful paraphrase; original in Spanish):**
  - "Yes!!" (answering the offer to design the 15 Hexa Fit and 10 Hexa Sort levels now, each Hexa Fit level with a solution checked by a script)
- **Result:** 25 level files, a summary and a preview in `levels/`. Hexa Fit: candidates generated, their solutions counted with an exact-cover solver, one picked per level (unique solution from level 8). Hexa Sort: a simulator of SORT-1 to SORT-5 with a greedy player, 400 games per level, set the thresholds and checked that each level can be won.
- **Team modifications:** Pending: the team reviews the levels; Valentina play-tests levels 1, 8 and 15.
- **Errors and corrections:** The first Hexa Fit draft made the player rotate pieces up to 5 steps and jumped from many solutions to one at level 5; detected in the generator's report; pieces now arrive 1 to 3 steps away, and the solution count falls more gradually (levels 5–7 have about 4 solutions).
- **Lessons:** Generate many candidates and choose by a measurable criterion (solution count, simulated win rate) rather than designing one level at a time; the numbers make "progressive difficulty" checkable.

### 2026-11-24 — Level files checked in CI ([odd/tasks/0004-level-check.md](odd/tasks/0004-level-check.md))

- **Author:** Valentina Maza
- **Tool / model:** Claude (claude.ai agent session, configured model Claude Opus 5.5).
- **Task:** Turn the level checks of tasks 0002 and 0003 into a repository tool that runs in CI and before a push (FR-23, FR-43, C-13).
- **Prompts (faithful paraphrase; original in Spanish):**
  - "Yes" (answering the offer to put the level check in the repository and CI).
- **Result:** `tool/check-levels.mjs` with nine invalid fixtures, `npm run check:levels`, a CI step and a pre-push command.
- **Team modifications:** Pending review.
- **Errors and corrections:** None found.
- **Verification:** the 27 files pass; breaking one Hexa Fit solution and one Hexa Sort difficulty makes the check fail; each fixture fails for its own rule.
- **Lessons:** A check that was only run once in a chat is not evidence for the future; a check in CI with fixtures that must fail keeps proving itself.

### 2026-11-25 — Domain model rules without DDD (docs; no task document)

- **Author:** Eduard Velasco
- **Pull request:** this pull request, paired with the `docs/domain-model-without-ddd` pull request of hexablock-app
- **Tool / model:** Claude Code (VS Code extension), model Claude Opus 5.5.
- **Task:** Add the domain modeling rules the team keeps, without DDD tactical patterns, before the API's domain model (D4) is written (C-05, C-32, NFR-03).
- **Prompts (faithful paraphrase; originals in Spanish):**
  - "Read task 0005 and the change plan of 2026-11-24 (sections 1, 2.3 and 2.9). Without asking me between steps, and stopping only if something contradicts the assignment: finish T7 in api #22 and push; do the api half of the `docs/domain-model-without-ddd` pair with its pull request open; when api #21 merges, resolve the `AI_USAGE.md` conflict in api #22. Follow AGENTS.md. Do not merge anything."
- **Result:** A *Domain model* subsection in `AGENTS.md` §4 (one name per concept, behavior with its data, no setters, read-only getters, value objects, classes with identity, Prisma models outside the model, and a table of roles without DDD); a *Stereotypes and UML style* section in `docs/diagrams/README.md` with two stereotypes and read-only values drawn as `{readOnly}` attributes; a *Domain model* question in the `architecture-reviewer` agent. The wording mirrors the app half, with the API's own examples.
- **Team modifications:** The team decided on 2026-11-13 to leave DDD out and on 2026-11-24 to allow read-only getters; the AI wrote the text from those decisions and the change plan. The API keeps the rule "no setters, changes only through named operations" and leaves out the app's rules for immutable game state, Memento, the random generator and Observer, which no API requirement needs. The team reviews the wording in this pull request.
- **Errors and corrections:** None detected in this change.
- **Verification:** The cited chapters were checked in the team's library before citing them (Martin 2017, ch. 20; Esposito 2024, ch. 6). Every edit replaced text found exactly once; the diff was reviewed, and commitlint and CI run on it.
- **Lessons:** A rule set is easier to defend when each rule names the requirement it serves. The DDD rules of api #15 were reverted before api #14 merged, so they never reached `main`; this entry records the rules that replace them.

## Critical evaluation

- **Approximate share of code with AI assistance:** TODO (updated at the end of the project).
- **Cases where the AI was wrong or suboptimal, and how we detected them:** the *Errors and corrections* field of each entry has the details. The table below collects them and is updated at every milestone, not only at the end.

| Date | What the AI got wrong | How it was detected | Category |
|---|---|---|---|
| 2026-10-28 | First commits authored as the AI, with the attribution line glued to the subject | Eduard reviewed the commit metadata | Process |
| 2026-10-28 | Proposed architecture written as binding rules | Eduard's review | Design |
| 2026-10-28 | Repository folders placed inside the course folder, then nested | Eduard's review | Process |
| 2026-10-28 | Nine requirements misclassified as non-functional; rows bundling several requirements | Eduard questioned the classification | Requirements |
| 2026-10-28 | Commit bodies over 100 characters | The `commits` check in CI | Tooling |
| 2026-10-28 | Dependabot commits rejected by commitlint | CI | Tooling |
| 2026-11-08 | Could not run speech recognition on the meeting audio; corrected the existing transcription from context instead | The AI reported the limitation itself and listed the passages to check by ear | Tooling |
- **Impact on productivity and quality:** TODO.

## Effective prompts

Prompts that produced the best results, kept as reusable examples.

- "Are you sure about X? Check it against <standard or source> and tell me what is wrong before changing anything." — made the AI find and fix defects in its own catalog.
- "Ask me everything that is not explicit; assume nothing." — turned silent assumptions into explicit decisions.
