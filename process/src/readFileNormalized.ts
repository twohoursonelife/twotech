"use strict";
import * as fs from 'fs';

/** read file and normalize line endings of CR to LF */
function readFileNormalized(path: string): string {
  return fs.readFileSync(path, "utf8").replace('\r\n', '\n');
}

export { readFileNormalized }
