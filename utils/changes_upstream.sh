#!/bin/bash

repo="${1:-.}"

git -C "$repo" fetch
test "$(git -C "$repo" rev-parse HEAD)" != "$(git -C "$repo" rev-parse @{upstream})"
exit $?
