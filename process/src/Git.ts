"use strict";

import { spawnSync } from 'child_process';

interface ChangeLogEntry {
  sha: string,
  date: Date,
  message: string,
}

interface FileRename {
  path: string,
  commitIndex: number,
}

class Git {
  dir: string;
  fileRenames?: Record<string, FileRename[]>;
  commitIndexes?: Record<string, number>;
  constructor(dir: string) {
    this.dir = dir;
  }

  run(...args: string[]): string {
    const result = spawnSync("git", args, {cwd: this.dir, encoding: 'utf8'});
    if (result.status !== 0) {
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

  /**
   * Resolve an object path from a historical commit to the path it has at HEAD.
   * Object IDs can be renumbered and later reused, so a single old-to-new map is
   * not enough: each rename must also be tied to its place in commit history.
   */
  currentPath(sha: string, path: string): string {
    let fileRenames = this.fileRenames;
    let commitIndexes = this.commitIndexes;
    if (!fileRenames || !commitIndexes) {
      // Building the rename history runs two Git commands, so cache it for later lookups.
      const newFileRenames: Record<string, FileRename[]> = {};
      const newCommitIndexes: Record<string, number> = {};

      // rev-list returns newest first: HEAD is index 0 and older commits have larger
      // indexes. Therefore a rename index less than or equal to a source commit index
      // happened at or after that source commit.
      this.runLines("rev-list", "HEAD").forEach((commit, index) => {
        newCommitIndexes[commit] = index;
      });

      let commitIndex: number | undefined = undefined;

      // Emit each commit SHA followed by only the object renames in that commit.
      const lines = this.runLines("-c", "diff.renameLimit=10000", "log", "--format=commit:%H", "--name-status", "--find-renames", "--diff-filter=R", "--", "objects/");
      for (const line of lines) {
        // Each section begins with a commit line, followed by the renames in that commit.
        if (line.startsWith("commit:")) {
          commitIndex = newCommitIndexes[line.slice(7)];
          continue;
        }

        // A rename line is "R<score> <old path> <new path>" (where score is how similar the old and new files are after the rename). Keep every rename
        // for an old path because the same numeric object path may be reused later,
        // and we won't know what rename to follow without the commit index to go along with it (making it unique).
        const parts = line.split(/\s+/);
        if (parts.length == 3 && parts[0].startsWith("R") && commitIndex !== undefined) {
          if (!newFileRenames[parts[1]])
            newFileRenames[parts[1]] = [];
          newFileRenames[parts[1]].push({path: parts[2], commitIndex: commitIndex});
        }
      }

      // Update both the instance cache and the non-optional local references.
      this.fileRenames = fileRenames = newFileRenames;
      this.commitIndexes = commitIndexes = newCommitIndexes;
    }

    let commitIndex = commitIndexes[sha];
    if (commitIndex === undefined)
      return path;

    // Of the renames at or after the source commit, the largest index is the first on 
    // chronologically (because git rev-list returned newest first). After following it, use its index
    // as the new upper bound and repeat to follow chains such as original ID -> interim ID 1 -> ... -> current ID.
    const visited = new Set<string>();
    while (!visited.has(path)) {
      const rename = fileRenames[path]
        ?.filter(rename => rename.commitIndex <= commitIndex)
        .sort((a, b) => b.commitIndex - a.commitIndex)[0];
      if (!rename)
        break;

      visited.add(path);
      path = rename.path;
      commitIndex = rename.commitIndex;
    }
    return path;
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
      const match = line.match(/^(.+?) (.+?) (.+?)$/);
      if (!match)
        throw new Error(`Unexpected git log output: ${line}`);
      const parts = match.slice(1);
      return {
        sha: parts[0],
        date: new Date(parts[1]),
        message: parts[2],
      };
    });
  }
}

export { Git, ChangeLogEntry }
