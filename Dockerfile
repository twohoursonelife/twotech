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

#RUN node process download



FROM node:8-alpine

WORKDIR /usr/local/twotech

RUN apk add --no-cache \
    nginx

COPY package*.json ./

RUN npm clean-install

COPY . .

RUN npm run build

COPY nginx.conf /etc/nginx/nginx.conf
COPY twotech.twohoursonelife.com /etc/nginx/sites-available/default
RUN mkdir -p /etc/nginx/sites-enabled && \
    ln -s /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default

COPY --from=process /usr/local/twotech/public/ .

EXPOSE 80 443

CMD ["/usr/sbin/nginx", "-g", "daemon off;"]
