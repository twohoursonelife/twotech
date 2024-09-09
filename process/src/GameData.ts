"use strict";

import { spawnSync } from 'child_process';
import * as fs from 'fs';
const _ = require('lodash');

import { GameObject } from "./GameObject";
import { Category } from "./Category";
import { TransitionImporter } from "./TransitionImporter";
import { ChangeLog } from "./ChangeLog";
import { Biome } from "./Biome";
import { DepthCalculator } from "./DepthCalculator";
import { SpriteProcessor } from "./SpriteProcessor";
import { ExportedObjectFilterData, ObjectFilters } from "./ObjectFilters";
import { ExportedObjectBadgesData, ObjectBadges } from "./ObjectBadges";
import { SitemapGenerator } from "./SitemapGenerator";
import { readFileNormalized } from "./readFileNormalized";
import { ChangeLogVersion } from './ChangeLogVersion';

class GameData {
  processDir: string;
  dataDir: string;
  staticDir: string;
  objects: Record<string, GameObject>;
  categories: Category[];
  biomes: Biome[];
  releasedOnly: boolean;
  badges: ObjectBadges;
  filters: ObjectFilters;
  changeLog: ChangeLog;
  constructor(processDir: string, dataDir: string, staticDir: string) {
    this.processDir = processDir;
    this.dataDir = dataDir;
    this.staticDir = staticDir;
    this.objects = {};
    this.categories = [];
    this.biomes = [];
    this.badges = new ObjectBadges();
    this.filters = new ObjectFilters();
  }

  download(gitURL: string): void {
    if (fs.existsSync(this.dataDir)) {
      this.checkoutMaster();
      spawnSync("git", ["pull"], {cwd: this.dataDir});
    } else {
      spawnSync("git", ["clone", gitURL, this.dataDir]);
    }
  }

  verifyDownloaded(): void {
    if (!fs.existsSync(this.dataDir)) {
      throw "OneLifeData7 not found, first run `node process dev download`"
    }
  }

  checkoutVersion(version: ChangeLogVersion): void {
    this.releasedOnly = true;
    spawnSync("git", ["checkout", version.tag()], {cwd: this.dataDir});
  }

  checkoutMaster(): void {
    spawnSync("git", ["checkout", "master"], {cwd: this.dataDir});
  }

  importObjects(): void {
    this.eachFileContent("objects", ".txt", (content, _filename) => {
      const object = new GameObject(content);
      if (object.id) {
        this.objects[object.id] = object;
      }
    });
    console.log("Object Count: " + Object.values(this.objects).length);
  }

  importCategories(): void {
    this.eachFileContent("categories", ".txt", (content, _filename) => {
      const category = new Category(content);
      category.addToObjects(this.objects);
      this.categories.push(category);
    });
    console.log("Category Count: " + this.categories.length);
  }

  importTransitions(): void {
    const importer = new TransitionImporter();
    this.eachFileContent("transitions", ".txt", (content, filename) => {
      importer.importFromFile(content, filename);
    });
    importer.splitCategories(this.categories);
    importer.mergeGenericTransitions();
    importer.mergeAttackTransitions();
    importer.addToObjects(this.objects);
    importer.addGlobalTriggers(this.objects);
    console.log("Transition Count: " + importer.transitions.length);
  }

  importBiomes(): void {
    this.eachFileInDir("ground", ".tga", (_path, filename) => {
      const biome = Biome.fromFilename(filename);
      if (biome) {
        this.biomes.push(biome);
      }
    });
    this.eachFileInDir("objects", ".txt", (path, filename) => {
      if (filename.startsWith("groundHeat")) {
        const content = readFileNormalized(path);
        Biome.applyGroundHeat(this.biomes, filename, content);
      }
    });
    const objects = Object.values(this.objects).filter(o => o.isNatural());
    for (let biome of this.biomes) {
      biome.addObjects(objects);
    }
    console.log("Biome Count: " + this.biomes.length);
  }

  populateVersions(): void {
    this.changeLog = new ChangeLog(this.dataDir, this.objects, this.releasedOnly);
    this.changeLog.populateObjects();
  }

  calculateObjectDepth(): void {
    let calculator = new DepthCalculator(Object.values(this.objects));
    calculator.calculate();
  }

  // generateTechTree() {
  //   var generator = new TechTreeGenerator();
  //   generator.generate(Object.values(this.objects));
  // }

  exportObjects(): void {
    this.populateFilters();
    this.saveJSON("objects.json", this.objectsJsonData());
    for (let id in this.objects) {
      this.saveJSON(`objects/${id}.json`, this.objects[id].jsonData());
    }
  }

  populateFilters(): void {
    this.filters.setupFilters(Object.values(this.objects));
  }

  exportVersions(): void {
    const versions = this.changeLog.versions.slice().reverse();
    for (let version of versions) {
      const path = `versions/${version.id}.json`;
      if (version.isUnreleased() || parseInt(version.id) > 0 && !fs.existsSync(this.staticDir + "/" + path)) {
        this.saveJSON(path, version.jsonData());
      }
    }
  }

  exportBiomes(): void {
    for (let biome of this.biomes) {
      this.saveJSON(`biomes/${biome.id}.json`, biome.jsonData());
    }
  }

  prepareStaticDir(): void {
    this.makeDir(this.staticDir);
    this.makeDir(this.staticDir + "/sprites");
    this.makeDir(this.staticDir + "/ground");
    this.makeDir(this.staticDir + "/objects");
    this.makeDir(this.staticDir + "/versions");
    this.makeDir(this.staticDir + "/biomes");
    this.makeDir(this.staticDir + "/sounds");
    this.makeDir(this.staticDir + "/pretty-json");
    this.makeDir(this.staticDir + "/pretty-json/objects");
    this.makeDir(this.staticDir + "/pretty-json/versions");
    this.makeDir(this.staticDir + "/pretty-json/biomes");
  }

  makeDir(path: string): void {
    if (!fs.existsSync(path)) fs.mkdirSync(path);
  }

  importSpecificObjects(ids: string[]): void {
    this.eachFileContent("objects", ".txt", (content, _filename) => {
      const object = new GameObject(content);
      // console.log("object = ", object ? object?.id : "NULL");
      if (object.id && ids.includes(object.id)) {
        this.objects[object.id] = object;
      }
    });
  }

  convertSpecificSpriteImages(): void {
    const spriteIds :string[] = [];

    // Collect all sprite IDs from the objects
    for (let id in this.objects) {
      const object = this.objects[id];
      if (object.data.sprites) {
        for (let i = 0; i < object.data.sprites.length; i++) {
          if (!spriteIds.includes(object.data.sprites[i].id)) {
            spriteIds.push(object.data.sprites[i].id);
          }
        }
      }
    }

    console.log("Converting " + spriteIds.length + " sprites for " + Object.keys(this.objects).length + " objects");

    const dir = this.dataDir + "/sprites";
    for (let i = 0; i < spriteIds.length; i++) {
      const spriteId = spriteIds[i];
      const tgaFile = `${dir}/${spriteId}.tga`;
      const txtFile = `${dir}/${spriteId}.txt`;

      if (!fs.existsSync(tgaFile)) {
        console.error(`Error: Missing TGA file for sprite ID ${spriteId}`);
        continue;
      }

      if (!fs.existsSync(txtFile)) {
        console.error(`Error: Missing TXT file for sprite ID ${spriteId}`);
        continue;
      }

      const outPath = this.staticDir + `/sprites/sprite_${spriteId}.png`;
      spawnSync("convert", [tgaFile, outPath]);
    }
  }

  processSpecificSprites(): void {
    const processor = new SpriteProcessor(this.dataDir + "/sprites", this.staticDir + "/sprites");
    processor.process(this.objects);
  }

  // Allow any so we can save any object/array/value we want
  saveJSON(path: string, data: any): void {
    const minPath = this.staticDir + "/" + path;
    const prettyPath = this.staticDir + "/pretty-json/" + path;
    fs.writeFileSync(minPath, JSON.stringify(data));
    fs.writeFileSync(prettyPath, JSON.stringify(data, null, 2));
  }

  objectsJsonData(): ExportedObjectsData {
    var objects = _.sortBy(this.objects, (o: GameObject) => o.sortWeight()).filter((o: GameObject) => o.isVisible());
    // Traverse objects array only once, pushing to each array the part it needs.
    let objectsData = objects.reduce(
      (acc: { ids: string[]; names: string[]; difficulties: string[]; numSlots: number[]; craftable: boolean[]; }, o: GameObject) => {
        acc.ids.push(o.id);
        acc.names.push(o.name);
        acc.difficulties.push(o.difficulty());
        acc.numSlots.push(o.numSlots());
        acc.craftable.push(o.craftable());
        return acc;
      },
      { ids: [], names: [], difficulties: [], numSlots: [], craftable: [] }
    );
    return {
      ids: objectsData.ids,
      names: objectsData.names,
      difficulties: objectsData.difficulties,
      numSlots: objectsData.numSlots,
      craftable: objectsData.craftable,
      filters: this.filters.jsonData(),
      badges: this.badges.jsonData(objects),
      date: new Date(),
      versions: this.changeLog.validVersions().map(v => v.id),
      biomeIds: this.biomes.map(b => b.id),
      biomeNames: this.biomes.map(b => b.name()),
      foodEatBonus: parseInt(process.env.ONETECH_FOOD_BONUS || '0'),
    };
  }

  convertSpriteImages(): void {
    const dir = this.dataDir + "/sprites";
    for (let filename of fs.readdirSync(dir)) {
      if (filename.endsWith(".tga")) {
        const id = filename.split('.')[0];
        const inPath = dir + "/" + filename;
        const outPath = this.staticDir + "/sprites/sprite_" + id + ".png";
        spawnSync("convert", [inPath, outPath]);
      }
    }
  }

  convertGroundImages(): void {
    const dir = this.dataDir + "/ground";
    for (let filename of fs.readdirSync(dir)) {
      if (filename.endsWith(".tga")) {
        const name = filename.split('.')[0];
        const inPath = dir + "/" + filename;
        const outPath = this.staticDir + "/ground/" + name + ".png";
        spawnSync("convert", [inPath, "-sigmoidal-contrast", "3,44%", "-level", "0%,108%,1.1", "-scale", "128x128", outPath]);
      }
    }
  }

  convertSounds(): void {
    const dir = this.dataDir + "/sounds";
    for (let filename of fs.readdirSync(dir)) {
      if (filename.endsWith(".aiff")) {
        const id = filename.split('.')[0];
        const inPath = dir + "/" + filename;
        const outPath = this.staticDir + "/sounds/" + id;
        spawnSync("sox", [inPath, outPath + ".mp3"]);
        spawnSync("sox", [inPath, outPath + ".ogg"]);
      }
    }
  }

  processSprites(): void {
    const processor = new SpriteProcessor(this.dataDir + "/sprites", this.staticDir + "/sprites")
    processor.process(this.objects)
  }

  eachFileInDir(dirName: string, extension: string, callback: (fileWithPath: string, file: string) => void): void {
    const dir = this.dataDir + "/" + dirName;
    for (let filename of fs.readdirSync(dir)) {
      if (filename.endsWith(extension)) {
        callback(dir + "/" + filename, filename);
      }
    }
  }

  eachFileContent(dirName: string, extension: string, callback: (fileContent: string, filename: string) => void): void {
    this.eachFileInDir(dirName, extension, (path, filename) => {
      callback(readFileNormalized(path), filename);
    });
  }

  generateSitemap(): void {
    let generator = new SitemapGenerator(this.processDir + "/../");
    generator.generate(Object.values(this.objects), this.filters.filters, this.biomes);
  }

  unprocessedVersion(staticDir: string, force: boolean): ChangeLogVersion {
    const version = this.changeLog.lastReleasedVersion();
    const path = `versions/${version.id}.json`;
    if (force || !fs.existsSync(staticDir + "/" + path)) {
      return version;
    }
  }
}

interface ExportedObjectsData {
  ids: string[],
  names: string[],
  difficulties: string[],
  numSlots: number[],
  craftable: boolean[],
  filters: ExportedObjectFilterData,
  badges: ExportedObjectBadgesData,
  date: Date,
  versions: string[],
  biomeIds: string[],
  biomeNames: string[],
  foodEatBonus: number,
}

export { GameData }
