"use strict";

const sm = require('sitemap');
const fs = require('fs');

import { Biome } from "./Biome";
import { GameObject } from "./GameObject";
import { ObjectFilter, ObjectFilters } from "./ObjectFilters";

class SitemapGenerator {
  rootDir: string;
  constructor(rootDir: string) {
    this.rootDir = rootDir;
  }

  generate(objects: GameObject[], filters: Record<string, ObjectFilter>, biomes: Biome[]): void {
    const sitemap = sm.createSitemap({hostname: 'https://twotech.twohoursonelife.com'});

    sitemap.add({url: "/"});

    function addFilter(filter: ObjectFilter) {
      sitemap.add({url: filter.path});
      Object.values(filter.subfilters).forEach((subfilter) => {
        addFilter(subfilter);
      });
    }
    for (let filter of Object.values(filters)) {
      addFilter(filter);
    }

    for (let object of objects) {
      const path = encodeURIComponent(`${object.id}-${object.name.replace(/\W+/g, '-')}`);
      if (object.isVisible()) {
        sitemap.add({url: `/${path}`});
        if (!object.isNatural() && object.transitionsToward[0]) {
          sitemap.add({url: `/${path}/tech-tree`});
          sitemap.add({url: `/${path}/recipe`});
        }
      }
    }

    for (let biome of biomes) {
      const path = encodeURIComponent(`${biome.id}-${biome.name().toString().replace(/\W+/g, '-')}`);
      sitemap.add({url: `/biomes/${path}`});
    }

    fs.writeFileSync(this.rootDir + "public/sitemap.xml", sitemap.toString());
  }
}

export { SitemapGenerator }
