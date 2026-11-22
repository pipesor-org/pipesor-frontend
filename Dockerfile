# Static dashboard image: the SPA is built by CI (bun run build with the environment's API origins) and
# served by unprivileged nginx on port 8080. No build tooling or secrets are present in the image.
FROM nginxinc/nginx-unprivileged:1.29-alpine@sha256:0c79d56aee561a1d81c63f00eee5fb5fe29279560cdc55e91425133104c7fbe6
ARG VCS_REF=unknown
LABEL org.opencontainers.image.source="https://github.com/pipesor-org/pipesor-frontend" \
      org.opencontainers.image.revision="${VCS_REF}" \
      org.opencontainers.image.title="pipesor-dashboard"
COPY --chown=101:101 deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --chown=101:101 dist/ /usr/share/nginx/html/
USER 101:101
EXPOSE 8080
