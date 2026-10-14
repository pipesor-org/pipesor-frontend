# Pipesor frontend Git workflow

Single source of truth for branching, commits, Pull Requests and releases in this repository. [AGENTS.md](../AGENTS.md) states the mandatory rule that points here; the [README](../README.md) covers setup and implemented scope. Do not maintain a second, conflicting description elsewhere.

## 1. Branch model (Git Flow)

Two long-lived branches plus short-lived working branches. Never commit directly to `main` or `develop`; every change reaches them through a Pull Request.

| Branch | Created from | Merged into | Purpose |
| --- | --- | --- | --- |
| `main` | — | — | Stable baseline and releases. Always reproducible and releasable. |
| `develop` | `main` (initial) | — | Integration branch for the next release. Receives completed features. |
| `feature/*` | `develop` | `develop` | A single feature, fix or preparatory change. |
| `release/*` | `develop` | `main` **and** `develop` | Stabilizes and version-stamps an upcoming release. |
| `hotfix/*` | `main` | `main` **and** `develop` | Urgent production fix that cannot wait for the next release. |

Rules:

- `feature/*` is created from and merged back into `develop`.
- `release/*` is created from `develop` and must be merged into **both** `main` and `develop` (so the integration branch receives the release commits and any release-only fixes).
- `hotfix/*` is created from `main` and must be merged into **both** `main` and `develop` (so the fix is not lost on the next release).
- Keep branches short-lived and scoped to one reviewable change. Delete a branch after it is merged.
- `release/*` should contain only release stabilization: version bumps, changelog, documentation and confirmed bug fixes — no new features.
- Use lowercase, hyphen-separated names that describe the work, for example `feature/incident-queue-filters`, `release/0.1.0`, `hotfix/sidebar-focus-trap`.

`main` holds tagged releases only. Do not rewrite or discard published history.

## 2. Conventional Commits (Angular convention)

Every commit message uses the Conventional Commits format:

```text
<type>(<optional scope>): <description>

[optional body]

[optional footer(s)]
```

- **type** — required, lowercase.
- **scope** — optional, lowercase, names the affected area.
- **description** — required, imperative, present tense, no trailing period (for example "add", not "added" or "adds").
- Body and footers are optional and separated from the subject by one blank line.

### Allowed types

| Type | Use for |
| --- | --- |
| `feat` | A new user-facing capability. |
| `fix` | A bug fix. |
| `docs` | Documentation only. |
| `style` | Formatting/whitespace that does not change behavior (not CSS visual changes). |
| `refactor` | A code change that neither fixes a bug nor adds a feature. |
| `perf` | A performance improvement. |
| `test` | Adding or correcting tests. |
| `build` | Build system, tooling or dependency changes that affect the bundle. |
| `ci` | Continuous integration configuration. |
| `chore` | Maintenance that does not fit the types above. |
| `revert` | Reverts a previous commit. |

### Optional scopes

Scopes are optional but recommended, and must match the affected area. Current areas include:

`operations`, `sidebar`, `incident`, `i18n`, `ui`, `a11y`, `routing`, `build`, `deps`, `docs`, `agents`, `release`.

Examples:

```text
feat(operations): add severity filter to the active incidents queue
fix(sidebar): keep the profile popover inside the viewport
docs(git-workflow): document release branch merge targets
chore(deps): bump zod to 4.6.7
```

### Breaking changes

A breaking change is marked either with `!` after the type/scope, or with a `BREAKING CHANGE:` footer (or both):

```text
feat(routing)!: move operations queues to the query-string route

BREAKING CHANGE: /operations/active-incidents and /operations/needs-validation
now redirect to /operations?queue=active and ?queue=validation.
```

A breaking change commits the author to explaining the migration path in the body or footer.

## 3. Pull Requests

- Open a Pull Request for every change; never push directly to `main` or `develop`.
- Target branch follows the branch model: `feature/*` → `develop`, `release/*` and `hotfix/*` → `main` (then back-merge into `develop`).
- The Pull Request **title** follows the Conventional Commits format, because squash-merged titles become the commit message.
- Keep each Pull Request small, single-purpose and independently reviewable. Avoid unrelated refactors.
- Fill in: what changed and why, linked issue/task when available, and the checks actually run (`bun run typecheck`, `bun run lint`, `bun run build` where applicable) with their results. State explicitly what was **not** verified (browser, Paper/design comparison, alternate locale).
- Resolve review comments before merge; keep the branch up to date with its base.
- Do not commit build output, credentials, `.env` files, or machine-specific configuration.

### Merge strategies

| Into | Strategy | Why |
| --- | --- | --- |
| `feature/*` → `develop` | Squash merge | Keeps `develop` history linear and one-commit-per-feature; the PR title becomes the commit subject. |
| `release/*` → `main` | Merge commit (`--no-ff`) | Preserves the release boundary and its history on the stable branch. |
| `release/*` → `develop` | Merge commit (`--no-ff`) | Brings release-only fixes back into integration. |
| `hotfix/*` → `main` | Merge commit (`--no-ff`) | Preserves the hotfix boundary; then tag the release. |
| `hotfix/*` → `develop` | Merge commit (`--no-ff`) | Prevents the fix from regressing on the next release. |

Do not rebase or force-push shared branches (`main`, `develop`) or branches under review by others.

## 4. Releases and tags

- Releases are cut from `main` after a `release/*` branch is merged.
- Tag every release on `main` with a SemVer tag prefixed with `v`, for example `v0.1.0`.
- Use annotated tags (`git tag -a v0.1.0 -m "Release v0.1.0"`) so the tag carries a message and author.
- A tag marks a released baseline and must not be moved after publication; ship a new patch release instead.
- Before tagging, the release branch owns the version bump in `package.json` and any updated release documentation.
- Until a release process is formally established, `0.y.z` versions remain pre-1.0 and `main` may track the initial baseline.

## 5. Quick reference

```bash
# Start a feature
git switch develop
git switch -c feature/incident-queue-filters

# Start a release from integration
git switch develop
git switch -c release/0.1.0

# Start an urgent fix from the stable baseline
git switch main
git switch -c hotfix/sidebar-focus-trap
```

Commit, push the branch, open a Pull Request against the correct base, and merge only after review. This repository currently has no CI pipeline, so reviewers rely on the checks reported in the Pull Request.
