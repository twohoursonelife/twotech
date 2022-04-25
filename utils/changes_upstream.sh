#!/bin/bash

git fetch
test "$(git rev-parse HEAD)" != "$(git rev-parse @{upstream})"
exit $?