# Pipesor frontend Git workflow

Single source of truth for branching, commits, Pull Requests and releases in this repository. [AGENTS.md](../AGENTS.md) states the mandatory rule that points here; the [README](../README.md) covers setup and implemented scope. Do not maintain a second, conflicting description elsewhere.

## 1. Branch model (Trunk-Based Development)

`main` is the shared trunk and should remain healthy and releasable. Branch from `main` for each small change, open a Pull Request back into `main`, and delete the branch after merging. Use short-lived names such as `feature/incident-queue-filters` or `fix/sidebar-focus`.

Do not push directly to `main`, maintain a long-lived `develop` branch, or create routine release branches. During the migration, integrate the existing work on `develop` into `main` before changing the default branch; do not discard its history or changes.

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
docs(git-workflow): clarify trunk-based development
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

- Open a PR into `main` for every change, with a Conventional Commit title. Keep it small and focused.
- Describe the change, link the task, report checks and anything not verified. Resolve review comments and obtain review before merging.
- Pass the repository's required checks and prefer squash merging. Do not force-push shared branches or branches under review by others.
- Do not commit build output, credentials, `.env` files, or machine-specific configuration.

## 4. Releases and deployment

The [organization contribution guide](https://github.com/pipesor-org/.github/blob/main/CONTRIBUTING.md) describes the target staged promotion and exceptional hotfix process. The future Azure-based frontend deployment has not been implemented. Its eventual process should build an immutable artifact once, promote the same artifact through environments with recorded results and approvals, and assign a protected SemVer release tag without rebuilding. Do not claim those controls exist until configured.

If production cannot take the head of `main`, merge the fix to `main` first, then cherry-pick it with `-x` onto a short-lived hotfix branch from the production tag. Follow the organization hotfix promotion and approval process and delete the branch after release.

## 5. Quick reference

```bash
git switch main
git pull --ff-only
git switch -c feature/incident-queue-filters
```

Run `bun run typecheck`, `bun run lint`, and `bun run build` before opening the PR. The Quality workflow runs these checks on PRs and pushes to `main`.
