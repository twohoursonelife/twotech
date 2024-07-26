#!/bin/bash
# Usage: run-docker [cmd [arg0 [arg1 ...]]]
#
# Maps ~/.ssh and ~/.npm in the Docker container
# ~/.ssh is simply passed through, so the build can use the user's SSH credentials when needed.
# ~/.npm is mapped to a temporary directory, deleted at the end of the script, to keep usage isolated and clean.
# Note that npm stores its cache in the .npm directory, so it could perhaps be made
# durable and save a bit of build time, but the time difference is small.

image="${IMAGE:-"twotech-build_env"}"
tag="${TAG:-"latest"}"

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

if [[ "$(docker images -q "${image}":"${tag}" 2> /dev/null)" == "" ]]; then
	echo "Docker image $image:$tag does not exist. Running script to create it."
	# if [[ $? -ne 0 ]]; then
	if ! "${SCRIPT_DIR}"/docker-build_env.sh; then
		echo "Could not create Docker image! Exiting..."
		exit 1
	fi
fi

echo "Sharing directory $SCRIPT_DIR"

# Make temporary storage for ~/.npm, since earlier versions of npm store
# stuff in ~/.npm and can't be persuaded otherwise. Clean up when done.

BUILD_TMP=""

function cleanup() {
	echo "Cleaning up"
	if [ -n "$BUILD_TMP" ]; then
		rm -rf "$BUILD_TMP"
	fi
}

function trapcmd() {
	trapStatus=$?
	if [ $trapStatus -eq 0 ]; then
		trapStatus=1
	fi
	cleanup
	exit $trapStatus
}

trap "trapcmd" HUP TERM INT QUIT TRAP ABRT SEGV

if [ -z "$TMPDIR" ]; then
	TMPDIR=/tmp
fi
BUILD_TMP="$(mktemp -d "$TMPDIR/twotech_build.XXXX")"
echo "Putting temp files in $BUILD_TMP"
BUILD_TMP_NPM="$BUILD_TMP/.npm"
mkdir -p "$BUILD_TMP_NPM"

docker run -it --rm \
	--env LINUX_USER="$(id -un)" \
	--env LINUX_UID="$(id -u)" \
	--env LINUX_GROUP="$(id -gn)" \
	--env LINUX_GID="$(id -g)" \
	--env LINUX_DIR="$PWD" \
	--env TERM="$TERM" \
	--mount "src=$SCRIPT_DIR,target=$SCRIPT_DIR,type=bind" \
	--mount "src=${HOME}/.ssh,target=${HOME}/.ssh,type=bind" \
	--mount "src=${BUILD_TMP_NPM},target=${HOME}/.npm,type=bind" \
	"$image:$tag" "$@"

cleanup
