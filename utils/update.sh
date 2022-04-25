#!/bin/bash
set -e

if ./changes_upstream.sh; then
    cd /var/www/twotech
    node process download
fi