#!/bin/bash
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
docker build --no-cache --target build_env --tag twotech-build_env:latest "${SCRIPT_DIR}"