"use strict";

const { spawnSync } = require('child_process');

class Git {
  constructor(dir) {
    this.dir = dir;
  }

  run(...args) {
    const result = spawnSync("git", args, {cwd: this.dir, encoding: 'utf8'});
    if (result.status > 0) {
      console.log("Git command failed with args", args);
      console.log(result.stderr);
      console.trace();
      throw "Git command failed. See log for reason.";
    }

    return result.stdout;
  }

  runLines(...args) {
    return this.run(...args).split("\n").filter(l => l);
  }

  tags() {
    return this.runLines("tag", "-l");
  }

  fileChanges(from, to) {
    return this.runLines("diff", "--name-status", `${from}..${to}`).map(line => line.split(/\s+/));
  }

  fileContent(sha, path) {
    // Dear future reader
    // Curse object 8316. This is a last ditch effort to fix it.
    // Broken commit causing errors. An object was removed before all references to it was.
    // https://github.com/twohoursonelife/OneLifeData7/commit/8833527cbbb2d5d3d65f174a7d412cfa7fe5cbbe
    if (path == "objects/8316.txt") {
      path = "objects/8317.txt";
    }

    if (path == "objects/13507.txt") {
      path = "objects/8317.txt"
    }

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

  log(from, to) {
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

module.exports = Git;
