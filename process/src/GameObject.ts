"use strict";

import { Sprite } from "./Sprite";
import { Depth } from "./Depth";
import { ExportedRecipeJson, Recipe } from "./Recipe";
import { ExportedTransitionData, Transition } from "./Transition";
import { Category } from "./Category";
import { Biome, ExportedBiomeObjectData } from "./Biome";

interface SlotPosData {
  slotPos?: number[];
  vert?: number;
  parent?: number;
}

interface GameObjectData {
  backFootIndex?: number[];
  biomes?: number[]; // goes with MapChance
  blocksWalking?: number;
  bodyIndex?: number[];
  clothing?: string;
  clothingOffset?: number[];
  containOffset?: number[];
  containSize?: number;
  containable?: number;
  creationSoundForce?: number;
  creationSoundInitialOnly?: number;
  deadlyDistance?: number;
  deathMarker?: number;
  drawBehindPlayer?: number;
  floor?: number;
  floorHugging?: number;
  foodValue?: number[];
  frontFootIndex?: number[];
  frontWall?: number;
  headIndex?: number[];
  heatValue?: number;
  heldInHand?: number;
  heldOffset?: number[];
  homeMarker?: number;
  id?: string;
  leftBlockingRadius?: number;
  mapChance?: number;
  male?: number;
  minPickupAge?: number;
  name?: string;
  noFlip?: number;
  noSpawn?: number;
  numSlots?: number;
  numSprites?: number;
  numUses?: number;
  partialFloor?: number;
  permanent?: number;
  person?: number;
  pixHeight?: number;
  rValue?: number;
  ridingAnimationIndex?: number;
  rightBlockingRadius?: number;
  sideAccess?: number;
  slotPosData?: SlotPosData[];
  slotSize?: number;
  slotStyle?: number;
  slotsLocked?: number;
  slotsNoSwap?: number;
  sounds?: string[];
  speedMult?: number;
  sprites?: Sprite[];
  spritesAdditiveBlend?: number[];
  timeStretch?: number;
  useAppearIndex?: number[];
  useChance?: number;
  useDistance?: number;
  useVanishIndex?: number[];
  vertSlotRot?: number;
  wallLayer?: number;
}

class GameObject {
  containable: number;
  legacy: boolean;
  id: string;
  data: GameObjectData;
  transitionsToward: Transition[];
  transitionsAway: Transition[];
  categories: Category[];
  biomes: Biome[];
  depth: Depth;
  name: string;
  version: string;
  category: Category;
  rotation: number;
  index: number;

  constructor(dataText: string) {
    this.data = {};
    this.transitionsToward = [];
    this.transitionsAway = [];
    this.categories = [];
    this.biomes = [];
    this.depth = new Depth({craftable: false, difficulty: 0});
    this.parseData(dataText);
    if (!this.data.id)
      return;
    this.id = this.data.id.toString();
    this.name = this.data.name;
  }

  isSpriteData(data: string): boolean {
    if (data.includes("spriteID")
     || data.includes("pos")
     || data.includes("rot")
     || data.includes("hFlip")
     || data.includes("color")
     || data.includes("ageRange")
     || data.includes("parent")
     || data.includes("invisHolding")
     || data.includes("invisCont")
     || data.includes("spritesDrawnBehind")
     || data.includes("ignoredCont")
    ) {
      return true;
    } else {
      return false;
    }
  }

  parseSlotPos(data: string): SlotPosData {
    const result: SlotPosData = {};

    // Split the string into key-value pairs
    const pairs = data.split(',');
    pairs[1] = pairs[0] + "," + pairs[1];
    pairs.shift();
  
    for (const pair of pairs) {
      const [key, value] = pair.split('=');

      // Assign the parsed value to the appropriate key in the result object
      switch (key) {
        case 'slotPos':
          result.slotPos = value.split(',').map(v => parseFloat(v));
          break;
        case 'vert':
          result.vert = parseInt(value);
          break;
        case 'parent':
          result.parent = parseInt(value);
          break;
      }
    }

    return result;
  }

  parseData(dataText: string): void {
    const lines = dataText.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (i === 1) {
        this.parseName(lines[i]);
      } else if (lines[i].includes('spriteID')) {
        if (!this.data.sprites) {
          this.data.sprites = [];
        }
        // Look forward, gathering all relevant sprite data and incrementing LCV as needed
        // Stop when we have lines that don't match sprite data lines, or if we hit a new spriteID.
        let spriteData = [lines[i++]];
        while (this.isSpriteData(lines[i]) && !lines[i].includes('spriteID')) {
          spriteData.push(lines[i++]);
        }
        // Back up one line, because of the final increment from the while loop.
        i -= 1;
        this.parseSprite(spriteData);
      } else if (lines[i].includes('slotPos')) {
         this.parseSlotPos(lines[i])
      } else {
        this.parseLine(lines[i]);
      }
    }
  }

  parseName(name: string): void {
    if (name)
      this.data.name = name.replace(/#/g, ' - ');
  }

  parseLine(line: string): void {
    const assignments = line.split(/[,#]/);
    let attribute = null;
    let values: string[] = [];
    for (let assignment of assignments) {
      const parts = assignment.split(/[_=]/);
      if (parts.length > 1) {
        this.assignData(attribute, values);
        attribute = parts.shift();
        values = [];
      }
      values.push(parts[0]);
    }
    this.assignData(attribute, values);
  }

  // parseValue(value) {
  //   if (isNaN(value))
  //     return value;
  //   if (value.includes("."))
  //     return parseFloat(value);
  //   return parseInt(value);
  // }

  assignData(attribute: string, values: string[]): void {
    if (!attribute) return;
    // Parse attributes. Try to keep this alphabetized, for sanity's sake
    if (attribute === "backFootIndex") {
      this.data.backFootIndex = values.map(v => parseInt(v));
    } else if (attribute === "biomes") {
      this.data.biomes = values.map(v => parseInt(v));
    } else if (attribute === "blocksWalking") {
      this.data.blocksWalking = parseInt(values[0]);
    } else if (attribute === "bodyIndex") {
      this.data.bodyIndex = values.map(v => parseInt(v));
    } else if (attribute === "clothing") {
      this.data.clothing = values[0];
    } else if (attribute === "clothingOffset") {
      this.data.clothingOffset = [values[0], values[1]].map(v => parseInt(v));
    } else if (attribute === "containOffset") {
      this.data.containOffset = [values[0], values[1]].map(v => parseInt(v));
    } else if (attribute === "containSize") {
      this.data.containSize = parseFloat(values[0]);
    } else if (attribute === "containable") {
      this.data.containable = parseInt(values[0]);
    } else if (attribute === "creationSoundForce") {
      this.data.creationSoundForce = parseInt(values[0]);
    } else if (attribute === "creationSoundInitialOnly") {
      this.data.creationSoundInitialOnly = parseInt(values[0]);
    } else if (attribute === "deadlyDistance") {
      this.data.deadlyDistance = parseInt(values[0]);
    } else if (attribute === "deathMarker") {
      this.data.deathMarker = parseInt(values[0]);
    } else if (attribute === "drawBehindPlayer") {
      this.data.drawBehindPlayer = parseInt(values[0]);
    } else if (attribute === "floor") {
      this.data.floor = parseInt(values[0]);
    } else if (attribute === "floorHugging") {
      this.data.floorHugging = parseInt(values[0]);
    } else if (attribute === "foodValue") {
      if (values.length == 1) values.push('0');
      this.data.foodValue = [values[0], values[1]].map(v => parseInt(v));
    } else if (attribute === "frontFootIndex") {
      this.data.frontFootIndex = values.map(v => parseInt(v));
    } else if (attribute === "frontWall") {
      this.data.frontWall = parseInt(values[0]);
    } else if (attribute === "headIndex") {
      this.data.headIndex = values.map(v => parseInt(v));
    } else if (attribute === "heatValue") {
      this.data.heatValue = parseInt(values[0]);
    } else if (attribute === "heldInHand") {
      this.data.heldInHand = parseInt(values[0]);
    } else if (attribute === "heldOffset") {
      this.data.heldOffset = [values[0], values[1]].map(v => parseFloat(v));
    } else if (attribute === "homeMarker") {
      this.data.homeMarker = parseInt(values[0]);
    } else if (attribute === "id") {
      this.data.id = values[0];
    } else if (attribute === "leftBlockingRadius") {
      this.data.leftBlockingRadius = parseInt(values[0]);
    } else if (attribute === "mapChance") {
      this.data.mapChance = parseFloat(values[0]);
    } else if (attribute === "male") {
      this.data.male = parseInt(values[0]);
    } else if (attribute === "minPickupAge") {
      this.data.minPickupAge = parseInt(values[0]);
    } else if (attribute === "name") {
      this.data.name = values[0];
    } else if (attribute === "noFlip") {
      this.data.noFlip = parseInt(values[0]);
    } else if (attribute === "noSpawn") {
      this.data.noSpawn = parseInt(values[0]);
    } else if (attribute === "numSlots") {
      this.data.numSlots = parseInt(values[0]);
    } else if (attribute === "numSprites") {
      this.data.numSprites = parseInt(values[0]);
    } else if (attribute === "numUses") {
      this.data.numUses = parseInt(values[0]);
      this.data.useChance = parseFloat(values[1] || '1.0');
    } else if (attribute === "partialFloor") {
      this.data.partialFloor = parseInt(values[0]);
    } else if (attribute === "permanent") {
      this.data.permanent = parseInt(values[0]);
    } else if (attribute === "person") {
      this.data.person = parseInt(values[0]);
    } else if (attribute === "pixHeight") {
      this.data.pixHeight = parseInt(values[0]);
    } else if (attribute === "rValue") {
      this.data.rValue = parseFloat(values[0]);
    } else if (attribute === "ridingAnimationIndex") {
      this.data.ridingAnimationIndex = parseInt(values[0]);
    } else if (attribute === "rightBlockingRadius") {
      this.data.rightBlockingRadius = parseInt(values[0]);
    } else if (attribute === "sideAccess") {
      this.data.sideAccess = parseInt(values[0]);
    } else if (attribute === "slotSize") {
      this.data.slotSize = parseFloat(values[0]);
    } else if (attribute === "slotStyle") {
      this.data.slotStyle = parseInt(values[0]);
    } else if (attribute === "slotsLocked") {
      this.data.slotsLocked = parseInt(values[0]);
    } else if (attribute === "slotsNoSwap") {
      this.data.slotsNoSwap = parseInt(values[0]);
    } else if (attribute === "sounds") {
      this.data.sounds = values;
    } else if (attribute === "speedMult") {
      this.data.speedMult = parseFloat(values[0]);
    } else if (attribute === "spritesAdditiveBlend") {
      this.data.spritesAdditiveBlend = values.map(v => parseInt(v));
    } else if (attribute === "timeStretch") {
      this.data.timeStretch = parseInt(values[0]);
    } else if (attribute === "useAppearIndex") {
      this.data.useAppearIndex = values.map(v => parseInt(v));
    } else if (attribute === "useDistance") {
      this.data.useDistance = parseInt(values[0]);
    } else if (attribute === "useVanishIndex") {
      this.data.useVanishIndex = values.map(v => parseInt(v));
    } else if (attribute === "vertSlotRot") {
      this.data.vertSlotRot = parseFloat(values[0]);
    } else if (attribute === "wallLayer") {
      this.data.wallLayer = parseInt(values[0]);
    } else {
      console.log(`WARNING: Unhandled data {"${attribute}": ${JSON.stringify(values)}`);
    }
  }

  parseSprite(lines: string[]): void {
    this.data.sprites.push(new Sprite(lines, this.data.sprites.length, this));
  }

  canPickup(): boolean {
    return this.data.permanent == 0 && this.data.floor == 0;
  }

  canMove(): boolean {
    return this.transitionsAway.some(t => t.move > 0);
  }

  hasSprite(): boolean {
    return this.data.sprites.length > 0;
  }

  sortWeight(): number {
    return -this.id;
  }

  // See ObjectInspector.vue for difficulty levels
  difficulty(): string {
    if (!this.depth.craftable || !this.depth.difficulty) return;
    return this.depth.difficulty.toPrecision(3);
  }

  numSlots(): number {
    return this.data.numSlots;
  }

  isTool(): boolean {
    for (var transition of this.transitionsAway) {
      if (transition.actor == this && transition.target && transition.tool) return true;
    }
    return false;
  }

  craftable(): boolean {
    return this.depth.craftable || this.isNatural();
  }

  isCraftableContainer(): boolean {
    return this.data.numSlots > 0 && this.data.slotSize >= 1 && !this.isGrave();
  }

  isGrave(): boolean {
    return this.name.includes("Grave");
  }

  isNatural(): boolean {
    return this.data.mapChance > 0;
  }

  isClothing(): boolean {
    return this.data.clothing != "n" && (this.data.rValue > 0 || this.data.foodValue[0] == 0 && this.data.containable == 1);
  }

  isWaterSource(): boolean {
    for (var transition of this.transitionsAway) {
      if (transition.actorID == '209' // Empty water pouch
        && transition.newActorID == '210' // Full water pouch
        && transition.target == this
        && (transition.tool || transition.targetRemains)) return true;
    }
    return false;
  }

  isVisible(): boolean {
    return !this.isCategory();
  }

  isCategory(): boolean {
    return this.category && !this.category.pattern || this.name && this.name.startsWith("@");
  }

  isDeadly(): boolean {
    return this.data.deadlyDistance && !this.hasSickTransition();
  }

  isGlobalTrigger(): boolean {
    return this.name.startsWith(">");
  }

  transmitterName() {
    return this.name.replace(">", "*");
  }

  canFilter(): boolean {
    return this.depth.craftable && !this.isGlobalTrigger();
  }

  sounds(): number[] {
    if (!this.data.sounds) return [];
    const sounds = this.data.sounds.map(sound => parseInt(sound.split(":")[0]));
    return sounds.filter((sound,index) => sound > 0 && sounds.indexOf(sound) === index);
  }

  hasSickTransition(): boolean {
    for (let transition of this.transitionsAway.concat(this.transitionsToward)) {
      if (transition.targetID == "0" && transition.newTarget && transition.newTarget.name.includes(" sick")) {
        return true;
      }
    }
    return false;
  }

  techTreeNodes(depth: number): TechTreeNode[] {
    const transition = this.transitionsToward[0];
    if (this.isNatural() || !transition)
      return null;
    if (depth == 0)
      return []; // Empty array means tree goes deeper
    var nodes: TechTreeNode[] = [];
    if (transition.decay)
      nodes.push({decay: transition.decay});
    if (transition.actor)
      nodes.push(transition.actor.techTreeNode(depth));
    if (transition.target)
      nodes.push(transition.target.techTreeNode(depth));
    return nodes;
  }

  techTreeNode(depth: number): TechTreeNode {
    return {
      id: this.id,
      nodes: this.techTreeNodes(depth - 1),
    };
  }

  insulation(): number {
    const parts = {'h': 0.25, 't': 0.35, 'b': 0.2, 's': 0.1, 'p': 0.1};
    if (Object.getOwnPropertyNames(parts).includes(this.data.clothing) && parts[this.data.clothing as keyof typeof parts])
      return parts[this.data.clothing as keyof typeof parts]*this.data.rValue;
    else
      return 0;
  }

  jsonData(): ExportedGameObjectData {
    const transitionsToward = this.transitionsToward;
    const transitionsAway = this.transitionsAway.filter(t => !t.decay);
    const transitionsTimed = this.transitionsAway.filter(t => t.decay);
    const result: ExportedGameObjectData = {
      id: this.id,
      name: this.name,
      transitionsToward: transitionsToward.map(t => t.jsonData()),
      transitionsAway: transitionsAway.map(t => t.jsonData()),
      transitionsTimed: transitionsTimed.map(t => t.jsonData()),
    };

    if (this.version) {
      result.version = this.version;
    }

    if (this.data.foodValue[0] > 0) {
      result.foodValue = this.data.foodValue;
    }

    if (this.data.heatValue > 0) {
      result.heatValue = this.data.heatValue;
    }

    if (this.data.numUses > 1) {
      result.numUses = this.data.numUses;
      if (this.data.useChance != 1)
        result.useChance = this.data.useChance;
    }

    result.craftable = this.depth.craftable;
    if (this.depth.craftable) {
      result.depth = this.depth.value;
    }

    if (this.data.clothing != "n") {
      result.clothing = this.data.clothing;
      result.insulation = this.insulation();
    } else if (this.data.rValue > 0 && (this.data.floor == 1 || this.data.blocksWalking == 1)) {
      result.insulation = this.data.rValue;
    }

    if (this.isDeadly()) {
      result.deadlyDistance = this.data.deadlyDistance;
    }

    if (this.data.useDistance > 1 && this.data.deadlyDistance > 1) {
      result.useDistance = this.data.useDistance;
    }

    if (this.data.mapChance > 0) {
      result.mapChance = this.data.mapChance;
      result.biomes = this.biomesJsonData();
    }

    if (this.data.numSlots > 0) {
      result.numSlots = this.data.numSlots;
      result.slotSize = this.data.slotSize;
    }

    if (this.data.containable == 1) {
      result.size = this.data.containSize;
    }

    if (this.canPickup()) {
      result.minPickupAge = this.data.minPickupAge || 3;
    }

    if (this.data.speedMult != 1) {
      result.speedMult = this.data.speedMult;
    }

    if (this.data.blocksWalking == 1) {
      result.blocksWalking = true;
    }

    const sounds = this.sounds();
    if (sounds.length > 0) {
      result.sounds = sounds;
    }

    const moveTransition = this.transitionsAway.find(t => t.move > 0);
    if (moveTransition) {
      result.moveType = moveTransition.move;
      result.moveDistance = moveTransition.desiredMoveDist;
    }

    const techTree = this.techTreeNodes(3);
    if (techTree) {
      result.techTree = techTree;
    }

    const recipe = new Recipe(this);
    recipe.generate();
    if (recipe.hasData()) {
      result.recipe = recipe.jsonData();
    }

    return result;
  }

  biomesJsonData(): ExportedBiomeObjectData[] {
    return this.biomes.map(biome => {
      return {id: biome.id, spawnChance: biome.spawnChance(this)};
    });
  }
}

interface ExportedGameObjectData {
  id?: string,
  name?: string,
  transitionsToward?: ExportedTransitionData[],
  transitionsAway?: ExportedTransitionData[],
  transitionsTimed?: ExportedTransitionData[],
  version?: string;
  foodValue?: number[];
  heatValue?: number;
  numUses?: number;
  useChance?: number;
  craftable?: boolean;
  depth?: number;
  clothing?: string;
  insulation?: number;
  deadlyDistance?: number;
  useDistance?: number;
  mapChance?: number;
  biomes?: ExportedBiomeObjectData[];
  numSlots?: number;
  slotSize?: number;
  size?: number;
  minPickupAge?: number;
  speedMult?: number;
  blocksWalking?: boolean;
  sounds?: number[];
  moveType?: number;
  moveDistance?: number;
  techTree?: TechTreeNode[];
  recipe?: ExportedRecipeJson;
}

interface TechTreeNode {
  id?: string;
  nodes?: TechTreeNode[];
  decay?: string;
}

export { GameObject }
