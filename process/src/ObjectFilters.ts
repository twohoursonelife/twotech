"use strict";

import { GameObject } from "./GameObject";

// Clothing and its sub-filters

const Clothing_Head: ObjectFilter = {
  key: "head",
  name: "Head",
  path: "",
  subfilters: {},
  filter_single(object) {
    return object.isClothing() && object.data.clothing == "h";
  }
}

const Clothing_Top: ObjectFilter = {
  key: "top",
  name: "Top",
  path: "",
  subfilters: {},
  filter_single(object) {
    return object.isClothing() && object.data.clothing == "t";
  }
}

const Clothing_Pack: ObjectFilter = {
  key: "pack",
  name: "Pack",
  path: "",
  subfilters: {},
  filter_single(object) {
    return object.isClothing() && object.data.clothing == "p";
  }
}

const Clothing_Bottom: ObjectFilter = {
  key: "bottom",
  name: "Bottom",
  path: "",
  subfilters: {},
  filter_single(object) {
    return object.isClothing() && object.data.clothing == "b";
  }
}

const Clothing_Shoe: ObjectFilter = {
  key: "shoe",
  name: "Shoe",
  path: "",
  subfilters: {},
  filter_single(object) {
    return object.isClothing() && object.data.clothing == "s";
  }
}

const Clothing: ObjectFilter = {
  key: "clothing",
  name: "Clothing",
  path: "",
  subfilters: {
    head: Clothing_Head,
    top: Clothing_Top,
    pack: Clothing_Pack,
    bottom: Clothing_Bottom,
    shoe: Clothing_Shoe,
  },
  filter_single(object) {
    return object.isClothing();
  }
}

// Food
const Food: ObjectFilter = {
  key: "food",
  name: "Food",
  path: "",
  subfilters: {},
  filter_single(object) {
    return object.data.foodValue[0] > 0;
  }
}

// Tools
const Tools: ObjectFilter = {
  key: "tools",
  name: "Tools",
  path: "",
  subfilters: {},
  filter_single(object) {
    return object.isTool();
  }
}

// Containers and its subfilters
const SmallContainers: ObjectFilter = {
  key: "small",
  name: "Small",
  path: "",
  subfilters: {},
  filter_single(object) {
    return object.isCraftableContainer() && object.data.slotSize == 1;
  }
}

const LargeContainers: ObjectFilter = {
  key: "large",
  name: "Large",
  path: "",
  subfilters: {},
  filter_single(object) {
    return object.isCraftableContainer() && object.data.slotSize == 2;
  }
}

const ExtraLargeContainers: ObjectFilter = {
  key: "extra_large",
  name: "Extra Large",
  path: "",
  subfilters: {},
  filter_single(object) {
    return object.isCraftableContainer() && object.data.slotSize == 3;
  }
}

const OtherContainers: ObjectFilter = {
  key: "other",
  name: "Other Sizes",
  path: "",
  subfilters: {},
  filter_single(object) {
    return object.isCraftableContainer() && !(object.data.slotSize == 1 || object.data.slotSize == 2 || object.data.slotSize == 3);
  }
}

const Containers: ObjectFilter = {
  key: "containers",
  name: "Containers",
  path: "",
  subfilters: {
    "small": SmallContainers,
    "large": LargeContainers,
    "extra_large": ExtraLargeContainers,
    "other": OtherContainers,
  },
  filter_single(object) {
    return object.isCraftableContainer();
  }
}

// HeatSources
const HeatSources: ObjectFilter = {
  key: "heat",
  name: "Heat Sources",
  path: "",
  subfilters: {},
  filter_single(object) {
    return object.data.heatValue > 0;
  }
}

// WaterSources
const WaterSources: ObjectFilter = {
  key: "water",
  name: "Water Sources",
  path: "",
  subfilters: {},
  filter_single(object) {
    return object.isWaterSource();
  }
}

// Natural
const Natural: ObjectFilter = {
  key: "natural",
  name: "Natural",
  path: "",
  subfilters: {},
  filter_single(object) {
    return object.isNatural();
  }
}

function setup_filters_recursively(filter: ObjectFilter, gameObjects: GameObject[], path: string): ObjectFilter {
  filter.path = path + `/${filter.key}`;
  if (filter.filter_single) {
    filter.ids = gameObjects.filter(o => filter.filter_single(o)).map(o => o.id);
  }
  for (let child in filter.subfilters) {
    filter.subfilters[child] = setup_filters_recursively(filter.subfilters[child], gameObjects, filter.path);
  }
  return filter;
}

interface ObjectFilter {
  key: string,
  name: string,
  path: string,
  subfilters: Record<string, ObjectFilter>,
  filter_single: (object: GameObject) => boolean,
  ids?: string[],
}

class ObjectFilters {
  filters: Record<string, ObjectFilter>;
  constructor() {
    this.filters = {
      "clothing": Clothing,
      "food": Food,
      "tools": Tools,
      "containers": Containers,
      "heat": HeatSources,
      "natural": Natural,
    };
  }

  setupFilters(objects: GameObject[]): void {
    objects = objects.filter(o => o.canFilter());
    Object.entries(this.filters).forEach(([f_key, f_val]) => {
      // For each top level filter, we need to go into each of f.subfilters (recursively), and populate their ids with their filters
      let modifiedFilter = setup_filters_recursively(f_val, objects, "/filter");
      this.filters[f_key] = modifiedFilter;
    });
  }

  jsonData(): ExportedObjectFilterData {
    return this.filters;
  }
}

type ExportedObjectFilterData = Record<string, ObjectFilter>;

export { ObjectFilters, ObjectFilter, ExportedObjectFilterData }
