#!/bin/sh
port="${PORT:-"80"}"
docker run -p "${port}":80 -t -i twotech-server