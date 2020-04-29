FROM mhart/alpine-node:8.17.0

# Install build-time deps
RUN apk add --no-cache \
    git

# ensure www-data user exists
RUN set -eux && \
    addgroup -g 82 -S www-data && \
    adduser -u 82 -D -S -G www-data www-data && \
    mkdir -p /var/www && \
    chown www-data:www-data /var/www

# 82 is the standard uid/gid for "www-data" in Alpine

# Install application dependencies (unprivileged)
USER www-data
WORKDIR /var/www
COPY ./ ./

# version info
RUN VERSION=$(git rev-parse --short HEAD) && \
    DATE=$(date +%Y-%m-%dT%H:%M:%S) && \
    echo "${VERSION}_${DATE}" >> /var/www/BUILD_VERSION

# Update permissions and remove build-time deps (priviledged)
USER root
RUN chown -R www-data:www-data /var/www/; \
    yarn install
RUN apk del git && \
    rm -rf ./.git

EXPOSE 3000
CMD ["yarn","start"]
