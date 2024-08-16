"use strict";

import { Git } from "./Git";
import { ChangeLogVersion } from "./ChangeLogVersion";
import { GameObject } from "./GameObject";

class ChangeLog {
  git: Git;
  objects: Record<string, GameObject>;
  versions: ChangeLogVersion[];

  constructor(gitDir: string, objects: Record<string, GameObject>, releasedOnly: boolean) {
    this.git = new Git(gitDir);
    this.objects = objects;
    this.versions = this.fetchVersions(releasedOnly);
  }

  fetchVersions(releasedOnly: boolean): ChangeLogVersion[] {
    let previousVersion: ChangeLogVersion = null;
    const versions = this.fetchVersionNumbers().map(id => {
      const version = new ChangeLogVersion(
        this.git,
        this.objects,
        id.toString(),
        previousVersion
      );
      previousVersion = version;
      return version;
    });
    if (!releasedOnly) {
      versions.push(new ChangeLogVersion(
        this.git,
        this.objects,
        "unreleased",
        previousVersion
      ));
    }
    return versions;
  }

  fetchVersionNumbers(): number[] {
    return this.git.tags().map(t => this.versionNumberFromTag(t)).filter(t => !isNaN(t)).sort((a,b) => a - b);
  }

  versionNumberFromTag(tag: string): number {
    const version = tag.replace(/OneLife_v|2HOL_v/, "");
    if (version == "Start") return 0;
    return parseInt(version);
  }

  populateObjects(): void {
    for (let version of this.versions) {
      if (version.isReleased()) {
        version.populateObjects();
      }
    }
    if (!process.env.ONETECH_MOD_NAME)
      this.reportMissing();
  }

  validVersions(): ChangeLogVersion[] {
    return this.versions.slice(1).reverse();
  }

  lastReleasedVersion(): ChangeLogVersion {
    const versions = this.versions.filter(v => v.isReleased());
    return versions[versions.length-1];
  }

  reportMissing(): void {
    const objects = Object.values(this.objects).filter(o => !o.version);
    console.log(objects.length + " objects are missing version");
    // for (let object of objects) {
    //   console.log(object.id, object.name, "unable to determine version");
    // }
  }
}

export { ChangeLog }
