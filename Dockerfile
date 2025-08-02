FROM node:22-alpine AS site

WORKDIR /var/www/twotech

RUN apk upgrade --no-cache

COPY package*.json .
RUN npm clean-install

COPY src/ ./src/
COPY webpack.config.js .

# TODO how to cache
RUN npm run build

FROM node:22-bookworm-slim AS process

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install \
  --yes --no-install-recommends \
  ca-certificates \
  build-essential \
  git \
  g++ \
  imagemagick \
  libcairo2-dev \
  libjpeg-dev \
  libpango1.0-dev \
  libgif-dev \
  libsox-fmt-mp3 \
  sox \
  && rm -rf /var/lib/apt/lists/

USER node

WORKDIR /var/www/twotech/process

COPY --chown=node process/package*.json .
RUN npm clean-install

COPY --chown=node process/ .
COPY --chown=node public/ ../public/

RUN npm run process download

FROM nginx:alpine AS twotech

WORKDIR /var/www/twotech

# Remove any default sites.
RUN rm /etc/nginx/conf.d/*.conf

# TODO cache process heavily
COPY --from=process --chown=nginx /var/www/twotech/public/ ./public
COPY --from=site --chown=nginx /var/www/twotech/public/ ./public

# TODO always run
RUN apk upgrade --no-cache

COPY nginx.conf /etc/nginx/nginx.conf
COPY twotech.conf /etc/nginx/conf.d/

EXPOSE 8080
