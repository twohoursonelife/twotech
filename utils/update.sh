#!/bin/bash
set -e

cd /var/www/twotech
if ./utils/changes_upstream.sh "./process/OneLifeData7"; then
    node process download
fi
