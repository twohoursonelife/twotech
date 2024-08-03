"use strict";

// Clothing and its sub-filters

const Clothing_Head = {
  key: "head",
  name: "Head",
  path: "",
  subfilters: {},
  filter_single(object) {
    return object.isClothing() && object.data.clothing == "h";
  }
}

const Clothing_Top = {
  key: "top",
  name: "Top",
  path: "",
  subfilters: {},
  filter_single(object) {
    return object.isClothing() && object.data.clothing == "t";
  }
}

const Clothing_Pack = {
  key: "pack",
  name: "Pack",
  path: "",
  subfilters: {},
  filter_single(object) {
    return object.isClothing() && object.data.clothing == "p";
  }
}

const Clothing_Bottom = {
  key: "bottom",
  name: "Bottom",
  path: "",
  subfilters: {},
  filter_single(object) {
    return object.isClothing() && object.data.clothing == "b";
  }
}

const Clothing_Shoe = {
  key: "shoe",
  name: "Shoe",
  path: "",
  subfilters: {},
  filter_single(object) {
    return object.isClothing() && object.data.clothing == "s";
  }
}

const Clothing = {
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
const Food = {
  key: "food",
  name: "Food",
  path: "",
  subfilters: {},
  filter_single(object) {
    return object.data.foodValue[0] > 0;
  }
}

// Tools
const Tools = {
  key: "tools",
  name: "Tools",
  path: "",
  subfilters: {},
  filter_single(object) {
    return object.isTool();
  }
}

// Containers and its subfilters
const SmallContainers = {
  key: "small",
  name: "Small",
  path: "",
  subfilters: {},
  filter_single(object) {
    return object.isCraftableContainer() && object.data.slotSize == 1;
  }
}

const LargeContainers = {
  key: "large",
  name: "Large",
  path: "",
  subfilters: {},
  filter_single(object) {
    return object.isCraftableContainer() && object.data.slotSize == 2;
  }
}

const ExtraLargeContainers = {
  key: "extra_large",
  name: "Extra Large",
  path: "",
  subfilters: {},
  filter_single(object) {
    return object.isCraftableContainer() && object.data.slotSize == 3;
  }
}

const OtherContainers = {
  key: "other",
  name: "Other Sizes",
  path: "",
  subfilters: {},
  filter_single(object) {
    return object.isCraftableContainer() && !(object.data.slotSize == 1 || object.data.slotSize == 2 || object.data.slotSize == 3);
  }
}

const Containers = {
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
const HeatSources = {
  key: "heat",
  name: "Heat Sources",
  path: "",
  subfilters: {},
  filter_single(object) {
    return object.data.heatValue > 0;
  }
}

// WaterSources
const WaterSources = {
  key: "water",
  name: "Water Sources",
  path: "",
  subfilters: {},
  filter_single(object) {
    return object.isWaterSource();
  }
}

// Natural
const Natural = {
  key: "natural",
  name: "Natural",
  path: "",
  subfilters: {},
  filter_single(object) {
    return object.isNatural();
  }
}

function setup_filters_recursively(filter, gameObjects, path) {
  filter.path = path + `/${filter.key}`;
  if (filter.filter_single) {
    filter.ids = gameObjects.filter(o => filter.filter_single(o)).map(o => o.id);
  }
  for (let child in filter.subfilters) {
    filter.subfilters[child] = setup_filters_recursively(filter.subfilters[child], gameObjects, filter.path);
  }
  return filter;
}

const ObjectFilters = {
  filters: {
    "clothing": Clothing,
    "food": Food,
    "tools": Tools,
    "containers": Containers,
    "heatSources": HeatSources,
    "natural": Natural,
  },
  jsonData(objects) {
    objects = objects.filter(o => o.canFilter());
    const modifiedFilters = {};
    Object.entries(this.filters).forEach(([f_key, f_val]) => {
      // For each top level filter, we need to go into each of f.subfilters (recursively), and populate their ids with their filters
      let modifiedFilter = setup_filters_recursively(f_val, objects, "/filter");
      modifiedFilters[f_key] = modifiedFilter;
    });
    return modifiedFilters;
  }
}

module.exports = ObjectFilters;
