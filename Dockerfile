FROM node:18-bookworm AS build_env

ENV DEBIAN_FRONTEND=noninteractive

WORKDIR /usr/local/twotech

RUN apt-get update && apt-get install \
    --yes --no-install-recommends \
    build-essential \
    git \
    gosu \
    g++ \
    imagemagick \
    libcairo2-dev \
    libjpeg-dev \
    libpango1.0-dev \
    libgif-dev \
    libsox-fmt-mp3 \
    nginx \
    sox \
    && rm -rf /var/lib/apt/lists/

# An offshoot from the build environment, this standalone target can be build with ./docker-build_env_interactive.sh
FROM build_env AS build_env_interactive

WORKDIR /usr/local/twotech
COPY patch /
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["/bin/bash"]

# Processing the game data is intense. Make it its own layer so changes to server don't trigger rebuild of this layer
FROM build_env AS prepare_process
COPY process process
COPY public public
RUN cd process \
    && npm i \
    && node process download

# Build the actual server and all the assets needed for the site.
FROM prepare_process AS build

WORKDIR /usr/local/twotech
COPY . .
RUN npm i \
    && npm clean-install \
    && npm run build

# The actual container for running the web site.
FROM nginx:alpine AS server

COPY --from=build /usr/local/twotech/public/ /usr/share/nginx/html/

COPY nginx.conf /etc/nginx/nginx.conf
COPY twotech.twohoursonelife.com /etc/nginx/conf/

EXPOSE 80 443
