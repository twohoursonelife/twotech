"use strict";

import { GameObject } from "./GameObject";

class Biome {
  id: string;
  groundHeat: number;
  objects: GameObject[];

  static fromFilename(filename: string): Biome {
    const id = filename.replace("ground_", "").replace(".tga", "");
    if (!id || id === "U") return;
    return new Biome(id);
  }

  static applyGroundHeat(biomes: Biome[], filename: string, content: string): void {
    const id = filename.replace("groundHeat_", "").replace(".txt", "");
    if (!id || id === "U") return;
    const biome = biomes.find(b => b.id === id);
    if (!biome) return;
    biome.groundHeat = parseFloat(content);
  }

  constructor(id: string) {
    this.id = id;
    this.groundHeat = 0.0;
    this.objects = [];
  }

  name(): string {
    const names = ["Grasslands", "Swamps", "Yellow Prairies", "Badlands", "Tundra", "Desert", "Jungle", "Deep Water", "Flower Fields", "Shallow Water"];
    return names[this.id];
  }

  addObjects(objects: GameObject[]) {
    for (let object of objects) {
      if (object.data.biomes && object.data.biomes.includes(parseInt(this.id))) {
        this.objects.push(object);
        object.biomes.push(this);
      }
    }
  }

  totalMapChance(): number {
    return this.objects.map(o => o.data.mapChance).reduce((a,b) => a + b);
  }

  spawnChance(object: GameObject): number {
    const total = this.totalMapChance();
    if (!total) return 0;
    return object.data.mapChance / total;
  }

  jsonData(): Record<string, any> {
    const result: any = {
      id: this.id,
      groundHeat: this.groundHeat,
      name: this.name(),
    };
    result.objects = this.objects.map(object => {
      return {id: object.id, spawnChance: this.spawnChance(object)};
    });
    return result;
  }
}

export { Biome }
