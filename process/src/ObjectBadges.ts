"use strict";

import { GameObject } from "./GameObject";

const Clothing: ObjectBadge = {
  key: "clothing",
  filter(objects) {
    return objects.filter(o => o.isClothing());
  },
  value(object: GameObject) {
    const percent = Math.round(object.insulation()*10000)/100;
    return `${percent}%`;
  }
}

const Food: ObjectBadge = {
  key: "food",
  filter(objects) {
    return objects.filter(o => o.data.foodValue[0] > 0);
  },
  value(object) {
    if (object.data.numUses > 1)
      return `${object.data.foodValue[0] + object.data.foodValue[1] + parseInt(process.env.ONETECH_FOOD_BONUS || '0')} x ${object.data.numUses}`;
    return (object.data.foodValue[0] + object.data.foodValue[1] + parseInt(process.env.ONETECH_FOOD_BONUS || '0')).toString();
  }
}

const Tool: ObjectBadge = {
  key: "tool",
  filter(objects) {
    return objects.filter(o => o.isTool());
  },
  value(object) {
    if (object.data.numUses > 1) {
      if (object.data.useChance && object.data.useChance != 1)
        return `~${(object.data.numUses-1) * (1 / object.data.useChance) + 1}`;
      return object.data.numUses.toString();
    }
  }
}

const Container: ObjectBadge = {
  key: "container",
  filter(objects) {
    return objects.filter(o => o.isCraftableContainer());
  },
  value(object) {
    return object.data.numSlots.toString();
  }
}

const HeatSource: ObjectBadge = {
  key: "heat",
  filter(objects) {
    return objects.filter(o => o.data.heatValue > 0);
  },
  value(object) {
    return object.data.heatValue.toString();
  }
}

const WaterSource: ObjectBadge = {
  key: "water",
  filter(objects) {
    return objects.filter(o => o.isWaterSource());
  },
  value(object) {
    return object.data.numUses > 1 ? object.data.numUses.toString() : "";
  }
}

const Natural: ObjectBadge = {
  key: "natural",
  filter(objects) {
    return objects.filter(o => o.isNatural());
  }
}

interface ObjectBadge {
  key: string;
  filter: (objects: GameObject[]) => GameObject[];
  value?: (object: GameObject) => string;
}

class ObjectBadges {
  badges: ObjectBadge[];

  constructor() {
    this.badges = [
      Clothing,
      Food,
      Tool,
      Container,
      WaterSource,
      HeatSource,
      Natural,
    ];
  }

  jsonData(allObjects: GameObject[]): ExportedObjectBadgesData {
    allObjects = allObjects.filter(o => o.canFilter());
    const badgesData: ExportedObjectBadgesData = {};
    for (let badge of this.badges) {
      const objects = badge.filter(allObjects);
      const data: ExportedObjectBadgeData = {ids: objects.map(o => o.id)};
      if (badge.value)
        data.values = objects.map(o => badge.value(o));
      badgesData[badge.key] = data;
    }
    return badgesData;
  }
}

interface ExportedObjectBadgeData {
  ids: string[];
  values?: string[];
}

type ExportedObjectBadgesData = {[key: string]: ExportedObjectBadgeData};

export {ObjectBadges, ExportedObjectBadgesData}