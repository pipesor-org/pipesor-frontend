# Pipesor frontend Git workflow

The [organization contribution policy](https://github.com/pipesor-org/.github/blob/main/CONTRIBUTING.md) defines shared branching, commit and review rules. This guide documents their application to the frontend, including formatting constraints, scopes, CI and release status. [AGENTS.md](../AGENTS.md) points here; the [README](../README.md) covers setup and implemented scope.

## 1. Branch model (Trunk-Based Development)

Follow the organization branch model. Frontend branch names can use areas such as `feature/incident-queue-filters` or `fix/sidebar-focus`.

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
- Keep the header within 72 characters.
- Body and footers are optional and separated from the subject by one blank line.

The `commit-msg` hook is managed by Lefthook and validates messages with Commitlint running on Bun. Enable it once per clone using the [README setup](../README.md#requirements-and-getting-started). CI validates every PR commit and the latest commit pushed to `main`, including the final squash commit. Imperative wording and the meaning of scopes still require review.

### Allowed types

The [organization policy](https://github.com/pipesor-org/.github/blob/main/CONTRIBUTING.md#commits--angular-style-conventional-commits) maintains the allowed types and their meanings. Frontend-specific scopes and examples follow.

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
- GitHub defaults squash commits to the PR title and description. Keep the title conventional
  and put migration notes and any `BREAKING CHANGE:` footer in the PR description,
  even when they already appear in individual commits. CI checks the title and the
  combined squash message, including after edits to the PR. Preserve that message
  when merging; the final commit is checked again on `main`.
- Keep PR titles within **65 characters**: the squash commit appends ` (#NN)`, and the
  72-character header limit is enforced again on `main`. CI rejects longer PR titles before merge
  (a longer header once failed the `main` run, as happened with #39).
- Pass the repository's required checks and prefer squash merging. Do not force-push shared branches or branches under review by others.
- Do not commit build output, credentials, `.env` files, or machine-specific configuration.

## 4. Releases and deployment

The [organization contribution guide](https://github.com/pipesor-org/.github/blob/main/CONTRIBUTING.md) describes the target staged promotion and exceptional hotfix process. On pushes to `main`, CI publishes the verified dashboard image once to the private GHCR package and records `candidate.json` (digest, source SHA, CI run/attempt). PR builds are verified but not published. The image is environment-independent (runtime `/config.js`), so the same digest is promoted through environments by the pipesor-iac Terraform roots; rollback is a reviewed plan with an earlier digest. [Release candidate](../.github/workflows/release.yml) is hard-disabled; when activated it names an existing digest with a SemVer tag and GitHub Release without rebuilding. Approval gates beyond DEV are not configured yet.

If production cannot take the head of `main`, merge the fix to `main` first, then cherry-pick it with `-x` onto a short-lived hotfix branch from the production tag. Follow the organization hotfix promotion and approval process and delete the branch after release.

## 5. Quick reference

```bash
git switch main
git pull --ff-only
git switch -c feature/incident-queue-filters
```

Run `bun run test:hooks`, `bun run typecheck`, `bun run lint`, and `bun run build` before opening the PR. CI runs typecheck, lint and build on PRs and pushes to `main`; the commit-message cases are enforced by the shared conventions job.
