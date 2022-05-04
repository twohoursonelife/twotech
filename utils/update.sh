#!/bin/bash
set -e

timestamp() {
   echo "[$(date +%F_%T)]"
}

cd /var/www/twotech
if ./utils/changes_upstream.sh; then
    echo "$(timestamp) Upstream changes made to twotech, pulling and updating..."
    git pull
    npm install
    npm run build
    # Update packages for the process module also
    cd process
    npm install
    cd ..
else
    echo "$(timestamp) No upstream changes to twotech, moving on..."
fi

if ./utils/changes_upstream.sh "./process/OneLifeData7"; then
    echo "$(timestamp) Upstream changes made to game data, running data update..."
    # git pull is not necessary here as the following command will handle that.
    node process download
else
    echo "$(timestamp) No upstream changes to data, update check complete."
fi