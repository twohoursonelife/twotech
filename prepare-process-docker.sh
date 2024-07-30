#!/bin/bash
mkdir -p ./process-docker
rsync -a --exclude 'node_modules' ./process/ ./process-docker/ \
&& cd ./process-docker \
&& ../docker-env-run.sh npm i \
&& ../docker-env-run.sh npm clean-install