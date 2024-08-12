"use strict";

import { GameObject } from "./GameObject";
import { RecipeGenerator } from "./RecipeGenerator";
import { RecipeNode } from "./RecipeNode";

class Recipe {
  object: GameObject;
  nodes: RecipeNode[];
  constructor(object: GameObject) {
    this.object = object;
  }

  generate(): void {
    // if (this.object.id == 2620) {
      // global.debug = true;
    // }
    const generator = new RecipeGenerator(this.object);
    generator.generate();
    this.nodes = generator.nodes;
  }

  hasData(): boolean {
    return this.nodes.length > 1;
  }

  jsonData(): Record<string, any> {
    const data: any = {steps: RecipeNode.steps(this.nodes)};

    // For now let's just merge tools and ingredients together when displaying
    // We may eventually split them up for the user
    const ingredients = this.tools().concat(this.ingredients());
    if (ingredients.length > 0) {
      data.ingredients = ingredients.sort((a,b) => b.depth.compare(a.depth)).map(o => o.id);
    }

    const uncraftables = this.nodes.filter(n => n.isUncraftable());
    if (uncraftables.length > 0) {
      data.uncraftables = uncraftables.map(n => n.object.id);
    }

    return data;
  }

  tools(): GameObject[] {
    return this.nodes.filter(n => n.tool && !n.parentsAreTools()).map(n => n.object);
  }

  ingredients(): GameObject[] {
    const ingredients: GameObject[] = [];
    const nodes = this.nodes.filter(n => n.isIngredient());
    for (let node of nodes) {
      const count = node.count();
      for (let i=0; i < count; i++) {
        ingredients.push(node.object);
      }
    }
    return ingredients;
  }
}

export { Recipe }
