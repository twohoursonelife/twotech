"use strict";
const fs = require("fs");

/** read file and normalize line endings of CR to LF */
function readFileNormalized(path) {
  return fs.readFileSync(path, "utf8").replaceAll('\r\n', '\n');
}

module.exports = readFileNormalized;
