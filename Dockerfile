FROM node:8-buster-slim AS process

ENV DEBIAN_FRONTEND=noninteractive

WORKDIR /usr/local/twotech

RUN apt-get update && apt-get install \
    --yes --no-install-recommends \
    build-essential \
    g++ \
    imagemagick \
    libcairo2-dev \
    libjpeg-dev \
    libpango1.0-dev \
    libgif-dev \
    libsox-fmt-mp3 \
    sox && \
    rm -rf /var/lib/apt/lists/

COPY process/package*.json process/

RUN cd process && \
    npm clean-install

COPY process/ process/
COPY public/ public/

RUN node process download



FROM node:8-alpine AS build

WORKDIR /usr/local/twotech

RUN apk add --no-cache \
    nginx

COPY package*.json ./

RUN npm clean-install

COPY . .

RUN npm run build



FROM nginx:alpine

COPY --from=process /usr/local/twotech/public/ /usr/share/nginx/html/
COPY --from=build /usr/local/twotech/public/ /usr/share/nginx/html/

COPY nginx.conf /etc/nginx/nginx.conf
COPY twotech.twohoursonelife.com /etc/nginx/conf/

EXPOSE 80 443
