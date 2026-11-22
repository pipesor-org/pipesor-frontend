# Static dashboard image: the SPA is built by CI (bun run build with the environment's API origins) and
# served by unprivileged nginx on port 8080. No build tooling or secrets are present in the image.
FROM nginxinc/nginx-unprivileged:1.29-alpine@sha256:0c79d56aee561a1d81c63f00eee5fb5fe29279560cdc55e91425133104c7fbe6
ARG VCS_REF=unknown
# Space-separated API origins the bundle calls (the same VITE_PIPESOR_*_URL values used for the build);
# they become the CSP connect-src. Each must be a bare http(s) origin.
ARG PIPESOR_CONNECT_SRC
LABEL org.opencontainers.image.source="https://github.com/pipesor-org/pipesor-frontend" \
      org.opencontainers.image.revision="${VCS_REF}" \
      org.opencontainers.image.title="pipesor-dashboard"
COPY --chown=101:101 deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --chown=101:101 deploy/security-headers.conf /etc/nginx/conf.d/security-headers.inc
USER root
RUN set -eu; \
    test -n "${PIPESOR_CONNECT_SRC:-}" || { echo "PIPESOR_CONNECT_SRC is required" >&2; exit 1; }; \
    for origin in $PIPESOR_CONNECT_SRC; do \
      echo "$origin" | grep -Eq '^https?://[A-Za-z0-9.-]+(:[0-9]{1,5})?$' || { echo "Invalid origin: $origin" >&2; exit 1; }; \
    done; \
    sed -i "s#__PIPESOR_CONNECT_SRC__#${PIPESOR_CONNECT_SRC}#" /etc/nginx/conf.d/security-headers.inc; \
    ! grep -q "__PIPESOR_CONNECT_SRC__" /etc/nginx/conf.d/security-headers.inc
USER 101:101
COPY --chown=101:101 dist/ /usr/share/nginx/html/
EXPOSE 8080
