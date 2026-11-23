#!/usr/bin/env bash
# Checks the dashboard image locally (CI runs it through pipesor-ci): unprivileged user, fail-fast
# startup without configuration, runtime /config.js and CSP rendered from the environment, SPA
# fallback, caching and security headers. Usage: bash tests/check-image.sh <image>
set -euo pipefail

image="$1"
ingestion=https://ingestion.example.test
pipeline=https://pipeline.example.test
recommendation=https://recommendation.example.test
install=https://github.com/apps/pipesor-ci-check/installations/new
connect_src="$ingestion $pipeline $recommendation"

test "$(docker image inspect "$image" --format '{{.Config.User}}')" = "101:101"

# Without its environment the container must refuse to start instead of serving a broken bundle.
if timeout 30 docker run --rm "$image" > /dev/null 2>&1; then
  echo "The image started without PIPESOR_*_URL configuration" >&2
  exit 1
fi
if timeout 30 docker run --rm --env PIPESOR_INGESTION_URL=http://evil.example --env PIPESOR_PIPELINE_URL="$pipeline" \
  --env PIPESOR_RECOMMENDATION_URL="$recommendation" "$image" > /dev/null 2>&1; then
  echo "The image accepted a non-HTTPS origin" >&2
  exit 1
fi

container="$(docker run --detach --publish 127.0.0.1::8080 \
  --env PIPESOR_INGESTION_URL="$ingestion" --env PIPESOR_PIPELINE_URL="$pipeline" \
  --env PIPESOR_RECOMMENDATION_URL="$recommendation" --env PIPESOR_GITHUB_APP_INSTALL_URL="$install" "$image")"
trap 'docker rm --force "$container" > /dev/null 2>&1 || true' EXIT
base="http://$(docker port "$container" 8080/tcp | head -n 1)"
for _ in {1..20}; do curl -fsS "$base/" > /dev/null 2>&1 && break; sleep 1; done

curl -fsS "$base/" | grep -q '<div id="root">'
curl -fsS "$base/" | grep -q '<script src="/config.js"></script>'
# Client-side routes fall back to the SPA shell with 200.
test "$(curl -s -o /dev/null -w '%{http_code}' "$base/incidents/00000000-0000-0000-0000-000000000000")" = 200
test "$(curl -sI "$base/" | tr -d '\r' | grep -i '^cache-control:')" = "Cache-Control: no-store"

config="$(curl -fsS "$base/config.js")"
for value in "$ingestion" "$pipeline" "$recommendation" "$install"; do
  grep -qF "\"$value\"" <<< "$config"
done
test "$(curl -sI "$base/config.js" | tr -d '\r' | grep -i '^cache-control:')" = "Cache-Control: no-store"

# Security headers on the shell and on hashed assets; the CSP allows exactly the configured API origins
# and, for images, only the app itself and GitHub's avatar CDN.
shell_headers="$(curl -sI "$base/" | tr -d '\r')"
asset="$(curl -fsS "$base/" | grep -o '/assets/[^"]*\.js' | head -n1)"
asset_headers="$(curl -sI "$base$asset" | tr -d '\r')"
for headers in "$shell_headers" "$asset_headers"; do
  grep -qi "^content-security-policy:.*connect-src 'self' ${connect_src};" <<< "$headers"
  grep -qi "^content-security-policy:.*img-src 'self' data: https://avatars.githubusercontent.com;" <<< "$headers"
  grep -qi '^strict-transport-security: max-age=' <<< "$headers"
  grep -qi '^referrer-policy: no-referrer' <<< "$headers"
  grep -qi '^x-frame-options: DENY' <<< "$headers"
  grep -qi '^x-content-type-options: nosniff' <<< "$headers"
done
test "$(grep -ci '^content-security-policy:' <<< "$shell_headers")" = 1
echo "Image checks passed: user 101:101, fail-fast configuration, runtime config.js/CSP, SPA fallback, headers"
