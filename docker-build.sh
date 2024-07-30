#!/bin/bash
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
docker build --target server --tag twotech-server:latest "${SCRIPT_DIR}"