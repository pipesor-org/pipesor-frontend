#!/bin/sh
# Renders the environment configuration at container startup (nginx entrypoint hook), so one image is
# promoted unchanged across environments. Required: PIPESOR_INGESTION_URL, PIPESOR_PIPELINE_URL,
# PIPESOR_RECOMMENDATION_URL (bare https origins; http only for loopback). Optional:
# PIPESOR_GITHUB_APP_INSTALL_URL (https://github.com/apps/<slug>/installations/new).
set -eu

fail() {
  echo "pipesor-config: $1" >&2
  exit 1
}

origin() {
  name="$1"
  eval "value=\${$name:-}"
  [ -n "$value" ] || fail "$name is required"
  printf '%s' "$value" | grep -Eq '^(https://[A-Za-z0-9.-]+(:[0-9]{1,5})?|http://(127\.0\.0\.1|localhost)(:[0-9]{1,5})?)$' \
    || fail "$name must be a bare https origin"
  printf '%s' "$value"
}

ingestion="$(origin PIPESOR_INGESTION_URL)"
pipeline="$(origin PIPESOR_PIPELINE_URL)"
recommendation="$(origin PIPESOR_RECOMMENDATION_URL)"
install="${PIPESOR_GITHUB_APP_INSTALL_URL:-}"
if [ -n "$install" ]; then
  printf '%s' "$install" | grep -Eq '^https://github\.com/apps/[A-Za-z0-9-]+/installations/new$' \
    || fail "PIPESOR_GITHUB_APP_INSTALL_URL must be https://github.com/apps/<slug>/installations/new"
fi

# Values are validated above, so they cannot break out of the JSON strings or the CSP header.
cat > /usr/share/nginx/html/config.js <<CONFIG
window.__PIPESOR_CONFIG__ = {"ingestionUrl":"$ingestion","pipelineUrl":"$pipeline","recommendationUrl":"$recommendation","githubAppInstallUrl":"$install"};
CONFIG
sed "s#__PIPESOR_CONNECT_SRC__#$ingestion $pipeline $recommendation#" /etc/nginx/pipesor/security-headers.conf \
  > /etc/nginx/conf.d/security-headers.inc
echo "pipesor-config: rendered /config.js and CSP connect-src for $ingestion $pipeline $recommendation"
