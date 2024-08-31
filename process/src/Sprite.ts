"use strict";

import { GameObject } from "./GameObject";

const fs = require('fs');

class Sprite {
  index: number;
  object: GameObject;
  id: string;
  x: number;
  y: number;
  rotation: number;
  tag: string;
  multiplicativeBlending: boolean;
  centerAnchorXOffset: number;
  centerAnchorYOffset: number;
  ageRange: number[];
  color: number[];
  width: number;
  height: number;
  hFlip: number;
  invisHolding: number;
  invisWorn: number;
  behindSlots:  number;
  parent: number;
  invisCont: number;
  spritesDrawnBehind: number[];
  ignoredCont: number[];

  constructor(lines: string[], index: number, object: GameObject) {
    this.index = index;
    this.object = object;
    for (let line of lines) {
      this.parseLine(line);
    }
  }

  // Dupication with GameObject.js
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

  assignData(attribute: string, values: string[]) {
    if (!attribute) return;
    // Strings first
    if (attribute === "spriteID") {
      this.id = values[0].toString();
    }
    // Floats next
    else if (attribute === "rot") {
      this.rotation = parseFloat(values[0]);
    } else if (attribute === "pos") {
      this.x = parseFloat(values[0]);
      this.y = parseFloat(values[1]);
    } else if (attribute === "ageRange") {
      this.ageRange = [values[0], values[1]].map((v) => parseFloat(v));
    } else if (attribute === "color") {
      this.color = [values[0], values[1], values[2]].map((v) => parseFloat(v));
    }
    // Ints
    else if (attribute === "index") {
      this.index = parseInt(values[0]);
    } else if (attribute === "hFlip") {
      this.hFlip = parseInt(values[0]);
    } else if (attribute === "invisHolding") {
      this.invisHolding = parseInt(values[0]);
    } else if (attribute === "invisWorn") {
      this.invisWorn = parseInt(values[0]);
    } else if (attribute === "behindSlots") {
      this.behindSlots = parseInt(values[0]);
    } else if (attribute === "parent") {
      this.parent = parseInt(values[0]);
    } else if (attribute === "invisCont") {
      this.invisCont = parseInt(values[0]);
    } else if (attribute === "spritesDrawnBehind") {
      this.spritesDrawnBehind = values.map(v => parseInt(v));
    } else if (attribute === "ignoredCont") {
      this.ignoredCont = values.map(v => parseInt(v));
    } else {
      console.log(`WARNING: Unhandled data {"${attribute}": ${JSON.stringify(values)}`);
    }
  }

  parseExtraData(data: string[]) {
    this.tag = data[0];
    this.multiplicativeBlending = data[1] === '1';
    this.centerAnchorXOffset = parseFloat(data[2]);
    this.centerAnchorYOffset = parseFloat(data[3]);
  }

  beyondAge(age: number): boolean {
    return (this.ageRange[0] > -1 || this.ageRange[1] > -1) && (this.ageRange[0] > age || this.ageRange[1] < age);
  }

  additiveBlend(): boolean {
    const additiveIndexes = this.object.data.spritesAdditiveBlend;
    return additiveIndexes && additiveIndexes.indexOf(this.index) > -1;
  }
}

export { Sprite }
