"use strict";

import { GameObject } from "./GameObject";
import { RecipeNode } from "./RecipeNode";
import { Transition } from "./Transition";

class RecipeGenerator {
  nodes: RecipeNode[];
  object: GameObject;
  availableTools: GameObject[];

  constructor(object: GameObject) {
    this.object = object;
    this.nodes = [];
    this.availableTools = [];
  }

  generate(): void {
    try {
      const root = this.generateNode(this.object);
      root.trackMainBranch();
      root.collapseBranches();
    }
    catch(e){
      console.log("Error generating recipe: ", this.object.name );
    }
  }

  generateNode(object: GameObject): RecipeNode {
    const node = new RecipeNode(object);
    if (this.availableTools.includes(object)) {
      node.makeTool(this);
    }
    if (!node.isLast()) {
      node.transition = this.lookupTransition(node);
      this.generateTransitionNodes(node);
    }
    this.nodes.push(node);
    return node;
  }

  lookupTransition(node: RecipeNode): Transition {
    let transition = node.object.transitionsToward[0];
    if (!transition) return;

    transition = this.collapseDecayTransition(node, transition, 0);

    // Look for an alternative to last use transitions
    // This way we don't use the last item of the stack if we can just grab an item
    // For example, pick up a wooden disk instead of drilling last one in pile
    if (transition.lastUseActor && !transition.reverseUseActor ||
        transition.lastUseTarget && !transition.reverseUseTarget) {
      const altTransition = node.object.transitionsToward[1];
      if (altTransition && altTransition.depth.value <= transition.depth.value+1 &&
          altTransition.totalDepth() <= transition.totalDepth()+1) {
        transition = altTransition;
      }
    }

    return transition;
  }

  collapseDecayTransition(node: RecipeNode, transition: Transition, depth: number): Transition {
    if (depth > 10) {
      console.log(`Detected infinite loop collapsing decay transitions for ${this.object.name}`);
      // debugger;
      return transition;
    }

    if (transition.totalDecaySeconds() > 0 && transition.target.depth.value) {
      node.decaySeconds += transition.totalDecaySeconds();
      const nextTransition = transition.target.transitionsToward[0];
      if (nextTransition.totalDecaySeconds() > 0) {
        return this.collapseDecayTransition(node, nextTransition, depth+1);
      }
    }
    return transition;
  }

  generateTransitionNodes(node: RecipeNode): void {
    if (!node.transition) return;

    this.addAvailableTool(node.transition.newActor, node, 0);
    this.addAvailableTool(node.transition.newTarget, node, 0);

    this.generateChildNode(node.transition.actor, node);
    this.generateChildNode(node.transition.target, node);
  }

  generateChildNode(object: GameObject, parent: RecipeNode): void {
    if (!object) return;
    let node = this.nodes.find(n => n.object == object);
    if (!node)
      node = this.generateNode(object);
    node.addParent(parent);
  }

  deleteNode(node: RecipeNode): void {
    this.nodes = this.nodes.filter(n => n != node);
  }

  addAvailableTool(object: GameObject, parent: RecipeNode, recursionCount: number) {
    if (!object || object == parent.object || this.availableTools.includes(object)) return;

    if (object.depth.compare(parent.object.depth) < 0) {
      this.availableTools.push(object);
      const node = this.nodes.find(n => n.object == object);
      if (node) node.makeTool(this);
    }

    // Don't search too deep for tools
    if (recursionCount > 10 || object.isNatural()) return;

    // Search simple transitions for more tools
    for (let transition of object.transitionsAway) {
      if (transition.decay || !transition.actor || !transition.target) {
        this.addAvailableTool(transition.newActor, parent, recursionCount+1);
        this.addAvailableTool(transition.newTarget, parent, recursionCount+1);
      }
    }
  }
}

export { RecipeGenerator }
