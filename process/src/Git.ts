"use strict";

import { spawnSync } from 'child_process';

interface ChangeLogEntry {
  sha: string,
  date: Date,
  message: string,
}

class Git {
  dir: string;
  constructor(dir: string) {
    this.dir = dir;
  }

  run(...args: string[]): string {
    const result = spawnSync("git", args, {cwd: this.dir, encoding: 'utf8'});
    if (result.status > 0) {
      console.log("Git command failed with args", args);
      console.log(result.stderr);
      console.trace();
      throw "Git command failed. See log for reason.";
    }

    return result.stdout;
  }

  runLines(...args: string[]): string[] {
    return this.run(...args).split("\n").filter(l => l);
  }

  tags(): string[] {
    return this.runLines("tag", "-l");
  }

  fileChanges(from: string, to: string): string[][] {
    return this.runLines("diff", "--name-status", `${from}..${to}`).map(line => line.split(/\s+/));
  }

  fileExists(sha: string, path: string): boolean {
    return this.runLines("ls-tree", "--name-only", sha, "--", path).includes(path);
  }

  fileContent(sha: string, path: string): string {
    // Another unpleasant fix for Data7 issues.
    // https://github.com/twohoursonelife/twotech/issues/15
    if (path == "transitions/11104_11110_CONT") {
      path = "transitions/11104_11110_CONT .txt";
    }

    if (path == "transitions/11110_6701_CONT") {
      path = "transitions/11110_6701_CONT .txt";
    }

    return this.run("show", `${sha}:${path}`);
  }

  log(from: string, to: string): ChangeLogEntry[] {
    const lines = this.runLines("log", "--format=%H %ad %s", "--date=iso-strict", `${from}..${to}`);
    return lines.map(line => {
      const parts = line.match(/^(.+?) (.+?) (.+?)$/).slice(1);
      return {
        sha: parts[0],
        date: new Date(parts[1]),
        message: parts[2],
      };
    });
  }
}

export { Git, ChangeLogEntry }
