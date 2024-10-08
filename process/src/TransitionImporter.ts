"use strict";

import { Category } from "./Category";
import { GameObject } from "./GameObject";
import { Transition } from "./Transition";

enum CategorySplitType {
  Actor,
  Target,
}

class TransitionImporter {
  transitions: Transition[];
  constructor() {
    this.transitions = [];
  }

  importFromFile(content: string, filename: string): void {
    const transition = new Transition(content, filename);
    this.transitions.push(transition);
  }

  splitCategories(categories: Category[]): void {
    const nonPatternCategories = categories.filter(c => !c.pattern);
    for (let category of nonPatternCategories) {
      this.splitCategory(category, CategorySplitType.Actor);
      this.splitCategory(category, CategorySplitType.Target);
    }
    const patternCategories = categories.filter(c => c.pattern);
    for (let transition of this.transitions) {
      this.splitPatternCategories(transition, patternCategories);
    }
    this.cleanUpPatternCategories(patternCategories);
  }

  splitCategory(category: Category, type: CategorySplitType): void {
    const newTransitions: Transition[] = [];
    for (let transition of this.transitions) {
      let currentId, newId, newWeight;
      if (type === CategorySplitType.Actor) {
        currentId = transition.actorID;
        newId = transition.newActorID;
        newWeight = transition.newActorWeight;
      } else if (type === CategorySplitType.Target) {
        currentId = transition.targetID;
        newId = transition.newTargetID;
        newWeight = transition.newTargetWeight;
      }

      if (currentId == category.parentID || newId == category.parentID) {
        for (let id of category.objectIDs) {
          const newTransition = transition.clone();
          if (currentId == category.parentID)
          {
            if (type === CategorySplitType.Actor) {
              newTransition.actorID = id;
            } else if (type === CategorySplitType.Target) {
              newTransition.targetID = id;
            }
          }
          if (newId == category.parentID) {
            if (type === CategorySplitType.Actor) {
              newTransition.newActorID = id;
            } else if (type === CategorySplitType.Target) {
              newTransition.newTargetID = id;
            }
          }
          if (category.probSet) {
            if (type === CategorySplitType.Actor) {
              newTransition.newActorWeight = category.objectWeight(id);
            } else if (type === CategorySplitType.Target) {
              newTransition.newTargetWeight = category.objectWeight(id);
            }
          }
          if (!this.findDuplicate(newTransition)) {
            newTransitions.push(newTransition);
          }
        }
      } else {
        newTransitions.push(transition);
      }
    }
    this.transitions = newTransitions;
  }

  // Pattern categories work differently than regular categories:
  // 1. The parentID is an actual object and should stick around
  // 2. A transition is only considered if all matching pattern
  //    categories have the same number of objectIDs
  // 3. For each objectID, a new transition is created which maps
  //    each other pattern category objectID to the new object
  splitPatternCategories(transition: Transition, patternCategories: Category[]): void {
    // if (transition.actorID == 2900 && transition.targetID == 733)
    //   debugger;
    type StringKeys<T> = {
      [K in keyof T]: T[K] extends string ? K : never;
    }[keyof T];

    const attrs: StringKeys<Transition>[] = ["actorID", "targetID", "newActorID", "newTargetID"];
    let categories = attrs.map(attr => {
      return patternCategories.find(c => c.parentID == transition[attr]);
    });
    if (categories.slice(0, 2).filter(c => c).length === 0) {
      return;
    }
    const count = categories.find(c => c).objectIDs.length;
    categories = categories.map(c => c && c.objectIDs.length == count && c);
    for (let i=0; i < count; i++) {
      const newTransition: Transition = transition.clone();
      for (let j=0; j < attrs.length; j++) {
        if (categories[j]) {
          newTransition[attrs[j]] = categories[j].objectIDs[i];
        }
      }
      if (!this.findDuplicate(newTransition)) {
        this.transitions.push(newTransition);
      }
    }
  }

  // Remove transitions where pattern category parent is an actual category object
  cleanUpPatternCategories(patternCategories: Category[]): void {
    const categories = patternCategories.filter(c => c.parent && c.parent.isCategory());
    for (let category of categories) {
      this.transitions = this.transitions.filter(transition => {
        return transition.actorID != category.parentID
          && transition.targetID != category.parentID
          && transition.newActorID != category.parentID
          && transition.newTargetID != category.parentID;
      });
    }
  }

  findDuplicate(newTransition: Transition): Transition {
    return this.transitions.find(transition => {
      if (newTransition.newActorWeight || newTransition.newTargetWeight) {
        return transition.actorID == newTransition.actorID &&
          transition.targetID == newTransition.targetID &&
          transition.newActorID == newTransition.newActorID &&
          transition.newTargetID == newTransition.newTargetID;
      }
      return transition.actorID == newTransition.actorID &&
        transition.targetID == newTransition.targetID &&
        transition.lastUseActor == newTransition.lastUseActor &&
        transition.lastUseTarget == newTransition.lastUseTarget;
    });
  }

  // Generic transitions are played along with another successful transition of the same actor
  mergeGenericTransitions(): void {
    const newTransitions: Transition[] = [];
    for (let transition of this.transitions) {
      if (transition.isGeneric()) {
        this.mergeGenericTransition(transition, newTransitions);
      } else {
        newTransitions.push(transition);
      }
    }
    this.transitions = newTransitions;
  }

  mergeGenericTransition(transition: Transition, newTransitions: Transition[]): void {
    const otherTransitions = this.transitions.filter(t => t.matchesGenericTransition(transition));

    if (otherTransitions.length == 0) {
      newTransitions.push(transition);
      return;
    }

    for (let otherTransition of otherTransitions) {
      // Clone last use transition since it doesn't always take effect
      if (transition.lastUseActor) {
        const newTransition = transition.clone();
        if (otherTransition.matchesGenericActor(transition)) {
          newTransition.targetID = otherTransition.targetID;
          newTransition.newTargetID = otherTransition.newTargetID;
          newTransition.targetRemains = otherTransition.targetRemains;
        } else {
          newTransition.targetID = newTransition.actorID;
          newTransition.newTargetID = newTransition.newActorID;
          newTransition.targetRemains = newTransition.tool;
          newTransition.actorID = otherTransition.actorID;
          newTransition.newActorID = otherTransition.newActorID;
          newTransition.tool = otherTransition.tool;
        }
        newTransitions.push(newTransition);
      } else if (otherTransition.matchesGenericActor(transition)) {
        otherTransition.newActorID = transition.newActorID;
        otherTransition.tool = transition.tool;
      } else {
        otherTransition.newTargetID = transition.newActorID;
        otherTransition.targetRemains = transition.tool;
      }
    }
  }

  mergeAttackTransitions(): void {
    const newTransitions: Transition[] = [];
    for (let transition of this.transitions) {
      if (transition.targetID === "0") {
        if (!transition.lastUseActor && !transition.lastUseTarget) {
          this.mergeAttackTransition(transition);
          newTransitions.push(transition);
        }
      } else {
        newTransitions.push(transition);
      }
    }
    this.transitions = newTransitions;
  }

  mergeAttackTransition(transition: Transition): void {
    const lastUseActorTransition = this.transitions.find(t => t != transition && t.actorID == transition.actorID && t.lastUseActor);
    const lastUseTargetTransition = this.transitions.find(t => t != transition && t.actorID == transition.actorID && t.lastUseTarget);

    // Animal attack
    if (!lastUseActorTransition && !lastUseTargetTransition) {
      if (transition.newTargetID === '0') {
        transition.newTargetID = '87'; // Fresh grave
        transition.targetRemains = false;
      } else {
        transition.newExtraTargetID = '87'; // Fresh grave
      }
      return;
    }

    transition.newExtraTargetID = (lastUseTargetTransition || transition).newTargetID;
    transition.newActorID = (lastUseActorTransition || lastUseTargetTransition).newActorID;
    transition.newTargetID = (lastUseActorTransition || lastUseTargetTransition).newTargetID;
    transition.tool = parseInt(transition.actorID) >= 0 && transition.actorID === transition.newActorID;
    transition.targetRemains = parseInt(transition.targetID) >= 0 && transition.targetID === transition.newTargetID;
  }

  newDecayTransition(targetID: string, newTargetID: string, decaySeconds: number): Transition {
    return new Transition(`0 ${newTargetID} ${decaySeconds}`, `-1_${targetID}.txt`);
  }

  addToObjects(objects: Record<string, GameObject>): void {
    for (let transition of this.transitions) {
      transition.addToObjects(objects);
    }
  }

  // Global triggers have a name like ">global1" and will
  // cause a transition somewhere else on the map.
  // They have an "away" transition for the receiver, but no
  // "towards" transition. This looks for a transmitter which
  // has "*global1" in the name and adds this as an extra object
  addGlobalTriggers(objects: Record<string, GameObject>): void {
    const triggers: GameObject[] = Object.values(objects).filter((o) => o.isGlobalTrigger());
    for (let trigger of triggers) {
      const transmitterName = trigger.transmitterName();
      const transmitters: GameObject[] = Object.values(objects).filter((o) => o.name.includes(transmitterName));
      for (let transmitter of transmitters) {
        for (let transition of transmitter.transitionsToward) {
          transition.newExtraTargetID = trigger.id;
          transition.addToObjects(objects);
        }
      }
    }
  }
}

export { TransitionImporter }
