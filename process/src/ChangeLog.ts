"use strict";

import { Git } from "./Git";
import { ChangeLogVersion } from "./ChangeLogVersion";

class ChangeLog {
  git: Git;
  objects: any;
  versions: any;

  constructor(gitDir, objects, releasedOnly) {
    this.git = new Git(gitDir);
    this.objects = objects;
    this.versions = this.fetchVersions(releasedOnly);
  }

  fetchVersions(releasedOnly) {
    let previousVersion: any = null;
    const versions = this.fetchVersionNumbers().map(id => {
      const version = new ChangeLogVersion(
        this.git,
        this.objects,
        id,
        null
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

  fetchVersionNumbers() {
    return this.git.tags().map(t => this.versionNumberFromTag(t)).filter(t => !isNaN(t)).sort((a,b) => a - b);
  }

  versionNumberFromTag(tag) {
    const version = tag.replace(/OneLife_v|2HOL_v/, "");
    if (version == "Start") return 0;
    return parseInt(version);
  }

  populateObjects() {
    for (let version of this.versions) {
      if (version.isReleased()) {
        version.populateObjects();
      }
    }
    if (!process.env.ONETECH_MOD_NAME)
      this.reportMissing();
  }

  validVersions() {
    return this.versions.slice(1).reverse();
  }

  lastReleasedVersion() {
    const versions = this.versions.filter(v => v.isReleased());
    return versions[versions.length-1];
  }

  reportMissing() {
    const objects = Object.values(this.objects).filter((o: any) => !o.version);
    console.log(objects.length + " objects are missing version");
    // for (let object of objects) {
    //   console.log(object.id, object.name, "unable to determine version");
    // }
  }
}

export { ChangeLog }
