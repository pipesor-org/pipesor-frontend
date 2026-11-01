#!/bin/sh
set -eu

root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$root"
message=$(mktemp)
trap 'rm -f "$message"' EXIT HUP INT TERM

for type in build chore ci docs feat fix perf refactor revert style test; do
  printf '%s: explain setup\n' "$type" > "$message"
  lefthook run commit-msg "$message"
done

printf 'feat(ui): add navigation\n\nOptional body\n' > "$message"
lefthook run commit-msg "$message"

printf 'feat(api)!: replace endpoint\n' > "$message"
lefthook run commit-msg "$message"

PR_TITLE='feat(api): replace endpoint'
PR_BODY='## Migration

BREAKING CHANGE: use the new endpoint'
printf '%s\n' "$PR_TITLE" | bun run commitlint
printf '%s\n\n%s\n' "$PR_TITLE" "$PR_BODY" | bun run commitlint
if printf '%s\n\n%s\n' 'update api' "$PR_BODY" | bun run commitlint >/dev/null 2>&1; then
  printf '%s\n' 'Unexpectedly accepted an invalid squash title' >&2
  exit 1
fi

printf 'feat(api)!: replace endpoint\n\nBREAKING CHANGE: use the new endpoint\n' > "$message"
lefthook run commit-msg "$message"

printf 'feat(api): replace endpoint\n\nBREAKING CHANGE: use the new endpoint\n' > "$message"
lefthook run commit-msg "$message"

padding=$(printf '%067d' 0 | tr '0' 'a')
printf 'docs: %s\n' "${padding%?}" > "$message"
lefthook run commit-msg "$message"

for subject in \
  'update docs' \
  'unknown: explain setup' \
  'Fix: handle input' \
  'fix: ' \
  'fix: Handle input' \
  'fix: handle input.' \
  'feat(UI): add navigation' \
  "Merge branch 'main'" \
  'v1.2.3' \
  "docs: $padding"; do
  printf '%s\n' "$subject" > "$message"
  if lefthook run commit-msg "$message" >/dev/null 2>&1; then
    printf 'Unexpectedly accepted: %s\n' "$subject" >&2
    exit 1
  fi
done

printf '%s\n' 'Commit-message checks passed.'
