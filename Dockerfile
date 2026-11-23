# Static dashboard image: CI builds the environment-independent SPA (bun run build) and unprivileged
# nginx serves it on port 8080. The API origins are runtime configuration: at startup
# deploy/40-pipesor-config.sh renders /config.js and the CSP connect-src from PIPESOR_*_URL variables,
# so the same image (digest) is promoted across environments. No build tooling or secrets are present.
FROM nginxinc/nginx-unprivileged:1.29-alpine@sha256:0c79d56aee561a1d81c63f00eee5fb5fe29279560cdc55e91425133104c7fbe6
ARG VCS_REF=unknown
LABEL org.opencontainers.image.source="https://github.com/pipesor-org/pipesor-frontend" \
      org.opencontainers.image.revision="${VCS_REF}" \
      org.opencontainers.image.title="pipesor-dashboard"
COPY --chown=101:101 deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --chown=101:101 deploy/security-headers.conf /etc/nginx/pipesor/security-headers.conf
COPY --chmod=755 deploy/40-pipesor-config.sh /docker-entrypoint.d/40-pipesor-config.sh
USER root
# Apply Alpine security updates over the pinned base (as the Python images do with apt-get upgrade); the
# startup hook (running as 101) writes the rendered CSP include and config.js.
RUN apk upgrade --no-cache \
    && install -o 101 -g 101 -m 644 /dev/null /etc/nginx/conf.d/security-headers.inc
USER 101:101
COPY --chown=101:101 dist/ /usr/share/nginx/html/
EXPOSE 8080
