#!/bin/bash
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
docker build --no-cache --target build_env_interactive --tag twotech-build_env_interactive:latest "${SCRIPT_DIR}"