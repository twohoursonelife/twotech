#!/bin/bash
mkdir -p ./process-docker
rsync -a --exclude 'node_modules' ./process/ ./process-docker/ \
&& cd ./process-docker \
&& ../docker-run.sh npm i \
&& ../docker-run.sh npm clean-install