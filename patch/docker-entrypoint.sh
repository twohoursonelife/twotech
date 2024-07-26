#!/bin/sh
# Usage: docker-entrypoint.sh [cmd [arg0 [arg1 ...]]]

echo ">>>>> Entering twotech development container... <<<<<"
# Exit on failure
set -e
# Pull Docker ENV variables, using defaults if not set
user="${LINUX_USER:-"user"}"
uid="${LINUX_UID:-"1000"}"
group="${LINUX_GROUP:-"dev"}"
gid="${LINUX_GID:-"1000"}"
dir="${LINUX_DIR:-"/home/$user"}"
#
echo "Configuring container for user:$user($uid) group:$group($gid)..."

# Check if a user with the given UID already exists
if id -u "$uid" >/dev/null 2>&1; then
    # If the user exists, modify the user and group
    usermod -l "$user" "$(id -un "$uid")"
    groupmod -n "$group" "$(id -gn "$uid")"
else
    # If the user does not exist, create the user and group
    groupadd -f -g "$gid" "$group"
    useradd -u "$uid" -g "$gid" -m "$user"
fi

# Start here
cd "$dir"
# Run cmd as new user
gosu "$user" "$@"
#
echo ">>>>> Leaving twotech development container... <<<<<"
