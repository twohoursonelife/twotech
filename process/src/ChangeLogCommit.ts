"use strict";

import { ChangeLogVersion } from "./ChangeLogVersion";
import { GameObject } from "./GameObject";
import { ChangeLogEntry, Git } from "./Git";
import { ExportedTransitionData, Transition } from "./Transition";

interface ObjectChange {
  id: string,
  attributes: Record<string, any>,
}

interface LegacyObjectData {
  id: string,
  name: string,
  category: boolean,
}

class ChangeLogCommit {
  version: ChangeLogVersion;
  git: Git;
  objects: Record<string, GameObject>;
  legacyObjects: Record<string, GameObject>;
  sha: string;
  date: Date;
  message: string;
  addedObjects: GameObject[];
  removedObjects: GameObject[];
  addedTransitions: Transition[];
  removedTransitions: Transition[];
  objectChanges: ObjectChange[];

  constructor(version: ChangeLogVersion, log: ChangeLogEntry) {
    this.version = version;
    this.git = version.git;
    this.objects = version.objects;
    this.legacyObjects = {};
    this.sha = log.sha;
    this.date = log.date;
    this.message = log.message;
    this.addedObjects = [];
    this.removedObjects = [];
    this.addedTransitions = [];
    this.removedTransitions = [];
    this.objectChanges = [];
    this.parseChanges();
  }

  isRelevant(): boolean {
    if (this.message.includes("dataVersionNumber"))
      return false;
    if (this.message.startsWith("Merge branch"))
      return false;
    if (this.message.startsWith("Merge pull request"))
      return false;
    return true
  }

  parseChanges(): void {
    const changes = this.git.fileChanges(this.sha + "^", this.sha);
    for (let change of changes) {
      if (change[1].startsWith("objects"))
        this.parseObjectChange(change[1], change[0]);
      else if (change[1].startsWith("transitions"))
        this.parseTransitionChange(change[1], change[0]);
    }
  }

  parseObjectChange(path: string, mode: string): void {
    const id = path.split("/")[1].split(".")[0];
    if (mode == "A") {
      const object = this.lookupObject(path, mode);
      if (object)
        this.addedObjects.push(object);
    } else if (mode == "D") {
      const object = this.lookupObject(path, mode);
      if (object)
        this.removedObjects.push(object);
    } else if (mode == "M") {
      this.addObjectChange(path);
    }
  }

  parseTransitionChange(path: string, mode: string): void {
    if (mode == "A") {
      const transition = this.createTransition(path, mode);
      this.addedTransitions.push(transition);
    } else if (mode == "D") {
      const transition = this.createTransition(path, mode);
      this.removedTransitions.push(transition);
    } else if (mode == "M") {
      const newTransition = this.createTransition(path, "A");
      const oldTransition = this.createTransition(path, "D");
      if (this.isSignificantChange(oldTransition, newTransition)) {
        this.parseTransitionChange(path, "D");
        this.parseTransitionChange(path, "A");
      }
    }
  }

  isSignificantChange(oldTransition: Transition, newTransition: Transition): boolean {
    if (oldTransition.actorID != newTransition.actorID)
      return true;
    if (oldTransition.targetID != newTransition.targetID)
      return true;
    if (oldTransition.newActorID != newTransition.newActorID)
      return true;
    if (oldTransition.newTargetID != newTransition.newTargetID)
      return true;
    if (oldTransition.decay != newTransition.decay)
      return true;
    return false;
  }

  lookupObject(path: string, mode: string): GameObject {
    const id = path.split("/")[1].split(".")[0];

    if (this.objects[id]) {
      if (!this.objects[id].isVisible())
        this.legacyObjects[id] = this.objects[id];
      return this.objects[id];
    }

    if (this.legacyObjects[id])
      return this.legacyObjects[id];

    const data = this.fileContent(path, mode);

    const object = new GameObject(data);
    object.legacy = true;
    this.legacyObjects[id] = object;

    return object;
  }

  createTransition(path: string, mode: string): Transition {
    const content = this.fileContent(path, mode);
    const filename = path.split("/")[1];
    const transition = new Transition(content, filename);
    this.setTransitionObject(transition, "actor", mode)
    this.setTransitionObject(transition, "target", mode)
    this.setTransitionObject(transition, "newActor", mode)
    this.setTransitionObject(transition, "newTarget", mode)
    return transition;
  }

  setTransitionObject(transition: Transition, key: string, mode: string): void {
    let id: string;
    switch (key) {
      case "actor": id = transition.actorID; break;
      case "target": id = transition.targetID; break;
      case "newActor": id = transition.newActorID; break;
      case "newTarget": id = transition.newTargetID; break;
      default: console.log("Unknown transition object key: " + key); return;
    }
    if (parseInt(id) > 1) {
      transition[key] = this.lookupObject(`objects/${id}.txt`, mode)
    }
  }

  addObjectChange(path: string): void {
    const before = new GameObject(this.git.fileContent(`${this.sha}^`, path));
    const after = new GameObject(this.git.fileContent(this.sha, path));
    const change = this.objectChange(before, after);
    if (change)
      this.objectChanges.push(this.objectChange(before, after));
  }

  ignoredAttributes(): string[] {
    return [
      "slotPos",
      "pixHeight",
      "parent",
      "sounds",
      "useVanishIndex",
      "useAppearIndex",
      "heldOffset",
      "creationSoundInitialOnly",
      "floorHugging",
      "vertSlotRot",
      "permanent",
      "drawBehindPlayer"
    ];
  }

  objectChange(before: GameObject, after: GameObject): ObjectChange {
    const ignore = this.ignoredAttributes();
    const attributes: Record<string, any> = {};
    for (let attribute in after.data) {
      if (ignore.includes(attribute))
        continue;
      if (!Object.getOwnPropertyNames(before).includes(attribute))
        continue;
      if (String(before.data[attribute as keyof typeof before.data]) !== String(after.data[attribute as keyof typeof after.data])) {
        attributes[attribute] = {
          from: before.data[attribute as keyof typeof before.data],
          to: after.data[attribute as keyof typeof after.data]
        };
      }
    }
    if (Object.keys(attributes).length == 0)
      return;
    return {id: after.id, attributes: attributes};
  }

  fileContent(path: string, mode: string): string {
    const sha = (mode == "D" ? `${this.sha}^` : this.sha);
    return this.git.fileContent(sha, path);
  }

  jsonData(): ExportedChangeLogCommitData {
    const data: ExportedChangeLogCommitData = {sha: this.sha, message: this.message, date: this.date};

    if (this.addedObjects.length)
      data.addedObjectIDs = this.addedObjects.map(o => o.id);

    if (this.removedObjects.length)
      data.removedObjectIDs = this.removedObjects.map(o => o.id);

    if (this.addedTransitions.length)
      data.addedTransitions = this.addedTransitions.map(t => t.jsonData());

    if (this.removedTransitions.length)
      data.removedTransitions = this.removedTransitions.map(t => t.jsonData());

    if (this.objectChanges.length)
      data.objectChanges = this.objectChanges;

    if (Object.values(this.legacyObjects).length)
      data.legacyObjects = Object.values(this.legacyObjects).map(o => this.legacyObjectData(o));

    return data;
  }

  filterTransitions(transitions: Transition[]): Transition[] {
    let ids = this.addedObjects.map(o => o.id);
    ids = ids.concat(Object.keys(this.legacyObjects));
    ids = ids.concat(this.removedObjects.map(o => o.id));
    return transitions.filter(t => !ids.includes(t.actorID) && !ids.includes(t.targetID));
  }

  legacyObjectData(object: GameObject): LegacyObjectData {
    return {id: object.id, name: object.name, category: object.isCategory()};
  }
}

interface ExportedChangeLogCommitData {
  sha: string;
  message: string;
  date: Date;
  addedObjectIDs?: string[];
  removedObjectIDs?: string[];
  // TODO: Change this to ExportedTransitionData when it gets defined.
  addedTransitions?: ExportedTransitionData[];
  removedTransitions?: ExportedTransitionData[];
  objectChanges?: ObjectChange[];
  legacyObjects?: LegacyObjectData[];
}

export { ChangeLogCommit, ExportedChangeLogCommitData }
