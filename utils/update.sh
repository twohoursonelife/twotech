#!/bin/bash
set -e

cd /var/www/twotech/process/OneLifeData7

if ./changes_upstream.sh; then
    cd /var/www/twotech
    node process download
fi