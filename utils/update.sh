#!/bin/bash
set -e

cd /var/www/twotech
if ./utils/changes_upstream.sh; then
    git pull
    npm install
    npm run build
    cd process
    npm install
    cd ..
fi

if ./utils/changes_upstream.sh "./process/OneLifeData7"; then
    # git pull is not necessary here as the following command will handle that.
    node process download
fi